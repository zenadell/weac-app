"""
Fully automated ML pipeline — runs after data collection is done.
Embeds → Clusters → Trains → Shows predictions.
"""

import sys, os, sqlite3, json, pickle, time, warnings
import numpy as np
import pandas as pd
from pathlib import Path

warnings.filterwarnings("ignore")

DB_PATH = Path(__file__).parent / "data/waec_questions.db"
MODELS_DIR = Path(__file__).parent / "data/models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

SUBJECTS = ["biology", "chemistry", "physics", "mathematics", "english",
            "economics", "government"]

ALL_YEARS = list(range(2010, 2025))


# ─────────────────────────────────────
# STEP 1: EMBED
# ─────────────────────────────────────

def run_embed():
    """
    Offline embedding using TF-IDF + TruncatedSVD (Latent Semantic Analysis).
    Always re-embeds ALL questions together so dimensions are consistent.
    """
    print("\n[STEP 1] Generating embeddings (TF-IDF + LSA, offline)...")
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.decomposition import TruncatedSVD
    from sklearn.preprocessing import normalize

    # Clear all existing embeddings to ensure consistent dimensions
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE questions SET embedding=NULL")
    conn.commit()
    c.execute("SELECT id, question_text FROM questions")
    rows = c.fetchall()
    conn.close()

    ids = [r[0] for r in rows]
    texts = [r[1] for r in rows]
    print(f"  Vectorizing {len(texts)} questions...")

    # TF-IDF
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=8000,
        stop_words="english",
        sublinear_tf=True
    )
    tfidf_matrix = vectorizer.fit_transform(texts)

    # LSA — fixed 128 dims across all questions for consistency
    n_components = min(128, tfidf_matrix.shape[1] - 1, len(texts) - 1)
    n_components = max(n_components, 32)  # at least 32 dims
    svd = TruncatedSVD(n_components=n_components, random_state=42)
    embeddings = svd.fit_transform(tfidf_matrix)
    embeddings = normalize(embeddings)  # L2 normalize

    print(f"  Saving {len(ids)} embeddings (dim={n_components})...")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.executemany("UPDATE questions SET embedding=? WHERE id=?",
                  [(json.dumps(e.tolist()), qid) for qid, e in zip(ids, embeddings)])
    conn.commit()
    conn.close()

    # Save vectorizer + SVD for inference
    with open(MODELS_DIR / "tfidf_svd.pkl", "wb") as f:
        pickle.dump({"vectorizer": vectorizer, "svd": svd}, f)

    print(f"  Done. {len(ids)} embeddings saved.")


# ─────────────────────────────────────
# STEP 2: CLUSTER
# ─────────────────────────────────────

def run_cluster(subject):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, question_text, year, embedding FROM questions WHERE subject=? AND embedding IS NOT NULL", (subject,))
    rows = c.fetchall()
    conn.close()

    if len(rows) < 15:
        print(f"  {subject}: not enough data ({len(rows)} questions), skipping cluster")
        return

    ids = [r[0] for r in rows]
    texts = [r[1] for r in rows]
    embeddings = np.array([json.loads(r[3]) for r in rows])

    from bertopic import BERTopic
    from sklearn.feature_extraction.text import CountVectorizer

    vectorizer = CountVectorizer(ngram_range=(1, 2), stop_words="english", min_df=2)
    topic_model = BERTopic(
        embedding_model=None,
        vectorizer_model=vectorizer,
        min_topic_size=max(3, len(rows)//20),
        nr_topics="auto",
        verbose=False
    )

    topics, _ = topic_model.fit_transform(texts, embeddings=embeddings)

    # Save model
    with open(MODELS_DIR / f"topic_{subject}.pkl", "wb") as f:
        pickle.dump(topic_model, f)

    # Save assignments
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.executemany("UPDATE questions SET topic_cluster=? WHERE id=?",
                  [(int(t), qid) for qid, t in zip(ids, topics)])
    conn.commit()
    conn.close()

    n_topics = len(set(topics)) - (1 if -1 in topics else 0)
    print(f"  {subject}: {n_topics} topics found from {len(rows)} questions")
    return topic_model


# ─────────────────────────────────────
# STEP 3: PATTERN DETECT + TRAIN
# ─────────────────────────────────────

def get_series(subject, cluster):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT year, COUNT(*) FROM questions WHERE subject=? AND topic_cluster=? GROUP BY year", (subject, cluster))
    rows = c.fetchall()
    conn.close()
    d = dict(rows)
    return pd.Series([d.get(y, 0) for y in ALL_YEARS], index=ALL_YEARS)


def gap_score(series, cur_year=2025):
    appeared = [y for y, v in series.items() if v > 0]
    if not appeared:
        return 0.0, None, 10
    last = max(appeared)
    gap = cur_year - last
    total = len(appeared)
    avg_int = (last - min(appeared)) / max(total - 1, 1) if total > 1 else 4
    score = 1.0 / (1.0 + np.exp(-(gap - avg_int)))
    return float(score), last, gap


def build_features(subject):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT DISTINCT topic_cluster FROM questions WHERE subject=? AND topic_cluster >= 0", (subject,))
    clusters = [r[0] for r in c.fetchall()]
    conn.close()

    rows = []
    for cl in clusters:
        series = get_series(subject, cl)
        for i, year in enumerate(ALL_YEARS[:-1]):
            next_year = ALL_YEARS[i + 1]
            past = series[:year + 1]
            appeared = [y for y, v in past.items() if v > 0]
            last = max(appeared) if appeared else None
            gap_val = (year - last) if last else 10
            total = len(appeared)
            freq = total / max(1, year - 2009)
            last3 = int(series[max(2010, year - 2):year + 1].sum())
            last5 = int(series[max(2010, year - 4):year + 1].sum())
            label = 1 if series.get(next_year, 0) > 0 else 0
            rows.append({
                "cluster": cl, "year": year,
                "gap": gap_val, "total": total, "freq": freq,
                "last3": last3, "last5": last5,
                "years_in": year - 2009, "label": label
            })
    return pd.DataFrame(rows)


def train_subject(subject):
    from sklearn.ensemble import GradientBoostingClassifier
    from sklearn.calibration import CalibratedClassifierCV
    from sklearn.model_selection import cross_val_score

    df = build_features(subject)
    if df.empty or df["label"].sum() < 3:
        print(f"  {subject}: not enough labeled data, skipping")
        return None

    FEATS = ["gap", "total", "freq", "last3", "last5", "years_in"]
    X, y = df[FEATS].values, df["label"].values

    base = GradientBoostingClassifier(
        n_estimators=150, learning_rate=0.08,
        max_depth=3, min_samples_leaf=3,
        subsample=0.8, random_state=42
    )

    n_pos = int(y.sum())
    n_neg = int((1 - y).sum())

    # If only 1 class exists, ML can't train — save a flag and use gap-score fallback
    if n_pos < 2 or n_neg < 2:
        print(f"  {subject}: only 1 class (pos={n_pos}, neg={n_neg}), using gap-score ranking")
        with open(MODELS_DIR / f"model_{subject}.pkl", "wb") as f:
            pickle.dump({"model": None, "feats": FEATS, "calibrated": False}, f)
        return None

    cv_folds = min(3, n_pos, n_neg)
    try:
        scores = cross_val_score(base, X, y, cv=cv_folds, scoring="roc_auc")
        model = CalibratedClassifierCV(base, cv=cv_folds, method="isotonic")
        print(f"  {subject}: AUC {scores.mean():.3f} ± {scores.std():.3f}")
    except Exception:
        model = base
        print(f"  {subject}: CV skipped, fitting directly")

    model.fit(X, y)
    with open(MODELS_DIR / f"model_{subject}.pkl", "wb") as f:
        pickle.dump({"model": model, "feats": FEATS}, f)
    return model


# ─────────────────────────────────────
# STEP 4: PREDICT
# ─────────────────────────────────────

def predict_subject(subject, top_n=10, next_year=2025):
    model_path = MODELS_DIR / f"model_{subject}.pkl"
    topic_path = MODELS_DIR / f"topic_{subject}.pkl"

    if not model_path.exists():
        return []

    with open(model_path, "rb") as f:
        saved = pickle.load(f)
    model = saved["model"]  # may be None (gap-score fallback)
    feats = saved["feats"]

    topic_model = None
    if topic_path.exists():
        with open(topic_path, "rb") as f:
            topic_model = pickle.load(f)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT DISTINCT topic_cluster FROM questions WHERE subject=? AND topic_cluster >= 0", (subject,))
    clusters = [r[0] for r in c.fetchall()]
    conn.close()

    rows = []
    for cl in clusters:
        series = get_series(subject, cl)
        past = series[:next_year]
        appeared = [y for y, v in past.items() if v > 0]
        last = max(appeared) if appeared else None
        gap_val = (next_year - last) if last else 10
        total = len(appeared)
        freq = total / max(1, next_year - 2009)
        last3 = int(series[max(2010, next_year - 3):next_year].sum())
        last5 = int(series[max(2010, next_year - 5):next_year].sum())
        rows.append({
            "cluster": cl, "gap": gap_val, "total": total,
            "freq": freq, "last3": last3, "last5": last5,
            "years_in": next_year - 2009
        })

    if not rows:
        return []

    df = pd.DataFrame(rows)

    if model is None:
        # Gap-score fallback: rank by gap + frequency
        df["prob"] = (
            df["gap"].clip(0, 10) / 10.0 * 0.5 +
            df["freq"].clip(0, 1) * 0.3 +
            (df["last3"] == 0).astype(float) * 0.2
        )
    else:
        probs = model.predict_proba(df[feats].values)[:, 1]
        df["prob"] = probs
    df = df.sort_values("prob", ascending=False).head(top_n)

    results = []
    for _, row in df.iterrows():
        cl = int(row["cluster"])
        label = f"Topic {cl}"
        if topic_model:
            try:
                info = topic_model.get_topic_info()
                match = info[info["Topic"] == cl]
                if not match.empty:
                    raw = match.iloc[0]["Name"]
                    # Clean up BERTopic auto-label: "2_gas_water_oxygen" → "Gas, Water & Oxygen"
                    parts = str(raw).split("_")[1:]  # drop leading cluster number
                    label = ", ".join(p.capitalize() for p in parts if p and p != "following")
                    if not label:
                        label = f"Topic {cl}"
            except Exception:
                pass
        results.append({
            "rank": len(results) + 1,
            "topic": label,
            "cluster": cl,
            "probability": round(float(row["prob"]) * 100, 1)
        })
    return results


# ─────────────────────────────────────
# MAIN
# ─────────────────────────────────────

def main():
    print("=" * 60)
    print("  WAECPrep Auto ML Pipeline")
    print("=" * 60)

    # Check DB
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM questions")
    total = c.fetchone()[0]
    c.execute("SELECT subject, COUNT(*) FROM questions GROUP BY subject")
    by_subj = dict(c.fetchall())
    conn.close()
    print(f"\nDatabase: {total} questions across {len(by_subj)} subjects")

    # Step 1 — skip if already embedded
    conn2 = sqlite3.connect(DB_PATH)
    c2 = conn2.cursor()
    c2.execute("SELECT COUNT(*) FROM questions WHERE embedding IS NOT NULL")
    already_embedded = c2.fetchone()[0]
    conn2.close()
    if already_embedded < total * 0.9:
        run_embed()
    else:
        print(f"\n[STEP 1] Skipping — {already_embedded} embeddings already in DB.")

    # Steps 2 + 3 per subject — skip clustering if already done
    conn2 = sqlite3.connect(DB_PATH)
    c2 = conn2.cursor()
    c2.execute("SELECT COUNT(*) FROM questions WHERE topic_cluster >= 0")
    already_clustered = c2.fetchone()[0]
    conn2.close()

    print("\n[STEP 2] Clustering topics per subject...")
    if already_clustered < total * 0.5:
        for subj in SUBJECTS:
            if by_subj.get(subj, 0) > 0:
                run_cluster(subj)
    else:
        print(f"  Skipping — {already_clustered} questions already clustered.")

    print("\n[STEP 3] Training prediction models...")
    for subj in SUBJECTS:
        if by_subj.get(subj, 0) > 0:
            train_subject(subj)

    # Step 4: Show predictions
    print("\n" + "=" * 60)
    print("  2025 WAEC PREDICTIONS")
    print("=" * 60)
    for subj in SUBJECTS:
        preds = predict_subject(subj, top_n=5)
        if not preds:
            continue
        print(f"\n{subj.upper()} — Top 5 predicted topics:")
        for p in preds:
            bar = "█" * max(1, int(p["probability"] / 8))
            print(f"  {p['rank']}. {str(p['topic'])[:40]:<40} {p['probability']:5.1f}% {bar}")

    print("\nAll done. Start the API with:")
    print("  cd backend && uvicorn api.main:app --reload --port 8000\n")


if __name__ == "__main__":
    main()
