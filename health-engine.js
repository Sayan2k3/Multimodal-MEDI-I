document.addEventListener('DOMContentLoaded', async () => {
    // Initial State
    let state = JSON.parse(localStorage.getItem('healthEngineState')) || {
        points: 0,
        streak: 0,
        level: 0,
        goalsCompleted: 0,
        lastDate: new Date().toLocaleDateString()
    };

    const trackerData = JSON.parse(localStorage.getItem('trackerFormData'));
    if (!trackerData) {
        window.location.href = "tracker-details.html";
        return;
    }

    const updateUI = () => {
        document.getElementById('user-points').innerText = `🪙 ${state.points} Coins`;
        document.getElementById('streak-count').innerText = state.streak;
        
        if (state.level === 0 && state.points >= 20) {
            state.level = 1;
            showPopup("🎉 Level 1 Unlocked!", "You're now a Fitness Novice!");
        }
        
        document.getElementById('health-level').innerText = `Lvl ${state.level}`;
        localStorage.setItem('healthEngineState', JSON.stringify(state));
        renderRewards();
    };

    const getPlanForUser = () => {
        const { activity, goal, sleep, stress } = trackerData;
        const sleepGoal = `${sleep} hours sleep`;
        
        // Case 1: Sedentary + Weight Loss + High Stress
        if (activity === 'sedentary' && goal === 'weightLoss' && stress === 'high') {
            return {
                title: "Personalized Health Plan 🚀",
                motivation: "Small steps every day will lead to big results—stay consistent!",
                daily: ["Walk at least 5,000 steps", "Drink 2L of water", "20 minutes light activity", sleepGoal],
                weekly: ["Complete 4 workout days", "Stay active on most days", "Limit junk food (3 days)"],
                monthly: ["Target 2kg weight loss", "15-day activity streak"]
            };
        }
        
        // Case 2: Moderate + Muscle Build
        if (activity === 'moderate' && goal === 'muscleGain') {
            return {
                title: "Personalized Fitness Plan 💪",
                motivation: "Consistency + strength = real progress.",
                daily: ["Aim for 8,000 steps", "30 mins workout", "High protein intake", sleepGoal],
                weekly: ["5 workout days", "3 strength sessions", "2 cardio sessions"],
                monthly: ["12 strength sessions", "20+ days consistency"]
            };
        }
        
        // Case 3: Highly Active + Longevity
        if (activity === 'active' && goal === 'longevity') {
            return {
                title: "Optimized Health Plan 🧠",
                motivation: "Long-term health is built through balance, not burnout.",
                daily: ["10,000 steps", "60 mins activity", "10 mins recovery/stretch", sleepGoal],
                weekly: ["6 training days", "1 dedicated recovery day"],
                monthly: ["Active for 25+ days", "Maintain health score > 80"]
            };
        }

        // Default Template
        return {
            title: "Your Personalized Plan 🚀",
            motivation: "Keep pushing towards your health goals!",
            daily: ["Walk 7,000 steps", "Light workout", sleepGoal],
            weekly: ["3 active days", "Healthy eating"],
            monthly: ["Maintain consistency", "Improve energy levels"]
        };
    };

    const renderAllGoals = () => {
        const plan = getPlanForUser();
        
        // Update Dashboard Coach
        document.getElementById('coach-message').innerText = `"${plan.motivation}"`;

        renderSection('daily-goals', plan.daily, 10);
        renderSection('weekly-goals', plan.weekly, 50);
        renderSection('monthly-goals', plan.monthly, 200);
        // Static Yearly for all
        renderSection('yearly-goals', ["Complete a Marathon or 10k Run", "Master a new sport or skill", "Annual health check-up"], 1000);
    };

    const renderSection = (id, goals, points) => {
        const container = document.getElementById(id);
        container.innerHTML = '';
        goals.forEach((goal, i) => {
            container.appendChild(createGoalElement({
                id: `${id}-${i}`,
                title: goal,
                desc: `Earn ${points} coins`,
                points: points
            }));
        });
    };

    const createGoalElement = (goal) => {
        const div = document.createElement('div');
        div.className = 'goal-item';
        div.innerHTML = `
            <div class="goal-info">
                <h4>${goal.title}</h4>
                <p>${goal.desc}</p>
            </div>
            <div class="goal-check" onclick="completeGoal('${goal.id}', ${goal.points}, this)">
                ✓
            </div>
        `;
        return div;
    };

    const encouragements = ["Amazing Work!", "Well Done!", "Keep it up!", "You're a rockstar!", "Fantastic!"];

    window.completeGoal = (id, points, el) => {
        if (el.classList.contains('done')) return;
        
        el.classList.add('done');
        state.points += points;
        state.goalsCompleted += 1;
        
        const randomEnc = encouragements[Math.floor(Math.random() * encouragements.length)];
        showPopup(randomEnc, `You earned ${points} Medi-Coins!`);
        
        updateUI();
    };

    const showPopup = (title, text) => {
        const popup = document.getElementById('congrats-popup');
        popup.querySelector('h2').innerText = title;
        document.getElementById('popup-text').innerText = text;
        popup.classList.remove('popup-hidden');
        setTimeout(() => popup.classList.add('popup-hidden'), 3500);
    };

    const renderRewards = () => {
        const rewards = [
            { title: 'Fitness Master Badge', req: 'Lvl 1', icon: '🏆', locked: state.level < 1 },
            { title: 'Exclusive Nutrition Guide', req: '500 Coins', icon: '📖', locked: state.points < 500 },
            { title: 'Personal Coach Call', req: 'Lvl 5', icon: '📞', locked: state.level < 5 }
        ];
        const list = document.getElementById('reward-list');
        list.innerHTML = '';
        rewards.forEach(r => {
            list.innerHTML += `
                <div class="reward-card ${r.locked ? 'locked' : ''}">
                    <div class="reward-icon">${r.icon}</div>
                    <div>
                        <h4>${r.title}</h4>
                        <p>${r.locked ? 'Requires ' + r.req : 'UNLOCKED'}</p>
                    </div>
                </div>
            `;
        });
    };

    document.querySelector('.close-popup').onclick = () => {
        document.getElementById('congrats-popup').classList.add('popup-hidden');
    };

    updateUI();
    renderAllGoals();
});
