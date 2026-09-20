import os
import yaml
import numpy as np
import pandas as pd

def load_config(config_path="config.yaml"):
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def generate_medicare_data(config):
    np.random.seed(config["dataset"].get("random_state", 42))
    n_samples = config["dataset"].get("sample_size", 4000)

    # 1. Demographic Features
    age = np.random.randint(18, 76, size=n_samples)
    sex = np.random.choice(["male", "female", "trans"], size=n_samples, p=[0.49, 0.49, 0.02])
    
    # BMI normally distributed around 26.5, bounded between 16 and 45
    bmi = np.clip(np.round(np.random.normal(loc=26.5, scale=5.2, size=n_samples), 1), 16.0, 45.0)
    
    # Number of children (Poisson distribution, bounded 0 to 5)
    children = np.clip(np.random.poisson(lam=1.1, size=n_samples), 0, 5)
    
    # Smoker (approx 22% probability, higher among older/male)
    smoker_prob = 0.18 + (age > 40) * 0.06
    smoker = (np.random.rand(n_samples) < smoker_prob).astype(int)

    # 2. Clinical Condition Features (probabilities correlate realistically with age, BMI, and smoker)
    prob_diabetes = np.clip(0.06 + (age > 45) * 0.14 + (bmi > 28) * 0.15, 0.02, 0.60)
    diabetes = (np.random.rand(n_samples) < prob_diabetes).astype(int)

    prob_pressure = np.clip(0.08 + (age > 40) * 0.18 + (bmi > 27) * 0.12 + smoker * 0.08, 0.04, 0.65)
    pressure = (np.random.rand(n_samples) < prob_pressure).astype(int)

    prob_thyroid = np.clip(0.05 + (sex == "female") * 0.10 + (age > 35) * 0.05, 0.03, 0.35)
    thyroid = (np.random.rand(n_samples) < prob_thyroid).astype(int)

    prob_asthma = np.clip(0.05 + (smoker == 1) * 0.08, 0.03, 0.25)
    asthma = (np.random.rand(n_samples) < prob_asthma).astype(int)

    prob_other = 0.08
    other_disease = (np.random.rand(n_samples) < prob_other).astype(int)

    # 3. Preference Features
    preferences = np.random.choice(
        ["immediateFunds", "shortTermFunds", "longTermFunds"],
        size=n_samples,
        p=[0.32, 0.38, 0.30]
    )

    # 4. Target Assignments (Plan Classification, Premium Regression, Coverage Regression)
    recommended_plans = []
    annual_premiums = []
    coverage_lakhs = []

    for i in range(n_samples):
        a = age[i]
        b = bmi[i]
        c = children[i]
        s = smoker[i]
        dia = diabetes[i]
        bp = pressure[i]
        thy = thyroid[i]
        asth = asthma[i]
        oth = other_disease[i]
        pref = preferences[i]

        # Multi-class scoring
        score_icici = 0.0
        score_maxbupa = 0.0
        score_star = 0.0
        score_religare = 0.0
        score_hdfc = 0.0

        # ICICI Lombard: Ideal for young, healthy, low BMI, non-smoker
        if a < 35: score_icici += 4.5
        if s == 0: score_icici += 2.5
        if b < 25: score_icici += 3.0
        if dia == 0 and bp == 0: score_icici += 2.5

        # Max Bupa Heartbeat: Ideal for hypertension, cardiac risk, older smokers
        if bp == 1: score_maxbupa += 6.5
        if a > 40 and s == 1: score_maxbupa += 4.0
        if a > 50: score_maxbupa += 2.5
        if s == 1: score_maxbupa += 1.5

        # Star Health Diabetes Safe: Ideal for diabetes, thyroid, obesity
        if dia == 1: score_star += 7.5
        if thy == 1: score_star += 3.5
        if b >= 27.5: score_star += 3.0

        # Religare Care: Ideal for immediate funds / acute emergency hospitalization
        if pref == "immediateFunds": score_religare += 6.0
        if asth == 1: score_religare += 2.5
        if oth == 1: score_religare += 2.0

        # HDFC ERGO Optima Restore Family: Ideal for families with children, long term
        if c >= 1: score_hdfc += (3.5 + min(c, 3) * 1.5)
        if pref == "longTermFunds": score_hdfc += 3.0
        if 25 <= a <= 55: score_hdfc += 2.0

        scores = np.array([score_icici, score_maxbupa, score_star, score_religare, score_hdfc])
        scores += np.random.normal(0, 0.6, size=5)

        plan_names = [
            "ICICI Lombard Complete Health Insurance",
            "Max Bupa Heartbeat Health Insurance",
            "Star Health Diabetes Safe Insurance Policy",
            "Religare Care Health Insurance",
            "HDFC ERGO Optima Restore Family Plan"
        ]
        assigned_plan = plan_names[np.argmax(scores)]
        recommended_plans.append(assigned_plan)

        # 5. Actuarial Risk-Adjusted Premium Calculation (INR)
        base_prem = 7500.0
        age_prem = (a - 18) * 190.0
        bmi_prem = max(0, b - 25.0) * 380.0
        smoker_prem = s * 7800.0
        children_prem = c * 2400.0
        illness_prem = (dia * 4800.0) + (bp * 4200.0) + (thy * 2100.0) + (asth * 2600.0) + (oth * 1500.0)
        
        total_prem = base_prem + age_prem + bmi_prem + smoker_prem + children_prem + illness_prem
        total_prem += np.random.normal(0, 600.0)
        total_prem = round(max(8000.0, total_prem), -1)
        annual_premiums.append(total_prem)

        # 6. ML Target: Dynamic Optimal Coverage / Sum Insured (in Lakhs INR)
        # Calculated from risk profile and family dependencies
        cov = 5.0
        if c >= 1: cov += min(c, 3) * 2.5
        if a > 40: cov += 2.5
        if a > 55: cov += 2.5
        if bp == 1 or dia == 1: cov += 2.5
        if s == 1: cov += 1.5
        cov += np.random.normal(0, 0.5)
        # Snap to nearest 0.5 or 1.0 Lakh between 5.0 and 25.0 Lakhs
        cov = float(np.clip(round(cov * 2) / 2, 5.0, 25.0))
        coverage_lakhs.append(cov)

    df = pd.DataFrame({
        "age": age,
        "sex": sex,
        "bmi": bmi,
        "children": children,
        "smoker": smoker,
        "diabetes": diabetes,
        "pressure": pressure,
        "thyroid": thyroid,
        "asthma": asthma,
        "other_disease": other_disease,
        "preferences": preferences,
        "recommended_plan": recommended_plans,
        "annual_premium": annual_premiums,
        "coverage_lakh": coverage_lakhs
    })

    data_dir = config["dataset"].get("data_dir", "data")
    os.makedirs(data_dir, exist_ok=True)
    out_path = os.path.join(data_dir, config["dataset"].get("data_filename", "medicare_dataset.csv"))
    df.to_csv(out_path, index=False)
    print(f"[SUCCESS] Generated {len(df)} records saved to '{out_path}'.")
    print(f"Plan distribution:\n{df['recommended_plan'].value_counts(normalize=True).round(3)}")
    print(f"Premium stats (INR):\n{df['annual_premium'].describe().round(1)}")
    print(f"Coverage stats (Lakh INR):\n{df['coverage_lakh'].describe().round(1)}")

if __name__ == "__main__":
    cfg = load_config("config.yaml")
    generate_medicare_data(cfg)
