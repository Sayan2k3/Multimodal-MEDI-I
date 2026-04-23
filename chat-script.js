document.getElementById('sendButton').addEventListener('click', function () {
    const userInput = document.getElementById('userInput').value;
    const messagesContainer = document.querySelector('.messages');

    // Display user message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.textContent = userInput;
    messagesContainer.appendChild(userMessage);

    // Process user input
    const botResponse = getBotResponse(userInput);

    // Display bot response
    const botMessage = document.createElement('div');
    botMessage.className = 'message bot';
    botMessage.innerHTML = botResponse; // Using innerHTML to allow for formatted content
    messagesContainer.appendChild(botMessage);

    // Clear input
    document.getElementById('userInput').value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
});

// Function to get bot response based on user input
function getBotResponse(input) {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("star health diabetes safe insurance policy")) {
        return getStarHealthDiabetesInfo();
    } else if (lowerInput.includes("religare care health insurance")) {
        return getReligareCareInfo();
    } else if (lowerInput.includes("compare star health and religare care")) {
        return compareStarHealthAndReligare();
    } else if (lowerInput.includes("help") || lowerInput.includes("insurance")) {
        return "I'm here to help! Please ask about specific insurance policies or coverage.";
    } else if (lowerInput.includes("hospital") || lowerInput.includes("doctor") || lowerInput.includes("medicine") || lowerInput.includes("treatment")) {
        return getGeneralMedicalAdvice();
    } else {
        return getGenericMedicalResponse();
    }
}

// Function to get general medical advice
function getGeneralMedicalAdvice() {
    return `
        <div>
            <h3>General Medical Advice</h3>
            <p>It's always important to seek medical attention when experiencing unusual symptoms. Here's some general advice:</p>
            <ul>
                <li>Stay hydrated and eat a balanced diet to maintain overall health.</li>
                <li>Exercise regularly to boost your immune system and mental well-being.</li>
                <li>Consult a doctor for any persistent symptoms, and never self-medicate without proper guidance.</li>
                <li>Ensure you're up to date on vaccinations and preventive screenings.</li>
            </ul>
            <p>If you need specific information about a particular treatment, hospital, or doctor, please ask!</p>
        </div>
    `;
}

// Function for a generic medical response
function getGenericMedicalResponse() {
    return `
        <div>
            <h3>I'm here to assist you with health-related information!</h3>
            <p>You can ask about:</p>
            <ul>
                <li>Health insurance policies</li>
                <li>Comparing different insurance plans</li>
                <li>General health tips</li>
                <li>Information about hospitals or doctors</li>
            </ul>
            <p>Please ask about any specific topic you're interested in.</p>
        </div>
    `;
}

// Function to compare Star Health and Religare Care
function compareStarHealthAndReligare() {
    return `
        <div>
            <h3>Comparison: Star Health vs. Religare Care</h3>
            <table border="1">
                <tr>
                    <th>Feature</th>
                    <th>Star Health Diabetes Safe</th>
                    <th>Religare Care</th>
                </tr>
                <tr>
                    <td>Specialization</td>
                    <td>Diabetes-related coverage</td>
                    <td>General health coverage</td>
                </tr>
                <tr>
                    <td>Sum Insured</td>
                    <td>Up to ₹1 Crore</td>
                    <td>Up to ₹6 Crore</td>
                </tr>
                <tr>
                    <td>Age Limit</td>
                    <td>18-65 years</td>
                    <td>No age limit</td>
                </tr>
                <tr>
                    <td>Waiting Period</td>
                    <td>1-4 years for pre-existing diseases</td>
                    <td>30 days for accidents</td>
                </tr>
                <tr>
                    <td>Annual Check-ups</td>
                    <td>Yes</td>
                    <td>Yes</td>
                </tr>
            </table>
        </div>
    `;
}
