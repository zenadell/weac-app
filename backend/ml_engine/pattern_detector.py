"""
Detects cyclical question patterns using FFT + SARIMA.
Identifies which topics are "due" to appear and assigns probability scores.
"""

import numpy as np
import pandas as pd
import sqlite3
import json
import warnings
from scipy import signal
from scipy.stats import norm
import statsmodels.api as sm
from sklearn.preprocessing import MinMaxScaler

warnings.filterwarnings("ignore")

import os as _os
DB_PATH = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))), "data/waec_questions.db")
ALL_YEARS = list(range(1990, 2025))


def get_topic_timeseries(subject: str, topic_cluster: int) -> pd.Series:
    """Build a yearly frequency time series for a given topic."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT year, COUNT(*) FROM questions
        WHERE subject=? AND topic_cluster=?
        GROUP BY year ORDER BY year
    """, (subject, topic_cluster))
    rows = c.fetchall()
    conn.close()

    year_counts = dict(rows)
    series = pd.Series(
        [year_counts.get(y, 0) for y in ALL_YEARS],
        index=ALL_YEARS,
        name=f"topic_{topic_cluster}"
    )
    return series


def detect_cycle_fft(series: pd.Series) -> int:
    """
    Use FFT to find the dominant cycle period in years.
    Returns the period (e.g. 2 = every 2 years, 3 = every 3 years).
    """
    values = series.values.astype(float)
    if values.sum() == 0:
        return -1

    # Detrend before FFT
    detrended = signal.detrend(values)
    fft_vals = np.abs(np.fft.rfft(detrended))
    freqs = np.fft.rfftfreq(len(values))

    # Find dominant frequency (ignore DC component at index 0)
    dominant_idx = np.argmax(fft_vals[1:]) + 1
    dominant_freq = freqs[dominant_idx]

    if dominant_freq == 0:
        return -1

    period = int(round(1.0 / dominant_freq))
    return max(1, min(period, 10))  # clamp to 1-10 year cycles


def fit_sarima(series: pd.Series, period: int) -> dict:
    """
    Fit SARIMA model and forecast next year's probability.
    Returns forecast and confidence interval.
    """
    values = series.values.astype(float)

    if values.sum() < 3:
        return {"forecast": 0.0, "lower": 0.0, "upper": 0.0, "method": "zero"}

    try:
        # Use auto_arima-style parameters
        m = max(period, 1)
        model = sm.tsa.statespace.SARIMAX(
            values,
            order=(1, 1, 1),
            seasonal_order=(1, 0, 1, m),
            enforce_stationarity=False,
            enforce_invertibility=False
        )
        result = model.fit(disp=False)
        forecast = result.get_forecast(steps=1)
        pred = forecast.predicted_mean[0]
        ci = forecast.conf_int(alpha=0.2)[0]
        return {
            "forecast": max(0, float(pred)),
            "lower": max(0, float(ci[0])),
            "upper": max(0, float(ci[1])),
            "aic": result.aic,
            "method": "sarima"
        }
    except Exception:
        # Fallback: simple moving average of last 3 years
        recent_mean = float(np.mean(values[-3:]))
        return {"forecast": recent_mean, "lower": 0.0, "upper": recent_mean * 2, "method": "moving_avg"}


def calculate_gap_score(series: pd.Series, current_year: int = 2025) -> dict:
    """
    Gap analysis: how many years since this topic last appeared?
    Longer gap = higher probability of reappearing.
    """
    appeared_years = [y for y, v in zip(series.index, series.values) if v > 0]

    if not appeared_years:
        return {"last_year": None, "gap": None, "gap_score": 0.0, "total_appearances": 0}

    last_year = max(appeared_years)
    gap = current_year - last_year
    total = len(appeared_years)
    avg_interval = (last_year - min(appeared_years)) / max(total - 1, 1) if total > 1 else 5

    # Gap score: sigmoid curve — peaks when gap ≈ avg interval
    gap_score = 1.0 / (1.0 + np.exp(-(gap - avg_interval)))
    return {
        "last_year": last_year,
        "gap": gap,
        "gap_score": float(gap_score),
        "avg_interval": float(avg_interval),
        "total_appearances": total
    }


def score_topic(subject: str, topic_cluster: int, current_year: int = 2025) -> dict:
    """
    Full scoring pipeline for one topic.
    Returns a probability score (0-1) and feature breakdown.
    """
    series = get_topic_timeseries(subject, topic_cluster)
    cycle = detect_cycle_fft(series)
    sarima = fit_sarima(series, cycle if cycle > 0 else 1)
    gap = calculate_gap_score(series, current_year)

    # Frequency score: how often does this topic appear overall?
    total_appearances = gap["total_appearances"]
    freq_score = min(1.0, total_appearances / 10.0)

    # Recency score: appeared in last 2 years → lower (already covered), not appeared → higher
    gap_val = gap["gap"] or 5
    recency_score = min(1.0, gap_val / 5.0)

    # SARIMA forecast score (normalized)
    sarima_score = min(1.0, sarima["forecast"] / 5.0)

    # Composite probability
    probability = (
        0.35 * gap["gap_score"] +
        0.30 * sarima_score +
        0.20 * freq_score +
        0.15 * recency_score
    )

    return {
        "topic_cluster": topic_cluster,
        "probability": round(float(probability), 4),
        "cycle_years": cycle,
        "last_appeared": gap["last_year"],
        "years_gap": gap_val,
        "total_appearances": total_appearances,
        "sarima_forecast": round(sarima["forecast"], 3),
        "gap_score": round(gap["gap_score"], 3),
        "freq_score": round(freq_score, 3),
        "sarima_method": sarima["method"]
    }


def get_all_topic_clusters(subject: str) -> list:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "SELECT DISTINCT topic_cluster FROM questions WHERE subject=? AND topic_cluster >= 0",
        (subject,)
    )
    rows = c.fetchall()
    conn.close()
    return [r[0] for r in rows]


def predict_for_subject(subject: str, top_n: int = 10, current_year: int = 2025) -> list:
    """
    Main function: returns top N predicted topics for a subject.
    """
    clusters = get_all_topic_clusters(subject)
    if not clusters:
        return []

    scores = []
    for cluster in clusters:
        score = score_topic(subject, cluster, current_year)
        scores.append(score)

    # Sort by probability descending
    scores.sort(key=lambda x: x["probability"], reverse=True)

    # Normalize probabilities to 0-100% scale
    max_prob = scores[0]["probability"] if scores else 1.0
    for s in scores:
        s["probability_pct"] = round((s["probability"] / max_prob) * 100, 1)

    return scores[:top_n]


if __name__ == "__main__":
    # Example: predict top topics for biology
    results = predict_for_subject("biology", top_n=10)
    print("\nTop predicted topics for BIOLOGY:")
    print("-" * 60)
    for i, r in enumerate(results, 1):
        print(f"{i}. Topic {r['topic_cluster']:3d} | "
              f"Probability: {r['probability_pct']:5.1f}% | "
              f"Last seen: {r['last_appeared']} | "
              f"Gap: {r['years_gap']}yrs | "
              f"Cycle: {r['cycle_years']}yrs")
