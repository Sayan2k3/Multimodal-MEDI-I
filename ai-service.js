async function callGemini(prompt) {
    const API_KEY = "AIzaSyDaBpySaFoh3kQN98_YnZ-byR96eXlMCXk";
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Export for use in other scripts
window.callGemini = callGemini;
