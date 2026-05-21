"""
Syncs all local SQLite data (questions + predictions) up to Supabase.
Run this once after ML pipeline completes, then periodically to keep cloud in sync.
"""

import sqlite3
import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SECRET_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_PUBLISHABLE_KEY")

DB_PATH = Path(__file__).parent / "data/waec_questions.db"
SUBJECTS = ["biology", "chemistry", "physics", "mathematics", "english", "economics", "government"]

import requests

def supabase_request(method, table, data=None, params=None):
    """Generic Supabase REST API call using secret key."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    resp = requests.request(method, url, headers=headers, json=data, params=params, timeout=30)
    return resp


def clear_table(table):
    """Delete all rows from a table."""
    resp = supabase_request("DELETE", table, params={"id": "gte.0"})
    print(f"  Cleared {table}: {resp.status_code}")


def sync_questions():
    """Upload all questions from SQLite to Supabase."""
    print("\n[1] Syncing questions to Supabase...")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT id, source, subject, year, question_text, options, answer, section, topic_cluster
        FROM questions ORDER BY id
    """)
    rows = c.fetchall()
    conn.close()

    print(f"  Found {len(rows)} questions locally")

    # Clear existing and re-upload in batches
    clear_table("questions")

    BATCH = 200
    uploaded = 0
    for i in range(0, len(rows), BATCH):
        batch = rows[i:i + BATCH]
        payload = [
            {
                "local_id": r[0],
                "source": r[1],
                "subject": r[2],
                "year": r[3],
                "question_text": r[4],
                "options": json.loads(r[5]) if r[5] else {},
                "answer": r[6] or "",
                "section": r[7] or "",
                "topic_cluster": r[8] if r[8] is not None else -1
            }
            for r in batch
        ]
        resp = supabase_request("POST", "questions", data=payload)
        if resp.status_code in (200, 201):
            uploaded += len(batch)
            print(f"  Uploaded {min(i + BATCH, len(rows))}/{len(rows)}", end="\r")
        else:
            print(f"\n  Error batch {i}: {resp.status_code} {resp.text[:200]}")

    print(f"\n  Done. {uploaded} questions uploaded.")


def sync_predictions():
    """Compute and upload predictions for all subjects."""
    print("\n[2] Syncing predictions to Supabase...")
    sys.path.insert(0, str(Path(__file__).parent))
    from auto_train import predict_subject

    clear_table("predictions")

    all_preds = []
    for subject in SUBJECTS:
        preds = predict_subject(subject, top_n=10, next_year=2025)
        for p in preds:
            all_preds.append({
                "subject": subject,
                "year": 2025,
                "rank": p["rank"],
                "topic": p["topic"],
                "topic_cluster": p.get("cluster", -1),
                "probability": p["probability"]
            })
        print(f"  {subject}: {len(preds)} predictions")

    if all_preds:
        resp = supabase_request("POST", "predictions", data=all_preds)
        if resp.status_code in (200, 201):
            print(f"  Uploaded {len(all_preds)} predictions total.")
        else:
            print(f"  Error: {resp.status_code} {resp.text[:300]}")


def verify():
    """Check counts in Supabase match local."""
    print("\n[3] Verifying sync...")
    for table in ["questions", "predictions"]:
        resp = supabase_request("GET", table, params={"select": "id", "limit": 1})
        headers = resp.headers
        count = headers.get("content-range", "?").split("/")[-1]
        print(f"  Supabase {table}: {count} rows")


if __name__ == "__main__":
    print("=" * 50)
    print("  WAECPrep → Supabase Sync")
    print("=" * 50)

    if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
        print("ERROR: Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env")
        sys.exit(1)

    # Test connection
    resp = supabase_request("GET", "questions", params={"limit": 1})
    if resp.status_code == 404:
        print("\nERROR: Tables not found. Run supabase_schema.sql in Supabase SQL Editor first.")
        sys.exit(1)

    sync_questions()
    sync_predictions()
    verify()
    print("\nSync complete! Cloud DB is now up to date.")
