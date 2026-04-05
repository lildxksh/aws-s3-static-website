/* ═══════════════════════════════════════════════
   MOODMANSION — Core Application (Agent 2 & 4)
   Navigation, Data Models, Storage, Auth
   ═══════════════════════════════════════════════ */

// ── Data Store (LocalStorage-backed) ──
const MoodStore = {
  _key: 'moodmansion_data',
  _getAll() {
    try { return JSON.parse(localStorage.getItem(this._key)) || this._default(); }
    catch { return this._default(); }
  },
  _save(data) { localStorage.setItem(this._key, JSON.stringify(data)); },
  _default() {
    return {
      user: { name: 'Friend', joinedAt: new Date().toISOString(), streak: 0, lastVisit: null },
      moods: [],
      sessions: [],
      insights: [],
      coachHistory: []
    };
  },
  // Mood entries
  addMood(mood, text) {
    const data = this._getAll();
    const entry = {
      id: Date.now(),
      mood,
      text: text || '',
      timestamp: new Date().toISOString(),
      score: moodScores[mood] || 5
    };
    data.moods.push(entry);
    this._updateStreak(data);
    this._save(data);
    return entry;
  },
  getMoods() { return this._getAll().moods; },
  getMoodStats() {
    const moods = this.getMoods();
    if (!moods.length) return { total: 0, dominant: '—', streak: 0, wellness: '—', distribution: {} };
    const counts = {};
    moods.forEach(m => { counts[m.mood] = (counts[m.mood] || 0) + 1; });
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const avgScore = moods.reduce((s, m) => s + m.score, 0) / moods.length;
    const wellness = Math.round(avgScore * 10);
    return { total: moods.length, dominant, streak: this._getAll().user.streak, wellness: wellness + '%', distribution: counts };
  },
  // Session tracking
  addSession(agentType, messages) {
    const data = this._getAll();
    data.sessions.push({ id: Date.now(), agent: agentType, messages, timestamp: new Date().toISOString() });
    this._save(data);
  },
  // Insights
  addInsight(text, icon) {
    const data = this._getAll();
    data.insights.push({ id: Date.now(), text, icon: icon || '💡', timestamp: new Date().toISOString() });
    this._save(data);
  },
  getInsights() { return this._getAll().insights; },
  // Streak logic
  _updateStreak(data) {
    const today = new Date().toDateString();
    if (data.user.lastVisit === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    data.user.streak = (data.user.lastVisit === yesterday) ? data.user.streak + 1 : 1;
    data.user.lastVisit = today;
  }
};

// Mood → wellness score mapping (1-10)
const moodScores = {
  'Happy': 9, 'Excited': 9, 'Grateful': 8, 'Hopeful': 8,
  'Calm': 7, 'Peaceful': 7, 'Tired': 4, 'Anxious': 3,
  'Lonely': 3, 'Sad': 2, 'Angry': 2
};

// Mood → color mapping
const moodColors = {
  'Happy': '#F5E8D5', 'Excited': '#F5F2D5', 'Grateful': '#D5F5E8',
  'Hopeful': '#D5E8F5', 'Calm': '#E8D5F5', 'Peaceful': '#D5F5E8',
  'Tired': '#E8E0F0', 'Anxious': '#F5D5E0', 'Lonely': '#D5D8F5',
  'Sad': '#D5E0F5', 'Angry': '#F5D5D5'
};

// ── Navigation ──
let currentPage = 'home';

function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  // Show target page
  const target = document.getElementById('page-' + page);
  if (target) {
    target.style.display = 'block';
    requestAnimationFrame(() => {
      target.classList.add('active');
    });
  }
  // Update nav
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Close mobile menu
  document.getElementById('navLinks')?.classList.remove('open');
  // Trigger page-specific init
  if (page === 'analyzer') initAnalyzer();
  if (page === 'coach') generateAdvice();
  if (page === 'calm') initCalm();
}

function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function scrollToMoodEntry() {
  document.getElementById('moodEntry')?.scrollIntoView({ behavior: 'smooth' });
}

// ── Mood Entry ──
let selectedMood = null;

function selectMood(btn) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedMood = btn.dataset.mood;
}

function quickMood(mood) {
  selectedMood = mood;
  scrollToMoodEntry();
  setTimeout(() => {
    const btn = document.querySelector(`.mood-btn[data-mood="${mood}"]`);
    if (btn) selectMood(btn);
  }, 500);
}

function submitMood() {
  if (!selectedMood) {
    showToast('Please select a mood first 🌸');
    return;
  }
  const text = document.getElementById('moodText').value;
  MoodStore.addMood(selectedMood, text);
  showToast(`Mood logged: ${selectedMood} ✨ Your feelings matter!`);
  // Reset
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('moodText').value = '';
  selectedMood = null;
  // Generate insight
  generateInsightFromMood(selectedMood, text);
}

function generateInsightFromMood(mood) {
  const stats = MoodStore.getMoodStats();
  if (stats.total % 3 === 0 && stats.total > 0) {
    MoodStore.addInsight(`You've logged ${stats.total} moods! Your most common feeling is ${stats.dominant}.`, '🎯');
  }
}

// ── Navbar scroll effect ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ── Toast ──
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Intersection Observer for animations ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animationPlayState = 'running';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.animate-in').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
  // Seed some sample data if empty
  const stats = MoodStore.getMoodStats();
  if (stats.total === 0) {
    seedSampleData();
  }
});

function seedSampleData() {
  const sampleMoods = [
    { mood: 'Happy', text: 'Had a great morning walk today' },
    { mood: 'Calm', text: 'Meditation really helped this afternoon' },
    { mood: 'Grateful', text: 'Thankful for my supportive friends' },
    { mood: 'Anxious', text: 'Felt nervous before the meeting' },
    { mood: 'Happy', text: 'Completed a challenging project!' },
    { mood: 'Tired', text: 'Long day but still productive' },
    { mood: 'Hopeful', text: 'Exciting plans for the weekend' },
    { mood: 'Calm', text: 'Enjoyed a quiet evening reading' },
  ];
  sampleMoods.forEach(m => MoodStore.addMood(m.mood, m.text));
  MoodStore.addInsight('Welcome to MoodMansion! We\'ve added some sample moods to get you started. 🌸', '👋');
  MoodStore.addInsight('Tip: Log your mood daily to discover emotional patterns over time.', '💡');
  MoodStore.addInsight('Your emotional journey is unique — there are no wrong feelings here.', '💜');
}
