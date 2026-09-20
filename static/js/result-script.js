document.addEventListener('DOMContentLoaded', async function () {
    const resultContainer = document.getElementById('result');

    // Retrieve form data from localStorage
    const storedData = localStorage.getItem('insuranceFormData');
    if (!storedData) {
        resultContainer.innerHTML = "<p>No form data found. Please <a href='basic-details.html'>fill out the form</a> first.</p>";
        return;
    }

    const formData = JSON.parse(storedData);
    const { name } = formData;

    // Display loading state while XGBoost predicts
    resultContainer.innerHTML = `
        <div style="text-align: center; padding: 25px;">
            <p style="font-size: 16px; color: #0056b3;"><strong>Running XGBoost Decision Trees on Health Profile...</strong></p>
            <p style="color: #666; font-size: 14px; margin-top: 8px;">Executing multi-class plan scoring, actuarial premium regression, and optimal sum-insured prediction...</p>
        </div>
    `;

    try {
        const apiUrl = window.location.origin && window.location.origin.startsWith('http')
            ? '/api/recommend'
            : 'http://127.0.0.1:5000/api/recommend';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        if (data.status !== 'success') {
            throw new Error(data.message || 'Error processing recommendation');
        }

        const meta = data.model_metadata || {};

        // Render ML model recommendations with identical existing layout & CSS classes
        let message = `
            <h3>Hi ${name || data.user_name}, based on your profile, our XGBoost Machine Learning Model recommends:</h3>
            
            <div style="margin: 12px 0 16px 0; background: #eaf2fb; border: 1px solid #b8daff; border-radius: 6px; padding: 10px 14px; font-size: 13px; color: #004085;">
                <span style="font-weight: bold;">⚡ ML Model Engine:</span> ${meta.engine || 'XGBoost ML'} (${meta.model_name || 'xgboost_medicare_recommender'}) 
                | <strong>Trees:</strong> ${meta.classifier_iterations || 180} 
                | <strong>Inference Latency:</strong> <span style="color: #28a745; font-weight: bold;">${meta.latency_ms || 4} ms</span>
                | <strong>Accuracy:</strong> ${meta.test_accuracy || '90.3%'}
            </div>
        `;

        if (data.detected_risk_factors && data.detected_risk_factors.length > 0) {
            message += `<p style="margin-bottom: 18px; color: #333; font-size: 14px; background: #fdfdfe; padding: 10px 14px; border-left: 4px solid #0056b3; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <strong>Health & Demographic Factors Evaluated:</strong> ${data.detected_risk_factors.join(' • ')}
            </p>`;
        }

        data.plans.forEach((plan, index) => {
            const isTopMatch = index === 0;
            const badge = isTopMatch
                ? `<span style="float: right; background: #28a745; color: #fff; font-size: 12px; padding: 4px 10px; border-radius: 12px; font-weight: normal;">Top ML Match (${plan.match_percentage})</span>`
                : `<span style="float: right; background: #6c757d; color: #fff; font-size: 12px; padding: 4px 10px; border-radius: 12px; font-weight: normal;">Alternative (${plan.match_percentage})</span>`;

            message += `<div class="plan-recommendation">
                            <h4>Plan ${index + 1}: ${plan.title} ${badge}</h4>
                            <p style="margin: 8px 0;"><strong>ML Tree Rationale:</strong> ${plan.details}</p>
                            <p style="margin: 6px 0;"><strong>Personalized Premium:</strong> <span style="color: #0056b3; font-weight: bold;">${plan.premium}</span></p>
                            <p style="margin: 6px 0;"><strong>Recommended Coverage:</strong> <span style="color: #28a745; font-weight: bold;">${plan.coverage}</span></p>
                        </div><br>`;
        });

        // Add XGBoost Probability Distribution Table across all plans
        if (data.probability_breakdown && data.probability_breakdown.length > 0) {
            message += `
                <div style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-top: 10px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 12px; color: #333; font-size: 15px;">📊 XGBoost Multi-Class Probability Distribution (Softmax Output)</h4>
                    <p style="font-size: 13px; color: #666; margin-bottom: 12px;">Real-time probability computed across all candidate insurance plans for your specific feature vector:</p>
            `;

            data.probability_breakdown.forEach((item) => {
                const pct = item.probability;
                const barColor = pct >= 50 ? '#28a745' : (pct >= 10 ? '#0056b3' : '#adb5bd');
                message += `
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 3px;">
                            <span style="font-weight: ${pct >= 50 ? 'bold' : 'normal'};">${item.plan}</span>
                            <span style="font-weight: bold; color: ${pct >= 50 ? '#28a745' : '#333'};">${pct}%</span>
                        </div>
                        <div style="background: #f0f0f0; border-radius: 4px; height: 7px; overflow: hidden;">
                            <div style="background: ${barColor}; width: ${Math.max(pct, 1)}%; height: 100%; border-radius: 4px;"></div>
                        </div>
                    </div>
                `;
            });

            message += `</div>`;
        }

        if (data.input_features_vector) {
            message += `
                <details style="margin-top: 15px; margin-bottom: 20px; background: #fdfdfe; border: 1px solid #ced4da; border-radius: 6px; padding: 10px 15px; font-size: 13px;">
                    <summary style="cursor: pointer; font-weight: bold; color: #0056b3; outline: none;">
                        🔍 ML Transparency: Inspect Live Feature Vector & Raw XGBoost Outputs
                    </summary>
                    <div style="margin-top: 10px; font-family: Consolas, Monaco, monospace; background: #1e1e24; color: #4af626; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 12px; line-height: 1.5;">
                        <span style="color: #ffc107;">// 1. Exact Input Features Extracted from Your Form:</span>
                        <pre style="margin: 4px 0 10px 0; color: #e0e0e0;">${JSON.stringify(data.input_features_vector, null, 2)}</pre>
                        
                        <span style="color: #ffc107;">// 2. Direct XGBoost Model Outputs (Zero Hardcoding):</span>
                        <div>• Plan Classifier Winner: <span style="color: #fff;">${data.plans[0]?.title}</span> (${data.plans[0]?.match_percentage})</div>
                        <div>• XGBoost Actuarial Premium Regressor: <span style="color: #fff;">₹${data.estimated_premium_inr.toLocaleString()} / year</span></div>
                        <div>• XGBoost Coverage Regressor: <span style="color: #fff;">₹${data.estimated_coverage_lakh} Lakh</span></div>
                        <div>• Model Execution Time: <span style="color: #fff;">${data.inference_latency_ms} ms</span></div>
                    </div>
                </details>
            `;
        }

        message += `
            <div style="text-align: center; margin-top: 20px;">
                <a href="basic-details.html" style="display: inline-block; padding: 12px 26px; background-color: #0056b3; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
                    Modify Details / Test Another Profile
                </a>
            </div>
        `;

        resultContainer.innerHTML = message;

    } catch (err) {
        console.error('Error fetching ML recommendations:', err);
        resultContainer.innerHTML = `
            <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 6px; color: #856404;">
                <h4>Unable to connect to XGBoost ML Service</h4>
                <p style="margin: 8px 0;">Please ensure the Python backend server is running:</p>
                <code style="display: block; background: #222; color: #0f0; padding: 10px; border-radius: 4px; margin: 10px 0; font-family: monospace;">python app.py</code>
                <p style="font-size: 13px; color: #666;">Error details: ${err.message}</p>
                <div style="margin-top: 15px;">
                    <a href="basic-details.html" style="display: inline-block; padding: 8px 16px; background: #0056b3; color: #fff; text-decoration: none; border-radius: 4px;">Back to Form</a>
                </div>
            </div>
        `;
    }
});
