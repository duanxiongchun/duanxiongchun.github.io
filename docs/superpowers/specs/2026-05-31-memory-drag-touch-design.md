# 🧠 短时记忆复现 iPad 触屏拖拽与多端适配设计规范 (Touch Drag-and-Drop & Selector Specs)

本设计规范详述了如何解决在 iPad (WebKit iOS Safari) 上短时记忆复现游戏（闪现序列复现）中“无法选择”与“无法拖拽”的体验死角，提供原生 App 级别的手势灵敏度、一键清空机制，并将核心方案归档至架构文档。

---

## 🔍 一、 现存 Bug 与问题诊断

### 1. 点击选择完全失效 (The Inline Attribute Quote Bug)
* **表现**：iPad 上点击备选 emoji 图案，系统无任何交互反馈，控制台或解析器静默失败。
* **原因**：`startMemoryRecall` 在渲染 HTML 时使用了内联属性：
  ```html
  onclick="clickMemoryRecall('${o}', ${JSON.stringify(originalSeq)})"
  ```
  `JSON.stringify(originalSeq)` 在被解析为字符串后（如 `["🍎","🐱","🌟"]`）包含双引号。外部包裹 `onclick` 的也是双引号，这导致 HTML 解析器在读取到第二个双引号时即认为属性已闭合。剩下的字符变成无效属性，破坏了整个按钮的事件绑定，导致 WebKit 极其严格的解析器下按钮无法响应。
* **修复**：摒弃内联传参，由 `memory.js` 全局变量 `memoryExpected` 管理期望序列。点击或拖拽直接通过图案本身（Emoji 字符）索引匹配。

### 2. 缺少拖拽支持 (No Drag-and-Drop Support)
* **表现**：原设计仅有纯点击模式，没有实现任何拖拽手势。
* **修复**：引入 Pointer Events 统一拖拽引擎，支持 Desktop 鼠标和 iPad 手指滑触，且允许**任意顺序**拖拽卡片到其正确的序列槽位中。

---

## 🛠️ 二、 系统架构设计与多端交互规范 (Pointer Drag Engine)

### 1. 双重手势解析流 (Double Gestures Mechanics)
每一个选项卡片同时注册 `pointerdown`、`pointermove`、`pointerup` 和 `pointercancel` 事件。
* **Tap-to-Move (轻点飞入)**：松手时，计算指针在 X 和 Y 轴上的绝对位移平方和 `Math.sqrt(dx*dx + dy*dy)`。若位移小于 `6px`，则视作轻点。直接寻轨将该图案填入它在 `memoryExpected` 中正确对应的空置槽位。
* **Drag-and-Drop (拖拽拖放)**：若位移大于或等于 `6px`，则视作拖拽手势，卡片使用 GPU 硬件加速的 `translate3d(dx, dy, 0) scale(1.1)` 进行满帧渲染。

### 2. 槽位精确匹配 (elementFromPoint Lookup)
在松手（`pointerup`）时刻：
1. 被拖卡片临时设置 `style.pointerEvents = 'none'`，避免遮挡视线。
2. 调用 `document.elementFromPoint(e.clientX, e.clientY)` 探测落点下方的最上层 DOM 元素。
3. 查找该元素是否属于 `.memory-slot` 槽位，并提取其 `data-slot-idx`（代表第几个槽）。
4. 卡片恢复 `pointerEvents = ''`。
5. **匹配校验**：若松手处的槽位 `idx` 对应的正确图案正是此拖拽卡片（即 `memoryExpected[idx] === emoji`），则判定成功：
   * 该槽位填入图案，边框变为绿色实线，锁定该槽。
   * 下方选项卡片隐去或禁用，标记已使用。
   * 播放轻快成功音效，检查是否全部通关。
6. **回弹还原**：若松手处不是有效槽位、槽位已被占用或图案不配对，卡片通过 CSS transition 平滑弹回原位。

### 3. 一键清空重新选择 (Reset Logic)
* 在答题区域最下方新增 `🔄 一键清空重新选择` 按钮。
* **重置操作**：
  * 将 `memoryCurrentIdx` 或成功填充数重置为 `0`。
  * 将上方所有 `.memory-slot` 的 `innerText` 清空，边框还原为虚线灰色 `border: 2px dashed rgba(255,255,255,0.2)`。
  * 下方所有选项卡片恢复为可用状态（`disabled = false`，不透明度恢复 `1`，`visibility = "visible"`）。

---

## 📚 三、 方案同步至架构文档 (ARCHITECTURAL ALIGNMENT)

将上述 iPad 触屏拖拽、无干扰滚动锁、双重手势探测以及一键清空机制以标准章节补充更新至 [logic/ARCHITECTURE_AND_REWARDS.md](file:///Users/duanxiongchun/code/duanxiongchun.github.io/logic/ARCHITECTURE_AND_REWARDS.md) 的 **“第四章 iPad 移动端触屏适配规范”**，形成可被系统全局复用的基础特训交互标准。
