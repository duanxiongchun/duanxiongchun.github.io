/* 🧠 脑力认知研究所 - 图形矩阵推理与逻辑模块 Pattern Games Engine */

function checkPatternAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "图形规律找对了！果果的推理能力超级厉害！");
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "再仔细看看规律，试试别的答案！", window.currentQuestionCorrectAnswer || "正确选项");
  }
}

function launchPattern(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let q = null;

  if (phase === 1) {
    q = PATTERN_QUESTIONS[qIdx];
  } else {
    q = getDynamicPattern(qIdx, phase);
  }

  currentPatternAnswer = q.ans.toString();
  window.currentQuestionExplanation = q.hint;
  window.currentQuestionCorrectAnswer = q.opts[q.ans];
  const questionText = q.text || '果果，观察图形变化规律，找出右下角问号处应该填哪个？';
  window.currentQuestionText = questionText;
  window.currentQuestionOptions = q.opts;

  // Set global currentSpatialQuestion for parameter-less animation helper
  window.currentSpatialQuestion = {
    original: q.matrix ? q.matrix[0] : '',
    hint: q.hint || '',
    title: q.text || ''
  };

  // Shuffling options
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);

  let helpBtnHTML = '';
  if (q.hint && (q.hint.includes('镜像') || q.hint.includes('对称') || q.hint.includes('折叠'))) {
    helpBtnHTML = `<button class="mock-button glow-success" onclick="showSpatialHelpAnimation('mirror')" style="padding:3px 10px;font-size:0.8em;margin-top:0;border-radius:15px;display:inline-flex;align-items:center;gap:4px;margin-bottom:0;">🎬 观看动画演示</button>`;
  } else if (q.hint && (q.hint.includes('旋转') || q.hint.includes('转动') || q.hint.includes('针'))) {
    helpBtnHTML = `<button class="mock-button glow-success" onclick="showSpatialHelpAnimation('rotate')" style="padding:3px 10px;font-size:0.8em;margin-top:0;border-radius:15px;display:inline-flex;align-items:center;gap:4px;margin-bottom:0;">🎬 观看动画演示</button>`;
  }

  container.innerHTML = `
    <div class="glass-card game-stage-card" style="border-color:rgba(251,191,36,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#fbbf24;font-weight:800;margin:0;">${getLevelTitle(level, '🎨 图形矩阵推理', '找寻矩阵规律')}</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:20px;">🦁 找出规律，选出问号处正确的答案：</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:320px;margin:0 auto 25px;">
        ${q.matrix.map((cell, i) => `
          <div class="glass-card" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;font-size:${cell.length > 4 ? '0.9em' : '1.5em'};min-height:60px;display:flex;align-items:center;justify-content:center;${i===8?'border:2px dashed #fbbf24;color:#fbbf24;font-weight:800;':''}">
            ${i===8 ? '❓' : cell}
          </div>
        `).join('')}
      </div>
      <p style="font-size:0.85em;color:#94a3b8;margin-bottom:15px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">
        <span>💡 ${q.hint}</span>
        ${helpBtnHTML}
      </p>
      <div class="responsive-options-grid max-360">
        ${shuffled.map((item) => {
          const hasChinese = /[\u4e00-\u9fa5]/.test(item.o);
          const padRight = hasChinese ? 'padding-right:42px;' : '';
          return `
            <button class="mock-button glow-dabao" onclick="checkPatternAnswer(${item.i},${q.ans})" style="position:relative;font-size:${item.o.length>4?'0.85em':'1.2em'};padding:12px;${padRight}border-radius:10px;min-height:55px;">
              ${item.o}
              ${hasChinese ? `<span class="option-speak-btn" onclick="event.stopPropagation(); speakText('${item.o.replace(/['"]/g," ")}')" title="朗读选项">🔊</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
    </div>
  `;
  setTimeout(() => speakText(questionText), 300);
}
