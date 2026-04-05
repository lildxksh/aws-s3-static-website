/* ═══════════════════════════════════════════════
   MOODMANSION — Listener Agent (Agent 3)
   Empathic chat with sentiment-aware responses
   ═══════════════════════════════════════════════ */

const ListenerAgent = {
  // Sentiment keywords → categories
  sentimentMap: {
    positive: ['happy', 'great', 'wonderful', 'amazing', 'good', 'love', 'joy', 'grateful', 'thankful', 'excited', 'proud', 'blessed', 'fantastic', 'awesome', 'peaceful', 'content', 'hopeful', 'inspired', 'motivated', 'cheerful', 'delighted'],
    negative: ['sad', 'depressed', 'anxious', 'worried', 'scared', 'angry', 'frustrated', 'lonely', 'hurt', 'pain', 'stressed', 'overwhelmed', 'tired', 'exhausted', 'hopeless', 'lost', 'confused', 'afraid', 'nervous', 'disappointed', 'broken'],
    neutral: ['okay', 'fine', 'alright', 'normal', 'meh', 'so-so', 'whatever', 'nothing', 'dunno', 'idk']
  },

  // Empathic response pools
  responses: {
    positive: [
      "That's truly beautiful to hear 🌸 Your positive energy is radiating. What do you think brought this feeling on?",
      "I'm so glad you're experiencing this joy! ✨ These moments are worth cherishing. Would you like to explore what's making you feel this way?",
      "What a wonderful feeling! 😊 Your happiness matters, and I'm here to celebrate it with you. Tell me more about what's going well.",
      "That warmth you're feeling is so precious 💜 Sometimes acknowledging the good moments makes them even more meaningful.",
      "How lovely! 🌿 Positive emotions are like sunlight for the soul. What's been the highlight of your day?",
      "I can feel your joy through your words 🌈 You deserve every bit of this happiness. What would make this moment even more special?"
    ],
    negative: [
      "I hear you, and I want you to know that what you're feeling is completely valid 💜 You're not alone in this. Can you tell me more about what's weighing on you?",
      "That sounds really difficult, and I'm sorry you're going through this 🌸 It takes courage to share these feelings. I'm right here with you.",
      "Your feelings matter so much, even the painful ones 🤗 Sometimes just naming what we feel can lighten the load a little. What else is on your mind?",
      "I can sense how much this is affecting you, and I want you to know — it's okay to not be okay 💜 Let's sit with this feeling together.",
      "Thank you for trusting me with this 🌿 Heavy feelings deserve to be heard without judgment. Take your time — I'm not going anywhere.",
      "That sounds incredibly tough 😔 Remember, storms don't last forever. What's one small thing that might bring you a moment of comfort right now?"
    ],
    neutral: [
      "I appreciate you sharing 🌸 Sometimes 'just okay' is a feeling worth exploring too. What's been on your mind lately?",
      "That's perfectly okay 💜 Not every day needs to be extraordinary. Is there something specific you'd like to talk about?",
      "Thank you for being honest about where you are 🌿 Would you like to dig a little deeper into what you're feeling beneath the surface?",
      "Being in a neutral space is completely fine 😊 Sometimes the in-between moments hold quiet wisdom. What would feel good to explore right now?"
    ],
    greeting: [
      "Welcome back to your safe space 🏡💜 How has your heart been today?",
      "Hello, beautiful soul ✨ I'm so glad you're here. What's stirring inside you today?",
      "Hi there 🌸 This is your judgment-free zone. What would you like to share?"
    ],
    followUp: [
      "That's really insightful 🌟 How long have you been feeling this way?",
      "Thank you for sharing that with me 💜 What do you think triggered this feeling?",
      "I really appreciate your openness 🌿 Is there anything else connected to this that you'd like to explore?",
      "That makes a lot of sense 🌸 How does it feel to put those thoughts into words?",
      "I hear you completely ✨ What would your ideal outcome look like in this situation?",
      "You're being so brave by processing this 💜 Would it help to think about what you need right now?"
    ],
    empathy: [
      "Your courage in sharing this is remarkable 💜",
      "I'm holding space for you right now 🌿",
      "Every emotion you feel is a valid part of your story ✨",
      "You matter, and so do your feelings 🌸",
      "I'm grateful you trust me with this 🏡"
    ]
  },

  // Detect sentiment from message
  detectSentiment(message) {
    const lower = message.toLowerCase();
    const greetings = ['hi', 'hello', 'hey', 'howdy', 'sup', 'good morning', 'good evening', 'good night'];
    if (greetings.some(g => lower.startsWith(g) || lower === g)) return 'greeting';

    let posCount = 0, negCount = 0;
    this.sentimentMap.positive.forEach(w => { if (lower.includes(w)) posCount++; });
    this.sentimentMap.negative.forEach(w => { if (lower.includes(w)) negCount++; });
    this.sentimentMap.neutral.forEach(w => { if (lower.includes(w)) return 'neutral'; });

    if (negCount > posCount) return 'negative';
    if (posCount > negCount) return 'positive';
    if (posCount === 0 && negCount === 0) return 'neutral';
    return 'neutral';
  },

  // Generate response
  getResponse(message) {
    const sentiment = this.detectSentiment(message);
    const pool = this.responses[sentiment];
    const response = pool[Math.floor(Math.random() * pool.length)];

    // Sometimes add empathy prefix
    if (Math.random() > 0.6 && sentiment !== 'greeting') {
      const empathy = this.empathyLine();
      return empathy + ' ' + response;
    }
    return response;
  },

  empathyLine() {
    return this.responses.empathy[Math.floor(Math.random() * this.responses.empathy.length)];
  },

  getFollowUp() {
    return this.responses.followUp[Math.floor(Math.random() * this.responses.followUp.length)];
  }
};

// ── Chat UI Logic ──
let chatHistory = [];

function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;

  // Add user message
  appendMessage(msg, 'user');
  chatHistory.push({ role: 'user', text: msg });
  input.value = '';

  // Show typing indicator
  showTyping();

  // Generate response with delay for realism
  const delay = 800 + Math.random() * 1200;
  setTimeout(() => {
    hideTyping();
    let response;
    if (chatHistory.length <= 2) {
      response = ListenerAgent.getResponse(msg);
    } else if (chatHistory.length > 6 && Math.random() > 0.5) {
      response = ListenerAgent.getFollowUp();
    } else {
      response = ListenerAgent.getResponse(msg);
    }
    appendMessage(response, 'bot');
    chatHistory.push({ role: 'bot', text: response });

    // Auto-detect mood from conversation and log it
    const sentiment = ListenerAgent.detectSentiment(msg);
    if (sentiment === 'positive') {
      MoodStore.addMood('Happy', msg);
    } else if (sentiment === 'negative') {
      MoodStore.addMood('Sad', msg);
    }

    // Save session periodically
    if (chatHistory.length % 6 === 0) {
      MoodStore.addSession('listener', [...chatHistory]);
    }
  }, delay);
}

function appendMessage(text, type) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = 'typingIndicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}
