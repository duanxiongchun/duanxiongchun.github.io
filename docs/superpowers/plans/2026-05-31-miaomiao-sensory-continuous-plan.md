# 🐰 淼淼启蒙舱多端连续出题智能重构计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现淼淼（2岁）在色彩、形状分类及声音探测匹配时的“连续自动出题”流程，用萌兔胜利画面和 2 秒倒计时自动转场替换原有的干扰性单题弹窗与退出大厅设计。

**Architecture:** 全局记录 `window.currentSensoryTrack` 以缓存当前题目类别。重构答题判定成功处，调用统一的新增胜利分发器 `trigger2yoVictory(type, feedback)`，自动发放 10 颗星星，渲染圆角亮黄色萌兔玻璃卡片，中文 TTS 赞扬语音同时发声，并在延时 2 秒后自动重新加载同轨道的下一题（`launchSensory(type)`），形成完美的幼儿答题心流闭环。

**Tech Stack:** HTML5, CSS3 GPU Keyframes, Vanilla JavaScript, Web Audio API

---

### Task 1: 重构 `sensory.js` 实现自动出题与萌兔胜利引擎
修改 `logic/js/sensory.js` 的答题入口、胜利检测，并增加全新的 2 岁幼儿专属胜利分发引擎。

**Files:**
- Modify: `logic/js/sensory.js` (第 1 行起，以及第 247-260 行，第 372-387 行)

- [ ] **Step 1: 在 `launchSensory` 开头注册轨道缓存**

在 `launchSensory(type)` 函数的最开始，加入 `window.currentSensoryTrack = type;`。

```javascript
function launchSensory(type) {
  window.currentSensoryTrack = type;
  // Lock screen scrolling during early sensory gameplay to prevent iPad dragging conflict
  lockViewportScrolling();
```

- [ ] **Step 2: 重构声音判断 `guessSensorySound` 胜利触发**

定位到 `guessSensorySound` 函数，将答对时的 `alert` 弹窗与返回大厅，改为调用 `trigger2yoVictory`：

```javascript
function guessSensorySound(guessedType) {
  if (guessedType === window.sensoryTargetSound.type) {
    playSensorySound(guessedType);
    
    const feedback = `答对啦！真的是【${window.sensoryTargetSound.name}】在叫！\n淼淼真棒！奖励 10 颗星星！🌟`;
    trigger2yoVictory(window.currentSensoryTrack || 'sound', feedback);
  } else {
    alert("❌ 不对哦。淼淼，再点小喇叭仔细听一下，猜猜这到底是谁的声音呢？🐰");
  }
}
```

- [ ] **Step 3: 重构分类匹配 `checkSensoryVictory` 胜利触发**

定位到 `checkSensoryVictory` 函数，将答对时的 `alert` 弹窗与返回大厅，改为调用 `trigger2yoVictory`：

```javascript
function checkSensoryVictory() {
  const draggables = document.querySelectorAll('.drag-item');
  const allSolved = Array.from(draggables).every(item => item.style.visibility === "hidden");
  
  if (allSolved) {
    setTimeout(() => {
      const feedback = "太牛了！淼淼把所有颜色或形状都完美配对好了！奖励 10 颗星星！🌟";
      trigger2yoVictory(window.currentSensoryTrack || 'shape', feedback);
    }, 400);
  }
}
```

- [ ] **Step 4: 在 `sensory.js` 底部追加 `trigger2yoVictory` 胜利分发器与 UI**

在文件最末尾，定义并实现 `trigger2yoVictory`，生成亮黄渐变磨砂胜利浮层与 2 秒计时器重载。

```javascript
function trigger2yoVictory(type, speechFeedback) {
  if (!appState.players || !appState.players.erbao) initAppState();
  const player = appState.players.erbao;

  const earnedStars = 10;
  player.stars = (player.stars || 0) + earnedStars;
  saveAppState();

  // 更新 HUD 星星数
  const starEl = document.getElementById("star-count");
  if (starEl) starEl.innerText = `🪙 ${player.stars}`;

  // 播放好听的和弦声音
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(523.25, ctx.currentTime); 
    o.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); 
    o.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); 
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    o.start(); o.stop(ctx.currentTime + 0.35);
  } catch(err){}

  const container = document.getElementById("game-stage");
  container.innerHTML = `
    <div class="glass-card" style="padding:40px; text-align:center; max-width:500px; margin:40px auto; border-color:#fbbf24; background:rgba(251,191,36,0.08); border-width:2px; animation:pulseGlow 1.2s infinite ease-in-out;">
      <span style="font-size:5em; display:block; margin-bottom:10px;">🐰</span>
      <h2 style="color:#fbbf24; font-weight:800; margin-bottom:5px;">淼淼宝宝太棒啦！</h2>
      <p style="font-size:1.15em; color:#fff; font-weight:600; margin-bottom:15px;">${speechFeedback.replace(/\n/g, '<br>')}</p>
      
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:12px; margin:15px 0; font-size:1em; color:#fde68a;">
        获得奖励：<span style="font-weight:bold; font-size:1.2em;">🌟 +${earnedStars} 颗星星</span>
      </div>
      
      <p style="font-size:0.85em; color:#fbbf24; letter-spacing:1px; animation:blinker 1s linear infinite; margin-top:20px;">下一题马上要开始喽，准备好了吗？🚀</p>
    </div>
  `;

  // 播放语音
  speakText(speechFeedback);

  // 2 秒后自动出下一题
  setTimeout(() => {
    launchSensory(type);
  }, 2000);
}
```

- [ ] **Step 5: 提交代码并提交信息**

```bash
git add logic/js/sensory.js
git commit -m "feat(sensory): implement continuous gameplay flow and kid-friendly victory engine for erbao"
```

---

### Task 2: 全局集成与多端测试验证
确认修改完成后，运行验证检查，确保没有遗留的语法错误并且 iPad 视口无滚动条冲突。

- [ ] **Step 1: 全局运行状态及语法健全性检查**

运行 `git status` 确认所有变动已干净提交。
