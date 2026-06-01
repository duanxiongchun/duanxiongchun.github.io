/* 🧠 脑力认知研究所 - 短时记忆与工作记忆模块 Memory Games Engine */

let coinsToFind = [];
let coinsFound = [];
let backwardCurrentIdx = 0;
let backwardExpected = [];
let memoryPhase = 'show'; // 'show' | 'recall'
let memoryExpected = [];
let memoryCurrentIdx = 0;

function checkMemoryChoice(selected, correct, feedback = "短时记忆答对了！果果记忆力真棒！") {
  if (selected === correct) {
    trigger6yoVictory(10, feedback);
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "再回忆回忆，想一想再选！", window.currentQuestionCorrectAnswer || "正确选项");
  }
}

function clickCoinCell(idx) {
  if (coinsToFind.includes(idx)) {
    if (!coinsFound.includes(idx)) {
      coinsFound.push(idx);
      const btn = document.getElementById(`coin-cell-${idx}`);
      if (btn) {
        btn.innerHTML = '🪙';
        btn.style.background = 'rgba(16, 185, 129, 0.4)';
        btn.style.borderColor = '#10b981';
      }
      
      if (coinsFound.length === coinsToFind.length) {
        setTimeout(() => {
          trigger6yoVictory(10, "太厉害了！果果把藏起来的金币全都找到了！超强记忆！");
        }, 300);
      }
    }
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "要记住金币藏在哪了哦！下一次可以用指头比着金币的位置，在脑海里多画几遍！", window.currentQuestionCorrectAnswer || "藏硬币的格子位置");
  }
}

function clickBackwardRecall(num) {
  if (num === backwardExpected[backwardCurrentIdx]) {
    const slot = document.getElementById(`back-slot-${backwardCurrentIdx}`);
    if (slot) {
      slot.innerText = num;
      slot.style.borderColor = '#10b981';
      slot.style.background = 'rgba(16,185,129,0.1)';
    }
    backwardCurrentIdx++;
    if (backwardCurrentIdx >= backwardExpected.length) {
      setTimeout(() => {
        trigger6yoVictory(10, "哇！倒背也能完全记对！果果的记忆力和专注力满分！");
      }, 300);
    }
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "不对哦，倒过来背，想想最后一个数是哪个？", window.currentQuestionCorrectAnswer || "正确逆序");
  }
}

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
    trigger6yoFailure(window.currentQuestionExplanation || "要记住图案的左右位置和排列顺序哦，可以用小指头指着屏幕，在大脑里多念几遍图案的名字！", window.currentQuestionCorrectAnswer || memoryExpected.join(" ➡️ "));
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
    trigger6yoFailure(window.currentQuestionExplanation || "要记住图案的左右位置和排列顺序哦，可以用小指头指着屏幕，在大脑里多念几遍图案的名字！", window.currentQuestionCorrectAnswer || memoryExpected.join(" ➡️ "));
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

function launchMemory(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let questionText = '';

  if (phase === 1) {
    // 序列闪现记忆
    const q = MEMORY_QUESTIONS[qIdx];
    currentMemorySequence = q.show;
    memoryPhase = 'show';
    memoryExpected = [...q.show];
    memoryCurrentIdx = 0;
    window.currentQuestionExplanation = "观察并记住屏幕上图案的排列顺序，盖上后需要你按顺序点选或者拖拽回去哦！";
    window.currentQuestionCorrectAnswer = q.show.join(" ➡️ ");
    questionText = q.q;
    window.currentQuestionText = questionText;

    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">${getLevelTitle(level, '🧠 短时记忆', '闪现复现')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 仔细记住下面这些图案的顺序，${q.show.length}秒后会消失哦！</p>
        <div id="memory-display" style="display:flex;justify-content:center;gap:15px;margin:25px 0;flex-wrap:wrap;">
          ${q.show.map(s => `<div class="glass-card" style="font-size:2.5em;border:2px solid rgba(255,255,255,0.15);width:70px;height:70px;display:flex;align-items:center;justify-content:center;">${s}</div>`).join('')}
        </div>
        <div id="memory-countdown" style="font-size:1.1em;color:#f472b6;font-weight:700;">👀 请记住！${q.show.length + 1} 秒后隐藏...</div>
        <div id="memory-recall-area" style="display:none;"></div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;

    speakText(`果果，仔细记住这${q.show.length}个图案的顺序，马上要考你了！`);

    let countdown = q.show.length + 1;
    const timer = setInterval(() => {
      countdown--;
      const cdEl = document.getElementById('memory-countdown');
      if (cdEl) cdEl.innerText = countdown > 0 ? `👀 请记住！${countdown} 秒后隐藏...` : '🙈 隐藏了！现在请按顺序选出来：';
      if (countdown <= 0) {
        clearInterval(timer);
        const disp = document.getElementById('memory-display');
        if (disp) disp.style.display = 'none';
        startMemoryRecall(q.show);
      }
    }, 1000);
  }
  else if (phase === 2) {
    // 藏金币网格记忆
    const q = MEMORY_COIN_LEVELS[qIdx];
    coinsToFind = q.coins;
    coinsFound = [];
    window.currentQuestionExplanation = "记住小硬币藏在哪了哦！可以在它们隐藏前用指头跟着硬币位置在空中画画，加强脑力记忆！";
    window.currentQuestionCorrectAnswer = "金币位置在第 " + q.coins.map(c => c + 1).join(", ") + " 个格子上";
    questionText = `果果，记住金币躲在哪些格子里！马上要盖上木板喽！`;
    window.currentQuestionText = questionText;

    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">${getLevelTitle(level, '🪙 短时记忆', '藏金币')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 仔细盯住闪闪发光的金币位置，马上就要盖上它：</p>
        
        <div id="coin-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px auto;max-width:240px;">
          ${Array.from({length:9}).map((_, idx) => `
            <div id="coin-cell-${idx}" style="height:70px;border-radius:12px;background:${q.coins.includes(idx)?'rgba(251,191,36,0.2)':'rgba(255,255,255,0.04)'};border:2px solid ${q.coins.includes(idx)?'#fbbf24':'rgba(255,255,255,0.08)'};display:flex;align-items:center;justify-content:center;font-size:2em;">
              ${q.coins.includes(idx)?'🪙':''}
            </div>
          `).join('')}
        </div>
        <div id="coin-countdown" style="font-size:1.05em;color:#fbbf24;font-weight:700;animation:blinker 1s infinite;">👀 正在记忆，3 秒后覆盖...</div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;

    speakText(questionText);

    setTimeout(() => {
      const cdEl = document.getElementById('coin-countdown');
      if (cdEl) cdEl.innerText = '🙈 已经盖上啦！请点击找出刚才那几个藏着金币的格子：';
      
      Array.from({length:9}).forEach((_, idx) => {
        const cell = document.getElementById(`coin-cell-${idx}`);
        if (cell) {
          cell.innerHTML = '❓';
          cell.style.background = 'rgba(255,255,255,0.06)';
          cell.style.borderColor = 'rgba(255,255,255,0.1)';
          cell.style.cursor = 'pointer';
          cell.setAttribute('onclick', `clickCoinCell(${idx})`);
        }
      });
    }, 3000);
  }
  else if (phase === 3) {
    // 颜色位置配对记忆
    const q = MEMORY_PAIR_TEMPLATES[qIdx];
    window.currentQuestionExplanation = "要仔细记住四件物品藏在哪个格子（角落）里哦！一会要你找出其中一件物品对应的格子位置。";
    const correctIdx = q.items.indexOf(q.q);
    window.currentQuestionCorrectAnswer = "【" + q.q + "】的位置是在第 " + (correctIdx + 1) + " 个格子里";
    questionText = `果果，记住这四样东西的摆放位置哦！一会要考考你！`;
    window.currentQuestionText = questionText;
    
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">${getLevelTitle(level, '📦 短时记忆', '位置绑定')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 仔细看清楚，四个各自是什么，在哪个角落：</p>
        
        <div id="pair-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px auto;max-width:220px;">
          ${q.items.map((item, idx) => `
            <div id="pair-cell-${idx}" class="glass-card" style="height:85px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1.15em;font-weight:bold;border-color:rgba(255,255,255,0.1);padding:0;">
              ${item}
            </div>
          `).join('')}
        </div>
        <div id="pair-countdown" style="font-size:1.05em;color:#f472b6;font-weight:700;">👀 真实记忆中，3 秒后隐藏...</div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;

    speakText(questionText);

    setTimeout(() => {
      const qText = `果果，刚才的【${q.q}】是在哪个格子里呢？请点出来！`;
      speakText(qText);
      
      const cdEl = document.getElementById('pair-countdown');
      if (cdEl) cdEl.innerText = `🎯 提问：刚才的【${q.q}】在哪？`;

      const correctIdx = q.items.indexOf(q.q);

      q.items.forEach((item, idx) => {
        const cell = document.getElementById(`pair-cell-${idx}`);
        if (cell) {
          cell.innerHTML = '❓';
          cell.style.fontSize = '2em';
          cell.style.cursor = 'pointer';
          cell.setAttribute('onclick', `checkMemoryChoice(${idx}, ${correctIdx}, '太牛了！果果完美记住了它的位置！太棒了！')`);
        }
      });
    }, 3000);
  }
  else if (phase === 4) {
    // 消失的那个是什么
    const q = MEMORY_MISSING_QUESTIONS[qIdx];
    window.currentQuestionExplanation = "有几个图案会被拿走，仔细对比原来和现在的图案序列，找出谁不见了。";
    window.currentQuestionCorrectAnswer = q.ans;
    questionText = `果果，仔细看这几个图案，一会会有一个小调皮藏起来！`;
    window.currentQuestionText = questionText;

    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">${getLevelTitle(level, '🕵️‍♂️ 短时记忆', '谁不见了')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p id="missing-prompt" style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 盯住下面这${q.show.length}个图案，3 秒后有人要躲猫猫：</p>
        <div id="missing-display" style="display:flex;justify-content:center;gap:15px;margin:25px 0;flex-wrap:wrap;">
          ${q.show.map(s => `<div class="glass-card" style="font-size:2.5em;border:2px solid rgba(255,255,255,0.15);width:70px;height:70px;display:flex;align-items:center;justify-content:center;">${s}</div>`).join('')}
        </div>
        <div id="missing-opts" class="responsive-options-grid" style="display:none;max-width:360px;margin:20px auto 0;"></div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;

    speakText(questionText);

    setTimeout(() => {
      const qText = q.qText || '哪个图案不见了？';
      speakText(`果果，${qText}`);

      const cdEl = document.getElementById('missing-countdown');
      if (cdEl) cdEl.innerText = `🎯 提问：谁藏起来不见了？`;

      const prompt = document.getElementById('missing-prompt');
      if (prompt) prompt.innerText = '🦁 下面是现在留下的图案（少了一个）：';

      const disp = document.getElementById('missing-display');
      if (disp) {
        disp.innerHTML = q.recall.map(s => `<div class="glass-card" style="font-size:2.5em;border:2px solid rgba(255,255,255,0.15);width:70px;height:70px;display:flex;align-items:center;justify-content:center;">${s}</div>`).join('');
      }

      const optsDiv = document.getElementById('missing-opts');
      if (optsDiv) {
        optsDiv.style.display = 'grid';
        const correctIdx = q.opts.findIndex(o => o.startsWith(q.ans));
        optsDiv.innerHTML = q.opts.map((opt, idx) => `
          <button class="mock-button glow-dabao" onclick="checkMemoryChoice(${idx}, ${correctIdx}, '真聪明！果果的记忆追踪能力一流！')" style="position:relative;font-size:0.95em;padding:12px 6px;padding-right:38px;border-radius:10px;font-weight:700;">
            ${opt}
            <span class="option-speak-btn" onclick="event.stopPropagation(); speakText('${opt.replace(/['"\n]/g," ")}')" style="position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:0.8em;padding:2px 4px;" title="朗读选项">🔊</span>
          </button>
        `).join('');
      }
    }, 3000);
  }
  else {
    // 逆序数字记忆复现 (Digit Span Backward)
    const q = MEMORY_BACKWARD_QUESTIONS[qIdx];
    window.currentQuestionExplanation = "倒背数序是数字工作记忆的脑力挑战。比如看到 4-9-1，倒过来念就是 1-9-4 哦！";
    window.currentQuestionCorrectAnswer = "逆序倒背顺序是：" + q.ans.join(" ➡️ ");
    questionText = `果果，记住这三个数字！一会要倒着（从右往左）选出来哦！挑战性极强！`;
    window.currentQuestionText = questionText;

    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">${getLevelTitle(level, '⏪ 短时记忆', '数字逆序倒背')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 仔细记住这${q.show.length}个数字，3 秒后隐藏。然后【倒着】选出来：</p>
        <div id="backward-display" style="display:flex;justify-content:center;gap:15px;margin:25px 0;flex-wrap:wrap;">
          ${q.show.map(s => `<div class="glass-card" style="font-size:2.5em;border:2px solid rgba(255,255,255,0.15);width:70px;height:70px;display:flex;align-items:center;justify-content:center;color:#f472b6;font-weight:bold;">${s}</div>`).join('')}
        </div>
        <div id="backward-countdown" style="font-size:1.05em;color:#f472b6;font-weight:700;">👀 记忆中，3 秒后隐藏...</div>
        <div id="backward-recall-area" style="display:none;"></div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;

    speakText(questionText);

    setTimeout(() => {
      speakText("隐藏啦！现在请把数字【倒着】选出来吧！");
      const cdEl = document.getElementById('backward-countdown');
      if (cdEl) cdEl.innerText = '⏪ 隐藏啦！请倒着（从右到左）点击选出来：';

      const disp = document.getElementById('backward-display');
      if (disp) disp.style.display = 'none';

      const recallArea = document.getElementById('backward-recall-area');
      if (recallArea) {
        recallArea.style.display = 'block';
        backwardExpected = [...q.ans];
        backwardCurrentIdx = 0;
        
        // Options: sorted numbers
        const pool = [...q.show].sort(() => Math.random() - 0.5);
        recallArea.innerHTML = `
          <div id="backward-ans-display" style="display:flex;justify-content:center;gap:12px;margin:15px 0;min-height:50px;">
            ${q.show.map((_, i) => `<div id="back-slot-${i}" class="glass-card" style="width:50px;height:50px;border:2px dashed rgba(255,255,255,0.15);border-radius:10px;font-size:1.6em;font-weight:bold;color:#f472b6;display:flex;align-items:center;justify-content:center;">❓</div>`).join('')}
          </div>
          <div style="display:flex;justify-content:center;gap:12px;margin-top:20px;">
            ${pool.map(num => `
              <button id="backward-btn-${num}" class="mock-button glow-dabao" onclick="clickBackwardRecall(${num})" style="font-size:1.6em;width:60px;height:60px;border-radius:50%;font-weight:bold;">${num}</button>
            `).join('')}
          </div>
        `;
      }
    }, 3000);
  }
}
