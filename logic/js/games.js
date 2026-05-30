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

// ==================== 🛠️ 扩充后的完整逻辑题库 Databases ====================

const SPATIAL_DB = [
  { id: "sp_1", visual: "📦📦📦<br>📦📦", ans: 5, text: "果果，请数一数这堆立方体积木，总共有多少个？", hint: "底层被顶层压住的地方，底下一定也垫有积木支撑哦！" },
  { id: "sp_2", visual: "🟩🟩🟩<br>🟩🟩⬜<br>⬜⬜⬜", ans: 6, text: "果果，请数一数这堆绿色立方体积木，总共有多少个？", hint: "最底层藏了一块隐形积木起到支撑作用哦，总共是6个！" },
  { id: "sp_3", visual: "🟧🟧🟧<br>🟧🟦🟧<br>⬜🟧⬜", ans: 8, text: "果果，请数一数这堆双色立方体积木，总共有多少个？", hint: "中间蓝色的下方完全被遮挡住了，总共有8个积木！" },
  { id: "sp_4", visual: "📦📦📦📦<br>📦⬜⬜📦<br>📦📦📦📦", ans: 7, text: "果果，数一数这堆空心立方体积木，总共有多少个？", hint: "四周排成了一圈，中间那一格是空心的哦，总共是7个！" },
  { id: "sp_5", visual: "🟦🟦🟦<br>🟦🟦🟦<br>🟦🟦🟦", ans: 9, text: "果果，数一数这大箱子立体积木，总共有多少个？", hint: "这是一个三乘三的方块平面，总共是9个积木！" }
];

const NUMERIC_DB = [
  { id: "num_1", sequence: [2, 4, null, 8, 10], ans: 6, text: "果果，猜一猜蓝色问号泡泡里，应该填哪个数字？", hint: "仔细观察：2，4，后面填什么才能再到8、10呢？每次多加2哦！" },
  { id: "num_2", sequence: [1, 3, 6, null, 15], ans: 10, text: "果果，猜一猜蓝色问号泡泡里，应该填哪个数字？", hint: "每次加的数在逐渐变大：1加2得3，3加3得6，6加几得问号呢？" },
  { id: "num_3", sequence: [20, 17, 14, null, 8], ans: 11, text: "果果，猜一猜蓝色问号泡泡里，应该填哪个数字？", hint: "这是一列逐渐变小的倒数：20减3得17，17减3得14，14减3是多少？" },
  { id: "num_4", sequence: [5, 10, null, 20, 25], ans: 15, text: "果果，猜一猜蓝色问号泡泡里，应该填哪个数字？", hint: "这是五个五个往上加的规律：5，10，后面应该接哪个五的数字？" },
  { id: "num_5", sequence: [1, 2, 4, null, 16], ans: 8, text: "果果，猜一猜蓝色问号泡泡里，应该填哪个数字？", hint: "每次后面的数字都是前一个的两倍：1的两倍是2，2的两倍是4，4的两倍是多少？" }
];

const ATTENTION_DB = [
  { id: "att_1", reverse: false, text: "果果，请集中精神，用眼睛快速扫描，按顺序依次点击 【1 到 9】 的格子！" },
  { id: "att_2", reverse: true, text: "果果，这次要考验你的倒数能力！请按顺序，反过来依次点击 【9 到 1】 的格子！" },
  { id: "att_3", evenOnly: true, text: "果果，这次是数学特训！请只找出偶数，按顺序依次点击 【2、4、6、8】 的格子！" }
];

const DEDUCTION_DB = [
  { 
    id: "ded_1", 
    text: "果果，请把下面的生长图片，按照苹果树从那种子到苹果的逻辑顺序重新排一排吧。",
    items: [
      { id: '1', text: '🌱 种子种在土里' },
      { id: '2', text: '🌿 种子发芽抽绿叶' },
      { id: '3', text: '🌸 花朵挂满枝头' },
      { id: '4', text: '🍎 结出又大又红的苹果' }
    ]
  },
  {
    id: "ded_2",
    text: "果果，请把果果一天的行为，按照从早到晚的时间顺序排列好。",
    items: [
      { id: '1', text: '🌅 早晨起床穿衣服' },
      { id: '2', text: '🎒 背上书包上学去' },
      { id: '3', text: '🍽️ 中午和同学吃午饭' },
      { id: '4', text: '🌙 晚上盖上小被子睡觉' }
    ]
  },
  {
    id: "ded_3",
    text: "果果，请把小鸟破壳的过程，按照正确的时间发展顺序排列好。",
    items: [
      { id: '1', text: '🥚 鸟窝里放着一个小鸟蛋' },
      { id: '2', text: '🐣 鸟蛋裂开了小细缝' },
      { id: '3', text: '🐥 小鸟伸出小脑袋探望' },
      { id: '4', text: '🕊️ 小鸟长出翅膀飞向蓝天' }
    ]
  }
];

// ==================== 🎮 游戏选择与非重复处理引擎 ====================

function launchTest(type) {
  initAppState();
  const player = appState.players.dabao;
  if (!player.solvedQuestions) player.solvedQuestions = [];
  
  let db = [];
  if (type === 'spatial') db = SPATIAL_DB;
  else if (type === 'numeric') db = NUMERIC_DB;
  else if (type === 'attention') db = ATTENTION_DB;
  else if (type === 'deduction') db = DEDUCTION_DB;
  
  // Filter out correctly solved questions to eliminate duplicates
  const unsolved = db.filter(q => !player.solvedQuestions.includes(q.id));
  const container = document.getElementById("game-stage");
  
  if (unsolved.length === 0) {
    // VICTORY SCREEN FOR TRACK COMPLETION
    container.innerHTML = `
      <div class="glass-card" style="padding:40px; text-align:center; max-width:600px; margin:30px auto; border-color: #10b981;">
        <span style="font-size:5em; display:block; margin-bottom:15px; animation:pulseGlow 2s infinite;">🏆</span>
        <h2 style="color:#10b981; font-weight:800; margin-bottom:10px;">完美通关！超级大脑！</h2>
        <p style="font-size:1.1em; color:#e2e8f0; margin-bottom:20px;">果果，你太优秀了！本维度的所有挑战关卡都已经被你全部攻克啦！</p>
        <p style="font-size:0.85em; color:#94a3b8; margin-bottom:30px;">你可以随时重置本项特训，再次挑战刷新纪录。</p>
        
        <button class="mock-button glow-success" onclick="resetTrackProgress('${type}')" style="width:100%; font-size:1.1em; padding:12px; margin-bottom:12px;">🛰️ 重置本特训题库 (重新挑战)</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="width:100%; border-color:transparent; color:#94a3b8;">返回大厅</button>
      </div>
    `;
    speakText("果果，恭喜你！这堆特训已经被你完美通关啦！你太棒了！");
    return;
  }
  
  // Load the first unsolved question
  const q = unsolved[0];
  window.currentQuestionId = q.id;
  
  if (type === 'spatial') {
    currentAnswer6yo = q.ans;
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h2 style="color:#818cf8; font-weight:800; margin:0;">🧱 空间立方体 (剩余: ${unsolved.length}关)</h2>
          <button class="mock-button glow-dabao" onclick="speakText('${q.text}')" style="padding:5px 12px; font-size:0.85em; display:flex; align-items:center; gap:5px; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:25px;">🦁 请数一数一共有多少个积木（别忘数底层的隐形支撑积木）：</p>
        
        <div style="background:rgba(15,23,42,0.6); padding:30px; border-radius:16px; height:180px; display:flex; align-items:center; justify-content:center; font-size:3em; border:1px solid rgba(255,255,255,0.06); line-height:1.4; font-family:var(--font-fira); font-weight:bold; letter-spacing:8px;">
          ${q.visual}
        </div>
        
        <p style="font-size:0.85em; color:var(--text-muted); margin-top:15px; margin-bottom:20px;">💡 提示：${q.hint}</p>
        
        <div style="display:flex; justify-content:center; gap:15px;">
          ${[4, 5, 6, 7, 8, 9, 10].map(num => `
            <button class="mock-button glow-dabao" onclick="checkDabaoAnswer(${num})" style="font-size:1.4em; width:55px; height:55px; border-radius:10px; display:flex; align-items:center; justify-content:center;">${num}</button>
          `).join("")}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:35px; width:100%;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(q.text); }, 250);
  } 
  
  else if (type === 'numeric') {
    currentAnswer6yo = q.ans;
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h2 style="color:#818cf8; font-weight:800; margin:0;">🧮 规律数列 (剩余: ${unsolved.length}关)</h2>
          <button class="mock-button glow-dabao" onclick="speakText('${q.text}')" style="padding:5px 12px; font-size:0.85em; display:flex; align-items:center; gap:5px; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:25px;">🦁 猜猜蓝色问号泡泡【❓】里应该填哪个数字：</p>
        
        <div style="display:flex; justify-content:center; align-items:center; gap:15px; margin:30px 0;">
          ${q.sequence.map(item => {
            if (item === null) {
              return `<div style="width:65px; height:65px; border-radius:50%; border:3px dashed #06b6d4; display:flex; align-items:center; justify-content:center; font-size:1.6em; font-weight:800; color:#22d3ee; background:rgba(6,182,212,0.15); animation:pulseGlow 1.5s infinite;">❓</div>`;
            } else {
              return `<div style="width:60px; height:60px; border-radius:50%; border:2px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-size:1.4em; font-weight:800; background:rgba(255,255,255,0.05);">${item}</div>`;
            }
          }).join("")}
        </div>
        
        <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-top:30px;">
          ${[5, 6, 8, 10, 11, 12, 13, 15, 16].map(opt => `
            <button class="mock-button glow-dabao" onclick="checkDabaoAnswer(${opt})" style="font-size:1.2em; width:55px; height:55px; border-radius:50%;">${opt}</button>
          `).join("")}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:35px; width:100%;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(q.text); }, 250);
  } 
  
  else if (type === 'attention') {
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h2 style="color:#818cf8; font-weight:800; margin:0;">⚡ 闪电专注力 (剩余: ${unsolved.length}关)</h2>
          <button class="mock-button glow-dabao" onclick="speakText('${q.text}')" style="padding:5px 12px; font-size:0.85em; display:flex; align-items:center; gap:5px; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:20px;">🦁 集中注意，快速点击下方网格格子：</p>
        
        <div id="schulte-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; max-width:280px; margin:25px auto;">
          <!-- Schulte cells loaded dynamically -->
        </div>
        
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:35px; width:100%;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setupDabaoSchulte(q);
    setTimeout(() => { speakText(q.text); }, 250);
  } 
  
  else if (type === 'deduction') {
    // Deduction events timelines
    currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h2 style="color:#818cf8; font-weight:800; margin:0;">🔍 时空逻辑推理 (剩余: ${unsolved.length}关)</h2>
          <button class="mock-button glow-dabao" onclick="speakText('${q.text}')" style="padding:5px 12px; font-size:0.85em; display:flex; align-items:center; gap:5px; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:20px;">🦁 用上下键调整顺序，让卡片符合正常逻辑链条：</p>
        
        <div id="timeline-list" style="display:flex; flex-direction:column; gap:12px; margin:25px 0;">
          ${currentDeductionTimeline.map((item, idx) => `
            <div id="timeline-item-${item.id}" class="glass-card timeline-node" style="padding:15px; border-color:rgba(255,255,255,0.06); background:rgba(255,255,255,0.03); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600; color:#fff;">${item.text}</span>
              <div>
                <button class="mock-button" onclick="shiftTimelineNode(${idx}, -1)" style="padding:3px 8px; font-size:0.8em; margin-right:5px;">↑</button>
                <button class="mock-button" onclick="shiftTimelineNode(${idx}, 1)" style="padding:3px 8px; font-size:0.8em;">↓</button>
              </div>
            </div>
          `).join("")}
        </div>
        
        <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="width:100%; font-size:1.05em; font-weight:700; padding:10px; margin-top:10px;">提交验证</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:20px; width:100%; border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(q.text); }, 250);
  }
}

function checkDabaoAnswer(ans) {
  if (ans === currentAnswer6yo) {
    initAppState();
    
    // Add active question to solvedQuestions list
    const player = appState.players.dabao;
    if (!player.solvedQuestions.includes(window.currentQuestionId)) {
      player.solvedQuestions.push(window.currentQuestionId);
    }
    
    player.stars += 10;
    saveAppState();
    
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.frequency.setValueAtTime(440, audioCtx.currentTime); 
      o.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.08); 
      o.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.16); 
      o.frequency.setValueAtTime(880, audioCtx.currentTime + 0.24); 
      g.gain.setValueAtTime(0.2, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      o.start();
      o.stop(audioCtx.currentTime + 0.4);
    } catch(err){}

    speakText("答对了！果果太厉害了！获得十个星星！");
    alert("🎉 太酷啦！果果回答完全正确！获得 10 颗星星奖励！狮子号特训已解锁下一关！🦁🌟");
    document.getElementById("star-count").innerText = `🪙 ${player.stars}`;
    loadDabaoHUD();
  } else {
    speakText("算错啦，里面有些压在底部的隐藏方块哦，再看一看吧！");
    alert("❌ 呀，算错啦。别着急，再仔细看一看、数一数细节，或者点击其他数字试试！💡");
  }
}

function setupDabaoSchulte(q) {
  const gridContainer = document.getElementById("schulte-grid");
  
  if (q.id === 'att_3') {
    // Even only clicker sequence: 2, 4, 6, 8, and dummy odd numbers
    const cells = [2, 4, 6, 8, 1, 3, 5, 7, 9];
    cells.sort(() => Math.random() - 0.5);
    
    gridContainer.innerHTML = cells.map(num => `
      <button id="schulte-cell-${num}" class="schulte-cell mock-button" onclick="clickDabaoEvenSchulte(${num})" style="height:70px; font-size:1.8em; font-weight:bold; color:white; background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.08); border-radius:10px;">${num}</button>
    `).join("");
    window.dabaoSchulteNextIndex = 0;
    window.dabaoEvenSequence = [2, 4, 6, 8];
  } else {
    // Normal 1-9 or Reverse 9-1
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    numbers.sort(() => Math.random() - 0.5);
    
    gridContainer.innerHTML = numbers.map(num => `
      <button id="schulte-cell-${num}" class="schulte-cell mock-button" onclick="clickDabaoSchulte(${num}, ${q.reverse})" style="height:70px; font-size:1.8em; font-weight:bold; color:white; background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.08); border-radius:10px;">${num}</button>
    `).join("");
    
    window.dabaoSchulteNext = q.reverse ? 9 : 1;
  }
}

function clickDabaoSchulte(num, reverse) {
  const btn = document.getElementById(`schulte-cell-${num}`);
  const targetVal = window.dabaoSchulteNext;
  
  if (num === targetVal) {
    btn.style.background = "rgba(16, 185, 129, 0.25)";
    btn.style.borderColor = "#10b981";
    btn.setAttribute("disabled", "true");
    
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.frequency.setValueAtTime(320 + num * 50, audioCtx.currentTime);
      g.gain.setValueAtTime(0.15, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      o.start();
      o.stop(audioCtx.currentTime + 0.15);
    } catch(err){}

    if (reverse) {
      window.dabaoSchulteNext--;
      if (window.dabaoSchulteNext < 1) {
        triggerDabaoAttentionWin();
      }
    } else {
      window.dabaoSchulteNext++;
      if (window.dabaoSchulteNext > 9) {
        triggerDabaoAttentionWin();
      }
    }
  } else {
    btn.style.background = "rgba(239, 68, 68, 0.25)";
    btn.style.borderColor = "#ef4444";
    speakText("不对，再找一找。");
    setTimeout(() => {
      btn.style.background = "rgba(255, 255, 255, 0.05)";
      btn.style.borderColor = "rgba(255, 255, 255, 0.08)";
    }, 250);
  }
}

function clickDabaoEvenSchulte(num) {
  const btn = document.getElementById(`schulte-cell-${num}`);
  const target = window.dabaoEvenSequence[window.dabaoSchulteNextIndex];
  
  if (num === target) {
    btn.style.background = "rgba(16, 185, 129, 0.25)";
    btn.style.borderColor = "#10b981";
    btn.setAttribute("disabled", "true");
    
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.frequency.setValueAtTime(320 + target * 50, audioCtx.currentTime);
      g.gain.setValueAtTime(0.15, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      o.start();
      o.stop(audioCtx.currentTime + 0.15);
    } catch(err){}

    window.dabaoSchulteNextIndex++;
    if (window.dabaoSchulteNextIndex >= window.dabaoEvenSequence.length) {
      triggerDabaoAttentionWin();
    }
  } else {
    btn.style.background = "rgba(239, 68, 68, 0.25)";
    btn.style.borderColor = "#ef4444";
    speakText("这个不是偶数哦，再选选别的吧。");
    setTimeout(() => {
      btn.style.background = "rgba(255, 255, 255, 0.05)";
      btn.style.borderColor = "rgba(255, 255, 255, 0.08)";
    }, 250);
  }
}

function triggerDabaoAttentionWin() {
  setTimeout(() => {
    initAppState();
    const player = appState.players.dabao;
    if (!player.solvedQuestions.includes(window.currentQuestionId)) {
      player.solvedQuestions.push(window.currentQuestionId);
    }
    player.stars += 15;
    saveAppState();
    speakText("专注力满分！果果真棒！加十五个星星！");
    alert("🎉 闪电追踪！果果专注力满分！获得 15 颗星星奖励！🦁🌟");
    document.getElementById("star-count").innerText = `🪙 ${player.stars}`;
    loadDabaoHUD();
  }, 400);
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
    <div id="timeline-item-${item.id}" class="glass-card timeline-node" style="padding:15px; border-color:rgba(255,255,255,0.06); background:rgba(255,255,255,0.03); display:flex; justify-content:space-between; align-items:center;">
      <span style="font-weight:600; color:#fff;">${item.text}</span>
      <div>
        <button class="mock-button" onclick="shiftTimelineNode(${idx}, -1)" style="padding:3px 8px; font-size:0.8em; margin-right:5px;">↑</button>
        <button class="mock-button" onclick="shiftTimelineNode(${idx}, 1)" style="padding:3px 8px; font-size:0.8em;">↓</button>
      </div>
    </div>
  `).join("");
}

function verifyDabaoTimeline() {
  const userOrder = currentDeductionTimeline.map(item => item.id).join("");
  // Timeline matches sequential 1 -> 2 -> 3 -> 4
  if (userOrder === "1234") {
    initAppState();
    const player = appState.players.dabao;
    if (!player.solvedQuestions.includes(window.currentQuestionId)) {
      player.solvedQuestions.push(window.currentQuestionId);
    }
    player.stars += 10;
    saveAppState();
    speakText("排序正确！果果太聪明啦！获得十个星星！");
    alert("🎉 推演大成功！时空成长逻辑完美契合！获得 10 颗星星奖励！🦁🌟");
    document.getElementById("star-count").innerText = `🪙 ${player.stars}`;
    loadDabaoHUD();
  } else {
    speakText("发生顺序不太对哦，再想想看吧。");
    alert("❌ 唔，时空发生关系顺序不对。发芽和开花有先后规律哦，再调整一下顺序重新提交吧！🐰");
  }
}

function setupDeductionDrag() {
  const nodes = document.querySelectorAll('.timeline-node');
  nodes.forEach(n => {
    n.draggable = false; // Disable default desktop dragging and fully rely on click shifter controls
  });
}

function resetTrackProgress(type) {
  initAppState();
  let db = [];
  if (type === 'spatial') db = SPATIAL_DB;
  else if (type === 'numeric') db = NUMERIC_DB;
  else if (type === 'attention') db = ATTENTION_DB;
  else if (type === 'deduction') db = DEDUCTION_DB;
  
  const ids = db.map(q => q.id);
  
  // Remove these IDs from Guoguo's solved list
  const player = appState.players.dabao;
  player.solvedQuestions = player.solvedQuestions.filter(id => !ids.includes(id));
  
  saveAppState();
  alert(`🛸 ${player.name}的本特训关卡已重置！可以重新刷题闯关啦！`);
  launchTest(type);
}
