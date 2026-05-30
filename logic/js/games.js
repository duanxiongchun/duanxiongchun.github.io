/* 🧠 脑力认知研究所 - 果果「八少八素起航线」特训引擎 6yo Logic Games Engine */

let currentAnswer6yo = 0;
let currentDeductionTimeline = [];

// Built-in Chinese Speech Synthesis Utility with Natural Human Voice Selector
let bestChineseVoice = null;

function loadBestVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const priorityNames = ["tingting", "xiaoxiao", "siri", "huihui", "google", "yating", "kangkang"];
  const zhVoices = voices.filter(v => v.lang.includes("zh-CN") || v.lang.includes("zh_CN") || v.lang.includes("zh-"));
  if (zhVoices.length === 0) return;
  
  zhVoices.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    let aIndex = priorityNames.findIndex(p => aName.includes(p));
    let bIndex = priorityNames.findIndex(p => bName.includes(p));
    if (aIndex === -1) aIndex = 999;
    if (bIndex === -1) bIndex = 999;
    return aIndex - bIndex;
  });
  bestChineseVoice = zhVoices[0];
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadBestVoice;
  loadBestVoice();
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (bestChineseVoice) {
      utterance.voice = bestChineseVoice;
    } else {
      utterance.lang = 'zh-CN';
    }
    utterance.rate = 0.90;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }
}

// ==================== 🛠️ 200关程序化关卡生成器 Procedural Syllabus Engine ====================

function launchTest(type) {
  initAppState();
  const player = appState.players.dabao;
  
  // Initialize progress tracking schema if missing
  if (!player.progress) {
    player.progress = { spatial: 1, numeric: 1, attention: 1, deduction: 1 };
  }
  
  const level = player.progress[type] || 1;
  const container = document.getElementById("game-stage");
  window.currentGameTrack = type;
  
  if (level > 50) {
    // VICTORY SCREEN FOR DIMENSION COMPLETION
    container.innerHTML = `
      <div class="glass-card" style="padding:40px; text-align:center; max-width:600px; margin:30px auto; border-color: #10b981;">
        <span style="font-size:5.5em; display:block; margin-bottom:15px; animation:pulseGlow 2s infinite;">🏆</span>
        <h2 style="color:#10b981; font-weight:800; margin-bottom:10px;">🎉 完美通关 50 关特训！</h2>
        <p style="font-size:1.15em; color:#fff; margin-bottom:20px;">果果，你太牛啦！你成功攻克了本维度的所有挑战！</p>
        <p style="font-size:0.85em; color:#94a3b8; margin-bottom:30px;">八少八素「${getTrackChineseName(type)}」维度勋章已成功点亮荣誉墙！</p>
        
        <button class="mock-button glow-success" onclick="resetTrackProgress('${type}')" style="width:100%; font-size:1.1em; padding:12px; margin-bottom:12px;">🛸 重置并重新挑战本题库</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="width:100%; border-color:transparent; color:#64748b;">返回特训大厅</button>
      </div>
    `;
    speakText(`恭喜果果！你已经完美通关了本特训的所有五十个关卡，获得了荣誉大勋章！你太棒了！`);
    return;
  }
  
  // RENDER DYNAMIC CHALLENGE ACCORDING TO LEVEL
  if (type === 'spatial') {
    generateSpatialLevel(level, container);
  } else if (type === 'numeric') {
    generateNumericLevel(level, container);
  } else if (type === 'attention') {
    generateAttentionLevel(level, container);
  } else if (type === 'deduction') {
    generateDeductionLevel(level, container);
  }
}

function getTrackChineseName(type) {
  if (type === 'spatial') return "空间与图形推理";
  if (type === 'numeric') return "数理与逻辑计算";
  if (type === 'attention') return "瞬时记忆与注意力";
  return "逻辑演绎与推理";
}

// -------------------- 1. 空间与图形推理舱 (Spatial - 50 Levels) --------------------
function generateSpatialLevel(level, container) {
  if (level <= 25) {
    // Sub-type A: 3D Isometric Block counting (25 levels)
    // Deterministic progression of height matrices
    const totalAns = Math.floor(level / 3) + 3; // Answer dynamically scales from 3 to 11
    
    let visual = "";
    if (level % 3 === 1) {
      visual = "📦".repeat(totalAns - 2) + "<br>" + "📦".repeat(2);
    } else if (level % 3 === 2) {
      visual = "🟩".repeat(totalAns - 3) + "<br>" + "🟩".repeat(2) + "⬜";
    } else {
      visual = "🟧".repeat(totalAns - 4) + "<br>" + "🟧🟦🟧<br>⬜🟧⬜";
    }
    
    currentAnswer6yo = totalAns;
    const questionText = `果果，请你数一数这堆立方体中总共有多少个积木，要小心压在底下看不到的支撑积木哦。`;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h3 style="color:#818cf8; font-weight:800; margin:0;">🧱 3D积木计数 - 第 ${level} 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px; font-size:0.8em; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:0.9em; color:#a1a1aa; margin-bottom:20px;">🦁 仔细观察堆叠，数一数积木卡槽总数：</p>
        
        <div style="background:rgba(15,23,42,0.6); padding:25px; border-radius:16px; height:160px; display:flex; align-items:center; justify-content:center; font-size:2.8em; border:1px solid rgba(255,255,255,0.06); line-height:1.3; font-family:var(--font-fira); font-weight:bold; letter-spacing:6px;">
          ${visual}
        </div>
        
        <div style="margin-top:25px; display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          ${Array.from({length: 8}, (_, i) => i + 3).map(num => `
            <button class="mock-button glow-dabao" onclick="check6yoAnswer(${num})" style="font-size:1.3em; width:50px; height:50px; border-radius:10px;">${num}</button>
          `).join("")}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:30px; width:100%; border-color:transparent;">🛰️ 返回大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(questionText); }, 250);
  } else {
    // Sub-type B: 2D Matrix rotations & reflections (25 levels)
    const layouts = [
      { visual: "⭐️ ⚪️ ⚪️<br>⚪️ ⭐️ ⚪️<br>⚪️ ⚪️ ⭐️", rot90: "⚪️ ⚪️ ⭐️<br>⚪️ ⭐️ ⚪️<br>⭐️ ⚪️ ⚪️", rot180: "⭐️ ⚪️ ⚪️<br>⚪️ ⭐️ ⚪️<br>⚪️ ⚪️ ⭐️", desc: "顺时针旋转90度" },
      { visual: "🔺 🔺 🔺<br>⚪️ ⚪️ ⚪️<br>⚪️ ⚪️ ⚪️", rot90: "⚪️ ⚪️ 🔺<br>⚪️ ⚪️ 🔺<br>⚪️ ⚪️ 🔺", rot180: "⚪️ ⚪️ ⚪️<br>⚪️ ⚪️ ⚪️<br>🔺 🔺 🔺", desc: "顺时针旋转90度" },
      { visual: "🔵 🔴 🔵<br>🔴 ⚪️ 🔴<br>🔵 🔴 🔵", rot90: "🔵 🔴 🔵<br>🔴 ⚪️ 🔴<br>🔵 🔴 🔵", rot180: "🔵 🔴 🔵<br>🔴 ⚪️ 🔴<br>🔵 🔴 🔵", desc: "顺时针旋转180度" }
    ];
    const index = (level - 26) % layouts.length;
    const item = layouts[index];
    currentAnswer6yo = 1; // Option A is correct
    
    const questionText = `果果，请你看一下左边这个图形网格，如果把它${item.desc}，会变成右边哪一个呢？`;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:650px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h3 style="color:#818cf8; font-weight:800; margin:0;">🧩 空间旋转规律 - 第 ${level} 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px; font-size:0.8em; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:0.9em; color:#a1a1aa; margin-bottom:20px;">🦁 把左边的网格【${item.desc}】，猜猜是哪个：</p>
        
        <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:30px;">
          <div style="background:rgba(255,255,255,0.03); padding:15px; border-radius:12px; font-size:1.8em; border:1px solid rgba(255,255,255,0.05); line-height:1.4;">
            ${item.visual}
          </div>
          <div style="font-size:2em; color:var(--color-accent);">➔</div>
          <div style="display:flex; gap:15px;">
            <button class="glass-card pulse-hover" onclick="check6yoAnswer(1)" style="padding:15px; background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); font-size:1.4em; line-height:1.3; cursor:pointer;">
              <span style="font-size:0.6em; color:#818cf8; display:block; margin-bottom:5px;">选项 A</span>
              ${item.rot90}
            </button>
            <button class="glass-card pulse-hover" onclick="check6yoAnswer(2)" style="padding:15px; background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); font-size:1.4em; line-height:1.3; cursor:pointer;">
              <span style="font-size:0.6em; color:#818cf8; display:block; margin-bottom:5px;">选项 B</span>
              ${item.rot180}
            </button>
          </div>
        </div>
        
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:20px; width:100%; border-color:transparent;">🛰️ 返回大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(questionText); }, 250);
  }
}

// -------------------- 2. 数理与逻辑计算舱 (Numeric - 50 Levels) --------------------
function generateNumericLevel(level, container) {
  if (level <= 25) {
    // Sub-type A: Math progressions series (25 levels)
    let sequence = [];
    let correct = 0;
    
    if (level <= 8) {
      // Linear addition progressions (+1, +2, +3, +5)
      const diff = (level % 3) + 2;
      const start = Math.floor(level / 2) + 1;
      sequence = [start, start + diff, null, start + diff*3, start + diff*4];
      correct = start + diff * 2;
    } else if (level <= 16) {
      // Linear subtraction progressions (-1, -2, -3)
      const diff = (level % 2) + 2;
      const start = 20 - (level % 3);
      sequence = [start, start - diff, start - diff*2, null, start - diff*4];
      correct = start - diff * 3;
    } else {
      // Geometric double multipliers or Fibonacci
      if (level % 2 === 0) {
        sequence = [1, 2, 4, null, 16];
        correct = 8;
      } else {
        sequence = [1, 2, 3, 5, null, 13];
        correct = 8;
      }
    }
    
    currentAnswer6yo = correct;
    const questionText = `果果，请你根据这些数字排队的变大或变小规律，猜猜蓝色问号泡泡里应该填哪个数字？`;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h3 style="color:#818cf8; font-weight:800; margin:0;">🧮 规律数列 - 第 ${level} 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px; font-size:0.8em; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:0.9em; color:#a1a1aa; margin-bottom:25px;">🦁 猜猜蓝色问号泡泡【❓】里面应该填哪个数字：</p>
        
        <div style="display:flex; justify-content:center; align-items:center; gap:15px; margin:30px 0;">
          ${sequence.map(item => {
            if (item === null) {
              return `<div style="width:65px; height:65px; border-radius:50%; border:3px dashed #06b6d4; display:flex; align-items:center; justify-content:center; font-size:1.6em; font-weight:800; color:#22d3ee; background:rgba(6,182,212,0.15); animation:pulseGlow 1.5s infinite;">❓</div>`;
            } else {
              return `<div style="width:60px; height:60px; border-radius:50%; border:2px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-size:1.4em; font-weight:800; background:rgba(255,255,255,0.05);">${item}</div>`;
            }
          }).join("")}
        </div>
        
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          ${Array.from({length: 12}, (_, i) => i + 4).map(opt => `
            <button class="mock-button glow-dabao" onclick="check6yoAnswer(${opt})" style="font-size:1.2em; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center;">${opt}</button>
          `).join("")}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:35px; width:100%; border-color:transparent;">🛰️ 返回大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(questionText); }, 250);
  } else {
    // Sub-type B: Balance substitutions puzzles (25 levels)
    const fruits = [
      { f1: "🍎", f2: "🍓", f3: "🍒", val1: 2, val2: 3 },
      { f1: "🍉", f2: "🍎", f3: "🍇", val1: 3, val2: 2 },
      { f1: "🍌", f2: "🍓", f3: "🍉", val1: 2, val2: 4 },
      { f1: "🍍", f2: "🍎", f3: "🍌", val1: 3, val2: 3 }
    ];
    const index = (level - 26) % fruits.length;
    const item = fruits[index];
    const correct = item.val1 * item.val2;
    currentAnswer6yo = correct;
    
    const questionText = `果果，如果 1 个${item.f1} 等于 ${item.val1} 个${item.f2}，且 1 个${item.f2} 等于 ${item.val2} 个${item.f3}。那么 1 个${item.f1} 等于多少个${item.f3}呢？`;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h3 style="color:#818cf8; font-weight:800; margin:0;">⚖️ 重力代换天平 - 第 ${level} 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px; font-size:0.8em; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:0.95em; color:#a1a1aa; margin-bottom:25px;">🦁 仔细看清代换关系，进行连线代换计算：</p>
        
        <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); text-align:left; line-height:2.2; font-size:1.2em; max-width:400px; margin: 0 auto 30px;">
          • 1 个 ${item.f1} ＝ <span style="color:var(--color-accent); font-weight:bold;">${item.val1}</span> 个 ${item.f2}<br>
          • 1 个 ${item.f2} ＝ <span style="color:#a855f7; font-weight:bold;">${item.val2}</span> 个 ${item.f3}<br>
          • ❓ 那么：1 个 ${item.f1} ＝ <span style="color:#fbbf24; font-weight:bold;">？</span> 个 ${item.f3}
        </div>
        
        <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
          ${[4, 6, 8, 9, 10, 12, 15, 16].map(opt => `
            <button class="mock-button glow-dabao" onclick="check6yoAnswer(${opt})" style="font-size:1.3em; width:55px; height:55px; border-radius:10px;">${opt}</button>
          `).join("")}
        </div>
        
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:30px; width:100%; border-color:transparent;">🛰️ 返回大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(questionText); }, 250);
  }
}

// -------------------- 3. 瞬时记忆与注意力舱 (Attention - 50 Levels) --------------------
function generateAttentionLevel(level, container) {
  if (level <= 25) {
    // Sub-type A: Schulte Grid Matrix (25 levels)
    let gridDesc = "";
    let questionText = "";
    
    if (level <= 8) {
      gridDesc = "按 1 到 9 的顺序，最快点击格子：";
      questionText = "果果，请用小眼睛最快速度按顺序，点击一到九的数字格子！";
    } else if (level <= 16) {
      gridDesc = "这次要倒过来数！按 9 到 1 顺序点击格子：";
      questionText = "果果，这次要考验你的倒数能力，请按顺序从大到小，点击九到一的数字格子！";
    } else if (level <= 20) {
      gridDesc = "只找偶数！按 2、4、6、8 顺序依次点击：";
      questionText = "果果，这次要找出双数，请按顺序点击二、四、六、八的数字格子！";
    } else {
      gridDesc = "高难终极挑战！按 1 到 16 顺序依次点击：";
      questionText = "高难挑战来啦！果果，请按顺序，最快速度依次点击一到十六的数字格子！";
    }
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h3 style="color:#818cf8; font-weight:800; margin:0;">⚡ 舒尔特网格 - 第 ${level} 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px; font-size:0.8em; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:0.95em; color:#a1a1aa; margin-bottom:20px;">🦁 ${gridDesc}</p>
        
        <div id="schulte-grid" style="display:grid; gap:12px; margin:25px auto;">
          <!-- cells dynamically loaded -->
        </div>
        
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:30px; width:100%; border-color:transparent;">🛰️ 返回大厅</button>
      </div>
    `;
    
    setupSchulteGridMatrix(level);
    setTimeout(() => { speakText(questionText); }, 250);
  } else {
    // Sub-type B: Flash Neon grid memory array (25 levels)
    // Blink sequence memory path
    const flashCount = Math.floor((level - 26) / 8) + 3; // flash count scales from 3 to 5
    const gridCols = (level > 38) ? 4 : 3; // scales to 4x4 matrix for level 38+
    
    const questionText = `果果，请闭气凝神看好格子，记住发光绿卡片的闪烁顺序。闪烁结束后，按照一模一样的顺序点击它们。`;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:15px;">
          <h3 style="color:#818cf8; font-weight:800; margin:0;">⚡ 粒子闪烁阵列 - 第 ${level} 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px; font-size:0.8em; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:0.9em; color:#a1a1aa; margin-bottom:20px;">🦁 记住卡片的闪烁路径，然后按顺序还原它：</p>
        
        <div id="memory-grid" style="display:grid; grid-template-columns: repeat(${gridCols}, 1fr); gap:12px; max-width:${gridCols * 80}px; margin:25px auto;">
          ${Array.from({length: gridCols * gridCols}, (_, i) => `
            <div id="mem-cell-${i}" class="glass-card memory-cell" onclick="clickMemoryCell(${i})" style="height:70px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; cursor:pointer; transition: all 0.2s;"></div>
          `).join("")}
        </div>
        
        <button id="memory-start-btn" class="mock-button glow-success" onclick="playFlashMemory(${gridCols * gridCols}, ${flashCount})" style="width:100%;">🛰️ 启动脑电闪烁</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:20px; width:100%; border-color:transparent;">返回大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(questionText); }, 250);
  }
}

function setupSchulteGridMatrix(level) {
  const grid = document.getElementById("schulte-grid");
  
  if (level <= 20) {
    grid.style.gridTemplateColumns = "repeat(3, 1fr)";
    grid.style.maxWidth = "280px";
    
    if (level <= 8) {
      // 1 to 9 Ascending
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      grid.innerHTML = numbers.map(n => `
        <button id="cell-${n}" class="schulte-cell mock-button" onclick="clickSchulteTrack(${n}, 1, 9, 1)" style="height:75px; font-size:1.8em; font-weight:bold;">${n}</button>
      `).join("");
      window.schulteTarget = 1;
    } else if (level <= 16) {
      // 9 to 1 Descending
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      grid.innerHTML = numbers.map(n => `
        <button id="cell-${n}" class="schulte-cell mock-button" onclick="clickSchulteTrack(${n}, 9, 1, -1)" style="height:75px; font-size:1.8em; font-weight:bold;">${n}</button>
      `).join("");
      window.schulteTarget = 9;
    } else {
      // Even only: 2, 4, 6, 8 (dummies: 1, 3, 5, 7, 9)
      const cells = [2, 4, 6, 8, 1, 3, 5, 7, 9].sort(() => Math.random() - 0.5);
      grid.innerHTML = cells.map(n => `
        <button id="cell-${n}" class="schulte-cell mock-button" onclick="clickSchulteEven(${n})" style="height:75px; font-size:1.8em; font-weight:bold;">${n}</button>
      `).join("");
      window.schulteEvenIndex = 0;
      window.schulteEvenSeq = [2, 4, 6, 8];
    }
  } else {
    // 4x4 High speed 1-16 grid
    grid.style.gridTemplateColumns = "repeat(4, 1fr)";
    grid.style.maxWidth = "340px";
    
    const numbers = Array.from({length: 16}, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    grid.innerHTML = numbers.map(n => `
      <button id="cell-${n}" class="schulte-cell mock-button" onclick="clickSchulteTrack(${n}, 1, 16, 1)" style="height:65px; font-size:1.5em; font-weight:bold; padding:0;">${n}</button>
    `).join("");
    window.schulteTarget = 1;
  }
}

function clickSchulteTrack(num, start, end, step) {
  const btn = document.getElementById(`cell-${num}`);
  if (num === window.schulteTarget) {
    btn.style.background = "rgba(16, 185, 129, 0.25)";
    btn.style.borderColor = "#10b981";
    btn.setAttribute("disabled", "true");
    
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.setValueAtTime(350 + num * 30, audioCtx.currentTime);
      g.gain.setValueAtTime(0.15, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      o.start(); o.stop(audioCtx.currentTime + 0.15);
    } catch(err){}

    window.schulteTarget += step;
    if ((step > 0 && window.schulteTarget > end) || (step < 0 && window.schulteTarget < end)) {
      trigger6yoVictory(15, "专注力大成功！");
    }
  } else {
    btn.style.background = "rgba(239, 68, 68, 0.25)";
    btn.style.borderColor = "#ef4444";
    speakText("点错格子了，再数数看。");
    setTimeout(() => {
      btn.style.background = "rgba(255, 255, 255, 0.05)";
      btn.style.borderColor = "rgba(255, 255, 255, 0.08)";
    }, 250);
  }
}

function clickSchulteEven(num) {
  const btn = document.getElementById(`cell-${num}`);
  const target = window.schulteEvenSeq[window.schulteEvenIndex];
  if (num === target) {
    btn.style.background = "rgba(16, 185, 129, 0.25)";
    btn.style.borderColor = "#10b981";
    btn.setAttribute("disabled", "true");
    
    window.schulteEvenIndex++;
    if (window.schulteEvenIndex >= window.schulteEvenSeq.length) {
      trigger6yoVictory(15, "双数专注力满分！");
    }
  } else {
    btn.style.background = "rgba(239, 68, 68, 0.25)";
    btn.style.borderColor = "#ef4444";
    speakText("这个不是双数偶数哦！");
    setTimeout(() => {
      btn.style.background = "rgba(255, 255, 255, 0.05)";
      btn.style.borderColor = "rgba(255, 255, 255, 0.08)";
    }, 250);
  }
}

// Memory flash sequence engine
function playFlashMemory(totalCells, count) {
  document.getElementById("memory-start-btn").setAttribute("disabled", "true");
  const path = [];
  while(path.length < count) {
    const r = Math.floor(Math.random() * totalCells);
    if (!path.includes(r)) path.push(r);
  }
  
  window.memoryTargetSeq = path;
  window.memoryUserSeq = [];
  
  let i = 0;
  function blinkNext() {
    if (i >= path.length) {
      document.getElementById("memory-start-btn").innerText = "请按照顺序还原刚才的亮光！";
      return;
    }
    const idx = path[i];
    const cell = document.getElementById(`mem-cell-${idx}`);
    cell.style.background = "#10b981";
    cell.style.boxShadow = "0 0 15px #10b981";
    
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = 523.25 + i*100;
      g.gain.setValueAtTime(0.18, audioCtx.currentTime);
      g.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      o.start(); o.stop(audioCtx.currentTime + 0.3);
    } catch(e){}

    setTimeout(() => {
      cell.style.background = "rgba(255,255,255,0.03)";
      cell.style.boxShadow = "none";
      i++;
      setTimeout(blinkNext, 200);
    }, 550);
  }
  
  blinkNext();
}

function clickMemoryCell(idx) {
  if (!window.memoryTargetSeq || window.memoryTargetSeq.length === 0) return;
  const user = window.memoryUserSeq;
  const target = window.memoryTargetSeq;
  
  const cell = document.getElementById(`mem-cell-${idx}`);
  user.push(idx);
  
  // Validate index against target
  const targetVal = target[user.length - 1];
  if (idx === targetVal) {
    cell.style.background = "rgba(16, 185, 129, 0.25)";
    cell.style.borderColor = "#10b981";
    
    if (user.length === target.length) {
      trigger6yoVictory(15, "工作记忆脑波强大！");
    }
  } else {
    cell.style.background = "rgba(239, 68, 68, 0.25)";
    cell.style.borderColor = "#ef4444";
    speakText("记错闪烁顺序啦，再看一遍脑电波闪烁吧！");
    setTimeout(() => {
      cell.style.background = "rgba(255,255,255,0.03)";
      cell.style.borderColor = "rgba(255,255,255,0.08)";
      window.memoryUserSeq = [];
      document.getElementById("memory-start-btn").removeAttribute("disabled");
      document.getElementById("memory-start-btn").innerText = "❌ 记错了！点击在此重新播放";
    }, 400);
  }
}

// -------------------- 4. 逻辑演绎与推理舱 (Deduction - 50 Levels) --------------------
function generateDeductionLevel(level, container) {
  if (level <= 25) {
    // Sub-type A: Timeline ordering sorters (25 levels)
    const timelines = [
      {
        id: "t1",
        text: "果果，请把卡片按照苹果树从那种子到结苹果的因果顺序，重新排一排吧：",
        items: [
          { id: '1', text: '🌱 种子种在土里' },
          { id: '2', text: '🌿 种子发芽抽绿叶' },
          { id: '3', text: '🌸 花朵挂满树枝' },
          { id: '4', text: '🍎 结出又大又红的苹果' }
        ]
      },
      {
        id: "t2",
        text: "果果，请把下面的时间活动卡片，按照从早晨起床到晚上睡觉的时间顺序排列好：",
        items: [
          { id: '1', text: '🌅 早晨太阳升起起床' },
          { id: '2', text: '🎒 背上小书包去上学校' },
          { id: '3', text: '🍽️ 中午和老师同学吃午饭' },
          { id: '4', text: '🌙 闭上眼睛盖上小被子睡觉' }
        ]
      },
      {
        id: "t3",
        text: "果果，请把下面的图片，按照小鸡孵化长大的自然发生顺序，排列好：",
        items: [
          { id: '1', text: '🥚 鸡窝里放着个圆圆的鸡蛋' },
          { id: '2', text: '🐣 鸡蛋壳裂开了小裂缝' },
          { id: '3', text: '🐥 小黄鸡伸出脑袋吃米' },
          { id: '4', text: '🐔 大母鸡展开翅膀捉虫' }
        ]
      }
    ];
    
    const index = (level - 1) % timelines.length;
    const q = timelines[index];
    currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h3 style="color:#818cf8; font-weight:800; margin:0;">⏳ 因果时空排序 - 第 ${level} 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${q.text}')" style="padding:4px 10px; font-size:0.8em; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:0.95em; color:#a1a1aa; margin-bottom:20px;">🦁 用上下键调整顺序，让卡片符合正常物理规律：</p>
        
        <div id="timeline-list" style="display:flex; flex-direction:column; gap:12px; margin:25px 0;">
          ${currentDeductionTimeline.map((item, idx) => `
            <div class="glass-card timeline-node" style="padding:15px; border-color:rgba(255,255,255,0.06); background:rgba(255,255,255,0.03); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600; color:#fff; font-size:0.95em;">${item.text}</span>
              <div>
                <button class="mock-button" onclick="shiftTimelineNode(${idx}, -1)" style="padding:3px 8px; font-size:0.8em; margin-right:5px;">↑</button>
                <button class="mock-button" onclick="shiftTimelineNode(${idx}, 1)" style="padding:3px 8px; font-size:0.8em;">↓</button>
              </div>
            </div>
          `).join("")}
        </div>
        
        <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="width:100%; font-size:1.05em; font-weight:700; padding:10px; margin-top:10px;">提交验证</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:20px; width:100%; border-color:transparent;">🛰️ 返回大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(q.text); }, 250);
  } else {
    // Sub-type B: Robot Paradox logic riddles (25 levels)
    const riddles = [
      {
        qText: "红盒子里放了小狗。蓝盒子身上贴着字条说：“小狗不在我这里”。如果这两个字条里只有一个说的是真话，问小狗到底藏在红盒子还是蓝盒子里？",
        speak: "红盒子里放了小狗，蓝盒子说，小狗不在我这里。如果只有一个盒子说真话，问小狗在哪个盒子里？",
        options: ["红盒子", "蓝盒子"],
        ans: 1
      },
      {
        qText: "机器人阿A说：“我是红色的。”机器人阿B说：“我们两个里有一个人在说谎。”如果只有一个人说真话，谁在说谎？",
        speak: "机器人A说我是红色的，机器人B说我们两个里有一个人在说谎。如果只有一个人说真话，谁在说谎呢？",
        options: ["机器人阿A", "机器人阿B"],
        ans: 1
      }
    ];
    
    const index = (level - 26) % riddles.length;
    const item = riddles[index];
    currentAnswer6yo = item.ans;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:15px;">
          <h3 style="color:#818cf8; font-weight:800; margin:0;">🤖 说谎机器人 - 第 ${level} 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${item.speak}')" style="padding:4px 10px; font-size:0.8em; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:0.95em; color:#a1a1aa; margin-bottom:20px;">🦁 仔细开动脑筋，分析真话和假话之间的矛盾：</p>
        
        <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); text-align:left; line-height:1.8; font-size:1.05em; color:#fff; margin-bottom:30px;">
          💡 谜题：${item.qText}
        </div>
        
        <div style="display:flex; gap:15px; justify-content:center;">
          ${item.options.map((opt, i) => `
            <button class="mock-button glow-dabao" onclick="check6yoAnswer(${i + 1})" style="padding:12px 25px; font-size:1.1em; font-weight:700;">${opt}</button>
          `).join("")}
        </div>
        
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:30px; width:100%; border-color:transparent;">🛰️ 返回大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(item.speak); }, 250);
  }
}

// -------------------- 🏆 统一答案校验与进度跃迁 --------------------

function check6yoAnswer(ans) {
  if (ans === currentAnswer6yo) {
    trigger6yoVictory(10, "特训大成功！加十个星星！");
  } else {
    speakText("猜错啦，再开动脑筋仔细想一想吧，你可以的！");
    alert("❌ 呀，算错/推错啦。别着急，再仔细看一看、想一想谜面或者图示，再次尝试吧！💡");
  }
}

function checkDabaoAnswer(ans) {
  check6yoAnswer(ans); // alias fallback mapping
}

function verifyDabaoTimeline() {
  const userOrder = currentDeductionTimeline.map(item => item.id).join("");
  if (userOrder === "1234") {
    trigger6yoVictory(10, "排序完美！果果真厉害！加十个星星！");
  } else {
    speakText("排序发生顺序不太对哦，再想想看吧。");
    alert("❌ 唔，时空排序的成长先后顺序不对。再调换一下顺序重新提交验证吧！🐰");
  }
}

function trigger6yoVictory(starEarned, speechFeedback) {
  initAppState();
  const player = appState.players.dabao;
  const type = window.currentGameTrack;
  
  // Increment progress level stably
  player.progress[type]++;
  player.stars += starEarned;
  
  saveAppState();
  
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.setValueAtTime(440, audioCtx.currentTime); 
    o.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.08); 
    o.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.16); 
    o.frequency.setValueAtTime(880, audioCtx.currentTime + 0.24); 
    g.gain.setValueAtTime(0.2, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    o.start(); o.stop(audioCtx.currentTime + 0.4);
  } catch(err){}

  speakText(speechFeedback);
  alert(`🎉 ${speechFeedback}\n果果，你成功闯过本关，脑能指数跃升！大厅已自动开启下一关！🧭🌟`);
  
  document.getElementById("star-count").innerText = `🪙 ${player.stars}`;
  loadDabaoHUD();
}

function shiftTimelineNode(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= currentDeductionTimeline.length) return;
  const temp = currentDeductionTimeline[index];
  currentDeductionTimeline[index] = currentDeductionTimeline[targetIndex];
  currentDeductionTimeline[targetIndex] = temp;
  rerenderTimelineStage();
}

function rerenderTimelineStage() {
  const container = document.getElementById("timeline-list");
  container.innerHTML = currentDeductionTimeline.map((item, idx) => `
    <div class="glass-card timeline-node" style="padding:15px; border-color:rgba(255,255,255,0.06); background:rgba(255,255,255,0.03); display:flex; justify-content:space-between; align-items:center;">
      <span style="font-weight:600; color:#fff; font-size:0.95em;">${item.text}</span>
      <div>
        <button class="mock-button" onclick="shiftTimelineNode(${idx}, -1)" style="padding:3px 8px; font-size:0.8em; margin-right:5px;">↑</button>
        <button class="mock-button" onclick="shiftTimelineNode(${idx}, 1)" style="padding:3px 8px; font-size:0.8em;">↓</button>
      </div>
    </div>
  `).join("");
}

function resetTrackProgress(type) {
  initAppState();
  const player = appState.players.dabao;
  player.progress[type] = 1;
  saveAppState();
  alert(`🛸 果果的「${getTrackChineseName(type)}」五十关特训已全部清空重置，快来开始新一轮的智慧闯关吧！`);
  launchTest(type);
}
