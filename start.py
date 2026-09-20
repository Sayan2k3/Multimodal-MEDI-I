"""
MEDI-I One-Click Launcher
==========================
Usage:
    python start.py

This script:
  1. Checks all dependencies from requirements.txt are installed
  2. Generates the synthetic dataset (if not already present)
  3. Trains the XGBoost models (if not already trained)
  4. Starts the Flask application and auto-opens the browser
"""

import os
import sys
import subprocess
import time
import webbrowser

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def log(msg, level="INFO"):
    prefix = {"INFO": "[ INFO ]", "OK": "[  OK  ]", "WARN": "[ WARN ]", "STEP": "[ STEP ]"}
    print(f"{prefix.get(level, '[INFO]')} {msg}")


def check_dependencies():
    log("Checking required packages from requirements.txt...", "STEP")
    req_path = os.path.join(BASE_DIR, "requirements.txt")
    missing = []
    with open(req_path) as f:
        for line in f:
            pkg = line.strip().split(">=")[0].split("==")[0].strip()
            if not pkg or pkg.startswith("#"):
                continue
            import_name = pkg.replace("-", "_").lower()
            # Special-case mapping
            import_aliases = {
                "pyyaml": "yaml",
                "scikit_learn": "sklearn",
                "python_dotenv": "dotenv",
            }
            import_name = import_aliases.get(import_name, import_name)
            try:
                __import__(import_name)
            except ImportError:
                missing.append(pkg)

    if missing:
        log(f"Missing packages detected: {missing}", "WARN")
        log("Installing missing packages automatically...", "INFO")
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing, stdout=subprocess.DEVNULL)
        log("All packages installed successfully.", "OK")
    else:
        log("All dependencies satisfied.", "OK")


def generate_dataset():
    data_path = os.path.join(BASE_DIR, "data", "medicare_dataset.csv")
    if os.path.exists(data_path):
        log("Dataset already exists — skipping generation.", "OK")
        return
    log("Generating synthetic Medicare dataset (4,000 patient profiles)...", "STEP")
    result = subprocess.run(
        [sys.executable, os.path.join(BASE_DIR, "create_dataset.py")],
        cwd=BASE_DIR
    )
    if result.returncode != 0:
        log("Dataset generation failed. Aborting.", "WARN")
        sys.exit(1)
    log("Dataset generated successfully.", "OK")


def train_models():
    clf_path = os.path.join(BASE_DIR, "models", "xgb_classifier.json")
    reg_path = os.path.join(BASE_DIR, "models", "xgb_regressor.json")
    cov_path = os.path.join(BASE_DIR, "models", "xgb_coverage.json")

    if os.path.exists(clf_path) and os.path.exists(reg_path) and os.path.exists(cov_path):
        log("Trained models already present — skipping training.", "OK")
        return
    log("Training XGBoost Classifier, Premium Regressor, and Coverage Regressor...", "STEP")
    result = subprocess.run(
        [sys.executable, os.path.join(BASE_DIR, "train.py")],
        cwd=BASE_DIR
    )
    if result.returncode != 0:
        log("Model training failed. Aborting.", "WARN")
        sys.exit(1)
    log("All models trained and saved successfully.", "OK")


def start_server():
    log("Starting MEDI-I Flask application server...", "STEP")

    import yaml
    with open(os.path.join(BASE_DIR, "config.yaml")) as f:
        config = yaml.safe_load(f)

    host = os.environ.get("HOST", config.get("server", {}).get("host", "127.0.0.1"))
    port = int(os.environ.get("PORT", config.get("server", {}).get("port", 5000)))
    url = f"http://{host}:{port}/login"

    # Launch server in subprocess so we can open browser
    server_proc = subprocess.Popen(
        [sys.executable, os.path.join(BASE_DIR, "app.py")],
        cwd=BASE_DIR
    )

    # Wait briefly for server to start, then open browser
    time.sleep(2)
    log(f"Server running at {url}", "OK")
    log("Opening MEDI-I in your default browser...", "INFO")
    webbrowser.open(url)

    log("Press CTRL+C to stop the server.", "INFO")
    try:
        server_proc.wait()
    except KeyboardInterrupt:
        log("Shutting down MEDI-I server. Goodbye!", "INFO")
        server_proc.terminate()


if __name__ == "__main__":
    print()
    print("=" * 55)
    print("        MEDI-I  |  AI-Powered Medicare Recommender        ")
    print("=" * 55)
    print()

    check_dependencies()
    generate_dataset()
    train_models()
    start_server()
