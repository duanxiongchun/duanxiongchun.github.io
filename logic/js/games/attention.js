/* 🧠 脑力认知研究所 - 注意力扫描与筛选模块 Attention Games Engine */

function clickSchulteTrack(n, start, end, step) {
  if (n !== window.schulteTarget) {
    speakText("不对哦，找找顺序！");
    const btn = document.getElementById(`cell-${n}`);
    if (btn) { btn.style.background = 'rgba(239,68,68,0.3)'; setTimeout(()=>{ btn.style.background=''; }, 400); }
    return;
  }
  const btn = document.getElementById(`cell-${n}`);
  if (btn) { btn.style.background = 'rgba(16,185,129,0.5)'; btn.disabled = true; btn.style.color = '#fff'; }
  window.schulteTarget += step;
  if ((step > 0 && window.schulteTarget > end) || (step < 0 && window.schulteTarget < end)) {
    trigger6yoVictory(10, "太棒了！全部按顺序点完了！果果注意力超级强！");
  }
}

function checkAttentionChoice(selected, correct, feedback = "注意力扫描答对了！果果真专注！") {
  if (selected === correct) {
    trigger6yoVictory(10, feedback);
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "再仔细看一看，专注地找出不一样的细节哦！", window.currentQuestionCorrectAnswer || "正确选项");
  }
}

function launchAttention(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let questionText = '';
  
  if (phase === 1) {
    // 舒尔特格 1-9
    questionText = '果果，请从小到大，按顺序快速点击一到九的数字格子！';
    window.currentQuestionText = questionText;
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">${getLevelTitle(level, '⚡ 注意力', '舒尔特格')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 按 1 ➡️ 9 顺序点击格子：</p>
        <div id="schulte-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px auto;max-width:270px;"></div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    
    const grid = document.getElementById('schulte-grid');
    const numbers = [1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
    grid.innerHTML = numbers.map(n => `<button id="cell-${n}" class="schulte-cell mock-button glow-dabao" onclick="clickSchulteTrack(${n},1,9,1)" style="height:72px;font-size:1.8em;font-weight:bold;">${n}</button>`).join('');
    window.schulteTarget = 1;
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 2) {
    // 找不同符号
    const t = ATTENTION_SPOT_TEMPLATES[qIdx];
    window.currentQuestionExplanation = "要在很多相同的图案中找出那个长得不一样的细节图案哦！小兔子需要你专注去观察细节。";
    window.currentQuestionCorrectAnswer = t.diff;
    questionText = `果果，${t.q}`;
    window.currentQuestionText = questionText;
    
    // Create a 4x4 array of base emojis
    const size = 16;
    const list = Array.from({length: size}, () => t.base);
    const diffIdx = Math.floor(Math.random() * size);
    list[diffIdx] = t.diff;
    
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">${getLevelTitle(level, '🎯 注意力', '符号侦探')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 快速找到并点击那个不一样的图形：</p>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px auto;max-width:280px;">
          ${list.map((emoji, idx) => `
            <button class="mock-button glow-dabao" onclick="checkAttentionChoice(${idx}, ${diffIdx}, '哇！果然被果果一眼找出来了！火眼金睛！')" style="font-size:2em;height:60px;padding:0;display:flex;align-items:center;justify-content:center;">${emoji}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 3) {
    // 快速视觉计数
    const q = getDynamicAttention(qIdx, 3);
    currentAnswer6yo = q.ans;
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.ans + " 个";
    questionText = `果果，${q.q}`;
    window.currentQuestionText = questionText;
    
    const min = Math.max(1, q.ans - 3);
    const opts = Array.from({length: 6}, (_, i) => min + i);
    
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">${getLevelTitle(level, '🔢 注意力', '视觉快速计数')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 仔细数一数，不要数漏喔：</p>
        <div class="glass-card" style="background:rgba(255,255,255,0.04);padding:15px;border-radius:16px;display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-bottom:20px;max-width:360px;margin-left:auto;margin-right:auto;">
          ${q.pool.map(item => `<span style="font-size:2em;">${item}</span>`).join('')}
        </div>
        <p style="font-size:0.85em;color:#64748b;margin-bottom:20px;">💡 提示：${q.hint}</p>
        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
          ${opts.map(n => `<button class="mock-button glow-dabao" onclick="check6yoAnswer(${n})" style="font-size:1.35em;width:54px;height:54px;border-radius:10px;">${n}</button>`).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 4) {
    // 相同图形双双配对 (寻找双胞胎)
    const q = getDynamicAttention(qIdx, 4);
    window.currentQuestionExplanation = "观察每个图案出现的次数，有一个图案在这里偷偷出现了两次（是一对完全相同的双胞胎哦）！";
    window.currentQuestionCorrectAnswer = q.ans;
    questionText = q.text;
    window.currentQuestionText = questionText;
    
    // Draw options
    const uniqueItems = Array.from(new Set(q.pool));
    const correctIdx = uniqueItems.indexOf(q.ans);
    
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">${getLevelTitle(level, '👯 注意力', '寻找双胞胎')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 哪个图案在这里面偷偷出现了两次？</p>
        <div class="glass-card" style="background:rgba(255,255,255,0.04);padding:15px;border-radius:16px;display:flex;flex-wrap:wrap;justify-content:center;gap:15px;margin-bottom:20px;max-width:340px;margin-left:auto;margin-right:auto;">
          ${q.pool.map(item => `<span style="font-size:2.2em;">${item}</span>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:320px;margin:0 auto;">
          ${uniqueItems.map((item, idx) => `
            <button class="mock-button glow-dabao" onclick="checkAttentionChoice(${idx}, ${correctIdx}, '太牛啦！这对双胞胎被果果瞬间揪出来啦！')" style="font-size:1.8em;height:55px;padding:0;display:flex;align-items:center;justify-content:center;">${item}</button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else {
    // 视网膜迷宫路径追踪 (SVG lines crossing)
    const q = ATTENTION_TRACK_QUESTIONS[qIdx];
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.ans;
    questionText = `果果，顺着细细的连线看一看，哪只小动物能吃到【${q.targetFood}】呢？`;
    window.currentQuestionText = questionText;
    
    const correctIdx = q.options.indexOf(q.ans);
    
    // Draw SVG
    let svgHTML = `<svg width="100%" height="150" viewBox="0 0 300 150" style="background:rgba(15,23,42,0.4);border-radius:12px;display:block;margin:auto;">`;
    
    // Left Animals
    svgHTML += `<text x="25" y="38" font-size="22" text-anchor="middle">🐵</text>`;
    svgHTML += `<text x="25" y="88" font-size="22" text-anchor="middle">🐻</text>`;
    svgHTML += `<text x="25" y="138" font-size="22" text-anchor="middle">🐰</text>`;
    
    // Right Foods
    svgHTML += `<text x="275" y="38" font-size="22" text-anchor="middle">🍌</text>`;
    svgHTML += `<text x="275" y="88" font-size="22" text-anchor="middle">🍯</text>`;
    svgHTML += `<text x="275" y="138" font-size="22" text-anchor="middle">🥕</text>`;
    
    // Draw Curvy Paths
    q.paths.forEach(p => {
      svgHTML += `<path d="M 45 ${p.from} C 100 ${p.from - 20}, 200 ${p.to + 20}, 255 ${p.to}" fill="none" stroke="${p.color}" stroke-width="3" stroke-linecap="round" />`;
    });
    svgHTML += `</svg>`;
    
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(52,211,153,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#34d399;font-weight:800;margin:0;">${getLevelTitle(level, '🕸️ 注意力', '视网膜路径追踪')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:15px;">🦁 顺着彩色波浪线看一看：谁能吃到【${q.targetFood}】？</p>
        <div style="margin-bottom:20px;">${svgHTML}</div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:15px;">💡 ${q.hint}</p>
        <div class="responsive-options-grid">
          ${q.options.map((opt, idx) => `
            <button class="mock-button glow-dabao" onclick="checkAttentionChoice(${idx}, ${correctIdx}, '太神奇了！果果的小眼睛追踪线条又快又准！')" style="position:relative;font-size:1.1em;padding:12px 18px;padding-right:45px;border-radius:12px;font-weight:700;">
              ${opt}
              <span class="option-speak-btn" onclick="event.stopPropagation(); speakText('${opt.replace(/['"\n]/g," ")}')" title="朗读选项">🔊</span>
            </button>
          `).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
}
