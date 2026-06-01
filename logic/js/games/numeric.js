/* 🧠 脑力认知研究所 - 数字规律与逻辑模块 Numeric Games Engine */

function launchNumeric(level, container) {
  const phase = ((level - 1) % 5) + 1;
  const qIdx = Math.floor((level - 1) / 5);
  let questionText = '';
  
  if (phase === 1 || phase === 2) {
    const q = getDynamicNumeric(qIdx, phase);
    currentAnswer6yo = q.ans;
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.ans.toString();
    questionText = `果果，请根据数字排队的规律，猜猜蓝色问号泡泡里面应该填哪个数字？`;
    window.currentQuestionText = questionText;
    const min = Math.max(0, q.ans - 5);
    const opts = Array.from({length:10}, (_,i) => min + i).filter(v => v >= 0);
    
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(6,182,212,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">${getLevelTitle(level, '🧮 数字规律', '数列排队')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:20px;">🦁 找出蓝色【❓】里面的数字：</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:12px;margin:25px 0;flex-wrap:wrap;">
          ${q.seq.map(item => item === null
            ? `<div style="width:65px;height:65px;border-radius:50%;border:3px dashed #06b6d4;display:flex;align-items:center;justify-content:center;font-size:1.6em;font-weight:800;color:#22d3ee;background:rgba(6,182,212,0.15);animation:pulseGlow 1.5s infinite;">❓</div>`
            : `<div style="width:60px;height:60px;border-radius:50%;border:2px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4em;font-weight:800;background:rgba(255,255,255,0.05);">${item}</div>`
          ).join('')}
        </div>
        <p style="font-size:0.85em;color:#64748b;margin-bottom:20px;">💡 提示：${q.hint}</p>
        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
          ${opts.map(n => `<button class="mock-button glow-dabao" onclick="check6yoAnswer(${n})" style="font-size:1.2em;width:50px;height:50px;border-radius:50%;">${n}</button>`).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:30px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 3) {
    // 天平称重平衡
    const q = getDynamicNumeric(qIdx, 3);
    currentAnswer6yo = q.ans;
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.ans.toString();
    questionText = `果果，天平要左右平衡哦！请算出右边问号里面填哪个数字，天平两边才一样重？`;
    window.currentQuestionText = questionText;
    
    const leftText = q.left.map(v => v === null ? '❓' : v).join(' + ');
    const rightText = q.right.map(v => v === null ? '❓' : v).join(' + ');
    
    const min = Math.max(0, q.ans - 4);
    const opts = Array.from({length:9}, (_,i) => min + i).filter(v => v >= 0);
    
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(6,182,212,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">${getLevelTitle(level, '⚖️ 数字规律', '天平平衡')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.9em;color:#a1a1aa;margin-bottom:15px;">🦁 算出问号数字，使天平左右两边 and 属性相等：</p>
        
        <!-- Beautiful Balance Scale -->
        <div style="display:flex; flex-direction:column; align-items:center; margin: 25px 0;">
          <div style="width: 260px; height: 8px; background: #64748b; border-radius: 4px; position: relative; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 10px;">
            <!-- Left Pan -->
            <div style="width: 90px; height: 55px; background: rgba(255,255,255,0.06); border: 2px solid #22d3ee; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translateY(40px);">
              <div style="font-size: 0.7em; color: #64748b; margin-bottom: 2px;">左边</div>
              <div style="font-size: 1.1em; font-weight: bold; color: #fff;">${leftText}</div>
            </div>
            <!-- Right Pan -->
            <div style="width: 90px; height: 55px; background: rgba(255,255,255,0.06); border: 2px solid #fbbf24; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translateY(40px);">
              <div style="font-size: 0.7em; color: #64748b; margin-bottom: 2px;">右边</div>
              <div style="font-size: 1.1em; font-weight: bold; color: #fbbf24;">${rightText}</div>
            </div>
            <!-- Center Pillar -->
            <div style="width: 14px; height: 55px; background: #475569; position: absolute; left: 50%; bottom: -55px; transform: translateX(-50%); z-index: -1;"></div>
            <!-- Center Base -->
            <div style="width: 70px; height: 10px; background: #334155; position: absolute; left: 50%; bottom: -65px; transform: translateX(-50%); border-radius: 5px;"></div>
          </div>
          <div style="height: 65px;"></div>
        </div>
        
        <p style="font-size:0.85em;color:#64748b;margin-bottom:20px;">💡 提示：${q.hint}</p>
        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
          ${opts.map(n => `<button class="mock-button glow-dabao" onclick="check6yoAnswer(${n})" style="font-size:1.2em;width:50px;height:50px;border-radius:50%;">${n}</button>`).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:30px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else if (phase === 4) {
    // 图形代数
    const q = getDynamicNumeric(qIdx, 4);
    currentAnswer6yo = q.ans;
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.ans.toString();
    questionText = `果果，请开动脑筋，算一算图画代表什么数字？${q.q}`;
    window.currentQuestionText = questionText;
    
    const min = Math.max(0, q.ans - 4);
    const opts = Array.from({length:9}, (_,i) => min + i).filter(v => v >= 0);
    
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(6,182,212,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">${getLevelTitle(level, '🍎 数字规律', '图形代数')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 算一算图画所代表的的数字：</p>
        
        <div class="glass-card" style="padding:20px;margin:15px auto;max-width:320px;background:rgba(6,182,212,0.06);border-color:rgba(6,182,212,0.2);display:flex;flex-direction:column;gap:10px;">
          <div style="font-size:1.6em;font-weight:800;color:#fff;letter-spacing:2px;">${q.expr1}</div>
          ${q.expr2 ? `<div style="font-size:1.6em;font-weight:800;color:#fff;letter-spacing:2px;">${q.expr2}</div>` : ''}
          <div style="border-top:1px dashed rgba(255,255,255,0.1);padding-top:10px;font-size:1.2em;font-weight:800;color:#fbbf24;">${q.q}</div>
        </div>
        
        <p style="font-size:0.85em;color:#64748b;margin-bottom:20px;">💡 提示：${q.hint}</p>
        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
          ${opts.map(n => `<button class="mock-button glow-dabao" onclick="check6yoAnswer(${n})" style="font-size:1.2em;width:50px;height:50px;border-radius:50%;">${n}</button>`).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:30px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
  else {
    // 数字金字塔
    const q = getDynamicNumeric(qIdx, 5);
    currentAnswer6yo = q.ans;
    window.currentQuestionExplanation = q.hint;
    window.currentQuestionCorrectAnswer = q.ans.toString();
    questionText = `果果，这是好玩的数字金字塔！下面相邻两个数加起来等于上面的数，请算算问号应该是多少？`;
    window.currentQuestionText = questionText;
    
    const min = Math.max(0, q.ans - 4);
    const opts = Array.from({length:9}, (_,i) => min + i).filter(v => v >= 0);
    
    const botVal1 = q.bottom[0];
    const botVal2 = q.bottom[1];
    const botVal3 = q.bottom[2];
    const midVal1 = q.middle[0];
    const midVal2 = q.middle[1];
    const topVal = q.top;
    
    container.innerHTML = `
      <div class="glass-card game-stage-card" style="border-color:rgba(6,182,212,0.3);">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:10px;">
          <h3 style="color:#22d3ee;font-weight:800;margin:0;">${getLevelTitle(level, '🔺 数字规律', '数字金字塔')}</h3>
          <button class="mock-button glow-dabao" onclick="speakText('${questionText}')" style="padding:4px 10px;font-size:0.8em;border-radius:15px;">🔊</button>
        </div>
        <p style="font-size:0.95em;color:#a1a1aa;margin-bottom:20px;">🦁 算出金字塔中【❓】处的数字：</p>
        
        <div style="display:flex; flex-direction:column; align-items:center; gap:10px; margin: 25px 0;">
          <!-- Top Row -->
          <div style="display:flex; justify-content:center;">
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${topVal===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${topVal===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${topVal===null?'#22d3ee':'#fff'}; ${topVal===null?'animation:pulseGlow 1.5s infinite;':''}">${topVal===null?'❓':topVal}</div>
          </div>
          <!-- Middle Row -->
          <div style="display:flex; justify-content:center; gap:12px;">
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${midVal1===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${midVal1===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${midVal1===null?'#22d3ee':'#fff'}; ${midVal1===null?'animation:pulseGlow 1.5s infinite;':''}">${midVal1===null?'❓':midVal1}</div>
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${midVal2===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${midVal2===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${midVal2===null?'#22d3ee':'#fff'}; ${midVal2===null?'animation:pulseGlow 1.5s infinite;':''}">${midVal2===null?'❓':midVal2}</div>
          </div>
          <!-- Bottom Row -->
          <div style="display:flex; justify-content:center; gap:12px;">
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${botVal1===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${botVal1===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${botVal1===null?'#22d3ee':'#fff'}; ${botVal1===null?'animation:pulseGlow 1.5s infinite;':''}">${botVal1===null?'❓':botVal1}</div>
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${botVal2===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${botVal2===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${botVal2===null?'#22d3ee':'#fff'}; ${botVal2===null?'animation:pulseGlow 1.5s infinite;':''}">${botVal2===null?'❓':botVal2}</div>
            <div class="glass-card" style="width: 70px; height: 50px; border-radius: 8px; border: 2px solid ${botVal3===null?'#22d3ee':'rgba(255,255,255,0.12)'}; background: ${botVal3===null?'rgba(34,211,238,0.15)':'rgba(255,255,255,0.03)'}; display:flex; align-items:center; justify-content:center; font-size:1.3em; font-weight:bold; color:${botVal3===null?'#22d3ee':'#fff'}; ${botVal3===null?'animation:pulseGlow 1.5s infinite;':''}">${botVal3===null?'❓':botVal3}</div>
          </div>
        </div>
        
        <p style="font-size:0.85em;color:#64748b;margin-bottom:20px;">💡 提示：${q.hint}</p>
        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
          ${opts.map(n => `<button class="mock-button glow-dabao" onclick="check6yoAnswer(${n})" style="font-size:1.2em;width:50px;height:50px;border-radius:50%;">${n}</button>`).join('')}
        </div>
        <button class="mock-button" onclick="loadDabaoHUD()" style="margin-top:30px;width:100%;border-color:transparent;">🛰️ 返回特训大厅</button>
      </div>
    `;
    setTimeout(() => speakText(questionText), 300);
  }
}
