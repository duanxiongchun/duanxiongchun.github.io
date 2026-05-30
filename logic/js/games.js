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

// ==================== 🛠️ 3D Isometric Block Generator Algorithm ====================

function getSpatialStack(level) {
  const cubes = [];
  
  if (level === 1) {
    return [{x:0, y:0, z:0}, {x:0, y:0, z:1}]; // ans: 2
  }
  if (level === 2) {
    return [{x:0, y:0, z:0}, {x:1, y:0, z:0}, {x:0, y:0, z:1}]; // ans: 3
  }
  if (level === 3) {
    return [{x:0, y:0, z:0}, {x:1, y:0, z:0}, {x:0, y:1, z:0}, {x:0, y:0, z:1}]; // ans: 4
  }
  if (level === 4) {
    return [
      {x:0, y:0, z:0}, {x:1, y:0, z:0}, {x:0, y:1, z:0}, {x:1, y:1, z:0},
      {x:0, y:0, z:1}
    ]; // ans: 5
  }
  if (level === 5) {
    return [
      {x:0, y:0, z:0}, {x:1, y:0, z:0}, {x:0, y:1, z:0}, {x:1, y:1, z:0},
      {x:0, y:0, z:1}, {x:1, y:0, z:1}
    ]; // ans: 6
  }
  
  // Procedural generator for Level 6 to 25:
  // Fills a base and builds columns where height is seed-dependent
  const baseSize = level <= 13 ? 2 : 3;
  for (let x = 0; x < baseSize; x++) {
    for (let y = 0; y < baseSize; y++) {
      let h = 1;
      // Establish column heights based on coordinates and level
      if (x === 0 && y === 0) h = Math.floor(level / 5) + 1; // Tall back column
      else if (x === 1 && y === 0) h = Math.floor(level / 9) + 1;
      else if (x === 0 && y === 1) h = Math.floor(level / 12) + 1;
      
      // Safety bounds cap
      if (h > 4) h = 4;
      
      for (let z = 0; z < h; z++) {
        cubes.push({x, y, z});
      }
    }
  }
  return cubes;
}

// Render stable isometric 3D SVG code
function renderIsometricSVG(cubes) {
  // Sort cubes from Back to Front to ensure correct overlapping/perspective!
  // Back-most is (0,0,0) -> Front-most is (max, max, max)
  // Higher z drawn later to overlap base layers
  cubes.sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.z - b.z);
  
  const center_x = 160;
  const center_y = 120;
  
  let svgContent = `<svg width="100%" height="220" viewBox="0 0 320 220" style="background:transparent; display:block; margin:auto;">`;
  
  // Subtle grids shadow floor base
  svgContent += `<ellipse cx="160" cy="140" rx="90" ry="40" fill="rgba(0,0,0,0.2)" />`;
  
  cubes.forEach(cube => {
    // Coordinate mapping horizontal & vertical displacement vectors
    const cx = center_x + (cube.x - cube.y) * 24;
    const cy = center_y + (cube.x + cube.y) * 12 - cube.z * 24;
    
    // Choose theme shades based on coordinates to make columns highly distinct!
    let topColor = "#a5b4fc";
    let leftColor = "#6366f1";
    let rightColor = "#4f46e5";
    
    if ((cube.x + cube.y) % 2 === 1) {
      topColor = "#34d399";
      leftColor = "#10b981";
      rightColor = "#059669";
    }
    
    svgContent += `
      <g transform="translate(${cx}, ${cy})">
        <!-- Top Face (Rhombus top shadow) -->
        <polygon points="0,-12 24,0 0,12 -24,0" fill="${topColor}" stroke="#1e1b4b" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Left Face (Left vertical side) -->
        <polygon points="-24,0 0,12 0,36 -24,24" fill="${leftColor}" stroke="#1e1b4b" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Right Face (Right vertical side) -->
        <polygon points="0,12 24,0 24,24 0,36" fill="${rightColor}" stroke="#1e1b4b" stroke-width="1.5" stroke-linejoin="round"/>
      </g>
    `;
  });
  
  svgContent += `</svg>`;
  return svgContent;
}

// ==================== 🛠️ 200关题库 Databases ====================

const SPATIAL_DB = []; // Fallback empty database, now driven by getSpatialStack generator
const NUMERIC_DB = [
  { id: "num_1", sequence: [2, 4, null, 8, 10], ans: 6, text: "果果，猜一猜蓝色问号泡泡里，应该填哪个数字？", hint: "每次往上加二：二，四，后面应该接哪个数？" },
  { id: "num_2", sequence: [1, 3, 6, null, 15], ans: 10, text: "果果，猜一猜蓝色问号泡泡里，应该填哪个数字？", hint: "每次加的数大一：一加二得三，三加三得六，六加四是多少？" },
  { id: "num_3", sequence: [20, 17, 14, null, 8], ans: 11, text: "果果，猜一猜蓝色问号泡泡里，应该填哪个数字？", hint: "每次减去三：二十，十七，十四，十四减三是多少？" },
  { id: "num_4", sequence: [5, 10, null, 20, 25], ans: 15, text: "果果，猜一猜蓝色问号泡泡里，应该填哪个数字？", hint: "这是五个五个往上数：五，十，后面应该接哪一个？" },
  { id: "num_5", sequence: [1, 2, 4, null, 16], ans: 8, text: "果果，猜一猜蓝色问号泡泡里，应该填哪个数字？", hint: "每次变成双倍：一的两倍是二，二的两倍是四，四的两倍是多少？" }
];

const ATTENTION_DB = [
  { id: "att_1", reverse: false, text: "果果，请集中精神，用眼睛快速扫描，按顺序依次点击 【1 到 9】 的格子！" },
  { id: "att_2", reverse: true, text: "果果，这次要考验你的倒数能力！请按顺序，反过来依次点击 【9 到 1】 的格子！" },
  { id: "att_3", evenOnly: true, text: "果果，这次是数学特训！请只找出偶数，按顺序依次点击 【2、4、6、8】 的格子！" }
];

const DEDUCTION_DB = [
  { 
    id: "ded_1", 
    text: "果果，请把下面的生长图片，按照苹果树从种子到苹果的逻辑顺序重新排一排吧。",
    items: [
      { id: '1', text: '🌱 种子种在土里' },
      { id: '2', text: '🌿 种子发芽抽绿叶' },
      { id: '3', text: '🌸 花朵挂满树枝' },
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
  
  if (!player.progress) {
    player.progress = { spatial: 1, numeric: 1, attention: 1, deduction: 1 };
  }
  
  const level = player.progress[type];
  const container = document.getElementById("game-stage");
  window.currentGameTrack = type;
  
  if (level > 50) {
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
  
  if (type === 'spatial') {
    const cubes = getSpatialStack(level);
    currentAnswer6yo = cubes.length;
    
    const questionText = `果果，请你数一数这堆立方体中总共有多少个积木，注意底下被压住的地方也藏有支撑积木哦。`;
    const svgHTML = renderIsometricSVG(cubes);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h3 style="color:#818cf8; font-weight:800; margin:0;">🧱 3D 积木探视镜 - 第 ${level} / 50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px; font-size:0.8em; border-radius:15px; font-weight:700;">🔊 读题</button>
        </div>
        <p style="font-size:0.9em; color:#a1a1aa; margin-bottom:20px;">🦁 仔细看清堆叠结构，数一数总共由多少个方块堆成：</p>
        
        <div class="glass-card" style="background:rgba(15,23,42,0.6); padding:10px; border-radius:16px; border:1px solid rgba(255,255,255,0.06); margin-bottom:20px;">
          ${svgHTML}
        </div>
        
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          ${Array.from({length: 8}, (_, i) => i + (currentAnswer6yo > 5 ? currentAnswer6yo - 4 : 2)).map(num => `
            <button class="mock-button glow-dabao" onclick="check6yoAnswer(${num})" style="font-size:1.35em; width:52px; height:52px; border-radius:10px; display:flex; align-items:center; justify-content:center;">${num}</button>
          `).join("")}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:30px; width:100%; border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(questionText); }, 250);
  } 
  
  else if (type === 'numeric') {
    // Generate Numeric Question dynamically based on level
    let sequence = [];
    let correct = 0;
    let hint = "";
    
    if (level <= 15) {
      const diff = (level % 3) + 2;
      const start = Math.floor(level / 2) + 1;
      sequence = [start, start + diff, null, start + diff*3, start + diff*4];
      correct = start + diff * 2;
      hint = `仔细看，每个数字都比前一个大${diff}。`;
    } else if (level <= 30) {
      const diff = (level % 2) + 2;
      const start = 20 - (level % 4);
      sequence = [start, start - diff, start - diff*2, null, start - diff*4];
      correct = start - diff * 3;
      hint = `每次都减去${diff}，数字在变小。`;
    } else if (level <= 40) {
      sequence = [1, 2, 4, null, 16];
      correct = 8;
      hint = `后面一个是前一个的两倍，四的两倍是多少？`;
    } else {
      sequence = [1, 2, 3, 5, null, 13];
      correct = 8;
      hint = `前两个数字相加等于后一个：五加三等于多少？`;
    }
    
    currentAnswer6yo = correct;
    const questionText = `果果，请你根据这些数字排队的规律，猜一猜蓝色问号泡泡里面应该填哪个数字？`;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h3 style="color:#818cf8; font-weight:800; margin:0;">🧮 数理找规律 - 第 ${level} / 50 关</h3>
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
        
        <p style="font-size:0.85em; color:var(--text-muted); margin-top:15px; margin-bottom:20px;">💡 提示：${hint}</p>
        
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          ${Array.from({length: 12}, (_, i) => i + (correct > 6 ? correct - 5 : 2)).map(opt => `
            <button class="mock-button glow-dabao" onclick="check6yoAnswer(${opt})" style="font-size:1.2em; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center;">${opt}</button>
          `).join("")}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:35px; width:100%; border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(questionText); }, 250);
  } 
  
  else if (type === 'attention') {
    let gridDesc = "";
    let questionText = "";
    
    if (level <= 15) {
      gridDesc = "按 1 到 9 的顺序，最快点击格子：";
      questionText = "果果，请用小眼睛最快速度按顺序，点击一到九的数字格子！";
    } else if (level <= 30) {
      gridDesc = "这次要倒过来数！按 9 到 1 顺序点击格子：";
      questionText = "果果，这次要考验你的倒数能力，请按顺序从大到小，点击九到一的数字格子！";
    } else if (level <= 40) {
      gridDesc = "只找偶数！按 2、4、6、8 顺序依次点击：";
      questionText = "果果，这次要找出双数，请按顺序点击二、四、六、八的数字格子！";
    } else {
      gridDesc = "高难终极挑战！按 1 到 16 顺序依次点击：";
      questionText = "高难挑战来啦！果果，请按顺序，最快速度依次点击一到十六的数字格子！";
    }
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(99,102,241,0.3);">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;">
          <h3 style="color:#818cf8; font-weight:800; margin:0;">⚡ 舒尔特网格 - 第 ${level} / 50 关</h3>
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
  } 
  
  else if (type === 'deduction') {
    const timelines = [
      {
        text: "果果，请把下面的生长图片，按照苹果树从种子到结苹果的因果顺序，重新排一排吧：",
        items: [
          { id: '1', text: '🌱 种子种在土里' },
          { id: '2', text: '🌿 种子发芽抽绿叶' },
          { id: '3', text: '🌸 花朵挂满树枝' },
          { id: '4', text: '🍎 结出又大又红的苹果' }
        ]
      },
      {
        text: "果果，请把下面的时间活动卡片，按照从早晨起床到晚上睡觉的时间顺序排列好：",
        items: [
          { id: '1', text: '🌅 早晨太阳升起起床' },
          { id: '2', text: '🎒 背上小书包去学校' },
          { id: '3', text: '🍽️ 中午和老师同学吃午饭' },
          { id: '4', text: '🌙 闭上眼睛盖上小被子睡觉' }
        ]
      },
      {
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
          <h3 style="color:#818cf8; font-weight:800; margin:0;">⏳ 因果时空排序 - 第 ${level} / 50 关</h3>
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
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:20px; width:100%; border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => { speakText(q.text); }, 250);
  }
}

// -------------------- 🏆 统一答案校验与进度自动递进 --------------------

function check6yoAnswer(ans) {
  if (ans === currentAnswer6yo) {
    trigger6yoVictory(10, "答对啦！果果太棒了！加十个星星！");
  } else {
    speakText("算错啦，再仔细看一看，或者换个答案试试吧，你可以的！");
    alert("❌ 呀，算错/推错啦。别着急，再仔细看一看、想一想，再次尝试吧！💡");
  }
}

function verifyDabaoTimeline() {
  const userOrder = currentDeductionTimeline.map(item => item.id).join("");
  if (userOrder === "1234") {
    trigger6yoVictory(10, "排序完美！果果真厉害！加十个星星！");
  } else {
    speakText("排序发生顺序不太对哦，再想想看吧。");
    alert("❌ 唔，时空排序的成长先后顺序不对。再调整一下顺序重新提交验证吧！🐰");
  }
}

// Dynamic victory card overlay with 1.2-second automatic level advancement!
function trigger6yoVictory(starEarned, speechFeedback) {
  initAppState();
  const player = appState.players.dabao;
  const type = window.currentGameTrack;
  
  // Advance progress stably
  player.progress[type]++;
  player.stars += starEarned;
  saveAppState();
  
  // Play happy synth sound
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

  // Inject a beautiful victory pop card overlay above target game stage!
  const container = document.getElementById("game-stage");
  const originalHTML = container.innerHTML;
  
  container.innerHTML = `
    <div class="glass-card" style="padding:40px; text-align:center; max-width:500px; margin:40px auto; border-color: #10b981; background:rgba(16,185,129,0.08); backdrop-filter:blur(20px); border-width:2px; animation: pulseGlow 1.2s infinite ease-in-out;">
      <span style="font-size:5em; display:block; margin-bottom:10px;">🌟</span>
      <h2 style="color:#10b981; font-weight:800; margin-bottom:5px;">回答正确！</h2>
      <p style="font-size:1.1em; color:#fff; font-weight:600;">${speechFeedback}</p>
      <div style="font-size:1.5em; font-weight:bold; color:#fbbf24; margin:15px 0;">🪙 星星余额 +${starEarned}</div>
      <p style="font-size:0.8em; color:#94a3b8; letter-spacing:1px; animation: blinker 1s linear infinite;">正在自动开启下一关，请准备... 🚀</p>
    </div>
  `;
  
  speakText(speechFeedback);
  
  // Set 1.2-second delay then automatically launch the next level!
  setTimeout(() => {
    launchTest(type);
  }, 1200);
}

function setupSchulteGridMatrix(level) {
  const grid = document.getElementById("schulte-grid");
  
  if (level <= 40) {
    grid.style.gridTemplateColumns = "repeat(3, 1fr)";
    grid.style.maxWidth = "280px";
    
    if (level <= 15) {
      // 1 to 9 Ascending
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      grid.innerHTML = numbers.map(n => `
        <button id="cell-${n}" class="schulte-cell mock-button" onclick="clickSchulteTrack(${n}, 1, 9, 1)" style="height:75px; font-size:1.8em; font-weight:bold;">${n}</button>
      `).join("");
      window.schulteTarget = 1;
    } else if (level <= 30) {
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

function clickTimelineNode(index, direction) {
  shiftTimelineNode(index, direction); // compatibility hook
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

function setupDeductionDrag() {
  // disabled desktop default drags, shifted completely to button controls
}

function resetTrackProgress(type) {
  initAppState();
  const player = appState.players.dabao;
  player.progress[type] = 1;
  saveAppState();
  alert(`🛸 果果的「${getTrackChineseName(type)}」五十关特训已全部清空重置，快来开始新一轮的智慧闯关吧！`);
  launchTest(type);
}
