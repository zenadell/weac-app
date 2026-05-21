"""
Fetches WAEC past questions from ALOC API and MyQuest API.
Stores results in structured SQLite database.
"""

import requests
import sqlite3
import json
import time
import os
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

ALOC_BASE_URL = "https://questions.aloc.com.ng/api/v2"
ALOC_TOKEN = os.getenv("ALOC_TOKEN", "")  # Free token from aloc.com.ng

MYQUEST_BASE_URL = "https://myquest.com.ng/api/v1"
MYQUEST_KEY = os.getenv("MYQUEST_API_KEY", "")

DB_PATH = os.path.join(os.path.dirname(__file__), "../data/waec_questions.db")

SUBJECTS = [
    "english", "mathematics", "biology", "chemistry", "physics",
    "economics", "government", "geography", "literature", "agriculture",
    "commerce", "accounting", "civic_education", "history", "further_mathematics"
]

YEARS = list(range(1990, 2025))


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            subject TEXT NOT NULL,
            year INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            options TEXT,
            answer TEXT,
            section TEXT,
            topic TEXT,
            topic_cluster INTEGER DEFAULT -1,
            embedding TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS fetch_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT,
            year INTEGER,
            source TEXT,
            status TEXT,
            count INTEGER DEFAULT 0,
            fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    c.execute("CREATE INDEX IF NOT EXISTS idx_subject_year ON questions(subject, year)")
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")


def already_fetched(subject: str, year: int, source: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "SELECT count FROM fetch_log WHERE subject=? AND year=? AND source=? AND status='success'",
        (subject, year, source)
    )
    row = c.fetchone()
    conn.close()
    return row is not None and row[0] > 0


def save_questions(questions: list, subject: str, year: int, source: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    inserted = 0
    for q in questions:
        c.execute("""
            INSERT INTO questions (source, subject, year, question_text, options, answer, section)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            source,
            subject,
            year,
            q.get("question", ""),
            json.dumps(q.get("option", q.get("options", {}))),
            q.get("answer", ""),
            q.get("section", "")
        ))
        inserted += 1
    c.execute(
        "INSERT INTO fetch_log (subject, year, source, status, count) VALUES (?, ?, ?, 'success', ?)",
        (subject, year, source, inserted)
    )
    conn.commit()
    conn.close()
    return inserted


def _aloc_request(params: dict, retries: int = 3) -> dict:
    """Single ALOC API call with retry logic."""
    headers = {"AccessToken": ALOC_TOKEN} if ALOC_TOKEN else {}
    url = f"{ALOC_BASE_URL}/q"
    for attempt in range(retries):
        try:
            resp = requests.get(url, params=params, headers=headers, timeout=20)
            if resp.status_code == 200:
                return resp.json()
        except requests.exceptions.Timeout:
            wait = (attempt + 1) * 3
            time.sleep(wait)
        except Exception as e:
            print(f"  ALOC request error: {e}")
            break
    return {}


def fetch_aloc(subject: str, year: int) -> list:
    """
    ALOC API returns one question per call.
    We call it multiple times per (subject, year) to collect a batch.
    """
    seen_ids = set()
    questions = []
    # Call up to 40 times per subject/year to collect unique questions
    for _ in range(40):
        data = _aloc_request({"subject": subject, "year": year, "type": "utme"})
        q = data.get("data")
        if isinstance(q, dict) and q.get("id") and q["id"] not in seen_ids:
            seen_ids.add(q["id"])
            questions.append(q)
        elif isinstance(q, list):
            for item in q:
                if item.get("id") not in seen_ids:
                    seen_ids.add(item["id"])
                    questions.append(item)
        time.sleep(0.3)
    return questions


def fetch_aloc_wassce(subject: str, year: int) -> list:
    """Fetch WASSCE-type questions (WAEC-specific exam type)."""
    seen_ids = set()
    questions = []
    for _ in range(40):
        data = _aloc_request({"subject": subject, "year": year, "type": "wassce"})
        q = data.get("data")
        if isinstance(q, dict) and q.get("id") and q["id"] not in seen_ids:
            seen_ids.add(q["id"])
            questions.append(q)
        elif isinstance(q, list):
            for item in q:
                if item.get("id") not in seen_ids:
                    seen_ids.add(item["id"])
                    questions.append(item)
        time.sleep(0.3)
    return questions


def fetch_myquest(subject: str, year: int) -> list:
    """Fetch from MyQuest API (requires API key)."""
    if not MYQUEST_KEY:
        return []
    headers = {"Authorization": f"Bearer {MYQUEST_KEY}"}
    url = f"{MYQUEST_BASE_URL}/questions"
    params = {"subject": subject, "year": year, "exam": "waec"}
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=15)
        if resp.status_code == 200:
            return resp.json().get("questions", [])
    except Exception as e:
        print(f"  MyQuest error ({subject}/{year}): {e}")
    return []


def run_pipeline(subjects=None, years=None, delay=0.5):
    """Main pipeline: fetch all questions for all subjects and years."""
    init_db()
    subjects = subjects or SUBJECTS
    years = years or YEARS

    total = len(subjects) * len(years)
    print(f"\nStarting fetch: {len(subjects)} subjects x {len(years)} years = {total} combinations\n")

    fetched_total = 0
    skipped = 0

    for subject in subjects:
        print(f"\n--- Subject: {subject.upper()} ---")
        for year in tqdm(years, desc=subject):

            # ALOC UTME
            if not already_fetched(subject, year, "aloc_utme"):
                questions = fetch_aloc(subject, year)
                if questions:
                    n = save_questions(questions, subject, year, "aloc_utme")
                    fetched_total += n
                time.sleep(delay)

            # ALOC WASSCE (WAEC-specific)
            if not already_fetched(subject, year, "aloc_wassce"):
                questions = fetch_aloc_wassce(subject, year)
                if questions:
                    n = save_questions(questions, subject, year, "aloc_wassce")
                    fetched_total += n
                time.sleep(delay)

            # MyQuest (if API key available)
            if MYQUEST_KEY and not already_fetched(subject, year, "myquest"):
                questions = fetch_myquest(subject, year)
                if questions:
                    n = save_questions(questions, subject, year, "myquest")
                    fetched_total += n
                time.sleep(delay)
            else:
                skipped += 1

    print(f"\nDone. Total questions fetched: {fetched_total}")
    print(f"Skipped (already in DB or no key): {skipped}")
    return fetched_total


def get_stats():
    """Print database stats."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM questions")
    total = c.fetchone()[0]
    c.execute("SELECT subject, COUNT(*) FROM questions GROUP BY subject ORDER BY COUNT(*) DESC")
    by_subject = c.fetchall()
    c.execute("SELECT year, COUNT(*) FROM questions GROUP BY year ORDER BY year")
    by_year = c.fetchall()
    conn.close()

    print(f"\nTotal questions in DB: {total}")
    print("\nBy subject:")
    for row in by_subject:
        print(f"  {row[0]}: {row[1]}")
    print("\nBy year (sample):")
    for row in by_year[:10]:
        print(f"  {row[0]}: {row[1]}")


if __name__ == "__main__":
    run_pipeline()
    get_stats()
