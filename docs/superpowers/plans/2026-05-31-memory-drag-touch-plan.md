# 短时记忆复现 iPad 触屏拖拽与多端适配智能重构计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构短时记忆复现模块（记忆闪现关卡），支持 iPad 移动端触屏拖拽（Pointer Events + GPU 加速）与极速轻点（Tap-to-Move）双重交互手势，并加入一键重置功能，更新架构文档以完美契合多端触屏规范。

**Architecture:** 摒弃存在引号解析截断 Bug 的内联事件传参。使用全局 `memoryExpected` 管理期望序列，并在选项上绑定指针事件（Pointer Events），利用 `element.setPointerCapture` 防止划动脱靶。松手瞬间临时隐藏指针以通过 `document.elementFromPoint` 检索覆盖的目标槽位 `.memory-slot` 实现绝对定位，非槽位区域弹性归位，并配以一键清空状态。

**Tech Stack:** HTML5, Vanilla JavaScript, CSS3 Translate3D, Pointer Events API

---

### Task 1: 更新架构说明文档
将多端手势拖拽和状态清空机制追加写入系统架构文档中，为特训系统确立规范。

**Files:**
- Modify: `logic/ARCHITECTURE_AND_REWARDS.md:167-190`

- [ ] **Step 1: 补充修改 `logic/ARCHITECTURE_AND_REWARDS.md` 中的 iPad 触屏适配规范**

在“四、 iPad 移动端触屏适配规范”末尾，补充并明确关于短时记忆复现的双重手势、一键重置与任意顺序拖入的技术方案。

```diff
 * **智能飞入**：轻点备选池卡片，卡片瞬间飞入上方首个空置步骤槽；轻点槽内卡片，卡片瞬间撤回下方备选池，提供 100% 极简答题通道。
+
+### 4. 短时记忆复现（闪现记忆）多端手势与容错设计
+* **任意顺序拖拽**：在序列闪现记忆复现题型中，允许孩子以任意顺序将选项卡片拖拽入对应的空置槽位中。如果卡片与其落点槽位的正确序列值吻合，则即刻锁定成功。
+* **指针穿透与定位**：拖拽至槽位上方时，通过临时声明卡片的 `pointerEvents = 'none'` 并使用 `document.elementFromPoint` 探测下方的 `.memory-slot` 元素，精准解耦物理布局，消除 iPadOS Safari 的点击溢出风险。
+* **一键重置 (State Flushing)**：提供“一键清空重新选择”交互控件，一键清除所有已填槽位样式及文本，并将下方全部备选项卡片重置为可用状态，给予孩子无挫败感的高阶重试通路。
```

- [ ] **Step 2: 提交代码并提交信息**

```bash
git add logic/ARCHITECTURE_AND_REWARDS.md
git commit -m "docs(arch): update architecture document for memory game touch standards"
```

---

### Task 2: 重构短时记忆复现交互引擎 `memory.js`
重构 `logic/js/games/memory.js` 的 `startMemoryRecall`、`clickMemoryRecall` 及其事件绑定逻辑。

**Files:**
- Modify: `logic/js/games/memory.js:68-117`

- [ ] **Step 1: 修改 `logic/js/games/memory.js` 实现 Pointer Events 拖拽与一键重置逻辑**

修改 `startMemoryRecall`，`clickMemoryRecall` (重构为手势探测和填充辅助)，添加 `setupMemoryRecallDragAndDrop`，`handleMemoryTap`，`handleMemoryDrop`，`fillMemorySlot` 和 `resetMemoryRecall`。

```javascript
let memorySolvedCount = 0; // 成功填充的槽位计数

function startMemoryRecall(originalSeq) {
  memoryExpected = [...originalSeq];
  memorySolvedCount = 0;
  
  const recallArea = document.getElementById('memory-recall-area');
  if (!recallArea) return;
  recallArea.style.display = 'block';

  // 创建打乱的选项（含干扰项）
  const allEmojis = ['🍎','🐱','🌟','🔴','🔵','🟡','🟢','🐘','🦁','🐯','🐶','⭐','🌙','☀️','🌈','🍊','🍋','🍇','🍓','🍑','🏠','🚗','✈️','🚢','🎈','🎁','🎂','🎊','🎉','1','2','3','4','5','6','7','8','9'];
  const distractors = allEmojis.filter(e => !originalSeq.includes(e));
  const opts = [...originalSeq, ...distractors.slice(0, 4)].sort(() => Math.random() - 0.5);

  recallArea.innerHTML = `
    <p style="font-size:0.9em;color:#f472b6;font-weight:700;margin-bottom:15px;">🎯 拖拽图案到正确的位置，或直接轻点它！</p>
    <div id="selected-display" style="display:flex;justify-content:center;gap:10px;min-height:50px;margin-bottom:15px;flex-wrap:wrap;">
      ${originalSeq.map((_, idx) => `<div class="memory-slot" data-slot-idx="${idx}" style="width:50px;height:50px;border-radius:10px;border:2px dashed rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:1.5em;transition:all 0.2s;"></div>`).join('')}
    </div>
    <div id="memory-options-container" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
      ${opts.map(o => `
        <button class="mock-button glow-dabao recall-btn" id="recall-btn-${o}" data-emoji="${o}" style="font-size:1.5em;width:58px;height:58px;border-radius:12px;touch-action:none;user-select:none;position:relative;">${o}</button>
      `).join('')}
    </div>
    <div style="display:flex;justify-content:center;gap:10px;margin-top:15px;">
      <button class="mock-button glow-dabao" onclick="resetMemoryRecall()" style="font-size:0.92em;padding:8px 20px;border-radius:10px;font-weight:700;border-color:rgba(236,72,153,0.4);">🔄 一键清空重新选择</button>
    </div>
  `;

  setupMemoryRecallDragAndDrop();
}

function setupMemoryRecallDragAndDrop() {
  const draggables = document.querySelectorAll('.recall-btn');

  draggables.forEach(drag => {
    let startX = 0, startY = 0;
    let isDragging = false;
    const emoji = drag.getAttribute('data-emoji');

    const onPointerDown = (e) => {
      drag.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      isDragging = true;
      drag.style.transition = 'none';
      drag.style.zIndex = '1000';
      drag.style.transform = 'scale(1.15)';
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      drag.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.15)`;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      drag.releasePointerCapture(e.pointerId);
      
      drag.style.zIndex = '';
      drag.style.transition = 'transform 0.2s';
      drag.style.transform = 'none';

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 6) {
        // Tap-to-Move 轻点飞入
        handleMemoryTap(emoji, drag);
      } else {
        // Drag-and-Drop 探测目标槽位
        drag.style.pointerEvents = 'none';
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        drag.style.pointerEvents = '';

        let slot = null;
        if (targetElement) {
          slot = targetElement.closest('.memory-slot');
        }

        if (slot) {
          handleMemoryDrop(emoji, slot, drag);
        }
      }
    };

    drag.addEventListener('pointerdown', onPointerDown);
    drag.addEventListener('pointermove', onPointerMove);
    drag.addEventListener('pointerup', onPointerUp);
    drag.addEventListener('pointercancel', onPointerUp);
  });
}

function handleMemoryTap(emoji, dragBtn) {
  // 智能寻轨：找到该图案在 originalSeq 中首个尚未被填充的正确槽位
  let targetSlotIdx = -1;
  for (let i = 0; i < memoryExpected.length; i++) {
    if (memoryExpected[i] === emoji) {
      const slot = document.querySelector(`.memory-slot[data-slot-idx="${i}"]`);
      if (slot && !slot.innerText) {
        targetSlotIdx = i;
        break;
      }
    }
  }

  if (targetSlotIdx !== -1) {
    const slot = document.querySelector(`.memory-slot[data-slot-idx="${targetSlotIdx}"]`);
    fillMemorySlot(slot, emoji, dragBtn);
  } else {
    speakText("再回忆回忆，试试别的图案！");
    showWrongToast();
  }
}

function handleMemoryDrop(emoji, slot, dragBtn) {
  const slotIdx = parseInt(slot.getAttribute('data-slot-idx'));
  
  // 检查落点槽位的正确 emoji 是否是拖拽卡片
  if (memoryExpected[slotIdx] === emoji) {
    if (slot.innerText) {
      // 槽位已被占用，弹回
      return;
    }
    fillMemorySlot(slot, emoji, dragBtn);
  } else {
    speakText("位置不对哦，再想一想！");
    showWrongToast();
  }
}

function fillMemorySlot(slot, emoji, dragBtn) {
  slot.innerText = emoji;
  slot.style.border = '2px solid #10b981';
  slot.style.background = 'rgba(16, 185, 129, 0.15)';
  
  dragBtn.disabled = true;
  dragBtn.style.opacity = '0.4';
  dragBtn.style.pointerEvents = 'none';

  memorySolvedCount++;

  if (memorySolvedCount >= memoryExpected.length) {
    setTimeout(() => {
      trigger6yoVictory(10, "全部记对了！果果的记忆力超级厉害！");
    }, 300);
  }
}

function resetMemoryRecall() {
  memorySolvedCount = 0;
  
  // 清空槽位样式与文本
  const slots = document.querySelectorAll('.memory-slot');
  slots.forEach(slot => {
    slot.innerText = '';
    slot.style.border = '2px dashed rgba(255,255,255,0.2)';
    slot.style.background = '';
  });

  // 恢复选项卡片
  const draggables = document.querySelectorAll('.recall-btn');
  draggables.forEach(drag => {
    drag.disabled = false;
    drag.style.opacity = '1';
    drag.style.pointerEvents = 'auto';
  });
  
  speakText("已全部清空，果果可以重新选择啦！");
}
```

- [ ] **Step 2: 验证语法与测试（运行静态分析或页面测试）**

- [ ] **Step 3: 提交代码并提交信息**

```bash
git add logic/js/games/memory.js
git commit -m "feat(logic): implement native pointer drag-and-drop and state clear button for short-term memory recall"
```

---

### Task 3: 全局集成与多端测试验证
确认修改完成后，运行验证检查，确保没有遗留的语法错误并且 iPad 视口无滚动条冲突。

- [ ] **Step 1: 全局运行状态及语法健全性检查**

运行 `git status` 确认所有变动已干净提交。

- [ ] **Step 2: 交付成功消息**
完成所有工作，完美交付。
