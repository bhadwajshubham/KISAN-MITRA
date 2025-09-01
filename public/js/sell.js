document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const sellForm = document.getElementById('sell-crop-form');
    const dropZone = document.getElementById('upload-drop-zone');
    const fileInput = document.getElementById('crop-photos');
    const previewContainer = document.getElementById('upload-preview-container');
    let uploadedFiles = [];

    // --- TOAST NOTIFICATION (from app.js if not already there) ---
    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };

    // --- FILE UPLOAD LOGIC ---
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    function handleFiles(files) {
        for (const file of files) {
            if (uploadedFiles.length < 4 && file.type.startsWith('image/')) {
                uploadedFiles.push(file);
            }
        }
        renderPreviews();
    }

    function renderPreviews() {
        previewContainer.innerHTML = '';
        uploadedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'preview-thumbnail';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button class="remove-btn" data-index="${index}">&times;</button>
                `;
                previewContainer.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    }

    previewContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const index = e.target.dataset.index;
            uploadedFiles.splice(index, 1);
            renderPreviews();
        }
    });

    // --- FORM SUBMISSION LOGIC ---
    sellForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const listingData = {
            cropType: document.getElementById('crop-type').value,
            quantity: document.getElementById('quantity').value,
            price: document.getElementById('expected-price').value,
            images: uploadedFiles.length
        };
        console.log('New Listing Submitted:', listingData);

        // Save to localStorage (simulation)
        let listings = JSON.parse(localStorage.getItem('cropListings')) || [];
        listings.unshift(listingData);
        localStorage.setItem('cropListings', JSON.stringify(listings));

        showToast('Your crop has been listed successfully!');
        sellForm.reset();
        uploadedFiles = [];
        renderPreviews();
    });

    // --- DYNAMIC MARKET PRICES (SIMULATED) ---
    function updateMarketPrices() {
        const basePrices = { wheat: 2150, rice: 2890, tomato: 1800 };
        document.querySelectorAll('.market-price-item').forEach(item => {
            const crop = item.dataset.crop;
            const priceEl = item.querySelector('strong');
            const changeEl = item.querySelector('.price-change');

            const basePrice = basePrices[crop];
            const fluctuation = (Math.random() - 0.5) * (basePrice * 0.05); // +/- 5% fluctuation
            const newPrice = Math.round(basePrice + fluctuation);
            const change = newPrice - basePrice;

            priceEl.textContent = `₹${newPrice.toLocaleString('en-IN')}`;
            
            if (change > 0) {
                changeEl.textContent = `+₹${change} (${(change/basePrice * 100).toFixed(1)}%)`;
                changeEl.className = 'price-change positive';
            } else {
                changeEl.textContent = `-₹${Math.abs(change)} (${(Math.abs(change)/basePrice * 100).toFixed(1)}%)`;
                changeEl.className = 'price-change negative';
            }
        });
    }

    // Update prices initially and then every 5 seconds
    updateMarketPrices();
    setInterval(updateMarketPrices, 5000);
});