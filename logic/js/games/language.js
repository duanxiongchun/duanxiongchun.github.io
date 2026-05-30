/* 🧠 脑力认知研究所 - 言语理解分类与常识模块 Language Games Engine */

function checkLanguageAnswer(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "答对了！果果的语言理解能力真棒！");
  } else {
    speakText("再想想，换个答案试试！");
    showWrongToast();
  }
}

function launchLanguage(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let q = null;

  if (phase === 1) {
    q = LANGUAGE_QUESTIONS[qIdx];
  } else {
    q = getDynamicLanguage(qIdx, phase);
  }

  currentLanguageAnswer = q.ans.toString();
  const questionText = q.text;

  // Shuffling options
  const optsWithIdx = q.opts.map((o, i) => ({o, i}));
  const shuffled = [...optsWithIdx].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="glass-card" style="padding:30px;text-align:center;max-width:600px;margin:20px auto;border-color:rgba(34,211,238,0.3);">
      <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="color:#22d3ee;font-weight:800;margin:0;">${getLevelTitle(level, '📚 言语理解与表达', '分类常识与谜语')}</h3>
        <button class="mock-button glow-dabao" onclick="speakText('${q.text.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
      </div>
      <div class="glass-card" style="padding:20px;margin:20px 0;background:rgba(34,211,238,0.05);border-color:rgba(34,211,238,0.2);">
        <p style="font-size:1.1em;color:#fff;font-weight:700;line-height:1.5;margin:0;">${q.text}</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:440px;margin:0 auto;">
        ${shuffled.map(item => `
          <button class="mock-button glow-dabao" onclick="checkLanguageAnswer(${item.i},${q.ans})" style="font-size:1em;padding:15px;border-radius:12px;font-weight:700;line-height:1.4;text-align:left;">
            ${item.o}
          </button>
        `).join('')}
      </div>
      <p style="font-size:0.8em;color:#64748b;margin-top:15px;">💡 ${q.hint}</p>
      <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:20px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
    </div>
  `;
  setTimeout(() => speakText(q.text), 300);
}
