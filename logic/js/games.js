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


// ==================== 🧮 维度2：数字规律（5种题型交替）====================

// 题型A/B: 等差加减 (Phase 1 & 2)
function getNumericSeqQuestion(level) {
  const phase = Math.ceil(level / 10);
  if (phase === 1) {
    const d = (level % 3) + 2;
    const start = (level % 4) + 1;
    const pos = (level % 3) + 1;
    const seq = [start, start+d, start+d*2, start+d*3, start+d*4];
    const ans = seq[pos];
    seq[pos] = null;
    return { seq, ans, hint: `每次加 ${d}，看看缺的那个数是多少？` };
  } else {
    const d = (level % 3) + 2;
    const start = 20 - (level % 4);
    const pos = (level % 3) + 1;
    const seq = [start, start-d, start-d*2, start-d*3, start-d*4];
    const ans = seq[pos];
    seq[pos] = null;
    return { seq, ans, hint: `每次减 ${d}，数字在变小哦。` };
  }
}

// 题型C: 天平称重平衡 (Phase 3: 21-30)
const NUMERIC_BALANCE_QUESTIONS = [
  { left: [4, 5], right: [6, null], ans: 3, hint: '左边 4+5=9，右边 6+？也是 9 呢？' },
  { left: [7, 2], right: [null, 3], ans: 6, hint: '左边 7+2=9，右边 ？+3 也是 9 呢？' },
  { left: [3, 5], right: [2, null], ans: 6, hint: '左边 3+5=8，右边 2+？也是 8 呢？' },
  { left: [8, 1], right: [null, 4], ans: 5, hint: '左边 8+1=9，右边 ？+4 也是 9 呢？' },
  { left: [2, 7], right: [5, null], ans: 4, hint: '左边 2+7=9，右边 5+？也是 9 呢？' },
  { left: [6, 4], right: [null, 7], ans: 3, hint: '左边 6+4=10，右边 ？+7 也是 10 呢？' },
  { left: [5, 5], right: [8, null], ans: 2, hint: '左边 5+5=10，右边 8+？也是 10 呢？' },
  { left: [1, 9], right: [null, 6], ans: 4, hint: '左边 1+9=10，右边 ？+6 也是 10 呢？' }
];

// 题型D: 图形代数 (Phase 4: 31-40)
const NUMERIC_EMOJI_QUESTIONS = [
  { expr1: '🍎 + 🍎 = 6', q: '🍎 应该是多少？', ans: 3, hint: '两个一样的苹果相加是 6，一个苹果是多少呢？' },
  { expr1: '🍌 + 🍌 = 8', q: '🍌 应该是多少？', ans: 4, hint: '两个香蕉相加是 8，一个香蕉是多少呢？' },
  { expr1: '🐼 + 🐼 = 10', q: '🐼 应该是多少？', ans: 5, hint: '两个熊猫相加是 10，一个熊猫是多少呢？' },
  { expr1: '🍓 + 🍓 = 4', q: '🍓 应该是多少？', ans: 2, hint: '两个草莓是 4，一个草莓是多少？' },
  { expr1: '🍎 + 🍌 = 7', expr2: '🍎 = 4', q: '🍌 应该是多少？', ans: 3, hint: '苹果是 4，苹果加香蕉是 7，香蕉是多少呢？' },
  { expr1: '🚗 + 🚲 = 6', expr2: '🚗 = 5', q: '🚲 应该是多少？', ans: 1, hint: '汽车是 5，汽车加自行车是 6，自行车是多少呢？' },
  { expr1: '🦁 + 🐰 = 8', expr2: '🐰 = 2', q: '🦁 应该是多少？', ans: 6, hint: '兔子是 2，狮子加兔子是 8，狮子是多少呢？' },
  { expr1: '🎈 + 🎁 = 9', expr2: '🎈 = 5', q: '🎁 应该是多少？', ans: 4, hint: '气球是 5，气球加礼物是 9，礼物是多少呢？' }
];

// 题型E: 数字金字塔 (Phase 5: 41-50)
const NUMERIC_PYRAMID_QUESTIONS = [
  { bottom: [2, 3, 1], middle: [5, 4], top: null, ans: 9, hint: '下面相邻两个数相加等于上层叠在它们上面的数：5+4 是多少呢？' },
  { bottom: [3, 2, 4], middle: [5, 6], top: null, ans: 11, hint: '中间两格是 5 和 6，最顶层格是 5+6 喔！' },
  { bottom: [1, 4, 3], middle: [5, 7], top: null, ans: 12, hint: '中间两格是 5 和 7，最顶层相加是多少呢？' },
  { bottom: [2, 2, 5], middle: [4, 7], top: null, ans: 11, hint: '最顶层是两个中间格 4 和 7 的和！' },
  { bottom: [3, null, 2], middle: [7, 6], top: 13, ans: 4, hint: '3 + ？ = 7，想想中间缺失的数是多少？' },
  { bottom: [null, 1, 5], middle: [4, 6], top: 10, ans: 3, hint: '？ + 1 = 4，想想底层最左边是多少？' },
  { bottom: [2, 5, null], middle: [7, 8], top: 15, ans: 3, hint: '5 + ？ = 8，想想底层最右边是多少？' }
];

function launchNumeric(level, container) {
  const phase = Math.ceil(level / 10);
  let questionText = '';
  
  if (phase === 1 || phase === 2) {
    const q = getNumericSeqQuestion(level);
    currentAnswer6yo = q.ans;
    questionText = `果果，请根据数字排队的规律，猜猜蓝色问号泡泡里面应该填哪个数字？`;
    const min = Math.max(0, q.ans - 5);
    const opts = Array.from({length:10}, (_,i) => min + i).filter(v => v >= 0);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(6,182,212,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">🧮 数字规律·数列排队 — 第 ${level}/50 关</h3>
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
  else if (phase === 3) {
    // 天平称重平衡
    const q = NUMERIC_BALANCE_QUESTIONS[(level - 21) % NUMERIC_BALANCE_QUESTIONS.length];
    currentAnswer6yo = q.ans;
    questionText = `果果，天平要左右平衡哦！请算出右边问号里面填哪个数字，天平两边才一样重？`;
    
    const leftText = q.left.map(v => v === null ? '❓' : v).join(' + ');
    const rightText = q.right.map(v => v === null ? '❓' : v).join(' + ');
    
    const min = Math.max(0, q.ans - 4);
    const opts = Array.from({length:9}, (_,i) => min + i).filter(v => v >= 0);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(6,182,212,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">⚖️ 数字规律·天平平衡 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:15px;">🦁 算出问号数字，使天平左右两边和相等：</p>
        
        <!-- Beautiful Balance Scale -->
        <div style="display:flex; flex-direction:column; align-items:center; margin: 25px 0;">
          <div style="width: 260px; height: 8px; background: #64748b; border-radius: 4px; position: relative; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 10px;">
            <!-- Left Pan -->
            <div style="width: 90px; height: 55px; background: rgba(255,255,255,0.06); border: 2px solid #22d3ee; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translateY(40px);">
              <div style="font-size: 0.7em; color: #64748b; margin-bottom: 2px;">左边</div>
              <div style="font-size: 1.1em; font-weight: bold; color: #fff;">${leftText}</div>
            </div>
            <!-- Right Pan -->
            <div style="width: 90px; height: 55px; background: rgba(255,255,255,0.06); border: 2px solid #fbbf24; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translateY(40px);">
              <div style="font-size: 0.7em; color: #64748b; margin-bottom: 2px;">右边</div>
              <div style="font-size: 1.1em; font-weight: bold; color: #fbbf24;">${rightText}</div>
            </div>
            <!-- Center Pillar -->
            <div style="width: 14px; height: 55px; background: #475569; position: absolute; left: 50%; bottom: -55px; transform: translateX(-50%); z-index: -1;"></div>
            <!-- Center Base -->
            <div style="width: 70px; height: 10px; background: #334155; position: absolute; left: 50%; bottom: -65px; transform: translateX(-50%); border-radius: 5px;"></div>
          </div>
          <div style="height: 65px;"></div>
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
  else if (phase === 4) {
    // 图形代数
    const q = NUMERIC_EMOJI_QUESTIONS[(level - 31) % NUMERIC_EMOJI_QUESTIONS.length];
    currentAnswer6yo = q.ans;
    questionText = `果果，请开动脑筋，算一算图画代表什么数字？${q.q}`;
    
    const min = Math.max(0, q.ans - 4);
    const opts = Array.from({length:9}, (_,i) => min + i).filter(v => v >= 0);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(6,182,212,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">🍎 数字规律·图形代数 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 算一算图画所代表的的数字：</p>
        
        <div class="glass-card" style="padding:20px;margin:15px auto;max-width:320px;background:rgba(6,182,212,0.06);border-color:rgba(6,182,212,0.2);display:flex;flex-direction:column;gap:10px;">
          <div style="font-size:1.6em;font-weight:800;color:#fff;letter-spacing:2px;">${q.expr1}</div>
          ${q.expr2 ? `<div style="font-size:1.6em;font-weight:800;color:#fff;letter-spacing:2px;">${q.expr2}</div>` : ''}
          <div style="border-top:1px dashed rgba(255,255,255,0.1);padding-top:10px;font-size:1.2em;font-weight:800;color:#fbbf24;">${q.q}</div>
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
  else {
    // 数字金字塔
    const q = NUMERIC_PYRAMID_QUESTIONS[(level - 41) % NUMERIC_PYRAMID_QUESTIONS.length];
    currentAnswer6yo = q.ans;
    questionText = `果果，这是好玩的数字金字塔！下面相邻两个数加起来等于上面的数，请算算问号应该是多少？`;
    
    const min = Math.max(0, q.ans - 4);
    const opts = Array.from({length:9}, (_,i) => min + i).filter(v => v >= 0);
    
    const botVal1 = q.bottom[0];
    const botVal2 = q.bottom[1];
    const botVal3 = q.bottom[2];
    const midVal1 = q.middle[0];
    const midVal2 = q.middle[1];
    const topVal = q.top;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(6,182,212,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">🔺 数字规律·数字金字塔 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 算出金字塔中【❓】处的数字：</p>
        
        <div style="display:flex; flex-direction:column; align-items:center; gap:10px; margin: 25px 0;">
          <!-- Top Row -->
          <div style="display:flex; justify-content:center;">
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${topVal===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${topVal===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${topVal===null?'#22d3ee':'#fff'}; ${topVal===null?'animation:pulseGlow 1.5s infinite;':''}">${topVal===null?'❓':topVal}</div>
          </div>
          <!-- Middle Row -->
          <div style="display:flex; justify-content:center; gap:12px;">
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${midVal1===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${midVal1===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${midVal1===null?'#22d3ee':'#fff'}; ${midVal1===null?'animation:pulseGlow 1.5s infinite;':''}">${midVal1===null?'❓':midVal1}</div>
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${midVal2===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${midVal2===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${midVal2===null?'#22d3ee':'#fff'}; ${midVal2===null?'animation:pulseGlow 1.5s infinite;':''}">${midVal2===null?'❓':midVal2}</div>
          </div>
          <!-- Bottom Row -->
          <div style="display:flex; justify-content:center; gap:12px;">
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${botVal1===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${botVal1===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${botVal1===null?'#22d3ee':'#fff'}; ${botVal1===null?'animation:pulseGlow 1.5s infinite;':''}">${botVal1===null?'❓':botVal1}</div>
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${botVal2===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${botVal2===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${botVal2===null?'#22d3ee':'#fff'}; ${botVal2===null?'animation:pulseGlow 1.5s infinite;':''}">${botVal2===null?'❓':botVal2}</div>
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${botVal3===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${botVal3===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${botVal3===null?'#22d3ee':'#fff'}; ${botVal3===null?'animation:pulseGlow 1.5s infinite;':''}">${botVal3===null?'❓':botVal3}</div>
          </div>
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
}


// ==================== ⚡ 维度3：注意力扫描（5种题型交替）====================

const ATTENTION_SPOT_TEMPLATES = [
  { base: '🐱', diff: '🐶', name: '小狗', q: '快在一大群猫咪中，找出唯一的一只小狗！' },
  { base: '🍎', diff: '🍒', name: '樱桃', q: '快在一堆大苹果中，找到那一颗红樱桃！' },
  { base: '⭐', diff: '🌙', name: '月亮', q: '快在一片小星星中，找到那一个月亮！' },
  { base: '🚗', diff: '🚓', name: '警车', q: '快在一群小汽车中，找到那一辆警车！' },
  { base: '🐵', diff: '🦁', name: '狮子', q: '快在一群小猴子中，找到那一只威武的狮子！' },
  { base: '🎈', diff: '🍭', name: '棒棒糖', q: '快在一大堆五颜六色的气球里，找到棒棒糖！' },
  { base: '🐟', diff: '🦀', name: '螃蟹', q: '快在一群游动的小鱼中，找到那一只红螃蟹！' },
  { base: '🐝', diff: '🦋', name: '蝴蝶', q: '快在一群忙碌的小蜜蜂中，找到那一只花蝴蝶！' }
];

const ATTENTION_COUNT_QUESTIONS = [
  { pool: ['🔴','🔵','🔴','🟢','🔴','🔵','🟢','🔴','🔴','🔵'], target: '🔴', ans: 5, q: '数一数，下面一共有多少个红色的圆形 🔴 呢？', hint: '仔细看，只数红色的圆形 🔴 喔！' },
  { pool: ['⭐','🌙','⭐','⭐','🌙','⭐','🌙','⭐','⭐','⭐'], target: '⭐', ans: 7, q: '数一数，下面一共有多少颗闪亮的黄星星 ⭐ 呢？', hint: '不要把弯弯的月亮数进去了喔！只数星星 ⭐。' },
  { pool: ['🐱','🐶','🐱','🐱','🐶','🐱','🐶','🐱','🐱','🐶'], target: '🐱', ans: 6, q: '数一数，下面一共有多少只可爱的小猫咪 🐱 呢？', hint: '分清猫咪 🐱 和小狗 🐶，只数小猫咪 🐱！' },
  { pool: ['🚗','🚲','🚗','🚗','🚲','🚗','🚲','🚗','🚗','🚲'], target: '🚗', ans: 6, q: '数一数，下面一共有多少辆红色的小汽车 🚗 呢？', hint: '只数小汽车 🚗，绿色的自行车 🚲 不要数喔！' },
  { pool: ['🍎','🍊','🍎','🍎','🍊','🍎','🍎','🍊','🍎','🍊'], target: '🍎', ans: 6, q: '数一数，下面一共有多少个红红的苹果 🍎 呢？', hint: '只数苹果 🍎，甜甜的橙子 🍊 不要数喔！' }
];

const ATTENTION_PAIR_TEMPLATES = [
  { pool: ['🍎', '🍌', '🍒', '🍇', '🍎', '🍓'], ans: '🍎', text: '果果，下面这堆水果中，哪一个出现了两次（是一对双胞胎）？' },
  { pool: ['🦁', '🐯', '🐼', '🦊', '🦁', '🐨'], ans: '🦁', text: '果果，下面这群小动物里，哪一个出现了两次（是一对双胞胎）？' },
  { pool: ['🚗', '✈️', '🚢', '🚊', '✈️', '🚲'], ans: '✈️', text: '果果，下面这些交通工具中，哪一个出现了两次（是一对双胞胎）？' },
  { pool: ['⭐', '🌙', '☀️', '☁️', '☀️', '🌈'], ans: '☀️', text: '果果，下面这组天气符号中，哪一个出现了两次（是一对双胞胎）？' },
  { pool: ['🍦', '🍩', '🍬', '🍪', '🍩', '🍭'], ans: '🍩', text: '果果，下面这些美味甜食中，哪一个出现了两次（是一对双胞胎）？' }
];

const ATTENTION_TRACK_QUESTIONS = [
  { targetFood: '🥕 胡萝卜', ans: '🐰 小兔', options: ['🐵 猴子', '🐻 小熊', '🐰 小兔'], paths: [
      { from: 30, to: 80, color: '#f43f5e' }, // 🐵 -> 🍯
      { from: 80, to: 30, color: '#10b981' }, // 🐻 -> 🍌
      { from: 130, to: 130, color: '#6366f1' } // 🐰 -> 🥕
    ], hint: '顺着蓝色的线（最下面），看看从哪里出发能走到胡萝卜？' },
  { targetFood: '🍌 香蕉', ans: '🐻 小熊', options: ['🐵 猴子', '🐻 小熊', '🐰 小兔'], paths: [
      { from: 30, to: 80, color: '#f43f5e' }, // 🐵 -> 🍯
      { from: 80, to: 30, color: '#10b981' }, // 🐻 -> 🍌
      { from: 130, to: 130, color: '#6366f1' } // 🐰 -> 🥕
    ], hint: '顺着绿色的线（中间），看看从小熊出发能吃到什么？' },
  { targetFood: '🍯 蜂蜜', ans: '🐵 猴子', options: ['🐵 猴子', '🐻 小熊', '🐰 小兔'], paths: [
      { from: 30, to: 80, color: '#f43f5e' }, // 🐵 -> 🍯
      { from: 80, to: 30, color: '#10b981' }, // 🐻 -> 🍌
      { from: 130, to: 130, color: '#6366f1' } // 🐰 -> 🥕
    ], hint: '顺着红色的线（最上面），从猴子出发，看看它通向哪里呢？' }
];

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

function checkAttentionChoice(selected, correct, feedback = "注意力扫描答对了！果果真专注！") {
  if (selected === correct) {
    trigger6yoVictory(10, feedback);
  } else {
    speakText("再仔细看一看，想一想再选！");
    showWrongToast();
  }
}

function launchAttention(level, container) {
  const phase = Math.ceil(level / 10);
  let questionText = '';
  
  if (phase === 1) {
    // 舒尔特格 1-9
    questionText = '果果，请从小到大，按顺序快速点击一到九的数字格子！';
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">⚡ 注意力·舒尔特格 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 按 1 ➡️ 9 顺序点击格子：</p>
        <div id="schulte-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px auto;max-width:270px;"></div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    
    const grid = document.getElementById('schulte-grid');
    const numbers = [1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
    grid.innerHTML = numbers.map(n => `<button id="cell-${n}" class="schulte-cell mock-button glow-dabao" onclick="clickSchulteTrack(${n},1,9,1)" style="height:72px;font-size:1.8em;font-weight:bold;">${n}</button>`).join('');
    window.schulteTarget = 1;
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 2) {
    // 找不同符号
    const t = ATTENTION_SPOT_TEMPLATES[(level - 11) % ATTENTION_SPOT_TEMPLATES.length];
    questionText = `果果，${t.q}`;
    
    // Create a 4x4 array of base emojis
    const size = 16;
    const list = Array.from({length: size}, () => t.base);
    const diffIdx = Math.floor(Math.random() * size);
    list[diffIdx] = t.diff;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">🎯 注意力·符号侦探 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 快速找到并点击那个不一样的图形：</p>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px auto;max-width:280px;">
          ${list.map((emoji, idx) => `
            <button class="mock-button glow-dabao" onclick="checkAttentionChoice(${idx}, ${diffIdx}, '哇！果然被果果一眼找出来了！火眼金睛！')" style="font-size:2em;height:60px;padding:0;display:flex;align-items:center;justify-content:center;">${emoji}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 3) {
    // 快速视觉计数
    const q = ATTENTION_COUNT_QUESTIONS[(level - 21) % ATTENTION_COUNT_QUESTIONS.length];
    currentAnswer6yo = q.ans;
    questionText = `果果，${q.q}`;
    
    const min = Math.max(1, q.ans - 3);
    const opts = Array.from({length: 6}, (_, i) => min + i);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">🔢 注意力·视觉快速计数 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 仔细数一数，不要数漏喔：</p>
        <div class="glass-card" style="background:rgba(255,255,255,0.04);padding:15px;border-radius:16px;display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-bottom:20px;max-width:360px;margin-left:auto;margin-right:auto;">
          ${q.pool.map(item => `<span style="font-size:2em;">${item}</span>`).join('')}
        </div>
        <p style="font-size:0.85em;color:#64748b;margin-bottom:20px;">💡 提示：${q.hint}</p>
        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
          ${opts.map(n => `<button class="mock-button glow-dabao" onclick="check6yoAnswer(${n})" style="font-size:1.35em;width:54px;height:54px;border-radius:10px;">${n}</button>`).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 4) {
    // 相同图形双双配对 (寻找双胞胎)
    const t = ATTENTION_PAIR_TEMPLATES[(level - 31) % ATTENTION_PAIR_TEMPLATES.length];
    questionText = t.text;
    
    // Draw options
    const uniqueItems = Array.from(new Set(t.pool));
    const correctIdx = uniqueItems.indexOf(t.ans);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">👯 注意力·寻找双胞胎 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 哪个图案在这里面偷偷出现了两次？</p>
        <div class="glass-card" style="background:rgba(255,255,255,0.04);padding:15px;border-radius:16px;display:flex;flex-wrap:wrap;justify-content:center;gap:15px;margin-bottom:20px;max-width:340px;margin-left:auto;margin-right:auto;">
          ${t.pool.map(item => `<span style="font-size:2.2em;">${item}</span>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:320px;margin:0 auto;">
          ${uniqueItems.map((item, idx) => `
            <button class="mock-button glow-dabao" onclick="checkAttentionChoice(${idx}, ${correctIdx}, '太牛啦！这对双胞胎被果果瞬间揪出来啦！')" style="font-size:1.8em;height:55px;padding:0;display:flex;align-items:center;justify-content:center;">${item}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else {
    // 视网膜迷宫路径追踪 (SVG lines crossing)
    const q = ATTENTION_TRACK_QUESTIONS[(level - 41) % ATTENTION_TRACK_QUESTIONS.length];
    questionText = `果果，顺着细细的连线看一看，哪只小动物能吃到【${q.targetFood}】呢？`;
    
    const correctIdx = q.options.indexOf(q.ans);
    
    // Draw SVG
    let svgHTML = `<svg width="100%" height="150" viewBox="0 0 300 150" style="background:rgba(15,23,42,0.4);border-radius:12px;display:block;margin:auto;">`;
    
    // Left Animals
    svgHTML += `<text x="25" y="38" font-size="22" text-anchor="middle">🐵</text>`;
    svgHTML += `<text x="25" y="88" font-size="22" text-anchor="middle">🐻</text>`;
    svgHTML += `<text x="25" y="138" font-size="22" text-anchor="middle">🐰</text>`;
    
    // Right Foods
    svgHTML += `<text x="275" y="38" font-size="22" text-anchor="middle">🍌</text>`;
    svgHTML += `<text x="275" y="88" font-size="22" text-anchor="middle">🍯</text>`;
    svgHTML += `<text x="275" y="138" font-size="22" text-anchor="middle">🥕</text>`;
    
    // Draw Curvy Paths
    q.paths.forEach(p => {
      svgHTML += `<path d="M 45 ${p.from} C 100 ${p.from - 20}, 200 ${p.to + 20}, 255 ${p.to}" fill="none" stroke="${p.color}" stroke-width="3" stroke-linecap="round" />`;
    });
    svgHTML += `</svg>`;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">🕸️ 注意力·视网膜路径追踪 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:15px;">🦁 顺着彩色波浪线看一看：谁能吃到【${q.targetFood}】？</p>
        <div style="margin-bottom:20px;">${svgHTML}</div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:15px;">💡 ${q.hint}</p>
        <div style="display:flex;justify-content:center;gap:12px;max-width:320px;margin:0 auto;">
          ${q.options.map((opt, idx) => `
            <button class="mock-button glow-dabao" onclick="checkAttentionChoice(${idx}, ${correctIdx}, '太神奇了！果果的小眼睛追踪线条又快又准！')" style="font-size:1.1em;padding:12px 18px;border-radius:12px;font-weight:700;">${opt}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
}


// ==================== 🔍 维度4：逻辑演绎排序（5种题型交替）====================

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
  { text:"果果，把植物喝水的旅程，从根到叶子排好：", items:[{id:'1',text:'💧 雨水渗入泥土深处'},{id:'2',text:'🌱 根毛从土里吸收水'},{id:'3',text:'🌿 水沿茎干向上运输'},{id:'4',text:'🍃 叶子把水用来做饭'}] }
];

const DEDUCTION_SIZE_QUESTIONS = [
  { text: '请把这些动物按【身体从大到小】排列好：', items: [{id:'1', text: '🐘 庞大的大象'}, {id:'2', text: '🦁 威武的狮子'}, {id:'3', text: '🐱 可爱的猫咪'}, {id:'4', text: '🐭 娇小的老鼠'}], hint: '大象最大，老鼠最小，依次变小哦。' },
  { text: '请把这些物品按【长度从短到长】排列好：', items: [{id:'1', text: '🧽 橡皮擦 (超短)'}, {id:'2', text: '✏️ 铅笔 (较短)'}, {id:'3', text: '🥖 法棍面包 (较长)'}, {id:'4', text: '🛣️ 笔直的马路 (极长)'}], hint: '从最短的橡皮，到最长的马路。' },
  { text: '请把这些交通方式按【速度从慢到快】排列好：', items: [{id:'1', text: '🚶 步行散步'}, {id:'2', text: '🚲 自行车骑行'}, {id:'3', text: '🚗 小汽车飞奔'}, {id:'4', text: '🚀 太空火箭冲天'}], hint: '走路最慢，火箭最快，汽车比自行车快。' },
  { text: '请把这些植物按【高度从矮到高】排列好：', items: [{id:'1', text: '🌱 刚钻土的小嫩芽'}, {id:'2', text: '🍄 森林小草菇'}, {id:'3', text: '🌻 向日葵花朵'}, {id:'4', text: '🌲 参天大树'}], hint: '小嫩芽最矮，参天大树最高哦！' }
];

const DEDUCTION_WEIGHT_QUESTIONS = [
  { text: '根据下面的天平轻重关系，把水果【从最重到最轻】排列好：',
    clues: ['⚖️ 天平显示：🍎 比 🍊 重', '⚖️ 天平显示：🍐 比 🍎 重'],
    items: [{id:'1', text: '🍐 梨子 (最重)'}, {id:'2', text: '🍎 苹果 (中等)'}, {id:'3', text: '🍊 橙子 (最轻)'}],
    hint: '梨子比苹果重，苹果又比橙子重，所以梨子最重！' },
  { text: '根据下面的天平轻重关系，把蔬菜【从最轻到最重】排列好：',
    clues: ['⚖️ 天平显示：🥦 比 🥕 轻', '⚖️ 天平显示：🥕 比 🎃 轻'],
    items: [{id:'1', text: '🥦 西兰花 (最轻)'}, {id:'2', text: '🥕 胡萝卜 (中等)'}, {id:'3', text: '🎃 巨型南瓜 (最重)'}],
    hint: '西兰花比胡萝卜轻，胡萝卜比大南瓜轻，所以西兰花最轻！' }
];

const DEDUCTION_CAUSAL_QUESTIONS = [
  { text: '如果小明在屋里玩球时不小心把装满水的杯子碰倒了，接下来会发生什么？',
    opts: ['🟨 没有任何变化，桌子很干净', '💧 水洒了一桌子，桌子湿透了', '🎈 水杯变成气球飞走了'], ans: 1,
    hint: '杯子里装了水，倒了以后水肯定会把桌子淋湿哦！' },
  { text: '冬天的气温变得特别特别冷，下雪了，湖面会有什么神奇的变化？',
    opts: ['❄️ 湖面结了一层厚厚的冰块，可以在上面滑冰', '🌸 湖里突然盛开出很多美丽的夏日荷花', '💨 湖水一瞬间全部变成热气蒸发干了'], ans: 0,
    hint: '水在很冷的地方就会凝固结冰哦！' },
  { text: '小鸟用干草、树枝在粗粗的树杈上搭建了一个鸟窝，这是用来干什么的呢？',
    opts: ['⛺ 和别的小鸟玩捉迷藏', '🥚 用来产卵并孵化小鸟宝宝的家', '🛹 当作滑板的跑道'], ans: 1,
    hint: '鸟窝是鸟妈妈生蛋和孵化宝宝最安全温馨的地方。' }
];

const DEDUCTION_QUEUE_QUESTIONS = [
  { text: '排队买冰淇淋时：小兔排在小熊前面，小猴排在小熊后面。谁排在最前面？',
    opts: ['🐰 小兔', '🐻 小熊', '🐵 小猴'], ans: 0,
    hint: '小兔在小熊前面，小猴在小熊后面，所以队伍顺序是小兔、小熊、小猴。' },
  { text: '动物公寓楼里：小红住在小兰的上面，小兰住在小绿的上面。谁住在一楼（最下面）？',
    opts: ['🐱 小红', '🐰 小兰', '🐸 小绿'], ans: 2,
    hint: '小红最高，小兰中间，小绿在最底下，所以最下面是一楼的小绿。' },
  { text: '森林赛跑比赛中：小狗比小猫跑得快，小猫比小猪跑得快。谁跑得最慢？',
    opts: ['🐶 小狗', '🐱 小猫', '🐷 小猪'], ans: 2,
    hint: '小狗第一，小猫第二，小猪最后，所以小猪跑得最慢啦！' }
];

function checkDeductionChoice(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "逻辑推断完美！果果的推理分析能力超强！");
  } else {
    speakText("再仔细想想，换个答案试试看！");
    showWrongToast();
  }
}

function verifyDabaoTimeline() {
  const order = currentDeductionTimeline.map(i => i.id).join('');
  const targetOrder = currentDeductionTimeline.length === 3 ? '123' : '1234';
  if (order === targetOrder) {
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

function launchDeduction(level, container) {
  const phase = Math.ceil(level / 10);
  let questionText = '';

  if (phase === 1) {
    // 故事排序 (Chronological)
    const q = DEDUCTION_TIMELINES[(level - 1) % DEDUCTION_TIMELINES.length];
    currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">🔍 逻辑排序·故事发生顺序 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 请调整卡片顺序，按时间发生先后排列：</p>
        <div id="timeline-list" style="display:flex;flex-direction:column;gap:10px;margin:15px 0;"></div>
        <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="width:100%;font-size:1.05em;font-weight:700;padding:10px;margin-top:10px;">✅ 提交验证</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:15px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    rerenderTimelineStage();
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 2) {
    // 长度/大小/速度排序
    const q = DEDUCTION_SIZE_QUESTIONS[(level - 11) % DEDUCTION_SIZE_QUESTIONS.length];
    currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">📏 逻辑排序·属性比较 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 用右边的 ↑ ↓ 按钮，把卡片按要求排好顺序：</p>
        <div id="timeline-list" style="display:flex;flex-direction:column;gap:10px;margin:15px 0;"></div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:15px;">💡 ${q.hint}</p>
        <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="width:100%;font-size:1.05em;font-weight:700;padding:10px;margin-top:10px;">✅ 提交验证</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:15px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    rerenderTimelineStage();
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 3) {
    // 天平轻重逻辑推理
    const q = DEDUCTION_WEIGHT_QUESTIONS[(level - 21) % DEDUCTION_WEIGHT_QUESTIONS.length];
    currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">⚖️ 逻辑排序·天平轻重推理 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:10px;">🦁 依据天平的轻重线索，给卡片排序：</p>
        
        <div style="background:rgba(255,255,255,0.04);padding:12px;border-radius:12px;margin:10px 0;text-align:left;display:inline-block;">
          ${q.clues.map(c => `<div style="font-size:1.05em;font-weight:bold;color:#fff;margin:5px 0;">${c}</div>`).join('')}
        </div>
        
        <div id="timeline-list" style="display:flex;flex-direction:column;gap:10px;margin:15px 0;"></div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:15px;">💡 ${q.hint}</p>
        <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="width:100%;font-size:1.05em;font-weight:700;padding:10px;margin-top:10px;">✅ 提交验证</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:15px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    rerenderTimelineStage();
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 4) {
    // 因果判断单选题
    const q = DEDUCTION_CAUSAL_QUESTIONS[(level - 31) % DEDUCTION_CAUSAL_QUESTIONS.length];
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">💭 逻辑推理·因果判断 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <div class="glass-card" style="padding:15px;margin:20px 0;background:rgba(168,85,247,0.06);border-color:rgba(168,85,247,0.2);">
          <p style="font-size:1.1em;color:#fff;font-weight:700;line-height:1.5;margin:0;">${q.text}</p>
        </div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:20px;">💡 提示：${q.hint}</p>
        <div style="display:flex;flex-direction:column;gap:12px;max-width:440px;margin:0 auto;">
          ${q.opts.map((opt, idx) => `
            <button class="mock-button glow-dabao" onclick="checkDeductionChoice(${idx}, ${q.ans})" style="font-size:1.05em;padding:15px;border-radius:12px;font-weight:700;text-align:left;">${opt}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else {
    // 排队/排座位推理
    const q = DEDUCTION_QUEUE_QUESTIONS[(level - 41) % DEDUCTION_QUEUE_QUESTIONS.length];
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">🐾 逻辑推理·队列排座位 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <div class="glass-card" style="padding:18px;margin:20px 0;background:rgba(168,85,247,0.06);border-color:rgba(168,85,247,0.2);">
          <p style="font-size:1.05em;color:#fff;font-weight:700;line-height:1.5;margin:0;">${q.text}</p>
        </div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:20px;">💡 提示：${q.hint}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;max-width:440px;margin:0 auto;">
          ${q.opts.map((opt, idx) => `
            <button class="mock-button glow-dabao" onclick="checkDeductionChoice(${idx}, ${q.ans})" style="font-size:1.1em;padding:15px;border-radius:12px;font-weight:700;">${opt}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
}


// ==================== 🎨 维度5：图形矩阵推理（5种题型交替）====================

const PATTERN_QUESTIONS = [
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
  { text:'果果，看看这些水果的排列规律，问号是什么？', matrix:['🍎','🍊','🍋','🍊','🍋','🍎','🍋','🍎','?'], opts:['🍊','🍋','🍇','🍎'], ans:0, hint:'三种水果循环，最后一格缺哪个？' },
  { text:'果果，动物的排列有规律，问号处应该是什么？', matrix:['🐘','🦁','🐯','🦁','🐯','🐘','🐯','🐘','?'], opts:['🦁','🐮','🐧','🐯'], ans:0, hint:'三种动物循环，第三行最后缺哪个？' },
  { text:'果果，天气图案有规律，问号是什么天气？', matrix:['☀️','🌤️','🌧️','🌤️','🌧️','☀️','🌧️','☀️','?'], opts:['🌤️','❄️','🌪️','☀️'], ans:0, hint:'三种天气循环' },
  { text:'果果，数字在增加，问号是多少？', matrix:['1','3','5','3','5','7','5','7','?'], opts:['9','8','11','6'], ans:0, hint:'奇数序列，每格+2' },
  { text:'果果，星星和月亮有规律，问号处是什么？', matrix:['⭐','🌙','⭐','🌙','⭐','🌙⭐','⭐','🌙⭐','?'], opts:['🌙⭐⭐','⭐','🌙','⭐⭐'], ans:0, hint:'每格比前一行多一个星星' },
];

const PATTERN_GROWTH_QUESTIONS = [
  { matrix: ['⭐', '⭐⭐', '⭐⭐⭐', '🔴', '🔴🔴', '🔴🔴🔴', '🟩', '🟩🟩', '?'], opts: ['🟩🟩🟩', '🟩', '🟩🟩', '⭐⭐⭐'], ans: 0, hint: '数数每行各格子里图形的数量规律：1、2、3！第三行缺几个绿方块？' },
  { matrix: ['🌸', '🌸🌸', '🌸🌸🌸', '🎈', '🎈🎈', '🎈🎈🎈', '🐱', '🐱🐱', '?'], opts: ['🐱🐱🐱', '🐱', '🐱🐱🐱🐱', '🌸'], ans: 0, hint: '第三行分别是 1 只猫、2 只猫，所以问号处应该是 3 只猫！' },
  { matrix: ['🍎', '🍎🍎', '🍎🍎🍎', '🍌', '🍌🍌', '🍌🍌🍌', '🍇', '🍇🍇', '?'], opts: ['🍇🍇🍇', '🍇', '🍇🍇', '🍒🍒🍒'], ans: 0, hint: '数一数数量：都是一、二、三！所以问号是三个葡萄。' }
];

const PATTERN_OVERLAY_QUESTIONS = [
  { matrix: ['➖', '🟰', '☰', '▲', '▲▲', '▲▲▲', '◯', '➕', '?'], opts: ['⊕（圆里有加号）', '◯', '➕', '⬛'], ans: 0, hint: '前两个形状合并/叠在一起，变成第三个形状！圆加十变成什么？' },
  { matrix: ['⬜', '⬛', '⬛', '⚪', '⚫', '⚫', '🟨', '⬜', '?'], opts: ['🟨', '⬜', '⬛', '🟧'], ans: 0, hint: '看前两个的背景色叠加！白色叠加黑色是黑色，黄色 and 白色呢？' }
];

const PATTERN_MIRROR_QUESTIONS = [
  { matrix: ['◀️', '┃', '▶️', '🟨⬜', '┃', '⬜🟨', '🔴⬜', '┃', '?'], opts: ['⬜🔴', '🔴⬜', '🔴🔴', '⬜⬜'], ans: 0, hint: '以中间的┃线为镜子！红球在左边，照镜子后应该出现在哪边？' },
  { matrix: ['⬆️', '━', '⬇️', '📈', '━', '📉', '↗️', '━', '?'], opts: ['↘️', '↖️', '↗️', '⬇️'], ans: 0, hint: '以上下━线为镜子上下翻转！往右上角的箭头翻转后朝哪边？' }
];

const PATTERN_ROTATION_QUESTIONS = [
  { matrix: ['⬆️', '➡️', '⬇️', '↗️', '↘️', '↙️', '⬅️', '⬆️', '?'], opts: ['➡️', '⬇️', '⬅️', '⬆️'], ans: 0, hint: '顺时针转动90°！第三行左箭头转90°指向哪个方向？' },
  { matrix: ['🕛12点', '🕒3点', '🕕6点', '🕒3点', '🕕6点', '🕘9点', '🕕6点', '🕘9点', '?'], opts: ['🕛12点', '🕒3点', '🕕6点', '🕘9点'], ans: 0, hint: '时钟指针顺时针每次转 90°（走3个小时）！9点再加三小时到几点？' }
];

function checkPatternAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "图形规律找对了！果果的推理能力超级厉害！");
  } else {
    speakText("再仔细看看规律，试试别的答案！");
    showWrongToast();
  }
}

function launchPattern(level, container) {
  const phase = Math.ceil(level / 10);
  let q = null;

  if (phase === 1) {
    q = PATTERN_QUESTIONS[(level - 1) % PATTERN_QUESTIONS.length];
  } else if (phase === 2) {
    q = PATTERN_GROWTH_QUESTIONS[(level - 11) % PATTERN_GROWTH_QUESTIONS.length];
  } else if (phase === 3) {
    q = PATTERN_OVERLAY_QUESTIONS[(level - 21) % PATTERN_OVERLAY_QUESTIONS.length];
  } else if (phase === 4) {
    q = PATTERN_MIRROR_QUESTIONS[(level - 31) % PATTERN_MIRROR_QUESTIONS.length];
  } else {
    q = PATTERN_ROTATION_QUESTIONS[(level - 41) % PATTERN_ROTATION_QUESTIONS.length];
  }

  currentPatternAnswer = q.ans.toString();
  const questionText = q.text || '果果，观察图形变化规律，找出右下角问号处应该填哪个？';

  // Shuffling options
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(251,191,36,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#fbbf24;font-weight:800;margin:0;">🎨 图形矩阵推理 — 第 ${level}/50 关</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:20px;">🦁 找出规律，选出问号处正确的答案：</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:320px;margin:0 auto 25px;">
        ${q.matrix.map((cell, i) => `
          <div class="glass-card" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;font-size:${cell.length > 4 ? '0.9em' : '1.5em'};min-height:60px;display:flex;align-items:center;justify-content:center;${i===8?'border:2px dashed #fbbf24;color:#fbbf24;font-weight:800;':''}">
            ${i===8 ? '❓' : cell}
          </div>
        `).join('')}
      </div>
      <p style="font-size:0.8em;color:#64748b;margin-bottom:15px;">💡 ${q.hint}</p>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:360px;margin:0 auto;">
        ${shuffled.map((item, idx) => `
          <button class="mock-button glow-dabao" onclick="checkPatternAnswer(${item.i},${q.ans})" style="font-size:${item.o.length>4?'0.85em':'1.2em'};padding:12px;border-radius:10px;min-height:55px;">
            ${item.o}
          </button>
        `).join('')}
      </div>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
    </div>
  `;
  setTimeout(() => speakText(questionText), 300);
}


// ==================== 🧠 维度6：短时记忆复现（5种题型交替）====================

const MEMORY_QUESTIONS = [
  { show:['🍎','🐱','🌟'], q:'记住这三样东西，按顺序说出来', type:'seq3' },
  { show:['🔴','🔵','🟡','🟢'], q:'记住这四个颜色泡泡的顺序', type:'seq4' },
  { show:['1','5','3'], q:'记住这三个数字，按顺序选出来', type:'num3' },
  { show:['🐘','🦁','🐯','🐶'], q:'记住这四只小动物出现的顺序', type:'seq4' },
  { show:['⭐','🌙','☀️','🌈'], q:'记住这四个天空图案 the 顺序', type:'seq4' },
  { show:['2','7','4','9'], q:'记住这四个数字，按顺序选出来', type:'num4' },
  { show:['🍊','🍋','🍇','🍓','🍑'], q:'记住这五种水果的出现顺序', type:'seq5' },
  { show:['🏠','🚗','✈️','🚢'], q:'记住这四种交通/建筑的顺序', type:'seq4' },
  { show:['3','1','8','5','2'], q:'记住这五个数字，按顺序选出来', type:'num5' },
  { show:['🎈','🎁','🎂','🎊','🎉'], q:'记住这五个节日图案 the 顺序', type:'seq5' },
];

const MEMORY_COIN_LEVELS = [
  { coins: [0, 4, 8], name: '3个金币' },
  { coins: [1, 3, 7], name: '3个金币' },
  { coins: [2, 4, 6], name: '3个金币' },
  { coins: [0, 2, 8], name: '3个金币' },
  { coins: [3, 4, 5], name: '3个金币' },
  { coins: [1, 4, 7], name: '3个金币' }
];

const MEMORY_PAIR_TEMPLATES = [
  { items: ['🍎 苹果', '🍌 香蕉', '🍒 樱桃', '🍇 葡萄'], q: '🍇 葡萄' },
  { items: ['🐶 小狗', '🐱 小猫', '🦊 狐狸', '🦁 狮子'], q: '🦊 狐狸' },
  { items: ['🚗 汽车', '✈️ 飞机', '🚢 轮船', '🚀 火箭'], q: '🚀 火箭' },
  { items: ['⭐ 星星', '🌙 月亮', '☀️ 太阳', '🌈 彩虹'], q: '🌙 月亮' }
];

const MEMORY_MISSING_QUESTIONS = [
  { show: ['🐶','🐱','🐰','🦊'], recall: ['🐶','🐰','🦊'], ans: '🐱', opts: ['🐱 猫咪', '🦁 狮子', '🐼 熊猫'], qText: '刚才哪个小动物藏起来不见了？' },
  { show: ['🍎','🍌','🍇','🍒'], recall: ['🍎','🍌','🍇'], ans: '🍒', opts: ['🍒 樱桃', '🍍 菠萝', '🍑 桃子'], qText: '刚才哪个美味水果藏起来不见了？' },
  { show: ['🚗','✈️','🚢','🚀'], recall: ['🚗','🚢','🚀'], ans: '✈️', opts: ['✈️ 飞机', '🚲 自行车', '🚊 火车'], qText: '刚才哪个交通工具藏起来不见了？' },
  { show: ['🎈','🎁','🎂','🍬'], recall: ['🎈','🎂','🍬'], ans: '🎁', opts: ['🎁 礼物', '🍭 棒棒糖', '🍩 甜甜圈'], qText: '刚才哪个派对物品藏起来不见了？' }
];

const MEMORY_BACKWARD_QUESTIONS = [
  { show: [3, 8, 5], ans: [5, 8, 3] },
  { show: [4, 9, 2], ans: [2, 9, 4] },
  { show: [1, 7, 6], ans: [6, 7, 1] },
  { show: [5, 3, 9], ans: [9, 3, 5] },
  { show: [8, 2, 4], ans: [4, 2, 8] }
];

function checkMemoryChoice(selected, correct, feedback = "短时记忆答对了！果果记忆力真棒！") {
  if (selected === correct) {
    trigger6yoVictory(10, feedback);
  } else {
    speakText("再回忆回忆，想一想再选！");
    showWrongToast();
  }
}

let coinsToFind = [];
let coinsFound = [];

function clickCoinCell(idx) {
  if (coinsToFind.includes(idx)) {
    if (!coinsFound.includes(idx)) {
      coinsFound.push(idx);
      const btn = document.getElementById(`coin-cell-${idx}`);
      btn.innerHTML = '🪙';
      btn.style.background = 'rgba(16, 185, 129, 0.4)';
      btn.style.borderColor = '#10b981';
      
      if (coinsFound.length === coinsToFind.length) {
        setTimeout(() => {
          trigger6yoVictory(10, "太厉害了！果果把藏起来的金币全都找到了！超强记忆！");
        }, 300);
      }
    }
  } else {
    speakText("这里没有金币哦，再想想！");
    const btn = document.getElementById(`coin-cell-${idx}`);
    btn.style.background = 'rgba(239, 68, 68, 0.3)';
    setTimeout(() => { btn.style.background = ''; }, 400);
  }
}

let backwardCurrentIdx = 0;
let backwardExpected = [];

function clickBackwardRecall(num) {
  if (num === backwardExpected[backwardCurrentIdx]) {
    const slot = document.getElementById(`back-slot-${backwardCurrentIdx}`);
    if (slot) {
      slot.innerText = num;
      slot.style.borderColor = '#10b981';
      slot.style.background = 'rgba(16,185,129,0.1)';
    }
    backwardCurrentIdx++;
    if (backwardCurrentIdx >= backwardExpected.length) {
      setTimeout(() => {
        trigger6yoVictory(10, "哇！倒背也能完全记对！果果的记忆力和专注力满分！");
      }, 300);
    }
  } else {
    speakText("不对哦，倒过来背，想想最后一个数是哪个？");
    showWrongToast();
  }
}

let memoryPhase = 'show'; // 'show' | 'recall'
let memoryExpected = [];
let memoryCurrentIdx = 0;

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

function launchMemory(level, container) {
  const phase = Math.ceil(level / 10);
  let questionText = '';

  if (phase === 1) {
    // 序列闪现记忆
    const q = MEMORY_QUESTIONS[(level - 1) % MEMORY_QUESTIONS.length];
    currentMemorySequence = q.show;
    memoryPhase = 'show';
    memoryExpected = [...q.show];
    memoryCurrentIdx = 0;
    questionText = q.q;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">🧠 短时记忆·闪现复现 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 仔细记住下面这些图案的顺序，${q.show.length}秒后会消失哦！</p>
        <div id="memory-display" style="display:flex;justify-content:center;gap:15px;margin:25px 0;flex-wrap:wrap;">
          ${q.show.map(s => `<div class="glass-card" style="font-size:2.5em;border:2px solid rgba(255,255,255,0.15);width:70px;height:70px;display:flex;align-items:center;justify-content:center;">${s}</div>`).join('')}
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
  else if (phase === 2) {
    // 藏金币网格记忆
    const q = MEMORY_COIN_LEVELS[(level - 11) % MEMORY_COIN_LEVELS.length];
    coinsToFind = q.coins;
    coinsFound = [];
    questionText = `果果，记住金币躲在哪些格子里！马上要盖上木板喽！`;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">🪙 短时记忆·藏金币 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 仔细盯住闪闪发光的金币位置，马上就要盖上它：</p>
        
        <div id="coin-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px auto;max-width:240px;">
          ${Array.from({length:9}).map((_, idx) => `
            <div id="coin-cell-${idx}" style="height:70px;border-radius:12px;background:${q.coins.includes(idx)?'rgba(251,191,36,0.2)':'rgba(255,255,255,0.04)'};border:2px solid ${q.coins.includes(idx)?'#fbbf24':'rgba(255,255,255,0.08)'};display:flex;align-items:center;justify-content:center;font-size:2em;">
              ${q.coins.includes(idx)?'🪙':''}
            </div>
          `).join('')}
        </div>
        <div id="coin-countdown" style="font-size:1.05em;color:#fbbf24;font-weight:700;animation:blinker 1s infinite;">👀 正在记忆，3 秒后覆盖...</div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;

    speakText(questionText);

    setTimeout(() => {
      const cdEl = document.getElementById('coin-countdown');
      if (cdEl) cdEl.innerText = '🙈 已经盖上啦！请点击找出刚才那三个藏着金币的格子：';
      
      Array.from({length:9}).forEach((_, idx) => {
        const cell = document.getElementById(`coin-cell-${idx}`);
        if (cell) {
          cell.innerHTML = '❓';
          cell.style.background = 'rgba(255,255,255,0.06)';
          cell.style.borderColor = 'rgba(255,255,255,0.1)';
          cell.style.cursor = 'pointer';
          cell.setAttribute('onclick', `clickCoinCell(${idx})`);
        }
      });
    }, 3000);
  }
  else if (phase === 3) {
    // 颜色位置配对记忆
    const q = MEMORY_PAIR_TEMPLATES[(level - 21) % MEMORY_PAIR_TEMPLATES.length];
    questionText = `果果，记住这四样东西的摆放位置哦！一会要考考你！`;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">📦 短时记忆·位置绑定 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 仔细看清楚，四个各自是什么，在哪个角落：</p>
        
        <div id="pair-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px auto;max-width:220px;">
          ${q.items.map((item, idx) => `
            <div id="pair-cell-${idx}" class="glass-card" style="height:85px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1.15em;font-weight:bold;border-color:rgba(255,255,255,0.1);padding:0;">
              ${item}
            </div>
          `).join('')}
        </div>
        <div id="pair-countdown" style="font-size:1.05em;color:#f472b6;font-weight:700;">👀 真实记忆中，3 秒后隐藏...</div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;

    speakText(questionText);

    setTimeout(() => {
      const qText = `果果，刚才的【${q.q}】是在哪个格子里呢？请点出来！`;
      speakText(qText);
      
      const cdEl = document.getElementById('pair-countdown');
      if (cdEl) cdEl.innerText = `🎯 提问：刚才的【${q.q}】在哪？`;

      const correctIdx = q.items.indexOf(q.q);

      q.items.forEach((item, idx) => {
        const cell = document.getElementById(`pair-cell-${idx}`);
        if (cell) {
          cell.innerHTML = '❓';
          cell.style.fontSize = '2em';
          cell.style.cursor = 'pointer';
          cell.setAttribute('onclick', `checkMemoryChoice(${idx}, ${correctIdx}, '太牛了！果果完美记住了它的位置！太棒了！')`);
        }
      });
    }, 3000);
  }
  else if (phase === 4) {
    // 消失的那个是什么
    const q = MEMORY_MISSING_QUESTIONS[(level - 31) % MEMORY_MISSING_QUESTIONS.length];
    questionText = `果果，仔细看这几个图案，一会会有一个小调皮藏起来！`;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">🙈 短时记忆·谁不见了 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 仔细盯着看，记住它们所有人：</p>
        <div id="missing-display" style="display:flex;justify-content:center;gap:15px;margin:20px 0;flex-wrap:wrap;">
          ${q.show.map(s => `<div class="glass-card" style="font-size:2.8em;width:65px;height:65px;display:flex;align-items:center;justify-content:center;border-color:rgba(255,255,255,0.12);">${s}</div>`).join('')}
        </div>
        <div id="missing-countdown" style="font-size:1.05em;color:#f472b6;font-weight:700;">👀 请盯住！3 秒后有人会藏起来...</div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;

    speakText(questionText);

    setTimeout(() => {
      const askText = `哎呀，有一个小家伙逃跑了！${q.qText}`;
      speakText(askText);
      
      const cdEl = document.getElementById('missing-countdown');
      if (cdEl) cdEl.innerText = `🎯 提问：谁不见了？`;

      const disp = document.getElementById('missing-display');
      if (disp) {
        disp.innerHTML = q.recall.map(s => `<div class="glass-card" style="font-size:2.8em;width:65px;height:65px;display:flex;align-items:center;justify-content:center;border-color:rgba(255,255,255,0.12);">${s}</div>`).join('');
      }

      const allOpts = [...q.opts];
      const correctIdx = allOpts.findIndex(x => x.includes(q.ans));

      const optContainer = document.createElement('div');
      optContainer.style.cssText = 'display:flex;justify-content:center;gap:12px;margin-top:20px;';
      optContainer.innerHTML = allOpts.map((opt, idx) => `
        <button class="mock-button glow-dabao" onclick="checkMemoryChoice(${idx}, ${correctIdx}, '没错！正是它逃跑了，果果成功识破！太棒了！')" style="font-size:1.05em;padding:12px 20px;border-radius:12px;font-weight:700;">${opt}</button>
      `).join('');
      
      disp.after(optContainer);
    }, 3000);
  }
  else {
    // 数字倒背
    const q = MEMORY_BACKWARD_QUESTIONS[(level - 41) % MEMORY_BACKWARD_QUESTIONS.length];
    backwardExpected = q.ans;
    backwardCurrentIdx = 0;
    questionText = `果果，记住这三个数字，然后要【倒过来】背给机器人听哦！`;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">⏪ 短时记忆·数字倒背 — 第 ${level}/50 关</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 仔细看清数字的队形：</p>
        <div id="backward-display" style="display:flex;justify-content:center;gap:15px;margin:20px 0;">
          ${q.show.map(s => `<div class="glass-card" style="font-size:2.2em;width:60px;height:60px;display:flex;align-items:center;justify-content:center;font-weight:800;border-color:rgba(255,255,255,0.15);background:rgba(255,255,255,0.03);">${s}</div>`).join('')}
        </div>
        <div id="backward-countdown" style="font-size:1.05em;color:#f472b6;font-weight:700;">👀 记忆中，3 秒后隐藏...</div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;

    speakText(questionText);

    setTimeout(() => {
      const askText = '好啦，倒过来！请按【倒序】依次点击刚才的数字！';
      speakText(askText);

      const cdEl = document.getElementById('backward-countdown');
      if (cdEl) cdEl.innerText = '🙈 请按【相反顺序】点击数字：';

      const disp = document.getElementById('backward-display');
      if (disp) {
        disp.innerHTML = q.show.map((_, idx) => `<div id="back-slot-${idx}" class="glass-card" style="font-size:2.2em;width:60px;height:60px;display:flex;align-items:center;justify-content:center;font-weight:800;border-color:dashed rgba(255,255,255,0.2);color:#fbbf24;">❓</div>`).join('');
      }

      // Keyboard
      const kb = document.createElement('div');
      kb.style.cssText = 'display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:20px;';
      kb.innerHTML = [1,2,3,4,5,6,7,8,9].map(n => `
        <button class="mock-button glow-dabao" onclick="clickBackwardRecall(${n})" style="font-size:1.25em;width:48px;height:48px;border-radius:50%;">${n}</button>
      `).join('');
      disp.after(kb);
    }, 3000);
  }
}


// ==================== 📚 维度7：言语理解分类（5种题型交替）====================

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

const LANGUAGE_OPPOSITE_QUESTIONS = [
  { text: '果果，【热】的反义词是【冷】，那么【多】的反义词是什么呢？', opts: ['少', '小', '矮', '短'], ans: 0, hint: '糖果多多的，吃掉一大半就变少少啦。' },
  { text: '果果，【白天】的反义词是【黑夜】，那么【上方】的反义词是什么呢？', opts: ['下方', '左边', '右边', '里面'], ans: 0, hint: '头顶是上方，脚底下踩着的是下方。' },
  { text: '果果，【开心】的反义词是【难过】，那么【大】的反义词是什么呢？', opts: ['小', '窄', '低', '短'], ans: 0, hint: '大西瓜是大，红草莓是小。' },
  { text: '果果，【快】的反义词是【慢】，那么【高】的反义词是什么呢？', opts: ['矮', '低', '瘦', '短'], ans: 0, hint: '高耸的长颈鹿，矮矮的小灰兔。' },
  { text: '果果，【长】的反义词是【短】，那么【宽】的反义词是什么呢？', opts: ['窄', '厚', '细', '小'], ans: 0, hint: '宽宽的大马路，窄窄的小胡同。' }
];

const LANGUAGE_SUMMARY_QUESTIONS = [
  { text: '果果，苹果、香蕉、草莓和葡萄，它们都属于什么呢？', opts: ['🍎 水果', '🥕 蔬菜', '🧸 玩具', '👚 衣服'], ans: 0, hint: '这些都是甜甜的、长在树上或藤上的水果。' },
  { text: '果果，小汽车、大飞机、大轮船和火车，它们都属于什么呢？', opts: ['🚀 交通工具', '🛋️ 家用家具', '🥦 绿色蔬菜', '🎸 乐器'], ans: 0, hint: '它们能带我们去很远的地方，属于交通出行工具。' },
  { text: '果果，吉他、钢琴、竖笛和架子鼓，它们都属于什么呢？', opts: ['🎵 乐器', '📚 学习用品', '⚽ 体育器材', '🍕 各种美食'], ans: 0, hint: '它们能奏出美妙动听的旋律，统称为乐器。' },
  { text: '果果，铅笔、橡皮擦、尺子和故事书，它们都属于什么呢？', opts: ['📚 学习文具', '👗 儿童衣服', '🚗 遥控汽车', '🌳 大树'], ans: 0, hint: '这些都是果果学习和读书时会用到的文具用品。' }
];

const LANGUAGE_RIDDLE_QUESTIONS = [
  { text: '💡 猜谜语：身穿绿衣服，肚里红汁水，生着黑瓜子，甜甜水分足。这是什么美味的水果？', opts: ['🍉 西瓜', '🍎 苹果', '🍌 香蕉', '🍓 草莓'], ans: 0, hint: '这是夏天最爱吃的大西瓜，有绿皮和红瓤。' },
  { text: '💡 猜谜语：耳朵长，尾巴短，只吃萝卜不吃肉，蹦蹦跳跳真可爱。这是什么小动物？', opts: ['🐰 小兔子', '🐱 小猫咪', '🐶 小花狗', '🦊 小狐狸'], ans: 0, hint: '红眼睛、长耳朵，跑起来一蹦一跳的小白兔。' },
  { text: '💡 猜谜语：圆圆脑袋大眼睛，没有脚丫也能行，一天到晚水里游，闭上眼睛也能睡。这是什么小动物？', opts: ['🐟 小鱼', '🦆 小鸭子', '🐸 青蛙', '🦀 小螃蟹'], ans: 0, hint: '它生活在小河或鱼缸里，摇着尾巴游泳。' },
  { text: '💡 猜谜语：一朵花朵真奇怪，没有叶子空中开，下雨时候它出来，太阳公公出来它就合上。这是什么生活用品？', opts: ['☂️ 雨伞', '🧢 帽子', '👓 眼镜', '🧣 围巾'], ans: 0, hint: '下雨天我们出门时，要把它撑在头顶上。' }
];

const LANGUAGE_MANNERS_QUESTIONS = [
  { text: '果果在幼儿园跟小朋友玩耍时，不小心把别的小朋友的城堡积木碰倒了，果果应该说什么？', opts: ['🤝 对不起，我不是故意的！', '😆 哈哈，太好玩了！', '🤐 假装没看见走开', '🍉 刚才不是我弄的'], ans: 0, hint: '做错事或者打扰到别人时，一定要真诚、有礼貌地说对不起。' },
  { text: '收到爷爷奶奶送的超级好看的生日礼物时，果果应该跟爷爷奶奶说什么？', opts: ['❤️ 谢谢爷爷奶奶！我很喜欢！', '🙄 怎么不是奥特曼玩具？', '🤐 一句话也不说拿走', '😭 呜呜大哭起来'], ans: 0, hint: '收到长辈的心意和礼物，一定要礼貌地表达感谢。' },
  { text: '早晨起床看见爸爸妈妈，或者去幼儿园见到老师时，果果应该说什么？', opts: ['☀️ 早上好！', '👋 再见啦！', '🤐 假装不认识', '🤔 你是谁？'], ans: 0, hint: '新的一天开始，见到家人和老师要主动打招呼问好。' },
  { text: '果果想请别人帮忙把高处的玩具拿下来时，应该用哪个礼貌的词语开头？', opts: ['🙏 麻烦您，请问可以帮我拿一下吗？', '👉 喂！快给我拿下来！', '🙄 我自己够，不用你管', '🔨 直接抢过来'], ans: 0, hint: '请求别人帮助时，用【请问】和【麻烦您】会让人很乐意帮忙。' }
];

function checkLanguageAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "答对了！果果的语言理解能力真棒！");
  } else {
    speakText("再想想，换个答案试试！");
    showWrongToast();
  }
}

function launchLanguage(level, container) {
  const phase = Math.ceil(level / 10);
  let q = null;

  if (phase === 1) {
    q = LANGUAGE_QUESTIONS[(level - 1) % LANGUAGE_QUESTIONS.length];
  } else if (phase === 2) {
    q = LANGUAGE_OPPOSITE_QUESTIONS[(level - 11) % LANGUAGE_OPPOSITE_QUESTIONS.length];
  } else if (phase === 3) {
    q = LANGUAGE_SUMMARY_QUESTIONS[(level - 21) % LANGUAGE_SUMMARY_QUESTIONS.length];
  } else if (phase === 4) {
    q = LANGUAGE_RIDDLE_QUESTIONS[(level - 31) % LANGUAGE_RIDDLE_QUESTIONS.length];
  } else {
    q = LANGUAGE_MANNERS_QUESTIONS[(level - 41) % LANGUAGE_MANNERS_QUESTIONS.length];
  }

  currentLanguageAnswer = q.ans.toString();
  const questionText = q.text;

  // Shuffling options
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(34,211,238,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#22d3ee;font-weight:800;margin:0;">📚 言语理解与表达 — 第 ${level}/50 关</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${q.text.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <div class="glass-card" style="padding:20px;margin:20px 0;background:rgba(34,211,238,0.05);border-color:rgba(34,211,238,0.2);">
        <p style="font-size:1.1em;color:#fff;font-weight:700;line-height:1.5;margin:0;">${q.text}</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:440px;margin:0 auto;">
        ${shuffled.map(item => `
          <button class="mock-button glow-dabao" onclick="checkLanguageAnswer(${item.i},${q.ans})" style="font-size:1em;padding:15px;border-radius:12px;font-weight:700;line-height:1.4;text-align:left;">
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


// ==================== 🔗 维度8：类比推理（5种题型交替）====================

const ANALOGY_QUESTIONS = [
  { text:'🐣 鸡蛋 → 🐔 鸡，那么 🥚 蛙卵 → ？', opts:['🐟鱼','🐸青蛙','🦎蜥蜴','🐢乌龟'], ans:1, hint:'鸡蛋孵出鸡，蛙卵孵出什么？' },
  { text:'🌱 种子 → 🌳 大树，那么 🥚 鸡蛋 → ？', opts:['🐔鸡','🍳煎蛋','🪺鸟窝','🐣小鸡'], ans:3, hint:'种子长大变成大树，鸡蛋孵化成什么？' },
  { text:'👶 宝宝 → 👨 大人，那么 🐣 小鸡 → ？', opts:['🥚鸡蛋','🐔大母鸡','🪺鸟窝','🐦小鸟'], ans:1, hint:'宝宝长大变成大人，小鸡长大变成什么？' },
  { text:'🐛 毛毛虫 → 🦋 蝴蝶，那么 🐸 蝌蚪 → ？', opts:['🐟鱼','🦎蜥蜴','🐸青蛙','🐊鳄鱼'], ans:2, hint:'毛毛虫变成蝴蝶，蝌蚪长大变成什么？' },
  { text:'🐕 狗 → 🦴 骨头，那么 🐱 猫 → ？', opts:['🍖肉','🐟鱼','🥛牛奶','🍚米饭'], ans:1, hint:'狗最爱吃骨头，猫最爱吃什么？' },
  { text:'✏️ 铅笔 → 📝 写字，那么 🎨 画笔 → ？', opts:['🖼️画画','✂️剪纸','📚看书','🎵唱歌'], ans:0, hint:'铅笔用来写字，画笔用来干什么？' },
  { text:'🌙 月亮 → 🌃 夜晚，那么 ☀️ 太阳 → ？', opts:['🌃夜晚','🌅早晨','🌆傍晚','🌌宇宙'], ans:1, hint:'月亮在夜晚出来，太阳在什么时候出来？' },
  { text:'🐟 鱼 → 🌊 水里，那么 🐦 鸟 → ？', opts:['🌊水里','🌳树上','🏠家里','🌤️天空'], ans:3, hint:'鱼生活在水里，鸟生活在哪里？' },
  { text:'眼镜 ➡️ 👁️ 眼睛，那么 🎧 耳机 ➡️ ？', opts:['👁️眼睛','👂耳朵','👃鼻子','👄嘴巴'], ans:1, hint:'眼镜是戴在眼睛上的，耳机是戴在哪里的？' },
  { text:'🏊 游泳 ➡️ 🌊 水，那么 🏂 滑雪 ➡️ ？', opts:['🌊水','☁️云','❄️雪','🌳树'], ans:2, hint:'游泳需要水，滑雪需要什么？' },
  { text:'🍎 苹果 ➡️ 🌳 苹果树，那么 🍊 橙子 ➡️ ？', opts:['🌲松树','🌴椰子树','🌳橙子树','🌵仙人掌'], ans:2, hint:'苹果长在苹果树上，橙子长在什么树上？' },
  { text:'🔥 火 ➡️ 🌡️ 热，那么 ❄️ 冰 ➡️ ？', opts:['🌡️热','💧湿','🥶冷','💨风'], ans:2, hint:'火让人感到热，冰让人感到什么？' },
  { text:'🎹 钢琴 ➡️ 🎵 音乐，那么 🖌️ 画笔 ➡️ ？', opts:['🎵音乐','🖼️画作','📚书本','🎭戏剧'], ans:1, hint:'钢琴用来演奏音乐，画笔用来创作什么？' },
  { text:'🦁 狮子 ➡️ 🌾 草原，那么 🐳 鲸鱼 ➡️ ？', opts:['🌾草原','🏔️高山','🌊大海','🌲森林'], ans:2, hint:'狮子生活在草原，鲸鱼生活在哪里？' },
  { text:'📖 书 ➡️ 📚 图书馆，那么 💊 药 ➡️ ？', opts:['📚图书馆','🏥医院','🏪超市','🏫学校'], ans:1, hint:'书放在图书馆，药放在哪里取？' },
  { text:'🐜 蚂蚁 ➡️ 小，那么 🦒 长颈鹿 ➡️ ？', opts:['快','慢','高','矮'], ans:2, hint:'蚂蚁很小，长颈鹿脖子很长，整体很...' },
  { text:'⚽ 足球 ➡️ 🦵 脚踢，那么 🏀 篮球 ➡️ ？', opts:['🦵脚踢','🤲手投','🦷牙咬','👁️眼看'], ans:1, hint:'足球用脚踢，篮球用什么投？' },
  { text:'🎂 蛋糕 ➡️ 🎂生日，那么 🎁 礼物 ➡️ ？', opts:['🎂生日','🎁礼物','🎊庆祝','😊开心'], ans:2, hint:'蛋糕代表生日，礼物代表什么？' },
  { text:'🌧️ 下雨 ➡️ ☂️ 雨伞，那么 ☀️ 晒太阳 ➡️ ？', opts:['☂️雨伞','🕶️墨镜','🧣围巾','🧤手套'], ans:1, hint:'下雨要用雨伞，晒太阳要用什么保护眼睛？' },
  { text:'🏃 跑步 ➡️ 🦵 腿，那么 🤸 翻跟头 ➡️ ？', opts:['🦵腿','🤲双手','👁️眼睛','👂耳朵'], ans:1, hint:'跑步主要用腿，翻跟头主要用什么支撑？' },
];

const ANALOGY_TOOL_QUESTIONS = [
  { text: '👩&zwj;⚕️ 医生 ➡️ 🩺 听诊器，那么 🧑&zwj;🏫 老师 ➡️ ？', opts: ['🖍️ 粉笔和黑板', '🪚 锋利的铁锯', '🧱 建筑红砖', '🍳 炒菜铁锅'], ans: 0, hint: '医生看病用听诊器工作，老师讲课用什么教学呢？' },
  { text: '👩&zwj;🍳 厨师 ➡️ 🍳 炒菜锅，那么 👩&zwj;🚒 消防员 ➡️ ？', opts: ['🚒 消防高压水枪', '🎒 幼儿园书包', '🎸 红色木吉他', '✂️ 手工剪刀'], ans: 0, hint: '厨师在厨房做菜用炒锅，消防员灭火用什么？' },
  { text: '👨&zwj;🎨 画家 ➡️ 🖌️ 调色画笔，那么 👨&zwj;🌾 农民叔叔 ➡️ ？', opts: ['🌾 锄头/铁锹', '🎤 麦克风', '🩺 针筒', '💻 办公电脑'], ans: 0, hint: '画家用画笔画画，农民在田里干活要用什么？' },
  { text: '🪵 木匠 ➡️ 🪚 锯子，那么 💇 理发师 ➡️ ？', opts: ['✂️ 理发剪刀', '🥞 平底锅', '🏗️ 起重机', '🚗 小汽车'], ans: 0, hint: '木匠做家具用锯子锯木头，理发师理发用什么？' }
];

const ANALOGY_PART_QUESTIONS = [
  { text: '🌳 茂密大树 ➡️ 🍃 绿色树叶，那么 🚗 飞驰汽车 ➡️ ？', opts: ['🛞 黑色车轮', '✈️ 飞行翅膀', '🚲 双脚踏板', '🚂 钢铁铁轨'], ans: 0, hint: '大树身上长着树叶，汽车身上装有什么关键的零件？' },
  { text: '🧑 可爱的人 ➡️ 🖐️ 灵活手掌，那么 🐦 飞翔小鸟 ➡️ ？', opts: ['🪶 飞翔翅膀', '🐠 游泳鱼鳍', '🐢 坚硬龟壳', '🐘 白粗象牙'], ans: 0, hint: '人有两只手掌，鸟儿身上有帮助它飞行的什么？' },
  { text: '🏠 温暖房子 ➡️ 🚪 安全大门，那么 💻 电脑 ➡️ ？', opts: ['⌨️ 键盘/屏幕', '👕 衣服', '🎒 书包', '🍎 苹果'], ans: 0, hint: '大门是房子的一部分，什么是电脑的一部分？' },
  { text: '🐟 游动小鱼 ➡️ 🐠 扁平鱼鳍，那么 🐱 猫咪 ➡️ ？', opts: ['🐾 猫咪爪子', '🪶 鸟儿翅膀', '🐚 蜗牛壳', '🌾 绿草'], ans: 0, hint: '鱼用鱼鳍控制方向，小猫咪用什么在地上奔跑？' }
];

const ANALOGY_MATERIAL_QUESTIONS = [
  { text: '🌾 金黄小麦 ➡️ 🍞 喷香面包，那么 🥛 纯净牛奶 ➡️ ？', opts: ['🧀 香甜奶酪/酸奶', '🍚 大米饭', '🍎 红苹果', '🥩 烤牛肉'], ans: 0, hint: '小麦磨成粉能烤面包，牛奶可以做成什么奶制品？' },
  { text: '🌳 粗粗木头 ➡️ 🪑 舒适椅子，那么 🧱 粘稠泥土 ➡️ ？', opts: ['🏺 精美陶罐/砖头', '👕 漂亮衣服', '🚗 红色汽车', '💡 闪亮电灯'], ans: 0, hint: '木头可以雕刻成木椅，泥土捏好烧制后变成什么？' },
  { text: '🐑 绵羊白毛 ➡️ 🧣 温暖围巾，那么 🍇 甜紫葡萄 ➡️ ？', opts: ['🍷 甜甜葡萄汁/酒', '🍚 白米饭', '🍞 全麦面包', '🍬 水果糖'], ans: 0, hint: '羊毛可以织出围巾，葡萄榨汁可以得到什么？' },
  { text: '🎈 柔软橡胶 ➡️ 🎈 彩色气球，那么 🪙 坚硬钢铁 ➡️ ？', opts: ['🪓 砍树铁斧头', '🍦 冰凉香草冰淇淋', '📄 答题白纸', '👕 羊毛衫'], ans: 0, hint: '橡胶是软的，用来吹气球；坚硬的钢铁可以制造什么铁器？' }
];

const ANALOGY_VISUAL_QUESTIONS = [
  { text: '⚪ 白色圆形 ➡️ ⚫ 黑色圆形，那么 ⬜ 白色正方形 ➡️ ？', opts: ['⬛ 黑色正方形', '🔺 红色三角形', '🔵 蓝色圆形', '⬜ 白色长方形'], ans: 0, hint: '颜色由白变黑了，但形状完全没有改变哦！' },
  { text: '▲ 向上三角形 ➡️ ▼ 向下三角形，那么 ➡️ 向右箭头 ➡️ ？', opts: ['⬅️ 向左箭头', '⬆️ 向上箭头', '⬇️ 向下箭头', '↗️ 右上箭头'], ans: 0, hint: '方向调转了 180° 完全相反了！向右倒过来是谁？' },
  { text: '🟥 红色正方形 ➡️ 🔺 红色三角形，那么 🟦 蓝色正方形 ➡️ ？', opts: ['🔷 蓝色菱形/三角', '🟥 红色正方形', '🟡 黄色圆形', '🟢 绿色五角星'], ans: 0, hint: '颜色保持蓝色不变，四边形变成了三角形。' },
  { text: '🐱 猫咪 ➡️ 🐾 猫爪印，那么 🦆 小鸭子 ➡️ ？', opts: ['👣 枫叶形鸭掌印', '🐾 猫爪印', '🪶 细鸟羽毛', '🥚 鸭蛋'], ans: 0, hint: '猫走过留下爪印，鸭子走过留下像什么一样的脚印？' }
];

function checkAnalogyAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "类比推理答对了！果果的逻辑太厉害了！");
  } else {
    speakText("再想想它们的关系，换个答案试试！");
    showWrongToast();
  }
}

function launchAnalogy(level, container) {
  const phase = Math.ceil(level / 10);
  let q = null;

  if (phase === 1) {
    q = ANALOGY_QUESTIONS[(level - 1) % ANALOGY_QUESTIONS.length];
  } else if (phase === 2) {
    q = ANALOGY_TOOL_QUESTIONS[(level - 11) % ANALOGY_TOOL_QUESTIONS.length];
  } else if (phase === 3) {
    q = ANALOGY_PART_QUESTIONS[(level - 21) % ANALOGY_PART_QUESTIONS.length];
  } else if (phase === 4) {
    q = ANALOGY_MATERIAL_QUESTIONS[(level - 31) % ANALOGY_MATERIAL_QUESTIONS.length];
  } else {
    q = ANALOGY_VISUAL_QUESTIONS[(level - 41) % ANALOGY_VISUAL_QUESTIONS.length];
  }

  currentAnalogyAnswer = q.ans.toString();
  const questionText = q.text;

  // Shuffling options
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(167,139,250,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#c4b5fd;font-weight:800;margin:0;">🔗 关联类比推理 — 第 ${level}/50 关</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${q.text.replace(/['"]/g,' ')}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <div class="glass-card" style="padding:20px;margin:20px 0;background:rgba(167,139,250,0.06);border-color:rgba(167,139,250,0.2);">
        <p style="font-size:1.2em;color:#fff;font-weight:700;line-height:1.6;margin:0;">${q.text}</p>
      </div>
      <p style="font-size:0.85em;color:#64748b;margin-bottom:20px;">💡 ${q.hint}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:440px;margin:0 auto;">
        ${shuffled.map(item => `
          <button class="mock-button glow-dabao" onclick="checkAnalogyAnswer(${item.i},${q.ans})" style="font-size:1.05em;padding:15px;border-radius:12px;font-weight:700;line-height:1.4;text-align:left;">
            ${item.o}
          </button>
        `).join('')}
      </div>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
    </div>
  `;
  setTimeout(() => speakText(q.text.replace(/[→]/g, '对应')), 300);
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
