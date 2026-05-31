/* 🧠 脑力认知研究所 - 逻辑演绎与时序排序模块 Deduction Games Engine */

let currentDeductionTimeline = [];
let deductionItems = [];
let deductionPool = [];
let deductionSlots = [];

function checkDeductionChoice(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "逻辑推断完美！果果的推理分析能力超强！");
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "再仔细想想，换个答案试试看！", window.currentQuestionCorrectAnswer || "正确选项");
  }
}

function verifyDabaoTimeline() {
  const hasEmpty = deductionSlots.some(s => s === null);
  if (hasEmpty) {
    speakText("果果，先把所有的卡片放进格子里排列好，再提交验证哦！💡");
    showWrongToast();
    return;
  }

  // Assign deductionSlots to currentDeductionTimeline for backward compatibility
  currentDeductionTimeline = [...deductionSlots];

  const order = currentDeductionTimeline.map(i => i.id).join('');
  const targetOrder = currentDeductionTimeline.length === 3 ? '123' : '1234';
  if (order === targetOrder) {
    trigger6yoVictory(10, "排序完美！果果因果逻辑超强，真棒！");
  } else {
    const correctSequenceText = [...deductionItems].sort((a,b) => a.id.localeCompare(b.id)).map((item, idx) => `第${idx+1}步: ${item.text}`).join(' ➡️ ');
    trigger6yoFailure(window.currentQuestionExplanation || "顺序不太对哦，再仔细想想事件发生的先后因果关系！", correctSequenceText);
  }
}

function shiftTimelineNode(index, direction) {
  // Kept for backward compatibility
  const target = index + direction;
  if (target < 0 || target >= currentDeductionTimeline.length) return;
  [currentDeductionTimeline[index], currentDeductionTimeline[target]] = [currentDeductionTimeline[target], currentDeductionTimeline[index]];
}

// --- Tap interactions (extremely finger-friendly for iPad) ---
function placeDeductionItemInSlot(itemId) {
  const itemIdx = deductionPool.findIndex(i => i.id === itemId);
  if (itemIdx === -1) return;
  
  const emptySlotIdx = deductionSlots.findIndex(s => s === null);
  if (emptySlotIdx === -1) {
    speakText("格子已经满了哦，可以点击上面的卡片移出！");
    return;
  }
  
  const item = deductionPool[itemIdx];
  deductionSlots[emptySlotIdx] = item;
  deductionPool.splice(itemIdx, 1);
  
  playTickSound();
  rerenderDeductionSlots();
}

function returnDeductionItemToPool(slotIdx) {
  const item = deductionSlots[slotIdx];
  if (!item) return;
  
  deductionPool.push(item);
  deductionSlots[slotIdx] = null;
  
  playTickSound();
  rerenderDeductionSlots();
}

function resetDeductionTimeline() {
  deductionSlots = deductionSlots.map(() => null);
  deductionPool = [...deductionItems].sort(() => Math.random() - 0.5);
  speakText("已一键清空重置，重新开始选择吧！");
  rerenderDeductionSlots();
}

// --- High-fidelity Web Audio API synth tick sound ---
function playTickSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(580, audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(850, audioCtx.currentTime + 0.06);
    g.gain.setValueAtTime(0.12, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.06);
    o.start();
    o.stop(audioCtx.currentTime + 0.06);
  } catch(e){}
}

function rerenderDeductionSlots() {
  const slotsContainer = document.getElementById('deduction-slots-container');
  const poolContainer = document.getElementById('deduction-pool-container');
  if (!slotsContainer || !poolContainer) return;

  // Render Target Slots
  slotsContainer.innerHTML = deductionSlots.map((item, idx) => {
    if (item) {
      return `
        <div class="deduction-slot filled glass-card pulse-hover" data-slot-idx="${idx}" onclick="returnDeductionItemToPool(${idx})" style="padding:14px 18px; border:2px solid #a855f7; background:rgba(168,85,247,0.12); border-radius:16px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; min-height:64px; box-shadow:0 4px 15px rgba(168,85,247,0.15); transition: all 0.2s;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#a855f7; color:#fff; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:0.85em; font-weight:800; box-shadow: 0 2px 8px rgba(168,85,247,0.4);">#${idx+1}</span>
            <span style="font-weight:700; color:#fff; font-size:1.02em; text-align:left;">${item.text}</span>
          </div>
          <span style="font-size:0.8em; color:#f87171; font-weight:800; white-space:nowrap; margin-left:10px;">点击移出 ❌</span>
        </div>
      `;
    } else {
      return `
        <div class="deduction-slot empty glass-card" data-slot-idx="${idx}" style="padding:14px 18px; border:2px dashed rgba(255,255,255,0.18); background:rgba(255,255,255,0.015); border-radius:16px; display:flex; align-items:center; justify-content:center; min-height:64px; color:#71717a; font-size:0.95em; font-weight:700; letter-spacing:0.5px;">
          📭 放置第 ${idx+1} 步 (点击或拖拽下方卡片到这里)
        </div>
      `;
    }
  }).join('');

  // Render Scrambled Pool Cards
  if (deductionPool.length === 0) {
    poolContainer.innerHTML = `
      <div style="padding:20px; text-align:center; color:#a1a1aa; font-weight:600; font-size:0.95em; width:100%; border:1px dashed rgba(255,255,255,0.05); border-radius:16px; background:rgba(255,255,255,0.01);">
        ✨ 卡片已全部选完！请点击【提交验证】检查是否正确！
      </div>
    `;
  } else {
    poolContainer.innerHTML = deductionPool.map((item) => {
      return `
        <div id="deduction-drag-${item.id}" class="deduction-drag-item glass-card pulse-hover" data-item-id="${item.id}" onclick="placeDeductionItemInSlot('${item.id}')" style="touch-action: none; padding:14px 18px; border:1px solid rgba(168,85,247,0.3); background:linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.04)); border-radius:16px; cursor:grab; font-weight:700; color:#fff; font-size:1.02em; display:flex; align-items:center; gap:12px; transition:transform 0.2s, box-shadow 0.2s, border-color 0.2s; box-shadow:0 4px 12px rgba(168,85,247,0.08); user-select:none;">
          <span style="font-size:1.25em;">👉</span>
          <span style="text-align:left; flex:1;">${item.text}</span>
        </div>
      `;
    }).join('');
  }

  // Setup drag polyfills
  setupDeductionDragAndDrop();
}

function handleDeductionDrop(itemId, slot) {
  if (!itemId || !slot) return;
  const slotIdx = parseInt(slot.getAttribute('data-slot-idx'));
  
  // Find item in pool
  const itemInPoolIdx = deductionPool.findIndex(i => i.id === itemId);
  if (itemInPoolIdx !== -1) {
    const itemInPool = deductionPool[itemInPoolIdx];
    // If target slot is already filled, swap the existing item back to pool
    const existingItem = deductionSlots[slotIdx];
    if (existingItem) {
      deductionPool.push(existingItem);
    }
    
    deductionSlots[slotIdx] = itemInPool;
    deductionPool.splice(itemInPoolIdx, 1);
    
    playTickSound();
    rerenderDeductionSlots();
  } else {
    // Already in slots, dragging between slots
    const sourceSlotIdx = deductionSlots.findIndex(s => s && s.id === itemId);
    if (sourceSlotIdx !== -1 && sourceSlotIdx !== slotIdx) {
      const item = deductionSlots[sourceSlotIdx];
      const targetExistingItem = deductionSlots[slotIdx];
      
      deductionSlots[sourceSlotIdx] = targetExistingItem;
      deductionSlots[slotIdx] = item;
      
      playTickSound();
      rerenderDeductionSlots();
    }
  }
}

function setupDeductionDragAndDrop() {
  const draggables = document.querySelectorAll('.deduction-drag-item');
  const slots = document.querySelectorAll('.deduction-slot');

  // --- Mouse standard HTML5 drag & drop ---
  draggables.forEach(drag => {
    drag.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', drag.getAttribute('data-item-id'));
    });
  });

  slots.forEach(slot => {
    slot.addEventListener('dragover', (e) => e.preventDefault());
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      const itemId = e.dataTransfer.getData('text/plain');
      handleDeductionDrop(itemId, slot);
    });
  });

  // --- iPad & Touch device custom finger-dragging polyfill ---
  draggables.forEach(drag => {
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;
    let isDragging = false;

    drag.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isDragging = true;
      drag.style.transition = 'none';
      drag.style.zIndex = '1000';
    }, { passive: true });

    drag.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      currentX = touch.clientX - startX;
      currentY = touch.clientY - startY;
      drag.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      
      // Crucial: prevent iPad screen scrolling when dragging elements
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    drag.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      drag.style.zIndex = '';
      drag.style.transition = 'transform 0.2s';

      const touch = e.changedTouches[0];
      
      // Hide cursor/pointerEvents to probe element underneath touch coordinate
      drag.style.pointerEvents = 'none';
      const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
      drag.style.pointerEvents = '';

      let slot = null;
      if (targetElement) {
        slot = targetElement.closest('.deduction-slot');
      }

      if (slot) {
        const itemId = drag.getAttribute('data-item-id');
        handleDeductionDrop(itemId, slot);
      } else {
        // Snap back smoothly
        drag.style.transform = 'none';
      }
    }, { passive: true });
  });
}

function launchDeduction(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let questionText = '';

  if (phase === 1) {
    // 故事排序 (Chronological)
    const q = DEDUCTION_TIMELINES[qIdx];
    deductionItems = q.items;
    deductionPool = [...q.items].sort(() => Math.random() - 0.5);
    deductionSlots = q.items.map(() => null);
    window.currentQuestionExplanation = q.hint || "根据生活的因果规律，按时间发生的先后顺序摆放这些卡片哦！";
    window.currentQuestionCorrectAnswer = [...q.items].sort((a,b) => a.id.localeCompare(b.id)).map((item, idx) => `第${idx+1}步: ${item.text}`).join(' ➡️ ');
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '🔍 逻辑排序', '故事发生顺序')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 用手指拖拽或直接点击卡片，把它们按时间先后排列好：</p>
        
        <!-- Target slots container -->
        <div id="deduction-slots-container" style="display:flex;flex-direction:column;gap:10px;margin:15px 0;"></div>
        
        <!-- Scrambled pool container -->
        <div id="deduction-pool-container" style="display:flex;flex-direction:column;gap:10px;margin:25px 0 15px;"></div>
        
        <div style="display:flex;gap:12px;margin-top:25px;">
          <button class="mock-button glow-dabao" onclick="resetDeductionTimeline()" style="flex:1;font-size:1.02em;font-weight:700;padding:12px;margin-top:0;">🔄 一键清空重新选择</button>
          <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="flex:1;font-size:1.02em;font-weight:700;padding:12px;margin-top:0;">✅ 提交验证</button>
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:15px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    rerenderDeductionSlots();
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 2) {
    // 长度/大小/速度排序
    const q = DEDUCTION_SIZE_QUESTIONS[qIdx];
    deductionItems = q.items;
    deductionPool = [...q.items].sort(() => Math.random() - 0.5);
    deductionSlots = q.items.map(() => null);
    window.currentQuestionExplanation = q.hint || "按照长度、大小或者速度属性来进行逻辑排序哦！";
    window.currentQuestionCorrectAnswer = [...q.items].sort((a,b) => a.id.localeCompare(b.id)).map((item, idx) => `第${idx+1}步: ${item.text}`).join(' ➡️ ');
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '📏 逻辑排序', '属性比较')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 用手指拖拽或点击下方卡片按要求排好顺序：</p>
        
        <!-- Target slots container -->
        <div id="deduction-slots-container" style="display:flex;flex-direction:column;gap:10px;margin:15px 0;"></div>
        
        <!-- Scrambled pool container -->
        <div id="deduction-pool-container" style="display:flex;flex-direction:column;gap:10px;margin:25px 0 15px;"></div>
        
        <p style="font-size:0.85em;color:#854d0e;background:rgba(254,240,138,0.06);border:1px solid rgba(254,240,138,0.12);padding:10px;border-radius:12px;margin:15px 0 20px;line-height:1.4;text-align:left;">💡 脑筋急转弯：${q.hint}</p>

        <div style="display:flex;gap:12px;margin-top:20px;">
          <button class="mock-button glow-dabao" onclick="resetDeductionTimeline()" style="flex:1;font-size:1.02em;font-weight:700;padding:12px;margin-top:0;">🔄 一键清空重新选择</button>
          <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="flex:1;font-size:1.02em;font-weight:700;padding:12px;margin-top:0;">✅ 提交验证</button>
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:15px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    rerenderDeductionSlots();
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 3) {
    // 天平轻重逻辑推理
    const q = DEDUCTION_WEIGHT_QUESTIONS[qIdx];
    deductionItems = q.items;
    deductionPool = [...q.items].sort(() => Math.random() - 0.5);
    deductionSlots = q.items.map(() => null);
    window.currentQuestionExplanation = q.hint || "通过两两比较的天平信息，串联起来推理出三个物体的轻重顺序！";
    window.currentQuestionCorrectAnswer = [...q.items].sort((a,b) => a.id.localeCompare(b.id)).map((item, idx) => `第${idx+1}步: ${item.text}`).join(' ➡️ ');
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '⚖️ 逻辑排序', '天平轻重推理')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:10px;">🦁 依据天平的轻重线索，给卡片排序：</p>
        
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);padding:14px;border-radius:16px;margin:15px 0;text-align:left;display:inline-block;width:100%;box-sizing:border-box;">
          ${q.clues.map(c => `<div style="font-size:1.05em;font-weight:bold;color:#fff;margin:6px 0;display:flex;align-items:center;gap:8px;">⚖️ <span>${c}</span></div>`).join('')}
        </div>
        
        <!-- Target slots container -->
        <div id="deduction-slots-container" style="display:flex;flex-direction:column;gap:10px;margin:15px 0;"></div>
        
        <!-- Scrambled pool container -->
        <div id="deduction-pool-container" style="display:flex;flex-direction:column;gap:10px;margin:25px 0 15px;"></div>
        
        <p style="font-size:0.85em;color:#854d0e;background:rgba(254,240,138,0.06);border:1px solid rgba(254,240,138,0.12);padding:10px;border-radius:12px;margin:15px 0 20px;line-height:1.4;text-align:left;">💡 逻辑线索提示：${q.hint}</p>

        <div style="display:flex;gap:12px;margin-top:20px;">
          <button class="mock-button glow-dabao" onclick="resetDeductionTimeline()" style="flex:1;font-size:1.02em;font-weight:700;padding:12px;margin-top:0;">🔄 一键清空重新选择</button>
          <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="flex:1;font-size:1.02em;font-weight:700;padding:12px;margin-top:0;">✅ 提交验证</button>
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:15px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    rerenderDeductionSlots();
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 4) {
    // 因果判断单选题
    const q = DEDUCTION_CAUSAL_QUESTIONS[qIdx];
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.opts[q.ans];
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '💭 逻辑推理', '因果判断')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <div class="glass-card" style="padding:15px;margin:20px 0;background:rgba(168,85,247,0.06);border-color:rgba(168,85,247,0.2);">
          <p style="font-size:1.1em;color:#fff;font-weight:700;line-height:1.5;margin:0;">${q.text}</p>
        </div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:20px;">💡 提示：${q.hint}</p>
        <div style="display:flex;flex-direction:column;gap:12px;max-width:440px;margin:0 auto;">
          ${q.opts.map((opt, idx) => `
            <button class="mock-button glow-dabao" onclick="checkDeductionChoice(${idx}, ${q.ans})" style="font-size:1.05em;padding:15px;border-radius:12px;font-weight:700;text-align:left;margin-top:0;">${opt}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else {
    // 排队/排座位推理
    const q = DEDUCTION_QUEUE_QUESTIONS[qIdx];
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.opts[q.ans];
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '🐾 逻辑推理', '队列排座位')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <div class="glass-card" style="padding:18px;margin:20px 0;background:rgba(168,85,247,0.06);border-color:rgba(168,85,247,0.2);">
          <p style="font-size:1.05em;color:#fff;font-weight:700;line-height:1.5;margin:0;">${q.text}</p>
        </div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:20px;">💡 提示：${q.hint}</p>
        <div style="display:grid;grid-template-columns:1fr;gap:10px;max-width:440px;margin:0 auto;">
          ${q.opts.map((opt, idx) => `
            <button class="mock-button glow-dabao" onclick="checkDeductionChoice(${idx}, ${q.ans})" style="font-size:1.1em;padding:15px;border-radius:12px;font-weight:700;margin-top:0;">${opt}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
}
