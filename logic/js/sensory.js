function launchSensory(type) {
  window.currentSensoryTrack = type;
  window.currentGameTrack = type;
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
      // 🐑 MODULATED sheep bleat sound
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
      // 🐦 High-frequency sweeping chirps
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
    
    else if (type === 'duck') {
      // 🦆 rapid nasal sawtooth pulses
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(170, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
    
    else if (type === 'frog') {
      // 🐸 low pitch clicks
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(70, ctx.currentTime);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
    
    else if (type === 'bell') {
      // 🔔 metallic chime ring
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.85);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    }
    
    else if (type === 'cow') {
      // 🐮 low-pitched mooing slide
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(105, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.65);
      gain.gain.setValueAtTime(0.24, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.65);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    }
    
    else if (type === 'rooster') {
      // 🐔 high-pitched cock-a-doodle-doo slide
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.32);
      osc.frequency.linearRampToValueAtTime(680, ctx.currentTime + 0.58);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.62);
      osc.start();
      osc.stop(ctx.currentTime + 0.62);
    }
  } catch (err) {
    console.error("Audio Context blocked.", err);
  }
}

function guessSensorySound(guessedType) {
  if (guessedType === window.sensoryTargetSound.type) {
    playSensorySound(guessedType);
    
    const feedback = `答对啦！真的是【${window.sensoryTargetSound.name}】在叫！\n淼淼真棒！加十个星星！`;
    trigger6yoVictory(10, feedback);
  } else {
    trigger6yoFailure(`这是【${window.sensoryTargetSound.name}】发出的声音哦！我们可以多点大喇叭，仔细听听它的叫声特点！`, `正确答案是【${window.sensoryTargetSound.name}】`);
  }
}

// --- Unified Pointer Events Drag-and-Drop System (iPad & Touch Device Screen standard) ---
function setupSensoryDragDrop(mode) {
  const draggables = document.querySelectorAll('.drag-item');
  const slots = document.querySelectorAll('.shape-slot');
  
  draggables.forEach(drag => {
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
  const dragType = dragId.split('-')[1]; // circle, square, triangle, big, small
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
    // Play error beep and trigger central failure card
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
    
    if (dragType === 'big' || dragType === 'small') {
      trigger6yoFailure("大大的动物要住进大的箱子，小小的动物要住进小的箱子哦！可以用眼睛比一比它们谁的个子更大！", "大箱子配大动物，小箱子配小动物");
    } else {
      trigger6yoFailure("形状配对需要看清形状的轮廓哦，圆形要找圆圆的卡槽，三角形要找有三个尖尖角的卡槽！", "正确匹配形状卡槽");
    }
  }
}

function checkSensoryVictory() {
  const draggables = document.querySelectorAll('.drag-item');
  const allSolved = Array.from(draggables).every(item => item.style.visibility === "hidden");
  
  if (allSolved) {
    setTimeout(() => {
      const feedback = "太牛了！淼淼把所有形状都完美配对好了！🌟";
      trigger6yoVictory(10, feedback);
    }, 400);
  }
}

// ==================== 淼淼 (2岁) 萌新感官启蒙 8大轨道 50关动态命题引擎 ====================

function getErbaoSpatialConfig(level) {
  const colors = [
    { name: '红', hex: '#ef4444', grad: 'linear-gradient(135deg, #ef4444, #f87171)' },
    { name: '蓝', hex: '#3b82f6', grad: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
    { name: '绿', hex: '#10b981', grad: 'linear-gradient(135deg, #10b981, #34d399)' },
    { name: '黄', hex: '#fbbf24', grad: 'linear-gradient(135deg, #fbbf24, #facc15)' },
    { name: '粉', hex: '#ec4899', grad: 'linear-gradient(135deg, #ec4899, #f472b6)' },
    { name: '紫', hex: '#a855f7', grad: 'linear-gradient(135deg, #a855f7, #c084fc)' },
    { name: '橙', hex: '#f97316', grad: 'linear-gradient(135deg, #f97316, #fb923c)' }
  ];

  const c1 = colors[(level * 3) % colors.length];
  const c2 = colors[(level * 3 + 1) % colors.length];
  const c3 = colors[(level * 3 + 2) % colors.length];

  return {
    slots: [
      { id: 'slot-circle', label: `${c1.name}色圆形 🔴`, shape: 'circle', color: c1.hex, grad: c1.grad, style: `width:90px; height:90px; border:3px dashed ${c1.hex}; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.75em; background:rgba(255,255,255,0.02);` },
      { id: 'slot-square', label: `${c2.name}色方形 🟦`, shape: 'square', color: c2.hex, grad: c2.grad, style: `width:90px; height:90px; border:3px dashed ${c2.hex}; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.75em; background:rgba(255,255,255,0.02);` },
      { id: 'slot-triangle', label: `${c3.name}色三角 🔺`, shape: 'triangle', color: c3.hex, grad: c3.grad, style: `width:90px; height:90px; border:3px dashed ${c3.hex}; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.72em; padding-top:35px; background:rgba(255,255,255,0.02);` }
    ],
    draggables: [
      { id: 'drag-circle', label: `${c1.name}圆木`, shape: 'circle', style: `touch-action: none; width:75px; height:75px; background:${c1.grad}; border-radius:50%; cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size:0.9em; user-select:none;` },
      { id: 'drag-square', label: `${c2.name}方木`, shape: 'square', style: `touch-action: none; width:75px; height:75px; background:${c2.grad}; border-radius:12px; cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size:0.9em; user-select:none;` },
      { id: 'drag-triangle', label: `${c3.name}角木`, shape: 'triangle', style: `touch-action: none; width:75px; height:75px; background:${c3.grad}; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size:0.85em; padding-top:22px; user-select:none;` }
    ]
  };
}

function getErbaoNumericConfig(level) {
  const items = [
    { icon: '🔴', name: '红气球' },
    { icon: '🌟', name: '金黄星' },
    { icon: '🐱', name: '小猫咪' },
    { icon: '🦆', name: '小黄鸭' },
    { icon: '🎈', name: '彩气球' },
    { icon: '🍎', name: '红苹果' },
    { icon: '🚗', name: '小汽车' },
    { icon: '🍓', name: '甜草莓' },
    { icon: '🌸', name: '粉花朵' },
    { icon: '🐻', name: '小熊熊' }
  ];
  
  const selectedItem = items[(level - 1) % items.length];
  
  let maxLimit = 3;
  if (level > 35) maxLimit = 5;
  else if (level > 15) maxLimit = 4;
  
  const count = ((level * 7) % maxLimit) + 1;
  const itemStr = selectedItem.icon.repeat(count);
  
  const options = [];
  for (let i = 1; i <= maxLimit; i++) options.push(i);
  
  return {
    icon: selectedItem.icon,
    itemName: selectedItem.name,
    count: count,
    itemStr: itemStr,
    options: options
  };
}

function getErbaoAttentionConfig(level) {
  const basePool = ['🐼','🐶','🐱','🐮','🦁','🐸','🐷','🐨','🦊','🐻','🐯','🐹'];
  const diffPool = ['🐰','🌟','🚗','🎈','🍒','🍓','👑','🍎','🎁','🍬','🍰','🦋'];
  
  const baseEmoji = basePool[(level - 1) % basePool.length];
  const diffEmoji = diffPool[(level * 3) % diffPool.length];
  
  const gridSize = level <= 15 ? 2 : 3; // 2x2 vs 3x3
  const gridCount = gridSize * gridSize;
  const items = Array(gridCount - 1).fill(baseEmoji);
  const diffIdx = (level * 11) % gridCount;
  items.splice(diffIdx, 0, diffEmoji);
  
  return {
    baseEmoji,
    diffEmoji,
    items,
    diffIdx,
    gridSize
  };
}

function getErbaoDeductionConfig(level) {
  const bigs = [
    { icon: '🐘', name: '大象' },
    { icon: '🦁', name: '狮子' },
    { icon: '🐳', name: '鲸鱼' },
    { icon: '🐻', name: '大熊' },
    { icon: 'Rex 🦖', name: '恐龙' },
    { icon: '🦛', name: '河马' },
    { icon: '🦒', name: '长颈鹿' },
    { icon: '🦈', name: '大鲨鱼' },
    { icon: '🐄', name: '大奶牛' },
    { icon: '🐫', name: '大骆驼' }
  ];
  
  const smalls = [
    { icon: '🐹', name: '仓鼠' },
    { icon: '🐝', name: '蜜蜂' },
    { icon: '🐟', name: '小鱼' },
    { icon: '🐜', name: '蚂蚁' },
    { icon: '🐥', name: '小鸡' },
    { icon: '🐞', name: '瓢虫' },
    { icon: '🐌', name: '蜗牛' },
    { icon: '🦋', name: '蝴蝶' },
    { icon: '🐛', name: '毛毛虫' },
    { icon: '🦗', name: '蟋蟀' }
  ];
  
  const big = bigs[(level - 1) % bigs.length];
  const small = smalls[(level * 3) % smalls.length];
  
  return {
    bigIcon: big.icon,
    bigName: big.name,
    smallIcon: small.icon,
    smallName: small.name
  };
}

function getErbaoPatternConfig(level) {
  const pairs = [
    { a: '🍎', b: '🍌' },
    { a: '🐱', b: '🐶' },
    { a: '🚗', b: '✈️' },
    { a: '🔴', b: '🔵' },
    { a: '⭐', b: '🌙' },
    { a: '🎈', b: '🎁' },
    { a: '🍦', b: '🍩' },
    { a: '🍀', b: '🌸' },
    { a: '⚽', b: '🏀' },
    { a: '🦁', b: '🐰' }
  ];
  
  const pair = pairs[(level - 1) % pairs.length];
  
  let patternType = 'abab';
  if (level > 40) patternType = 'abb';
  else if (level > 25) patternType = 'aab';
  
  let sequence = [];
  let answer = '';
  
  if (patternType === 'abab') {
    sequence = [pair.a, pair.b, pair.a, pair.b];
    answer = pair.a;
  } else if (patternType === 'aab') {
    sequence = [pair.a, pair.a, pair.b, pair.a, pair.a];
    answer = pair.b;
  } else {
    sequence = [pair.a, pair.b, pair.b, pair.a, pair.b];
    answer = pair.b;
  }
  
  return {
    a: pair.a,
    b: pair.b,
    sequence: sequence,
    ans: answer
  };
}

function getErbaoMemoryConfig(level) {
  const categories = [
    { name: '水果', items: ['🍎','🍌','🍉','🍇','🍓','🍒','🍍','🍊'] },
    { name: '动物', items: ['🐱','🐶','🐰','🐼','🦁','🐨','🐻','🦊'] },
    { name: '玩具', items: ['🎈','🎁','🎨','🛹','🧸','🎺','🪁','🧱'] },
    { name: '食物', items: ['🍦','🍩','🍰','🍬','🍭','🍪','🍕','🍔'] },
    { name: '大自然', items: ['⭐','🌙','☀️','☁️','🌈','🌸','🍀','🍁'] }
  ];
  
  const cat = categories[(level - 1) % categories.length];
  const targetIdx = (level * 3) % cat.items.length;
  const targetEmoji = cat.items[targetIdx];
  
  const diffCat = categories[(level) % categories.length];
  const distractor1 = diffCat.items[(level * 2) % diffCat.items.length];
  
  const otherCat = categories[(level + 1) % categories.length];
  const distractor2 = otherCat.items[(level * 4) % otherCat.items.length];
  
  const pool = [targetEmoji, distractor1, distractor2];
  pool.sort((x, y) => ((targetEmoji.charCodeAt(0) + level) % 3) - 1.5);
  
  return {
    targetEmoji: targetEmoji,
    pool: pool,
    catName: cat.name
  };
}

function getErbaoLanguageConfig(level) {
  const sounds = [
    { name: '小猫 (喵喵) 🐱', icon: '🐱', type: 'cat' },
    { name: '小狗 (汪汪) 🐶', icon: '🐶', type: 'dog' },
    { name: '汽车喇叭 (哔哔) 🚗', icon: '🚗', type: 'beep' },
    { name: '小山羊 (咩咩) 🐑', icon: '🐑', type: 'sheep' },
    { name: '小百灵 (叽叽) 🐦', icon: '🐦', type: 'bird' },
    { name: '小鸭子 (嘎嘎) 🦆', icon: '🦆', type: 'duck' },
    { name: '小青蛙 (呱呱) 🐸', icon: '🐸', type: 'frog' },
    { name: '金铜铃 (叮咚) 🔔', icon: '🔔', type: 'bell' },
    { name: '大奶牛 (哞哞) 🐮', icon: '🐮', type: 'cow' },
    { name: '大公鸡 (喔喔) 🐔', icon: '🐔', type: 'rooster' }
  ];
  
  const targetSound = sounds[(level - 1) % sounds.length];
  
  const pool = [targetSound];
  let offset = 1;
  while (pool.length < 3) {
    const candidate = sounds[(level - 1 + offset) % sounds.length];
    if (!pool.some(p => p.type === candidate.type)) {
      pool.push(candidate);
    }
    offset++;
  }
  
  pool.sort((x, y) => ((targetSound.name.charCodeAt(0) + level) % 3) - 1.5);
  
  return {
    targetSound: targetSound,
    pool: pool
  };
}

const ERBAO_ANALOGY_QUESTIONS = [
  { q: '小狗 🐶 爱吃骨头 🦴，那小猫 🐱 爱吃什么呢？', ans: '🐟', opts: ['🐟', '🚗'] },
  { q: '小松鼠 🐹 住在树洞里，那小鸟 🐦 住在哪里呢？', ans: '🪹', opts: ['🪹', '✈️'] },
  { q: '小兔子 🐰 跑得快，那小蜗牛 🐌 爬得怎么样呢？', ans: '🐌', opts: ['🐌', '🚀'] },
  { q: '太阳 ☀️ 在大白天出来，那月亮 🌙 在什么时候出来呢？', ans: '🌃', opts: ['🌃', '☀️'] },
  { q: '小飞机 ✈️ 在天上飞，那小木船 🚢 在哪里开呢？', ans: '🌊', opts: ['🌊', '☁️'] },
  { q: '穿鞋子 👟 之前，淼淼要先穿上什么呢？', ans: '🧦', opts: ['🧦', '🕶️'] },
  { q: '天上下雨 🌧️ 要打雨伞 ☂️，那出太阳 ☀️ 可以戴什么呢？', ans: '🧢', opts: ['🧢', '🧤'] },
  { q: '刷牙时要用牙刷 🪥，那洗脸时要用什么呢？', ans: '🧼', opts: ['🧼', '🥄'] },
  { q: '喝牛奶要用杯子 🥛，那吃面条要用什么呢？', ans: '🥢', opts: ['🥢', '👟'] },
  { q: '小企鹅 🐧 住在冰冷的世界，那小骆驼 🐫 住在什么地方呢？', ans: '🌵', opts: ['🌵', '🛁'] },
  { q: '洗完手可以用毛巾擦手，那脚脏了要用什么洗呢？', ans: '🚿', opts: ['🚿', '🚗'] },
  { q: '白天很亮我们要看书 📖，那晚上太黑了要打开什么呢？', ans: '💡', opts: ['💡', '🧹'] },
  { q: '吃饭要坐椅子 🪑，那睡觉要躺在什么地方呢？', ans: '🛏️', opts: ['🛏️', '🚲'] },
  { q: '苹果 🍎 是红色的，那香蕉 🍌 是什么颜色的呢？', ans: '💛', opts: ['💛', '💙'] },
  { q: '小鸡 🐥 是从鸡蛋里孵出来的，那小鸭 🦆 是从哪里孵出来的呢？', ans: '🥚', opts: ['🥚', '🪵'] },
  { q: '我们用眼睛 👁️ 来看美丽的风景，那我们用什么来听音乐呢？', ans: '👂', opts: ['👂', '👃'] },
  { q: '花朵 🌸 闻起来很香，那糖果 🍬 尝起来是什么味道呢？', ans: '🍯', opts: ['🍯', '🍋'] },
  { q: '小汽车 🚗 在马路上开，那小火车 🚂 在哪里开呢？', ans: '🛤️', opts: ['🛤️', '🌳'] },
  { q: '天冷的时候我们要穿厚衣服 🧥，那天热的时候我们可以吃什么呢？', ans: '🍦', opts: ['🍦', '🍲'] },
  { q: '树叶 🍃 是绿色的，那天空 ☁️ 是什么颜色的呢？', ans: '💙', opts: ['💙', '🖤'] },
  { q: '蜜蜂 🐝 会飞到花丛中采蜜，那小鱼 🐟 会在哪里游来游去呢？', ans: '💧', opts: ['💧', '🔥'] },
  { q: '我们穿衣服要扣纽扣，那穿鞋子要系什么呢？', ans: '🎀', opts: ['🎀', '🔑'] },
  { q: '哭泣 😢 的时候我们会流眼泪，那开心 😄 的时候我们会怎么样呢？', ans: '😆', opts: ['😆', '😡'] },
  { q: '小鸟 🐦 会在天上飞，那小青蛙 🐸 会怎么样呢？', ans: '🐸', opts: ['🐸', '🚗'] },
  { q: '小狗 🐶 是汪汪叫，那小羊 🐑 是怎么叫的呢？', ans: '🐑', opts: ['🐑', '🐱'] },
  { q: '我们洗澡时需要用到水 🚿，那扫地时需要用到什么呢？', ans: '🧹', opts: ['🧹', '🥄'] },
  { q: '冰块 🧊 摸起来是冰冰的，那热水 ☕ 摸起来是什么感觉呢？', ans: '🔥', opts: ['🔥', '❄️'] },
  { q: '树木 🌲 很高大，那地上的小草 🌱 怎么样呢？', ans: '🌱', opts: ['🌱', '☁️'] },
  { q: '小猫 🐱 的毛摸起来软软的，那石头 🪨 摸起来是什么感觉呢？', ans: '🪨', opts: ['🪨', '🎈'] },
  { q: '气球 🎈 充满了气会飞上天，那皮球 ⚽ 拍一下会怎么样呢？', ans: '🏀', opts: ['🏀', '🍎'] },
  { q: '红灯 🔴 亮了我们要停下来，那小绿灯 🟢 亮了我们可以怎么样呢？', ans: '🏃', opts: ['🏃', '🛌'] },
  { q: '我们写字要用画笔 ✏️，那切面包要用什么呢？', ans: '🔪', opts: ['🔪', '🪥'] },
  { q: '天上的乌云 ☁️ 变黑了，那接下来天要干什么呢？', ans: '🌧️', opts: ['🌧️', '☀️'] },
  { q: '我们走路要用双脚 👣，那拍手要用什么呢？', ans: '🙌', opts: ['🙌', '👓'] },
  { q: '小青蛙 🐸 的身体是绿色的，那小火苗 🔥 是什么颜色的呢？', ans: '❤️', opts: ['❤️', '🖤'] },
  { q: '大马路 🛣️ 很宽，那森林里的小路 🪵 怎么样呢？', ans: '🩹', opts: ['🩹', '🚀'] },
  { q: '我们看书要用眼睛 👁️，那闻花香要用什么呢？', ans: '👃', opts: ['👃', '👂'] },
  { q: '小兔子的耳朵 🐰 很长，那小仓鼠 🐹 的尾巴怎么样呢？', ans: '🐹', opts: ['🐹', '🦒'] },
  { q: '垃圾 🗑️ 要扔进垃圾桶，那玩具 🧸 玩完了要放进哪里呢？', ans: '📦', opts: ['📦', '🚽'] },
  { q: '小松鼠 🐹 最喜欢吃坚果，那淼淼最喜欢喝什么呢？', ans: '🥛', opts: ['🥛', '🧼'] },
  { q: '我们渴了的时候要喝水 🥛，那我们饿了的时候要吃什么呢？', ans: '🍚', opts: ['🍚', '🧼'] },
  { q: '小乌龟 🐢 爬得慢腾腾的，那小火箭 🚀 飞得怎么样呢？', ans: '⚡', opts: ['⚡', '🐌'] },
  { q: '我们用梳子 🪮 梳头发，那我们用什么剪指甲呢？', ans: '✂️', opts: ['✂️', '🔑'] },
  { q: '雪花 ❄️ 是白色的，那巧克力 🍫 是什么颜色的呢？', ans: '🟫', opts: ['🟫', '🟩'] },
  { q: '树上的苹果 🍎 熟了会掉到地上，天上的风筝 🪁 怎么样呢？', ans: '🪁', opts: ['🪁', '🐠'] },
  { q: '我们用嘴巴 👄 说话和吃东西，我们用什么擦鼻涕呢？', ans: '🧻', opts: ['🧻', '👟'] },
  { q: '小鸟 🐦 可以在树枝上唱歌，那小螃蟹 🦀 可以在沙滩上怎么走呢？', ans: '🦀', opts: ['🦀', '🦅'] },
  { q: '妈妈 👩 是女生的样子，那爸爸 👨 是什么样子的呢？', ans: '👨', opts: ['👨', '🐰'] },
  { q: '我们睡前要刷牙 🪥，那起床后要先做什么呢？', ans: '💦', opts: ['💦', '👟'] },
  { q: '太阳 ☀️ 照在身上暖洋洋的，那雪花 ❄️ 落在手上是什么感觉呢？', ans: '❄️', opts: ['❄️', '🔥'] }
];

function getErbaoAnalogyQuestion(level) {
  return ERBAO_ANALOGY_QUESTIONS[(level - 1) % ERBAO_ANALOGY_QUESTIONS.length];
}

function launchErbaoSensory(type, level, container) {
  if (type === 'spatial') {
    const config = getErbaoSpatialConfig(level);
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">📐 平面形状分类厂 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，请把下方的图形积木拖放到对应的虚线槽里吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em; color:#a1a1aa; margin-bottom:20px;">🐰 淼淼，请把图形积木拖放到对应的虚线卡槽中：</p>
        
        <div style="display:flex; justify-content:space-around; margin-bottom:35px; gap:15px; flex-wrap:wrap;">
          ${config.slots.map(s => `
            <div id="${s.id}" class="shape-slot glass-card" style="${s.style}">${s.label}</div>
          `).join('')}
        </div>

        <div style="display:flex; justify-content:center; gap:20px; background:rgba(255,255,255,0.03); padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); flex-wrap:wrap;">
          ${config.draggables.map(d => `
            <div id="${d.id}" class="drag-item" style="${d.style}">${d.label}</div>
          `).join('')}
        </div>
        <button class="mock-button glow-erbao" onclick="launchTest('spatial')" style="margin-top:25px; width:100%; border-color:transparent;">🔄 一键重置重新选择</button>
      </div>
    `;
    setupSensoryDragDrop('shape');
    speakText('淼淼宝宝，请把下方的图形积木拖放到对应的虚线槽里吧！');
  } 
  
  else if (type === 'numeric') {
    const config = getErbaoNumericConfig(level);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:15px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🔢 淼淼数字数数 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，数一数有几个${config.itemName}呀？点击下面的数字选出来吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:25px;">🐰 数一数，这里有几个【${config.itemName} ${config.icon}】呢？</p>
        
        <div style="font-size:4.2em; margin:20px 0; letter-spacing:10px; display:flex; justify-content:center; gap:10px; flex-wrap:wrap; line-height:1.2;">
          ${config.itemStr}
        </div>

        <div style="display:flex; justify-content:center; gap:15px; margin-top:25px; flex-wrap:wrap;">
          ${config.options.map(n => `
            <button class="mock-button glow-erbao" onclick="check2yoAnswer(${n}, ${config.count}, '${config.itemName}')" style="font-size:2.2em; width:75px; height:75px; border-radius:18px; font-weight:bold; display:flex; align-items:center; justify-content:center; padding:0;">${n}</button>
          `).join('')}
        </div>
      </div>
    `;
    speakText(`淼淼宝宝，数一数有几个${config.itemName}呀？`);
  } 
  
  else if (type === 'attention') {
    const config = getErbaoAttentionConfig(level);
    const cols = config.gridSize;
    const btnSize = cols === 2 ? '90px' : '70px';
    const btnFontSize = cols === 2 ? '3.5em' : '2.8em';
    const gridMax = cols === 2 ? '190px' : '240px';

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">⚡ 趣味找不同 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，快在里面找出那一个与其他不一样的小调皮！把它点出来吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:20px;">🐰 谁和别人长得不一样？快把它点出来！</p>
        
        <div style="display:grid; grid-template-columns:repeat(${cols}, 1fr); gap:12px; max-width:${gridMax}; margin:20px auto;">
          ${config.items.map((emoji, idx) => `
            <button class="mock-button glow-erbao" onclick="checkAttention2yo(${idx}, ${config.diffIdx}, '${emoji === config.diffEmoji ? '异类' : '普通款'}')" style="font-size:${btnFontSize}; height:${btnSize}; padding:0; display:flex; align-items:center; justify-content:center; border-radius:14px; background:rgba(255,255,255,0.03);">${emoji}</button>
          `).join('')}
        </div>
      </div>
    `;
    window.currentQuestionExplanation = "要在很多相同的图案中，找出那个细节长得不一样的细节图案小调皮哦！";
    window.currentQuestionCorrectAnswer = config.diffEmoji;
    speakText(`淼淼，快找出那个不一样的小调皮！`);
  } 
  
  else if (type === 'deduction') {
    const config = getErbaoDeductionConfig(level);
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🔍 动物大小分类 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，把${config.bigName}拖进大箱子，小${config.smallName}拖进小箱子里吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em; color:#a1a1aa; margin-bottom:20px;">🐰 大动物住大箱子，小动物住小箱子：</p>
        
        <div style="display:flex; justify-content:space-around; margin-bottom:35px; gap:15px; align-items:center;">
          <div id="slot-big" class="shape-slot glass-card" style="width:120px; height:120px; border:3px dashed #fbbf24; border-radius:16px; display:flex; align-items:center; justify-content:center; color:#fbbf24; font-weight:800; font-size:0.88em; background:rgba(251,191,36,0.02);">📦 大箱子</div>
          <div id="slot-small" class="shape-slot glass-card" style="width:85px; height:85px; border:3px dashed rgba(255,255,255,0.3); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:800; font-size:0.75em;">📦 小箱子</div>
        </div>

        <div style="display:flex; justify-content:center; gap:30px; background:rgba(255,255,255,0.03); padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); align-items:center; flex-wrap:wrap;">
          <div id="drag-big" class="drag-item" style="touch-action: none; width:95px; height:95px; background:linear-gradient(135deg, #fbbf24, #f59e0b); border-radius:16px; cursor:grab; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:800; color:black; box-shadow: 0 4px 12px rgba(251,191,36,0.4); user-select:none; font-size:1em;">
            <span style="font-size:1.6em;">${config.bigIcon}</span>${config.bigName}
          </div>
          <div id="drag-small" class="drag-item" style="touch-action: none; width:65px; height:65px; background:linear-gradient(135deg, #3b82f6, #60a5fa); border-radius:12px; cursor:grab; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(59,130,246,0.4); user-select:none; font-size:0.8em;">
            <span style="font-size:1.3em;">${config.smallIcon}</span>${config.smallName}
          </div>
        </div>
        <button class="mock-button glow-erbao" onclick="launchTest('deduction')" style="margin-top:25px; width:100%; border-color:transparent;">🔄 一键重置重新选择</button>
      </div>
    `;
    setupSensoryDragDrop('shape');
    speakText(`淼淼，把大动物拖进大箱子，小动物拖进小箱子！`);
  } 
  
  else if (type === 'pattern') {
    const config = getErbaoPatternConfig(level);
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🎨 图形规律推理 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，看这串好玩的规律，问号的地方应该放哪个图案呢？');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:20px;">🐰 观察规律，问号【❓】处应该填什么呢？</p>
        
        <div style="display:flex; justify-content:center; gap:12px; margin:25px 0; font-size:2.8em; align-items:center; flex-wrap:wrap;">
          ${config.sequence.map(item => `<span>${item}</span>`).join('')}
          <span style="font-weight:bold; color:#fbbf24; border:2px dashed #fbbf24; width:65px; height:65px; display:inline-flex; align-items:center; justify-content:center; border-radius:12px; font-size:0.8em; line-height:1; padding-bottom:5px;">❓</span>
        </div>

        <div style="display:flex; justify-content:center; gap:20px; margin-top:25px;">
          <button class="mock-button glow-erbao" onclick="checkPatternAnswer('${config.a}', '${config.ans}')" style="font-size:2.2em; width:80px; height:80px; border-radius:18px; display:flex; align-items:center; justify-content:center; padding:0;">${config.a}</button>
          <button class="mock-button glow-erbao" onclick="checkPatternAnswer('${config.b}', '${config.ans}')" style="font-size:2.2em; width:80px; height:80px; border-radius:18px; display:flex; align-items:center; justify-content:center; padding:0;">${config.b}</button>
        </div>
      </div>
    `;
    window.currentQuestionExplanation = "观察图案交替出现的规律（比如苹果、桔子、苹果、桔子），猜猜问号里面是什么？";
    window.currentQuestionCorrectAnswer = config.ans;
    speakText('淼淼宝宝，问号的地方应该放哪个呢？');
  } 
  
  else if (type === 'memory') {
    const config = getErbaoMemoryConfig(level);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🧠 闪现记忆配对 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，仔细盯住这个漂亮的图案！马上要变魔法消失喽！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p id="memory-t-label" style="font-size:1em; color:#a1a1aa; margin-bottom:20px;">👀 淼淼，仔细记住这个可爱的【${config.catName}】图案：</p>
        
        <div id="2yo-memory-disp" class="glass-card" style="font-size:5.5em; width:120px; height:120px; margin:25px auto; display:flex; align-items:center; justify-content:center; border-color:#fbbf24; background:rgba(251,191,36,0.05); border-width:2px; border-radius:20px; transition:all 0.3s; line-height:1.2;">
          ${config.targetEmoji}
        </div>
        <div id="2yo-memory-cd" style="font-size:1em; color:#fbbf24; font-weight:700;">3 秒后开始消失...</div>
        <div id="2yo-memory-opts" style="display:none; justify-content:center; gap:20px; margin-top:25px;">
          ${config.pool.map(o => `
            <button class="mock-button glow-erbao" onclick="checkMemory2yo('${o}', '${config.targetEmoji}')" style="font-size:2.8em; width:80px; height:80px; border-radius:18px; display:flex; align-items:center; justify-content:center; padding:0;">${o}</button>
          `).join('')}
        </div>
      </div>
    `;
    window.currentQuestionExplanation = "盯住这个可爱的图案，盖上问号后回忆刚才藏在底下的是哪一个哦！";
    window.currentQuestionCorrectAnswer = config.targetEmoji;
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
    const config = getErbaoLanguageConfig(level);
    const targetSound = config.targetSound;
    window.sensoryTargetSound = targetSound;
    const pool = config.pool;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <h3 style="color:#fbbf24; font-weight:800; margin-bottom:10px;">🔊 声光探测仪 (第 ${level} 关)</h3>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:30px;">🐰 淼淼宝宝，点击大喇叭听声音，猜猜是谁在叫：</p>
        
        <button onclick="playSensorySound('${targetSound.type}')" class="mock-button glow-erbao" style="width:110px; height:110px; border-radius:50%; font-size:3.2em; display:block; margin: 0 auto 35px; box-shadow:0 0 20px rgba(245,158,11,0.25);">
          📢
        </button>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px;">
          ${pool.map(s => `
            <div class="glass-card pulse-hover" onclick="guessSensorySound('${s.type}')" style="padding:15px 10px; cursor:pointer; text-align:center; border-color:rgba(255,255,255,0.06); border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
              <span style="font-size:3em; display:block; margin-bottom:5px;">${s.icon}</span>
              <strong style="font-size:0.82em; color:#fff; word-break:keep-all;">${s.name.split(' ')[0]}</strong>
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
    const config = getErbaoAnalogyQuestion(level);

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🔗 淼淼认知关联 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('${config.q.replace(/['\"]/g, '')}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:25px; line-height:1.5; font-weight:600;">🐰 ${config.q}</p>
        
        <div style="display:flex; justify-content:center; gap:25px; margin-top:25px; flex-wrap:wrap;">
          ${config.opts.map(o => `
            <button class="mock-button glow-erbao" onclick="check2yoAssociation('${o}', '${config.ans}')" style="font-size:3.2em; width:100px; height:100px; border-radius:20px; display:flex; align-items:center; justify-content:center; padding:0; box-shadow:0 6px 20px rgba(0,0,0,0.15);">
              ${o}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    window.currentQuestionExplanation = config.hint || "根据生活中事物之间的关联（比如小狗爱啃骨头，小鱼是猫咪爱吃的），来找出对应的另一半哦！";
    window.currentQuestionCorrectAnswer = config.ans;
    speakText(config.q);
  }
}

function check2yoAnswer(selected, correct, name = '气球') {
  if (selected === correct) {
    trigger6yoVictory(10, `答对啦！真的是 ${correct} 个${name}！淼淼太棒了！加十个星星！`);
  } else {
    trigger6yoFailure(`数数的时候需要用指头指着${name}，一个一个认真数，不要漏掉哦！`, correct + " 个");
  }
}

function checkAttention2yo(idx, diffIdx, label = '小兔子') {
  if (idx === diffIdx) {
    trigger6yoVictory(10, "哇！淼淼火眼金睛，一下就把不一样的那个小家伙揪出来啦！棒棒哒！");
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "要在很多相同的图案中，找出那个细节长得不一样的细节图案小调皮哦！", window.currentQuestionCorrectAnswer || "那个不一样的图案");
  }
}

function checkPatternAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "规律找对啦！淼淼宝宝最聪明了！给你大大的赞！");
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "观察前面图案交替出现的规律（比如苹果、桔子、苹果、桔子），猜猜问号是什么？", window.currentQuestionCorrectAnswer || "正确图形");
  }
}

function checkMemory2yo(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "哇！淼淼的小眼睛记得真牢！记忆力超级棒！");
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "盯住刚才那个可爱的闪现图案，盖上后回忆刚才看到的是哪一个哦！", window.currentQuestionCorrectAnswer || "正确的闪现图案");
  }
}

function check2yoAssociation(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "太厉害啦！淼淼知道的好多，常识完全正确！奖励十个星星！");
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "根据生活中事物之间的关联来找出对应的另一半哦！", window.currentQuestionCorrectAnswer || "正确关联");
  }
}
