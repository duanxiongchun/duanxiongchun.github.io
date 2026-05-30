/* 🧠 脑力认知研究所 - 果果「北京八中少儿班/八素班」选拔特训引擎 v3.0 */
/* 8大维度 × 50关 = 400关题库 | 基于北京八中超常班考察框架 */

let currentAnswer6yo = 0;
let currentDeductionTimeline = [];
let currentMemorySequence = [];
let currentPatternAnswer = '';
let currentLanguageAnswer = '';
let currentAnalogyAnswer = '';

// ==================== 🔊 中文语音引擎 ====================

let bestChineseVoice = null;

function loadBestVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const priorityNames = ["tingting", "xiaoxiao", "siris", "huihui", "google 普通话", "yating", "kangkang"];
  const zhVoices = voices.filter(v => v.lang.includes("zh-CN") || v.lang.includes("zh_CN") || v.lang.includes("zh-TW") || v.lang.startsWith("zh"));
  if (zhVoices.length === 0) return;
  zhVoices.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    let aIdx = priorityNames.findIndex(p => aName.includes(p));
    let bIdx = priorityNames.findIndex(p => bName.includes(p));
    if (aIdx === -1) aIdx = 999;
    if (bIdx === -1) bIdx = 999;
    return aIdx - bIdx;
  });
  bestChineseVoice = zhVoices[0];
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadBestVoice;
  loadBestVoice();
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (bestChineseVoice) u.voice = bestChineseVoice;
  else u.lang = 'zh-CN';
  u.rate = 0.88;
  u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

// ==================== 🏆 胜利引擎（统一入口）====================

function trigger6yoVictory(starEarned, speechFeedback) {
  const type = window.currentGameTrack;
  if (!type) { console.warn("currentGameTrack not set"); return; }

  if (!appState.players || !appState.players.dabao) initAppState();
  const player = appState.players.dabao;

  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1 };
  }
  if (typeof player.progress[type] !== 'number') player.progress[type] = 1;

  player.progress[type]++;
  player.stars = (player.stars || 0) + starEarned;
  saveAppState();

  // 实时更新导航栏积分显示
  const starEl = document.getElementById("star-count");
  if (starEl) starEl.innerText = `🪙 ${player.stars}`;

  // 胜利音效
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(440, ctx.currentTime);
    o.frequency.setValueAtTime(554.37, ctx.currentTime + 0.08);
    o.frequency.setValueAtTime(659.25, ctx.currentTime + 0.16);
    o.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    o.start(); o.stop(ctx.currentTime + 0.4);
  } catch(e) {}

  const container = document.getElementById("game-stage");
  container.innerHTML = `
    <div class="glass-card" style="padding:40px; text-align:center; max-width:500px; margin:40px auto; border-color:#10b981; background:rgba(16,185,129,0.08); border-width:2px; animation:pulseGlow 1.2s infinite ease-in-out;">
      <span style="font-size:5em; display:block; margin-bottom:10px;">🌟</span>
      <h2 style="color:#10b981; font-weight:800; margin-bottom:5px;">回答正确！</h2>
      <p style="font-size:1.1em; color:#fff; font-weight:600;">${speechFeedback}</p>
      <div style="font-size:1.5em; font-weight:bold; color:#fbbf24; margin:15px 0;">🪙 +${starEarned} 星星</div>
      <p style="font-size:0.8em; color:#94a3b8; letter-spacing:1px; animation:blinker 1s linear infinite;">正在自动开启下一关，请准备... 🚀</p>
    </div>
  `;

  speakText(speechFeedback);
  setTimeout(() => { launchTest(type); }, 1300);
}

function check6yoAnswer(ans) {
  if (ans === currentAnswer6yo) {
    trigger6yoVictory(10, "答对啦！果果太棒了！加十个星星！");
  } else {
    speakText("再仔细想想，换个答案试试吧，你可以的！");
    showWrongToast();
  }
}

function showWrongToast() {
  const old = document.getElementById("wrong-toast");
  if (old) old.remove();
  const t = document.createElement("div");
  t.id = "wrong-toast";
  t.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(239,68,68,0.92);color:#fff;padding:14px 28px;border-radius:16px;font-size:1.05em;font-weight:700;z-index:9999;box-shadow:0 8px 32px rgba(239,68,68,0.4);animation:slideUpFade 0.3s ease;";
  t.innerHTML = "❌ 再仔细想想，换个答案试试！💡";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ==================== 🛠️ 通关逻辑 ====================

function getTrackChineseName(type) {
  const map = {
    spatial: '空间图形推理',
    numeric: '数字规律',
    attention: '注意力扫描',
    deduction: '逻辑演绎排序',
    pattern: '图形矩阵推理',
    memory: '短时记忆复现',
    language: '言语理解分类',
    analogy: '类比推理'
  };
  return map[type] || type;
}

function launchTest(type) {
  initAppState();
  const player = appState.players.dabao;

  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1 };
    saveAppState();
  }
  // 补充新维度缺失字段
  ['spatial','numeric','attention','deduction','pattern','memory','language','analogy'].forEach(k => {
    if (typeof player.progress[k] !== 'number') { player.progress[k] = 1; saveAppState(); }
  });

  const level = player.progress[type] || 1;
  window.currentGameTrack = type;
  const container = document.getElementById("game-stage");

  if (level > 50) {
    container.innerHTML = `
      <div class="glass-card" style="padding:40px;text-align:center;max-width:600px;margin:30px auto;border-color:#10b981;">
        <span style="font-size:5.5em;display:block;margin-bottom:15px;animation:pulseGlow 2s infinite;">🏆</span>
        <h2 style="color:#10b981;font-weight:800;">🎉 完美通关 50 关！</h2>
        <p style="font-size:1.1em;color:#fff;margin:15px 0;">果果，你太牛啦！「${getTrackChineseName(type)}」全部攻克！</p>
        <button class="mock-button glow-success" onclick="resetTrackProgress('${type}')" style="width:100%;font-size:1.05em;padding:12px;margin-bottom:12px;">🛸 重置并重新挑战</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="width:100%;border-color:transparent;color:#64748b;">返回特训大厅</button>
      </div>
    `;
    speakText(`恭喜果果！你已经完美通关了${getTrackChineseName(type)}的全部五十关，获得了荣誉大勋章！你太棒了！`);
    return;
  }

  if (type === 'spatial') launchSpatial(level, container);
  else if (type === 'numeric') launchNumeric(level, container);
  else if (type === 'attention') launchAttention(level, container);
  else if (type === 'deduction') launchDeduction(level, container);
  else if (type === 'pattern') launchPattern(level, container);
  else if (type === 'memory') launchMemory(level, container);
  else if (type === 'language') launchLanguage(level, container);
  else if (type === 'analogy') launchAnalogy(level, container);
}

// ==================== 🧱 维度1：空间图形推理（5种题型交替）====================

// ------- 题型A：3D积木计数 -------
function getSpatialStack(level) {
  if (level === 1) return [{x:0,y:0,z:0},{x:0,y:0,z:1}];
  if (level === 2) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:0,z:1}];
  if (level === 3) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1}];
  if (level === 4) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:1,y:1,z:0},{x:0,y:0,z:1}];
  if (level === 5) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:1,y:1,z:0},{x:0,y:0,z:1},{x:1,y:0,z:1}];
  const baseSize = level <= 13 ? 2 : 3;
  const cubes = [];
  for (let x = 0; x < baseSize; x++) {
    for (let y = 0; y < baseSize; y++) {
      let h = 1;
      if (x===0&&y===0) h = Math.min(Math.floor(level/5)+1, 5);
      else if (x===1&&y===0) h = Math.min(Math.floor(level/9)+1, 4);
      else if (x===0&&y===1) h = Math.min(Math.floor(level/12)+1, 3);
      else if (x===2&&y===0) h = level>25 ? Math.min(Math.floor(level/15)+1,3) : 1;
      for (let z = 0; z < h; z++) cubes.push({x,y,z});
    }
  }
  return cubes;
}

function renderIsometricSVG(cubes) {
  cubes.sort((a,b) => (a.x+a.y)-(b.x+b.y) || a.z-b.z);
  const cx=160, cy=110;
  let svg = `<svg width="100%" height="200" viewBox="0 0 320 200" style="background:transparent;display:block;margin:auto;">`;
  svg += `<ellipse cx="160" cy="135" rx="95" ry="38" fill="rgba(0,0,0,0.18)"/>`;
  cubes.forEach(cube => {
    const px = cx+(cube.x-cube.y)*24;
    const py = cy+(cube.x+cube.y)*12-cube.z*24;
    const even = (cube.x+cube.y)%2===0;
    const [top,left,right] = even?["#a5b4fc","#6366f1","#4f46e5"]:["#34d399","#10b981","#059669"];
    svg += `<g transform="translate(${px},${py})">
      <polygon points="0,-12 24,0 0,12 -24,0" fill="${top}" stroke="#1e1b4b" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="-24,0 0,12 0,36 -24,24" fill="${left}" stroke="#1e1b4b" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="0,12 24,0 24,24 0,36" fill="${right}" stroke="#1e1b4b" stroke-width="1.5" stroke-linejoin="round"/>
    </g>`;
  });
  svg += `</svg>`;
  return svg;
}

// ------- 题型B：镜像对称 -------
const MIRROR_QUESTIONS = [
  { original:'⬛⬜⬜\n⬜⬛⬜\n⬜⬜⬛', correct:'⬜⬜⬛\n⬜⬛⬜\n⬛⬜⬜', wrong:['⬛⬜⬜\n⬜⬛⬜\n⬜⬜⬛','⬜⬛⬜\n⬛⬜⬛\n⬜⬛⬜','⬜⬜⬜\n⬛⬛⬛\n⬜⬜⬜'], hint:'镜像就像照镜子，左右互换' },
  { original:'🔴⬜⬜\n⬜🔴⬜\n🔴⬜🔴', correct:'⬜⬜🔴\n⬜🔴⬜\n🔴⬜🔴', wrong:['🔴⬜🔴\n⬜🔴⬜\n🔴⬜⬜','⬜🔴⬜\n🔴⬜🔴\n⬜🔴⬜','🔴🔴⬜\n⬜⬜🔴\n🔴⬜⬜'], hint:'红点镜像后，左边变右边' },
  { original:'⭐⬜⬜\n⭐⭐⬜\n⭐⭐⭐', correct:'⬜⬜⭐\n⬜⭐⭐\n⭐⭐⭐', wrong:['⭐⭐⭐\n⭐⭐⬜\n⭐⬜⬜','⬜⭐⬜\n⭐⬜⭐\n⬜⭐⬜','⭐⭐⭐\n⬜⭐⭐\n⬜⬜⭐'], hint:'星星从左阶梯，镜像后从右边阶梯' },
  { original:'🔵⬜🔵\n⬜🔵⬜\n⬜⬜🔵', correct:'🔵⬜🔵\n⬜🔵⬜\n🔵⬜⬜', wrong:['🔵🔵⬜\n⬜🔵⬜\n⬜⬜🔵','⬜🔵⬜\n🔵⬜🔵\n🔵⬜⬜','🔵⬜🔵\n🔵⬜🔵\n🔵⬜🔵'], hint:'左右两边的蓝点位置对调' },
  { original:'🟡🟡⬜\n🟡⬜⬜\n🟡🟡🟡', correct:'⬜🟡🟡\n⬜⬜🟡\n🟡🟡🟡', wrong:['🟡🟡🟡\n⬜⬜🟡\n🟡🟡⬜','⬜🟡🟡\n🟡🟡⬜\n🟡🟡🟡','🟡⬜🟡\n🟡⬜🟡\n🟡🟡🟡'], hint:'L形镜像后方向反转' },
  { original:'⬛⬛⬛\n⬛⬜⬜\n⬛⬜⬛', correct:'⬛⬛⬛\n⬜⬜⬛\n⬛⬜⬛', wrong:['⬛⬜⬛\n⬛⬜⬜\n⬛⬛⬛','⬛⬜⬛\n⬜⬜⬛\n⬛⬛⬛','⬜⬛⬜\n⬛⬜⬛\n⬜⬛⬜'], hint:'上方横排不变，下方左右对调' },
  { original:'🌟⬜⬜\n⬜🌟🌟\n🌟⬜🌟', correct:'⬜⬜🌟\n🌟🌟⬜\n🌟⬜🌟', wrong:['🌟⬜🌟\n🌟🌟⬜\n⬜⬜🌟','⬜🌟⬜\n🌟⬜🌟\n⬜🌟⬜','🌟🌟⬜\n⬜⬜🌟\n🌟⬜🌟'], hint:'每行左右互换位置' },
  { original:'🟢🟢⬜\n⬜🟢🟢\n⬜⬜🟢', correct:'⬜🟢🟢\n🟢🟢⬜\n🟢⬜⬜', wrong:['🟢⬜⬜\n🟢🟢⬜\n⬜🟢🟢','⬜🟢⬜\n🟢⬜🟢\n⬜🟢⬜','🟢⬜🟢\n⬜🟢⬜\n🟢⬜🟢'], hint:'斜线方向在镜像中反转' },
];

// ------- 题型C：图形旋转 -------
const ROTATION_QUESTIONS = [
  { title:'把下面的图案旋转90°（向右转一格），变成哪个？',
    original:'➡️⬜\n⬆️⬜', correct:'⬆️➡️\n⬜⬜', wrong:['⬜⬆️\n⬜➡️','⬜⬜\n➡️⬆️','⬆️⬜\n➡️⬜'], hint:'向右旋转90°：上面变右边，右边变下面' },
  { title:'这个箭头转了多少度？从「↑」变成了「→」',
    original:'↑', correct:'90°（四分之一圈）', wrong:['45°（八分之一圈）','180°（半圈）','270°（四分之三圈）'], hint:'从上到右，是四分之一圈转动', isText:true },
  { title:'这个图案旋转180°后，变成哪个？',
    original:'▲\n⬜⬜', correct:'⬜⬜\n▽', wrong:['▲\n⬜⬜','⬜▲\n⬜⬜','⬜⬜\n▲'], hint:'旋转180°就是整个翻转过来，上下颠倒' },
  { title:'「b」旋转后变成哪个字母？',
    original:'b', correct:'d', wrong:['q','p','g'], hint:'b左右镜像变d，上下翻转变p', isText:true },
  { title:'「p」旋转180°变成哪个？',
    original:'p', correct:'d', wrong:['b','q','g'], hint:'p转180°，上下颠倒后变成d', isText:true },
  { title:'小汽车向右开，转了半圈后朝向哪边？',
    original:'🚗→', correct:'←🚗', wrong:['🚗→','↑🚗','🚗↓'], hint:'半圈就是180°，方向完全反过来', isText:true },
  { title:'把「L」形状向右旋转90°变成哪个？',
    original:'⬛⬜\n⬛⬜\n⬛⬛', correct:'⬛⬛⬛\n⬛⬜⬜', wrong:['⬛⬛\n⬜⬛\n⬜⬛','⬛⬛\n⬛⬜\n⬛⬜','⬜⬜⬛\n⬛⬛⬛'], hint:'L形向右转：竖的变横的，横的变竖的' },
  { title:'时钟从3点转到6点，指针转了多少度？',
    original:'3点→6点', correct:'90°', wrong:['30°','45°','180°'], hint:'一个圆360°，从3到6是四分之一圈', isText:true },
];

// ------- 题型D：图形找规律补全 -------
const COMPLETION_QUESTIONS = [
  { desc:'下面图案有什么规律？第四个应该是：',
    items:['⬜⬜','⬜⬛','⬛⬜','?'], correct:'⬛⬛', wrong:['⬜⬜','⬜⬛','⬛⬛⬛'], hint:'每次多一个黑色方块' },
  { desc:'找出规律，问号处的形状是：',
    items:['△','△△','△△△','?'], correct:'△△△△', wrong:['△△','◯','△◯△'], hint:'每次多加一个三角形' },
  { desc:'这串图案有规律，?处应该是：',
    items:['🔴🔵','🔵🟡','🟡🔴','?'], correct:'🔴🔵', wrong:['🔵🔴','🟡🔵','🔴🟡'], hint:'三对颜色循环出现' },
  { desc:'数数各行方块数量，第四行有几个？',
    items:['⬛','⬛⬛','⬛⬛⬛','?'], correct:'⬛⬛⬛⬛（4个）', wrong:['⬛⬛⬛（3个）','⬛⬛⬛⬛⬛（5个）','⬛（1个）'], hint:'每行比上一行多一个方块' },
  { desc:'图案中黑白交替，问号处是：',
    items:['⬛⬜⬛','⬜⬛⬜','⬛⬜⬛','?'], correct:'⬜⬛⬜', wrong:['⬛⬜⬛','⬛⬛⬛','⬜⬜⬜'], hint:'黑白间隔交替，第四行跟第二行一样' },
  { desc:'圆圈数量有规律，问号处有几个圆？',
    items:['1个⭕','3个⭕','5个⭕','?'], correct:'7个⭕', wrong:['4个⭕','6个⭕','8个⭕'], hint:'每次加2，奇数序列' },
  { desc:'形状越来越大，?处的形状是：',
    items:['小🔴','中🟠','大🔴','?'], correct:'特大🟠', wrong:['小🔵','中🔴','大🟠'], hint:'红橙交替出现，大小递增' },
  { desc:'颜色按规律排列，?处是：',
    items:['🔴🔴🔵','🔵🔴🔴','🔴🔵🔴','?'], correct:'🔵🔴🔵', wrong:['🔴🔴🔴','🔵🔵🔵','🔴🔵🔵'], hint:'每行蓝色位置向右移一格' },
];

// ------- 题型E：立体展开图识别 -------
const UNFOLDING_QUESTIONS = [
  { title:'一个骰子展开后，哪个图是正确的展开图？',
    img:'🎲', correct:'十字形展开图（中间一排4个+上下各1个）', wrong:['L形展开图','直线6个','Z形展开图'],
    hint:'正方体展开图有11种，十字形是最常见的', isChoice:true,
    optEmoji:['➕十字形','🔠直线形','📐L形','〰️Z形'], ans:0 },
  { title:'把一张纸折叠后剪一刀，展开后的图案是哪个？',
    img:'✂️📄', correct:'中间有对称的洞', wrong:['只有一边有洞','没有洞','四个角有洞'],
    hint:'折叠后剪，展开后洞的位置是对称的', isChoice:true,
    optEmoji:['🔲对称两洞','▪️单边洞','⬛无洞','◼️角落洞'], ans:0 },
  { title:'积木从正面看是■■■，从上面看也是■■■，它是什么形状？',
    img:'📦', correct:'长方体（砖块状）', wrong:['球形','锥形','圆柱形'],
    hint:'正面和上面都是长方形，说明是长方体', isChoice:true,
    optEmoji:['📦长方体','⚽球形','🔺锥形','🥫圆柱'], ans:0 },
  { title:'一个圆柱体从正面看是什么形状？',
    img:'🥫', correct:'长方形', wrong:['圆形','三角形','六边形'],
    hint:'圆柱从侧面看是一个四边形，从上面看才是圆', isChoice:true,
    optEmoji:['▬长方形','⭕圆形','🔺三角形','⬡六边形'], ans:0 },
  { title:'把一个正方形纸对折两次，角上剪一个洞，展开后有几个洞？',
    img:'📄✂️', correct:'4个洞', wrong:['1个洞','2个洞','8个洞'],
    hint:'折两次，每次翻倍，1个洞展开后变4个洞', isChoice:true,
    optEmoji:['4️⃣4个','1️⃣1个','2️⃣2个','8️⃣8个'], ans:0 },
  { title:'三个方块叠在一起，从正面看是什么？',
    img:'📦📦📦', correct:'一个大正方形', wrong:['三个小正方形并排','一个三角形','三个圆形'],
    hint:'叠放的方块从正面看会合并成一个大形状', isChoice:true,
    optEmoji:['⬛大正方','⬛⬛⬛三个小','🔺三角','⭕⭕⭕三圆'], ans:0 },
  { title:'把正方形纸从中间折叠，边长变成多少？',
    img:'📄→📄/2', correct:'原来的一半', wrong:['原来的两倍','不变','原来的四分之一'],
    hint:'折叠就是把长度减半，变成原来的二分之一', isChoice:true,
    optEmoji:['½一半','×2两倍','=不变','¼四分一'], ans:0 },
  { title:'圆锥体从上面看是什么形状？',
    img:'🔺', correct:'圆形', wrong:['三角形','正方形','五边形'],
    hint:'冰淇淋筒从上往下看，只能看到圆圆的顶部', isChoice:true,
    optEmoji:['⭕圆形','🔺三角','⬛正方','⬠五边'], ans:0 },
];

function launchSpatial(level, container) {
  // 5种题型按关卡段分配：1-10积木，11-20镜像，21-30旋转，31-40补全，41-50展开图
  const phase = Math.ceil(level / 10);

  if (phase === 1) {
    // 题型A：3D积木计数
    const cubes = getSpatialStack(level);
    currentAnswer6yo = cubes.length;
    const q = `果果，请数一数这堆立方体积木总共有多少个？被压在下面的也要数哦！`;
    const svgHTML = renderIsometricSVG(cubes);
    const min = Math.max(1, currentAnswer6yo - 3);
    const opts = Array.from({length:8}, (_,i) => min+i);
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">🧱 空间推理·积木计数 — 第${level}/50关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${q.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.85em;color:#a1a1aa;margin-bottom:15px;">🦁 数一数总共有多少个积木方块（包括被压住的）：</p>
        <div class="glass-card" style="background:rgba(15,23,42,0.6);padding:10px;border-radius:16px;border:1px solid rgba(255,255,255,0.06);margin-bottom:20px;">${svgHTML}</div>
        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
          ${opts.map(n => `<button class="mock-button glow-dabao" onclick="check6yoAnswer(${n})" style="font-size:1.35em;width:54px;height:54px;border-radius:10px;">${n}</button>`).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(q), 300);
  }

  else if (phase === 2) {
    // 题型B：镜像对称
    const q = MIRROR_QUESTIONS[(level - 11) % MIRROR_QUESTIONS.length];
    const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
    const correctIdx = allOpts.indexOf(q.correct);
    const questionText = `果果，左边是原图，哪一个选项是它的镜像（照镜子的样子）？`;
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">🪞 空间推理·镜像对称 — 第${level}/50关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:15px;">🦁 镜像就像照镜子，左右互换。选出正确的镜像：</p>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin:20px 0;">
          <div style="text-align:center;">
            <div style="font-size:0.75em;color:#64748b;margin-bottom:8px;">原图</div>
            <div class="glass-card" style="padding:15px;font-size:1.8em;line-height:1.6;white-space:pre;font-family:monospace;min-width:100px;">${q.original}</div>
          </div>
          <div style="font-size:2em;color:#818cf8;">🪞</div>
          <div style="text-align:center;">
            <div style="font-size:0.75em;color:#64748b;margin-bottom:8px;">镜像是？</div>
            <div class="glass-card" style="padding:15px;font-size:1.8em;line-height:1.6;border:2px dashed #6366f1;min-width:100px;color:#818cf8;font-weight:800;">❓</div>
          </div>
        </div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:20px;">💡 ${q.hint}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:420px;margin:0 auto;">
          ${allOpts.map((opt,i) => `
            <button class="mock-button glow-dabao" onclick="checkSpatialChoice(${i},${correctIdx})" style="font-size:1.3em;line-height:1.6;padding:12px;border-radius:12px;white-space:pre;font-family:monospace;">${opt}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }

  else if (phase === 3) {
    // 题型C：图形旋转
    const q = ROTATION_QUESTIONS[(level - 21) % ROTATION_QUESTIONS.length];
    const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
    const correctIdx = allOpts.indexOf(q.correct);
    const questionText = `果果，${q.title}`;
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">🔄 空间推理·图形旋转 — 第${level}/50关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 ${q.title}</p>
        <div class="glass-card" style="padding:20px;font-size:2.5em;line-height:1.6;margin:15px auto;max-width:200px;white-space:pre;font-family:monospace;background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.2);">${q.original}</div>
        <p style="font-size:0.8em;color:#64748b;margin:10px 0 20px;">💡 ${q.hint}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:420px;margin:0 auto;">
          ${allOpts.map((opt,i) => `
            <button class="mock-button glow-dabao" onclick="checkSpatialChoice(${i},${correctIdx})" style="font-size:${q.isText?'1em':'1.3em'};padding:15px;border-radius:12px;line-height:1.4;white-space:pre;font-family:monospace;">${opt}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }

  else if (phase === 4) {
    // 题型D：图形序列补全
    const q = COMPLETION_QUESTIONS[(level - 31) % COMPLETION_QUESTIONS.length];
    const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
    const correctIdx = allOpts.indexOf(q.correct);
    const questionText = `果果，${q.desc}`;
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">🧩 空间推理·规律补全 — 第${level}/50关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 ${q.desc}</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap;margin:20px 0;">
          ${q.items.map((item,i) => `
            <div class="glass-card" style="padding:12px 16px;font-size:1.4em;min-width:65px;${item==='?'?'border:2px dashed #fbbf24;color:#fbbf24;font-weight:800;background:rgba(251,191,36,0.08);':''}">${item}</div>
          `).join('')}
        </div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:20px;">💡 ${q.hint}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:440px;margin:0 auto;">
          ${allOpts.map((opt,i) => `
            <button class="mock-button glow-dabao" onclick="checkSpatialChoice(${i},${correctIdx})" style="font-size:0.95em;padding:14px;border-radius:12px;line-height:1.4;">${opt}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }

  else {
    // 题型E：立体展开图 / 空间想象
    const q = UNFOLDING_QUESTIONS[(level - 41) % UNFOLDING_QUESTIONS.length];
    const opts = q.optEmoji;
    const questionText = `果果，${q.title}`;
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">📦 空间推理·立体想象 — 第${level}/50关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <div class="glass-card" style="padding:20px;margin:15px 0;background:rgba(99,102,241,0.06);border-color:rgba(99,102,241,0.2);">
          <div style="font-size:3em;margin-bottom:12px;">${q.img}</div>
          <p style="font-size:1.05em;color:#fff;font-weight:600;margin:0;">${q.title}</p>
        </div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:20px;">💡 ${q.hint}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:420px;margin:0 auto;">
          ${opts.map((opt,i) => `
            <button class="mock-button glow-dabao" onclick="checkSpatialChoice(${i},${q.ans})" style="font-size:0.95em;padding:14px;border-radius:12px;font-weight:700;">${opt}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
}

function checkSpatialChoice(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "太棒了！空间推理答对啦！果果的空间感超强！");
  } else {
    speakText("再仔细看看，想一想再选！");
    showWrongToast();
  }
}



// ==================== 🧮 维度2：数字规律 ====================

function getNumericQuestion(level) {
  // 5段难度递进，每段10关
  const phase = Math.ceil(level / 10);

  if (phase === 1) {
    // 等差数列（加法）
    const d = (level % 4) + 2;
    const start = (level % 5) + 1;
    const pos = (level % 3) + 1; // 缺第几个
    const seq = [start, start+d, start+d*2, start+d*3, start+d*4];
    const ans = seq[pos];
    seq[pos] = null;
    return { seq, ans, hint:`每次加${d}，看看缺的那个是多少？`, type:'seq' };
  }
  if (phase === 2) {
    // 等差数列（减法）
    const d = (level % 4) + 2;
    const start = 30 - (level % 5);
    const pos = (level % 3) + 1;
    const seq = [start, start-d, start-d*2, start-d*3, start-d*4];
    const ans = seq[pos];
    seq[pos] = null;
    return { seq, ans, hint:`每次减${d}，数字在变小。`, type:'seq' };
  }
  if (phase === 3) {
    // 倍数规律
    const pairs = [
      {seq:[1,2,4,null,16], ans:8, hint:'每次变两倍，四的两倍是多少？'},
      {seq:[1,3,9,null,81], ans:27, hint:'每次变三倍，九的三倍是多少？'},
      {seq:[2,4,8,null,32], ans:16, hint:'每次变两倍，八的两倍是多少？'},
      {seq:[3,6,12,null,48], ans:24, hint:'每次变两倍，十二的两倍是多少？'},
      {seq:[1,4,9,null,25], ans:16, hint:'这是平方数：一、四、九、十六、二十五'},
      {seq:[2,6,12,null,30], ans:20, hint:'规律：2×1、2×3、3×4、4×5、5×6'},
      {seq:[1,1,2,3,null], ans:5, hint:'前两个相加等于后一个，斐波那契数列！'},
      {seq:[10,8,6,null,2], ans:4, hint:'每次减二，六减二是多少？'},
      {seq:[1,2,4,7,null], ans:11, hint:'加的数每次多一：加1、加2、加3、加4'},
      {seq:[5,10,20,null,80], ans:40, hint:'每次乘以二，二十乘二是多少？'},
    ];
    const q = pairs[(level - 21) % pairs.length];
    return {...q, type:'seq'};
  }
  if (phase === 4) {
    // 数阵/图形数量规律（用文字描述）
    const items = [
      {seq:[2,5,8,null,14], ans:11, hint:'等差数列，每次加三'},
      {seq:[1,4,9,16,null], ans:25, hint:'平方数规律：1²、2²、3²、4²、5²'},
      {seq:[3,6,10,15,null], ans:21, hint:'加3、加4、加5、加6……'},
      {seq:[100,50,25,null], ans:12, hint: '每次除以二，二十五除以二约等于…'},
      {seq:[2,3,5,7,null], ans:11, hint:'质数（素数）：2、3、5、7、11'},
      {seq:[0,1,3,6,null], ans:10, hint:'加1、加2、加3、加4……'},
      {seq:[1,8,27,null], ans:64, hint:'立方数：1³、2³、3³、4³'},
      {seq:[1,2,6,24,null], ans:120, hint:'1、1×2、2×3、6×4、24×5'},
      {seq:[7,14,21,null,35], ans:28, hint:'7的倍数：7、14、21、28…'},
      {seq:[64,32,16,null,4], ans:8, hint:'每次除以二'},
    ];
    const q = items[(level - 31) % items.length];
    return {...q, type:'seq'};
  }
  // phase 5 - 综合挑战
  const hard = [
    {seq:[1,1,2,3,5,null], ans:8, hint:'斐波那契：前两数之和等于后一数'},
    {seq:[2,4,3,6,4,null], ans:8, hint:'两组交替：+2 和 +2'},
    {seq:[1,3,2,4,3,null], ans:5, hint:'奇数位+1加、偶数位+1加'},
    {seq:[10,1,9,2,8,null], ans:3, hint:'两列交替：10、9、8… 和 1、2、3…'},
    {seq:[1,2,4,8,16,null], ans:32, hint:'每次乘二'},
    {seq:[3,9,27,81,null], ans:243, hint:'每次乘三，三的乘方'},
    {seq:[36,25,16,null,4], ans:9, hint:'平方数倒序'},
    {seq:[1,4,2,8,3,null], ans:12, hint:'奇位置:1、2、3…，偶位置:4、8、12…'},
    {seq:[5,3,6,4,7,null], ans:5, hint:'奇位置+1，偶位置+1'},
    {seq:[2,5,11,23,null], ans:47, hint:'每次×2+1'},
  ];
  const q = hard[(level - 41) % hard.length];
  return {...q, type:'seq'};
}

function launchNumeric(level, container) {
  const q = getNumericQuestion(level);
  currentAnswer6yo = q.ans;
  const questionText = `果果，请根据数字排队的规律，猜猜蓝色问号泡泡里面应该填哪个数字？`;
  const min = Math.max(0, q.ans - 5);
  const opts = Array.from({length:10}, (_,i) => min + i).filter(v => v >= 0);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(6,182,212,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#22d3ee;font-weight:800;margin:0;">🧮 数字规律 — 第 ${level}/50 关</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:20px;">🦁 找出蓝色【❓】里面的数字：</p>
      <div style="display:flex;justify-content:center;align-items:center;gap:12px;margin:25px 0;flex-wrap:wrap;">
        ${q.seq.map(item => item === null
          ? `<div style="width:65px;height:65px;border-radius:50%;border:3px dashed #06b6d4;display:flex;align-items:center;justify-content:center;font-size:1.6em;font-weight:800;color:#22d3ee;background:rgba(6,182,212,0.15);animation:pulseGlow 1.5s infinite;">❓</div>`
          : `<div style="width:60px;height:60px;border-radius:50%;border:2px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4em;font-weight:800;background:rgba(255,255,255,0.05);">${item}</div>`
        ).join('')}
      </div>
      <p style="font-size:0.85em;color:#64748b;margin-bottom:20px;">💡 提示：${q.hint}</p>
      <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
        ${opts.map(n => `<button class="mock-button glow-dabao" onclick="check6yoAnswer(${n})" style="font-size:1.2em;width:50px;height:50px;border-radius:50%;">${n}</button>`).join('')}
      </div>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:30px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
    </div>
  `;
  setTimeout(() => speakText(questionText), 300);
}

// ==================== ⚡ 维度3：注意力扫描（舒尔特格）====================

function launchAttention(level, container) {
  let gridDesc = '', questionText = '';
  let gridMode = '';

  if (level <= 10) {
    gridMode = 'asc9'; gridDesc = '按 1→9 顺序点击格子';
    questionText = '果果，请从小到大，按顺序快速点击一到九的数字格子！';
  } else if (level <= 20) {
    gridMode = 'desc9'; gridDesc = '倒过来！按 9→1 顺序点击';
    questionText = '果果，这次要倒过来，从大到小，按顺序点击九到一的数字格子！';
  } else if (level <= 30) {
    gridMode = 'even'; gridDesc = '只点偶数！按 2、4、6、8 依次点击';
    questionText = '果果，这次只找偶数，请依次点击二、四、六、八的格子！';
  } else if (level <= 40) {
    gridMode = 'odd'; gridDesc = '只点奇数！按 1、3、5、7、9 依次点击';
    questionText = '果果，这次只找奇数，请依次点击一、三、五、七、九的格子！';
  } else {
    gridMode = 'asc16'; gridDesc = '高难挑战！按 1→16 顺序点击（4×4格）';
    questionText = '高难挑战来啦！果果请按顺序依次点击一到十六的格子，加油！';
  }

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(52,211,153,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#34d399;font-weight:800;margin:0;">⚡ 注意力扫描 — 第 ${level}/50 关</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 ${gridDesc}</p>
      <div id="schulte-grid" style="display:grid;gap:10px;margin:20px auto;"></div>
      <div id="schulte-msg" style="font-size:0.9em;color:#64748b;margin-top:10px;min-height:24px;"></div>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回大厅</button>
    </div>
  `;
  setupSchulteGridMatrix(level, gridMode);
  setTimeout(() => speakText(questionText), 300);
}

function setupSchulteGridMatrix(level, gridMode) {
  const grid = document.getElementById('schulte-grid');
  if (!grid) return;

  if (gridMode === 'asc16') {
    grid.style.gridTemplateColumns = 'repeat(4,1fr)';
    grid.style.maxWidth = '320px';
    const numbers = Array.from({length:16},(_,i)=>i+1).sort(()=>Math.random()-0.5);
    grid.innerHTML = numbers.map(n => `<button id="cell-${n}" class="schulte-cell mock-button" onclick="clickSchulteTrack(${n},1,16,1)" style="height:65px;font-size:1.4em;font-weight:bold;padding:0;">${n}</button>`).join('');
    window.schulteTarget = 1;
  } else {
    grid.style.gridTemplateColumns = 'repeat(3,1fr)';
    grid.style.maxWidth = '270px';

    if (gridMode === 'asc9') {
      const numbers = [1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
      grid.innerHTML = numbers.map(n => `<button id="cell-${n}" class="schulte-cell mock-button" onclick="clickSchulteTrack(${n},1,9,1)" style="height:72px;font-size:1.8em;font-weight:bold;">${n}</button>`).join('');
      window.schulteTarget = 1;
    } else if (gridMode === 'desc9') {
      const numbers = [1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
      grid.innerHTML = numbers.map(n => `<button id="cell-${n}" class="schulte-cell mock-button" onclick="clickSchulteTrack(${n},9,1,-1)" style="height:72px;font-size:1.8em;font-weight:bold;">${n}</button>`).join('');
      window.schulteTarget = 9;
    } else if (gridMode === 'even') {
      const cells = [2,4,6,8,1,3,5,7,9].sort(()=>Math.random()-0.5);
      grid.innerHTML = cells.map(n => `<button id="cell-${n}" class="schulte-cell mock-button" onclick="clickSchulteEven(${n})" style="height:72px;font-size:1.8em;font-weight:bold;">${n}</button>`).join('');
      window.schulteEvenIndex = 0;
      window.schulteEvenSeq = [2,4,6,8];
    } else if (gridMode === 'odd') {
      const cells = [1,3,5,7,9,2,4,6,8].sort(()=>Math.random()-0.5);
      grid.innerHTML = cells.map(n => `<button id="cell-${n}" class="schulte-cell mock-button" onclick="clickSchulteOdd(${n})" style="height:72px;font-size:1.8em;font-weight:bold;">${n}</button>`).join('');
      window.schulteOddIndex = 0;
      window.schulteOddSeq = [1,3,5,7,9];
    }
  }
}

function clickSchulteTrack(n, start, end, step) {
  if (n !== window.schulteTarget) {
    speakText("不对哦，找找顺序！");
    const btn = document.getElementById(`cell-${n}`);
    if (btn) { btn.style.background = 'rgba(239,68,68,0.3)'; setTimeout(()=>{ btn.style.background=''; }, 400); }
    return;
  }
  const btn = document.getElementById(`cell-${n}`);
  if (btn) { btn.style.background = 'rgba(16,185,129,0.5)'; btn.disabled = true; btn.style.color = '#fff'; }
  window.schulteTarget += step;
  if ((step > 0 && window.schulteTarget > end) || (step < 0 && window.schulteTarget < end)) {
    trigger6yoVictory(10, "太棒了！全部按顺序点完了！果果注意力超级强！");
  }
}

function clickSchulteEven(n) {
  const seq = window.schulteEvenSeq;
  const expected = seq[window.schulteEvenIndex];
  if (n !== expected) {
    speakText("找偶数哦，再想想！");
    const btn = document.getElementById(`cell-${n}`);
    if (btn) { btn.style.background='rgba(239,68,68,0.3)'; setTimeout(()=>btn.style.background='',400); }
    return;
  }
  const btn = document.getElementById(`cell-${n}`);
  if (btn) { btn.style.background='rgba(16,185,129,0.5)'; btn.disabled=true; btn.style.color='#fff'; }
  window.schulteEvenIndex++;
  if (window.schulteEvenIndex >= seq.length) {
    trigger6yoVictory(10, "全找到啦！果果认识所有偶数，真棒！");
  }
}

function clickSchulteOdd(n) {
  const seq = window.schulteOddSeq;
  const expected = seq[window.schulteOddIndex];
  if (n !== expected) {
    speakText("找奇数哦，再想想！");
    const btn = document.getElementById(`cell-${n}`);
    if (btn) { btn.style.background='rgba(239,68,68,0.3)'; setTimeout(()=>btn.style.background='',400); }
    return;
  }
  const btn = document.getElementById(`cell-${n}`);
  if (btn) { btn.style.background='rgba(16,185,129,0.5)'; btn.disabled=true; btn.style.color='#fff'; }
  window.schulteOddIndex++;
  if (window.schulteOddIndex >= seq.length) {
    trigger6yoVictory(10, "全找到啦！果果认识所有奇数，厉害！");
  }
}

// ==================== 🔍 维度4：逻辑演绎排序 ====================

const DEDUCTION_TIMELINES = [
  { text:"果果，请把苹果树的生长过程，从头到尾按正确顺序排列：", items:[{id:'1',text:'🌱 种子埋进土里'},{id:'2',text:'🌿 嫩芽破土而出'},{id:'3',text:'🌸 开满粉色小花'},{id:'4',text:'🍎 结出大红苹果'}] },
  { text:"果果，请把小鸡破壳的全过程，从开始到结束排好：", items:[{id:'1',text:'🥚 圆圆的蛋在鸡窝里'},{id:'2',text:'💥 蛋壳出现小裂缝'},{id:'3',text:'🐥 小黄鸡伸出头来'},{id:'4',text:'🐔 长大变成大母鸡'}] },
  { text:"果果，把果果的一天，按从早到晚的顺序排列好：", items:[{id:'1',text:'🌅 早晨太阳升起来床'},{id:'2',text:'🎒 背上书包去幼儿园'},{id:'3',text:'🍽️ 中午和老师吃午饭'},{id:'4',text:'🌙 晚上刷牙睡觉觉'}] },
  { text:"果果，把蝴蝶的生命旅程，从出生到展翅按顺序排好：", items:[{id:'1',text:'🥚 妈妈把卵产在叶子上'},{id:'2',text:'🐛 毛毛虫出来吃树叶'},{id:'3',text:'🫛 变成蛹挂在树上睡觉'},{id:'4',text:'🦋 破茧而出变成蝴蝶'}] },
  { text:"果果，把造房子的步骤，从最开始到住进去排好：", items:[{id:'1',text:'📐 建筑师画好设计图'},{id:'2',text:'🏗️ 工人搭建房子框架'},{id:'3',text:'🧱 砌墙装门装窗户'},{id:'4',text:'🏠 刷漆装修可以住了'}] },
  { text:"果果，把下雨的形成过程，按自然规律排好：", items:[{id:'1',text:'☀️ 太阳晒暖地面水分'},{id:'2',text:'💨 水变成水蒸气上升'},{id:'3',text:'☁️ 水蒸气聚集成云彩'},{id:'4',text:'🌧️ 云层厚重下起雨来'}] },
  { text:"果果，把书本从白纸到印好的顺序排列：", items:[{id:'1',text:'🌳 伐木工砍下大树干'},{id:'2',text:'🏭 工厂把木头造成纸'},{id:'3',text:'✏️ 作者在纸上写文章'},{id:'4',text:'📚 印刷机印出书本来'}] },
  { text:"果果，把小蝌蚪变青蛙的过程排好：", items:[{id:'1',text:'🫧 青蛙产卵在水中'},{id:'2',text:'🦎 孵出圆脑袋小蝌蚪'},{id:'3',text:'🐸 长出后腿前腿来'},{id:'4',text:'🐸 跳出水面变成青蛙'}] },
  { text:"果果，把牛奶从奶牛到喝进嘴里的顺序排好：", items:[{id:'1',text:'🐄 奶牛在农场吃青草'},{id:'2',text:'🪣 农民叔叔挤牛奶'},{id:'3',text:'🏭 工厂加热消毒装瓶'},{id:'4',text:'🥛 送到超市我们买来喝'}] },
  { text:"果果，把植物喝水的旅程，从根到叶子排好：", items:[{id:'1',text:'💧 雨水渗入泥土深处'},{id:'2',text:'🌱 根毛从土里吸收水'},{id:'3',text:'🌿 水沿茎干向上运输'},{id:'4',text:'🍃 叶子把水用来做饭'}] },
];

function launchDeduction(level, container) {
  const q = DEDUCTION_TIMELINES[(level - 1) % DEDUCTION_TIMELINES.length];
  currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#d8b4fe;font-weight:800;margin:0;">🔍 逻辑排序 — 第 ${level}/50 关</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${q.text.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 ${q.text}</p>
      <div id="timeline-list" style="display:flex;flex-direction:column;gap:10px;margin:15px 0;"></div>
      <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="width:100%;font-size:1.05em;font-weight:700;padding:10px;margin-top:10px;">✅ 提交验证</button>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:15px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
    </div>
  `;
  rerenderTimelineStage();
  setTimeout(() => speakText(q.text), 300);
}

function verifyDabaoTimeline() {
  const order = currentDeductionTimeline.map(i => i.id).join('');
  if (order === '1234') {
    trigger6yoVictory(10, "排序完美！果果因果逻辑超强，真棒！");
  } else {
    speakText("顺序不太对哦，再想想看！");
    showWrongToast();
  }
}

function shiftTimelineNode(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= currentDeductionTimeline.length) return;
  [currentDeductionTimeline[index], currentDeductionTimeline[target]] = [currentDeductionTimeline[target], currentDeductionTimeline[index]];
  rerenderTimelineStage();
}

function rerenderTimelineStage() {
  const container = document.getElementById('timeline-list');
  if (!container) return;
  container.innerHTML = currentDeductionTimeline.map((item, idx) => `
    <div class="glass-card timeline-node" style="padding:13px;border-color:rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);display:flex;justify-content:space-between;align-items:center;">
      <span style="font-weight:600;color:#fff;font-size:0.95em;">${item.text}</span>
      <div style="display:flex;gap:5px;">
        <button class="mock-button" onclick="shiftTimelineNode(${idx},-1)" style="padding:3px 8px;font-size:0.85em;">↑</button>
        <button class="mock-button" onclick="shiftTimelineNode(${idx},1)" style="padding:3px 8px;font-size:0.85em;">↓</button>
      </div>
    </div>
  `).join('');
}

// ==================== 🎨 维度5：图形矩阵推理（新增）====================

const PATTERN_QUESTIONS = [
  // 每题：shapes是3×3矩阵(最后一个是问号)，opts是选项，ans是正确选项index
  { text:'果果，这个3×3的图形方格有规律，猜猜右下角问号应该是什么？', matrix:['🔴','🔵','🟡','🔵','🟡','🔴','🟡','🔴','?'], opts:['🔵','🔴','🟢','⭐'], ans:0, hint:'每行都有三种颜色，第三行缺哪个？' },
  { text:'果果，观察图形变化规律，找出问号处应该填什么形状？', matrix:['⬛','⬛⬛','⬛⬛⬛','⬛⬛','⬛⬛⬛','⬛⬛⬛⬛','⬛⬛⬛','⬛⬛⬛⬛','?'], opts:['⬛⬛⬛⬛⬛','⬛⬛⬛','⬛⬛','⬛'], ans:0, hint:'每行方块数量+1，第三行每格也+1' },
  { text:'果果，每行图案有什么规律？问号应该是什么？', matrix:['🌟','🌟🌟','🌟🌟🌟','🌙','🌙🌙','🌙🌙🌙','☀️','☀️☀️','?'], opts:['☀️☀️☀️','🌟🌟🌟','🌙🌙🌙','☀️'], ans:0, hint:'每行的图案数量是1、2、3，第三行的☀️需要几个？' },
  { text:'果果，观察颜色变化的规律，问号处是什么颜色？', matrix:['🟥','🟧','🟨','🟧','🟨','🟥','🟨','🟥','?'], opts:['🟧','🟩','🟦','🟥'], ans:0, hint:'每行包含三种颜色：红橙黄，最后一格缺哪个？' },
  { text:'果果，这些数字方块有规律，问号是多少？', matrix:['1','2','3','2','3','4','3','4','?'], opts:['5','6','2','4'], ans:0, hint:'每行比前一行大1，第三行最后一个是多少？' },
  { text:'果果，图形在旋转，问号应该是什么方向的箭头？', matrix:['→','↓','←','↓','←','↑','←','↑','?'], opts:['→','↓','←','↑'], ans:0, hint:'每行顺时针旋转，第三行最后应该转到哪个方向？' },
  { text:'果果，看大小的变化规律，问号处是什么？', matrix:['🔴','🟠','🔴🔴','🟠','🔴🔴','🟠🟠','🔴🔴','🟠🟠','?'], opts:['🔴🔴🔴','🟠🟠🟠','🔴','🟠'], ans:1, hint:'每行橙色比红色多一个' },
  { text:'果果，数字的规律找一找，问号应该是多少？', matrix:['2','4','6','4','6','8','6','8','?'], opts:['10','9','12','7'], ans:0, hint:'每格比前一格大2，第三行最后一格是多少？' },
  { text:'果果，形状和数量有规律，问号是什么？', matrix:['🐱','🐱🐱','🐶','🐱🐱','🐶','🐶🐶','🐶','🐶🐶','?'], opts:['🐶🐶🐶','🐱🐱🐱','🐶','🐱'], ans:0, hint:'每行后面那种动物数量+1' },
  { text:'果果，找出规律，问号格子里应该填什么？', matrix:['A','B','C','B','C','D','C','D','?'], opts:['E','A','B','F'], ans:0, hint:'字母表顺序，每行往后移一位' },
  // 更多题目
  { text:'果果，看看这些水果的排列规律，问号是什么？', matrix:['🍎','🍊','🍋','🍊','🍋','🍎','🍋','🍎','?'], opts:['🍊','🍋','🍇','🍎'], ans:0, hint:'三种水果循环，最后一格缺哪个？' },
  { text:'果果，动物的排列有规律，问号处应该是什么？', matrix:['🐘','🦁','🐯','🦁','🐯','🐘','🐯','🐘','?'], opts:['🦁','🐮','🐧','🐯'], ans:0, hint:'三种动物循环，第三行最后缺哪个？' },
  { text:'果果，天气图案有规律，问号是什么天气？', matrix:['☀️','🌤️','🌧️','🌤️','🌧️','☀️','🌧️','☀️','?'], opts:['🌤️','❄️','🌪️','☀️'], ans:0, hint:'三种天气循环' },
  { text:'果果，数字在增加，问号是多少？', matrix:['1','3','5','3','5','7','5','7','?'], opts:['9','8','11','6'], ans:0, hint:'奇数序列，每格+2' },
  { text:'果果，星星和月亮有规律，问号处是什么？', matrix:['⭐','🌙','⭐','🌙','⭐','🌙⭐','⭐','🌙⭐','?'], opts:['🌙⭐⭐','⭐','🌙','⭐⭐'], ans:0, hint:'每格比前一行多一个星星' },
];

function launchPattern(level, container) {
  const q = PATTERN_QUESTIONS[(level - 1) % PATTERN_QUESTIONS.length];
  currentPatternAnswer = q.ans.toString();

  // 打乱选项顺序
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);
  const correctShuffledIdx = shuffled.findIndex(x => x.i === q.ans);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(251,191,36,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#fbbf24;font-weight:800;margin:0;">🎨 图形矩阵推理 — 第 ${level}/50 关</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${q.text.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:20px;">🦁 找出规律，选出问号处正确的答案：</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:320px;margin:0 auto 25px;">
        ${q.matrix.map((cell, i) => `
          <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;font-size:${cell.length > 3 ? '1em' : '1.5em'};min-height:60px;display:flex;align-items:center;justify-content:center;${i===8?'border:2px dashed #fbbf24;color:#fbbf24;font-weight:800;':''}">
            ${i===8 ? '❓' : cell}
          </div>
        `).join('')}
      </div>
      <p style="font-size:0.8em;color:#64748b;margin-bottom:15px;">💡 ${q.hint}</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:360px;margin:0 auto;">
        ${shuffled.map((item, idx) => `
          <button class="mock-button glow-dabao" onclick="checkPatternAnswer(${item.i},${q.ans})" style="font-size:${item.o.length>3?'0.9em':'1.4em'};padding:12px;border-radius:10px;min-height:55px;">
            ${item.o}
          </button>
        `).join('')}
      </div>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
    </div>
  `;
  setTimeout(() => speakText(q.text), 300);
}

function checkPatternAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "图形规律找对了！果果的推理能力超级厉害！");
  } else {
    speakText("再仔细看看规律，试试别的答案！");
    showWrongToast();
  }
}

// ==================== 🧠 维度6：短时记忆复现（新增）====================

const MEMORY_QUESTIONS = [
  { show:['🍎','🐱','🌟'], q:'记住这三样东西，按顺序说出来', type:'seq3' },
  { show:['🔴','🔵','🟡','🟢'], q:'记住这四个颜色泡泡的顺序', type:'seq4' },
  { show:['1','5','3'], q:'记住这三个数字，按顺序选出来', type:'num3' },
  { show:['🐘','🦁','🐯','🐶'], q:'记住这四只小动物出现的顺序', type:'seq4' },
  { show:['⭐','🌙','☀️','🌈'], q:'记住这四个天空图案的顺序', type:'seq4' },
  { show:['2','7','4','9'], q:'记住这四个数字，按顺序选出来', type:'num4' },
  { show:['🍊','🍋','🍇','🍓','🍑'], q:'记住这五种水果的出现顺序', type:'seq5' },
  { show:['🏠','🚗','✈️','🚢'], q:'记住这四种交通/建筑的顺序', type:'seq4' },
  { show:['3','1','8','5','2'], q:'记住这五个数字，按顺序选出来', type:'num5' },
  { show:['🎈','🎁','🎂','🎊','🎉'], q:'记住这五个节日图案的顺序', type:'seq5' },
];

let memoryPhase = 'show'; // 'show' | 'recall'
let memoryExpected = [];
let memoryCurrentIdx = 0;

function launchMemory(level, container) {
  const q = MEMORY_QUESTIONS[(level - 1) % MEMORY_QUESTIONS.length];
  currentMemorySequence = q.show;
  memoryPhase = 'show';
  memoryExpected = [...q.show];
  memoryCurrentIdx = 0;

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#f472b6;font-weight:800;margin:0;">🧠 短时记忆 — 第 ${level}/50 关</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${q.q}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 仔细记住下面这些图案的顺序，${q.show.length}秒后会消失哦！</p>
      <div id="memory-display" style="display:flex;justify-content:center;gap:15px;margin:25px 0;flex-wrap:wrap;">
        ${q.show.map(s => `<div style="font-size:2.5em;background:rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.15);border-radius:16px;width:70px;height:70px;display:flex;align-items:center;justify-content:center;">${s}</div>`).join('')}
      </div>
      <div id="memory-countdown" style="font-size:1.1em;color:#f472b6;font-weight:700;">👀 请记住！${q.show.length + 1} 秒后隐藏...</div>
      <div id="memory-recall-area" style="display:none;"></div>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
    </div>
  `;

  speakText(`果果，仔细记住这${q.show.length}个图案的顺序，马上要考你了！`);

  let countdown = q.show.length + 1;
  const timer = setInterval(() => {
    countdown--;
    const cdEl = document.getElementById('memory-countdown');
    if (cdEl) cdEl.innerText = countdown > 0 ? `👀 请记住！${countdown} 秒后隐藏...` : '🙈 隐藏了！现在请按顺序选出来：';
    if (countdown <= 0) {
      clearInterval(timer);
      const disp = document.getElementById('memory-display');
      if (disp) disp.style.display = 'none';
      startMemoryRecall(q.show);
    }
  }, 1000);
}

function startMemoryRecall(originalSeq) {
  memoryCurrentIdx = 0;
  const recallArea = document.getElementById('memory-recall-area');
  if (!recallArea) return;
  recallArea.style.display = 'block';

  // 创建打乱的选项（含干扰项）
  const allEmojis = ['🍎','🐱','🌟','🔴','🔵','🟡','🟢','🐘','🦁','🐯','🐶','⭐','🌙','☀️','🌈','🍊','🍋','🍇','🍓','🍑','🏠','🚗','✈️','🚢','🎈','🎁','🎂','🎊','🎉','1','2','3','4','5','6','7','8','9'];
  const distractors = allEmojis.filter(e => !originalSeq.includes(e));
  const opts = [...originalSeq, ...distractors.slice(0, 4)].sort(() => Math.random() - 0.5);

  recallArea.innerHTML = `
    <p style="font-size:0.9em;color:#f472b6;font-weight:700;margin-bottom:15px;">🎯 请点击第 <span id="recall-pos">1</span> 个图案：</p>
    <div id="selected-display" style="display:flex;justify-content:center;gap:10px;min-height:50px;margin-bottom:15px;flex-wrap:wrap;">
      ${originalSeq.map(() => `<div style="width:50px;height:50px;border-radius:10px;border:2px dashed rgba(255,255,255,0.2);"></div>`).join('')}
    </div>
    <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
      ${opts.map(o => `<button class="mock-button glow-dabao" id="recall-btn-${o}" onclick="clickMemoryRecall('${o}', ${JSON.stringify(originalSeq)})" style="font-size:1.5em;width:58px;height:58px;border-radius:12px;">${o}</button>`).join('')}
    </div>
  `;
}

function clickMemoryRecall(selected, originalSeq) {
  if (selected !== originalSeq[memoryCurrentIdx]) {
    speakText("不对哦！试试别的图案！");
    showWrongToast();
    return;
  }
  // 正确：更新显示
  const slots = document.querySelectorAll('#selected-display div');
  if (slots[memoryCurrentIdx]) {
    slots[memoryCurrentIdx].innerHTML = selected;
    slots[memoryCurrentIdx].style.border = '2px solid #10b981';
    slots[memoryCurrentIdx].style.fontSize = '1.5em';
    slots[memoryCurrentIdx].style.display = 'flex';
    slots[memoryCurrentIdx].style.alignItems = 'center';
    slots[memoryCurrentIdx].style.justifyContent = 'center';
  }
  const btn = document.getElementById(`recall-btn-${selected}`);
  if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; }

  memoryCurrentIdx++;
  const posEl = document.getElementById('recall-pos');
  if (posEl) posEl.innerText = memoryCurrentIdx + 1;

  if (memoryCurrentIdx >= originalSeq.length) {
    trigger6yoVictory(10, "全部记对了！果果的记忆力超级厉害！");
  }
}

// ==================== 📚 维度7：言语理解分类（新增）====================

const LANGUAGE_QUESTIONS = [
  { text:'果果，下面四个中，哪一个不是动物？', opts:['🐱猫咪','🐶狗狗','🌸花朵','🐯老虎'], ans:2, hint:'动物是会动的生命，花朵是植物哦' },
  { text:'果果，下面四个中，哪一个不是水果？', opts:['🍎苹果','🍊橙子','🥕胡萝卜','🍇葡萄'], ans:2, hint:'水果是甜甜的，胡萝卜是蔬菜哦' },
  { text:'果果，下面四个中，哪一个不是交通工具？', opts:['🚗小汽车','✈️飞机','🪑椅子','🚢大轮船'], ans:2, hint:'交通工具是用来出行的，椅子不会移动' },
  { text:'果果，哪个是天空中飞翔的动物？', opts:['🐟金鱼','🦅老鹰','🐢乌龟','🐘大象'], ans:1, hint:'能飞翔的动物有翅膀，在天空中翱翔' },
  { text:'果果，哪个是可以吃的食物？', opts:['🪑椅子','📱手机','🍕比萨','🚗汽车'], ans:2, hint:'食物是我们吃进肚子里的东西' },
  { text:'果果，哪个是下雨天用的？', opts:['🕶️墨镜','☂️雨伞','🧢帽子','🩴拖鞋'], ans:1, hint:'下雨天我们会带什么出门呢？' },
  { text:'果果，下面哪个不是颜色？', opts:['🔴红色','🔵蓝色','🍎苹果','🟡黄色'], ans:2, hint:'苹果是水果，不是颜色哦' },
  { text:'果果，哪个不是住的地方？', opts:['🏠房子','🏫学校','🚀火箭','🏥医院'], ans:2, hint:'火箭是飞到太空的，不是住的地方' },
  { text:'果果，哪个是夏天常见的？', opts:['❄️雪花','⛄雪人','🌊海浪','🎿滑雪板'], ans:2, hint:'夏天很热，哪个东西夏天常见？' },
  { text:'果果，哪个是属于海里的动物？', opts:['🦅老鹰','🐋鲸鱼','🦁狮子','🐘大象'], ans:1, hint:'海里的动物生活在水里' },
  { text:'果果，哪个不是乐器？', opts:['🎸吉他','🎹钢琴','📺电视','🎺小号'], ans:2, hint:'乐器是用来演奏音乐的' },
  { text:'果果，哪个最重？', opts:['🪶羽毛','🧸玩具熊','🏋️哑铃','🍬糖果'], ans:2, hint:'哑铃是练举重用的，非常沉' },
  { text:'果果，哪个能在天空中见到？', opts:['🐠热带鱼','🦋蝴蝶','🐟小鱼','🦀螃蟹'], ans:1, hint:'蝴蝶有翅膀，会在空中飞舞' },
  { text:'果果，哪个东西需要用电才能工作？', opts:['🎨画笔','✏️铅笔','💡灯泡','🪆玩偶'], ans:2, hint:'灯泡亮起来需要电' },
  { text:'果果，哪个季节会下雪？', opts:['🌸春天','☀️夏天','🍂秋天','❄️冬天'], ans:3, hint:'哪个季节最冷，会下雪？' },
  { text:'果果，哪个不是学习用品？', opts:['📚书本','✏️铅笔','🍰蛋糕','📐尺子'], ans:2, hint:'学习用品是上学会用到的东西' },
  { text:'果果，下面哪个动物会游泳？', opts:['🦅老鹰','🦁狮子','🐟金鱼','🐿️松鼠'], ans:2, hint:'哪个动物生活在水里？' },
  { text:'果果，哪个是夜晚能看见的？', opts:['🌸花朵','⭐星星','🌈彩虹','🌻向日葵'], ans:1, hint:'星星在晚上天黑后才能看到' },
  { text:'果果，哪个是甜的食物？', opts:['🧅洋葱','🌶️辣椒','🍫巧克力','🥦西兰花'], ans:2, hint:'巧克力甜甜的，大家都爱吃！' },
  { text:'果果，哪个动物有翅膀？', opts:['🐢乌龟','🦋蝴蝶','🐠热带鱼','🐝蜜蜂'], ans:1, hint:'有翅膀的动物可以飞翔' },
];

function launchLanguage(level, container) {
  const q = LANGUAGE_QUESTIONS[(level - 1) % LANGUAGE_QUESTIONS.length];

  // 打乱选项
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(34,211,238,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#22d3ee;font-weight:800;margin:0;">📚 言语理解 — 第 ${level}/50 关</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${q.text.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <div class="glass-card" style="padding:20px;margin:20px 0;background:rgba(34,211,238,0.05);border-color:rgba(34,211,238,0.2);">
        <p style="font-size:1.1em;color:#fff;font-weight:700;line-height:1.5;margin:0;">${q.text}</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:420px;margin:0 auto;">
        ${shuffled.map(item => `
          <button class="mock-button glow-dabao" onclick="checkLanguageAnswer(${item.i},${q.ans})" style="font-size:1em;padding:15px;border-radius:12px;font-weight:700;line-height:1.4;">
            ${item.o}
          </button>
        `).join('')}
      </div>
      <p style="font-size:0.8em;color:#64748b;margin-top:15px;">💡 ${q.hint}</p>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:20px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
    </div>
  `;
  setTimeout(() => speakText(q.text), 300);
}

function checkLanguageAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "答对了！果果的语言理解能力真棒！");
  } else {
    speakText("再想想，换个答案试试！");
    showWrongToast();
  }
}

// ==================== 🔗 维度8：类比推理（新增）====================

const ANALOGY_QUESTIONS = [
  { text:'🐣 鸡蛋 → 🐔 鸡，那么 🥚 蛙卵 → ？', opts:['🐟鱼','🐸青蛙','🦎蜥蜴','🐢乌龟'], ans:1, hint:'鸡蛋孵出鸡，蛙卵孵出什么？' },
  { text:'🌱 种子 → 🌳 大树，那么 🥚 鸡蛋 → ？', opts:['🐔鸡','🍳煎蛋','🪺鸟窝','🐣小鸡'], ans:3, hint:'种子长大变成大树，鸡蛋孵化成什么？' },
  { text:'👶 宝宝 → 👨 大人，那么 🐣 小鸡 → ？', opts:['🥚鸡蛋','🐔大母鸡','🪺鸟窝','🐦小鸟'], ans:1, hint:'宝宝长大变成大人，小鸡长大变成什么？' },
  { text:'🐛 毛毛虫 → 🦋 蝴蝶，那么 🐸 蝌蚪 → ？', opts:['🐟鱼','🦎蜥蜴','🐸青蛙','🐊鳄鱼'], ans:2, hint:'毛毛虫变成蝴蝶，蝌蚪长大变成什么？' },
  { text:'🐕 狗 → 🦴 骨头，那么 🐱 猫 → ？', opts:['🍖肉','🐟鱼','🥛牛奶','🍚米饭'], ans:1, hint:'狗最爱吃骨头，猫最爱吃什么？' },
  { text:'✏️ 铅笔 → 📝 写字，那么 🎨 画笔 → ？', opts:['🖼️画画','✂️剪纸','📚看书','🎵唱歌'], ans:0, hint:'铅笔用来写字，画笔用来干什么？' },
  { text:'🌙 月亮 → 🌃 夜晚，那么 ☀️ 太阳 → ？', opts:['🌃夜晚','🌅早晨','🌆傍晚','🌌宇宙'], ans:1, hint:'月亮在夜晚出来，太阳在什么时候出来？' },
  { text:'🐟 鱼 → 🌊 水里，那么 🐦 鸟 → ？', opts:['🌊水里','🌳树上','🏠家里','🌤️天空'], ans:3, hint:'鱼生活在水里，鸟生活在哪里？' },
  { text:'👓 眼镜 → 👁️ 眼睛，那么 🎧 耳机 → ？', opts:['👁️眼睛','👂耳朵','👃鼻子','👄嘴巴'], ans:1, hint:'眼镜是戴在眼睛上的，耳机是戴在哪里的？' },
  { text:'🏊 游泳 → 🌊 水，那么 🏂 滑雪 → ？', opts:['🌊水','☁️云','❄️雪','🌳树'], ans:2, hint:'游泳需要水，滑雪需要什么？' },
  { text:'🍎 苹果 → 🌳 苹果树，那么 🍊 橙子 → ？', opts:['🌲松树','🌴椰子树','🌳橙子树','🌵仙人掌'], ans:2, hint:'苹果长在苹果树上，橙子长在什么树上？' },
  { text:'🔥 火 → 🌡️ 热，那么 ❄️ 冰 → ？', opts:['🌡️热','💧湿','🥶冷','💨风'], ans:2, hint:'火让人感到热，冰让人感到什么？' },
  { text:'🎹 钢琴 → 🎵 音乐，那么 🖌️ 画笔 → ？', opts:['🎵音乐','🖼️画作','📚书本','🎭戏剧'], ans:1, hint:'钢琴用来演奏音乐，画笔用来创作什么？' },
  { text:'🦁 狮子 → 🌾 草原，那么 🐳 鲸鱼 → ？', opts:['🌾草原','🏔️高山','🌊大海','🌲森林'], ans:2, hint:'狮子生活在草原，鲸鱼生活在哪里？' },
  { text:'📖 书 → 📚 图书馆，那么 💊 药 → ？', opts:['📚图书馆','🏥医院','🏪超市','🏫学校'], ans:1, hint:'书放在图书馆，药放在哪里取？' },
  { text:'🐜 蚂蚁 → 小，那么 🦒 长颈鹿 → ？', opts:['快','慢','高','矮'], ans:2, hint:'蚂蚁很小，长颈鹿脖子很长，整体很...' },
  { text:'⚽ 足球 → 🦵 脚踢，那么 🏀 篮球 → ？', opts:['🦵脚踢','🤲手投','🦷牙咬','👁️眼看'], ans:1, hint:'足球用脚踢，篮球用什么投？' },
  { text:'🎂 蛋糕 → 🎂生日，那么 🎁 礼物 → ？', opts:['🎂生日','🎁礼物','🎊庆祝','😊开心'], ans:2, hint:'蛋糕代表生日，礼物代表什么？' },
  { text:'🌧️ 下雨 → ☂️ 雨伞，那么 ☀️ 晒太阳 → ？', opts:['☂️雨伞','🕶️墨镜','🧣围巾','🧤手套'], ans:1, hint:'下雨要用雨伞，晒太阳要用什么保护眼睛？' },
  { text:'🏃 跑步 → 🦵 腿，那么 🤸 翻跟头 → ？', opts:['🦵腿','🤲双手','👁️眼睛','👂耳朵'], ans:1, hint:'跑步主要用腿，翻跟头主要用什么支撑？' },
];

function launchAnalogy(level, container) {
  const q = ANALOGY_QUESTIONS[(level - 1) % ANALOGY_QUESTIONS.length];
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(167,139,250,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#c4b5fd;font-weight:800;margin:0;">🔗 类比推理 — 第 ${level}/50 关</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${q.text.replace(/['"]/g,' ')}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <div class="glass-card" style="padding:20px;margin:20px 0;background:rgba(167,139,250,0.06);border-color:rgba(167,139,250,0.2);">
        <p style="font-size:1.2em;color:#fff;font-weight:700;line-height:1.6;margin:0;">${q.text}</p>
      </div>
      <p style="font-size:0.85em;color:#64748b;margin-bottom:20px;">💡 ${q.hint}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:420px;margin:0 auto;">
        ${shuffled.map(item => `
          <button class="mock-button glow-dabao" onclick="checkAnalogyAnswer(${item.i},${q.ans})" style="font-size:1em;padding:15px;border-radius:12px;font-weight:700;line-height:1.4;">
            ${item.o}
          </button>
        `).join('')}
      </div>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
    </div>
  `;
  setTimeout(() => speakText(q.text.replace(/[→]/g, '对应')), 300);
}

function checkAnalogyAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "类比推理答对了！果果的逻辑太厉害了！");
  } else {
    speakText("再想想它们的关系，换个答案试试！");
    showWrongToast();
  }
}

// ==================== 🔧 工具函数 ====================

function resetTrackProgress(type) {
  initAppState();
  const player = appState.players.dabao;
  player.progress[type] = 1;
  saveAppState();
  speakText(`已重置${getTrackChineseName(type)}，重新开始挑战吧！`);
  launchTest(type);
}

function clickTimelineNode(index, direction) {
  shiftTimelineNode(index, direction);
}

function setupDeductionDrag() {
  // 使用按钮控制，无需drag
}
