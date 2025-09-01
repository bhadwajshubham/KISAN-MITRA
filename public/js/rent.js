document.addEventListener('DOMContentLoaded', () => {
    // --- UTILITY FUNCTIONS ---
    const generateUniqueId = () => 'id-' + Math.random().toString(36).substr(2, 9);
    
    const getOrCreateUserId = () => {
        let userId = localStorage.getItem('kisan_mitra_user_id');
        if (!userId) {
            userId = 'user-' + Math.random().toString(36).substr(2, 6);
            localStorage.setItem('kisan_mitra_user_id', userId);
        }
        return userId;
    };

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
    
    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
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

    // --- DOM ELEMENTS ---
    const currentUserId = getOrCreateUserId();
    document.getElementById('userIdDisplay').textContent = currentUserId;

    const listItemBtn = document.getElementById('list-item-btn');
    const listItemModal = document.getElementById('listItemModal');
    const rentItemModal = document.getElementById('rentItemModal');
    const listItemForm = document.getElementById('listItemForm');
    const rentItemForm = document.getElementById('rentItemForm');
    const imagePreview = document.getElementById('imagePreview');
    const listingsGrid = document.getElementById('listings-grid');

    // --- MODAL HANDLING ---
    const openModal = (modal) => modal.classList.remove('hidden');
    const closeModal = (modal) => {
        modal.classList.add('hidden');
        modal.querySelectorAll('form').forEach(form => form.reset());
        imagePreview.classList.add('hidden');
    };
    
    listItemBtn.addEventListener('click', () => openModal(listItemModal));
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(listItemModal);
            closeModal(rentItemModal);
        });
    });

    // --- FORM HANDLING & LOGIC ---
    listItemForm.querySelector('#itemImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            imagePreview.src = URL.createObjectURL(file);
            imagePreview.classList.remove('hidden');
        }
    });

    listItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(listItemForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const imageFile = data.itemImage;
            const imageUrl = await fileToBase64(imageFile);

            const newListing = {
                id: generateUniqueId(),
                ownerId: currentUserId,
                name: data.itemName,
                description: data.description,
                price: parseFloat(data.pricePerDay),
                location: data.location,
                image: imageUrl,
            };
            
            saveListing(newListing);
            showToast('Item listed successfully!');
            closeModal(listItemModal);
            loadListings();
        } catch (error) {
            showToast('Failed to process image. Please try again.', 'error');
        }
    });
    
    rentItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Here you would handle the rental request logic, e.g., saving it to localStorage
        showToast('Rental request sent successfully!');
        closeModal(rentItemModal);
    });

    // --- DYNAMIC PRICE CALCULATION ---
    const startDateInput = document.getElementById('rentalStartDate');
    const endDateInput = document.getElementById('rentalEndDate');
    const totalPriceSpan = document.getElementById('calculatedTotalPrice');
    
    function calculatePrice() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        const pricePerDay = parseFloat(document.getElementById('rentModalPricePerDay').value);
        
        if (startDate && endDate && endDate > startDate && pricePerDay) {
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalPriceSpan.textContent = `₹${(diffDays * pricePerDay).toFixed(2)}`;
        } else {
            totalPriceSpan.textContent = '₹0';
        }
    }
    startDateInput.addEventListener('change', calculatePrice);
    endDateInput.addEventListener('change', calculatePrice);

    // --- LOCALSTORAGE & RENDERING ---
    const getListings = () => JSON.parse(localStorage.getItem('rentalListings')) || [];
    const saveListing = (listing) => {
        const listings = getListings();
        listings.unshift(listing);
        localStorage.setItem('rentalListings', JSON.stringify(listings));
    };

    function loadListings() {
        document.getElementById('loading-listings').classList.remove('hidden');
        listingsGrid.innerHTML = '';

        setTimeout(() => { // Simulate network delay
            const listings = getListings();
            document.getElementById('loading-listings').classList.add('hidden');
            
            if (listings.length === 0) {
                document.getElementById('no-listings-found').classList.remove('hidden');
            } else {
                document.getElementById('no-listings-found').classList.add('hidden');
                listings.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'card listing-card';
                    card.innerHTML = `
                        <img src="${item.image}" alt="${item.name}" class="listing-card-img">
                        <div class="listing-card-content">
                            <h3 class="heading-3">${item.name}</h3>
                            <p class="listing-card-location"><i class="fas fa-map-marker-alt"></i> ${item.location}</p>
                            <p class="listing-card-description">${item.description}</p>
                            <div class="listing-card-footer">
                                <span class="listing-card-price">₹${item.price.toFixed(2)}/day</span>
                                <button class="btn btn-secondary rent-now-btn">Rent Now</button>
                            </div>
                        </div>
                    `;
                    card.querySelector('.rent-now-btn').addEventListener('click', () => {
                        document.getElementById('rentModalItemName').textContent = `Rent: ${item.name}`;
                        document.getElementById('rentModalPricePerDay').value = item.price;
                        openModal(rentItemModal);
                    });
                    listingsGrid.appendChild(card);
                });
            }
        }, 500);
    }
    
    // Initial Load
    loadListings();
});