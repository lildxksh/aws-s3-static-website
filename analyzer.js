/* ═══════════════════════════════════════════════
   MOODMANSION — Analyzer Agent (Agent 3)
   Mood pattern detection, charts, insights
   ═══════════════════════════════════════════════ */

const AnalyzerAgent = {
  // Analyze mood patterns
  analyzePatterns(moods) {
    if (!moods.length) return [];
    const patterns = [];
    const counts = {};
    const timeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    moods.forEach(m => {
      counts[m.mood] = (counts[m.mood] || 0) + 1;
      const hour = new Date(m.timestamp).getHours();
      if (hour >= 5 && hour < 12) timeOfDay.morning++;
      else if (hour >= 12 && hour < 17) timeOfDay.afternoon++;
      else if (hour >= 17 && hour < 21) timeOfDay.evening++;
      else timeOfDay.night++;
    });

    // Dominant mood pattern
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      patterns.push({
        icon: '🎯',
        text: `Your most frequent mood is "${sorted[0][0]}" — it appeared ${sorted[0][1]} time${sorted[0][1] > 1 ? 's' : ''} in your entries.`
      });
    }

    // Mood variety
    if (sorted.length >= 4) {
      patterns.push({ icon: '🌈', text: `You've experienced ${sorted.length} different moods — you have a rich emotional range!` });
    } else if (sorted.length <= 2 && moods.length > 3) {
      patterns.push({ icon: '🔮', text: 'Your moods tend to cluster around a few feelings. Consider exploring what drives this consistency.' });
    }

    // Positive vs negative ratio
    const positiveMoods = ['Happy', 'Excited', 'Grateful', 'Hopeful', 'Calm', 'Peaceful'];
    const posCount = moods.filter(m => positiveMoods.includes(m.mood)).length;
    const ratio = posCount / moods.length;
    if (ratio >= 0.7) {
      patterns.push({ icon: '☀️', text: `${Math.round(ratio * 100)}% of your moods are positive — you have a wonderfully optimistic outlook!` });
    } else if (ratio <= 0.3) {
      patterns.push({ icon: '💜', text: `You've been going through some tough emotions lately. Remember, seeking support is a sign of strength.` });
    } else {
      patterns.push({ icon: '⚖️', text: `Your emotional balance is ${Math.round(ratio * 100)}% positive — a healthy mix of all feelings.` });
    }

    // Time of day insight
    const peakTime = Object.entries(timeOfDay).sort((a, b) => b[1] - a[1])[0];
    if (peakTime[1] > 0) {
      const timeEmojis = { morning: '🌅', afternoon: '☀️', evening: '🌆', night: '🌙' };
      patterns.push({
        icon: timeEmojis[peakTime[0]],
        text: `You tend to log moods most often in the ${peakTime[0]}. This is when you're most emotionally aware.`
      });
    }

    // Trend detection (last 5 vs previous)
    if (moods.length >= 6) {
      const recent = moods.slice(-3);
      const earlier = moods.slice(-6, -3);
      const recentAvg = recent.reduce((s, m) => s + m.score, 0) / recent.length;
      const earlierAvg = earlier.reduce((s, m) => s + m.score, 0) / earlier.length;
      if (recentAvg > earlierAvg + 1) {
        patterns.push({ icon: '📈', text: 'Your mood is trending upward recently — something positive is shifting!' });
      } else if (recentAvg < earlierAvg - 1) {
        patterns.push({ icon: '📉', text: 'Your mood has dipped recently. Be gentle with yourself — this too shall pass.' });
      } else {
        patterns.push({ icon: '📊', text: 'Your mood has been relatively stable recently — consistency can be comforting.' });
      }
    }

    return patterns;
  },

  // Generate wellness score description
  getWellnessDescription(score) {
    const num = parseInt(score);
    if (num >= 80) return 'Thriving — You\'re in a great emotional place!';
    if (num >= 60) return 'Growing — You\'re doing well with room to bloom.';
    if (num >= 40) return 'Healing — You\'re processing and that takes strength.';
    return 'Struggling — Consider reaching out for support. You\'re not alone.';
  }
};

// ── Analyzer Page Init ──
function initAnalyzer() {
  const stats = MoodStore.getMoodStats();
  const moods = MoodStore.getMoods();

  // Update stat cards with animated counting
  animateCounter('totalEntries', stats.total);
  document.getElementById('dominantMood').textContent = stats.dominant;
  animateCounter('streakCount', stats.streak);
  document.getElementById('wellnessScore').textContent = stats.wellness;

  // Build chart
  buildMoodChart(stats.distribution);

  // Generate and display insights
  const insights = AnalyzerAgent.analyzePatterns(moods);
  const savedInsights = MoodStore.getInsights();
  const allInsights = [...insights, ...savedInsights.map(i => ({ icon: i.icon, text: i.text }))];
  renderInsights(allInsights);
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  let current = 0;
  const step = Math.max(1, Math.floor(target / 20));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current;
  }, 50);
}

function buildMoodChart(distribution) {
  const container = document.getElementById('moodChart');
  container.innerHTML = '';

  const chartGroup = document.createElement('div');
  chartGroup.className = 'chart-bar-group';

  const entries = Object.entries(distribution);
  if (!entries.length) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem;">Log some moods to see your chart 🌸</p>';
    return;
  }

  const max = Math.max(...entries.map(e => e[1]));
  const colors = [
    'linear-gradient(180deg, #E8D5F5, #D5B8EF)',
    'linear-gradient(180deg, #F5D5E0, #EFB8D5)',
    'linear-gradient(180deg, #D5F5E8, #B8EFD5)',
    'linear-gradient(180deg, #D5E8F5, #B8D5EF)',
    'linear-gradient(180deg, #F5E8D5, #EFD5B8)',
    'linear-gradient(180deg, #F5F2D5, #EFE8B8)',
    'linear-gradient(180deg, #E8E0F0, #D5C8E8)',
    'linear-gradient(180deg, #F0D5E8, #E8B8D5)',
    'linear-gradient(180deg, #D5F0E8, #B8E8D5)',
    'linear-gradient(180deg, #F0E8D5, #E8D5B8)'
  ];

  entries.forEach(([mood, count], i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'chart-bar-wrapper';

    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.background = colors[i % colors.length];
    bar.style.height = '0px';
    bar.setAttribute('data-value', count);

    const label = document.createElement('span');
    label.className = 'chart-label';
    label.textContent = mood;

    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    chartGroup.appendChild(wrapper);

    // Animate bar height
    setTimeout(() => {
      bar.style.height = Math.max(20, (count / max) * 180) + 'px';
    }, 100 + i * 100);
  });

  container.appendChild(chartGroup);
}

function renderInsights(insights) {
  const container = document.getElementById('insightsList');
  // Keep the heading
  container.innerHTML = '<h3 style="margin-bottom: 1rem;">💡 Insights</h3>';

  if (!insights.length) {
    container.innerHTML += '<p style="color:var(--text-light);">Log more moods to unlock personalized insights 🌱</p>';
    return;
  }

  insights.slice(0, 8).forEach((insight, i) => {
    const item = document.createElement('div');
    item.className = 'insight-item';
    item.style.animation = `slideIn 0.5s ease ${i * 0.1}s both`;
    item.innerHTML = `<span class="insight-icon">${insight.icon}</span><span>${insight.text}</span>`;
    container.appendChild(item);
  });
}
