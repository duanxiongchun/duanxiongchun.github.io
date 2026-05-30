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
    speakText("再回忆回忆，想一想再选！");
    showWrongToast();
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
    speakText("这里没有金币哦，再想想！");
    const btn = document.getElementById(`coin-cell-${idx}`);
    if (btn) {
      btn.style.background = 'rgba(239, 68, 68, 0.3)';
      setTimeout(() => { btn.style.background = ''; }, 400);
    }
    showWrongToast();
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
    speakText("不对哦，倒过来背，想想最后一个数是哪个？");
    showWrongToast();
  }
}

function startMemoryRecall(originalSeq) {
  memoryCurrentIdx = 0;
  const recallArea = document.getElementById('memory-recall-area');
  if (!recallArea) return;
  recallArea.style.display = 'block';

  // 创建打乱的选项（含干扰项）
  const allEmojis = ['🍎','🐱','🌟','🔴','🔵','🟡','🟢','🐘','🦁','🐯','🐶','⭐','🌙','☀️','🌈','🍊','🍋','🍇','🍓','🍑','🏠','🚗','✈️','🚢','🎈','🎁','🎂','🎊','🎉','1','2','3','4','5','6','7','8','9'];
  const distractors = allEmojis.filter(e => !originalSeq.includes(e));
  const opts = [...originalSeq, ...distractors.slice(0, 4)].sort(() => Math.random() - 0.5);

  recallArea.innerHTML = `
    <p style="font-size:0.9em;color:#f472b6;font-weight:700;margin-bottom:15px;">🎯 请点击第 <span id="recall-pos">1</span> 个图案：</p>
    <div id="selected-display" style="display:flex;justify-content:center;gap:10px;min-height:50px;margin-bottom:15px;flex-wrap:wrap;">
      ${originalSeq.map(() => `<div style="width:50px;height:50px;border-radius:10px;border:2px dashed rgba(255,255,255,0.2);"></div>`).join('')}
    </div>
    <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
      ${opts.map(o => `<button class="mock-button glow-dabao" id="recall-btn-${o}" onclick="clickMemoryRecall('${o}', ${JSON.stringify(originalSeq)})" style="font-size:1.5em;width:58px;height:58px;border-radius:12px;">${o}</button>`).join('')}
    </div>
  `;
}

function clickMemoryRecall(selected, originalSeq) {
  if (selected !== originalSeq[memoryCurrentIdx]) {
    speakText("不对哦！试试别的图案！");
    showWrongToast();
    return;
  }
  // 正确：更新显示
  const slots = document.querySelectorAll('#selected-display div');
  if (slots[memoryCurrentIdx]) {
    slots[memoryCurrentIdx].innerHTML = selected;
    slots[memoryCurrentIdx].style.border = '2px solid #10b981';
    slots[memoryCurrentIdx].style.fontSize = '1.5em';
    slots[memoryCurrentIdx].style.display = 'flex';
    slots[memoryCurrentIdx].style.alignItems = 'center';
    slots[memoryCurrentIdx].style.justifyContent = 'center';
  }
  const btn = document.getElementById(`recall-btn-${selected}`);
  if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; }

  memoryCurrentIdx++;
  const posEl = document.getElementById('recall-pos');
  if (posEl) posEl.innerText = memoryCurrentIdx + 1;

  if (memoryCurrentIdx >= originalSeq.length) {
    trigger6yoVictory(10, "全部记对了！果果的记忆力超级厉害！");
  }
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
    questionText = q.q;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
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
    questionText = `果果，记住金币躲在哪些格子里！马上要盖上木板喽！`;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
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
    questionText = `果果，记住这四样东西的摆放位置哦！一会要考考你！`;
    
    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
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
    questionText = `果果，仔细看这几个图案，一会会有一个小调皮藏起来！`;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#f472b6;font-weight:800;margin:0;">${getLevelTitle(level, '🕵️‍♂️ 短时记忆', '谁不见了')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p id="missing-prompt" style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 盯住下面这${q.show.length}个图案，3 秒后有人要躲猫猫：</p>
        <div id="missing-display" style="display:flex;justify-content:center;gap:15px;margin:25px 0;flex-wrap:wrap;">
          ${q.show.map(s => `<div class="glass-card" style="font-size:2.5em;border:2px solid rgba(255,255,255,0.15);width:70px;height:70px;display:flex;align-items:center;justify-content:center;">${s}</div>`).join('')}
        </div>
        <div id="missing-countdown" style="font-size:1.05em;color:#f472b6;font-weight:700;">👀 倒计时，3 秒后有人消失...</div>
        <div id="missing-opts" style="display:none;grid-template-columns:repeat(3,1fr);gap:10px;max-width:360px;margin:20px auto 0;"></div>
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
          <button class="mock-button glow-dabao" onclick="checkMemoryChoice(${idx}, ${correctIdx}, '真聪明！果果的记忆追踪能力一流！')" style="font-size:0.95em;padding:12px 6px;border-radius:10px;font-weight:700;">${opt}</button>
        `).join('');
      }
    }, 3000);
  }
  else {
    // 逆序数字记忆复现 (Digit Span Backward)
    const q = MEMORY_BACKWARD_QUESTIONS[qIdx];
    questionText = `果果，记住这三个数字！一会要倒着（从右往左）选出来哦！挑战性极强！`;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(236,72,153,0.3);">
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
