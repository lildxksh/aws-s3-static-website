/* ═══════════════════════════════════════════════
   MOODMANSION — Coach Agent (Agent 3)
   Personalized advice & wellness strategies
   ═══════════════════════════════════════════════ */

const CoachAgent = {
  advicePool: {
    mindset: [
      { title: 'Reframe Your Narrative', body: 'When negative thoughts arise, try asking yourself: "Is this thought a fact, or a story I\'m telling myself?" Often, we mistake feelings for facts. Practice catching these moments and gently redirecting your inner dialogue.', action: 'Try journaling one reframe today' },
      { title: 'The Power of "Yet"', body: 'Adding "yet" to negative statements transforms them. "I can\'t handle this" becomes "I can\'t handle this yet." This small word opens a door to growth and possibility.', action: 'Use "yet" three times today' },
      { title: 'Embrace Imperfection', body: 'Perfectionism often masks a fear of not being enough. Practice self-compassion by treating yourself the way you\'d treat a dear friend going through the same thing.', action: 'Write yourself a kind letter' },
      { title: 'Growth Through Discomfort', body: 'Emotional discomfort often signals growth. Instead of avoiding uncomfortable feelings, sit with them briefly. Name them, feel them, then let them flow through you like clouds passing.', action: 'Sit with one difficult feeling for 2 minutes' },
      { title: 'Your Thoughts Are Not You', body: 'You are the sky; your thoughts are the weather. They come and go, but you remain. Practice observing your thoughts without attaching to them — like watching leaves float down a stream.', action: 'Practice 5 minutes of thought observation' }
    ],
    action: [
      { title: 'The 5-Minute Rule', body: 'Overwhelmed? Commit to just 5 minutes of any task. Often, starting is the hardest part. You might find momentum carries you forward, and if not, 5 minutes is still a win.', action: 'Apply this rule to one task' },
      { title: 'Move Your Body', body: 'Physical movement directly impacts emotional state. Even a 10-minute walk can shift your mood significantly. Your body and mind are deeply connected — honor that connection.', action: 'Take a mindful 10-minute walk' },
      { title: 'Digital Sunset', body: 'Set a time each evening to put screens away. The blue light and constant stimulation can amplify anxiety and disrupt sleep. Create a calming pre-sleep ritual instead.', action: 'Try a screen-free last hour tonight' },
      { title: 'Create a Joy List', body: 'Write down 10 small things that bring you genuine joy — not what should make you happy, but what actually does. Keep this list handy for moments when you need a mood lift.', action: 'Write your personal joy list' },
      { title: 'The Two-Minute Connection', body: 'Reach out to someone you care about with a genuine message. Human connection is one of the most powerful mood regulators we have. A simple "thinking of you" can brighten two days at once.', action: 'Send a heartfelt message to someone' }
    ],
    reflection: [
      { title: 'Evening Three', body: 'Each night, write down three things: something that made you smile, something you learned, and something you\'re grateful for. This practice rewires your brain to notice the good.', action: 'Start tonight with your Evening Three' },
      { title: 'The Emotion Wheel', body: 'When asked "how are you?", go beyond "fine." Use an emotion wheel to find the precise word: perhaps you\'re not just "sad" but "melancholic" or "wistful." Precision creates understanding.', action: 'Name your current emotion precisely' },
      { title: 'Letter to Future You', body: 'Write a letter to yourself six months from now. Share your current hopes, fears, and dreams. Seal it and set a reminder. This beautiful practice builds self-awareness and hope.', action: 'Write your future letter' },
      { title: 'Boundary Check-In', body: 'Healthy boundaries protect your emotional energy. Ask yourself: "Am I saying yes to this because I want to, or because I\'m afraid of disappointing someone?" Your needs matter too.', action: 'Identify one boundary to strengthen' },
      { title: 'The Compassion Pause', body: 'When you notice self-criticism, pause and place a hand on your heart. Say to yourself: "This is a moment of difficulty. Everyone struggles sometimes. May I be kind to myself."', action: 'Practice the compassion pause today' }
    ],
    growth: [
      { title: 'Celebrate Small Wins', body: 'We often dismiss our small achievements while magnifying our shortcomings. Today, consciously acknowledge every positive step you take, no matter how small. You showed up — that counts.', action: 'List three small wins from today' },
      { title: 'The Learning Mindset', body: 'Replace "I failed" with "I learned." Every setback carries valuable information about what to try differently. Failure isn\'t the opposite of success — it\'s part of the journey.', action: 'Find one lesson in a recent setback' },
      { title: 'Expand Your Comfort Zone', body: 'Growth happens at the edge of comfort. Choose one small thing today that feels slightly uncomfortable — a new conversation, a creative project, a different route. Small stretches build resilience.', action: 'Do one slightly uncomfortable thing' },
      { title: 'The Gratitude Shift', body: 'Research shows that practicing gratitude physically changes your brain over time. It\'s not about ignoring problems — it\'s about also noticing what\'s working. Both realities can coexist.', action: 'Name 5 things you\'re grateful for' },
      { title: 'Define Your Values', body: 'When we live in alignment with our core values, we feel more fulfilled and less conflicted. Take time to identify your top 3 values. Let them guide your decisions this week.', action: 'Write down your top 3 values' }
    ]
  },

  // Get personalized advice based on recent moods
  getAdvice(count = 6) {
    const moods = MoodStore.getMoods();
    const stats = MoodStore.getMoodStats();
    const cards = [];
    const categories = ['mindset', 'action', 'reflection', 'growth'];
    const tags = { mindset: 'tag-mindset', action: 'tag-action', reflection: 'tag-reflection', growth: 'tag-growth' };

    // Weight categories based on mood state
    let weights = { mindset: 1, action: 1, reflection: 1, growth: 1 };
    if (stats.dominant === 'Anxious' || stats.dominant === 'Stressed') {
      weights.mindset = 3; weights.reflection = 2;
    } else if (stats.dominant === 'Sad' || stats.dominant === 'Lonely') {
      weights.action = 3; weights.growth = 2;
    } else if (stats.dominant === 'Happy' || stats.dominant === 'Grateful') {
      weights.growth = 3; weights.reflection = 2;
    }

    // Build weighted pool
    const pool = [];
    categories.forEach(cat => {
      for (let i = 0; i < weights[cat]; i++) {
        this.advicePool[cat].forEach(a => pool.push({ ...a, category: cat, tagClass: tags[cat] }));
      }
    });

    // Shuffle and pick
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const seen = new Set();
    for (const item of shuffled) {
      if (cards.length >= count) break;
      if (!seen.has(item.title)) {
        seen.add(item.title);
        cards.push(item);
      }
    }
    return cards;
  }
};

// ── Coach Page Rendering ──
function generateAdvice() {
  const container = document.getElementById('coachCards');
  container.innerHTML = '';
  const advice = CoachAgent.getAdvice(6);

  advice.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'coach-card';
    el.style.animation = `fadeInUp 0.5s ease ${i * 0.1}s both`;
    el.innerHTML = `
      <span class="coach-card-tag ${card.tagClass}">${card.category.charAt(0).toUpperCase() + card.category.slice(1)}</span>
      <h3>${card.title}</h3>
      <p>${card.body}</p>
      <button class="coach-action" onclick="completeAdvice(this, '${card.title.replace(/'/g, "\\'")}')">✨ ${card.action}</button>
    `;
    container.appendChild(el);
  });
}

function completeAdvice(btn, title) {
  btn.textContent = '✅ Noted! Great step!';
  btn.style.background = 'var(--gradient-1)';
  btn.style.borderColor = 'transparent';
  btn.disabled = true;
  MoodStore.addInsight(`You committed to: "${title}" — amazing self-care step! 🌱`, '🏆');
  showToast('Beautiful commitment! 🌸 Your growth matters.');
}
