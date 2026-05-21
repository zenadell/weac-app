"""
Hybrid DB layer — tries Supabase first, falls back to local SQLite.
"""

import sqlite3
import json
import os
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY", "") or os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
LOCAL_DB = Path(__file__).parent.parent / "data/waec_questions.db"

_supabase_ok = None  # cached connection status


def _check_supabase():
    global _supabase_ok
    if _supabase_ok is not None:
        return _supabase_ok
    if not SUPABASE_URL or not SUPABASE_KEY:
        _supabase_ok = False
        return False
    try:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/questions",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
            params={"limit": 1},
            timeout=3
        )
        _supabase_ok = r.status_code == 200
    except Exception:
        _supabase_ok = False
    return _supabase_ok


def supabase_get(table, params=None):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "count=exact"
    }
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=headers, params=params, timeout=8
    )
    if r.status_code == 200:
        return r.json()
    return None


def get_questions(subject, year=None, topic_cluster=None, limit=20, offset=0):
    """Fetch questions — Supabase if online, SQLite if offline."""
    if _check_supabase():
        params = {"subject": f"eq.{subject}", "limit": limit, "offset": offset, "order": "year.desc"}
        if year:
            params["year"] = f"eq.{year}"
        if topic_cluster is not None:
            params["topic_cluster"] = f"eq.{topic_cluster}"
        data = supabase_get("questions", params)
        if data is not None:
            return data
    # Fallback to SQLite
    return _sqlite_questions(subject, year, topic_cluster, limit, offset)


def _sqlite_questions(subject, year, topic_cluster, limit, offset):
    conn = sqlite3.connect(LOCAL_DB)
    c = conn.cursor()
    q = "SELECT id, subject, year, question_text, options, answer, topic_cluster FROM questions WHERE subject=?"
    params = [subject]
    if year:
        q += " AND year=?"; params.append(year)
    if topic_cluster is not None:
        q += " AND topic_cluster=?"; params.append(topic_cluster)
    q += f" ORDER BY year DESC LIMIT {limit} OFFSET {offset}"
    rows = c.fetchall() if not c.execute(q, params) else c.fetchall()
    conn.close()
    return [{"id": r[0], "subject": r[1], "year": r[2], "question_text": r[3],
             "options": json.loads(r[4]) if r[4] else {}, "answer": r[5], "topic_cluster": r[6]}
            for r in rows]


def get_predictions(subject, year=2025):
    """Fetch predictions — Supabase if online, local model if offline."""
    if _check_supabase():
        data = supabase_get("predictions", {
            "subject": f"eq.{subject}",
            "year": f"eq.{year}",
            "order": "rank.asc"
        })
        if data:
            return data
    # Fallback to local ML model
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from auto_train import predict_subject
    return predict_subject(subject, top_n=10, next_year=year)


def get_stats():
    if _check_supabase():
        data = supabase_get("questions", {"select": "subject", "limit": 5000})
        if data:
            from collections import Counter
            counts = Counter(r["subject"] for r in data)
            return {
                "total_questions": sum(counts.values()),
                "by_subject": dict(counts),
                "source": "supabase"
            }
    conn = sqlite3.connect(LOCAL_DB)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM questions"); total = c.fetchone()[0]
    c.execute("SELECT subject, COUNT(*) FROM questions GROUP BY subject"); by_s = dict(c.fetchall())
    c.execute("SELECT MIN(year), MAX(year) FROM questions"); yr = c.fetchone()
    conn.close()
    return {"total_questions": total, "by_subject": by_s, "year_range": {"min": yr[0], "max": yr[1]}, "source": "local"}
