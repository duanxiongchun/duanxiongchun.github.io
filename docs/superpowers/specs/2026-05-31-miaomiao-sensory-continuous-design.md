# 🐰 淼淼启蒙舱（2岁）多端连续出题与视觉胜利引擎设计规范 (Sensory Continuous Play Specs)

本设计规范详述了如何为 2 岁幼儿淼淼（Erbao）重构启蒙舱（色彩、形状、声音分类配对）的通关体验，用无感流畅的“连续自动出题”替换烦琐的“单题弹窗拦截并强行退出”设计，提供连贯沉浸的心流体验。

---

## 🔍 一、 体验漏洞诊断

### 1. 单题截断 (Single-Question Interruption)
* **表现**：淼淼在完成一关“形状分类”、“色彩匹配”或“声音探测”后，网页会弹出浏览器默认的 `alert` 确认框。点击“确定”后，界面强制退回到启蒙大厅（`loadErbaoHUD()`）。
* **痛点**：对于 2 岁幼童而言，每次完成题目都要强制退出大厅并要求其重新用手指点击进入，极大地打断了认知专注力，容易导致幼儿产生挫败感或操作不知所措。
* **修复**：实现类似果果（Dabao）的**“胜利演示与自动发牌”**引擎。淼淼答对时，在当前页面直接渲染萌兔胜利卡，伴以喜悦声音与奖励统计，倒计时 2 秒后自动加载同类别下的下一道题目，实现无限不间断答题。

---

## 🛠️ 二、 系统架构设计与交互逻辑规范

### 1. 全局传感器轨道缓存 (Track Caching)
* 在 `launchSensory(type)` 入口函数处，使用 `window.currentSensoryTrack = type` 对当前的启蒙舱特训类别（`'shape' | 'color' | 'sound'`）进行全局缓存。
* 在触发匹配胜利时，即可读取该缓存以无缝重新加载下一个循环。

### 2. 幼童专属胜利引擎 `trigger2yoVictory(type, feedback)`
当淼淼成功填满所有匹配槽（颜色、形状）或猜对声音时，摒弃 `alert` 及 `loadErbaoHUD`，调用此方法：

```javascript
function trigger2yoVictory(type, speechFeedback) {
  if (!appState.players || !appState.players.erbao) initAppState();
  const player = appState.players.erbao;

  // 1. 发放金币
  const earnedStars = 10;
  player.stars = (player.stars || 0) + earnedStars;
  saveAppState();

  // 2. 刷新屏幕 HUD 上的金币显示
  const starEl = document.getElementById("star-count");
  if (starEl) starEl.innerText = `🪙 ${player.stars}`;

  // 3. 播放合成欢乐上行和弦声音
  playVictoryMelody();

  // 4. 渲染萌兔胜利卡片
  render2yoVictoryUI(speechFeedback, earnedStars);

  // 5. 中文语音合成夸奖
  speakText(speechFeedback);

  // 6. 2 秒后自动出下一题
  setTimeout(() => {
    launchSensory(type);
  }, 2000);
}
```

### 3. 胜利界面设计 (UI Aesthetics)
渲染一个拥有萌兔 🐰 标志的亮黄色玻璃渐变卡片（`border-color: #fbbf24`），配合大字号的星星获取展示，并提供“下一题正在赶来... 🚀”微动画提示。

---

## 🔒 三、 修改影响的范围与文件

* **修改文件**：`logic/js/sensory.js`
* **更新接口**：
  * `launchSensory(type)`：追加当前轨道记录。
  * `guessSensorySound(guessedType)`：用 `trigger2yoVictory` 替换 `alert + loadErbaoHUD`。
  * `checkSensoryVictory()`：用 `trigger2yoVictory` 替换 `alert + loadErbaoHUD`。
  * 新增 `trigger2yoVictory(type, speechFeedback)`。
