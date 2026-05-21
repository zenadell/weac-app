"""
WAECPrep Cloud API — Supabase-backed, lightweight for Render deployment.
All data is served from Supabase (already synced). No ML packages required.
"""

import os
import json
import requests
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

app = FastAPI(title="WAECPrep API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def sb_get(table: str, params: dict) -> list:
    """Query Supabase REST API."""
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={**HEADERS, "Prefer": "count=exact"},
        params=params,
        timeout=10,
    )
    if r.status_code not in (200, 206):
        raise HTTPException(status_code=502, detail=f"Supabase error: {r.text[:200]}")
    return r.json()


# ── HEALTH ──────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok", "service": "WAECPrep API", "backend": "supabase"}


# ── PAST QUESTIONS ───────────────────────────────────────────────────────────

@app.get("/questions")
def get_questions(
    subject: str = Query(...),
    year: int = Query(None),
    topic_cluster: int = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
):
    params = {
        "select": "id,subject,year,question_text,options,answer,topic_cluster",
        "subject": f"eq.{subject}",
        "order": "year.desc",
        "limit": limit,
        "offset": offset,
    }
    if year:
        params["year"] = f"eq.{year}"
    if topic_cluster is not None:
        params["topic_cluster"] = f"eq.{topic_cluster}"

    rows = sb_get("questions", params)
    return {
        "questions": [
            {
                "id": r["id"],
                "subject": r["subject"],
                "year": r["year"],
                "question": r["question_text"],
                "options": r["options"] if isinstance(r["options"], dict) else json.loads(r["options"] or "{}"),
                "answer": r["answer"],
                "topic_cluster": r["topic_cluster"],
            }
            for r in rows
        ],
        "count": len(rows),
        "offset": offset,
    }


@app.get("/questions/search")
def search_questions(
    q: str = Query(..., min_length=3),
    subject: str = Query(None),
    limit: int = Query(20, le=50),
):
    params = {
        "select": "id,subject,year,question_text,options,answer",
        "question_text": f"ilike.*{q}*",
        "limit": limit,
    }
    if subject:
        params["subject"] = f"eq.{subject}"

    rows = sb_get("questions", params)
    return {
        "results": [
            {
                "id": r["id"],
                "subject": r["subject"],
                "year": r["year"],
                "question": r["question_text"],
                "options": r["options"] if isinstance(r["options"], dict) else json.loads(r["options"] or "{}"),
                "answer": r["answer"],
            }
            for r in rows
        ],
        "count": len(rows),
    }


@app.get("/questions/years")
def get_available_years(subject: str = Query(...)):
    params = {
        "select": "year",
        "subject": f"eq.{subject}",
        "order": "year.desc",
    }
    rows = sb_get("questions", params)
    years = sorted(set(r["year"] for r in rows), reverse=True)
    return {"subject": subject, "years": years}


# ── PREDICTIONS ──────────────────────────────────────────────────────────────

@app.get("/predict")
def predict(
    subject: str = Query(...),
    year: int = Query(2025),
    top_n: int = Query(10, le=20),
):
    params = {
        "select": "subject,predicted_year,topic_label,probability,cluster_id,gap_score",
        "subject": f"eq.{subject}",
        "predicted_year": f"eq.{year}",
        "order": "probability.desc",
        "limit": top_n,
    }
    rows = sb_get("predictions", params)
    return {
        "subject": subject,
        "year": year,
        "predictions": [
            {
                "topic": r["topic_label"],
                "probability": r["probability"],
                "cluster": r["cluster_id"],
                "gap_score": r.get("gap_score"),
            }
            for r in rows
        ],
        "note": "Probabilities based on WAEC historical patterns (2010–2024)",
    }


@app.get("/predict/questions")
def predict_questions(
    subject: str = Query(...),
    year: int = Query(2025),
    top_n: int = Query(5),
):
    pred_params = {
        "select": "topic_label,probability,cluster_id",
        "subject": f"eq.{subject}",
        "predicted_year": f"eq.{year}",
        "order": "probability.desc",
        "limit": top_n,
    }
    predictions = sb_get("predictions", pred_params)
    if not predictions:
        raise HTTPException(status_code=404, detail="No predictions available")

    result = []
    for pred in predictions:
        cluster_id = pred["cluster_id"]
        q_params = {
            "select": "id,year,question_text,options,answer",
            "subject": f"eq.{subject}",
            "topic_cluster": f"eq.{cluster_id}",
            "order": "year.desc",
            "limit": 5,
        }
        questions = sb_get("questions", q_params)
        result.append({
            "topic": pred["topic_label"],
            "probability": pred["probability"],
            "questions": [
                {
                    "id": r["id"],
                    "year": r["year"],
                    "question": r["question_text"],
                    "options": r["options"] if isinstance(r["options"], dict) else json.loads(r["options"] or "{}"),
                    "answer": r["answer"],
                }
                for r in questions
            ],
        })

    return {"subject": subject, "year": year, "predicted_questions": result}


# ── STATS ─────────────────────────────────────────────────────────────────────

@app.get("/stats")
def get_stats():
    total_rows = sb_get("questions", {"select": "id"})
    total = len(total_rows)

    subjects_rows = sb_get("questions", {"select": "subject"})
    by_subject: dict[str, int] = {}
    for r in subjects_rows:
        s = r["subject"]
        by_subject[s] = by_subject.get(s, 0) + 1

    year_rows = sb_get("questions", {"select": "year", "order": "year.asc", "limit": 1})
    min_year = year_rows[0]["year"] if year_rows else None
    year_rows2 = sb_get("questions", {"select": "year", "order": "year.desc", "limit": 1})
    max_year = year_rows2[0]["year"] if year_rows2 else None

    return {
        "total_questions": total,
        "year_range": {"min": min_year, "max": max_year},
        "by_subject": by_subject,
    }


@app.get("/subjects")
def get_subjects():
    rows = sb_get("questions", {"select": "subject", "order": "subject.asc"})
    subjects = sorted(set(r["subject"] for r in rows))
    return {"subjects": subjects}
