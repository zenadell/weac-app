"""
Converts raw question text into semantic embeddings using sentence-transformers.
Stores embeddings back into the database for clustering and similarity search.
"""

import sqlite3
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

DB_PATH = "../data/waec_questions.db"
MODEL_NAME = "all-MiniLM-L6-v2"  # Fast + accurate for semantic similarity
BATCH_SIZE = 256


def get_unembedded_questions(conn, subject=None):
    c = conn.cursor()
    query = "SELECT id, question_text FROM questions WHERE embedding IS NULL"
    params = []
    if subject:
        query += " AND subject = ?"
        params.append(subject)
    c.execute(query, params)
    return c.fetchall()


def save_embeddings(conn, id_embedding_pairs):
    c = conn.cursor()
    c.executemany(
        "UPDATE questions SET embedding = ? WHERE id = ?",
        [(json.dumps(emb.tolist()), qid) for qid, emb in id_embedding_pairs]
    )
    conn.commit()


def run_embedder(subject=None):
    print(f"Loading model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)

    conn = sqlite3.connect(DB_PATH)
    rows = get_unembedded_questions(conn, subject)
    print(f"Questions to embed: {len(rows)}")

    if not rows:
        print("All questions already embedded.")
        conn.close()
        return

    ids = [r[0] for r in rows]
    texts = [r[1] for r in rows]

    all_pairs = []
    for i in tqdm(range(0, len(texts), BATCH_SIZE), desc="Embedding batches"):
        batch_texts = texts[i:i + BATCH_SIZE]
        batch_ids = ids[i:i + BATCH_SIZE]
        embeddings = model.encode(batch_texts, show_progress_bar=False, normalize_embeddings=True)
        all_pairs.extend(zip(batch_ids, embeddings))

        # Save in chunks to avoid memory buildup
        if len(all_pairs) >= 1000:
            save_embeddings(conn, all_pairs)
            all_pairs = []

    if all_pairs:
        save_embeddings(conn, all_pairs)

    conn.close()
    print("Embedding complete.")


def load_embeddings(subject: str) -> tuple:
    """Load all embeddings for a subject. Returns (ids, texts, embeddings array)."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "SELECT id, question_text, year, embedding FROM questions WHERE subject=? AND embedding IS NOT NULL",
        (subject,)
    )
    rows = c.fetchall()
    conn.close()

    ids = [r[0] for r in rows]
    texts = [r[1] for r in rows]
    years = [r[2] for r in rows]
    embeddings = np.array([json.loads(r[3]) for r in rows])
    return ids, texts, years, embeddings


if __name__ == "__main__":
    run_embedder()
