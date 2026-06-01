/* 🧠 脑力认知研究所 - 空间图形推理模块 Spatial Games Engine */

function getSpatialStack(level) {
  if (level === 1) return [{x:0,y:0,z:0},{x:0,y:0,z:1}];
  if (level === 2) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:0,z:1}];
  if (level === 3) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1}];
  if (level === 4) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:1,y:1,z:0},{x:0,y:0,z:1}];
  if (level === 5) return [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:1,y:1,z:0},{x:0,y:0,z:1},{x:1,y:0,z:1}];
  const baseSize = level <= 6 ? 2 : 3;
  const cubes = [];
  for (let x = 0; x < baseSize; x++) {
    for (let y = 0; y < baseSize; y++) {
      let h = 1;
      if (x===0&&y===0) h = Math.min(Math.floor(level/2)+1, 4);
      else if (x===1&&y===0) h = Math.min(Math.floor(level/3)+1, 3);
      else if (x===0&&y===1) h = Math.min(Math.floor(level/4)+1, 2);
      for (let z = 0; z < h; z++) cubes.push({x,y,z});
    }
  }
  return cubes;
}

function renderIsometricSVG(cubes) {
  cubes.sort((a,b) => (a.x+a.y)-(b.x+b.y) || a.z-b.z);
  const cx=160, cy=110;
  let svg = `<svg width="100%" height="200" viewBox="0 0 320 200" style="background:transparent;display:block;margin:auto;">`;
  svg += `<ellipse cx="160" cy="135" rx="95" ry="38" fill="rgba(0,0,0,0.18)"/>`;
  cubes.forEach(cube => {
    const px = cx+(cube.x-cube.y)*24;
    const py = cy+(cube.x+cube.y)*12-cube.z*24;
    const even = (cube.x+cube.y)%2===0;
    const [top,left,right] = even?["#a5b4fc","#6366f1","#4f46e5"]:["#34d399","#10b981","#059669"];
    svg += `<g transform="translate(${px},${py})">
      <polygon points="0,-12 24,0 0,12 -24,0" fill="${top}" stroke="#1e1b4b" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="-24,0 0,12 0,36 -24,24" fill="${left}" stroke="#1e1b4b" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="0,12 24,0 24,24 0,36" fill="${right}" stroke="#1e1b4b" stroke-width="1.5" stroke-linejoin="round"/>
    </g>`;
  });
  svg += `</svg>`;
  return svg;
}

function checkSpatialChoice(selected, correct) {
  if (selected === correct) {
    trigger6yoVictory(10, "太棒了！空间推理答对啦！果果的空间感超强！");
  } else {
    trigger6yoFailure(window.currentQuestionExplanation || "再仔细看一看图形在方向、对称或展开上的变化规律哦！", window.currentQuestionCorrectAnswer || "正确选项");
  }
}

function launchSpatial(level, container) {
  // 5种题型按关卡进行穿插：1积木，2镜像，3旋转，4补全，5展开图，循环往复
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);

  if (phase === 1) {
    // 题型A：3D积木计数
    const cubes = getSpatialStack(qIdx + 1);
    currentAnswer6yo = cubes.length;
    window.currentQuestionExplanation = "从上往下数数，注意数出被压在底下的隐藏方块！";
    window.currentQuestionCorrectAnswer = cubes.length + " 个";
    const q = `果果，请数一数这堆立方体积木总共有多少个？被压在下面的也要数哦！`;
    window.currentQuestionText = q;
    const svgHTML = renderIsometricSVG(cubes);
    const min = Math.max(1, currentAnswer6yo - 3);
    const opts = Array.from({length:8}, (_,i) => min+i);
    window.currentQuestionOptions = opts.map(n => n + ' 个');
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">${getLevelTitle(level, '🧱 空间推理', '积木计数')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${q.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.85em;color:#a1a1aa;margin-bottom:15px;">🦁 数一数总共有多少个积木方块（包括被压住的）：</p>
        <div class="glass-card" style="background:rgba(15,23,42,0.6);padding:10px;border-radius:16px;border:1px solid rgba(255,255,255,0.06);margin-bottom:20px;">${svgHTML}</div>
        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
          ${opts.map(n => `<button class="mock-button glow-dabao" onclick="check6yoAnswer(${n})" style="font-size:1.35em;width:54px;height:54px;border-radius:10px;">${n}</button>`).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(q), 300);
  }
  else if (phase === 2) {
    // 题型B：镜像对称
    const q = MIRROR_QUESTIONS[qIdx];
    window.currentSpatialQuestion = q;
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.correct.replace(/\n/g, ' / ');
    const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
    const correctIdx = allOpts.indexOf(q.correct);
    const questionText = `果果，左边是原图，哪一个选项是它的镜像（照镜子的样子）？`;
    window.currentQuestionText = questionText;
    window.currentQuestionOptions = allOpts;
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">${getLevelTitle(level, '🪞 空间推理', '镜像对称')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:15px;">🦁 镜像就像照镜子，左右互换。选出正确的镜像：</p>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin:20px 0;">
          <div style="text-align:center;">
            <div style="font-size:0.75em;color:#64748b;margin-bottom:8px;">原图</div>
            <div class="glass-card" style="padding:15px;font-size:1.8em;line-height:1.6;white-space:pre;font-family:monospace;min-width:100px;">${q.original}</div>
          </div>
          <div style="font-size:2em;color:#818cf8;">🪞</div>
          <div style="text-align:center;">
            <div style="font-size:0.75em;color:#64748b;margin-bottom:8px;">镜像是？</div>
            <div class="glass-card" style="padding:15px;font-size:1.8em;line-height:1.6;border:2px dashed #6366f1;min-width:100px;color:#818cf8;font-weight:800;">❓</div>
          </div>
        </div>
        <p style="font-size:0.85em;color:#94a3b8;margin-bottom:20px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">
          <span>💡 ${q.hint}</span>
          <button class="mock-button glow-success" onclick="showSpatialHelpAnimation('mirror')" style="padding:3px 10px;font-size:0.8em;margin-top:0;border-radius:15px;display:inline-flex;align-items:center;gap:4px;">🎬 观看动画演示</button>
        </p>
        <div class="responsive-options-grid max-420">
          ${allOpts.map((opt,i) => {
            const hasChinese = /[\u4e00-\u9fa5]/.test(opt);
            const padRight = hasChinese ? 'padding-right:45px;' : '';
            return `
              <button class="mock-button glow-dabao" onclick="checkSpatialChoice(${i},${correctIdx})" style="position:relative;font-size:1.3em;line-height:1.6;padding:12px;${padRight}border-radius:12px;white-space:pre;font-family:monospace;">
                ${opt}
                ${hasChinese ? `<span class="option-speak-btn" onclick="event.stopPropagation(); speakText('${opt.replace(/['"\n]/g," ")}')" title="朗读选项">🔊</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 3) {
    // 题型C：图形旋转
    const q = ROTATION_QUESTIONS[qIdx];
    window.currentSpatialQuestion = q;
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.correct.replace(/\n/g, ' / ');
    const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
    const correctIdx = allOpts.indexOf(q.correct);
    const questionText = `果果，${q.title}`;
    window.currentQuestionText = questionText;
    window.currentQuestionOptions = allOpts;
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">${getLevelTitle(level, '🔄 空间推理', '图形旋转')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:15px;">🦁 ${q.title}</p>
        <div class="glass-card" style="padding:20px;font-size:2.5em;line-height:1.6;margin:15px auto;max-width:200px;white-space:pre;font-family:monospace;background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.2);">${q.original}</div>
        <p style="font-size:0.85em;color:#94a3b8;margin:12px 0 20px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">
          <span>💡 ${q.hint}</span>
          <button class="mock-button glow-success" onclick="showSpatialHelpAnimation('rotate')" style="padding:3px 10px;font-size:0.8em;margin-top:0;border-radius:15px;display:inline-flex;align-items:center;gap:4px;">🎬 观看动画演示</button>
        </p>
        <div class="responsive-options-grid max-420">
          ${allOpts.map((opt,i) => {
            const hasChinese = /[\u4e00-\u9fa5]/.test(opt);
            const padRight = hasChinese ? 'padding-right:45px;' : '';
            return `
              <button class="mock-button glow-dabao" onclick="checkSpatialChoice(${i},${correctIdx})" style="position:relative;font-size:${q.isText?'1em':'1.3em'};padding:15px;${padRight}border-radius:12px;line-height:1.4;white-space:pre;font-family:monospace;">
                ${opt}
                ${hasChinese ? `<span class="option-speak-btn" onclick="event.stopPropagation(); speakText('${opt.replace(/['"\n]/g," ")}')" title="朗读选项">🔊</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 4) {
    // 题型D：图形序列补全
    const q = COMPLETION_QUESTIONS[qIdx];
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.correct;
    const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
    const correctIdx = allOpts.indexOf(q.correct);
    const questionText = `果果，${q.desc}`;
    window.currentQuestionText = questionText;
    window.currentQuestionOptions = allOpts;
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">${getLevelTitle(level, '🧩 空间推理', '规律补全')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 ${q.desc}</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap;margin:20px 0;">
          ${q.items.map((item) => `
            <div class="glass-card" style="padding:12px 16px;font-size:1.4em;min-width:65px;${item==='?'?'border:2px dashed #fbbf24;color:#fbbf24;font-weight:800;background:rgba(251,191,36,0.08);':''}">${item}</div>
          `).join('')}
        </div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:20px;">💡 ${q.hint}</p>
        <div class="responsive-options-grid max-440">
          ${allOpts.map((opt,i) => {
            const hasChinese = /[\u4e00-\u9fa5]/.test(opt);
            const padRight = hasChinese ? 'padding-right:45px;' : '';
            return `
              <button class="mock-button glow-dabao" onclick="checkSpatialChoice(${i},${correctIdx})" style="position:relative;font-size:0.95em;padding:14px;${padRight}border-radius:12px;line-height:1.4;">
                ${opt}
                ${hasChinese ? `<span class="option-speak-btn" onclick="event.stopPropagation(); speakText('${opt.replace(/['"\n]/g," ")}')" title="朗读选项">🔊</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else {
    // 题型E：立体展开图 / 空间想象
    const q = UNFOLDING_QUESTIONS[qIdx];
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.correct;

    const opts = q.optEmoji;
    const questionText = `果果，${q.title}`;
    window.currentQuestionText = questionText;
    window.currentQuestionOptions = opts;
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(99,102,241,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#818cf8;font-weight:800;margin:0;">${getLevelTitle(level, '📦 空间推理', '立体想象')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText.replace(/'/g,"\\'")}');" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <div class="glass-card" style="padding:20px;margin:15px 0;background:rgba(99,102,241,0.06);border-color:rgba(99,102,241,0.2);">
          <div style="font-size:3em;margin-bottom:12px;">${q.img}</div>
          <p style="font-size:1.05em;color:#fff;font-weight:600;margin:0;">${q.title}</p>
        </div>
        <p style="font-size:0.8em;color:#64748b;margin-bottom:20px;">💡 ${q.hint}</p>
        <div class="responsive-options-grid max-420">
          ${opts.map((opt,i) => {
            const hasChinese = /[\u4e00-\u9fa5]/.test(opt);
            const padRight = hasChinese ? 'padding-right:45px;' : '';
            return `
              <button class="mock-button glow-dabao" onclick="checkSpatialChoice(${i},${q.ans})" style="position:relative;font-size:0.95em;padding:14px;${padRight}border-radius:12px;font-weight:700;">
                ${opt}
                ${hasChinese ? `<span class="option-speak-btn" onclick="event.stopPropagation(); speakText('${opt.replace(/['"\n]/g," ")}')" title="朗读选项">🔊</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:25px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
}
