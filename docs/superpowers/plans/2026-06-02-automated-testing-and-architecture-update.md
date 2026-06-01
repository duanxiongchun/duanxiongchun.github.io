# 🧠 脑力认知研究所 · 架构文档更新与自动化测试用例实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修正项目架构文档与代码的脱节问题，并为系统定制开发一套无第三方依赖、基于 Node.js 运行的自动化单元测试用例套件，确保积分体系、关卡流和复习调度器逻辑的百分之百正确性。

**Architecture:** 我们将以零依赖的原生 Node.js 环境为基础，实现沙盒化的浏览器 DOM、LocalStorage、Speech、Audio 等核心 APIs。读取生产代码后，采用 `try-catch` 顺序断言与 ANSI 控制台彩色日志输出，最终以 `process.exit` 代码输出测试成功或失败信号。

**Tech Stack:** Node.js, JS Sandboxing, ANSI Terminal Control, Vanilla JS Unit-Testing.

---

## 🗺️ 变动文件映射图 (Affected Files Map)

| 文件路径 | 状态 | 职责 |
| :--- | :---: | :--- |
| [`logic/ARCHITECTURE_AND_REWARDS.md`](file:///Users/duanxiongchun/code/duanxiongchun.github.io/logic/ARCHITECTURE_AND_REWARDS.md) | 修改 | 修正 State Schema、胜利分发器和触屏拖曳交互的架构脱节。 |
| [`logic/js/test.js`](file:///Users/duanxiongchun/code/duanxiongchun.github.io/logic/js/test.js) | 新增 | 测试主脚本，包含全局浏览器 APIs Mock 和 13 个框架与流自动化测试断言。 |

---

### 📝 Task 1: 修正架构文档的逻辑偏差

**Files:**
- Modify: `logic/ARCHITECTURE_AND_REWARDS.md`

- [ ] **Step 1: 修改持久化状态 Schema 说明**
  重写状态定义章节，补充 `streaks` (打卡天数)、`lastTrainedDate` (上次打卡时刻)、`solvedQuestions` (已答题键列表) 和 `wrongQuestions` (错题时间戳映射表) 的技术功能说明。

- [ ] **Step 2: 修正 Victory 胜利分发接口说明**
  删去已废弃的 `trigger2yoVictory` 描述，详细表述统一分发接口 `trigger6yoVictory(ignoredStarParam, speechFeedback)` 如何依据 `currentPlayerId` 识别当前乘员，自动路由不同维度进度以及渲染定制版心流胜利页。

- [ ] **Step 3: 对齐触屏交互标准说明**
  在 iPad 触屏适配章节中补充 Pointer Events API 与触控拖拽 Polyfill (`setPointerCapture`, GPU 位移和 `elementFromPoint` 探测槽位) 的说明，对齐 Deduction（排序）和 Memory（记忆）模块的拖曳逻辑。

- [ ] **Step 4: 提交**
  ```bash
  git add logic/ARCHITECTURE_AND_REWARDS.md
  git commit -m "docs(arch): update architecture documentation to perfectly align with production code"
  ```

---

### 🧪 Task 2: 建立测试沙盒运行环境

**Files:**
- Create: `logic/js/test.js`

- [ ] **Step 1: 编写 Node.js 基础测试沙盒骨架**
  创建 `logic/js/test.js`，实现 LocalStorage Mock、DOM Mock、AudioContext Mock、speechSynthesis Mock，并通过 fs 读取 `app.js` 和 `games.js` 执行加载。

  ```javascript
  const fs = require('fs');
  const path = require('path');

  // --- 1. Browser Environment Mocks ---
  const localStorageMock = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = String(value); },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; }
  };

  global.window = global;
  global.localStorage = localStorageMock;
  global.confirm = () => true;

  global.document = {
    body: { style: {}, appendChild: () => {} },
    getElementById: (id) => ({
      id, innerText: '', innerHTML: '', style: {},
      appendChild: () => {}, remove: () => {}
    }),
    createElement: () => ({ style: {}, appendChild: () => {}, remove: () => {} }),
    querySelectorAll: () => []
  };

  global.AudioContext = class {
    createOscillator() { return { connect() {}, frequency: { setValueAtTime() } }; }
    createGain() { return { connect() {}, gain: { setValueAtTime(), exponentialRampToValueAtTime() } }; }
  };
  global.webkitAudioContext = global.AudioContext;

  global.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  global.speechSynthesis = { cancel() {}, speak() {}, getVoices() { return []; } };

  // --- 2. Load Production JS Files ---
  function loadScript(file) {
    const filePath = path.resolve(__dirname, file);
    const code = fs.readFileSync(filePath, 'utf8');
    new Function(code)();
  }

  loadScript('app.js');
  loadScript('games.js');

  console.log("🚀 Mocks and scripts loaded successfully!");
  ```

- [ ] **Step 2: 验证沙盒运行无阻碍**
  Run: `node logic/js/test.js`
  Expected: 输出 `🚀 Mocks and scripts loaded successfully!` 且无任何 Crash 或 Null 引用报错。

- [ ] **Step 3: 提交**
  ```bash
  git add logic/js/test.js
  git commit -m "test(framework): setup zero-dependency browser API sandboxing"
  ```

---

### 🧪 Task 3: 编写 Test Suite A (状态初始化、落库持久与兑换)

**Files:**
- Modify: `logic/js/test.js`

- [ ] **Step 1: 在 test.js 中实现 assertion 辅助函数和 Test Suite A 用例**
  追加 `assert` 验证库，编写 4 个核心状态断言：默认初始化、数据序列化、余额不足拦截和金币抵扣兑换。

  ```javascript
  const assert = require('assert');

  let passedTests = 0;
  let failedTests = 0;

  function test(name, fn) {
    try {
      localStorage.clear();
      // Reset global appState to default
      appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
      fn();
      console.log(`\x1b[32m  ✓ [PASS] ${name}\x1b[0m`);
      passedTests++;
    } catch (err) {
      console.error(`\x1b[31m  ✗ [FAIL] ${name}\x1b[0m`);
      console.error(err.stack);
      failedTests++;
    }
  }

  console.log("\n--- Running Test Suite A: State & Rewards ---");

  // 用例 1: 默认初始化测试
  test("Should initialize default state schema when localStorage is empty", () => {
    initAppState();
    assert.strictEqual(appState.players.dabao.stars, 0);
    assert.strictEqual(appState.players.dabao.streaks, 2);
    assert.strictEqual(appState.players.erbao.stars, 0);
    assert.strictEqual(appState.redemptions.length, 0);
  });

  // 用例 2: 数据落库持久化测试
  test("Should serialize and save modified stars state correctly", () => {
    initAppState();
    appState.players.dabao.stars = 99;
    saveAppState();
    const stored = JSON.parse(localStorage.getItem("kids_logic_lab_state"));
    assert.strictEqual(stored.players.dabao.stars, 99);
  });

  // 用例 3: 兑换金币不足拦截测试
  test("Should prevent redemption if players stars balance is insufficient", () => {
    initAppState();
    appState.players.dabao.stars = 10; // cost of d1 is 20
    
    // Inject mock requestRedemption logic if custom-rewards.js isn't fully loaded
    // cost of 'd1' is 20
    const success = requestRedemption('dabao', 'd1');
    assert.strictEqual(success, false);
    assert.strictEqual(appState.players.dabao.stars, 10);
    assert.strictEqual(appState.redemptions.length, 0);
  });

  // 用例 4: 金币充足成功兑换测试
  test("Should deduct stars and append redemption request to queue if balance is enough", () => {
    initAppState();
    appState.players.dabao.stars = 50;
    const success = requestRedemption('dabao', 'd1'); // cost 20
    assert.strictEqual(success, true);
    assert.strictEqual(appState.players.dabao.stars, 30);
    assert.strictEqual(appState.redemptions.length, 1);
    assert.strictEqual(appState.redemptions[0].rewardTitle, "看动画片 30 分钟 📺");
  });
  ```

- [ ] **Step 2: 补充 `requestRedemption` 的加载**
  在 `test.js` 文件顶部加载 `custom-rewards.js` 以使兑换接口生效：
  ```javascript
  // Add this inside loadScript sequencing
  loadScript('custom-rewards.js');
  ```

- [ ] **Step 3: 运行测试并验证通过**
  Run: `node logic/js/test.js`
  Expected: Suite A 用例 1、2、3、4 全部输出 `✓ [PASS]`。

- [ ] **Step 4: 提交**
  ```bash
  git add logic/js/test.js
  git commit -m "test(rewards): add state persistence and redemption flow assertions"
  ```

---

### 🧪 Task 4: 编写 Test Suite B (胜利奖励、打卡翻倍、间隔重复与冷却)

**Files:**
- Modify: `logic/js/test.js`

- [ ] **Step 1: 追加 Test Suite B 用例**
  编写难度分级星星奖励、打卡天数倍率计算、50关通关大奖、MixedMode 综合特训进度控制、错题记录阻断、冷却48小时过期复活、以及复习模式正确答题清空等用例。

  ```javascript
  console.log("\n--- Running Test Suite B: Progression & Spaced Repetition ---");

  // 用例 5: 难度级别阶梯星星测试
  test("Should reward stars based on question difficulty tiers", () => {
    initAppState();
    window.currentGameTrack = 'spatial';
    
    // Level 5 (Easy tier -> +2 stars)
    window.currentGameLevel = 5;
    trigger6yoVictory(10, "测试反馈");
    assert.strictEqual(appState.players.dabao.stars, 2);
    
    // Reset stars for next difficulty check
    appState.players.dabao.stars = 0;
    window.currentGameLevel = 15; // Medium tier -> +5 stars
    trigger6yoVictory(10, "测试反馈");
    assert.strictEqual(appState.players.dabao.stars, 5);

    // Reset stars
    appState.players.dabao.stars = 0;
    window.currentGameLevel = 30; // Hard tier -> +12 stars
    trigger6yoVictory(10, "测试反馈");
    assert.strictEqual(appState.players.dabao.stars, 12);

    // Reset stars
    appState.players.dabao.stars = 0;
    window.currentGameLevel = 45; // Ultimate tier -> +30 stars
    trigger6yoVictory(10, "测试反馈");
    assert.strictEqual(appState.players.dabao.stars, 30);
  });

  // 用例 6: 打卡连续天数乘数翻倍测试
  test("Should apply learning streaks multiplier to final rewarded stars", () => {
    initAppState();
    window.currentGameTrack = 'spatial';
    window.currentGameLevel = 15; // Base is 5 stars

    // Streak = 2 -> 1.0x -> 5 stars
    appState.players.dabao.streaks = 2;
    trigger6yoVictory(10, "测试");
    assert.strictEqual(appState.players.dabao.stars, 5);

    // Streak = 4 -> 1.2x -> Math.round(5 * 1.2) = 6 stars
    appState.players.dabao.stars = 0;
    appState.players.dabao.streaks = 4;
    trigger6yoVictory(10, "测试");
    assert.strictEqual(appState.players.dabao.stars, 6);

    // Streak = 8 -> 1.5x -> Math.round(5 * 1.5) = 8 stars
    appState.players.dabao.stars = 0;
    appState.players.dabao.streaks = 8;
    trigger6yoVictory(10, "测试");
    assert.strictEqual(appState.players.dabao.stars, 8);
  });

  // 用例 7: 通关里程碑大奖测试
  test("Should grant +150 milestone stars when level 50 normal mode is cleared", () => {
    initAppState();
    window.isMixedMode = false;
    window.currentGameTrack = 'spatial';
    window.currentGameLevel = 50; // Ultimate base 30 + Milestone 150 = 180 stars
    appState.players.dabao.streaks = 2; // 1.0x

    trigger6yoVictory(10, "测试通关");
    assert.strictEqual(appState.players.dabao.stars, 180);
  });

  // 用例 8: 进度胜利递增测试 (普通 vs 综合)
  test("Should increment correct progress indicator without polluting other tracks", () => {
    initAppState();
    window.isMixedMode = false;
    window.currentGameTrack = 'spatial';
    window.currentGameLevel = 1;
    appState.players.dabao.progress.spatial = 1;

    trigger6yoVictory(10, "测试");
    assert.strictEqual(appState.players.dabao.progress.spatial, 2);
    assert.strictEqual(appState.players.dabao.progress.mixed, 1); // unchanged
  });

  test("Should increment mixed progress in mixed mode, leaving single tracks intact", () => {
    initAppState();
    window.isMixedMode = true;
    window.currentGameTrack = 'spatial';
    window.currentGameLevel = 1;
    window.currentGameMixedLevel = 1;
    appState.players.dabao.progress.spatial = 1;
    appState.players.dabao.progress.mixed = 1;

    trigger6yoVictory(10, "测试");
    assert.strictEqual(appState.players.dabao.progress.mixed, 2);
    assert.strictEqual(appState.players.dabao.progress.spatial, 1); // untouched
  });

  // 用例 9: 错题 CD 记录与阻断测试
  test("Should add wrong questions with timestamp on failure, and skip due to cooldown", () => {
    initAppState();
    window.currentGameTrack = 'spatial';
    window.currentGameLevel = 10;
    
    // Simulate Failure
    trigger6yoFailure("错题解析", "正确答案");
    
    // Check key is logged in wrongQuestions
    const timestamp = appState.players.dabao.wrongQuestions['spatial-10'];
    assert.ok(timestamp);
    assert.ok(Date.now() - timestamp < 1000); // Created just now
    
    // getNextAvailableLevel should skip level 10 since it is in cooldown
    const nextLevel = getNextAvailableLevel('dabao', 'spatial', 10);
    assert.strictEqual(nextLevel, 11);
  });

  // 用例 10: 冷却过期复出与复活测试
  test("Should revive question and enter review mode when wrong question cooldown expires (48h)", () => {
    initAppState();
    window.currentGameTrack = 'spatial';
    window.currentGameLevel = 10;
    
    // Fake incorrect attempt 3 days ago (expired cooldown)
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    appState.players.dabao.wrongQuestions['spatial-10'] = threeDaysAgo;
    saveAppState();

    // Verify it is not skipped anymore, because cooldown (2 days) has expired!
    const nextLevel = getNextAvailableLevel('dabao', 'spatial', 10);
    assert.strictEqual(nextLevel, 10); // Not skipped!
  });

  // 用例 11: 错题复习成功清空错题本测试
  test("Should clear wrong questions list entry when review level is successfully answered", () => {
    initAppState();
    window.currentGameTrack = 'spatial';
    window.currentGameLevel = 10;
    
    appState.players.dabao.wrongQuestions['spatial-10'] = Date.now() - (3 * 24 * 60 * 60 * 1000);
    
    // Setup Review mode active state
    window.isReviewMode = true;
    window.reviewLevelKey = 'spatial-10';

    // Solve correctly
    trigger6yoVictory(10, "复习成功");
    
    // wrong question key should be cleared out
    assert.strictEqual(appState.players.dabao.wrongQuestions['spatial-10'], undefined);
  });
  ```

- [ ] **Step 2: 运行测试并验证通过**
  Run: `node logic/js/test.js`
  Expected: 包含 Test Suite B 的 11 个用例全部输出 `✓ [PASS]`。

- [ ] **Step 3: 提交**
  ```bash
  git add logic/js/test.js
  git commit -m "test(games): implement game progress, milestone, and spaced repetition cooldown test cases"
  ```

---

### 🧪 Task 5: 增加终端退出状态处理并加入 Git 提交流程

**Files:**
- Modify: `logic/js/test.js`

- [ ] **Step 1: 在 test.js 底部增加状态汇总与退出信号代码**
  确保测试在失败时抛出非零 exit code，成功时抛出零 code。

  ```javascript
  // --- 3. Summary and Exit ---
  console.log("\n========================================");
  if (failedTests === 0) {
    console.log(`\x1b[32m🏆 ALL TESTS PASSED SUCCESSFULLY! (${passedTests} passed)\x1b[0m`);
    process.exit(0);
  } else {
    console.error(`\x1b[31m💥 TEST SUITE FAILED! (${passedTests} passed, ${failedTests} failed)\x1b[0m`);
    process.exit(1);
  }
  ```

- [ ] **Step 2: 完整运行全部 11 个核心框架测试，核对控制台输出**
  Run: `node logic/js/test.js`
  Expected: 控制台输出：
  ```
  🚀 Mocks and scripts loaded successfully!

  --- Running Test Suite A: State & Rewards ---
    ✓ [PASS] Should initialize default state schema when localStorage is empty
    ✓ [PASS] Should serialize and save modified stars state correctly
    ✓ [PASS] Should prevent redemption if players stars balance is insufficient
    ✓ [PASS] Should deduct stars and append redemption request to queue if balance is enough

  --- Running Test Suite B: Progression & Spaced Repetition ---
    ✓ [PASS] Should reward stars based on question difficulty tiers
    ✓ [PASS] Should apply learning streaks multiplier to final rewarded stars
    ✓ [PASS] Should grant +150 milestone stars when level 50 normal mode is cleared
    ✓ [PASS] Should increment correct progress indicator without polluting other tracks
    ✓ [PASS] Should increment mixed progress in mixed mode, leaving single tracks intact
    ✓ [PASS] Should add wrong questions with timestamp on failure, and skip due to cooldown
    ✓ [PASS] Should revive question and enter review mode when wrong question cooldown expires (48h)
    ✓ [PASS] Should clear wrong questions list entry when review level is successfully answered

  ========================================
  🏆 ALL TESTS PASSED SUCCESSFULLY! (12 passed)
  ```

- [ ] **Step 3: 提交**
  ```bash
  git add logic/js/test.js
  git commit -m "test(ci): add exit codes and fancy status summary formatting"
  ```
