// =================================================================
// ===== Consolidated File: app.js =====
// This file includes:
// 1. Navbar scroll effect and global functions (from main.js)
// 2. AOS animation initialization (from aos-init.js)
// 3. Geolocation for the "Recommend" page (from recommend.js)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar Scroll Effect and Global Functions ---
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- Impact Section Counter Animation ---
    const impactSection = document.getElementById('impact');
    if (impactSection) {
        const counters = document.querySelectorAll('.impact-number');
        const animateCounters = () => {
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                let current = 0;
                const increment = target / 200;

                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        if (target >= 50000) {
                            counter.innerText = Math.ceil(current / 1000) + 'K+';
                        } else {
                            counter.innerText = Math.ceil(current);
                        }
                        requestAnimationFrame(updateCounter);
                    } else {
                         if (target >= 50000) {
                            counter.innerText = (target / 1000) + 'K+';
                        } else {
                            counter.innerText = target;
                        }
                    }
                };
                updateCounter();
            });
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(impactSection);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(impactSection);
    }

    // --- Geolocation Logic for Recommend Page ---
    const locationButton = document.getElementById('current-location-btn');
    const stateSelect = document.getElementById('state');
    const districtSelect = document.getElementById('district');

    if (locationButton) {
        locationButton.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser.");
                return;
            }
            locationButton.disabled = true;
            locationButton.textContent = 'Locating...';
            navigator.geolocation.getCurrentPosition(success, error);
        });
    }

    async function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();

            if (data && data.address) {
                const state = data.address.state || '';
                const district = data.address.state_district || data.address.county || '';

                if (state) {
                    stateSelect.innerHTML = `<option value="${state}" selected>${state}</option>`;
                } else {
                     stateSelect.innerHTML = `<option selected>State not found</option>`;
                }
                if (district) {
                    districtSelect.innerHTML = `<option value="${district}" selected>${district}</option>`;
                } else {
                    districtSelect.innerHTML = `<option selected>District not found</option>`;
                }
            } else {
                alert('Could not determine your location. Please select it manually.');
            }
        } catch(e) {
             alert('Failed to fetch location data. Please select it manually.');
        } finally {
            locationButton.disabled = false;
            locationButton.textContent = '📍 Use Current Location';
        }
    }

    function error(err) {
        let message = "An unknown error occurred while getting your location.";
        if (err.code === 1) message = "You denied the request for Geolocation.";
        if (err.code === 2) message = "Location information is unavailable.";
        if (err.code === 3) message = "The request to get user location timed out.";
        alert(message);
        locationButton.disabled = false;
        locationButton.textContent = '📍 Use Current Location';
    }
});

// --- AOS Animation Initialization ---
// This can be outside DOMContentLoaded
AOS.init({
    duration: 800,
    once: true,
});

// --- Simple Demo Alert Function (Global) ---
function showDemo(feature) {
    alert(`This is a demo. The "${feature}" feature is not yet implemented.`);
}