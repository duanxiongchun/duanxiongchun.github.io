/* 🧠 脑力认知研究所 - 类比推理与事物关联模块 Analogy Games Engine */

function checkAnalogyAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "类比推理答对了！果果的逻辑太厉害了！");
  } else {
    speakText("再想想它们的关系，换个答案试试！");
    showWrongToast();
  }
}

function launchAnalogy(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let q = null;

  if (phase === 1) {
    q = ANALOGY_QUESTIONS[qIdx];
  } else {
    q = getDynamicAnalogy(qIdx, phase);
  }

  currentAnalogyAnswer = q.ans.toString();
  const questionText = q.text;

  // Shuffling options
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(167,139,250,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#c4b5fd;font-weight:800;margin:0;">${getLevelTitle(level, '🔗 关联类比推理', '事物关系类比')}</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${q.text.replace(/['"]/g,' ')}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <div class="glass-card" style="padding:20px;margin:20px 0;background:rgba(167,139,250,0.06);border-color:rgba(167,139,250,0.2);">
        <p style="font-size:1.2em;color:#fff;font-weight:700;line-height:1.6;margin:0;">${q.text}</p>
      </div>
      <p style="font-size:0.85em;color:#64748b;margin-bottom:20px;">💡 ${q.hint}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:440px;margin:0 auto;">
        ${shuffled.map(item => `
          <button class="mock-button glow-dabao" onclick="checkAnalogyAnswer(${item.i},${q.ans})" style="font-size:1.05em;padding:15px;border-radius:12px;font-weight:700;line-height:1.4;text-align:left;">
            ${item.o}
          </button>
        `).join('')}
      </div>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
    </div>
  `;
  setTimeout(() => speakText(q.text.replace(/[→]/g, '对应')), 300);
}
