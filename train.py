import os
import json
import pickle
import yaml
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error, r2_score
import xgboost as xgb

def load_config(config_path="config.yaml"):
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def train_pipeline(config):
    data_path = os.path.join(
        config["dataset"].get("data_dir", "data"),
        config["dataset"].get("data_filename", "medicare_dataset.csv")
    )
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}. Run create_dataset.py first.")

    print(f"[INFO] Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)

    categorical_features = ["sex", "preferences"]
    numeric_features = ["age", "bmi", "children", "smoker", "diabetes", "pressure", "thyroid", "asthma", "other_disease"]
    feature_cols = numeric_features + categorical_features

    X = df[feature_cols]
    y_plan = df["recommended_plan"]
    y_premium = df["annual_premium"]
    y_coverage = df["coverage_lakh"]

    label_encoder = LabelEncoder()
    y_plan_encoded = label_encoder.fit_transform(y_plan)
    plan_classes = list(label_encoder.classes_)

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", "passthrough", numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )

    X_transformed = preprocessor.fit_transform(X)
    feature_names = numeric_features + list(preprocessor.named_transformers_["cat"].get_feature_names_out(categorical_features))
    print(f"[INFO] Total input features: {len(feature_names)} -> {feature_names}")

    test_size = config["dataset"].get("test_size", 0.2)
    random_state = config["dataset"].get("random_state", 42)

    (
        X_train, X_test,
        y_plan_train, y_plan_test,
        y_prem_train, y_prem_test,
        y_cov_train, y_cov_test
    ) = train_test_split(
        X_transformed, y_plan_encoded, y_premium, y_coverage,
        test_size=test_size, random_state=random_state, stratify=y_plan_encoded
    )

    # -------------------------------------------------------------
    # 1. Train XGBoost Classifier for Plan Recommendation
    # -------------------------------------------------------------
    clf_params = config["model"]["classifier"]
    print("\n" + "="*60)
    print(f"[TRAIN] Training XGBoost Classifier: {config['model']['name']}")
    print(f"Iterations (n_estimators): {clf_params['n_estimators']}, Depth: {clf_params['max_depth']}, LR: {clf_params['learning_rate']}")
    print("="*60)

    clf = xgb.XGBClassifier(
        n_estimators=clf_params["n_estimators"],
        max_depth=clf_params["max_depth"],
        learning_rate=clf_params["learning_rate"],
        subsample=clf_params.get("subsample", 0.85),
        colsample_bytree=clf_params.get("colsample_bytree", 0.85),
        objective=clf_params.get("objective", "multi:softprob"),
        eval_metric=clf_params.get("eval_metric", "mlogloss"),
        random_state=clf_params.get("random_state", 42),
        min_child_weight=clf_params.get("min_child_weight", 2),
        gamma=clf_params.get("gamma", 0.1)
    )

    clf.fit(X_train, y_plan_train)

    y_plan_pred = clf.predict(X_test)
    clf_accuracy = accuracy_score(y_plan_test, y_plan_pred)
    print(f"[EVAL] XGBoost Classifier Test Accuracy: {clf_accuracy * 100:.2f}%")

    # -------------------------------------------------------------
    # 2. Train XGBoost Regressor for Personalized Premium
    # -------------------------------------------------------------
    reg_params = config["model"]["premium_regressor"]
    print("\n" + "="*60)
    print(f"[TRAIN] Training XGBoost Regressor for Premium Calculation")
    print(f"Iterations: {reg_params['n_estimators']}, Depth: {reg_params['max_depth']}, LR: {reg_params['learning_rate']}")
    print("="*60)

    reg_premium = xgb.XGBRegressor(
        n_estimators=reg_params["n_estimators"],
        max_depth=reg_params["max_depth"],
        learning_rate=reg_params["learning_rate"],
        subsample=reg_params.get("subsample", 0.85),
        colsample_bytree=reg_params.get("colsample_bytree", 0.85),
        objective=reg_params.get("objective", "reg:squarederror"),
        eval_metric=reg_params.get("eval_metric", "rmse"),
        random_state=reg_params.get("random_state", 42)
    )

    reg_premium.fit(X_train, y_prem_train)
    y_prem_pred = reg_premium.predict(X_test)
    rmse_prem = np.sqrt(mean_squared_error(y_prem_test, y_prem_pred))
    r2_prem = r2_score(y_prem_test, y_prem_pred)
    print(f"[EVAL] Premium Regressor RMSE: INR {rmse_prem:.2f}, R2 Score: {r2_prem:.4f}")

    # -------------------------------------------------------------
    # 3. Train XGBoost Regressor for Optimal Sum Insured / Coverage
    # -------------------------------------------------------------
    cov_params = config["model"]["coverage_regressor"]
    print("\n" + "="*60)
    print(f"[TRAIN] Training XGBoost Regressor for Coverage Calculation")
    print(f"Iterations: {cov_params['n_estimators']}, Depth: {cov_params['max_depth']}, LR: {cov_params['learning_rate']}")
    print("="*60)

    reg_coverage = xgb.XGBRegressor(
        n_estimators=cov_params["n_estimators"],
        max_depth=cov_params["max_depth"],
        learning_rate=cov_params["learning_rate"],
        subsample=cov_params.get("subsample", 0.85),
        colsample_bytree=cov_params.get("colsample_bytree", 0.85),
        objective=cov_params.get("objective", "reg:squarederror"),
        eval_metric=cov_params.get("eval_metric", "rmse"),
        random_state=cov_params.get("random_state", 42)
    )

    reg_coverage.fit(X_train, y_cov_train)
    y_cov_pred = reg_coverage.predict(X_test)
    rmse_cov = np.sqrt(mean_squared_error(y_cov_test, y_cov_pred))
    r2_cov = r2_score(y_cov_test, y_cov_pred)
    print(f"[EVAL] Coverage Regressor RMSE: {rmse_cov:.2f} Lakh, R2 Score: {r2_cov:.4f}")

    # Feature importances
    clf_importances = dict(zip(feature_names, [round(float(val), 4) for val in clf.feature_importances_]))
    sorted_importances = sorted(clf_importances.items(), key=lambda x: x[1], reverse=True)
    print(f"\n[INSIGHTS] Top 5 XGBoost Feature Importances:")
    for feat, imp in sorted_importances[:5]:
        print(f"  - {feat}: {imp * 100:.1f}%")

    # -------------------------------------------------------------
    # 4. Save Models and Metadata
    # -------------------------------------------------------------
    models_dir = config["artifacts"].get("models_dir", "models")
    os.makedirs(models_dir, exist_ok=True)

    clf_path = os.path.join(models_dir, config["artifacts"].get("classifier_file", "xgb_classifier.json"))
    prem_path = os.path.join(models_dir, config["artifacts"].get("regressor_file", "xgb_regressor.json"))
    cov_path = os.path.join(models_dir, config["artifacts"].get("coverage_file", "xgb_coverage.json"))
    prep_path = os.path.join(models_dir, config["artifacts"].get("preprocessor_file", "preprocessor.pkl"))
    meta_path = os.path.join(models_dir, config["artifacts"].get("metadata_file", "metadata.json"))

    clf.save_model(clf_path)
    reg_premium.save_model(prem_path)
    reg_coverage.save_model(cov_path)

    with open(prep_path, "wb") as f:
        pickle.dump({
            "preprocessor": preprocessor,
            "label_encoder": label_encoder,
            "numeric_features": numeric_features,
            "categorical_features": categorical_features,
            "feature_names": feature_names
        }, f)

    metadata = {
        "model_name": config["model"]["name"],
        "model_version": config["model"].get("version", "2.0.0"),
        "classifier_params": clf_params,
        "premium_params": reg_params,
        "coverage_params": cov_params,
        "classes": plan_classes,
        "test_accuracy": round(float(clf_accuracy), 4),
        "premium_r2_score": round(float(r2_prem), 4),
        "coverage_r2_score": round(float(r2_cov), 4),
        "feature_importances": clf_importances
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("\n" + "="*60)
    print(f"[SUCCESS] All models successfully saved to '{models_dir}':")
    print(f"  - XGBoost Plan Classifier: {clf_path}")
    print(f"  - XGBoost Premium Regressor: {prem_path}")
    print(f"  - XGBoost Coverage Regressor: {cov_path}")
    print(f"  - Data Pipeline: {prep_path}")
    print(f"  - Metadata: {meta_path}")
    print("="*60)

if __name__ == "__main__":
    cfg = load_config("config.yaml")
    train_pipeline(cfg)
