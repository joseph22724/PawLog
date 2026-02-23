let currentContext = "General";

// --- VIEW NAVIGATION ---
function hideAllViews() {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('settings-view').style.display = 'none';
    document.getElementById('all-records-view').style.display = 'none';
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
}

function showDashboard() {
    hideAllViews();
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('page-title').innerText = "Welcome back, Sarah";
    document.querySelectorAll('.nav-link')[0].classList.add('active'); 
    updateChatContext("General", "Hello! I am your AI Assistant. Select a pet on the left to pull up their records.");
}

function showProfile(petName) {
    hideAllViews();
    document.getElementById('profile-view').style.display = 'block';
    document.getElementById('page-title').innerText = "Pet Profile";
    
    document.getElementById('profile-name').innerText = petName;
    if(petName === 'Spot') {
        document.getElementById('profile-icon').innerText = "🐶";
        document.getElementById('profile-icon').style.backgroundColor = "#e0f2fe";
        document.getElementById('profile-details').innerText = "Beagle | 4 Years | 30 lbs";
        updateChatContext("Spot", "I've pulled up Spot's records. What would you like to know?");
    } else {
        document.getElementById('profile-icon').innerText = "🐱";
        document.getElementById('profile-icon').style.backgroundColor = "#fce7f3";
        document.getElementById('profile-details').innerText = "Tabby Cat | 2 Years | 10 lbs";
        updateChatContext("Luna", "I've pulled up Luna's records. How can I help?");
    }
}

function showAllRecords() {
    hideAllViews();
    document.getElementById('all-records-view').style.display = 'block';
    document.getElementById('page-title').innerText = "All Records";
    
    // Highlights the "All Records" link (assuming it's the 5th nav-link)
    document.querySelectorAll('.nav-link')[4].classList.add('active'); 
}

function showSettings() {
    hideAllViews();
    document.getElementById('settings-view').style.display = 'block';
    document.getElementById('page-title').innerText = "Account Settings";
    // Highlight the settings button in the sidebar
    document.querySelector('.settings').classList.add('active');
    updateChatContext("Settings", "I see you are in settings. I can help you update your profile or answer general questions.");
}

// --- DROPDOWNS & MENUS ---
function toggleNotifications() {
    const dropdown = document.getElementById('notif-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function togglePetMenu(event, menuId) {
    event.stopPropagation(); // Prevents the click from triggering showProfile()
    
    // Hide all other menus first
    document.querySelectorAll('.context-menu').forEach(menu => {
        if(menu.id !== menuId) menu.style.display = 'none';
    });

    const menu = document.getElementById(menuId);
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// --- MODALS ---
function openModal(modalId) {
    document.getElementById('modal-overlay').style.display = 'flex';
    // Hide all modal contents inside the overlay
    document.querySelectorAll('.modal-content').forEach(content => content.style.display = 'none');
    // Show the specific one requested
    document.getElementById(modalId).style.display = 'block';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// --- AI CHAT LOGIC ---
// Handles when the user manually changes the dropdown in the chat
function changeContextFromDropdown() {
    const select = document.getElementById('chat-context-select');
    const newContext = select.value;
    
    let greeting = "";
    if(newContext === 'General') {
        greeting = "I've cleared my context. You can ask me general pet care questions.";
    } else {
        greeting = `I've switched to ${newContext}'s context. What would you like to know?`;
    }
    
    updateChatContext(newContext, greeting, true);
}

// Updated to sync the dropdown with the rest of the app
function updateChatContext(petName, aiGreeting, fromDropdown = false) {
    currentContext = petName;
    
    // If the change came from clicking a Dashboard card, update the dropdown visually
    if(!fromDropdown) {
        document.getElementById('chat-context-select').value = petName;
    }
    
    document.getElementById('chat-input').placeholder = "Ask about " + petName + "...";
    
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML += `<div class="message msg-ai">${aiGreeting}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function handleKeyPress(e) {
    if(e.key === 'Enter') { sendMessage(); }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const messageText = input.value.trim();
    if(!messageText) return;

    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML += `<div class="message msg-user">${messageText}</div>`;
    input.value = '';
    chatWindow.scrollTop = chatWindow.scrollHeight; 

    setTimeout(() => {
        let aiResponse = "";
        if (currentContext === 'Spot' && messageText.toLowerCase().includes('grape')) {
            aiResponse = `<span class="safeguard-note">🛡️ Safeguard: Verified profile for Spot (Dog, 30 lbs).</span> While grapes are toxic to dogs, a single grape for a 30lb Beagle is highly unlikely to cause acute toxicity. Monitor him closely.`;
        } else {
            aiResponse = `Scanning context for ${currentContext}... This is an interactive prototype response.`;
        }
        chatWindow.innerHTML += `<div class="message msg-ai">${aiResponse}</div>`;
        chatWindow.scrollTop = chatWindow.scrollHeight; 
    }, 700); 
}

// Global click listener to close dropdowns if user clicks away
window.onclick = function(event) {
    if (!event.target.matches('.icon-btn')) {
        document.getElementById('notif-dropdown').style.display = 'none';
    }
    if (!event.target.matches('.btn-dots')) {
        document.querySelectorAll('.context-menu').forEach(menu => menu.style.display = 'none');
    }
}

// --- SIMULATE CHAT IMAGE UPLOAD ---
function simulateImageUpload() {
    if (currentContext === "General") {
        alert("Please select a pet's profile first so I know who this image belongs to!");
        return;
    }

    const chatWindow = document.getElementById('chat-window');
    
    // 1. Simulate user sending an image
    // We use a placeholder image of a dog paw/skin to simulate a rash
    const userImageMsg = `
        <div class="message msg-user" style="display: flex; flex-direction: column;">
            <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Uploaded Image" class="chat-image-preview">
            <span>Does this spot on his paw look infected?</span>
        </div>
    `;
    chatWindow.innerHTML += userImageMsg;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // 2. Simulate AI Vision Analysis Delay (1.5 seconds)
    setTimeout(() => {
        const aiResponse = `
            <span class="safeguard-note">👁️ Vision AI Active | 🛡️ Medical Disclaimer</span>
            Based on the image of ${currentContext}'s paw, there appears to be mild redness and localized irritation, possibly a hotspot or a minor abrasion. <br><br>
            <strong>Action:</strong> Keep the area clean and dry. Prevent licking. However, I am an AI and cannot formally diagnose infections. If it becomes warm to the touch, oozes, or ${currentContext} begins limping, please schedule an appointment with Dr. Smith.
        `;
        chatWindow.innerHTML += `<div class="message msg-ai">${aiResponse}</div>`;
        chatWindow.scrollTop = chatWindow.scrollHeight; 
    }, 1500);
}