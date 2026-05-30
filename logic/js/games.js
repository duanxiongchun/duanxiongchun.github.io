/* 🧠 脑力认知研究所 - 果果「北京八中少儿班/八素班」选拔特训引擎 v3.0 */
/* 8大维度 × 50关 = 400关题库 | 基于北京八中超常班考察框架 */

let currentAnswer6yo = 0;
let currentDeductionTimeline = [];
let currentMemorySequence = [];
let currentPatternAnswer = '';
let currentLanguageAnswer = '';
let currentAnalogyAnswer = '';

function getLevelTitle(level, trackName, subName) {
  if (window.isMixedMode) {
    const mixedL = appState.players.dabao.progress.mixed || 1;
    return `${trackName}·${subName} — 综合第 ${mixedL} / 400 关 (本项第 ${level}/50 关)`;
  }
  return `${trackName}·${subName} — 第 ${level} / 50 关`;
}

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
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
  }
  
  if (window.isMixedMode) {
    player.progress.mixed = (player.progress.mixed || 1) + 1;
  } else {
    if (typeof player.progress[type] !== 'number') player.progress[type] = 1;
    player.progress[type]++;
  }
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
  setTimeout(() => {
    if (window.isMixedMode) {
      launchMixedMode();
    } else {
      launchTest(type);
    }
  }, 1300);
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
  window.isMixedMode = false;
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

// ==================== 🧱 维度1：空间图形推理 ====================

function getSpatialStack(level) {
  if (level === 1) return [{x:0,y:0,z:0},{x:0,y:0,z:1}];
  if (level === 2) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:0,z:1}];
  if (level === 3) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1}];
  if (level === 4) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:1,y:1,z:0},{x:0,y:0,z:1}];
  if (level === 5) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:1,y:1,z:0},{x:0,y:0,z:1},{x:1,y:0,z:1}];
  const baseSize = level <= 6 ? 2 : 3;
  const cubes = [];
  for (let x = 0; x < baseSize; x++) {
    for (let y = 0; y < baseSize; y++) {
      let h = 1;
      if (x===0&&y===0) h = Math.min(Math.floor(level/2)+1, 4);
      else if (x===1&&y===0) h = Math.min(Math.floor(level/3)+1, 3);
      else if (x===0&&y===1) h = Math.min(Math.floor(level/4)+1, 2);
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

function checkSpatialChoice(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "太棒了！空间推理答对啦！果果的空间感超强！");
  } else {
    speakText("再仔细看看，想一想再选！");
    showWrongToast();
  }
}

function launchSpatial(level, container) {
  // 5种题型按关卡进行穿插：1积木，2镜像，3旋转，4补全，5展开图，循环往复
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);

  if (phase === 1) {
    // 题型A：3D积木计数
    const cubes = getSpatialStack(qIdx + 1);
    currentAnswer6yo = cubes.length;
    const q = `果果，请数一数这堆立方体积木总共有多少个？被压在下面的也要数哦！`;
    const svgHTML = renderIsometricSVG(cubes);
    const min = Math.max(1, currentAnswer6yo - 3);
    const opts = Array.from({length:8}, (_,i) => min+i);
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">${getLevelTitle(level, '🧱 空间推理', '积木计数')}</h3>
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
    const q = MIRROR_QUESTIONS[qIdx];
    const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
    const correctIdx = allOpts.indexOf(q.correct);
    const questionText = `果果，左边是原图，哪一个选项是它的镜像（照镜子的样子）？`;
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">${getLevelTitle(level, '🪞 空间推理', '镜像对称')}</h3>
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
    const q = ROTATION_QUESTIONS[qIdx];
    const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
    const correctIdx = allOpts.indexOf(q.correct);
    const questionText = `果果，${q.title}`;
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">${getLevelTitle(level, '🔄 空间推理', '图形旋转')}</h3>
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
    const q = COMPLETION_QUESTIONS[qIdx];
    const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
    const correctIdx = allOpts.indexOf(q.correct);
    const questionText = `果果，${q.desc}`;
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">${getLevelTitle(level, '🧩 空间推理', '规律补全')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 ${q.desc}</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap;margin:20px 0;">
          ${q.items.map((item) => `
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
    const q = UNFOLDING_QUESTIONS[qIdx];
    const opts = q.optEmoji;
    const questionText = `果果，${q.title}`;
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">${getLevelTitle(level, '📦 空间推理', '立体想象')}</h3>
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

// ==================== 🧮 维度2：数字规律 ====================

function launchNumeric(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let questionText = '';
  
  if (phase === 1 || phase === 2) {
    const q = getDynamicNumeric(qIdx, phase);
    currentAnswer6yo = q.ans;
    questionText = `果果，请根据数字排队的规律，猜猜蓝色问号泡泡里面应该填哪个数字？`;
    const min = Math.max(0, q.ans - 5);
    const opts = Array.from({length:10}, (_,i) => min + i).filter(v => v >= 0);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(6,182,212,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">${getLevelTitle(level, '🧮 数字规律', '数列排队')}</h3>
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
    const q = getDynamicNumeric(qIdx, 3);
    currentAnswer6yo = q.ans;
    questionText = `果果，天平要左右平衡哦！请算出右边问号里面填哪个数字，天平两边才一样重？`;
    
    const leftText = q.left.map(v => v === null ? '❓' : v).join(' + ');
    const rightText = q.right.map(v => v === null ? '❓' : v).join(' + ');
    
    const min = Math.max(0, q.ans - 4);
    const opts = Array.from({length:9}, (_,i) => min + i).filter(v => v >= 0);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(6,182,212,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">${getLevelTitle(level, '⚖️ 数字规律', '天平平衡')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:15px;">🦁 算出问号数字，使天平左右两边 and 属性相等：</p>
        
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
    const q = getDynamicNumeric(qIdx, 4);
    currentAnswer6yo = q.ans;
    questionText = `果果，请开动脑筋，算一算图画代表什么数字？${q.q}`;
    
    const min = Math.max(0, q.ans - 4);
    const opts = Array.from({length:9}, (_,i) => min + i).filter(v => v >= 0);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(6,182,212,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">${getLevelTitle(level, '🍎 数字规律', '图形代数')}</h3>
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
    const q = getDynamicNumeric(qIdx, 5);
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
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">${getLevelTitle(level, '🔺 数字规律', '数字金字塔')}</h3>
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

// ==================== ⚡ 维度3：注意力扫描 ====================

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
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let questionText = '';
  
  if (phase === 1) {
    // 舒尔特格 1-9
    questionText = '果果，请从小到大，按顺序快速点击一到九的数字格子！';
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">${getLevelTitle(level, '⚡ 注意力', '舒尔特格')}</h3>
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
    const t = ATTENTION_SPOT_TEMPLATES[qIdx];
    questionText = `果果，${t.q}`;
    
    // Create a 4x4 array of base emojis
    const size = 16;
    const list = Array.from({length: size}, () => t.base);
    const diffIdx = Math.floor(Math.random() * size);
    list[diffIdx] = t.diff;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">${getLevelTitle(level, '🎯 注意力', '符号侦探')}</h3>
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
    const q = getDynamicAttention(qIdx, 3);
    currentAnswer6yo = q.ans;
    questionText = `果果，${q.q}`;
    
    const min = Math.max(1, q.ans - 3);
    const opts = Array.from({length: 6}, (_, i) => min + i);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">${getLevelTitle(level, '🔢 注意力', '视觉快速计数')}</h3>
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
    const q = getDynamicAttention(qIdx, 4);
    questionText = q.text;
    
    // Draw options
    const uniqueItems = Array.from(new Set(q.pool));
    const correctIdx = uniqueItems.indexOf(q.ans);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">${getLevelTitle(level, '👯 注意力', '寻找双胞胎')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 哪个图案在这里面偷偷出现了两次？</p>
        <div class="glass-card" style="background:rgba(255,255,255,0.04);padding:15px;border-radius:16px;display:flex;flex-wrap:wrap;justify-content:center;gap:15px;margin-bottom:20px;max-width:340px;margin-left:auto;margin-right:auto;">
          ${q.pool.map(item => `<span style="font-size:2.2em;">${item}</span>`).join('')}
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
    const q = ATTENTION_TRACK_QUESTIONS[qIdx];
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
          <h3 style="color:#34d399;font-weight:800;margin:0;">${getLevelTitle(level, '🕸️ 注意力', '视网膜路径追踪')}</h3>
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

// ==================== 🔍 维度4：逻辑演绎排序 ====================

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
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let questionText = '';

  if (phase === 1) {
    // 故事排序 (Chronological)
    const q = DEDUCTION_TIMELINES[qIdx];
    currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '🔍 逻辑排序', '故事发生顺序')}</h3>
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
    const q = DEDUCTION_SIZE_QUESTIONS[qIdx];
    currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '📏 逻辑排序', '属性比较')}</h3>
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
    const q = DEDUCTION_WEIGHT_QUESTIONS[qIdx];
    currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '⚖️ 逻辑排序', '天平轻重推理')}</h3>
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
    const q = DEDUCTION_CAUSAL_QUESTIONS[qIdx];
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '💭 逻辑推理', '因果判断')}</h3>
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
    const q = DEDUCTION_QUEUE_QUESTIONS[qIdx];
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '🐾 逻辑推理', '队列排座位')}</h3>
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

// ==================== 🎨 维度5：图形矩阵推理 ====================

function checkPatternAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "图形规律找对了！果果的推理能力超级厉害！");
  } else {
    speakText("再仔细看看规律，试试别的答案！");
    showWrongToast();
  }
}

function launchPattern(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let q = null;

  if (phase === 1) {
    q = PATTERN_QUESTIONS[qIdx];
  } else {
    q = getDynamicPattern(qIdx, phase);
  }

  currentPatternAnswer = q.ans.toString();
  const questionText = q.text || '果果，观察图形变化规律，找出右下角问号处应该填哪个？';

  // Shuffling options
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(251,191,36,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#fbbf24;font-weight:800;margin:0;">${getLevelTitle(level, '🎨 图形矩阵推理', '找寻矩阵规律')}</h3>
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
        ${shuffled.map((item) => `
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

// ==================== 🧠 维度6：短时记忆复现 ====================

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
      if (btn) {
        btn.innerHTML = '🪙';
        btn.style.background = 'rgba(16, 185, 129, 0.4)';
        btn.style.borderColor = '#10b981';
      }
      
      if (coinsFound.length === coinsToFind.length) {
        setTimeout(() => {
          trigger6yoVictory(10, "太厉害了！果果把藏起来的金币全都找到了！超强记忆！");
        }, 300);
      }
    }
  } else {
    speakText("这里没有金币哦，再想想！");
    const btn = document.getElementById(`coin-cell-${idx}`);
    if (btn) {
      btn.style.background = 'rgba(239, 68, 68, 0.3)';
      setTimeout(() => { btn.style.background = ''; }, 400);
    }
    showWrongToast();
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
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let questionText = '';

  if (phase === 1) {
    // 序列闪现记忆
    const q = MEMORY_QUESTIONS[qIdx];
    currentMemorySequence = q.show;
    memoryPhase = 'show';
    memoryExpected = [...q.show];
    memoryCurrentIdx = 0;
    questionText = q.q;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">${getLevelTitle(level, '🧠 短时记忆', '闪现复现')}</h3>
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
    const q = MEMORY_COIN_LEVELS[qIdx];
    coinsToFind = q.coins;
    coinsFound = [];
    questionText = `果果，记住金币躲在哪些格子里！马上要盖上木板喽！`;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">${getLevelTitle(level, '🪙 短时记忆', '藏金币')}</h3>
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
      if (cdEl) cdEl.innerText = '🙈 已经盖上啦！请点击找出刚才那几个藏着金币的格子：';
      
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
    const q = MEMORY_PAIR_TEMPLATES[qIdx];
    questionText = `果果，记住这四样东西的摆放位置哦！一会要考考你！`;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">${getLevelTitle(level, '📦 短时记忆', '位置绑定')}</h3>
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
    const q = MEMORY_MISSING_QUESTIONS[qIdx];
    questionText = `果果，仔细看这几个图案，一会会有一个小调皮藏起来！`;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">${getLevelTitle(level, '🕵️‍♂️ 短时记忆', '谁不见了')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p id="missing-prompt" style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 盯住下面这${q.show.length}个图案，3 秒后有人要躲猫猫：</p>
        <div id="missing-display" style="display:flex;justify-content:center;gap:15px;margin:25px 0;flex-wrap:wrap;">
          ${q.show.map(s => `<div class="glass-card" style="font-size:2.5em;border:2px solid rgba(255,255,255,0.15);width:70px;height:70px;display:flex;align-items:center;justify-content:center;">${s}</div>`).join('')}
        </div>
        <div id="missing-countdown" style="font-size:1.05em;color:#f472b6;font-weight:700;">👀 倒计时，3 秒后有人消失...</div>
        <div id="missing-opts" style="display:none;grid-template-columns:repeat(3,1fr);gap:10px;max-width:360px;margin:20px auto 0;"></div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;

    speakText(questionText);

    setTimeout(() => {
      const qText = q.qText || '哪个图案不见了？';
      speakText(`果果，${qText}`);

      const cdEl = document.getElementById('missing-countdown');
      if (cdEl) cdEl.innerText = `🎯 提问：谁藏起来不见了？`;

      const prompt = document.getElementById('missing-prompt');
      if (prompt) prompt.innerText = '🦁 下面是现在留下的图案（少了一个）：';

      const disp = document.getElementById('missing-display');
      if (disp) {
        disp.innerHTML = q.recall.map(s => `<div class="glass-card" style="font-size:2.5em;border:2px solid rgba(255,255,255,0.15);width:70px;height:70px;display:flex;align-items:center;justify-content:center;">${s}</div>`).join('');
      }

      const optsDiv = document.getElementById('missing-opts');
      if (optsDiv) {
        optsDiv.style.display = 'grid';
        const correctIdx = q.opts.findIndex(o => o.startsWith(q.ans));
        optsDiv.innerHTML = q.opts.map((opt, idx) => `
          <button class="mock-button glow-dabao" onclick="checkMemoryChoice(${idx}, ${correctIdx}, '真聪明！果果的记忆追踪能力一流！')" style="font-size:0.95em;padding:12px 6px;border-radius:10px;font-weight:700;">${opt}</button>
        `).join('');
      }
    }, 3000);
  }
  else {
    // 逆序数字记忆复现 (Digit Span Backward)
    const q = MEMORY_BACKWARD_QUESTIONS[qIdx];
    questionText = `果果，记住这三个数字！一会要倒着（从右往左）选出来哦！挑战性极强！`;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">${getLevelTitle(level, '⏪ 短时记忆', '数字逆序倒背')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 仔细记住这${q.show.length}个数字，3 秒后隐藏。然后【倒着】选出来：</p>
        <div id="backward-display" style="display:flex;justify-content:center;gap:15px;margin:25px 0;flex-wrap:wrap;">
          ${q.show.map(s => `<div class="glass-card" style="font-size:2.5em;border:2px solid rgba(255,255,255,0.15);width:70px;height:70px;display:flex;align-items:center;justify-content:center;color:#f472b6;font-weight:bold;">${s}</div>`).join('')}
        </div>
        <div id="backward-countdown" style="font-size:1.05em;color:#f472b6;font-weight:700;">👀 记忆中，3 秒后隐藏...</div>
        <div id="backward-recall-area" style="display:none;"></div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;

    speakText(questionText);

    setTimeout(() => {
      speakText("隐藏啦！现在请把数字【倒着】选出来吧！");
      const cdEl = document.getElementById('backward-countdown');
      if (cdEl) cdEl.innerText = '⏪ 隐藏啦！请倒着（从右到左）点击选出来：';

      const disp = document.getElementById('backward-display');
      if (disp) disp.style.display = 'none';

      const recallArea = document.getElementById('backward-recall-area');
      if (recallArea) {
        recallArea.style.display = 'block';
        backwardExpected = [...q.ans];
        backwardCurrentIdx = 0;
        
        // Options: sorted numbers
        const pool = [...q.show].sort(() => Math.random() - 0.5);
        recallArea.innerHTML = `
          <div id="backward-ans-display" style="display:flex;justify-content:center;gap:12px;margin:15px 0;min-height:50px;">
            ${q.show.map((_, i) => `<div id="back-slot-${i}" class="glass-card" style="width:50px;height:50px;border:2px dashed rgba(255,255,255,0.15);border-radius:10px;font-size:1.6em;font-weight:bold;color:#f472b6;display:flex;align-items:center;justify-content:center;">❓</div>`).join('')}
          </div>
          <div style="display:flex;justify-content:center;gap:12px;margin-top:20px;">
            ${pool.map(num => `
              <button id="backward-btn-${num}" class="mock-button glow-dabao" onclick="clickBackwardRecall(${num})" style="font-size:1.6em;width:60px;height:60px;border-radius:50%;font-weight:bold;">${num}</button>
            `).join('')}
          </div>
        `;
      }
    }, 3000);
  }
}

// ==================== 📚 维度7：言语理解分类 ====================

function checkLanguageAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "答对了！果果的语言理解能力真棒！");
  } else {
    speakText("再想想，换个答案试试！");
    showWrongToast();
  }
}

function launchLanguage(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let q = null;

  if (phase === 1) {
    q = LANGUAGE_QUESTIONS[qIdx];
  } else {
    q = getDynamicLanguage(qIdx, phase);
  }

  currentLanguageAnswer = q.ans.toString();
  const questionText = q.text;

  // Shuffling options
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(34,211,238,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#22d3ee;font-weight:800;margin:0;">${getLevelTitle(level, '📚 言语理解与表达', '分类常识与谜语')}</h3>
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

// ==================== 🔗 维度8：类比推理 ====================

function checkAnalogyAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "类比推理答对了！果果的逻辑太厉害了！");
  } else {
    speakText("再想想它们的关系，换个答案试试！");
    showWrongToast();
  }
}

function launchAnalogy(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let q = null;

  if (phase === 1) {
    q = ANALOGY_QUESTIONS[qIdx];
  } else {
    q = getDynamicAnalogy(qIdx, phase);
  }

  currentAnalogyAnswer = q.ans.toString();
  const questionText = q.text;

  // Shuffling options
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(167,139,250,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#c4b5fd;font-weight:800;margin:0;">${getLevelTitle(level, '🔗 关联类比推理', '事物关系类比')}</h3>
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

function launchMixedMode() {
  window.isMixedMode = true;
  initAppState();
  const player = appState.players.dabao;
  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
  }
  if (typeof player.progress.mixed !== 'number') {
    player.progress.mixed = 1;
    saveAppState();
  }

  const mixedLevel = player.progress.mixed;
  const container = document.getElementById("game-stage");

  if (mixedLevel > 400) {
    container.innerHTML = `
      <div class="glass-card" style="padding:40px;text-align:center;max-width:600px;margin:30px auto;border-color:#10b981;">
        <span style="font-size:5.5em;display:block;margin-bottom:15px;animation:pulseGlow 2s infinite;">🏆</span>
        <h2 style="color:#10b981;font-weight:800;">🎉 完美通关 400 关综合特训航线！</h2>
        <p style="font-size:1.1em;color:#fff;margin:15px 0;">果果，你太牛啦！你完成了北京八中超常班的全部 400 关特训任务，获得了终极大勋章！</p>
        <button class="mock-button glow-success" onclick="resetMixedProgress()" style="width:100%;font-size:1.05em;padding:12px;margin-bottom:12px;">🛸 重置并重新挑战</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="width:100%;border-color:transparent;color:#64748b;">返回特训大厅</button>
      </div>
    `;
    speakText(`恭喜果果！你已经完美通关了四百关综合特训航线的全部内容，你获得了终极大勋章！你是宇宙级逻辑小天才！`);
    return;
  }

  const tracks = ['spatial', 'numeric', 'attention', 'deduction', 'pattern', 'memory', 'language', 'analogy'];
  const tIdx = (mixedLevel - 1) % 8;
  const type = tracks[tIdx];
  const trackLevel = Math.floor((mixedLevel - 1) / 8) + 1;

  window.currentGameTrack = type;

  if (type === 'spatial') launchSpatial(trackLevel, container);
  else if (type === 'numeric') launchNumeric(trackLevel, container);
  else if (type === 'attention') launchAttention(trackLevel, container);
  else if (type === 'deduction') launchDeduction(trackLevel, container);
  else if (type === 'pattern') launchPattern(trackLevel, container);
  else if (type === 'memory') launchMemory(trackLevel, container);
  else if (type === 'language') launchLanguage(trackLevel, container);
  else if (type === 'analogy') launchAnalogy(trackLevel, container);
}

function resetMixedProgress() {
  initAppState();
  appState.players.dabao.progress.mixed = 1;
  saveAppState();
  speakText("已重置综合特训进度，重新开始挑战吧！");
  launchMixedMode();
}
