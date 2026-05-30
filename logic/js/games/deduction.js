/* 🧠 脑力认知研究所 - 逻辑演绎与时序排序模块 Deduction Games Engine */

let currentDeductionTimeline = [];

function checkDeductionChoice(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "逻辑推断完美！果果的推理分析能力超强！");
  } else {
    speakText("再仔细想想，换个答案试试看！");
    showWrongToast();
  }
}

function verifyDabaoTimeline() {
  const order = currentDeductionTimeline.map(i => i.id).join('');
  const targetOrder = currentDeductionTimeline.length === 3 ? '123' : '1234';
  if (order === targetOrder) {
    trigger6yoVictory(10, "排序完美！果果因果逻辑超强，真棒！");
  } else {
    speakText("顺序不太对哦，再想想看！");
    showWrongToast();
  }
}

function shiftTimelineNode(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= currentDeductionTimeline.length) return;
  [currentDeductionTimeline[index], currentDeductionTimeline[target]] = [currentDeductionTimeline[target], currentDeductionTimeline[index]];
  rerenderTimelineStage();
}

function rerenderTimelineStage() {
  const container = document.getElementById('timeline-list');
  if (!container) return;
  container.innerHTML = currentDeductionTimeline.map((item, idx) => `
    <div class="glass-card timeline-node" style="padding:13px;border-color:rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);display:flex;justify-content:space-between;align-items:center;">
      <span style="font-weight:600;color:#fff;font-size:0.95em;">${item.text}</span>
      <div style="display:flex;gap:5px;">
        <button class="mock-button" onclick="shiftTimelineNode(${idx},-1)" style="padding:3px 8px;font-size:0.85em;">↑</button>
        <button class="mock-button" onclick="shiftTimelineNode(${idx},1)" style="padding:3px 8px;font-size:0.85em;">↓</button>
      </div>
    </div>
  `).join('');
}

function launchDeduction(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let questionText = '';

  if (phase === 1) {
    // 故事排序 (Chronological)
    const q = DEDUCTION_TIMELINES[qIdx];
    currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '🔍 逻辑排序', '故事发生顺序')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 请调整卡片顺序，按时间发生先后排列：</p>
        <div id="timeline-list" style="display:flex;flex-direction:column;gap:10px;margin:15px 0;"></div>
        <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="width:100%;font-size:1.05em;font-weight:700;padding:10px;margin-top:10px;">✅ 提交验证</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:15px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    rerenderTimelineStage();
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 2) {
    // 长度/大小/速度排序
    const q = DEDUCTION_SIZE_QUESTIONS[qIdx];
    currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '📏 逻辑排序', '属性比较')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 用右边的 ↑ ↓ 按钮，把卡片按要求排好顺序：</p>
        <div id="timeline-list" style="display:flex;flex-direction:column;gap:10px;margin:15px 0;"></div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:15px;">💡 ${q.hint}</p>
        <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="width:100%;font-size:1.05em;font-weight:700;padding:10px;margin-top:10px;">✅ 提交验证</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:15px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    rerenderTimelineStage();
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 3) {
    // 天平轻重逻辑推理
    const q = DEDUCTION_WEIGHT_QUESTIONS[qIdx];
    currentDeductionTimeline = [...q.items].sort(() => Math.random() - 0.5);
    questionText = q.text;

    container.innerHTML = `
      <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(168,85,247,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#d8b4fe;font-weight:800;margin:0;">${getLevelTitle(level, '⚖️ 逻辑排序', '天平轻重推理')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:10px;">🦁 依据天平的轻重线索，给卡片排序：</p>
        
        <div style="background:rgba(255,255,255,0.04);padding:12px;border-radius:12px;margin:10px 0;text-align:left;display:inline-block;">
          ${q.clues.map(c => `<div style="font-size:1.05em;font-weight:bold;color:#fff;margin:5px 0;">${c}</div>`).join('')}
        </div>
        
        <div id="timeline-list" style="display:flex;flex-direction:column;gap:10px;margin:15px 0;"></div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:15px;">💡 ${q.hint}</p>
        <button class="mock-button glow-success" onclick="verifyDabaoTimeline()" style="width:100%;font-size:1.05em;font-weight:700;padding:10px;margin-top:10px;">✅ 提交验证</button>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:15px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    rerenderTimelineStage();
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 4) {
    // 因果判断单选题
    const q = DEDUCTION_CAUSAL_QUESTIONS[qIdx];
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
            <button class="mock-button glow-dabao" onclick="checkDeductionChoice(${idx}, ${q.ans})" style="font-size:1.05em;padding:15px;border-radius:12px;font-weight:700;text-align:left;">${opt}</button>
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
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;max-width:440px;margin:0 auto;">
          ${q.opts.map((opt, idx) => `
            <button class="mock-button glow-dabao" onclick="checkDeductionChoice(${idx}, ${q.ans})" style="font-size:1.1em;padding:15px;border-radius:12px;font-weight:700;">${opt}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
}
