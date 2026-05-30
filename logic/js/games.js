/* 🧠 脑力认知研究所 - 果果「北京八中少儿班/八素班」选拔特训引擎 v3.0 */
/* 8大维度 × 50关 = 400关题库 | 基于北京八中超常班考察框架 */

let currentAnswer6yo = 0;

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

// Global wrong answer indicator toast
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
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
    saveAppState();
  }
  // 补充新维度缺失字段
  ['spatial','numeric','attention','deduction','pattern','memory','language','analogy','mixed'].forEach(k => {
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

// ==================== 🔧 工具与综合调度函数 ====================

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
