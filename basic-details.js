document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('basicDetailsForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Form submitted, processing data...");

        // Get values with safe checking
        const nameInput = document.getElementById('name');
        const ageInput = document.getElementById('age');
        const sexInput = document.getElementById('sex');
        const bmiInput = document.getElementById('bmi');
        const childrenInput = document.getElementById('children');
        const smokerInput = document.getElementById('smoker');
        const preferencesInput = document.getElementById('preferences');

        if (!nameInput || !ageInput || !sexInput || !bmiInput || !childrenInput || !smokerInput || !preferencesInput) {
            console.error("Critical Error: One or more form fields are missing from the DOM.");
            alert("Application Error: Form fields not found. Please refresh the page.");
            return;
        }

        const name = nameInput.value;
        const age = ageInput.value;
        const sex = sexInput.value;
        const bmi = bmiInput.value;
        const children = childrenInput.value;
        const smoker = smokerInput.value;
        const preferences = preferencesInput.value;

        // Collect health issues
        let healthIssues = [];
        const diseaseCheckboxes = document.querySelectorAll('input[name="disease"]:checked');
        diseaseCheckboxes.forEach((checkbox) => {
            healthIssues.push(checkbox.value);
        });

        // Store form data
        const formData = {
            name,
            age,
            sex,
            bmi,
            children,
            smoker,
            healthIssues,
            preferences
        };

        localStorage.setItem('insuranceFormData', JSON.stringify(formData));
        localStorage.setItem('isExistingUser', 'true');
        localStorage.setItem('userName', name);

        console.log("Data saved, redirecting...");
        window.location.href = 'result.html';
    });
});
