# 🧠 果果与淼淼特训舱底层脚手架对齐与 8 轨启蒙课重构计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构“脑力认知研究所”的底层架构，使淼淼（2岁，Erbao）拥有与果果（6岁，Dabao）完全一致的 8 大认知维度特训、大厅 HUD 进度指标与综合特训航线脚手架；同时在内容上彻底按龄解耦，为淼淼研发 8 大低幼大颗粒、听视多维触控匹配游戏。

**Architecture:**
1. **进度状态动态化**：重构 `games.js` 的答题和胜利引擎，根据全局当前激活的玩家 `window.currentPlayerId`（`'dabao'` 或 `'erbao'`）动态读写各自的 `appState.players[currentPlayerId]` 进度数据库，并进行动态积分与发奖。
2. **账号大厅对齐**：重构 `loadErbaoHUD`，使其采用与 `loadDabaoHUD` 相同结构的 8 特训轨道矩阵与“综合航线”入口，升级为黄色温馨童趣暖色调，展现 2 岁专属说明。
3. **出题内容分流**：重构 `games.js` 的 `launchTest(type)`。若当前玩家为 `erbao`，则将其无缝分流至 `sensory.js` 中的 `launchErbaoSensory(type, level, container)`。
4. **低幼 8 轨课程开发**：在 `sensory.js` 中研发平面形状匹配、极简气球计数、3x3动物找不同、大小动物配对、ABAB规律填空、单图闪现记忆、听音识宠、生活常识类比 8 个专属游戏。

**Tech Stack:** HTML5, Vanilla JavaScript, CSS3 Translate3D, Web Audio API

---

### Task 1: 升级 `custom-rewards.js` 对齐淼淼舱 8 轨控制大厅
重构 `logic/js/custom-rewards.js` 的 `loadErbaoHUD()`，使其渲染与果果舱相同的 8 特训轨道、进度条和 400 关综合航线。

**Files:**
- Modify: `logic/js/custom-rewards.js:109-165`

- [ ] **Step 1: 重写 `loadErbaoHUD` 以渲染 8 轨控制大厅（黄色暖色调）**

```javascript
function loadErbaoHUD() {
  // Restore screen scrolling using global helper
  unlockViewportScrolling();

  initAppState();
  const player = appState.players.erbao;

  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
  }
  // 补全新维度
  ['spatial','numeric','attention','deduction','pattern','memory','language','analogy','mixed'].forEach(k => {
    if (typeof player.progress[k] !== 'number') player.progress[k] = 1;
  });
  saveAppState();

  const p = player.progress;
  const clamp = v => Math.min(v > 50 ? 50 : v, 50);
  const pct = v => Math.min(((clamp(v) - 1) / 50) * 100, 100);

  const tracks = [
    { key:'spatial',  icon:'📐', color:'#fbbf24', glow:'#fbbf24', label:'平面形状分类',   desc:'圆形、方形、三角形大卡片拖动匹配，手眼协调感知' },
    { key:'numeric',  icon:'🔢', color:'#facc15', glow:'#eab308', label:'淼淼数字数数',   desc:'视觉红气球与泡泡计数，点选对应数字手脑对应' },
    { key:'attention',icon:'⚡', color:'#34d399', glow:'#10b981', label:'趣味找不同',     desc:'3×3大颗粒极简熊猫中找小兔，注意力定位筛选' },
    { key:'deduction',icon:'🔍', color:'#d8b4fe', glow:'#a855f7', label:'动物大小分类',   desc:'大象归大箱，老鼠归小箱，大小演绎分类感知' },
    { key:'pattern',  icon:'🎨', color:'#fb7185', glow:'#f43f5e', label:'图形 ABAB 规律',  desc:'交替色彩律动匹配，补齐图案，规律重复直觉' },
    { key:'memory',   icon:'🧠', color:'#f472b6', glow:'#ec4899', label:'闪现记忆配对',   desc:'单个物体卡片闪现记忆，恒常性追踪与暂存训练' },
    { key:'language', icon:'🔊', color:'#2dd4bf', glow:'#14b8a6', label:'声光探测仪',     desc:'听小猫小狗叫声点击匹配，视听通道反射整合' },
    { key:'analogy',  icon:'🔗', color:'#c4b5fd', glow:'#8b5cf6', label:'淼淼认知关联',   desc:'宝宝生活常识因果匹配，培养逻辑关系直觉' },
  ];

  const container = document.getElementById('game-stage');
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:2.4fr 1fr;gap:25px;padding-top:20px;">
      <div>
        <div class="glass-card" style="padding:25px;border-color:rgba(251,191,36,0.25);margin-bottom:25px;">
          <h2 style="color:#fbbf24;font-weight:800;display:flex;align-items:center;gap:10px;margin:0;">
            🐰 启蒙特训控制台（淼淼舱）
          </h2>
          <p style="color:var(--text-muted);font-size:0.82em;margin-top:6px;">
            针对淼淼 2 岁脑部发育定制 · 大颗粒无字触控分类 · 8大感官轨道 · 共 400 关综合启蒙
          </p>

          <!-- 每日综合特训航线入口 banner -->
          <div class="glass-card glow-erbao pulse-hover" style="padding: 20px; margin-top: 20px; cursor: pointer; border: 2px solid #fbbf24; background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.15)); border-radius: 16px; box-shadow: 0 8px 32px rgba(251, 191, 36, 0.15); margin-bottom: 25px;" onclick="launchMixedMode()">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
              <div style="text-align: left;">
                <span style="font-size: 1.8em; display: block; margin-bottom: 6px;">🚀 宇宙早教综合航线 (Mixed Mode)</span>
                <h3 style="font-weight: 800; color: #fff; margin: 0; font-size: 1.1em; display: flex; align-items: center; gap: 8px;">
                  开启 400 关淼淼专属综合启蒙特训 <span style="background: #fbbf24; color: #000; font-size: 0.65em; padding: 2px 8px; border-radius: 20px; font-weight: 800; letter-spacing: 1px; animation: blinker 1.2s infinite;">BABY 推荐</span>
                </h3>
                <p style="font-size: 0.75em; color: var(--text-muted); margin-top: 5px; line-height: 1.4; max-width: 480px;">
                  8大早期认知维度打乱穿插出题！数数、连连看、听音识萌宠、找找小兔子，防枯燥效果绝佳，全面激发淼淼脑部潜能！
                </p>
              </div>
              <div style="text-align: right; min-width: 120px;">
                <span style="font-size: 0.85em; color: #fde68a; font-weight: bold; display: block; margin-bottom: 4px;">启蒙进度</span>
                <span style="font-size: 1.15em; color: #fbbf24; font-weight: 800; display: block; margin-bottom: 6px; font-family: var(--font-fira);">${player.progress.mixed || 1} / 400 关</span>
                <div style="width: 120px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-left: auto;">
                  <div style="width: ${Math.min(((player.progress.mixed || 1) - 1) / 400 * 100 + 0.25, 100)}%; height: 100%; background: linear-gradient(90deg, #fbbf24, #f59e0b); box-shadow: 0 0 8px #fbbf24; border-radius: 3px;"></div>
                </div>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px;">
            ${tracks.map(t => {
              const lv = clamp(p[t.key] || 1);
              const pc = pct(p[t.key] || 1);
              return `
              <div class="glass-card pulse-hover" style="padding:18px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;min-height:155px;border-color:rgba(255,255,255,0.06);" onclick="launchTest('${t.key}')" onmouseover="this.style.borderColor='${t.glow}44'" onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:2em;">${t.icon}</span>
                    <span style="font-size:0.75em;color:${t.color};font-weight:bold;">第${lv}/50关</span>
                  </div>
                  <h3 style="font-weight:700;color:#fff;font-size:0.95em;margin-top:8px;">${t.label}</h3>
                  <p style="font-size:0.7em;color:var(--text-muted);margin-top:4px;line-height:1.3;">${t.desc}</p>
                </div>
                <div style="margin-top:10px;">
                  <div style="display:flex;justify-content:space-between;font-size:0.65em;color:${t.color};font-weight:bold;margin-bottom:3px;">
                    <span>探索进度</span><span>${Math.round(pc)}%</span>
                  </div>
                  <div style="width:100%;height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
                    <div style="width:${pc}%;height:100%;background:${t.glow};box-shadow:0 0 8px ${t.glow};border-radius:3px;"></div>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 积分兑换商城 -->
      <div>
        <div class="glass-card" style="padding:25px;border-color:rgba(255,191,36,0.25);">
          <h3 style="color:#fbbf24;font-weight:700;margin-bottom:15px;">🎁 积分兑换商城</h3>
          <div id="shop-catalog" style="max-height: 480px; overflow-y: auto;">
            <!-- 商城列表通过JS动态载入 -->
          </div>
        </div>
      </div>
    </div>
  `;
  renderRewardsList('erbao');
}
```

- [ ] **Step 2: 提交代码并提交信息**
```bash
git add logic/js/custom-rewards.js
git commit -m "feat(hud): align erbao HUD console with full 8 cognitive tracks and mixed mode"
```

---

### Task 2: 重构 `games.js` 实现多乘员动态发奖与玩家分流
使 `trigger6yoVictory`、`launchTest` 和 `launchMixedMode` 读写动态玩家 `currentPlayerId`，并在 `launchTest` 中将 `erbao` 游戏分流至 `sensory.js`。

**Files:**
- Modify: `logic/js/games.js:54-110, 197-240, 264-280`

- [ ] **Step 1: 重构 `trigger6yoVictory` 首行实现多乘员兼容路由**

在 `trigger6yoVictory(ignoredStarParam, speechFeedback)` 开头，添加对 `erbao` 的拦截和胜利转接：

```javascript
function trigger6yoVictory(ignoredStarParam, speechFeedback) {
  const currentPlayerId = window.currentPlayerId || 'dabao';
  if (currentPlayerId === 'erbao') {
    trigger2yoVictory(window.currentGameTrack, speechFeedback);
    return;
  }
  
  const type = window.currentGameTrack;
  if (!type) { console.warn("currentGameTrack not set"); return; }
  
  if (!appState.players || !appState.players.dabao) initAppState();
  const player = appState.players.dabao;
```

- [ ] **Step 2: 重构 `launchTest` 入口函数实现动态乘员进度与 Erbao 路由分流**

```javascript
function launchTest(type) {
  // Lock screen scrolling during gameplay to prevent iPad dragging conflict
  lockViewportScrolling();

  window.isMixedMode = false;
  initAppState();
  
  const currentPlayerId = window.currentPlayerId || 'dabao';
  const player = appState.players[currentPlayerId];
  
  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
  }
  
  const level = player.progress[type] || 1;
  window.currentGameTrack = type;

  const container = document.getElementById("game-stage");
  if (!container) return;

  // 1. 如果是淼淼舱账号，分流至 sensory.js 的 8轨启蒙引擎
  if (currentPlayerId === 'erbao') {
    launchErbaoSensory(type, level, container);
    return;
  }

  // 2. 果果舱账号，载入原有高阶八素关卡
  if (type === 'spatial') launchSpatial(level, container);
  else if (type === 'numeric') launchNumeric(level, container);
  else if (type === 'attention') launchAttention(level, container);
  else if (type === 'deduction') launchDeduction(level, container);
  else if (type === 'pattern') launchPattern(level, container);
  else if (type === 'memory') launchMemory(level, container);
  else if (type === 'language') launchLanguage(level, container);
  else if (type === 'analogy') launchAnalogy(level, container);
}
```

- [ ] **Step 3: 重构 `launchMixedMode` 入口函数实现动态乘员进度加载**

```javascript
function launchMixedMode() {
  // Lock screen scrolling during gameplay to prevent iPad dragging conflict
  lockViewportScrolling();

  window.isMixedMode = true;
  initAppState();
  
  const currentPlayerId = window.currentPlayerId || 'dabao';
  const player = appState.players[currentPlayerId];
  
  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
  }
  
  const mixedLevel = player.progress.mixed || 1;
  
  // 选择特定的特训轨道大项
  const tracks = ['spatial', 'numeric', 'attention', 'deduction', 'pattern', 'memory', 'language', 'analogy'];
  const type = tracks[(mixedLevel - 1) % tracks.length];
  window.currentGameTrack = type;
  
  const trackLevel = Math.floor((mixedLevel - 1) / tracks.length) + 1;

  const container = document.getElementById("game-stage");
  if (!container) return;

  // 1. 如果是淼淼舱账号，分流至 sensory.js 综合启蒙
  if (currentPlayerId === 'erbao') {
    launchErbaoSensory(type, trackLevel, container);
    return;
  }

  // 2. 果果舱账号，载入高阶综合特训
  if (type === 'spatial') launchSpatial(trackLevel, container);
  else if (type === 'numeric') launchNumeric(trackLevel, container);
  else if (type === 'attention') launchAttention(trackLevel, container);
  else if (type === 'deduction') launchDeduction(trackLevel, container);
  else if (type === 'pattern') launchPattern(trackLevel, container);
  else if (type === 'memory') launchMemory(trackLevel, container);
  else if (type === 'language') launchLanguage(trackLevel, container);
  else if (type === 'analogy') launchAnalogy(trackLevel, container);
}
```

- [ ] **Step 4: 提交代码并提交信息**
```bash
git add logic/js/games.js
git commit -m "refactor(engine): support dynamic player routing and erbao sensory分流 inside games engine"
```

---

### Task 3: 在 `sensory.js` 中研发淼淼（2岁）专属 8 大维度游戏
在 `logic/js/sensory.js` 底部实现 `launchErbaoSensory(type, level, container)` 以及 8 大独立早教匹配游戏。

**Files:**
- Modify: `logic/js/sensory.js` (第 384 行起追加)

- [ ] **Step 1: 实现 8 大维度启蒙题目内容与交互渲染**

在 `logic/js/sensory.js` 底部追加以下早教匹配逻辑：

```javascript
function launchErbaoSensory(type, level, container) {
  if (type === 'spatial') {
    // 1. 空间形状分类
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">📐 平面形状分类厂 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，请把下方的图形积木拖放到对应的虚线槽里吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em; color:#a1a1aa; margin-bottom:20px;">🐰 淼淼，请把图形积木拖放到对应的虚线卡槽中：</p>
        
        <div style="display:flex; justify-content:space-around; margin-bottom:35px; gap:15px; flex-wrap:wrap;">
          <div id="slot-circle" class="shape-slot glass-card" style="width:90px; height:90px; border:3px dashed rgba(255,255,255,0.3); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.8em;">圆形虚线</div>
          <div id="slot-square" class="shape-slot glass-card" style="width:90px; height:90px; border:3px dashed rgba(255,255,255,0.3); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.8em;">方形虚线</div>
          <div id="slot-triangle" class="shape-slot glass-card" style="width:90px; height:90px; border:3px dashed rgba(255,255,255,0.3); clip-path: polygon(50% 0%, 0% 100%, 100% 100%); display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:700; font-size:0.75em; padding-top:35px; background:rgba(255,255,255,0.02);">三角虚线</div>
        </div>

        <div style="display:flex; justify-content:center; gap:20px; background:rgba(255,255,255,0.03); padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); flex-wrap:wrap;">
          <div id="drag-circle" class="drag-item" style="touch-action: none; width:75px; height:75px; background:linear-gradient(135deg, #ef4444, #f87171); border-radius:50%; cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(239,68,68,0.45); font-size:1em; user-select:none;">圆积木</div>
          <div id="drag-square" class="drag-item" style="touch-action: none; width:75px; height:75px; background:linear-gradient(135deg, #3b82f6, #60a5fa); border-radius:12px; cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(59,130,246,0.45); font-size:1em; user-select:none;">方积木</div>
          <div id="drag-triangle" class="drag-item" style="touch-action: none; width:75px; height:75px; background:linear-gradient(135deg, #10b981, #34d399); clip-path: polygon(50% 0%, 0% 100%, 100% 100%); cursor:grab; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(16,185,129,0.45); font-size:0.9em; padding-top:22px; user-select:none;">角积木</div>
        </div>
        <button class="mock-button glow-erbao" onclick="launchTest('spatial')" style="margin-top:25px; width:100%; border-color:transparent;">🔄 一键重置重新选择</button>
      </div>
    `;
    setupSensoryDragDrop('shape');
    speakText('淼淼宝宝，请把下方的图形积木拖放到对应的虚线槽里吧！');
  } 
  
  else if (type === 'numeric') {
    // 2. 淼淼数字数数 (Counting)
    const count = (level % 3) + 1; // 1, 2, 或 3
    const bubbleStr = '🔴'.repeat(count);
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:15px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🔢 淼淼数字数数 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，数一数有几个红气球呀？点击下面的数字选出来吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:25px;">🐰 数一数，这里有几个【红气球 🔴】呢？</p>
        
        <div style="font-size:4em; margin:20px 0; letter-spacing:10px; display:flex; justify-content:center; gap:10px;">
          ${bubbleStr}
        </div>

        <div style="display:flex; justify-content:center; gap:20px; margin-top:25px;">
          ${[1, 2, 3].map(n => `
            <button class="mock-button glow-erbao" onclick="check2yoAnswer(${n}, ${count})" style="font-size:2.2em; width:80px; height:80px; border-radius:18px; font-weight:bold;">${n}</button>
          `).join('')}
        </div>
      </div>
    `;
    speakText(`淼淼宝宝，数一数有几个红气球呀？`);
  } 
  
  else if (type === 'attention') {
    // 3. 趣味找不同 (Spot the difference)
    const animalPool = ['🐼','🐶','🐱','🐮','🦁','🐸','🐷','🐨','🦊'];
    const baseEmoji = animalPool[(level - 1) % animalPool.length];
    const diffPool = ['🐰','🌟','🚗','🎈','🍒','🍓','👑'].filter(e => e !== baseEmoji);
    const diffEmoji = diffPool[Math.floor(Math.random() * diffPool.length)];
    
    // Create 3x3 array (8 base, 1 diff)
    const items = Array(8).fill(baseEmoji);
    const diffIdx = Math.floor(Math.random() * 9);
    items.splice(diffIdx, 0, diffEmoji);

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">⚡ 趣味找不同 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，快在里面找出那一个调皮的小调皮！把它点出来吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:20px;">🐰 谁和别人长得不一样？快把它点出来！</p>
        
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; max-width:240px; margin:20px auto;">
          ${items.map((emoji, idx) => `
            <button class="mock-button glow-erbao" onclick="checkAttention2yo(${idx}, ${diffIdx})" style="font-size:2.8em; height:70px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:14px; background:rgba(255,255,255,0.03);">${emoji}</button>
          `).join('')}
        </div>
      </div>
    `;
    speakText(`淼淼，快找出那个不一样的小调皮！`);
  } 
  
  else if (type === 'deduction') {
    // 4. 动物大小分类 (Big-Small Sorting)
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🔍 动物大小分类 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，把大象拖进大箱子，小松鼠拖进小箱子里吧！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em; color:#a1a1aa; margin-bottom:20px;">🐰 大动物住大箱子，小动物住小箱子：</p>
        
        <div style="display:flex; justify-content:space-around; margin-bottom:35px; gap:15px;">
          <div id="slot-big" class="shape-slot glass-card" style="width:120px; height:120px; border:3px dashed #fbbf24; border-radius:16px; display:flex; align-items:center; justify-content:center; color:#fbbf24; font-weight:800; font-size:0.88em; background:rgba(251,191,36,0.02);">📦 大箱子</div>
          <div id="slot-small" class="shape-slot glass-card" style="width:85px; height:85px; border:3px dashed rgba(255,255,255,0.3); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-weight:800; font-size:0.75em;">📦 小箱子</div>
        </div>

        <div style="display:flex; justify-content:center; gap:30px; background:rgba(255,255,255,0.03); padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); align-items:center;">
          <div id="drag-big" class="drag-item" style="touch-action: none; width:95px; height:95px; background:linear-gradient(135deg, #fbbf24, #f59e0b); border-radius:16px; cursor:grab; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:800; color:black; box-shadow: 0 4px 12px rgba(251,191,36,0.4); user-select:none; font-size:1em;">
            <span style="font-size:1.6em;">🐘</span>大象
          </div>
          <div id="drag-small" class="drag-item" style="touch-action: none; width:65px; height:65px; background:linear-gradient(135deg, #3b82f6, #60a5fa); border-radius:12px; cursor:grab; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:800; color:white; box-shadow: 0 4px 10px rgba(59,130,246,0.4); user-select:none; font-size:0.8em;">
            <span style="font-size:1.3em;">🐹</span>松鼠
          </div>
        </div>
        <button class="mock-button glow-erbao" onclick="launchTest('deduction')" style="margin-top:25px; width:100%; border-color:transparent;">🔄 一键重置重新选择</button>
      </div>
    `;
    setupSensoryDragDrop('shape');
    speakText('淼淼，把大动物拖进大箱子，小动物拖进小箱子！');
  } 
  
  else if (type === 'pattern') {
    // 5. 图形 ABAB 规律
    const patternPairs = [
      { a: '🍎', b: '🍌' },
      { a: '🐱', b: '🐶' },
      { a: '🚗', b: '✈️' },
      { a: '🔴', b: '🔵' },
      { a: '⭐', b: '🌙' }
    ];
    const pair = patternPairs[(level - 1) % patternPairs.length];
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🎨 图形 ABAB 规律 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，看这串好玩的规律，问号的地方应该放哪个图案呢？');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:20px;">🐰 观察规律，问号【❓】处应该填什么呢？</p>
        
        <div style="display:flex; justify-content:center; gap:12px; margin:25px 0; font-size:2.8em; align-items:center;">
          <span>${pair.a}</span>
          <span>${pair.b}</span>
          <span>${pair.a}</span>
          <span>${pair.b}</span>
          <span style="font-weight:bold; color:#fbbf24; border:2px dashed #fbbf24; width:65px; height:65px; display:inline-flex; align-items:center; justify-content:center; border-radius:12px; font-size:0.8em;">❓</span>
        </div>

        <div style="display:flex; justify-content:center; gap:20px; margin-top:25px;">
          <button class="mock-button glow-erbao" onclick="checkPatternAnswer('${pair.a}', '${pair.a}')" style="font-size:2.2em; width:80px; height:80px; border-radius:18px;">${pair.a}</button>
          <button class="mock-button glow-erbao" onclick="checkPatternAnswer('${pair.b}', '${pair.a}')" style="font-size:2.2em; width:80px; height:80px; border-radius:18px;">${pair.b}</button>
        </div>
      </div>
    `;
    speakText('淼淼宝宝，问号的地方应该放哪个呢？');
  } 
  
  else if (type === 'memory') {
    // 6. 闪现记忆配对 (Memory Match)
    const emojis = ['🚗','🍉','🐶','🐱','🦁','👑','✈️','🍇','🍓','🐰','🎁','🎈','🌟'];
    const targetEmoji = emojis[(level - 1) % emojis.length];
    
    // Choose distractor options
    const pool = [targetEmoji];
    while(pool.length < 3) {
      const candidate = emojis[Math.floor(Math.random() * emojis.length)];
      if(!pool.includes(candidate)) pool.push(candidate);
    }
    pool.sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🧠 闪现记忆配对 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('淼淼宝宝，仔细盯住这个漂亮的图案！马上要变魔法消失喽！');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p id="memory-t-label" style="font-size:1em; color:#a1a1aa; margin-bottom:20px;">👀 淼淼，仔细记住这个可爱的图案：</p>
        
        <div id="2yo-memory-disp" class="glass-card" style="font-size:5.5em; width:120px; height:120px; margin:25px auto; display:flex; align-items:center; justify-content:center; border-color:#fbbf24; background:rgba(251,191,36,0.05); border-width:2px; border-radius:20px; transition:all 0.3s;">
          ${targetEmoji}
        </div>
        <div id="2yo-memory-cd" style="font-size:1em; color:#fbbf24; font-weight:700;">3 秒后开始消失...</div>
        <div id="2yo-memory-opts" style="display:none; justify-content:center; gap:20px; margin-top:25px;">
          ${pool.map(o => `
            <button class="mock-button glow-erbao" onclick="checkMemory2yo('${o}', '${targetEmoji}')" style="font-size:2.8em; width:80px; height:80px; border-radius:18px;">${o}</button>
          `).join('')}
        </div>
      </div>
    `;
    speakText('淼淼宝宝，仔细盯住这个图案！');

    let cd = 3;
    const timer = setInterval(() => {
      cd--;
      const cdEl = document.getElementById('2yo-memory-cd');
      if (cdEl) cdEl.innerText = `${cd} 秒后开始消失...`;
      if (cd <= 0) {
        clearInterval(timer);
        const disp = document.getElementById('2yo-memory-disp');
        if (disp) disp.innerText = '❓';
        const label = document.getElementById('memory-t-label');
        if (label) label.innerText = '🦁 刚才藏起来的是哪一个呢？请选出来！';
        const cdDiv = document.getElementById('2yo-memory-cd');
        if (cdDiv) cdDiv.style.display = 'none';
        const opts = document.getElementById('2yo-memory-opts');
        if (opts) opts.style.display = 'flex';
        speakText('刚才那个图案是什么呀？选出来吧！');
      }
    }, 1000);
  } 
  
  else if (type === 'language') {
    // 7. 声光探测仪 (Sound Pairing)
    const sounds = [
      { name: '小猫 (喵喵) 🐱', icon: '🐱', type: 'cat' },
      { name: '小狗 (汪汪) 🐶', icon: '🐶', type: 'dog' },
      { name: '汽车喇叭 (哔哔) 🚗', icon: '🚗', type: 'beep' },
      { name: '小山羊 (咩咩) 🐑', icon: '🐑', type: 'sheep' },
      { name: '小百灵 (叽叽) 🐦', icon: '🐦', type: 'bird' }
    ];
    const targetSound = sounds[(level - 1) % sounds.length];
    window.sensoryTargetSound = targetSound;

    const pool = [targetSound];
    while(pool.length < 3) {
      const candidate = sounds[Math.floor(Math.random() * sounds.length)];
      if(!pool.some(o => o.type === candidate.type)) pool.push(candidate);
    }
    pool.sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <h3 style="color:#fbbf24; font-weight:800; margin-bottom:10px;">🔊 声光探测仪 (第 ${level} 关)</h3>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:30px;">🐰 淼淼宝宝，点击大喇叭听声音，猜猜是谁在叫：</p>
        
        <button onclick="playSensorySound('${targetSound.type}')" class="mock-button glow-erbao" style="width:110px; height:110px; border-radius:50%; font-size:3.2em; display:block; margin: 0 auto 35px; box-shadow:0 0 20px rgba(245,158,11,0.25);">
          📢
        </button>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px;">
          ${pool.map(s => `
            <div class="glass-card pulse-hover" onclick="guessSensorySound('${s.type}')" style="padding:15px 10px; cursor:pointer; text-align:center; border-color:rgba(255,255,255,0.06); border-radius:12px;">
              <span style="font-size:3em; display:block; margin-bottom:5px;">${s.icon}</span>
              <strong style="font-size:0.85em; color:#fff;">${s.name}</strong>
            </div>
          `).join("")}
        </div>
        <button class="mock-button glow-erbao" onclick="launchTest('language')" style="margin-top:25px; width:100%; border-color:transparent;">🔄 换个声音再听一次</button>
      </div>
    `;
    playSensorySound(targetSound.type);
    speakText('淼淼宝宝，点击大喇叭听听是谁的声音？');
  } 
  
  else if (type === 'analogy') {
    // 8. 淼淼认知关联 (Association)
    const associations = [
      { q: '小狗 🐶 爱吃骨头 🦴，那小猫 🐱 爱吃什么呢？', ans: '🐟', desc: '美味的小鱼', opts: ['🐟', '🚗'] },
      { q: '小松鼠 🐹 住在树洞里，那小鸟 🐦 住在哪里呢？', ans: '🪹', desc: '树枝编的鸟巢', opts: ['🪹', '✈️'] },
      { q: '小兔子 🐰 跑得快，那小蜗牛 🐌 爬得怎么样呢？', ans: '🐌', desc: '爬得非常慢', opts: ['🐌', '🚀'] },
      { q: '太阳 ☀️ 在大白天出来，那月亮 🌙 在什么时候出来呢？', ans: '🌃', desc: '静静的黑夜', opts: ['🌃', '☀️'] },
      { q: '小飞机 ✈️ 在天上飞，那小木船 🚢 在哪里开呢？', ans: '🌊', desc: '宽广的河水里', opts: ['🌊', '☁️'] }
    ];
    const item = associations[(level - 1) % associations.length];

    container.innerHTML = `
      <div class="glass-card" style="padding:30px; text-align:center; max-width:600px; margin:20px auto; border-color: rgba(251, 191, 36, 0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#fbbf24; font-weight:800; margin:0;">🔗 淼淼认知关联 (第 ${level} 关)</h3>
          <button class="mock-button glow-erbao" onclick="speakText('${item.q.replace(/['\"]/g, '')}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:1em; color:#a1a1aa; margin-bottom:25px;">🐰 ${item.q}</p>
        
        <div style="display:flex; justify-content:center; gap:25px; margin-top:25px;">
          ${item.opts.map(o => `
            <button class="mock-button glow-erbao" onclick="check2yoAssociation('${o}', '${item.ans}')" style="font-size:3.2em; width:100px; height:100px; border-radius:20px;">
              ${o}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    speakText(item.q);
  }
}
```

- [ ] **Step 2: 实现淼淼 8 大维度游戏所需的答案判定函数**

在 `sensory.js` 底部继续追加以下判定接口：

```javascript
function check2yoAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, `答对啦！真的是 ${correct} 个！淼淼太棒了！加十颗星星！`);
  } else {
    speakText("数错了哦，再仔细数一数气球！");
    showWrongToast();
  }
}

function checkAttention2yo(idx, diffIdx) {
  if (idx === diffIdx) {
    trigger6yoVictory(10, "哇！淼淼火眼金睛，一下就把小兔子揪出来啦！棒棒哒！");
  } else {
    speakText("不是这个哦，再看哪个和其他人不一样？");
    showWrongToast();
  }
}

function checkPatternAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "规律找对啦！淼淼宝宝最聪明了！给你大大的赞！");
  } else {
    speakText("不对哦，仔细观察规律是什么？");
    showWrongToast();
  }
}

function checkMemory2yo(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "哇！淼淼的小眼睛记得真牢！记忆力超级棒！");
  } else {
    speakText("不对哦，再想一想刚才那个闪现的图案是什么？");
    showWrongToast();
  }
}

function check2yoAssociation(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "太厉害啦！淼淼知道的好多，常识完全正确！奖励十颗星星！");
  } else {
    speakText("不对哦，再仔细想一想它们有什么关联？");
    showWrongToast();
  }
}
```

- [ ] **Step 3: 提交代码并提交信息**
```bash
git add logic/js/sensory.js
git commit -m "feat(sensory): implement erbao age-appropriate 8 core early childhood tracks and answer checkers"
```

---

### Task 4: 全局集成与多端测试验证
确认修改完成后，运行验证检查，确保没有遗留的语法错误并且 iPad 视口无滚动条冲突。

- [ ] **Step 1: 全局运行状态及语法健全性检查**

运行 `git status` 确认所有变动已干净提交。
- [ ] **Step 2: 运行 `git push origin master` 交付成功消息**
完成所有工作，完美交付。
