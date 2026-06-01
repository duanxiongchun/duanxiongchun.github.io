# 🧠 脑力认知研究所 · 架构更新与自动化测试设计说明书

本规格说明书（Spec）详述了如何修正“脑力认知研究所”架构设计文档与生产代码的脱节，以及如何为项目建立首套**零依赖 (Zero-Dependency) 的自动化测试用例套件**。

---

## 🗺️ 一、 架构文档与代码脱节项修复规划 (Architecture Gaps Alignment)

为了保持文档与代码实现的 100% 映射一致，我们将对 [`logic/ARCHITECTURE_AND_REWARDS.md`](file:///Users/duanxiongchun/code/duanxiongchun.github.io/logic/ARCHITECTURE_AND_REWARDS.md) 进行如下重写更新：

### 1. 完善全局持久化状态 Schema
原架构文档的 JSON 结构过于简化，遗漏了核心的**间隔重复 (Spaced Repetition) 进度引擎**字段。我们将补充以下底层字段说明：
- `streaks`: 记录孩子连续训练天数（连续打卡 >= 3 天/7 天触发阶梯式星星翻倍，构成操作性条件反射闭环）。
- `lastTrainedDate`: 记录上次活跃打卡日期，用于动态重算连续学习天数。
- `solvedQuestions`: 已正确回答关卡的全局唯一标识符（形式如 `"${type}-${level}"`）的扁平数组，防止其在各特训模式下重复推荐。
- `wrongQuestions`: 错误答题缓存映射表（形式如 `{ "${type}-${level}": timestamp }`），在答错时标记对应关卡的失败时刻，作为间隔重复调度器（Spaced Repetition Cooldown）的时间比对基准。

### 2. 统一胜利分发器 API 说明
- **修正前**：原架构文档分别描述了 `trigger6yoVictory(...)` (果果) 和 `trigger2yoVictory(...)` (淼淼) 两个函数。
- **事实**：为减少冗余与高内聚，系统在代码中仅声明了唯一的全局 API：`trigger6yoVictory(ignoredStarParam, speechFeedback)`。
- **修正设计**：文档将修正为说明该统一分发器如何依据当前会话的 `window.currentPlayerId === 'erbao'`，自适应实现主题色彩切换、幼龄化 UI 卡片渲染、童趣语音播报和延时无感连续加载，实现一套接口、两套视觉与交互闭环。

### 3. 指针事件 (Pointer Events) 拖曳交互说明对齐
- **修正前**：原文档将演绎模块误述为“仅用按键控制，无需拖拽”。
- **事实**：Deduction（排序）和 Memory（记忆）模块均配备了 iPad 指针捕获(`setPointerCapture`) 及 Touch 移动端滑动 Polyfill，完全兼容鼠标拖拽、平板拖曳与极简“轻点飞入 (Tap-to-Move)”双重容错交互。
- **修正设计**：文档将对齐这套高级手势与防滚动冲突规范，作为项目底座的跨多端交互标准。

---

## 🧪 二、 自动化测试用例规格说明书 (Test Case Specifications)

我们将在 `logic/js/test.js` 中构建自动化测试套件。通过测试套件运行 **15 个以上严密断言**，验证状态更新、金币流分配、里程碑和间隔重复机制：

### 1. 状态引擎与持久化测试 (`app.js`)
- **用例 1（默认初始化测试）**：在 LocalStorage 干净的情况下，调用 `initAppState()` 应能够产生符合 Schema 的默认状态（包含两位乘员、奖励表、零星星余额和 streaks=2）。
- **用例 2（数据持久化测试）**：手动修改 `appState.players.dabao.stars = 99`，调用 `saveAppState()` 后，LocalStorage 中对应的 JSON 字符串中必须准确落库 `"stars":99`。
- **用例 3（积分不够阻断测试）**：若 `dabao` 余额为 0，发起 `requestRedemption('dabao', 'd1')` (需 20 币)，验证调用失败、未生成 Redemption 申请且未扣除积分。
- **用例 4（积分充足兑换测试）**：若 `dabao` 余额为 50，发起 `requestRedemption('dabao', 'd1')`，验证余额扣减为 30，且全局 `appState.redemptions` 队列成功入列一条合法兑换记录。

### 2. 积分金币与难度梯度流测试 (`games.js`)
- **用例 5（基础积分梯度测试）**：不同关卡段应派发契合孩子心流挑战的阶梯奖励：
  - 关卡段 1~12 关（基础）：奖励 `+2` 星星。
  - 关卡段 13~28 关（进阶）：奖励 `+5` 星星。
  - 关卡段 29~42 关（高级）：奖励 `+12` 星星。
  - 关卡段 43~50 关（超常）：奖励 `+30` 星星。
- **用例 6（打卡天数翻倍奖励测试）**：
  - 连续打卡 < 3 天，打卡倍率为 `1.0`。
  - 连续打卡 3~6 天，打卡倍率为 `1.2` (如 13 关获得 `Math.round(5 * 1.2) = 6` 星星)。
  - 连续打卡 >= 7 天，打卡倍率为 `1.5` (如 13 关获得 `Math.round(5 * 1.5) = 8` 星星)。
- **用例 7（50关通关里程碑大奖测试）**：
  - 正常单维关卡第 50 关胜利后，除了基础超常分外，必须派发大连线大奖 `+150` 星星。

### 3. 特训进度、跳过与复习状态流测试 (`games.js`)
- **用例 8（单轨道胜利推进测试）**：单维度模式下胜利，对应维度的 `progress` 自动加 1。
- **用例 9（综合航线胜利推进测试）**：综合航线模式 (`isMixedMode = true`) 胜利，`progress.mixed` 加 1，而单维度进度应保持原样不受污染。
- **用例 10（避重机制测试）**：对于已经包含在 `solvedQuestions` 中的题目，`getNextAvailableLevel` 必须自动跳过此关。
- **用例 11（关卡跳过容错测试）**：调用 `skipCurrent6yoLevel()`，确认不发放/扣除星星，但关卡进度成功加 1 并重载了下一关。

### 4. 间隔重复与复习冷却调度测试 (`games.js`)
- **用例 12（失败关卡记录与 CD 冷却阻断）**：
  - 验证答错后，题目键（例如 `spatial-10`）带上当前时间戳写入 `wrongQuestions`。
  - 验证在 2 天（48小时）冷却期内，`getNextAvailableLevel` 会将该错题自动排除在普通关卡外，不让孩子立刻重新死磕，防止挫败感。
- **用例 13（复习冷却过期复出与复习优先）**：
  - 验证错题记录超过 48 小时后，错题冷却失效，系统判定其处于艾宾浩斯记忆遗忘曲线期，必须自动唤醒该关卡，且在加载特训时以 **“优先复习关卡” (isReviewMode)** 的身份载入。
  - 验证在复习模式下回答正确后，该关卡成功从 `wrongQuestions` 映射表里被彻底移除。

### 5. 题库框架对接测试 (Excluded Content Tests Scope)
- 根据本次需求定义，本自动化测试用例专注于**核心逻辑框架、积分奖励系统及关卡流运转**，不包含对题库具体内容、图形排布以及文本表达的静态/数学正确性检查。具体的题目内容将留待后续的内容专项测试覆盖。

---

## 🛠️ 三、 测试运行引擎与沙盒 Mock 设计 (Test Runner Sandbox)

我们将编写 `logic/js/test.js`。该脚本可使用原生 Node 运行环境直接执行，不需要任何第三方依赖。

### 1. 跨平台 API 沙盒注入
我们将把生产代码通过 `fs.readFileSync` 读取，并封装在一个闭包中执行，在其最外层全局 scope 注入浏览器特有 mock APIs：
- `window` 指向全局 `global`。
- `localStorage` 自定义 Mock（基于内存 `store` 的 map，读写写入隔离）。
- `confirm` 自动返回 `true`（支持跳过关卡逻辑）。
- `document` 节点查找 Mock（对于 `getElementById` / `createElement` 返回拥有 `innerText`, `innerHTML`, `style` 等傀儡属性的对象，以避免 DOM 树渲染时产生 Null 引用报错）。
- `AudioContext` Mocks（避免 Web Audio API 发声逻辑抛出）。
- `speechSynthesis` Mocks（避免 Web Speech 语音引擎抛出）。

### 2. ANSI 彩色断言报告
我们将使用 ANSI Terminal 颜色格式化（如 `\x1b[32m` 绿色代表成功，`\x1b[31m` 红色代表错误）输出一份精美易读的命令行测试面板。最后根据测试结果通过 `process.exit(0)` 或 `process.exit(1)` 提供精准的退出信号。
