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

// ==================== 🏆 胜利 & 学习反馈引擎（统一入口）====================

const COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000; // 2天 = 172800000 毫秒

function getNextAvailableLevel(playerId, type, currentLevel) {
  const player = appState.players[playerId];
  const wrongQuestions = player.wrongQuestions || {};
  let testLevel = currentLevel;
  while (testLevel <= 50) {
    const key = `${type}-${testLevel}`;
    const lastWrongTime = wrongQuestions[key];
    if (lastWrongTime && (Date.now() - lastWrongTime < COOLDOWN_MS)) {
      testLevel++; // 2天内答错的题目，跳过
    } else {
      break;
    }
  }
  return testLevel;
}

function getNextAvailableMixedLevel(playerId, currentMixedLevel) {
  const player = appState.players[playerId];
  const wrongQuestions = player.wrongQuestions || {};
  let testMixed = currentMixedLevel;
  const tracks = ['spatial', 'numeric', 'attention', 'deduction', 'pattern', 'memory', 'language', 'analogy'];
  while (testMixed <= 400) {
    const tIdx = (testMixed - 1) % 8;
    const type = tracks[tIdx];
    const trackLevel = Math.floor((testMixed - 1) / 8) + 1;
    const key = `${type}-${trackLevel}`;
    const lastWrongTime = wrongQuestions[key];
    if (lastWrongTime && (Date.now() - lastWrongTime < COOLDOWN_MS)) {
      testMixed++; // 2天内答错的题目，跳过
    } else {
      break;
    }
  }
  return testMixed;
}

function trigger6yoVictory(ignoredStarParam, speechFeedback) {
  const type = window.currentGameTrack;
  if (!type) { console.warn("currentGameTrack not set"); return; }

  const currentPlayerId = window.currentPlayerId || 'dabao';
  const isErbao = currentPlayerId === 'erbao';
  const player = appState.players[currentPlayerId];

  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
  }
  
  const level = window.currentGameLevel || 1;

  // Graded point calculation (based on developmental flow state)
  let calculatedStars = 2; // Default Easy: Level 1-12
  let difficultyName = "🟢 基础挑战";
  let difficultyColor = "#34d399";
  if (level > 42) {
    calculatedStars = 30; // Ultimate: Level 43-50
    difficultyName = "🔥 超常挑战";
    difficultyColor = "#f43f5e";
  } else if (level > 28) {
    calculatedStars = 12; // Hard: Level 29-42
    difficultyName = "⚡ 高级挑战";
    difficultyColor = "#fbbf24";
  } else if (level > 12) {
    calculatedStars = 5;  // Medium: Level 13-28
    difficultyName = "🔵 进阶挑战";
    difficultyColor = "#60a5fa";
  }

  // Apply Daily Streak Multiplier (operant conditioning)
  const streak = player.streaks || 1;
  let multiplier = 1.0;
  if (streak >= 7) multiplier = 1.5;
  else if (streak >= 3) multiplier = 1.2;

  let baseEarned = Math.round(calculatedStars * multiplier);
  let isMilestone = false;
  
  if (!window.isMixedMode && level === 50) {
    baseEarned += 150; // Milestone bonus!
    isMilestone = true;
  }

  // Update State progress
  if (window.isReviewMode && window.reviewLevelKey) {
    // Review mode solved correctly! Remove it from the wrong pool
    delete player.wrongQuestions[window.reviewLevelKey];
    window.isReviewMode = false;
    window.reviewLevelKey = null;
  } else {
    // Normal progress advancement
    if (window.isMixedMode) {
      player.progress.mixed = (player.progress.mixed || 1) + 1;
    } else {
      if (typeof player.progress[type] !== 'number') player.progress[type] = 1;
      player.progress[type]++;
    }
  }
  
  player.stars = (player.stars || 0) + baseEarned;
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
    o.frequency.setValueAtTime(523.25, ctx.currentTime);
    o.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
    o.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
    o.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    o.start(); o.stop(ctx.currentTime + 0.45);
  } catch(e) {}

  const themeColor = isErbao ? '#fbbf24' : '#10b981';
  const bgColor = isErbao ? 'rgba(251,191,36,0.08)' : 'rgba(16,185,129,0.08)';
  const avatar = isErbao ? '🐰' : '🌟';
  const titleName = isErbao ? '回答正确！淼淼真棒！' : '回答正确！';

  const container = document.getElementById("game-stage");
  container.innerHTML = `
    <div class="glass-card" style="padding:40px; text-align:center; max-width:500px; margin:40px auto; border-color:${themeColor}; background:${bgColor}; border-width:2px; animation:pulseGlow 1.2s infinite ease-in-out;">
      <span style="font-size:5em; display:block; margin-bottom:10px;">${avatar}</span>
      <h2 style="color:${themeColor}; font-weight:800; margin-bottom:5px;">${titleName}</h2>
      <div style="font-size:0.85em; font-weight:bold; color:${difficultyColor}; margin-bottom:10px;">${difficultyName} · 第 ${level} 关</div>
      <p style="font-size:1.05em; color:#fff; font-weight:600; margin-bottom:15px;">${speechFeedback}</p>
      
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:12px; margin:15px 0; font-size:0.85em; color:#94a3b8; line-height:1.6;">
        <div>基础得分：<span style="color:#fff; font-weight:bold;">+${calculatedStars}</span></div>
        ${multiplier > 1 ? `<div>连续学习奖励：<span style="color:#fbbf24; font-weight:bold;">${multiplier}x 倍数</span> (已连续打卡 ${streak} 天)</div>` : ''}
        ${isMilestone ? `<div>🎖️ 通关里程碑大奖：<span style="color:#a78bfa; font-weight:bold;">+150 额外星星</span></div>` : ''}
        <div style="font-size:1.4em; font-weight:bold; color:#fbbf24; margin-top:8px;">共获得：🪙 +${baseEarned} 星星</div>
      </div>
      
      <p style="font-size:0.8em; color:#94a3b8; letter-spacing:1px; animation:blinker 1s linear infinite; margin-top:15px;">正在自动开启下一关，请准备... 🚀</p>
    </div>
  `;

  // Speech feedback integration
  const streakSpeech = multiplier > 1 ? `，连续打卡 ${streak} 天，获得翻倍奖励！` : "";
  const milestoneSpeech = isMilestone ? "，天呐！你太棒了！完成了本维度的终极特训，获得了额外的通关大奖！" : "";
  speakText(`${speechFeedback}${streakSpeech}${milestoneSpeech}`);
  
  setTimeout(() => {
    if (window.isMixedMode) {
      launchMixedMode();
    } else {
      launchTest(type);
    }
  }, 1800);
}

function trigger6yoFailure(speechExplanation, correctValueExplanation) {
  const type = window.currentGameTrack;
  if (!type) { console.warn("currentGameTrack not set"); return; }

  const currentPlayerId = window.currentPlayerId || 'dabao';
  const isErbao = currentPlayerId === 'erbao';
  const player = appState.players[currentPlayerId];
  const level = window.currentGameLevel || 1;

  if (!player.wrongQuestions) player.wrongQuestions = {};
  
  // Record wrong question with timestamp
  const key = `${type}-${level}`;
  player.wrongQuestions[key] = Date.now();

  // Advance level progress so child doesn't get stuck (except in review mode!)
  if (window.isReviewMode && window.reviewLevelKey) {
    window.isReviewMode = false;
    window.reviewLevelKey = null;
  } else {
    // Normal progress advancement
    if (window.isMixedMode) {
      player.progress.mixed = (player.progress.mixed || 1) + 1;
    } else {
      if (typeof player.progress[type] !== 'number') player.progress[type] = 1;
      player.progress[type]++;
    }
  }
  
  saveAppState();

  // Play failure sound
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'triangle';
    o.frequency.setValueAtTime(392.00, ctx.currentTime); // G4
    o.frequency.setValueAtTime(329.63, ctx.currentTime + 0.15); // E4
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    o.start(); o.stop(ctx.currentTime + 0.45);
  } catch(e) {}

  const themeColor = '#6366f1'; // Indigo for learning moment
  const bgColor = 'rgba(99, 102, 241, 0.08)';
  const avatar = isErbao ? '🐰' : '🦁';
  const titleName = '脑力大讲堂 💡';
  
  const levelText = window.isMixedMode 
    ? `综合第 ${level} 关` 
    : `第 ${level} 关`;

  const container = document.getElementById("game-stage");
  container.innerHTML = `
    <div class="glass-card animate-pop" style="padding:40px; text-align:center; max-width:550px; margin:40px auto; border-color:${themeColor}; background:${bgColor}; border-width:2px; box-shadow:0 10px 40px rgba(99,102,241,0.25);">
      <span style="font-size:4.5em; display:block; margin-bottom:10px;">${avatar}</span>
      <h2 style="color:${themeColor}; font-weight:800; margin-bottom:5px;">${titleName}</h2>
      <div style="font-size:0.85em; font-weight:bold; color:#a5b4fc; margin-bottom:15px;">本关答案学习 · ${levelText}</div>
      
      ${window.currentQuestionText ? `
      <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:14px; margin-bottom:15px; text-align:left;">
         <span style="font-size:0.8em; color:#818cf8; font-weight:700; display:block; margin-bottom:4px;">❓ 题目问题：</span>
         <span style="font-size:1.02em; font-weight:600; color:#fff; line-height:1.45; display:block;">${window.currentQuestionText}</span>
      </div>
      ` : ''}
      
      ${window.currentQuestionOptions && window.currentQuestionOptions.length > 0 ? `
      <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:14px; margin-bottom:15px; text-align:left;">
         <span style="font-size:0.8em; color:#a855f7; font-weight:700; display:block; margin-bottom:8px;">🎈 关卡选项候选：</span>
         <div style="display:flex; flex-wrap:wrap; gap:8px;">
           ${window.currentQuestionOptions.map(opt => {
             const cleanOpt = opt.toString().trim();
             const cleanCorrect = correctValueExplanation.toString().trim();
             const isCorrect = (cleanOpt === cleanCorrect) || 
                               (cleanCorrect.startsWith(cleanOpt) && cleanOpt.length > 0) ||
                               (cleanOpt.includes(cleanCorrect) && cleanCorrect.length > 0) ||
                               (cleanCorrect.includes(cleanOpt) && cleanOpt.length > 0);
             const border = isCorrect ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)';
             const bg = isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)';
             const color = isCorrect ? '#34d399' : '#cbd5e1';
             return `<span style="padding:6px 12px; border-radius:8px; border:${border}; background:${bg}; color:${color}; font-size:0.88em; font-weight:700; display:inline-flex; align-items:center; gap:5px;">
               ${opt} ${isCorrect ? '✅' : ''}
             </span>`;
           }).join('')}
         </div>
      </div>
      ` : ''}
      
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:18px; margin:20px 0; text-align:left;">
         <div style="margin-bottom:12px;">
           <span style="font-size:0.8em; color:#a5b4fc; font-weight:700; display:block; margin-bottom:4px;">🎯 正确答案：</span>
           <span style="font-size:1.15em; font-weight:800; color:#fff;">${correctValueExplanation}</span>
         </div>
         <div>
           <span style="font-size:0.8em; color:#f472b6; font-weight:700; display:block; margin-bottom:4px;">🔍 脑力小课堂：</span>
           <span style="font-size:0.95em; color:#cbd5e1; line-height:1.6; display:block;">${speechExplanation}</span>
         </div>
      </div>

      <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); border-radius:12px; padding:12px; margin:15px 0; font-size:0.85em; color:#94a3b8;">
        <div style="font-size:1.2em; font-weight:bold; color:#cbd5e1;">本次获得奖励：🪙 +0 星星</div>
        <div style="font-size:0.85em; color:#64748b; margin-top:4px;">(没关系！先学懂它，2天后本题会重新出现供你挑战哦！)</div>
      </div>
      
      <button class="mock-button glow-success" onclick="close6yoFailureMoment()" style="width:100%; font-size:1.1em; font-weight:700; padding:12px; margin-top:20px;">
        我知道啦，开启下一关 🚀
      </button>
    </div>
  `;

  // Speech feedback integration
  speakText(`别气馁，我们先学习一下吧。本关正确答案是：${correctValueExplanation}。脑力小课堂说：${speechExplanation}`);

  window.close6yoFailureMoment = () => {
    if (window.isMixedMode) {
      launchMixedMode();
    } else {
      launchTest(type);
    }
  };
}

function check6yoAnswer(ans) {
  if (ans === currentAnswer6yo) {
    trigger6yoVictory(10, "答对啦！果果太棒了！加十个星星！");
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "再仔细算一算，找出数字或图形之间的规律哦！", window.currentQuestionCorrectAnswer || "正确选项");
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
  // Lock screen scrolling during gameplay to prevent iPad dragging conflict
  lockViewportScrolling();

  window.isMixedMode = false;
  window.currentQuestionText = "";
  window.currentQuestionOptions = [];
  initAppState();
  
  const currentPlayerId = window.currentPlayerId || 'dabao';
  const player = appState.players[currentPlayerId];

  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
    saveAppState();
  }
  // 补充新维度缺失字段
  ['spatial','numeric','attention','deduction','pattern','memory','language','analogy','mixed'].forEach(k => {
    if (typeof player.progress[k] !== 'number') { player.progress[k] = 1; saveAppState(); }
  });

  // 1. Spaced Repetition checking: check for any expired wrong questions first!
  let reviewLevel = null;
  const wrongQuestions = player.wrongQuestions || {};
  for (let l = 1; l <= 50; l++) {
    const key = `${type}-${l}`;
    const lastWrongTime = wrongQuestions[key];
    if (lastWrongTime && (Date.now() - lastWrongTime >= COOLDOWN_MS)) {
      reviewLevel = l;
      break;
    }
  }

  let level;
  if (reviewLevel !== null) {
    window.isReviewMode = true;
    window.reviewLevelKey = `${type}-${reviewLevel}`;
    level = reviewLevel;
  } else {
    window.isReviewMode = false;
    window.reviewLevelKey = null;
    level = getNextAvailableLevel(currentPlayerId, type, player.progress[type] || 1);
  }
  window.currentGameLevel = level;
  window.currentGameTrack = type;
  const container = document.getElementById("game-stage");

  if (level > 50) {
    const isErbao = currentPlayerId === 'erbao';
    const name = isErbao ? '淼淼' : '果果';
    const returnFunc = isErbao ? 'loadErbaoHUD()' : 'loadDabaoHUD()';
    const buttonGlow = isErbao ? 'glow-erbao' : 'glow-success';
    container.innerHTML = `
      <div class="glass-card" style="padding:40px;text-align:center;max-width:600px;margin:30px auto;border-color:#10b981;">
        <span style="font-size:5.5em;display:block;margin-bottom:15px;animation:pulseGlow 2s infinite;">🏆</span>
        <h2 style="color:#10b981;font-weight:800;">🎉 完美通关 50 关！</h2>
        <p style="font-size:1.1em;color:#fff;margin:15px 0;">${name}，你太牛啦！「${getTrackChineseName(type)}」全部攻克！</p>
        <button class="mock-button ${buttonGlow}" onclick="resetTrackProgress('${type}')" style="width:100%;font-size:1.05em;padding:12px;margin-bottom:12px;">🛸 重置并重新挑战</button>
        <button class="mock-button" onclick="${returnFunc}" style="width:100%;border-color:transparent;color:#64748b;">返回特训大厅</button>
      </div>
    `;
    speakText(`恭喜${name}！你已经完美通关了${getTrackChineseName(type)}的全部五十关，获得了荣誉大勋章！你太棒了！`);
    return;
  }

  // Route erbao to launchErbaoSensory
  if (currentPlayerId === 'erbao') {
    launchErbaoSensory(type, level, container);
    appendDabaoSkipButton(container);
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

  // Append unified Skip button bar at the bottom of the container
  appendDabaoSkipButton(container);
}

// ==================== 🔧 工具与综合调度函数 ====================

function resetTrackProgress(type) {
  initAppState();
  const currentPlayerId = window.currentPlayerId || 'dabao';
  const player = appState.players[currentPlayerId];
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
  // Lock screen scrolling during gameplay to prevent iPad dragging conflict
  lockViewportScrolling();

  window.isMixedMode = true;
  window.currentQuestionText = "";
  window.currentQuestionOptions = [];
  initAppState();
  
  const currentPlayerId = window.currentPlayerId || 'dabao';
  const player = appState.players[currentPlayerId];
  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
  }
  if (typeof player.progress.mixed !== 'number') {
    player.progress.mixed = 1;
    saveAppState();
  }

  // 1. Spaced Repetition check: see if there are any expired wrong questions in ANY track
  let reviewType = null;
  let reviewLevel = null;
  const wrongQuestions = player.wrongQuestions || {};
  const tracks = ['spatial', 'numeric', 'attention', 'deduction', 'pattern', 'memory', 'language', 'analogy'];
  for (const t of tracks) {
    for (let l = 1; l <= 50; l++) {
      const key = `${t}-${l}`;
      const lastWrongTime = wrongQuestions[key];
      if (lastWrongTime && (Date.now() - lastWrongTime >= COOLDOWN_MS)) {
        reviewType = t;
        reviewLevel = l;
        break;
      }
    }
    if (reviewLevel !== null) break;
  }

  let type;
  let trackLevel;
  if (reviewLevel !== null) {
    window.isReviewMode = true;
    window.reviewLevelKey = `${reviewType}-${reviewLevel}`;
    type = reviewType;
    trackLevel = reviewLevel;
  } else {
    window.isReviewMode = false;
    window.reviewLevelKey = null;
    const mixedLevel = getNextAvailableMixedLevel(currentPlayerId, player.progress.mixed || 1);
    
    // Check if total mixed completed
    if (mixedLevel > 400) {
      const isErbao = currentPlayerId === 'erbao';
      const name = isErbao ? '淼淼' : '果果';
      const returnFunc = isErbao ? 'loadErbaoHUD()' : 'loadDabaoHUD()';
      const buttonGlow = isErbao ? 'glow-erbao' : 'glow-success';
      const container = document.getElementById("game-stage");
      container.innerHTML = `
        <div class="glass-card" style="padding:40px;text-align:center;max-width:600px;margin:30px auto;border-color:#10b981;">
          <span style="font-size:5.5em;display:block;margin-bottom:15px;animation:pulseGlow 2s infinite;">🏆</span>
          <h2 style="color:#10b981;font-weight:800;">🎉 完美通关 400 关综合特训航线！</h2>
          <p style="font-size:1.1em;color:#fff;margin:15px 0;">${name}，你太牛啦！你完成了脑力乐园的全部 400 关特训任务，获得了终极大勋章！</p>
          <button class="mock-button ${buttonGlow}" onclick="resetMixedProgress()" style="width:100%;font-size:1.05em;padding:12px;margin-bottom:12px;">🛸 重置并重新挑战</button>
          <button class="mock-button" onclick="${returnFunc}" style="width:100%;border-color:transparent;color:#64748b;">返回特训大厅</button>
        </div>
      `;
      speakText(`恭喜${name}！你已经完美通关了四百关综合特训航线的全部内容，你获得了终极大勋章！你是宇宙级逻辑小天才！`);
      return;
    }

    const tIdx = (mixedLevel - 1) % 8;
    type = tracks[tIdx];
    trackLevel = Math.floor((mixedLevel - 1) / 8) + 1;
  }

  window.currentGameTrack = type;
  window.currentGameLevel = trackLevel;
  const container = document.getElementById("game-stage");

  // Route erbao to launchErbaoSensory
  if (currentPlayerId === 'erbao') {
    launchErbaoSensory(type, trackLevel, container);
    appendDabaoSkipButton(container);
    return;
  }

  if (type === 'spatial') launchSpatial(trackLevel, container);
  else if (type === 'numeric') launchNumeric(trackLevel, container);
  else if (type === 'attention') launchAttention(trackLevel, container);
  else if (type === 'deduction') launchDeduction(trackLevel, container);
  else if (type === 'pattern') launchPattern(trackLevel, container);
  else if (type === 'memory') launchMemory(trackLevel, container);
  else if (type === 'language') launchLanguage(trackLevel, container);
  else if (type === 'analogy') launchAnalogy(trackLevel, container);

  // Append unified Skip button bar at the bottom of the container
  appendDabaoSkipButton(container);
}

function resetMixedProgress() {
  initAppState();
  const currentPlayerId = window.currentPlayerId || 'dabao';
  const player = appState.players[currentPlayerId];
  player.progress.mixed = 1;
  saveAppState();
  speakText("已重置综合特训进度，重新开始挑战吧！");
  launchMixedMode();
}

// ==================== 🎬 空间想象与旋转/镜像 3D 动画演示助手 ====================

function showSpatialHelpAnimation(type, original, hint, title = '') {
  // If original/hint are omitted, fall back to reading from window.currentSpatialQuestion
  if (!original && window.currentSpatialQuestion) {
    original = window.currentSpatialQuestion.original || window.currentSpatialQuestion.matrix?.[0] || '';
    hint = window.currentSpatialQuestion.hint || '';
    title = window.currentSpatialQuestion.title || window.currentSpatialQuestion.text || '';
  }
  // Ensure safe fallbacks
  original = original || '';
  hint = hint || '仔细看动画，找出其中的变化规律哦！';
  title = title || '';

  const currentPlayerId = window.currentPlayerId || 'dabao';
  const name = currentPlayerId === 'erbao' ? '淼淼' : '果果';

  const styleId = 'spatial-help-animation-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes mirrorFlip {
        0% {
          transform: translateX(0) scale(1) rotateY(0deg);
          opacity: 0.85;
        }
        15% {
          transform: translateX(0) scale(1.1) rotateY(0deg);
          opacity: 1;
        }
        50% {
          transform: translateX(110px) scale(1.15) rotateY(90deg);
          opacity: 0.9;
          filter: brightness(1.2);
        }
        80% {
          transform: translateX(220px) scale(1) rotateY(180deg);
          opacity: 1;
        }
        100% {
          transform: translateX(220px) scale(1) rotateY(180deg);
          opacity: 1;
        }
      }

      @keyframes rotate90Anim {
        0% { transform: rotate(0deg) scale(1); }
        15% { transform: rotate(0deg) scale(1.08); }
        65% { transform: rotate(90deg) scale(1.08); filter: brightness(1.15); }
        85%, 100% { transform: rotate(90deg) scale(1); }
      }

      @keyframes rotate180Anim {
        0% { transform: rotate(0deg) scale(1); }
        15% { transform: rotate(0deg) scale(1.08); }
        65% { transform: rotate(180deg) scale(1.08); filter: brightness(1.15); }
        85%, 100% { transform: rotate(180deg) scale(1); }
      }

      .spatial-modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(15, 23, 42, 0.88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeInModal 0.3s ease-out;
      }

      @keyframes fadeInModal {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .spatial-modal-card {
        max-width: 520px;
        width: 90%;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(30, 41, 59, 0.8);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(129, 140, 248, 0.2);
        border-radius: 24px;
        padding: 30px;
        text-align: center;
        position: relative;
      }
    `;
    document.head.appendChild(style);
  }

  let is180 = false;
  if (title && (title.includes('180') || title.includes('半圈') || title.includes('字母')) || hint.includes('180') || hint.includes('半圈')) {
    is180 = true;
  }

  const overlay = document.createElement('div');
  overlay.className = 'spatial-modal-overlay';
  overlay.id = 'spatial-anim-modal';

  let animStageHTML = '';

  if (type === 'mirror') {
    animStageHTML = `
      <div style="display:flex; justify-content:center; align-items:center; gap:25px; margin: 30px 0; position:relative; min-height:160px; perspective: 600px;">
        <!-- Left Side: Original -->
        <div style="text-align:center; flex:1;">
          <div style="font-size:0.75em; color:#94a3b8; margin-bottom:8px; font-weight:700;">原图</div>
          <div class="glass-card" style="padding:15px; font-size:1.6em; line-height:1.5; white-space:pre; font-family:monospace; min-width:90px; background:rgba(255,255,255,0.03); border-color:rgba(255,255,255,0.06); font-weight:bold; text-align:center;">${original}</div>
        </div>
        
        <!-- Center Mirror Axis -->
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:120px; width:2px; border-left:2px dashed #818cf8; position:relative; z-index:5;">
          <span style="position:absolute; background:#818cf8; color:#fff; font-size:0.7em; padding:2px 6px; border-radius:10px; font-weight:bold; white-space:nowrap; top:45%; transform:translateY(-50%); box-shadow:0 0 10px rgba(129,140,248,0.5);">镜子 🪞</span>
        </div>
        
        <!-- Right Side: Destination Mirror -->
        <div style="text-align:center; flex:1;">
          <div style="font-size:0.75em; color:#94a3b8; margin-bottom:8px; font-weight:700;">对称镜面</div>
          <div class="glass-card" style="padding:15px; font-size:1.6em; line-height:1.5; white-space:pre; font-family:monospace; min-width:90px; border:2px dashed rgba(129,140,248,0.3); background:rgba(129,140,248,0.02); color:rgba(129,140,248,0.4); font-weight:bold; text-align:center;">❓</div>
        </div>
        
        <!-- Floating Animated Card -->
        <div class="glass-card" style="position:absolute; left: calc(50% - 150px); top: 22px; padding:15px; font-size:1.6em; line-height:1.5; white-space:pre; font-family:monospace; min-width:90px; background:rgba(129,140,248,0.25); border:2px solid #818cf8; color:#fff; font-weight:bold; text-align:center; pointer-events:none; z-index:10; animation: mirrorFlip 3.5s infinite ease-in-out; transform-origin: 50% 50%;">${original}</div>
      </div>
      <p style="font-size:0.95em; color:#a5b4fc; font-weight:bold; margin-bottom:10px;">🦋 左右两边像蝴蝶的翅膀一样翻转对称过来啦！</p>
    `;
  } else {
    // Rotation
    const animName = is180 ? 'rotate180Anim' : 'rotate90Anim';
    const angleText = is180 ? '180° (转半圈，大头朝下)' : '90° (向右转四分之一圈)';
    animStageHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; margin: 30px 0; position:relative; min-height:180px;">
        <!-- Circular rotation path indicator -->
        <div style="position:absolute; width:160px; height:160px; border:2px dashed rgba(129,140,248,0.25); border-radius:50%; display:flex; align-items:center; justify-content:center;">
          <span style="font-size:1.6em; color:rgba(129,140,248,0.4); animation: rotate90Anim 3.5s infinite linear; display:none;">🔄</span>
        </div>
        
        <!-- Rotating Card -->
        <div class="glass-card" style="padding:20px; font-size:2em; line-height:1.5; white-space:pre; font-family:monospace; min-width:110px; background:rgba(129,140,248,0.18); border:2px solid #818cf8; color:#fff; font-weight:bold; text-align:center; animation: ${animName} 3.5s infinite ease-in-out; transform-origin: 50% 50%; z-index:10; box-shadow:0 0 20px rgba(129,140,248,0.25);">${original}</div>
      </div>
      <p style="font-size:0.95em; color:#a5b4fc; font-weight:bold; margin-bottom:10px;">🔄 像小风车/时针一样顺时针转动了 ${angleText}！</p>
    `;
  }

  overlay.innerHTML = `
    <div class="glass-card spatial-modal-card">
      <h2 style="color:#818cf8; font-weight:800; margin-top:0; font-size:1.4em; display:flex; align-items:center; justify-content:center; gap:8px;">
        🎨 空间想象演示课 🎬
      </h2>
      <p style="font-size:0.85em; color:#94a3b8; line-height:1.5;">${name}，仔细看下面这个好玩的动画，看看它是怎么变化的：</p>
      
      ${animStageHTML}
      
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:15px; text-align:left; font-size:0.9em; line-height:1.5; color:#cbd5e1; margin-top:15px;">
        <span style="font-weight:800; color:#818cf8;">💡 脑力小秘诀：</span>${hint}
      </div>
      
      <button class="mock-button glow-success" onclick="closeSpatialHelp()" style="width:100%; font-size:1em; font-weight:700; padding:12px; margin-top:20px;">
        ❌ 我看懂了，去答题！
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  window.closeSpatialHelp = () => {
    overlay.remove();
  };

  // Speaks
  const intro = type === 'mirror' 
    ? `${name}，快看！图案照镜子的样子，是把左右位置完全对调过来，就像你在镜子面前抬起右手一样哦！`
    : `${name}，快看！这个图案正在像摩天轮或者钟表指针一样，顺时针向右转动了${is180 ? '半圈' : '九十度'}！`;
  speakText(intro);
}

// ==================== ⏭️ 特训关卡一键“跳过此关”全局逻辑 ====================

function appendDabaoSkipButton(container) {
  // Ensure we don't render duplicate skip buttons
  const old = document.getElementById('dabao-skip-bar');
  if (old) old.remove();

  const currentPlayerId = window.currentPlayerId || 'dabao';
  const isErbao = currentPlayerId === 'erbao';
  const name = isErbao ? '淼淼' : '果果';
  const btnGlow = isErbao ? 'glow-erbao' : 'glow-dabao';

  const skipDiv = document.createElement('div');
  skipDiv.id = 'dabao-skip-bar';
  skipDiv.style.cssText = "text-align:center; margin-top:20px; margin-bottom:15px; display:flex; justify-content:center; gap:15px; flex-wrap:wrap;";
  
  if (isErbao) {
    skipDiv.innerHTML = `
      <button class="mock-button ${btnGlow}" onclick="skipCurrent6yoLevel()" style="border-color:rgba(255,255,255,0.08); background:rgba(255,255,255,0.02); color:#94a3b8; font-size:0.88em; padding:8px 22px; border-radius:14px; font-weight:700; cursor:pointer; transition: all 0.2s; display:inline-flex; align-items:center; gap:6px; margin-top:0;">
        <span>⏭️ 跳过这一关 (太难了？)</span>
      </button>
      <button class="mock-button" onclick="loadErbaoHUD()" style="border-color:transparent; background:rgba(255,255,255,0.01); color:#64748b; font-size:0.88em; padding:8px 22px; border-radius:14px; font-weight:700; cursor:pointer; transition: all 0.2s; display:inline-flex; align-items:center; gap:6px; margin-top:0;">
        <span>🔙 返回特训大厅</span>
      </button>
    `;
  } else {
    skipDiv.innerHTML = `
      <button class="mock-button ${btnGlow}" onclick="skipCurrent6yoLevel()" style="border-color:rgba(255,255,255,0.08); background:rgba(255,255,255,0.02); color:#94a3b8; font-size:0.88em; padding:8px 22px; border-radius:14px; font-weight:700; cursor:pointer; transition: all 0.2s; display:inline-flex; align-items:center; gap:6px; margin-top:0;">
        <span>⏭️ 跳过这一关 (本关太难？)</span>
      </button>
    `;
  }
  container.appendChild(skipDiv);
}

function skipCurrent6yoLevel() {
  const currentPlayerId = window.currentPlayerId || 'dabao';
  const name = currentPlayerId === 'erbao' ? '淼淼' : '果果';
  if (!confirm(`🐰 确定要跳过这一关吗？\n跳过本关不会扣除或发放任何金币奖励。没关系，${name}可以先做下一关！✨`)) return;
  
  const type = window.currentGameTrack;
  if (!type) return;

  const player = appState.players[currentPlayerId];

  // Advance progress
  if (window.isMixedMode) {
    player.progress.mixed = (player.progress.mixed || 1) + 1;
  } else {
    player.progress[type]++;
  }
  
  saveAppState();
  speakText("这关有点难，没关系！我们先来挑战下一关吧，加油！");

  // Relaunch next level
  if (window.isMixedMode) {
    launchMixedMode();
  } else {
    launchTest(type);
  }
}
