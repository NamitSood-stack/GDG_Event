// Sticky Header
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});

// Form Submission Alert
document.getElementById('waiting-list-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for joining our waiting list! We will contact you soon.');
    e.target.reset();
});

// Tabs Functionality
const tabItems = document.querySelectorAll('.tab-item');
const tabPanes = document.querySelectorAll('.tab-pane');

tabItems.forEach(item => {
    item.addEventListener('click', () => {
        tabItems.forEach(tab => tab.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        item.classList.add('active');
        const tabId = item.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Features Slider Functionality
const featuresList = document.querySelector('.features-list');
const featureItems = document.querySelectorAll('.feature-item');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

let currentIndex = 0;
const totalItems = featureItems.length;
const itemWidth = 330; // Width of each feature item (300px + 30px gap)

function updateSlider() {
    const translateX = -currentIndex * itemWidth;
    featuresList.style.transform = `translateX(${translateX}px)`;
}

leftArrow.addEventListener('click', () => {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalItems - 1;
    updateSlider();
});

rightArrow.addEventListener('click', () => {
    currentIndex = (currentIndex < totalItems - 1) ? currentIndex + 1 : 0;
    updateSlider();
});

// Chatbot Functionality
const chatbotToggle = document.querySelector('.chatbot-toggle');
const chatbotWindow = document.querySelector('.chatbot-window');
const chatbotClose = document.querySelector('.chatbot-close');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMessages = document.getElementById('chatbot-messages');

// Gemini API Key (Note: This should be in a backend for security in production)
const apiKey = "AIzaSyAupBZqKdH5PopmVq3Bm1cLmsMiQ7g_3MY";
let userName = null;
let conversationStarted = false;

// Toggle Chatbot Window
chatbotToggle.addEventListener('click', () => {
    if (chatbotWindow.classList.contains('open')) {
        chatbotWindow.classList.remove('open');
        chatbotWindow.classList.add('closing');
    } else {
        chatbotWindow.classList.remove('closing');
        chatbotWindow.classList.add('open');
    }
});

chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.remove('open');
    chatbotWindow.classList.add('closing');
});

// Handle Chatbot Messages
chatbotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = chatbotInput.value.trim();
    if (!userMessage) return;

    // Add user message to chat
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('message', 'user-message');
    userMessageElement.textContent = userMessage;
    chatbotMessages.appendChild(userMessageElement);
    chatbotInput.value = '';

    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    // Handle the first message to capture the name
    if (!userName && !conversationStarted) {
        userName = userMessage; // Assume first input is the name
        conversationStarted = true;
        appendMessage('bot', `Hello, ${userName}! I’m here to help with any questions about The Reserve At Ochoco. What would you like to know—floor plans, features, or how to join the waiting list?`);
        return;
    }

    // Core system instruction for the chatbot
    const systemInstruction = `
        You are a friendly AI assistant for The Reserve At Ochoco, a stunning living community in Prineville, Oregon. Your mission is to assist users with questions about the community, floor plans, features, and how to join the waiting list. Respond in a warm, professional, and helpful tone, like a welcoming staff member who is eager to assist.

        **Tone**: Speak in a warm, professional, and encouraging tone, like a friendly staff member who understands the needs of potential residents. Avoid complex jargon and keep responses simple and clear.

        **Guidelines**:
        - Use the user's name, "${userName}", naturally in responses (e.g., “Let’s find the perfect floor plan for you, ${userName}!”).
        - Ask relatable questions (e.g., “Are you looking for a 1-bedroom or something larger, ${userName}?”).
        - Provide information about the community (e.g., “We have a 24-hour fitness center and a dog park, ${userName}—perfect for an active lifestyle!”).
        - Mention specific floor plans (e.g., “Our 1-bedroom apartments are cozy and stylish, ${userName}. Would you like to schedule a tour?”).
        - Guide users on joining the waiting list (e.g., “To join the waiting list, just fill out the form above, ${userName}!”).
        - If the user seems unsure, suggest a next step (e.g., “How about scheduling a tour, ${userName}? I can help with that!”).

        **Capabilities**:
        1. **Floor Plans**: Provide details about available floor plans (e.g., “We offer 1-bedroom, 2-bedroom, 2-bedroom deluxe, and 3-bedroom apartments, ${userName}. Which one are you interested in?”).
        2. **Features**: Highlight community features (e.g., “Our gated community has a 24-hour fitness center, dog park, fire pit lounges, and more, ${userName}!”).
        3. **Waiting List**: Guide users on how to join the waiting list (e.g., “You can join our waiting list by filling out the form on this page, ${userName}!”).
        4. **General Assistance**: Answer general questions about the community (e.g., “We’re located in Prineville, Oregon, ${userName}. It’s a beautiful area with a serene lifestyle!”).
    `;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: systemInstruction },
                    { text: userMessage }
                ]
            }
        ],
        generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain"
        }
    };

    // Add loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'bot-message');
    loadingMessage.textContent = 'Thinking...';
    chatbotMessages.appendChild(loadingMessage);

    try {
        console.log("Sending request to Gemini API...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        console.log("Response status:", response.status);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        loadingMessage.remove();

        const botResponse = data.candidates[0].content.parts[0].text;
        appendMessage('bot', botResponse);
    } catch (error) {
        console.error("Error:", error);
        loadingMessage.remove();
        appendMessage('bot', `Sorry, ${userName}, something went wrong—maybe my connection’s off. Let’s try again—what’s on your mind?`);
    }

    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
});

// Function to append messages to the chat
function appendMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
    messageElement.textContent = text;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Allow sending messages with Enter key
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        chatbotForm.dispatchEvent(new Event('submit'));
    }
});