document.getElementById('basicDetailsForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get values from the form
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const sex = document.getElementById('sex').value;
    const bmi = document.getElementById('bmi').value;
    const children = document.getElementById('children').value;
    const smoker = document.querySelector('input[name="smoker"]:checked').value;
    const preferences = document.getElementById('preferences').value;

    // Collect all health issues
    let healthIssues = [];
    const diseaseCheckboxes = document.querySelectorAll('input[name="disease"]:checked');
    diseaseCheckboxes.forEach((checkbox) => {
        healthIssues.push(checkbox.value);
    });

    const otherDiseaseElem = document.getElementById('otherDiseaseInput');
    const otherDisease = otherDiseaseElem ? otherDiseaseElem.value : '';

    // Store form data in localStorage
    const formData = {
        name,
        age,
        sex,
        bmi,
        children,
        smoker,
        healthIssues,
        otherDisease,
        preferences
    };
    localStorage.setItem('insuranceFormData', JSON.stringify(formData));

    // Redirect to the result page
    window.location.href = '/result';
});
