# 🎬 空间动画修复与淼淼积分/答题底座完全对齐计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 
1. 修复空间图形与规律矩阵中“🎬 观看动画演示”点击无反应的 Bug（解决内联 JSON 双引号解析错误问题）。
2. 将淼淼（2岁，Erbao）的积分判定、答题计分、连续天数翻倍、里程碑大奖以及胜利倒计时发牌格式完全重构，使其与果果（6岁，Dabao）完全一致，仅保留题目内容之区别。

**Architecture:**
1. **全局演示问题缓存**：在 `spatial.js` 和 `pattern.js` 载入题目 `q` 时，统一缓存到全局变量 `window.currentSpatialQuestion = q;`。
2. **免传参演示触发**：重构 `spatial.js` 和 `pattern.js` 产生的“🎬 观看动画演示”按钮。去除内联 HTML 传参，简化为直接调用 `showSpatialHelpAnimation('mirror')` 或 `showSpatialHelpAnimation('rotate')`。
3. **兼容空值回退**：在 `showSpatialHelpAnimation` 开头加入参数空值回退逻辑，当无传入参数时自动读取全局 `window.currentSpatialQuestion`。
4. **统一胜利引擎**：重构 `games.js` 的 `trigger6yoVictory`。删除之前对 Erbao 单独分流 `trigger2yoVictory` 的逻辑。根据当前玩家 `window.currentPlayerId` 动态调整卡片文字（淼淼/果果）、头像（🐰/🦁）与颜色主题（黄/绿），但共享完全一致的高级积分奖励计算、天数翻倍、里程碑和自动发牌流程。

**Tech Stack:** HTML5, Vanilla JavaScript, CSS3 Translate3D, Web Audio API

---

### Task 1: 重构 `showSpatialHelpAnimation` 与 `trigger6yoVictory`
在 `logic/js/games.js` 中重构这两个引擎函数。

**Files:**
- Modify: `logic/js/games.js:54-160, 359-365`

- [ ] **Step 1: 重写 `trigger6yoVictory` 实现果果与淼淼积分、答题和发牌机制的完全统一**

```javascript
function trigger6yoVictory(ignoredStarParam, speechFeedback) {
  const type = window.currentGameTrack;
  if (!type) { console.warn("currentGameTrack not set"); return; }

  const currentPlayerId = window.currentPlayerId || 'dabao';
  const isErbao = currentPlayerId === 'erbao';
  const player = appState.players[currentPlayerId];

  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
  }
  
  const level = window.isMixedMode ? (player.progress.mixed || 1) : (player.progress[type] || 1);

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
  if (window.isMixedMode) {
    player.progress.mixed = (player.progress.mixed || 1) + 1;
  } else {
    if (typeof player.progress[type] !== 'number') player.progress[type] = 1;
    player.progress[type]++;
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
  }, 1800); // Extended slightly to let them read the cool breakdown
}
```

- [ ] **Step 2: 重构 `showSpatialHelpAnimation` 头行，支持空值回退全局缓存变量**

```javascript
function showSpatialHelpAnimation(type, original, hint, title = '') {
  if (!original && window.currentSpatialQuestion) {
    const q = window.currentSpatialQuestion;
    original = q.original || q.matrix[0];
    hint = q.hint;
    title = q.title || q.text || '';
  }

  const styleId = 'spatial-help-animation-styles';
  if (!document.getElementById(styleId)) {
```

- [ ] **Step 3: 提交代码并提交信息**
```bash
git add logic/js/games.js
git commit -m "refactor(scoring): unify scoring and progression for both kids and implement help parameter fallback"
```

---

### Task 2: 修复 `spatial.js` 和 `pattern.js` 的演示按钮绑定
移除两个游戏脚本中的内联传参，改为在题目加载时写入 `window.currentSpatialQuestion`。

**Files:**
- Modify: `logic/js/games/spatial.js:83-84, 107, 121-122, 135`
- Modify: `logic/js/games/pattern.js:20-23, 32, 34`

- [ ] **Step 1: 修改 `logic/js/games/spatial.js` 镜像和旋转关卡的按钮绑定与缓存**

修改 `launchSpatial`，在加载镜像和旋转题目时写入 `window.currentSpatialQuestion`，并精简 `showSpatialHelpAnimation` 调用：

```javascript
    // 题型B：镜像对称
    const q = MIRROR_QUESTIONS[qIdx];
    window.currentSpatialQuestion = q; // 写入全局缓存，防止引号解析Bug
    const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
```
将镜像的动画按钮修改为：
```html
<button class="mock-button glow-success" onclick="showSpatialHelpAnimation('mirror')" style="padding:3px 10px;font-size:0.8em;margin-top:0;border-radius:15px;display:inline-flex;align-items:center;gap:4px;">🎬 观看动画演示</button>
```

在旋转关卡中写入缓存：
```javascript
    // 题型C：图形旋转
    const q = ROTATION_QUESTIONS[qIdx];
    window.currentSpatialQuestion = q; // 写入全局缓存，防止引号解析Bug
    const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
```
将旋转的动画按钮修改为：
```html
<button class="mock-button glow-success" onclick="showSpatialHelpAnimation('rotate')" style="padding:3px 10px;font-size:0.8em;margin-top:0;border-radius:15px;display:inline-flex;align-items:center;gap:4px;">🎬 观看动画演示</button>
```

- [ ] **Step 2: 修改 `logic/js/games/pattern.js` 矩阵关卡的按钮绑定与缓存**

修改 `launchPattern`，在加载图形矩阵推理题目时写入 `window.currentSpatialQuestion` 并精简动画按钮调用：

```javascript
    q = getDynamicPattern(qIdx, phase);
  }

  window.currentSpatialQuestion = q; // 写入全局缓存，防止引号解析Bug
  currentPatternAnswer = q.ans.toString();
```
将动画按钮 HTML 修改为：
```javascript
  let helpBtnHTML = '';
  if (q.hint && (q.hint.includes('镜像') || q.hint.includes('对称') || q.hint.includes('折叠'))) {
    helpBtnHTML = `<button class="mock-button glow-success" onclick="showSpatialHelpAnimation('mirror')" style="padding:3px 10px;font-size:0.8em;margin-top:0;border-radius:15px;display:inline-flex;align-items:center;gap:4px;margin-bottom:0;">🎬 观看动画演示</button>`;
  } else if (q.hint && (q.hint.includes('旋转') || q.hint.includes('转动') || q.hint.includes('针'))) {
    helpBtnHTML = `<button class="mock-button glow-success" onclick="showSpatialHelpAnimation('rotate')" style="padding:3px 10px;font-size:0.8em;margin-top:0;border-radius:15px;display:inline-flex;align-items:center;gap:4px;margin-bottom:0;">🎬 观看动画演示</button>`;
  }
```

- [ ] **Step 3: 提交代码并提交信息**
```bash
git add logic/js/games/spatial.js logic/js/games/pattern.js
git commit -m "fix(help): resolve spatial help animation click failure by removing inline json arguments"
```

---

### Task 3: 检验与清理
运行 `git status` 确保全部干净提交，并做语法自查。

- [ ] **Step 1: 检查 Git 工作区状态**
- [ ] **Step 2: 推送代码交付**
```bash
git push origin master
```
