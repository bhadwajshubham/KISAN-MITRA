document.addEventListener('DOMContentLoaded', () => {
    // Note: No API Key is defined in this file. It is secure.

    // --- Element Selectors ---
    const uploadContainer = document.getElementById('upload-container');
    const fileInput = document.getElementById('file-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsContainer = document.getElementById('results-container');
    const historyContainer = document.getElementById('history-container');
    const expertConnectContainer = document.getElementById('expert-connect-container');
    
    // Camera Feature Selectors
    const uploadBtnNew = document.getElementById('upload-btn-new');
    const cameraBtnNew = document.getElementById('camera-btn-new');
    const cameraModal = document.getElementById('camera-modal');
    const closeCameraBtn = document.getElementById('close-camera-btn');
    const videoFeed = document.getElementById('camera-feed');
    const canvas = document.getElementById('camera-canvas');
    const captureBtn = document.getElementById('capture-btn');
    
    let uploadedImageBase64 = null;
    let conversationHistory = [];
    let stream = null; 

    // --- Initial State ---
    showPlaceholder();
    loadHistory();

    // --- Event Listeners ---
    uploadContainer.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    removeImageBtn.addEventListener('click', (e) => { e.stopPropagation(); resetUpload(); });
    analyzeBtn.addEventListener('click', handleAnalysis);
    
    uploadBtnNew.addEventListener('click', () => fileInput.click());
    cameraBtnNew.addEventListener('click', startCamera);
    closeCameraBtn.addEventListener('click', stopCamera);
    captureBtn.addEventListener('click', captureFrame);

    // --- Live Camera Functions ---
    async function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Sorry, your browser doesn't support camera access.");
            return;
        }
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            videoFeed.srcObject = stream;
            cameraModal.classList.remove('hidden');
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Could not access the camera. Please ensure you have given permission.");
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        cameraModal.classList.add('hidden');
    }

    function captureFrame() {
        canvas.width = videoFeed.videoWidth;
        canvas.height = videoFeed.videoHeight;
        canvas.getContext('2d').drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
        uploadedImageBase64 = canvas.toDataURL('image/jpeg');
        imagePreview.src = uploadedImageBase64;
        showImagePreview();
        stopCamera();
    }
    
    // --- Core UI & File Handling Functions ---
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImageBase64 = e.target.result;
                imagePreview.src = uploadedImageBase64;
                showImagePreview();
            };
            reader.readAsDataURL(file);
        }
    }

    function showImagePreview() {
        uploadPlaceholder.classList.add('hidden');
        imagePreviewContainer.classList.remove('hidden');
        analyzeBtn.disabled = false;
    }

    function resetUpload() {
        fileInput.value = '';
        uploadedImageBase64 = null;
        imagePreview.src = '#';
        imagePreviewContainer.classList.add('hidden');
        uploadPlaceholder.classList.remove('hidden');
        analyzeBtn.disabled = true;
        showPlaceholder();
    }

    function showPlaceholder() {
        resultsContainer.innerHTML = `<div class="placeholder-content"><i class="fas fa-file-medical-alt placeholder-icon"></i><p>Your detailed diagnosis report will appear here.</p></div>`;
        expertConnectContainer.classList.add('hidden');
    }

    function showLoading() {
        resultsContainer.innerHTML = `<div class="loading-spinner"></div><p style="text-align:center;">AI is analyzing your crop...</p>`;
        expertConnectContainer.classList.add('hidden');
    }

    // --- Main Analysis & Rendering Logic ---
    async function handleAnalysis() {
        if (!uploadedImageBase64) return;
        showLoading();
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

        try {
            const result = await callBackendAPI(uploadedImageBase64);
            renderResults(result);
            saveToHistory(result);
            loadHistory();
        } catch (error) {
            console.error("Analysis Error:", error);
            resultsContainer.innerHTML = `<div class="results-card error"><p><strong>Analysis Failed!</strong><br>${error.message}</p></div>`;
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-brain"></i> Analyze with AI';
        }
    }

    // --- Secure API Call to Your Backend ---
    // ▼▼▼ THIS IS THE ONLY UPDATED FUNCTION ▼▼▼
    async function callBackendAPI(base64Image) {
        const language = document.getElementById('language').value;

        // This code automatically chooses the correct API endpoint
        let apiEndpoint = '/.netlify/functions/api/diagnose'; // Default to Netlify's path
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            apiEndpoint = 'http://localhost:3000/diagnose'; // Use the local server path
        }
    
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image, language: language })
        });
    
        if (!response.ok) {
            // This robust error handling fixes the "body stream already read" error
            const errorBodyText = await response.text(); // Read the body ONCE as text.
            let errorMessage = errorBodyText; // Default to the raw text
            try {
                // Try to parse the text as JSON
                const errorResult = JSON.parse(errorBodyText);
                // If it is JSON, use the specific error message
                errorMessage = errorResult.error || errorBodyText; 
            } catch (e) {
                // It wasn't JSON. 'errorMessage' is already set to the raw text, so do nothing.
            }
            throw new Error(errorMessage);
        }
        
        // If response is OK, read the body as JSON.
        const result = await response.json();
        
        // This is your existing logic from here down
        if (!result.success || !result.data) {
             throw new Error(result.error || "The server returned a successful status but an invalid response body.");
        }
        
        try {
             const cleanedJsonString = result.data.replace(/```json|```/g, '').trim();
             const parsedResult = JSON.parse(cleanedJsonString);
             parsedResult.image = base64Image;
             return parsedResult;
        } catch (e) {
             console.error("Failed to parse JSON from server response data:", result.data);
             throw new Error("The analysis result from the server was in an unexpected format.");
        }
    }
    // ▲▲▲ THIS IS THE ONLY UPDATED FUNCTION ▲▲▲

    function renderResults(result) {
        let resultsHTML = '';
        if (result.isHealthy) {
            resultsHTML = `<div class="results-card healthy"><i class="fas fa-check-circle"></i><h3>Great News!</h3><p>Your crop appears to be healthy.</p></div>`;
            expertConnectContainer.classList.add('hidden');
        } else {
            const confidencePercent = (result.confidence || 0) * 100;
            const confidenceColor = confidencePercent > 90 ? 'var(--success)' : (confidencePercent > 70 ? 'var(--warning)' : 'var(--danger)');
            
            const diyTipHTML = result.diyTip ? `
                <div class="quick-tip-box">
                    <h4><i class="fas fa-lightbulb"></i> Quick DIY Tip</h4>
                    <p>${result.diyTip}</p>
                </div>
            ` : '';
            
            const chatHTML = `
                <div class="chat-container integrated">
                    <h3 class="chat-title">Ask a Follow-up Question</h3>
                    <div id="chat-history" class="chat-history"></div>
                    <form id="chat-form" class="chat-form">
                        <input type="text" id="chat-input" placeholder="Type your question here..." required>
                        <button type="button" id="mic-btn" title="Ask with Voice"><i class="fas fa-microphone"></i></button>
                        <button type="submit" title="Send"><i class="fas fa-paper-plane"></i></button>
                    </form>
                </div>`;

            resultsHTML = `
                <div class="results-card">
                    <div class="result-header">
                        <h3 class="result-disease-title">${result.issueName}</h3>
                        <span class="result-issue-type ${result.issueType.toLowerCase()}">${result.issueType}</span>
                    </div>
                    <div class="confidence-section">
                        <p>AI Confidence:</p>
                        <div class="confidence-bar-container"><div class="confidence-bar" style="width: ${confidencePercent}%; background-color: ${confidenceColor};"></div></div>
                        <span>${confidencePercent.toFixed(1)}%</span>
                    </div>
                    <div class="results-tabs">
                        <p class="result-section-title">Description</p><p>${result.description}</p>
                        <p class="result-section-title">Treatment Plan</p><ul class="solution-list">${result.treatment.map(item => `<li>${item}</li>`).join('')}</ul>
                        <p class="result-section-title">Prevention Tips</p><ul class="solution-list">${result.prevention.map(item => `<li>${item}</li>`).join('')}</ul>
                    </div>
                    ${diyTipHTML}
                    ${chatHTML}
                </div>`;
            
            expertConnectContainer.innerHTML = `<p>Need more detailed help?</p><div class="expert-buttons"><button id="whatsapp-btn" class="btn btn-secondary"><i class="fab fa-whatsapp"></i> Chat on WhatsApp</button><button id="call-btn" class="btn btn-secondary"><i class="fas fa-phone"></i> Request a Call</button></div><small>This is a premium feature for our registered users.</small>`;
            expertConnectContainer.classList.remove('hidden');
        }
        
        resultsContainer.innerHTML = resultsHTML;

        if (!result.isHealthy) {
            conversationHistory = [{ role: "user", parts: [{ text: "Image of my crop." }] }, { role: "model", parts: [{ text: `The diagnosis is ${result.issueName}. Answer follow-up questions directly.` }] }];
            document.getElementById('chat-form').addEventListener('submit', handleChatSubmit);
            document.getElementById('mic-btn').addEventListener('click', handleMicInput);
        }
    }

    // --- History & Chat Functions ---
    function saveToHistory(result) {
        let history = JSON.parse(localStorage.getItem('diagnosisHistory')) || [];
        const newEntry = { id: Date.now(), issueName: result.isHealthy ? "Healthy Crop" : result.issueName, date: new Date().toLocaleDateString('en-IN'), image: result.image };
        history.unshift(newEntry);
        if (history.length > 5) history.pop();
        localStorage.setItem('diagnosisHistory', JSON.stringify(history));
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('diagnosisHistory')) || [];
        historyContainer.innerHTML = history.length === 0 ? '<p class="text-gray-500 text-center">No past diagnoses found.</p>' :
            `<table class="history-table"><thead><tr><th>Preview</th><th>Diagnosis</th><th>Date</th></tr></thead><tbody>${history.map(item => `<tr><td><img src="${item.image}" alt="Crop Image" class="history-img-preview"/></td><td>${item.issueName}</td><td>${item.date}</td></tr>`).join('')}</tbody></table>`;
    }

    async function handleChatSubmit(e) {
        if (e) e.preventDefault();
        const chatInput = document.getElementById('chat-input');
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;
        appendMessage(userMessage, 'user');
        chatInput.value = '';
        showChatLoading(true);
        try {
            const aiResponse = await callBackendForChat(conversationHistory, userMessage);
            appendMessage(aiResponse, 'model');
        } catch (error) {
            appendMessage("Sorry, I couldn't get a response.", 'error');
        } finally {
            showChatLoading(false);
        }
    }
    
    async function callBackendForChat(history, newMessage) {
        // In a real app, you would create a new backend endpoint like '/chat'
        // For now, we simulate the response to keep the frontend logic clean.
        history.push({ role: "user", parts: [{ text: `Give a short, direct, practical answer: "${newMessage}"` }] });
        const aiMessage = "This is a simulated chat response. The backend endpoint for chat needs to be created.";
        history.push({ role: "model", parts: [{ text: aiMessage }] });
        return new Promise(resolve => setTimeout(() => resolve(aiMessage), 1000));
    }
    
    function appendMessage(text, sender) {
        const chatHistory = document.getElementById('chat-history');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-bubble ${sender}`;
        messageDiv.textContent = text;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    function showChatLoading(isLoading) {
        const chatHistory = document.getElementById('chat-history');
        let loadingBubble = document.getElementById('loading-bubble');
        if (isLoading) {
            if (!loadingBubble) {
                loadingBubble = document.createElement('div');
                loadingBubble.id = 'loading-bubble';
                loadingBubble.className = 'chat-bubble model';
                loadingBubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
                chatHistory.appendChild(loadingBubble);
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }
        } else {
            if (loadingBubble) loadingBubble.remove();
        }
    }
    
    function handleMicInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Sorry, voice recognition is not supported in your browser.");
        const recognition = new SpeechRecognition();
        recognition.lang = document.getElementById('language').value.startsWith('en') ? 'en-IN' : 'hi-IN';
        recognition.interimResults = false;
        document.getElementById('mic-btn').classList.add('active');
        recognition.onresult = (event) => {
            document.getElementById('chat-input').value = event.results[0][0].transcript;
            handleChatSubmit(); 
        };
        recognition.onerror = (event) => alert("Error: " + event.error);
        recognition.onend = () => document.getElementById('mic-btn').classList.remove('active');
        recognition.start();
    }
});