document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Data ---
    const mockExperts = [
        { name: 'Ravi Kumar', specialty: 'Crop Specialist', img: 'https://placehold.co/100x100/2d7a5f/ffffff?text=RK' },
        { name: 'Sunita Devi', specialty: 'Irrigation Expert', img: 'https://placehold.co/100x100/2d7a5f/ffffff?text=SD' },
        { name: 'Anil Singh', specialty: 'Soil Health', img: 'https://placehold.co/100x100/2d7a5f/ffffff?text=AS' }
    ];
    
    const mockPosts = [
        {
            author: 'Vijay Patel',
            authorImg: 'https://placehold.co/100x100/f59e0b/ffffff?text=VP',
            content: 'Just finished harvesting my first batch of organic tomatoes! The new irrigation system we discussed here last month worked wonders. Thanks for the advice, everyone!',
            image: 'https://placehold.co/600x400/10b981/ffffff?text=Tomato+Harvest',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
            author: 'Meera Sharma',
            authorImg: 'https://placehold.co/100x100/f59e0b/ffffff?text=MS',
            content: 'Has anyone tried using neem oil as a natural pesticide for aphids? Seeing a few on my brinjal plants and looking for effective, non-chemical solutions.',
            image: null,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
        }
    ];

    // --- Utility Functions ---
    function openModal(modalId) { document.getElementById(modalId).classList.add('open'); }
    function closeModal(modalId) { document.getElementById(modalId).classList.remove('open'); }
    
    function fileToBase64(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }
    
    // --- Data Initialization ---
    function initializeFeed() {
        if (!localStorage.getItem('communityPosts')) {
            localStorage.setItem('communityPosts', JSON.stringify(mockPosts));
        }
    }

    // --- Render Functions ---
    function renderExperts() {
        const list = document.getElementById('expertsList');
        if (!list) return;
        list.innerHTML = '';
        mockExperts.forEach(expert => {
            const div = document.createElement('div');
            div.className = 'expert-item';
            div.innerHTML = `
                <div class="expert-info">
                    <img src="${expert.img}" alt="${expert.name}" class="expert-avatar">
                    <div>
                        <p class="expert-name">${expert.name}</p>
                        <p class="expert-specialty">${expert.specialty}</p>
                    </div>
                </div>
                <button data-name="${expert.name}" data-img="${expert.img}" class="btn-chat">Chat</button>
            `;
            list.appendChild(div);
        });
    }

    function renderCommunityFeed() {
        const feed = document.getElementById('communityFeed');
        if (!feed) return;
        feed.innerHTML = '';
        const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
        
        if (posts.length === 0) {
             feed.innerHTML = `<div class="card text-center text-gray-500">No posts yet. Be the first to share!</div>`;
             return;
        }

        posts.forEach(post => {
            const postEl = document.createElement('div');
            postEl.className = 'card feed-post';
            const postDate = new Date(post.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
            postEl.innerHTML = `
                <div class="post-header">
                    <img src="${post.authorImg}" class="author-avatar">
                    <div>
                        <p class="author-name">${post.author}</p>
                        <p class="post-timestamp">${postDate}</p>
                    </div>
                </div>
                <p class="post-content">${post.content}</p>
                ${post.image ? `<img src="${post.image}" class="post-image">` : ''}
                <div class="post-actions">
                    <button><i class="fas fa-thumbs-up"></i> Like</button>
                    <button><i class="fas fa-comment"></i> Comment</button>
                    <button><i class="fas fa-share"></i> Share</button>
                </div>
            `;
            feed.appendChild(postEl);
        });
    }

    // --- Event Listeners ---
    initializeFeed();
    renderExperts();
    renderCommunityFeed();

    const seekHelpBtn = document.getElementById('seekHelpBtn');
    if (seekHelpBtn) {
        seekHelpBtn.addEventListener('click', () => {
            // Logic to open 'Seek Help' modal can be added here
            alert("Seek Help functionality is in development.");
        });
    }
    
    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('postContent').value;
            const imageFile = document.getElementById('postImage').files[0];
            if (!content.trim()) return;

            const imageBase64 = imageFile ? await fileToBase64(imageFile) : null;

            const newPost = {
                author: 'Current User',
                authorImg: 'https://placehold.co/100x100/1a5f3f/ffffff?text=CU',
                content,
                image: imageBase64,
                timestamp: new Date().toISOString()
            };

            const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
            posts.unshift(newPost);
            localStorage.setItem('communityPosts', JSON.stringify(posts));
            
            renderCommunityFeed();
            e.target.reset();
        });
    }

    const expertsList = document.getElementById('expertsList');
    if (expertsList) {
        expertsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-chat')) {
                // Logic for chat modal can be added here
                alert(`Starting chat with ${e.target.dataset.name}... (Feature in development)`);
            }
        });
    }
});