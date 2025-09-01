document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recommend-form');
    const resultsArea = document.getElementById('recommend-results-area');
    const getRecommendBtn = document.getElementById('get-recommend-btn');

    // Populate dropdowns (States, Months)
    populateStates();
    populateMonths();

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit();
        });
    }

    async function handleFormSubmit() {
        // 1. Show loading state
        getRecommendBtn.disabled = true;
        getRecommendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        resultsArea.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center;">Our AI is analyzing your farm data...</p>';

        // 2. Gather form data
        const formData = {
            state: document.getElementById('state').value,
            district: document.getElementById('district').value,
            soil: document.querySelector('input[name="soil"]:checked')?.value,
            farmSize: document.getElementById('farm-size').value,
            water: document.getElementById('water').value,
            month: document.getElementById('planting-month').value,
            budget: document.getElementById('budget').value,
        };

        // 3. Basic Validation
        if (!formData.state || !formData.district || !formData.soil || !formData.month) {
            alert('Please fill all the required fields (*).');
            resetButton();
            return;
        }

        // 4. Simulate AI API Call
        try {
            const recommendations = await getAIRecommendations(formData);
            renderResults(recommendations);
        } catch (error) {
            resultsArea.innerHTML = `<p style="color:red;">Error: Could not get recommendations. Please try again later.</p>`;
        } finally {
            resetButton();
        }
    }

    function resetButton() {
        getRecommendBtn.disabled = false;
        getRecommendBtn.innerHTML = '<i class="fas fa-leaf"></i> Get Recommendations';
    }

    // This is a SIMULATED function. In a real app, this would make a fetch call to your backend/AI API.
    function getAIRecommendations(data) {
        console.log("Sending data to AI:", data);
        return new Promise(resolve => {
            setTimeout(() => {
                const mockResponse = `
### Top 3 Crop Recommendations for ${data.district}, ${data.state}

Here are the best crops for your ${data.soil} soil and ${data.water} water availability, planting in ${data.month}.

---

**1. Premium Basmati Rice (Pusa Basmati 1121)**

* **Why it's a good fit:** Your region is ideal for Basmati. With ${data.water} water, you can achieve high yields. There's a huge export market.
* **Potential Yield:** 20-24 quintals/acre.
* **Market Demand:** Very High (Domestic & International).
* **Required Budget:** Fits within your ${data.budget} budget.
* **Planting Advice:** Ensure proper water management during the flowering stage.

---

**2. Soybean (JS 20-34 Variety)**

* **Why it's a good fit:** Excellent choice for ${data.soil} soil. It's a nitrogen-fixing crop, which will improve your soil health for the next season.
* **Potential Yield:** 10-12 quintals/acre.
* **Market Demand:** High (Used for oil and animal feed).
* **Required Budget:** Low investment required.
* **Planting Advice:** Use a seed drill for uniform sowing and better germination.

---

**3. Marigold (Pusa Narangi Gainda)**

* **Why it's a good fit:** A great cash crop if you are near a city. Festivals in the coming months will drive up demand. Less water intensive.
* **Potential Yield:** 6-8 tonnes of flowers/acre.
* **Market Demand:** High (Especially during festival season).
* **Required Budget:** Very Low.
* **Planting Advice:** Pinch the plant tops after 30-40 days for bushier growth and more flowers.
                `;
                resolve(mockResponse);
            }, 2500); // Simulate 2.5 second network delay
        });
    }

    function renderResults(markdown) {
        // Simple Markdown to HTML converter
        let html = markdown
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/---/g, '<hr>')
            .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
            .replace(/\* (.*)/g, '<li>$1</li>');
        
        // Wrap list items in <ul>
        html = html.replace(/<li>/g, '<ul><li>').replace(/<\/li>/g, '</li></ul>').replace(/<\/ul>\n<ul>/g, '');

        resultsArea.innerHTML = `<div class="recommendation-content">${html}</div>`;
    }

    // Helper functions to populate dropdowns
    function populateStates() {
        const states = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
        const select = document.getElementById('state');
        states.forEach(state => select.innerHTML += `<option value="${state}">${state}</option>`);
    }

    function populateMonths() {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const select = document.getElementById('planting-month');
        months.forEach(month => select.innerHTML += `<option value="${month}">${month}</option>`);
    }
});