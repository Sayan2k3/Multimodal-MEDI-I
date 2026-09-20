# MEDI-I — AI-Powered Medicare Plan Recommender

An end-to-end Medicare insurance recommendation platform powered by **three XGBoost ML models**: a multi-class plan classifier (180 boosting rounds), an actuarial premium regressor, and a coverage sum-insured regressor. All outputs are real-time ML predictions — zero hardcoded values.

---

## ⚡ Getting Started in 2 Commands

```bash
pip install -r requirements.txt
python start.py
```

`start.py` is a **single-click launcher** that automatically:
1. Verifies all dependencies are installed
2. Generates the 4,000-sample synthetic clinical dataset *(only if missing)*
3. Trains all three XGBoost models from `config.yaml` *(only if missing)*
4. Starts the Flask server
5. Opens `http://127.0.0.1:5000/login` in your browser

---

## 🗂️ Project Structure

```
MEDI-I/
│
├── start.py                  ← ONE-CLICK LAUNCHER (run this)
├── requirements.txt          ← All Python dependencies
├── config.yaml               ← All ML hyperparameters (edit here)
│
├── .env                      ← Local secrets (NOT committed to git)
├── .env.example              ← Template — safe to commit
├── .gitignore                ← Excludes: data/, .env, venv/, __pycache__/
│
├── create_dataset.py         ← Synthetic data generator (reads config.yaml)
├── train.py                  ← Trains 3 XGBoost models (reads config.yaml)
├── app.py                    ← Flask backend & /api/recommend ML endpoint
├── test_ml_pipeline.py       ← API verification tests
│
├── data/
│   └── medicare_dataset.csv  ← Auto-generated (NOT in git)
│
├── models/
│   ├── xgb_classifier.json   ← XGBoost Plan Classifier (180 trees)
│   ├── xgb_regressor.json    ← XGBoost Premium Regressor (140 trees)
│   ├── xgb_coverage.json     ← XGBoost Coverage Regressor (100 trees)
│   ├── preprocessor.pkl      ← Sklearn ColumnTransformer pipeline
│   └── metadata.json         ← Accuracy, feature weights, class list
│
├── index.html                ← Landing page
├── basic-details.html        ← Input form
├── basic-details.js          ← Form submit handler
├── result.html               ← Recommendation results page
├── result-script.js          ← Fetches ML output & renders results
├── result-styles.css
├── styles.css
├── dashboard.html
├── login.html
│
├── Procfile                  ← Cloud deployment (Render / Railway / Heroku)
└── runtime.txt               ← Python 3.11.9
```

---

## 🔧 Configuration (`config.yaml`)

All ML hyperparameters live in **one file** — no code changes needed:

```yaml
model:
  classifier:
    n_estimators: 180     # boosting iterations
    max_depth: 5
    learning_rate: 0.04

  premium_regressor:
    n_estimators: 140
    max_depth: 4
    learning_rate: 0.04

  coverage_regressor:
    n_estimators: 100
    max_depth: 4
    learning_rate: 0.05

dataset:
  sample_size: 4000
```

To retrain with new settings: edit `config.yaml`, delete the `models/` files, and run `python start.py` again.

---

## 🤖 ML Architecture

| Model | Type | Objective | Accuracy |
|---|---|---|---|
| Plan Classifier | `XGBClassifier` | `multi:softprob` | **90.2%** |
| Premium Regressor | `XGBRegressor` | `reg:squarederror` | **R² 0.98** |
| Coverage Regressor | `XGBRegressor` | `reg:squarederror` | **R² 0.97** |

**Top Feature Importances** (from XGBoost `feature_importances_`):
- Diabetes: 27.3%
- Hypertension: 18.0%
- Smoker Status: 9.0%
- Preference: immediateFunds: 9.5%
- Children: 7.8%

---

## 🔒 What's in `.gitignore`

| Excluded | Reason |
|---|---|
| `data/*.csv` | Datasets can be regenerated with `create_dataset.py` |
| `.env` | Contains secrets — never commit |
| `venv/` | Local virtualenv — install from `requirements.txt` |
| `__pycache__/` | Python bytecode — auto-generated |

**What IS committed:** `models/` (trained XGBoost `.json` and `.pkl` files) so deployed apps don't need to retrain on the server.

---

## ☁️ Deploy to Cloud (Render / Railway)

1. Push to GitHub (data and `.env` will be automatically excluded by `.gitignore`)
2. Connect repo to Render / Railway as a **Python Web Service**
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
5. The app will use the committed `models/` folder — no retraining needed on the server

---

## 🚀 Deploy to Vercel

Vercel is great for serverless deployments. We have included a `vercel.json` configuration file!

1. Push your repository to GitHub.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
3. Import your GitHub repository.
4. Leave the Framework Preset as `Other` and click **Deploy**.
5. Vercel will automatically detect `vercel.json`, install `requirements.txt`, and deploy `app.py` as a serverless function!

*(Note: Vercel's free Hobby tier has a 250MB size limit for Serverless Functions. Since this project uses heavy libraries like XGBoost, Pandas, and Scikit-Learn, it might push the limits of the free tier. If the build fails due to size limits, we recommend using Render or Railway instead.)*
