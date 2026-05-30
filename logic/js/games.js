/* 🧠 脑力认知研究所 - 大宝「八少八素起航线」特训引擎 6yo Logic Games Engine */

let currentAnswer6yo = 0;
let currentDeductionTimeline = [];

// Built-in Chinese Speech Synthesis Utility with Natural Human Voice Selector
let bestChineseVoice = null;

function loadBestVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  
  // Prioritized list of high-quality natural standard Mandarin voices:
  // - "tingting": Apple macOS/iOS high-quality natural female (extremely standard & clear)
  // - "xiaoxiao": Microsoft Edge neural natural female (world-class human voice)
  // - "siri": Apple Siri voice assistant standard
  // - "huihui": Microsoft Windows standard clear desktop voice
  // - "google": Google Translate high-definition standard voice
  const priorityNames = ["tingting", "xiaoxiao", "siri", "huihui", "google", "yating", "kangkang"];
  
  const zhVoices = voices.filter(v => v.lang.includes("zh-CN") || v.lang.includes("zh_CN") || v.lang.includes("zh-"));
  if (zhVoices.length === 0) return;
  
  // Sort based on priority list
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

// Handle asynchronous loading of voices in Webkit/Blink engines
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadBestVoice;
  loadBestVoice(); // attempt immediate load
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speaking to prevent overlaps
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Explicitly bind the discovered premium standard Mandarin human voice
    if (bestChineseVoice) {
      utterance.voice = bestChineseVoice;
    } else {
      utterance.lang = 'zh-CN';
    }
    
    utterance.rate = 0.90;  // Slightly slower, highly clear listening speed for kids
    utterance.pitch = 1.05; // Slightly pleasant, friendly vocal pitch
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech synthesis not supported on this browser.");
  }
}

function launchTest(type) {
  const container = document.getElementById("game-stage");
  
  if (type === 'spatial') {
    // Spatial Dimension: 3D Block Count
    const blockQuestions = [
      { visual: "📦📦📦<br>📦📦", ans: 5, hint: "这是一个由5个积木堆成的简单平台哦！" },
      { visual: "🟩🟩🟩<br>🟩🟩⬜<br>⬜⬜⬜", ans: 6, hint: "注意！有一块积木藏在最底层后方，起到了支撑作用哦！" },
      { visual: "🟧🟧🟧<br>🟧🟦🟧<br>⬜🟧⬜", ans: 8, hint: "最中间的蓝色积木底下有一层被完全遮挡住了，总共有8个！" }
    ];
    const q = blockQuestions[Math.floor(Math.random() * blockQuestions.length)];
    currentAnswer6yo = q.ans;

    const questionText = "大宝，请数一数这堆立方体中总共有多少个积木，注意底层被压在底下的隐形积木哦。";

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h2 style="color:#818cf8; font-weight:800; margin:0;">🧱 3D 积木探视镜</h2>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:5px 12px; font-size:0.85em; display:flex; align-items:center; gap:5px; border-radius:15px; font-weight:700;">🔊 语音读题</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:25px;">🦁 数一数，总共有多少个积木卡槽（包含压在下面的“隐形积木”）：</p>
        
        <div style="background:rgba(15,23,42,0.6); padding:30px; border-radius:16px; height:180px; display:flex; align-items:center; justify-content:center; font-size:3em; border:1px solid rgba(255,255,255,0.06); line-height:1.4; font-family:var(--font-fira); font-weight:bold; letter-spacing:8px;">
          ${q.visual}
        </div>
        
        <p style="font-size:0.85em; color:var(--text-muted); margin-top:15px; margin-bottom:20px;">💡 提示：底层的积木如果被顶层压住了，说明那一格底层一定也有积木支撑！</p>
        
        <div style="display:flex; justify-content:center; gap:20px;">
          ${[4, 5, 6, 7, 8, 9].map(num => `
            <button class="mock-button glow-dabao" onclick="checkDabaoAnswer(${num})" style="font-size:1.4em; width:65px; height:65px; border-radius:10px; display:flex; align-items:center; justify-content:center;">${num}</button>
          `).join("")}
        </div>
        
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:35px; width:100%;">🛰️ 返回特训大厅</button>
      </div>
    `;
    
    // Autoplay voice question
    setTimeout(() => { speakText(questionText); }, 200);
  } 
  
  else if (type === 'numeric') {
    // Numeric Dimension: Progressive Sequence bubbles
    const seriesQuestions = [
      { sequence: [2, 4, null, 8, 10], ans: 6, desc: "2, 4, ?, 8, 10 (每次加几？)" },
      { sequence: [1, 3, 6, null, 15], ans: 10, desc: "1, 3, 6, ?, 15 (每次加数逐渐大1)" },
      { sequence: [20, 17, 14, null, 8], ans: 11, desc: "20, 17, 14, ?, 8 (每次减几？)" }
    ];
    const q = seriesQuestions[Math.floor(Math.random() * seriesQuestions.length)];
    currentAnswer6yo = q.ans;

    const questionText = "大宝，请根据数字的变化规律，猜一猜泡泡问号里面应该填哪个数字呢？";

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h2 style="color:#818cf8; font-weight:800; margin:0;">🧮 数泡泡找规律</h2>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:5px 12px; font-size:0.85em; display:flex; align-items:center; gap:5px; border-radius:15px; font-weight:700;">🔊 语音读题</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:25px;">🦁 猜猜泡泡【❓】里面应该填哪个数：</p>
        
        <div style="display:flex; justify-content:center; align-items:center; gap:15px; margin:30px 0;">
          ${q.sequence.map(item => {
            if (item === null) {
              return `<div style="width:65px; height:65px; border-radius:50%; border:3px dashed #06b6d4; display:flex; align-items:center; justify-content:center; font-size:1.6em; font-weight:800; color:#22d3ee; background:rgba(6,182,212,0.15); animation:pulseGlow 1.5s infinite;">❓</div>`;
            } else {
              return `<div style="width:60px; height:60px; border-radius:50%; border:2px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-size:1.4em; font-weight:800; background:rgba(255,255,255,0.05);">${item}</div>`;
            }
          }).join("")}
        </div>
        
        <div style="display:flex; justify-content:center; gap:15px; flex-wrap:wrap; margin-top:30px;">
          ${[5, 6, 8, 10, 11, 12, 13].map(opt => `
            <button class="mock-button glow-dabao" onclick="checkDabaoAnswer(${opt})" style="font-size:1.3em; width:60px; height:60px; border-radius:50%;">${opt}</button>
          `).join("")}
        </div>
        
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:35px; width:100%;">🛰️ 返回特训大厅</button>
      </div>
    `;
    
    // Autoplay voice question
    setTimeout(() => { speakText(questionText); }, 200);
  } 
  
  else if (type === 'attention') {
    // Attention Dimension: Schulte Grid
    const questionText = "大宝，请用小眼睛快速扫描格子，按照数字一到九的顺序，依次点击它们吧。";

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h2 style="color:#818cf8; font-weight:800; margin:0;">⚡ 舒尔特脑波追踪</h2>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:5px 12px; font-size:0.85em; display:flex; align-items:center; gap:5px; border-radius:15px; font-weight:700;">🔊 语音读题</button>
        </div>
        <p style="font-size:1.05em; color:#a1a1aa; margin-bottom:20px;">🦁 集中精神，快速点击数字 【1 → 9】：</p>
        
        <div id="schulte-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; max-width:280px; margin:25px auto;">
          <!-- Schulte cells loaded dynamically -->
        </div>
        
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:35px; width:100%;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setupDabaoSchulte();
    
    // Autoplay voice question
    setTimeout(() => { speakText(questionText); }, 200);
  } 
  
  else if (type === 'deduction') {
    // Deduction Dimension: Timeline ordering
    const timelineItems = [
      { id: '1', text: '🌱 种子种在土里' },
      { id: '2', text: '🌿 种子发芽抽绿叶' },
      { id: '3', text: '🌸 花朵挂满枝头' },
      { id: '4', text: '🍎 结出又大又红的苹果' }
    ];
    // Shuffle items
    currentDeductionTimeline = [...timelineItems].sort(() => Math.random() - 0.5);

    const questionText = "大宝，请通过点击上下方向键，重新把下面的事件，按照从小到大的生长顺序排一排吧。";

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h2 style="color:#818cf8; font-weight:800; margin:0;">🔍 时空发生顺序</h2>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:5px 12px; font-size:0.85em; display:flex; align-items:center; gap:5px; border-radius:15px; font-weight:700;">🔊 语音读题</button>
        </div>
        <p style="font-size:1.05em; color:#a1a1aa; margin-bottom:20px;">🦁 点击上下键，将卡片按苹果树的生长逻辑从头到尾排列：</p>
        
        <div id="timeline-list" style="display:flex; flex-direction:column; gap:12px; margin:25px 0;">
          ${currentDeductionTimeline.map((item, idx) => `
            <div id="timeline-item-${item.id}" class="glass-card timeline-node" draggable="true" style="padding:15px; cursor:grab; border-color:rgba(255,255,255,0.06); background:rgba(255,255,255,0.03); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600; color:#fff;">${item.text}</span>
              <div>
                <button class="mock-button" onclick="shiftTimelineNode(${idx}, -1)" style="padding:3px 8px; font-size:0.8em; margin-right:5px;">↑</button>
                <button class="mock-button" onclick="shiftTimelineNode(${idx}, 1)" style="padding:3px 8px; font-size:0.8em;">↓</button>
              </div>
            </div>
          `).join("")}
        </div>
        
        <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="width:100%; font-size:1.05em; font-weight:700; padding:10px; margin-top:10px;">提交答案</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:20px; width:100%; border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setupDeductionDrag();
    
    // Autoplay voice question
    setTimeout(() => { speakText(questionText); }, 200);
  }
}

function checkDabaoAnswer(ans) {
  if (ans === currentAnswer6yo) {
    initAppState();
    appState.players.dabao.stars += 10;
    saveAppState();
    
    // Play happy audio indicator
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      o.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.08); // C#5
      o.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.16); // E5
      o.frequency.setValueAtTime(880, audioCtx.currentTime + 0.24); // A5
      g.gain.setValueAtTime(0.2, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      o.start();
      o.stop(audioCtx.currentTime + 0.4);
    } catch(err){}

    speakText("答对了！大宝太厉害啦！加十分！");
    alert("🎉 太酷啦！大宝回答完全正确！获得 10 颗星星奖励！继续加油哦 🦁🌟");
    document.getElementById("star-count").innerText = `🪙 ${appState.players.dabao.stars}`;
    loadDabaoHUD();
  } else {
    speakText("不对哦。再仔细数十一下，或者换个数字试试吧！");
    alert("❌ 呀，算错啦。别着急，再仔细看一看、数一数细节，或者点击其他数字试试！💡");
  }
}

// 6yo Schulte grid implementation
function setupDabaoSchulte() {
  const gridContainer = document.getElementById("schulte-grid");
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Shuffle numbers
  numbers.sort(() => Math.random() - 0.5);
  
  gridContainer.innerHTML = numbers.map(num => `
    <button id="schulte-cell-${num}" class="schulte-cell mock-button" onclick="clickDabaoSchulte(${num})" style="height:70px; font-size:1.8em; font-weight:bold; color:white; background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.08); border-radius:10px;">${num}</button>
  `).join("");
  
  window.dabaoSchulteNext = 1;
}

function clickDabaoSchulte(num) {
  const btn = document.getElementById(`schulte-cell-${num}`);
  if (num === window.dabaoSchulteNext) {
    btn.style.background = "rgba(16, 185, 129, 0.25)";
    btn.style.borderColor = "#10b981";
    btn.style.color = "#fff";
    btn.setAttribute("disabled", "true");
    
    // Play light synth pop
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.frequency.setValueAtTime(300 + num * 60, audioCtx.currentTime);
      g.gain.setValueAtTime(0.15, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      o.start();
      o.stop(audioCtx.currentTime + 0.15);
    } catch(err){}

    window.dabaoSchulteNext++;
    
    if (window.dabaoSchulteNext > 9) {
      setTimeout(() => {
        initAppState();
        appState.players.dabao.stars += 15;
        saveAppState();
        speakText("专注力满分！大宝真棒！加十五分！");
        alert("🎉 闪电追踪！大宝专注力满分！获得 15 颗星星奖励！🦁🌟");
        document.getElementById("star-count").innerText = `🪙 ${appState.players.dabao.stars}`;
        loadDabaoHUD();
      }, 400);
    }
  } else {
    btn.style.background = "rgba(239, 68, 68, 0.25)";
    btn.style.borderColor = "#ef4444";
    
    speakText("点错数字了。再找找看。");
    
    setTimeout(() => {
      if (btn.style.background.includes("239")) {
        btn.style.background = "rgba(255, 255, 255, 0.05)";
        btn.style.borderColor = "rgba(255, 255, 255, 0.08)";
      }
    }, 250);
  }
}

// 6yo timeline events sorter shifting
function shiftTimelineNode(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= currentDeductionTimeline.length) return;
  
  // Swap items
  const temp = currentDeductionTimeline[index];
  currentDeductionTimeline[index] = currentDeductionTimeline[targetIndex];
  currentDeductionTimeline[targetIndex] = temp;
  
  // Rerender layout stage list
  rerenderTimelineStage();
}

function rerenderTimelineStage() {
  const container = document.getElementById("timeline-list");
  container.innerHTML = currentDeductionTimeline.map((item, idx) => `
    <div id="timeline-item-${item.id}" class="glass-card timeline-node" draggable="true" style="padding:15px; cursor:grab; border-color:rgba(255,255,255,0.06); background:rgba(255,255,255,0.03); display:flex; justify-content:space-between; align-items:center;">
      <span style="font-weight:600; color:#fff;">${item.text}</span>
      <div>
        <button class="mock-button" onclick="shiftTimelineNode(${idx}, -1)" style="padding:3px 8px; font-size:0.8em; margin-right:5px;">↑</button>
        <button class="mock-button" onclick="shiftTimelineNode(${idx}, 1)" style="padding:3px 8px; font-size:0.8em;">↓</button>
      </div>
    </div>
  `).join("");
}

function verifyDabaoTimeline() {
  // Correct sequence matches 1 -> 2 -> 3 -> 4
  const userOrder = currentDeductionTimeline.map(item => item.id).join("");
  if (userOrder === "1234") {
    initAppState();
    appState.players.dabao.stars += 10;
    saveAppState();
    speakText("排序正确！大宝太棒了！加十分！");
    alert("🎉 推演大成功！时空成长逻辑完美契合！获得 10 颗星星奖励！🦁🌟");
    document.getElementById("star-count").innerText = `🪙 ${appState.players.dabao.stars}`;
    loadDabaoHUD();
  } else {
    speakText("排序不太对哦，再想想看。");
    alert("❌ 唔，时空发生关系不对哦。小花必须先发芽才能盛开，再想一想，调换顺序重新提交吧！🐰");
  }
}

function setupDeductionDrag() {
  // Simple dragging hooks
  const nodes = document.querySelectorAll('.timeline-node');
  nodes.forEach(n => {
    n.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', n.id);
    });
  });
}
