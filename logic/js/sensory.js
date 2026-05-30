function launchSensory(type) {
  window.currentSensoryTrack = type;
  // Lock screen scrolling during early sensory gameplay to prevent iPad dragging conflict
  lockViewportScrolling();

  const container = document.getElementById("game-stage");
  
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
