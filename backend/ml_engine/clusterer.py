"""
Uses BERTopic to auto-discover topics across all WAEC questions.
Groups questions into meaningful topic clusters (e.g. "Photosynthesis", "Simultaneous Equations").
"""

import sqlite3
import json
import pickle
import os
import numpy as np
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import CountVectorizer

DB_PATH = "../data/waec_questions.db"
MODELS_DIR = "../data/models"


def load_subject_questions(subject: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "SELECT id, question_text, year FROM questions WHERE subject=? AND embedding IS NOT NULL",
        (subject,)
    )
    rows = c.fetchall()
    conn.close()
    return rows


def load_embeddings_for_subject(subject: str):
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
    embeddings = np.array([json.loads(r[3]) for r in rows]) if rows else np.array([])
    return ids, texts, years, embeddings


def build_topic_model(subject: str, min_topic_size: int = 5):
    print(f"\nBuilding topic model for: {subject.upper()}")
    ids, texts, years, embeddings = load_embeddings_for_subject(subject)

    if len(texts) < 20:
        print(f"  Not enough questions ({len(texts)}) to cluster. Skipping.")
        return None, []

    # Custom vectorizer to get better topic labels
    vectorizer = CountVectorizer(
        ngram_range=(1, 2),
        stop_words="english",
        min_df=2
    )

    topic_model = BERTopic(
        embedding_model=None,  # we pass pre-computed embeddings
        vectorizer_model=vectorizer,
        min_topic_size=min_topic_size,
        nr_topics="auto",
        calculate_probabilities=True,
        verbose=False
    )

    topics, probs = topic_model.fit_transform(texts, embeddings=embeddings)

    # Save model
    os.makedirs(MODELS_DIR, exist_ok=True)
    model_path = os.path.join(MODELS_DIR, f"topic_model_{subject}.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(topic_model, f)

    # Save topic assignments back to DB
    save_topic_assignments(ids, topics, subject)

    topic_info = topic_model.get_topic_info()
    print(f"  Found {len(topic_info) - 1} topics ({len(texts)} questions)")
    print(topic_info[["Topic", "Count", "Name"]].head(15).to_string())

    return topic_model, topics


def save_topic_assignments(ids, topics, subject):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    pairs = [(int(t), qid) for qid, t in zip(ids, topics)]
    c.executemany("UPDATE questions SET topic_cluster=? WHERE id=?", pairs)
    conn.commit()
    conn.close()


def load_topic_model(subject: str):
    model_path = os.path.join(MODELS_DIR, f"topic_model_{subject}.pkl")
    if not os.path.exists(model_path):
        return None
    with open(model_path, "rb") as f:
        return pickle.load(f)


def get_topic_frequency_by_year(subject: str) -> dict:
    """
    Returns a dict: {topic_cluster: {year: count}}
    This is the foundation for pattern detection.
    """
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT topic_cluster, year, COUNT(*) as cnt
        FROM questions
        WHERE subject=? AND topic_cluster >= 0
        GROUP BY topic_cluster, year
        ORDER BY topic_cluster, year
    """, (subject,))
    rows = c.fetchall()
    conn.close()

    freq = {}
    for topic, year, count in rows:
        if topic not in freq:
            freq[topic] = {}
        freq[topic][year] = count
    return freq


def run_clustering(subjects=None):
    from data_pipeline.fetcher import SUBJECTS
    subjects = subjects or SUBJECTS

    for subject in subjects:
        build_topic_model(subject)


if __name__ == "__main__":
    run_clustering()
