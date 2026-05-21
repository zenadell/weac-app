"""
Master script — run this once to:
1. Fetch all WAEC past questions
2. Generate embeddings
3. Cluster into topics
4. Train prediction models
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from data_pipeline.fetcher import run_pipeline, get_stats, SUBJECTS
from ml_engine.embedder import run_embedder
from ml_engine.clusterer import build_topic_model
from ml_engine.predictor import train_model, get_top_predictions


def main():
    print("=" * 60)
    print("  WAECPrep — Full ML Pipeline")
    print("=" * 60)

    # Step 1: Fetch data
    print("\n[STEP 1] Fetching past questions from APIs...")
    run_pipeline()
    get_stats()

    # Step 2: Embed questions
    print("\n[STEP 2] Generating semantic embeddings...")
    run_embedder()

    # Step 3: Cluster topics per subject
    print("\n[STEP 3] Clustering questions into topics...")
    for subject in SUBJECTS:
        build_topic_model(subject)

    # Step 4: Train LightGBM models
    print("\n[STEP 4] Training prediction models...")
    for subject in SUBJECTS:
        train_model(subject)

    # Step 5: Demo predictions
    print("\n[STEP 5] Sample predictions for 2025 WAEC:")
    print("=" * 60)
    for subject in ["biology", "chemistry", "mathematics", "physics", "english"]:
        predictions = get_top_predictions(subject, top_n=5)
        print(f"\n{subject.upper()} — Top 5 likely topics:")
        for p in predictions:
            bar = "█" * int(p["probability"] / 10)
            print(f"  {p['rank']}. {p['topic'][:45]:<45} {p['probability']:5.1f}% {bar}")

    print("\nPipeline complete. Start the API with:")
    print("  cd backend && uvicorn api.main:app --reload --port 8000")


if __name__ == "__main__":
    main()
