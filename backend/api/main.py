"""
FastAPI backend — serves predictions, past questions, and search to the mobile app.
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Import prediction directly from auto_train which has the correct model paths
from auto_train import predict_subject as _predict_subject, get_series, gap_score

_MODELS_DIR = os.path.join(os.path.dirname(__file__), "../data/models")

app = FastAPI(title="WAECPrep API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "../data/waec_questions.db")


def get_db():
    return sqlite3.connect(DB_PATH)


# ─────────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok", "service": "WAECPrep API"}


# ─────────────────────────────────────────────
# PAST QUESTIONS
# ─────────────────────────────────────────────

@app.get("/questions")
def get_questions(
    subject: str = Query(...),
    year: int = Query(None),
    topic_cluster: int = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0)
):
    conn = get_db()
    c = conn.cursor()

    query = "SELECT id, subject, year, question_text, options, answer, topic_cluster FROM questions WHERE subject=?"
    params = [subject]

    if year:
        query += " AND year=?"
        params.append(year)
    if topic_cluster is not None:
        query += " AND topic_cluster=?"
        params.append(topic_cluster)

    query += " ORDER BY year DESC LIMIT ? OFFSET ?"
    params += [limit, offset]

    c.execute(query, params)
    rows = c.fetchall()
    conn.close()

    return {
        "questions": [
            {
                "id": r[0],
                "subject": r[1],
                "year": r[2],
                "question": r[3],
                "options": json.loads(r[4]) if r[4] else {},
                "answer": r[5],
                "topic_cluster": r[6]
            }
            for r in rows
        ],
        "count": len(rows),
        "offset": offset
    }


@app.get("/questions/search")
def search_questions(
    q: str = Query(..., min_length=3),
    subject: str = Query(None),
    limit: int = Query(20, le=50)
):
    conn = get_db()
    c = conn.cursor()

    query = "SELECT id, subject, year, question_text, options, answer FROM questions WHERE question_text LIKE ?"
    params = [f"%{q}%"]

    if subject:
        query += " AND subject=?"
        params.append(subject)

    query += " LIMIT ?"
    params.append(limit)

    c.execute(query, params)
    rows = c.fetchall()
    conn.close()

    return {
        "results": [
            {
                "id": r[0], "subject": r[1], "year": r[2],
                "question": r[3],
                "options": json.loads(r[4]) if r[4] else {},
                "answer": r[5]
            }
            for r in rows
        ],
        "count": len(rows)
    }


@app.get("/questions/years")
def get_available_years(subject: str = Query(...)):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "SELECT DISTINCT year FROM questions WHERE subject=? ORDER BY year DESC",
        (subject,)
    )
    years = [r[0] for r in c.fetchall()]
    conn.close()
    return {"subject": subject, "years": years}


# ─────────────────────────────────────────────
# PREDICTIONS
# ─────────────────────────────────────────────

@app.get("/predict")
def predict(
    subject: str = Query(...),
    year: int = Query(2025),
    top_n: int = Query(10, le=20)
):
    """
    Returns top predicted topics for a subject's next exam.
    Uses LightGBM model trained on historical WAEC patterns.
    """
    try:
        predictions = _predict_subject(subject, top_n=top_n, next_year=year)
        return {
            "subject": subject,
            "year": year,
            "predictions": predictions,
            "note": "Probabilities based on WAEC historical patterns (2010–2024)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/predict/questions")
def predict_questions(
    subject: str = Query(...),
    year: int = Query(2025),
    top_n: int = Query(5)
):
    """
    Returns actual past questions from the highest-probability topics.
    These are the most likely questions to reappear.
    """
    predictions = _predict_subject(subject, top_n=top_n, next_year=year)
    if not predictions:
        raise HTTPException(status_code=404, detail="No predictions available")

    conn = get_db()
    c = conn.cursor()
    result = []

    for pred in predictions:
        cluster_id = pred.get("cluster", pred.get("topic_cluster", -1))
        c.execute("""
            SELECT id, year, question_text, options, answer
            FROM questions
            WHERE subject=? AND topic_cluster=?
            ORDER BY year DESC LIMIT 5
        """, (subject, cluster_id))
        questions = c.fetchall()
        result.append({
            "topic": pred["topic"],
            "probability": pred["probability"],
            "questions": [
                {
                    "id": r[0], "year": r[1], "question": r[2],
                    "options": json.loads(r[3]) if r[3] else {},
                    "answer": r[4]
                }
                for r in questions
            ]
        })

    conn.close()
    return {"subject": subject, "year": year, "predicted_questions": result}


# ─────────────────────────────────────────────
# STATS
# ─────────────────────────────────────────────

@app.get("/stats")
def get_stats():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM questions")
    total = c.fetchone()[0]
    c.execute("SELECT subject, COUNT(*) FROM questions GROUP BY subject ORDER BY COUNT(*) DESC")
    by_subject = {r[0]: r[1] for r in c.fetchall()}
    c.execute("SELECT MIN(year), MAX(year) FROM questions")
    year_range = c.fetchone()
    conn.close()
    return {
        "total_questions": total,
        "year_range": {"min": year_range[0], "max": year_range[1]},
        "by_subject": by_subject
    }


@app.get("/subjects")
def get_subjects():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT DISTINCT subject FROM questions ORDER BY subject")
    subjects = [r[0] for r in c.fetchall()]
    conn.close()
    return {"subjects": subjects}
