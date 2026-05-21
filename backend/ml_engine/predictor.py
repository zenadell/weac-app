"""
LightGBM model that takes pattern features and outputs calibrated
probability rankings for each topic per subject.
"""

import sqlite3
import json
import os
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import cross_val_score
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import GradientBoostingClassifier
import warnings

warnings.filterwarnings("ignore")

_BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(_BASE, "data/waec_questions.db")
MODELS_DIR = os.path.join(_BASE, "data/models")


def build_feature_matrix(subject: str) -> pd.DataFrame:
    """
    Builds training features from historical pattern data.
    Each row = (topic, year), label = did it appear in year+1?
    """
    from ml_engine.pattern_detector import get_topic_timeseries, get_all_topic_clusters, detect_cycle_fft

    clusters = get_all_topic_clusters(subject)
    all_years = list(range(1990, 2024))
    rows = []

    for cluster in clusters:
        series = get_topic_timeseries(subject, cluster)
        cycle = detect_cycle_fft(series)

        for i, year in enumerate(all_years):
            if i + 1 >= len(series):
                continue

            # Count appearances up to this year
            past = series[:year + 1]
            appeared_years = [y for y, v in past.items() if v > 0]

            last_year = max(appeared_years) if appeared_years else None
            gap = (year - last_year) if last_year else 10
            total = len(appeared_years)
            freq_rate = total / max(1, (year - 1990 + 1))

            # Rolling window features
            last_3 = series[max(1990, year - 2):year + 1].sum()
            last_5 = series[max(1990, year - 4):year + 1].sum()

            # Label: did this topic appear next year?
            label = 1 if series.get(year + 1, 0) > 0 else 0

            rows.append({
                "subject": subject,
                "topic_cluster": cluster,
                "year": year,
                "gap_since_last": gap,
                "total_appearances": total,
                "freq_rate": freq_rate,
                "last_3yr_count": int(last_3),
                "last_5yr_count": int(last_5),
                "detected_cycle": cycle if cycle > 0 else 5,
                "years_since_start": year - 1990,
                "label": label
            })

    return pd.DataFrame(rows)


def train_model(subject: str) -> dict:
    """Train LightGBM model for a subject. Returns trained model and metrics."""
    print(f"\nTraining predictor for: {subject.upper()}")
    df = build_feature_matrix(subject)

    if df.empty or df["label"].sum() < 5:
        print(f"  Not enough data for {subject}. Skipping.")
        return {}

    feature_cols = [
        "gap_since_last", "total_appearances", "freq_rate",
        "last_3yr_count", "last_5yr_count", "detected_cycle",
        "years_since_start"
    ]

    X = df[feature_cols].values
    y = df["label"].values

    base_model = GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=4,
        min_samples_leaf=5,
        subsample=0.8,
        random_state=42
    )

    # Calibrate for accurate probabilities
    model = CalibratedClassifierCV(base_model, cv=3, method="isotonic")
    scores = cross_val_score(model, X, y, cv=3, scoring="roc_auc")
    model.fit(X, y)

    os.makedirs(MODELS_DIR, exist_ok=True)
    model_path = os.path.join(MODELS_DIR, f"lgbm_{subject}.pkl")
    with open(model_path, "wb") as f:
        pickle.dump({"model": model, "feature_cols": feature_cols}, f)

    print(f"  ROC-AUC: {scores.mean():.3f} ± {scores.std():.3f}")
    print(f"  Model saved to {model_path}")

    return {"subject": subject, "auc": scores.mean(), "std": scores.std()}


def predict_next_year(subject: str, next_year: int = 2025) -> list:
    """
    Use trained LightGBM to predict topic probabilities for next_year.
    """
    from ml_engine.pattern_detector import (
        get_topic_timeseries, get_all_topic_clusters,
        detect_cycle_fft, calculate_gap_score
    )

    model_path = os.path.join(MODELS_DIR, f"lgbm_{subject}.pkl")
    if not os.path.exists(model_path):
        print(f"No model found for {subject}. Run train_model() first.")
        return []

    with open(model_path, "rb") as f:
        saved = pickle.load(f)
    model = saved["model"]

    clusters = get_all_topic_clusters(subject)
    rows = []

    for cluster in clusters:
        series = get_topic_timeseries(subject, cluster)
        cycle = detect_cycle_fft(series)
        gap_info = calculate_gap_score(series, next_year)

        past = series[:next_year]
        appeared = [y for y, v in past.items() if v > 0]
        total = len(appeared)
        freq_rate = total / max(1, next_year - 1990)
        last_3 = series[max(1990, next_year - 3):next_year].sum()
        last_5 = series[max(1990, next_year - 5):next_year].sum()

        rows.append({
            "topic_cluster": cluster,
            "gap_since_last": gap_info["gap"] or 10,
            "total_appearances": total,
            "freq_rate": freq_rate,
            "last_3yr_count": int(last_3),
            "last_5yr_count": int(last_5),
            "detected_cycle": cycle if cycle > 0 else 5,
            "years_since_start": next_year - 1990,
        })

    if not rows:
        return []

    df = pd.DataFrame(rows)
    feature_cols = [
        "gap_since_last", "total_appearances", "freq_rate",
        "last_3yr_count", "last_5yr_count", "detected_cycle",
        "years_since_start"
    ]

    probs = model.predict_proba(df[feature_cols].values)[:, 1]
    df["probability"] = probs
    df = df.sort_values("probability", ascending=False)

    return df[["topic_cluster", "probability"]].to_dict(orient="records")


def get_topic_label(subject: str, topic_cluster: int) -> str:
    """Get human-readable topic label from BERTopic model."""
    model_path = os.path.join(MODELS_DIR, f"topic_model_{subject}.pkl")
    if not os.path.exists(model_path):
        return f"Topic {topic_cluster}"
    try:
        with open(model_path, "rb") as f:
            topic_model = pickle.load(f)
        topic_info = topic_model.get_topic_info()
        row = topic_info[topic_info["Topic"] == topic_cluster]
        if not row.empty:
            return row.iloc[0]["Name"]
    except Exception:
        pass
    return f"Topic {topic_cluster}"


def get_top_predictions(subject: str, top_n: int = 10, next_year: int = 2025) -> list:
    """
    Full prediction pipeline: returns top N topics with labels and probabilities.
    """
    raw = predict_next_year(subject, next_year)
    results = []
    for r in raw[:top_n]:
        label = get_topic_label(subject, r["topic_cluster"])
        results.append({
            "rank": len(results) + 1,
            "topic": label,
            "topic_cluster": r["topic_cluster"],
            "probability": round(r["probability"] * 100, 1),
        })
    return results


if __name__ == "__main__":
    from data_pipeline.fetcher import SUBJECTS
    for subject in SUBJECTS:
        train_model(subject)

    print("\n--- Predictions for BIOLOGY 2025 ---")
    predictions = get_top_predictions("biology", top_n=10)
    for p in predictions:
        print(f"{p['rank']}. {p['topic']} — {p['probability']}%")
