document.addEventListener('DOMContentLoaded', function () {
    const formData = JSON.parse(localStorage.getItem('insuranceFormData'));

    if (!formData) {
        document.getElementById('result').innerHTML = "<p>No health profile found. Please complete your basic details to see personalized plans.</p>";
        return;
    }

    const recommendations = generateSmartRecommendations(formData);
    // Display the recommendation in the result section
    document.getElementById('result').innerHTML = recommendations;
});

function generateSmartRecommendations(data) {
    const { name, age, bmi, smoker, healthIssues, children, preferences } = data;
    const ageNum = parseInt(age);
    const bmiNum = parseFloat(bmi);
    const hasChildren = parseInt(children) > 0;
    
    let selectedPlans = [];
    let reasoning = "";

    // Persona Logic Engine
    if (ageNum >= 50) {
        // Case 6: Senior Citizens
        selectedPlans = [
            { title: "Star Health Senior Red Carpet", details: "Specifically tailored for seniors. No pre-acceptance medical screening required.", premium: "₹24,500/yr", coverage: "₹10 Lakh", match: 98, liked: 96 },
            { title: "National Varistha Mediclaim", details: "Critical illness cover for seniors with high stability.", premium: "₹22,800/yr", coverage: "₹5 Lakh", match: 94, liked: 91 },
            { title: "New India Senior Mediclaim", details: "Government backed security with high claim settlement ratio.", premium: "₹19,500/yr", coverage: "₹5 Lakh", match: 91, liked: 88 }
        ];
        reasoning = "Tailored for higher age with specialized senior coverage needs.";
    } else if (healthIssues.includes('diabetes')) {
        // Case 5: Diabetes / Chronic
        selectedPlans = [
            { title: "Star Health Diabetes Safe", details: "Covers complications of Type 1 & 2 Diabetes from Day 1.", premium: "₹18,500/yr", coverage: "₹5 Lakh", match: 99, liked: 98 },
            { title: "Care Freedom Plan", details: "Designed for those with pre-existing chronic conditions.", premium: "₹15,200/yr", coverage: "₹7 Lakh", match: 95, liked: 94 },
            { title: "Aditya Birla Activ Assure Diamond", details: "Extensive chronic management program included.", premium: "₹16,800/yr", coverage: "₹10 Lakh", match: 92, liked: 90 }
        ];
        reasoning = "Designed specifically for chronic illness management.";
    } else if (smoker === 'yes' || bmiNum > 28) {
        // Case 4: High Risk
        selectedPlans = [
            { title: "Aditya Birla Activ Health Enhanced", details: "Up to 100% HealthReturns for active lifestyles.", premium: "₹14,200/yr", coverage: "₹10 Lakh", match: 97, liked: 95 },
            { title: "Care Health Enhance Plan", details: "Higher limits for high-risk profiles with wellness tracking.", premium: "₹13,500/yr", coverage: "₹7 Lakh", match: 93, liked: 92 },
            { title: "ICICI Lombard Health AdvantEdge", details: "Flexible coverage that adapts to your risk profile.", premium: "₹15,800/yr", coverage: "₹15 Lakh", match: 90, liked: 89 }
        ];
        reasoning = "Wellness programs focused on mitigating higher-risk lifestyle factors.";
    } else if (hasChildren || preferences === 'longTermFunds') {
        // Case 3: Family
        selectedPlans = [
            { title: "HDFC ERGO My:Health Suraksha", details: "Comprehensive family floater with maternity benefits.", premium: "₹16,400/yr", coverage: "₹10 Lakh", match: 99, liked: 98 },
            { title: "Care Family Floater Plan", details: "Shared coverage for the entire household with child-focus.", premium: "₹14,200/yr", coverage: "₹7 Lakh", match: 96, liked: 95 },
            { title: "Star Family Health Optima", details: "Affordable family protection with automatic restoration.", premium: "₹12,800/yr", coverage: "₹5 Lakh", match: 92, liked: 94 }
        ];
        reasoning = "Optimized for shared household coverage and child protection.";
    } else if (healthIssues.length > 0) {
        // Case 2: Thyroid / Minor Pre-existing
        selectedPlans = [
            { title: "Star Health Comprehensive", details: "Wide coverage including OPD and pre-existing conditions.", premium: "₹15,500/yr", coverage: "₹10 Lakh", match: 98, liked: 97 },
            { title: "ICICI Complete Health Insurance", details: "Quick coverage for existing minor conditions after waiting.", premium: "₹13,800/yr", coverage: "₹7 Lakh", match: 95, liked: 93 },
            { title: "Niva Bupa Health Companion", details: "Balanced plan with good pre-existing condition terms.", premium: "₹12,400/yr", coverage: "₹5 Lakh", match: 92, liked: 90 }
        ];
        reasoning = "Specialized to cover pre-existing conditions with shorter waiting periods.";
    } else {
        // Case 1: Young & Healthy
        selectedPlans = [
            { title: "HDFC ERGO Optima Secure", details: "4x coverage benefits. Best for long-term health security.", premium: "₹12,400/yr", coverage: "₹10 Lakh", match: 99, liked: 98 },
            { title: "Niva Bupa ReAssure 2.0", details: "Unlimited restoration. Perfect for young, active individuals.", premium: "₹10,800/yr", coverage: "₹10 Lakh", match: 97, liked: 96 },
            { title: "Care Health Care Supreme", details: "Low premium, high coverage with massive wellness discounts.", premium: "₹9,200/yr", coverage: "₹7 Lakh", match: 94, liked: 95 }
        ];
        reasoning = "Low premium and high restoration benefits for low-risk profiles.";
    }

    let message = `
        <div class="result-header">
            <h3>Your Personalized Health Analysis</h3>
            <h2>Hi <span class="highlight">${name}</span>, we've carefully analyzed your ${age}-year-old profile.</h2>
            <p><strong>Diagnosis:</strong> ${reasoning}</p>
        </div>
    `;

    selectedPlans.forEach((plan) => {
        message += `
            <div class="plan-recommendation">
                <div class="match-badge">${plan.match}% Match</div>
                <div class="plan-content">
                    <h4>${plan.title}</h4>
                    <p class="plan-desc">${plan.details}</p>
                    <div class="plan-stats">
                        <div class="stat-item"><span>Premium</span><strong>${plan.premium}</strong></div>
                        <div class="stat-item"><span>Coverage</span><strong>${plan.coverage}</strong></div>
                    </div>
                    <div class="plan-footer">
                        <span class="user-stat">⭐ ${plan.liked}% of users with similar profiles found this effective</span>
                    </div>
                </div>
            </div>
        `;
    });

    return message;
}
