import json
from app import app

def test_inference():
    client = app.test_client()

    # Test Case 1: Young, healthy, low BMI, non-smoker
    payload1 = {
        "name": "Arjun",
        "age": 24,
        "sex": "male",
        "bmi": 21.5,
        "children": 0,
        "smoker": "no",
        "healthIssues": [],
        "preferences": "shortTermFunds"
    }

    res1 = client.post("/api/recommend", data=json.dumps(payload1), content_type="application/json")
    assert res1.status_code == 200, f"Expected 200, got {res1.status_code}"
    data1 = res1.get_json()
    print("[TEST 1 PASSED] Young healthy profile:")
    print(f"  User: {data1['user_name']}")
    print(f"  Top Plan: {data1['plans'][0]['title']} ({data1['plans'][0]['match_percentage']} match)")
    print(f"  Premium: {data1['plans'][0]['premium'].replace(chr(8377), 'INR ')}")

    # Test Case 2: 52 yr old with hypertension and smoker
    payload2 = {
        "name": "Sunita",
        "age": 52,
        "sex": "female",
        "bmi": 28.0,
        "children": 1,
        "smoker": "yes",
        "healthIssues": ["pressure"],
        "preferences": "longTermFunds"
    }
    res2 = client.post("/api/recommend", data=json.dumps(payload2), content_type="application/json")
    assert res2.status_code == 200
    data2 = res2.get_json()
    print("\n[TEST 2 PASSED] Senior with hypertension & smoker profile:")
    print(f"  User: {data2['user_name']}")
    print(f"  Top Plan: {data2['plans'][0]['title']} ({data2['plans'][0]['match_percentage']} match)")
    print(f"  Premium: {data2['plans'][0]['premium'].replace(chr(8377), 'INR ')}")
    print(f"  Risk Factors: {data2['detected_risk_factors']}")

    # Test Case 3: Diabetes profile
    payload3 = {
        "name": "Rohan",
        "age": 42,
        "sex": "male",
        "bmi": 29.5,
        "children": 2,
        "smoker": "no",
        "healthIssues": ["diabetes"],
        "preferences": "longTermFunds"
    }
    res3 = client.post("/api/recommend", data=json.dumps(payload3), content_type="application/json")
    assert res3.status_code == 200
    data3 = res3.get_json()
    print("\n[TEST 3 PASSED] Diabetic profile:")
    print(f"  User: {data3['user_name']}")
    print(f"  Top Plan: {data3['plans'][0]['title']} ({data3['plans'][0]['match_percentage']} match)")
    print(f"  Premium: {data3['plans'][0]['premium'].replace(chr(8377), 'INR ')}")

    # Test Case 4: Model info endpoint
    res4 = client.get("/api/model-info")
    assert res4.status_code == 200
    info = res4.get_json()
    print("\n[TEST 4 PASSED] Model Info API:")
    print(f"  Model Name: {info['model_name']}")
    print(f"  Iterations: {info['iterations_n_estimators']}")
    print(f"  Accuracy: {info['accuracy']}")

if __name__ == "__main__":
    test_inference()
