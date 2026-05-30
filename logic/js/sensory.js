/* 🧠 脑力认知研究所 - 二宝感官早教引擎 2yo Sensory Games Engine */

function launchSensory(type) {
  const container = document.getElementById("game-stage");
  
  if (type === 'shape') {
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(245, 158, 11, 0.3);">
        <h2 style="color:#fbbf24; font-weight:800; margin-bottom:10px;">📐 形状分类厂 Shape Matcher</h2>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:30px;">🐰 亲爱的二宝，把下面的小积木拖进虚线盒子里吧：</p>
        
        <div style="display:flex; justify-content:space-around; margin-bottom:40px; gap:20px;">
          <div id="slot-circle" class="shape-slot glass-card" style="width:110px; height:110px; border:3px dashed rgba(255,255,255,0.3); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700;">圆形虚线</div>
          <div id="slot-square" class="shape-slot glass-card" style="width:110px; height:110px; border:3px dashed rgba(255,255,255,0.3); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700;">方形虚线</div>
        </div>

        <div style="display:flex; justify-content:center; gap:40px; background:rgba(255,255,255,0.03); padding:25px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">
          <div id="drag-circle" class="drag-item" draggable="true" style="width:85px; height:85px; background:linear-gradient(135deg, #ef4444, #f87171); border-radius:50%; cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 5px 15px rgba(239,68,68,0.45); font-size:1.1em;">圆积木</div>
          <div id="drag-square" class="drag-item" draggable="true" style="width:85px; height:85px; background:linear-gradient(135deg, #3b82f6, #60a5fa); border-radius:12px; cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 5px 15px rgba(59,130,246,0.45); font-size:1.1em;">方积木</div>
        </div>
        <button class="mock-button" onclick="loadErbaoHUD()" style="margin-top:35px; width:100%;">🔙 返回启蒙舱大厅</button>
      </div>
    `;
    setupSensoryDragDrop('shape');
  } 
  
  else if (type === 'color') {
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(245, 158, 11, 0.3);">
        <h2 style="color:#fbbf24; font-weight:800; margin-bottom:10px;">🎨 色彩能量站 Color Matcher</h2>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:30px;">🐰 二宝，把彩色能量球拖放到同颜色的飞碟舱中：</p>
        
        <div style="display:flex; justify-content:space-around; margin-bottom:40px; gap:15px;">
          <div id="slot-red" class="shape-slot glass-card" style="width:100px; height:100px; border:2px dashed #ef4444; border-radius:20px; display:flex; align-items:center; justify-content:center; color:#fca5a5; font-weight:700; background:rgba(239,68,68,0.05);">红色舱</div>
          <div id="slot-green" class="shape-slot glass-card" style="width:100px; height:100px; border:2px dashed #10b981; border-radius:20px; display:flex; align-items:center; justify-content:center; color:#a7f3d0; font-weight:700; background:rgba(16,185,129,0.05);">绿色舱</div>
          <div id="slot-blue" class="shape-slot glass-card" style="width:100px; height:100px; border:2px dashed #3b82f6; border-radius:20px; display:flex; align-items:center; justify-content:center; color:#bfdbfe; font-weight:700; background:rgba(59,130,246,0.05);">蓝色舱</div>
        </div>

        <div style="display:flex; justify-content:center; gap:25px; background:rgba(255,255,255,0.03); padding:25px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">
          <div id="drag-red" class="drag-item" draggable="true" style="width:70px; height:70px; background:#ef4444; border-radius:50%; cursor:grab; border:3px solid #f87171; box-shadow: 0 4px 12px rgba(239,68,68,0.4);">红球</div>
          <div id="drag-green" class="drag-item" draggable="true" style="width:70px; height:70px; background:#10b981; border-radius:50%; cursor:grab; border:3px solid #34d399; box-shadow: 0 4px 12px rgba(16,185,129,0.4);">绿球</div>
          <div id="drag-blue" class="drag-item" draggable="true" style="width:70px; height:70px; background:#3b82f6; border-radius:50%; cursor:grab; border:3px solid #60a5fa; box-shadow: 0 4px 12px rgba(59,130,246,0.4);">蓝球</div>
        </div>
        <button class="mock-button" onclick="loadErbaoHUD()" style="margin-top:35px; width:100%;">🔙 返回启蒙舱大厅</button>
      </div>
    `;
    setupSensoryDragDrop('color');
  } 
  
  else if (type === 'sound') {
    // Randomly select target animal sound
    const sounds = [
      { name: '小猫 (喵喵)', icon: '🐱', type: 'cat' },
      { name: '小狗 (汪汪)', icon: '🐶', type: 'dog' },
      { name: '汽车喇叭 (哔哔)', icon: '🚗', type: 'beep' }
    ];
    const randomIndex = Math.floor(Math.random() * sounds.length);
    const targetSound = sounds[randomIndex];
    window.sensoryTargetSound = targetSound;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(245, 158, 11, 0.3);">
        <h2 style="color:#fbbf24; font-weight:800; margin-bottom:10px;">🔊 声光探测仪 Sound Pairing</h2>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:30px;">🐰 二宝，点击大喇叭听声音，猜猜是谁在叫：</p>
        
        <button onclick="playSensorySound('${targetSound.type}')" class="mock-button glow-erbao" style="width:130px; height:130px; border-radius:50%; font-size:3.5em; display:block; margin: 0 auto 40px; box-shadow:0 0 25px rgba(245,158,11,0.3);">
          📢
        </button>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px;">
          ${sounds.map(s => `
            <div class="glass-card pulse-hover" onclick="guessSensorySound('${s.type}')" style="padding:20px; cursor:pointer; text-align:center; border-color:rgba(255,255,255,0.06); border-radius:12px;">
              <span style="font-size:3.5em; display:block; margin-bottom:8px;">${s.icon}</span>
              <strong style="font-size:0.9em; color:#fff;">${s.name}</strong>
            </div>
          `).join("")}
        </div>
        <button class="mock-button" onclick="loadErbaoHUD()" style="margin-top:35px; width:100%;">🔙 返回启蒙舱大厅</button>
      </div>
    `;
  }
}

// Custom real-time audio synthesizer using Web Audio API
function playSensorySound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'cat') {
      // 🐱 Upward meow frequency slide
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'dog') {
      // 🐶 Short triangle wave quick barking sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
      
      // Secondary echo to mimic "woof woof"
      setTimeout(() => {
        const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
        const osc2 = ctx2.createOscillator();
        const gain2 = ctx2.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx2.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(140, ctx2.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(70, ctx2.currentTime + 0.16);
        gain2.gain.setValueAtTime(0.35, ctx2.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx2.currentTime + 0.18);
        osc2.start();
        osc2.stop(ctx2.currentTime + 0.18);
      }, 200);
    } else if (type === 'beep') {
      // 🚗 Standard clean beep frequency
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    }
  } catch (err) {
    console.error("Audio Context synthesizer blocked or not supported on this browser.", err);
  }
}

function guessSensorySound(guessedType) {
  if (guessedType === window.sensoryTargetSound.type) {
    playSensorySound(guessedType);
    initAppState();
    appState.players.erbao.stars += 10;
    saveAppState();
    
    alert(`🎉 答对啦！真的是【${window.sensoryTargetSound.name}】的声音！\n宝宝太厉害啦，送你 10 颗星星奖励！🌟`);
    document.getElementById("star-count").innerText = `🪙 ${appState.players.erbao.stars}`;
    loadErbaoHUD();
  } else {
    alert("❌ 呀，不对哦。再点小喇叭听一下，猜猜这到底是谁的声音呢？🐰");
  }
}

function setupSensoryDragDrop(mode) {
  const draggables = document.querySelectorAll('.drag-item');
  const slots = document.querySelectorAll('.shape-slot');
  
  draggables.forEach(drag => {
    drag.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', drag.id);
    });
    
    // For touch devices support
    drag.addEventListener('touchstart', (e) => {
      window.activeTouchDragId = drag.id;
    }, {passive: true});
  });

  slots.forEach(slot => {
    slot.addEventListener('dragover', (e) => e.preventDefault());
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      const dragId = e.dataTransfer.getData('text/plain');
      handleSensoryDrop(dragId, slot);
    });
  });
}

function handleSensoryDrop(dragId, slot) {
  if (!dragId) return;
  
  const dragItem = document.getElementById(dragId);
  const dragType = dragId.split('-')[1]; // circle, square, red, green, blue
  const slotType = slot.id.split('-')[1];
  
  if (dragType === slotType) {
    slot.style.background = "rgba(16, 185, 129, 0.25)";
    slot.style.borderColor = "#10b981";
    slot.style.color = "#fff";
    slot.innerText = "正确 ✅";
    dragItem.style.visibility = "hidden";
    
    // Play a happy synthesizer beep
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      o.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      g.gain.setValueAtTime(0.2, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      o.start();
      o.stop(audioCtx.currentTime + 0.25);
    } catch(err){}
    
    checkSensoryVictory();
  } else {
    alert("🐰 颜色或形状不一样哦，再匹配试试！");
  }
}

function checkSensoryVictory() {
  const draggables = document.querySelectorAll('.drag-item');
  const allSolved = Array.from(draggables).every(item => item.style.visibility === "hidden");
  
  if (allSolved) {
    setTimeout(() => {
      initAppState();
      appState.players.erbao.stars += 10;
      saveAppState();
      alert("🎉 太棒了！二宝把所有卡片都正确放好啦！获得 10 颗星星奖励！🌟");
      document.getElementById("star-count").innerText = `🪙 ${appState.players.erbao.stars}`;
      loadErbaoHUD();
    }, 400);
  }
}
