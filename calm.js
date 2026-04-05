/* ═══════════════════════════════════════════════
   MOODMANSION — Calm Agent (Agent 3)
   Breathing exercises, sounds, guided relaxation
   ═══════════════════════════════════════════════ */

const CalmAgent = {
  // Breathing patterns: [inhale, hold, exhale, hold] in seconds
  patterns: {
    '4-7-8': { phases: [4, 7, 8, 0], name: '4-7-8 Relaxation', desc: 'Inhale 4s, Hold 7s, Exhale 8s — deeply calming' },
    'box': { phases: [4, 4, 4, 4], name: 'Box Breathing', desc: 'Equal 4s phases — used by Navy SEALs for focus' },
    'calm': { phases: [5, 0, 5, 0], name: 'Calm Breathing', desc: 'Simple 5s in, 5s out — perfect for beginners' }
  },

  // Guided exercises
  exercises: {
    grounding: {
      title: '5-4-3-2-1 Grounding',
      steps: [
        '🔵 Name 5 things you can SEE right now',
        '🟢 Name 4 things you can TOUCH right now',
        '🟡 Name 3 things you can HEAR right now',
        '🟠 Name 2 things you can SMELL right now',
        '🔴 Name 1 thing you can TASTE right now',
        '✨ You are here. You are present. You are safe.'
      ]
    },
    bodyscan: {
      title: 'Body Scan Meditation',
      steps: [
        '🌟 Close your eyes and take three deep breaths...',
        '👑 Bring attention to the top of your head. Release any tension...',
        '😌 Soften your forehead, your eyes, your jaw...',
        '💪 Let your shoulders drop away from your ears...',
        '💚 Feel your chest rise and fall naturally...',
        '🌊 Let warmth flow down through your arms to your fingertips...',
        '🌿 Relax your belly, your hips, your legs...',
        '🦶 Feel your feet grounded to the earth...',
        '✨ Your whole body is relaxed, peaceful, and at ease.'
      ]
    },
    gratitude: {
      title: 'Gratitude Moment',
      steps: [
        '🙏 Take a deep breath and center yourself...',
        '💜 Think of ONE person you\'re grateful for. Hold them in your heart...',
        '🌸 Think of ONE experience that brought you joy recently...',
        '🌿 Think of ONE simple thing you often take for granted...',
        '✨ Feel the warmth of gratitude expanding in your chest...',
        '🌈 Carry this feeling with you. Gratitude is your superpower.'
      ]
    },
    visualization: {
      title: 'Safe Place Visualization',
      steps: [
        '🌅 Close your eyes. Take three slow, deep breaths...',
        '🏝️ Imagine yourself in the most peaceful place you can think of...',
        '👀 Look around. What do you see? Colors, shapes, light...',
        '👂 What sounds surround you? Perhaps gentle water, birdsong, soft wind...',
        '🌡️ Feel the perfect temperature on your skin. You are completely comfortable...',
        '🌸 Breathe in the scent of this place. It smells like peace...',
        '💜 This place is yours. You can return here anytime you need to...',
        '✨ Slowly bring this peace back with you as you open your eyes.'
      ]
    }
  }
};

// ── Breathing Exercise Logic ──
let breathingActive = false;
let breathingInterval = null;
let currentPattern = '4-7-8';

function initCalm() {
  // Reset breathing state when entering page
  if (!breathingActive) {
    document.getElementById('breathText').textContent = 'Tap to Begin';
    document.getElementById('breathPhase').textContent = CalmAgent.patterns[currentPattern].name;
  }
}

function toggleBreathing() {
  if (breathingActive) {
    stopBreathing();
  } else {
    startBreathing();
  }
}

function startBreathing() {
  breathingActive = true;
  const circle = document.getElementById('breathCircle');
  circle.classList.add('active');

  const pattern = CalmAgent.patterns[currentPattern];
  const phases = ['Breathe In...', 'Hold...', 'Breathe Out...', 'Hold...'];
  const durations = pattern.phases;
  let phaseIndex = 0;

  function runPhase() {
    if (!breathingActive) return;

    // Skip phases with 0 duration
    if (durations[phaseIndex] === 0) {
      phaseIndex = (phaseIndex + 1) % 4;
      runPhase();
      return;
    }

    const breathText = document.getElementById('breathText');
    const breathPhase = document.getElementById('breathPhase');
    breathText.textContent = phases[phaseIndex];
    breathPhase.textContent = `${durations[phaseIndex]} seconds — ${pattern.name}`;

    // Countdown
    let remaining = durations[phaseIndex];
    breathText.textContent = `${phases[phaseIndex]} ${remaining}`;

    breathingInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(breathingInterval);
        phaseIndex = (phaseIndex + 1) % 4;
        if (breathingActive) runPhase();
      } else {
        breathText.textContent = `${phases[phaseIndex]} ${remaining}`;
      }
    }, 1000);
  }

  runPhase();
  MoodStore.addMood('Calm', 'Started a breathing exercise');
}

function stopBreathing() {
  breathingActive = false;
  clearInterval(breathingInterval);
  const circle = document.getElementById('breathCircle');
  circle.classList.remove('active');
  document.getElementById('breathText').textContent = 'Tap to Begin';
  document.getElementById('breathPhase').textContent = CalmAgent.patterns[currentPattern].name;
  showToast('Beautiful session! 🧘 Your body thanks you.');
}

// ── Ambient Sound System (using Web Audio API oscillators) ──
const soundContexts = {};

function toggleSound(btn) {
  const sound = btn.dataset.sound;
  btn.classList.toggle('active');

  if (btn.classList.contains('active')) {
    startAmbientSound(sound);
  } else {
    stopAmbientSound(sound);
  }
}

function startAmbientSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const nodes = [];

  // Generate soothing ambient sounds using oscillators + noise
  switch (type) {
    case 'rain': {
      // Brown noise for rain
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.15;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 800;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      nodes.push(source, gain, filter);
      break;
    }
    case 'ocean': {
      // Low frequency oscillation for ocean waves
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 0.1;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      // Create noise
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.12;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      source.connect(filter).connect(noiseGain).connect(ctx.destination);
      source.start();
      // Modulate volume for wave effect
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.06;
      lfo.connect(lfoGain).connect(noiseGain.gain);
      lfo.start();
      nodes.push(source, lfo, noiseGain, filter);
      break;
    }
    case 'forest': {
      // High-pitched filtered noise for wind through trees
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.value = 0.04;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      nodes.push(source, filter, gain);
      break;
    }
    case 'fire': {
      // Crackling fire: random pops with low rumble
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
        if (Math.random() > 0.98) data[i] *= 3;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      const gain = ctx.createGain();
      gain.gain.value = 0.12;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      nodes.push(source, filter, gain);
      break;
    }
    case 'wind': {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.01 * white)) / 1.01;
        lastOut = data[i];
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      filter.Q.value = 0.3;
      const gain = ctx.createGain();
      gain.gain.value = 0.2;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.1;
      lfo.connect(lfoGain).connect(gain.gain);
      lfo.start();
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      nodes.push(source, filter, gain, lfo);
      break;
    }
  }

  soundContexts[type] = { ctx, nodes };
}

function stopAmbientSound(type) {
  if (soundContexts[type]) {
    soundContexts[type].ctx.close();
    delete soundContexts[type];
  }
}

// ── Guided Exercise System ──
function startExercise(type) {
  const exercise = CalmAgent.exercises[type];
  if (!exercise) return;

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'exerciseOverlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999; background: rgba(26,22,37,0.85);
    backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.5s ease;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: rgba(255,255,255,0.95); border-radius: 24px; padding: 3rem;
    max-width: 500px; width: 90%; text-align: center; position: relative;
    box-shadow: 0 30px 80px rgba(0,0,0,0.2);
  `;

  modal.innerHTML = `
    <h2 style="font-family: 'Playfair Display', serif; margin-bottom: 0.5rem;">${exercise.title}</h2>
    <p style="color: var(--text-light); margin-bottom: 2rem; font-size: 0.9rem;">Follow each step gently. There's no rush.</p>
    <div id="exerciseStep" style="font-size: 1.2rem; min-height: 80px; display: flex; align-items: center; justify-content: center; padding: 1rem; color: var(--text-dark); line-height: 1.6;"></div>
    <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
      <button id="exerciseNext" style="padding: 0.8rem 2rem; border-radius: 50px; border: none; cursor: pointer; background: linear-gradient(135deg, #E8D5F5, #F5D5E0, #D5F5E8); font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 1rem; transition: all 0.3s;">Next Step →</button>
      <button id="exerciseClose" style="padding: 0.8rem 1.5rem; border-radius: 50px; border: 1px solid rgba(0,0,0,0.1); cursor: pointer; background: white; font-family: 'Outfit', sans-serif; font-size: 0.9rem; color: var(--text-light); transition: all 0.3s;">Close</button>
    </div>
    <div id="exerciseProgress" style="margin-top: 1.5rem; display: flex; gap: 6px; justify-content: center;"></div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Setup steps
  let currentStep = 0;
  const stepEl = modal.querySelector('#exerciseStep');
  const progressEl = modal.querySelector('#exerciseProgress');
  const nextBtn = modal.querySelector('#exerciseNext');
  const closeBtn = modal.querySelector('#exerciseClose');

  // Create progress dots
  exercise.steps.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.style.cssText = `width: 8px; height: 8px; border-radius: 50%; background: ${i === 0 ? 'var(--lavender)' : 'rgba(0,0,0,0.1)'}; transition: all 0.3s;`;
    progressEl.appendChild(dot);
  });

  function showStep(idx) {
    stepEl.style.opacity = '0';
    stepEl.style.transform = 'translateY(10px)';
    setTimeout(() => {
      stepEl.textContent = exercise.steps[idx];
      stepEl.style.opacity = '1';
      stepEl.style.transform = 'translateY(0)';
      stepEl.style.transition = 'all 0.5s ease';
    }, 300);
    progressEl.querySelectorAll('span').forEach((dot, i) => {
      dot.style.background = i <= idx ? 'var(--lavender)' : 'rgba(0,0,0,0.1)';
    });
    nextBtn.textContent = idx === exercise.steps.length - 1 ? 'Complete ✨' : 'Next Step →';
  }

  showStep(0);

  nextBtn.onclick = () => {
    currentStep++;
    if (currentStep >= exercise.steps.length) {
      overlay.remove();
      showToast(`${exercise.title} complete! 🧘 Beautiful work.`);
      MoodStore.addMood('Calm', `Completed ${exercise.title}`);
      MoodStore.addInsight(`You completed the "${exercise.title}" exercise — wonderful self-care! 🌿`, '🧘');
    } else {
      showStep(currentStep);
    }
  };

  closeBtn.onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}
