function launchSensory(type) {
  window.currentSensoryTrack = type;
  // Lock screen scrolling during early sensory gameplay to prevent iPad dragging conflict
  lockViewportScrolling();

  const container = document.getElementById("game-stage");
  if (!container) return;

  const tracks = ['spatial', 'numeric', 'attention', 'deduction', 'pattern', 'memory', 'language', 'analogy'];
  if (tracks.includes(type)) {
    initAppState();
    const level = appState.players.erbao.progress[type] || 1;
    launchErbaoSensory(type, level, container);
    return;
  }
  
  if (type === 'shape') {
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(245, 158, 11, 0.3);">
        <h2 style="color:#fbbf24; font-weight:800; margin-bottom:10px;">📐 形状分类厂 Shape Matcher</h2>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:30px;">🐰 淼淼宝宝，请把下方的图形积木拖放到对应的虚线槽里吧：</p>
        
        <div style="display:flex; justify-content:space-around; margin-bottom:40px; gap:15px; flex-wrap:wrap;">
          <div id="slot-circle" class="shape-slot glass-card" style="width:100px; height:100px; border:3px dashed rgba(255,255,255,0.3); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.85em;">圆形虚线</div>
          <div id="slot-square" class="shape-slot glass-card" style="width:100px; height:100px; border:3px dashed rgba(255,255,255,0.3); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.85em;">方形虚线</div>
          
          <!-- ADDED TRIANGLE SLOT -->
          <div id="slot-triangle" class="shape-slot glass-card" style="width:100px; height:100px; border:3px dashed rgba(255,255,255,0.3); clip-path: polygon(50% 0%, 0% 100%, 100% 100%); display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.8em; padding-top:40px; background:rgba(255,255,255,0.02);">三角虚线</div>
        </div>

        <div style="display:flex; justify-content:center; gap:25px; background:rgba(255,255,255,0.03); padding:25px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); flex-wrap:wrap;">
          <div id="drag-circle" class="drag-item" style="touch-action: none; width:80px; height:80px; background:linear-gradient(135deg, #ef4444, #f87171); border-radius:50%; cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 5px 15px rgba(239,68,68,0.45); font-size:1.1em; user-select:none;">圆积木</div>
          <div id="drag-square" class="drag-item" style="touch-action: none; width:80px; height:80px; background:linear-gradient(135deg, #3b82f6, #60a5fa); border-radius:12px; cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 5px 15px rgba(59,130,246,0.45); font-size:1.1em; user-select:none;">方积木</div>
          
          <!-- ADDED TRIANGLE DRAGGABLE -->
          <div id="drag-triangle" class="drag-item" style="touch-action: none; width:80px; height:80px; background:linear-gradient(135deg, #10b981, #34d399); clip-path: polygon(50% 0%, 0% 100%, 100% 100%); cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 5px 15px rgba(16,185,129,0.45); font-size:1em; padding-top:25px; user-select:none;">角积木</div>
        </div>
        <div style="display:flex; gap:15px; margin-top:35px;">
          <button class="mock-button glow-erbao" onclick="launchSensory('shape')" style="flex:1; margin-top:0;">🔄 一键重置重新选择</button>
          <button class="mock-button" onclick="loadErbaoHUD()" style="flex:1; margin-top:0;">🔙 返回启蒙舱大厅</button>
        </div>
      </div>
    `;
    setupSensoryDragDrop('shape');
  } 
  
  else if (type === 'color') {
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(245, 158, 11, 0.3);">
        <h2 style="color:#fbbf24; font-weight:800; margin-bottom:10px;">🎨 色彩能量站 Color Matcher</h2>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:30px;">🐰 淼淼宝宝，把彩色小球拖拽到相同颜色的发光舱中：</p>
        
        <div style="display:flex; justify-content:space-around; margin-bottom:40px; gap:10px; flex-wrap:wrap;">
          <div id="slot-red" class="shape-slot glass-card" style="width:90px; height:90px; border:2px dashed #ef4444; border-radius:20px; display:flex; align-items:center; justify-content:center; color:#fca5a5; font-weight:700; background:rgba(239,68,68,0.05); font-size:0.85em;">红发光舱</div>
          <div id="slot-green" class="shape-slot glass-card" style="width:90px; height:90px; border:2px dashed #10b981; border-radius:20px; display:flex; align-items:center; justify-content:center; color:#a7f3d0; font-weight:700; background:rgba(16,185,129,0.05); font-size:0.85em;">绿发光舱</div>
          <div id="slot-blue" class="shape-slot glass-card" style="width:90px; height:90px; border:2px dashed #3b82f6; border-radius:20px; display:flex; align-items:center; justify-content:center; color:#bfdbfe; font-weight:700; background:rgba(59,130,246,0.05); font-size:0.85em;">蓝发光舱</div>
          
          <!-- ADDED YELLOW SLOT -->
          <div id="slot-yellow" class="shape-slot glass-card" style="width:90px; height:90px; border:2px dashed #fbbf24; border-radius:20px; display:flex; align-items:center; justify-content:center; color:#fde68a; font-weight:700; background:rgba(251,191,36,0.05); font-size:0.85em;">黄发光舱</div>
        </div>

        <div style="display:flex; justify-content:center; gap:20px; background:rgba(255,255,255,0.03); padding:25px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); flex-wrap:wrap;">
          <div id="drag-red" class="drag-item" style="touch-action: none; width:65px; height:65px; background:#ef4444; border-radius:50%; cursor:grab; border:3px solid #f87171; box-shadow: 0 4px 12px rgba(239,68,68,0.4); text-align:center; line-height:59px; font-weight:bold; user-select:none;">红球</div>
          <div id="drag-green" class="drag-item" style="touch-action: none; width:65px; height:65px; background:#10b981; border-radius:50%; cursor:grab; border:3px solid #34d399; box-shadow: 0 4px 12px rgba(16,185,129,0.4); text-align:center; line-height:59px; font-weight:bold; user-select:none;">绿球</div>
          <div id="drag-blue" class="drag-item" style="touch-action: none; width:65px; height:65px; background:#3b82f6; border-radius:50%; cursor:grab; border:3px solid #60a5fa; box-shadow: 0 4px 12px rgba(59,130,246,0.4); text-align:center; line-height:59px; font-weight:bold; user-select:none;">蓝球</div>
          
          <!-- ADDED YELLOW DRAGGABLE -->
          <div id="drag-yellow" class="drag-item" style="touch-action: none; width:65px; height:65px; background:#eab308; border-radius:50%; cursor:grab; border:3px solid #facc15; box-shadow: 0 4px 12px rgba(234,179,8,0.4); text-align:center; line-height:59px; font-weight:bold; user-select:none;">黄球</div>
        </div>
        <div style="display:flex; gap:15px; margin-top:35px;">
          <button class="mock-button glow-erbao" onclick="launchSensory('color')" style="flex:1; margin-top:0;">🔄 一键重置重新选择</button>
          <button class="mock-button" onclick="loadErbaoHUD()" style="flex:1; margin-top:0;">🔙 返回启蒙舱大厅</button>
        </div>
      </div>
    `;
    setupSensoryDragDrop('color');
  } 
  
  else if (type === 'sound') {
    // Randomly select target animal sound (5 databases expanded!)
    const sounds = [
      { name: '小猫 (喵喵) 🐱', icon: '🐱', type: 'cat' },
      { name: '小狗 (汪汪) 🐶', icon: '🐶', type: 'dog' },
      { name: '汽车喇叭 (哔哔) 🚗', icon: '🚗', type: 'beep' },
      { name: '小山羊 (咩咩) 🐑', icon: '🐑', type: 'sheep' },
      { name: '小百灵 (叽叽) 🐦', icon: '🐦', type: 'bird' }
    ];
    
    // Pick 3 random options, making sure target is included
    const targetSound = sounds[Math.floor(Math.random() * sounds.length)];
    window.sensoryTargetSound = targetSound;
    
    // Shuffle options to list
    const options = [targetSound];
    while(options.length < 3) {
      const candidate = sounds[Math.floor(Math.random() * sounds.length)];
      if(!options.some(o => o.type === candidate.type)) {
        options.push(candidate);
      }
    }
    options.sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(245, 158, 11, 0.3);">
        <h2 style="color:#fbbf24; font-weight:800; margin-bottom:10px;">🔊 声光探测仪 Sound Pairing</h2>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:30px;">🐰 淼淼宝宝，点击大喇叭听声音，猜猜是谁在叫：</p>
        
        <button onclick="playSensorySound('${targetSound.type}')" class="mock-button glow-erbao" style="width:120px; height:120px; border-radius:50%; font-size:3.5em; display:block; margin: 0 auto 35px; box-shadow:0 0 25px rgba(245,158,11,0.3);">
          📢
        </button>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px;">
          ${options.map(s => `
            <div class="glass-card pulse-hover" onclick="guessSensorySound('${s.type}')" style="padding:15px 10px; cursor:pointer; text-align:center; border-color:rgba(255,255,255,0.06); border-radius:12px;">
              <span style="font-size:3.2em; display:block; margin-bottom:5px;">${s.icon}</span>
              <strong style="font-size:0.85em; color:#fff;">${s.name}</strong>
            </div>
          `).join("")}
        </div>
        <div style="display:flex; gap:15px; margin-top:35px;">
          <button class="mock-button glow-erbao" onclick="launchSensory('sound')" style="flex:1; margin-top:0;">🔄 一键重置重新选择</button>
          <button class="mock-button" onclick="loadErbaoHUD()" style="flex:1; margin-top:0;">🔙 返回启蒙舱大厅</button>
        </div>
      </div>
    `;
  }
}

// Custom real-time audio synthesizer using Web Audio API (Offline-first & High quality!)
function playSensorySound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === 'cat') {
      // 🐱 Upward meow frequency slide
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } 
    
    else if (type === 'dog') {
      // 🐶 Short triangle wave quick barking sound (Double woof!)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(140, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.16);
      gain1.gain.setValueAtTime(0.35, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.18);
      
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(140, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.16);
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.18);
      }, 220);
    } 
    
    else if (type === 'beep') {
      // 🚗 Standard clean beep frequency
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } 
    
    else if (type === 'sheep') {
      // 🐑 MODULATED low sawtooth/triangle "Baaa" sheep sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime); 
      osc.frequency.linearRampToValueAtTime(95, ctx.currentTime + 0.6); 
      
      lfo.type = 'sine';
      lfo.frequency.value = 13; 
      
      lfoGain.gain.value = 15; 
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.7);
      
      lfo.start();
      osc.start();
      
      lfo.stop(ctx.currentTime + 0.7);
      osc.stop(ctx.currentTime + 0.7);
    } 
    
    else if (type === 'bird') {
      // 🐦 High-frequency quick sweeping "chirps"
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1000, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.15); 
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);
      
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1200, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.18, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.15);
      }, 180);
    }
  } catch (err) {
    console.error("Audio Context blocked.", err);
  }
}

function guessSensorySound(guessedType) {
  if (guessedType === window.sensoryTargetSound.type) {
    playSensorySound(guessedType);
    
    const feedback = `答对啦！真的是【${window.sensoryTargetSound.name}】在叫！\n淼淼真棒！奖励 10 颗星星！🌟`;
    trigger2yoVictory(window.currentSensoryTrack || 'sound', feedback);
  } else {
    alert("❌ 不对哦。淼淼，再点小喇叭仔细听一下，猜猜这到底是谁的声音呢？🐰");
  }
}

// --- Unified Pointer Events Drag-and-Drop System (iPad & Touch Device Screen standard) ---
function setupSensoryDragDrop(mode) {
  const draggables = document.querySelectorAll('.drag-item');
  const slots = document.querySelectorAll('.shape-slot');
  
  draggables.forEach(drag => {
    // Add touch-action: none inline to fully disable browser panning while dragging
    drag.style.touchAction = 'none';

    let startX = 0, startY = 0;
    let isDragging = false;

    const onPointerDown = (e) => {
      drag.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      isDragging = true;
      drag.style.transition = 'none';
      drag.style.zIndex = '1000';
      drag.style.transform = 'scale(1.1)';
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      drag.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.1)`;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      drag.releasePointerCapture(e.pointerId);
      
      drag.style.zIndex = '';
      drag.style.transition = 'transform 0.2s, visibility 0.1s';
      drag.style.transform = 'none';

      // Probe target slot underneath pointer coordinates
      drag.style.pointerEvents = 'none';
      const targetElement = document.elementFromPoint(e.clientX, e.clientY);
      drag.style.pointerEvents = '';

      let slot = null;
      if (targetElement) {
        slot = targetElement.closest('.shape-slot');
      }

      if (slot) {
        handleSensoryDrop(drag.id, slot);
      }
    };

    drag.addEventListener('pointerdown', onPointerDown);
    drag.addEventListener('pointermove', onPointerMove);
    drag.addEventListener('pointerup', onPointerUp);
    drag.addEventListener('pointercancel', onPointerUp);
  });
}

function handleSensoryDrop(dragId, slot) {
  if (!dragId || !slot) return;
  
  const dragItem = document.getElementById(dragId);
  const dragType = dragId.split('-')[1]; // circle, square, triangle, red, green, blue, yellow
  const slotType = slot.id.split('-')[1];
  
  if (dragType === slotType) {
    slot.style.background = "rgba(16, 185, 129, 0.25)";
    slot.style.borderColor = "#10b981";
    slot.style.color = "#fff";
    slot.innerText = "正确 ✅";
    dragItem.style.visibility = "hidden";
    
    // Play happy validation sound
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
      o.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); 
      g.gain.setValueAtTime(0.2, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      o.start();
      o.stop(audioCtx.currentTime + 0.25);
    } catch(err){}
    
    checkSensoryVictory();
  } else {
    // Play error beep and display brief alert
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(220, audioCtx.currentTime);
      g.gain.setValueAtTime(0.15, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      o.start();
      o.stop(audioCtx.currentTime + 0.2);
    } catch(err){}
    alert("🐰 颜色或形状不对哦，再找同类的对对看！");
  }
}

function checkSensoryVictory() {
  const draggables = document.querySelectorAll('.drag-item');
  const allSolved = Array.from(draggables).every(item => item.style.visibility === "hidden");
  
  if (allSolved) {
    setTimeout(() => {
      const feedback = "太牛了！淼淼把所有颜色或形状都完美配对好了！奖励 10 颗星星！🌟";
      trigger2yoVictory(window.currentSensoryTrack || 'shape', feedback);
    }, 400);
  }
}

function trigger2yoVictory(type, speechFeedback) {
  if (!appState.players || !appState.players.erbao) initAppState();
  const player = appState.players.erbao;

  const earnedStars = 10;
  player.stars = (player.stars || 0) + earnedStars;
  saveAppState();

  // 更新 HUD 星星数
  const starEl = document.getElementById("star-count");
  if (starEl) starEl.innerText = `🪙 ${player.stars}`;

  // 播放好听的和弦声音
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(523.25, ctx.currentTime); 
    o.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); 
    o.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); 
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    o.start(); o.stop(ctx.currentTime + 0.35);
  } catch(err){}

  const container = document.getElementById("game-stage");
  container.innerHTML = `
    <div class="glass-card" style="padding:40px; text-align:center; max-width:500px; margin:40px auto; border-color:#fbbf24; background:rgba(251,191,36,0.08); border-width:2px; animation:pulseGlow 1.2s infinite ease-in-out;">
      <span style="font-size:5em; display:block; margin-bottom:10px;">🐰</span>
      <h2 style="color:#fbbf24; font-weight:800; margin-bottom:5px;">淼淼宝宝太棒啦！</h2>
      <p style="font-size:1.15em; color:#fff; font-weight:600; margin-bottom:15px;">${speechFeedback.replace(/\n/g, '<br>')}</p>
      
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:12px; margin:15px 0; font-size:1em; color:#fde68a;">
        获得奖励：<span style="font-weight:bold; font-size:1.2em;">🌟 +${earnedStars} 颗星星</span>
      </div>
      
      <p style="font-size:0.85em; color:#fbbf24; letter-spacing:1px; animation:blinker 1s linear infinite; margin-top:20px;">下一题马上要开始喽，准备好了吗？🚀</p>
    </div>
  `;

  // 播放语音
  speakText(speechFeedback);

  // 2 秒后自动出下一题
  setTimeout(() => {
    launchSensory(type);
  }, 2000);
}

function launchErbaoSensory(type, level, container) {
  if (type === 'spatial') {
    // 1. 平面形状分类厂 (Shape Matcher)
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">📐 平面形状分类厂 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，请把下方的图形积木拖放到对应的虚线槽里吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em; color:#a1a1aa; margin-bottom:20px;">🐰 淼淼，请把图形积木拖放到对应的虚线卡槽中：</p>
        
        <div style="display:flex; justify-content:space-around; margin-bottom:35px; gap:15px; flex-wrap:wrap;">
          <div id="slot-circle" class="shape-slot glass-card" style="width:90px; height:90px; border:3px dashed rgba(255,255,255,0.3); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.8em;">圆形虚线</div>
          <div id="slot-square" class="shape-slot glass-card" style="width:90px; height:90px; border:3px dashed rgba(255,255,255,0.3); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.8em;">方形虚线</div>
          <div id="slot-triangle" class="shape-slot glass-card" style="width:90px; height:90px; border:3px dashed rgba(255,255,255,0.3); clip-path: polygon(50% 0%, 0% 100%, 100% 100%); display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.75em; padding-top:35px; background:rgba(255,255,255,0.02);">三角虚线</div>
        </div>

        <div style="display:flex; justify-content:center; gap:20px; background:rgba(255,255,255,0.03); padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); flex-wrap:wrap;">
          <div id="drag-circle" class="drag-item" style="touch-action: none; width:75px; height:75px; background:linear-gradient(135deg, #ef4444, #f87171); border-radius:50%; cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(239,68,68,0.45); font-size:1em; user-select:none;">圆积木</div>
          <div id="drag-square" class="drag-item" style="touch-action: none; width:75px; height:75px; background:linear-gradient(135deg, #3b82f6, #60a5fa); border-radius:12px; cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(59,130,246,0.45); font-size:1em; user-select:none;">方积木</div>
          <div id="drag-triangle" class="drag-item" style="touch-action: none; width:75px; height:75px; background:linear-gradient(135deg, #10b981, #34d399); clip-path: polygon(50% 0%, 0% 100%, 100% 100%); cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(16,185,129,0.45); font-size:0.9em; padding-top:22px; user-select:none;">角积木</div>
        </div>
        <button class="mock-button glow-erbao" onclick="launchTest('spatial')" style="margin-top:25px; width:100%; border-color:transparent;">🔄 一键重置重新选择</button>
      </div>
    `;
    setupSensoryDragDrop('shape');
    speakText('淼淼宝宝，请把下方的图形积木拖放到对应的虚线槽里吧！');
  } 
  
  else if (type === 'numeric') {
    // 2. 淼淼数字数数 (Counting)
    const count = (level % 3) + 1; // 1, 2, 或 3
    const bubbleStr = '🔴'.repeat(count);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:15px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🔢 淼淼数字数数 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，数一数有几个红气球呀？点击下面的数字选出来吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:25px;">🐰 数一数，这里有几个【红气球 🔴】呢？</p>
        
        <div style="font-size:4em; margin:20px 0; letter-spacing:10px; display:flex; justify-content:center; gap:10px;">
          ${bubbleStr}
        </div>

        <div style="display:flex; justify-content:center; gap:20px; margin-top:25px;">
          ${[1, 2, 3].map(n => `
            <button class="mock-button glow-erbao" onclick="check2yoAnswer(${n}, ${count})" style="font-size:2.2em; width:80px; height:80px; border-radius:18px; font-weight:bold;">${n}</button>
          `).join('')}
        </div>
      </div>
    `;
    speakText(`淼淼宝宝，数一数有几个红气球呀？`);
  } 
  
  else if (type === 'attention') {
    // 3. 趣味找不同 (Spot the difference)
    const animalPool = ['🐼','🐶','🐱','🐮','🦁','🐸','🐷','🐨','🦊'];
    const baseEmoji = animalPool[(level - 1) % animalPool.length];
    const diffPool = ['🐰','🌟','🚗','🎈','🍒','🍓','👑'].filter(e => e !== baseEmoji);
    const diffEmoji = diffPool[Math.floor(Math.random() * diffPool.length)];
    
    // Create 3x3 array (8 base, 1 diff)
    const items = Array(8).fill(baseEmoji);
    const diffIdx = Math.floor(Math.random() * 9);
    items.splice(diffIdx, 0, diffEmoji);

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">⚡ 趣味找不同 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，快在里面找出那一个调皮的小调皮！把它点出来吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:20px;">🐰 谁和别人长得不一样？快把它点出来！</p>
        
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; max-width:240px; margin:20px auto;">
          ${items.map((emoji, idx) => `
            <button class="mock-button glow-erbao" onclick="checkAttention2yo(${idx}, ${diffIdx})" style="font-size:2.8em; height:70px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:14px; background:rgba(255,255,255,0.03);">${emoji}</button>
          `).join('')}
        </div>
      </div>
    `;
    speakText(`淼淼，快找出那个不一样的小调皮！`);
  } 
  
  else if (type === 'deduction') {
    // 4. 动物大小分类 (Big-Small Sorting)
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🔍 动物大小分类 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，把大象拖进大箱子，小松鼠拖进小箱子里吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em; color:#a1a1aa; margin-bottom:20px;">🐰 大动物住大箱子，小动物住小箱子：</p>
        
        <div style="display:flex; justify-content:space-around; margin-bottom:35px; gap:15px;">
          <div id="slot-big" class="shape-slot glass-card" style="width:120px; height:120px; border:3px dashed #fbbf24; border-radius:16px; display:flex; align-items:center; justify-content:center; color:#fbbf24; font-weight:800; font-size:0.88em; background:rgba(251,191,36,0.02);">📦 大箱子</div>
          <div id="slot-small" class="shape-slot glass-card" style="width:85px; height:85px; border:3px dashed rgba(255,255,255,0.3); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:800; font-size:0.75em;">📦 小箱子</div>
        </div>

        <div style="display:flex; justify-content:center; gap:30px; background:rgba(255,255,255,0.03); padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); align-items:center;">
          <div id="drag-big" class="drag-item" style="touch-action: none; width:95px; height:95px; background:linear-gradient(135deg, #fbbf24, #f59e0b); border-radius:16px; cursor:grab; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:800; color:black; box-shadow: 0 4px 12px rgba(251,191,36,0.4); user-select:none; font-size:1em;">
            <span style="font-size:1.6em;">🐘</span>大象
          </div>
          <div id="drag-small" class="drag-item" style="touch-action: none; width:65px; height:65px; background:linear-gradient(135deg, #3b82f6, #60a5fa); border-radius:12px; cursor:grab; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(59,130,246,0.4); user-select:none; font-size:0.8em;">
            <span style="font-size:1.3em;">🐹</span>松鼠
          </div>
        </div>
        <button class="mock-button glow-erbao" onclick="launchTest('deduction')" style="margin-top:25px; width:100%; border-color:transparent;">🔄 一键重置重新选择</button>
      </div>
    `;
    setupSensoryDragDrop('shape');
    speakText('淼淼，把大动物拖进大箱子，小动物拖进小箱子！');
  } 
  
  else if (type === 'pattern') {
    // 5. 图形 ABAB 规律
    const patternPairs = [
      { a: '🍎', b: '🍌' },
      { a: '🐱', b: '🐶' },
      { a: '🚗', b: '✈️' },
      { a: '🔴', b: '🔵' },
      { a: '⭐', b: '🌙' }
    ];
    const pair = patternPairs[(level - 1) % patternPairs.length];
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🎨 图形 ABAB 规律 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，看这串好玩的规律，问号的地方应该放哪个图案呢？');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:20px;">🐰 观察规律，问号【❓】处应该填什么呢？</p>
        
        <div style="display:flex; justify-content:center; gap:12px; margin:25px 0; font-size:2.8em; align-items:center;">
          <span>${pair.a}</span>
          <span>${pair.b}</span>
          <span>${pair.a}</span>
          <span>${pair.b}</span>
          <span style="font-weight:bold; color:#fbbf24; border:2px dashed #fbbf24; width:65px; height:65px; display:inline-flex; align-items:center; justify-content:center; border-radius:12px; font-size:0.8em;">❓</span>
        </div>

        <div style="display:flex; justify-content:center; gap:20px; margin-top:25px;">
          <button class="mock-button glow-erbao" onclick="checkPatternAnswer('${pair.a}', '${pair.a}')" style="font-size:2.2em; width:80px; height:80px; border-radius:18px;">${pair.a}</button>
          <button class="mock-button glow-erbao" onclick="checkPatternAnswer('${pair.b}', '${pair.a}')" style="font-size:2.2em; width:80px; height:80px; border-radius:18px;">${pair.b}</button>
        </div>
      </div>
    `;
    speakText('淼淼宝宝，问号的地方应该放哪个呢？');
  } 
  
  else if (type === 'memory') {
    // 6. 闪现记忆配对 (Memory Match)
    const emojis = ['🚗','🍉','🐶','🐱','🦁','👑','✈️','🍇','🍓','🐰','🎁','🎈','🌟'];
    const targetEmoji = emojis[(level - 1) % emojis.length];
    
    // Choose distractor options
    const pool = [targetEmoji];
    while(pool.length < 3) {
      const candidate = emojis[Math.floor(Math.random() * emojis.length)];
      if(!pool.includes(candidate)) pool.push(candidate);
    }
    pool.sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🧠 闪现记忆配对 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，仔细盯住这个漂亮的图案！马上要变魔法消失喽！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p id="memory-t-label" style="font-size:1em; color:#a1a1aa; margin-bottom:20px;">👀 淼淼，仔细记住这个可爱的图案：</p>
        
        <div id="2yo-memory-disp" class="glass-card" style="font-size:5.5em; width:120px; height:120px; margin:25px auto; display:flex; align-items:center; justify-content:center; border-color:#fbbf24; background:rgba(251,191,36,0.05); border-width:2px; border-radius:20px; transition:all 0.3s;">
          ${targetEmoji}
        </div>
        <div id="2yo-memory-cd" style="font-size:1em; color:#fbbf24; font-weight:700;">3 秒后开始消失...</div>
        <div id="2yo-memory-opts" style="display:none; justify-content:center; gap:20px; margin-top:25px;">
          ${pool.map(o => `
            <button class="mock-button glow-erbao" onclick="checkMemory2yo('${o}', '${targetEmoji}')" style="font-size:2.8em; width:80px; height:80px; border-radius:18px;">${o}</button>
          `).join('')}
        </div>
      </div>
    `;
    speakText('淼淼宝宝，仔细盯住这个图案！');

    let cd = 3;
    const timer = setInterval(() => {
      cd--;
      const cdEl = document.getElementById('2yo-memory-cd');
      if (cdEl) cdEl.innerText = `${cd} 秒后开始消失...`;
      if (cd <= 0) {
        clearInterval(timer);
        const disp = document.getElementById('2yo-memory-disp');
        if (disp) disp.innerText = '❓';
        const label = document.getElementById('memory-t-label');
        if (label) label.innerText = '🦁 刚才藏起来的是哪一个呢？请选出来！';
        const cdDiv = document.getElementById('2yo-memory-cd');
        if (cdDiv) cdDiv.style.display = 'none';
        const opts = document.getElementById('2yo-memory-opts');
        if (opts) opts.style.display = 'flex';
        speakText('刚才那个图案是什么呀？选出来吧！');
      }
    }, 1000);
  } 
  
  else if (type === 'language') {
    // 7. 声光探测仪 (Sound Pairing)
    const sounds = [
      { name: '小猫 (喵喵) 🐱', icon: '🐱', type: 'cat' },
      { name: '小狗 (汪汪) 🐶', icon: '🐶', type: 'dog' },
      { name: '汽车喇叭 (哔哔) 🚗', icon: '🚗', type: 'beep' },
      { name: '小山羊 (咩咩) 🐑', icon: '🐑', type: 'sheep' },
      { name: '小百灵 (叽叽) 🐦', icon: '🐦', type: 'bird' }
    ];
    const targetSound = sounds[(level - 1) % sounds.length];
    window.sensoryTargetSound = targetSound;

    const pool = [targetSound];
    while(pool.length < 3) {
      const candidate = sounds[Math.floor(Math.random() * sounds.length)];
      if(!pool.some(o => o.type === candidate.type)) pool.push(candidate);
    }
    pool.sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <h3 style="color:#fbbf24; font-weight:800; margin-bottom:10px;">🔊 声光探测仪 (第 ${level} 关)</h3>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:30px;">🐰 淼淼宝宝，点击大喇叭听声音，猜猜是谁在叫：</p>
        
        <button onclick="playSensorySound('${targetSound.type}')" class="mock-button glow-erbao" style="width:110px; height:110px; border-radius:50%; font-size:3.2em; display:block; margin: 0 auto 35px; box-shadow:0 0 20px rgba(245,158,11,0.25);">
          📢
        </button>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px;">
          ${pool.map(s => `
            <div class="glass-card pulse-hover" onclick="guessSensorySound('${s.type}')" style="padding:15px 10px; cursor:pointer; text-align:center; border-color:rgba(255,255,255,0.06); border-radius:12px;">
              <span style="font-size:3em; display:block; margin-bottom:5px;">${s.icon}</span>
              <strong style="font-size:0.85em; color:#fff;">${s.name}</strong>
            </div>
          `).join("")}
        </div>
        <button class="mock-button glow-erbao" onclick="launchTest('language')" style="margin-top:25px; width:100%; border-color:transparent;">🔄 换个声音再听一次</button>
      </div>
    `;
    playSensorySound(targetSound.type);
    speakText('淼淼宝宝，点击大喇叭听听是谁的声音？');
  } 
  
  else if (type === 'analogy') {
    // 8. 淼淼认知关联 (Association)
    const associations = [
      { q: '小狗 🐶 爱吃骨头 🦴，那小猫 🐱 爱吃什么呢？', ans: '🐟', desc: '美味的小鱼', opts: ['🐟', '🚗'] },
      { q: '小松鼠 🐹 住在树洞里，那小鸟 🐦 住在哪里呢？', ans: '🪹', desc: '树枝编的鸟巢', opts: ['🪹', '✈️'] },
      { q: '小兔子 🐰 跑得快，那小蜗牛 🐌 爬得怎么样呢？', ans: '🐌', desc: '爬得非常慢', opts: ['🐌', '🚀'] },
      { q: '太阳 ☀️ 在大白天出来，那月亮 🌙 在什么时候出来呢？', ans: '🌃', desc: '静静的黑夜', opts: ['🌃', '☀️'] },
      { q: '小飞机 ✈️ 在天上飞，那小木船 🚢 在哪里开呢？', ans: '🌊', desc: '宽广的河水里', opts: ['🌊', '☁️'] }
    ];
    const item = associations[(level - 1) % associations.length];

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🔗 淼淼认知关联 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('${item.q.replace(/['\"]/g, '')}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:25px;">🐰 ${item.q}</p>
        
        <div style="display:flex; justify-content:center; gap:25px; margin-top:25px;">
          ${item.opts.map(o => `
            <button class="mock-button glow-erbao" onclick="check2yoAssociation('${o}', '${item.ans}')" style="font-size:3.2em; width:100px; height:100px; border-radius:20px;">
              ${o}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    speakText(item.q);
  }
}

function check2yoAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, `答对啦！真的是 ${correct} 个！淼淼太棒了！加十颗星星！`);
  } else {
    speakText("数错了哦，再仔细数一数气球！");
    showWrongToast();
  }
}

function checkAttention2yo(idx, diffIdx) {
  if (idx === diffIdx) {
    trigger6yoVictory(10, "哇！淼淼火眼金睛，一下就把小兔子揪出来啦！棒棒哒！");
  } else {
    speakText("不是这个哦，再看哪个和其他人不一样？");
    showWrongToast();
  }
}

function checkPatternAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "规律找对啦！淼淼宝宝最聪明了！给你大大的赞！");
  } else {
    speakText("不对哦，仔细观察规律是什么？");
    showWrongToast();
  }
}

function checkMemory2yo(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "哇！淼淼的小眼睛记得真牢！记忆力超级棒！");
  } else {
    speakText("不对哦，再想一想刚才那个闪现的图案是什么？");
    showWrongToast();
  }
}

function check2yoAssociation(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "太厉害啦！淼淼知道的好多，常识完全正确！奖励十颗星星！");
  } else {
    speakText("不对哦，再仔细想一想它们有什么关联？");
    showWrongToast();
  }
}
