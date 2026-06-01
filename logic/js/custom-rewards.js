/* 🧠 脑力认知研究所 - 积分兑换与乘员面板 HUD & Rewards Engine */

function loadDabaoHUD() {
  // Restore screen scrolling using global helper
  unlockViewportScrolling();

  initAppState();
  const player = appState.players.dabao;

  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
  }
  // 补全新维度
  ['spatial','numeric','attention','deduction','pattern','memory','language','analogy','mixed'].forEach(k => {
    if (typeof player.progress[k] !== 'number') player.progress[k] = 1;
  });
  saveAppState();

  const p = player.progress;
  const clamp = v => Math.min(v > 50 ? 50 : v, 50);
  const pct = v => Math.min(((clamp(v) - 1) / 50) * 100, 100);

  const tracks = [
    { key:'spatial',  icon:'🧱', color:'#818cf8', glow:'#6366f1', label:'空间图形推理',   desc:'3D积木计数·折叠对称·立体想象力' },
    { key:'numeric',  icon:'🧮', color:'#22d3ee', glow:'#06b6d4', label:'数字规律',       desc:'数列填空·倍数等差·斐波那契规律' },
    { key:'attention',icon:'⚡', color:'#34d399', glow:'#10b981', label:'注意力扫描',     desc:'舒尔特格·顺序倒序·奇偶筛选' },
    { key:'deduction',icon:'🔍', color:'#d8b4fe', glow:'#a855f7', label:'逻辑演绎排序',   desc:'因果时序重排·生长过程推理' },
    { key:'pattern',  icon:'🎨', color:'#fbbf24', glow:'#f59e0b', label:'图形矩阵推理',   desc:'3×3矩阵规律·颜色形状旋转推理' },
    { key:'memory',   icon:'🧠', color:'#f472b6', glow:'#ec4899', label:'短时记忆复现',   desc:'序列记忆·图案复现·工作记忆训练' },
    { key:'language', icon:'📚', color:'#2dd4bf', glow:'#14b8a6', label:'言语理解分类',   desc:'分类归纳·找异类·场景常识判断' },
    { key:'analogy',  icon:'🔗', color:'#c4b5fd', glow:'#8b5cf6', label:'类比推理',       desc:'A对B则C对D·关系类比·逻辑关联' },
  ];

  const container = document.getElementById('game-stage');
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:2.4fr 1fr;gap:25px;padding-top:20px;">
      <div>
        <div class="glass-card" style="padding:25px;border-color:rgba(99,102,241,0.25);margin-bottom:25px;">
          <h2 style="color:#818cf8;font-weight:800;display:flex;align-items:center;gap:10px;margin:0;">
            🛰️ 脑力特训控制台（果果舱）
          </h2>
          <p style="color:var(--text-muted);font-size:0.82em;margin-top:6px;">
            「北京八中少儿班·八少八素」选拔考察8大维度特训 · 共 400 关题库 · 每维度 50 关递进升级
          </p>

          <!-- 每日综合特训航线入口 banner -->
          <div class="glass-card glow-mixed pulse-hover" style="padding: 20px; margin-top: 20px; cursor: pointer; border: 2px solid #a855f7; background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15)); border-radius: 16px; box-shadow: 0 8px 32px rgba(168, 85, 247, 0.15); margin-bottom: 25px;" onclick="launchMixedMode()">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
              <div style="text-align: left;">
                <span style="font-size: 1.8em; display: block; margin-bottom: 6px;">🚀 宇宙脑力综合航线 (Interleaved Outpost)</span>
                <h3 style="font-weight: 800; color: #fff; margin: 0; font-size: 1.1em; display: flex; align-items: center; gap: 8px;">
                  一键开启 400 关综合穿插特训模式 <span style="background: #e11d48; color: #fff; font-size: 0.65em; padding: 2px 8px; border-radius: 20px; font-weight: 800; letter-spacing: 1px; animation: blinker 1.2s infinite;">HOT 推荐</span>
                </h3>
                <p style="font-size: 0.75em; color: var(--text-muted); margin-top: 5px; line-height: 1.4; max-width: 480px;">
                  8大认知维度（空间、数字、注意力、逻辑、矩阵、记忆、言语、类比）全部交叉打乱出题！每关都是新类型，完美防枯燥，全面激活大脑潜力！
                </p>
              </div>
              <div style="text-align: right; min-width: 120px;">
                <span style="font-size: 0.85em; color: #c4b5fd; font-weight: bold; display: block; margin-bottom: 4px;">通关进度</span>
                <span style="font-size: 1.15em; color: #fbbf24; font-weight: 800; display: block; margin-bottom: 6px; font-family: var(--font-fira);">${player.progress.mixed || 1} / 400 关</span>
                <div style="width: 120px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-left: auto;">
                  <div style="width: ${Math.min(((player.progress.mixed || 1) - 1) / 400 * 100 + 0.25, 100)}%; height: 100%; background: linear-gradient(90deg, #a855f7, #6366f1); box-shadow: 0 0 8px #a855f7; border-radius: 3px;"></div>
                </div>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px;">
            ${tracks.map(t => {
              const lv = clamp(p[t.key] || 1);
              const pc = pct(p[t.key] || 1);
              return `
              <div class="glass-card pulse-hover" style="padding:18px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;min-height:155px;border-color:rgba(255,255,255,0.06);" onclick="launchTest('${t.key}')" onmouseover="this.style.borderColor='${t.glow}44'" onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:2em;">${t.icon}</span>
                    <span style="font-size:0.75em;color:${t.color};font-weight:bold;">第${lv}/50关</span>
                  </div>
                  <h3 style="font-weight:700;color:#fff;font-size:0.95em;margin-top:8px;">${t.label}</h3>
                  <p style="font-size:0.7em;color:var(--text-muted);margin-top:4px;line-height:1.3;">${t.desc}</p>
                </div>
                <div style="margin-top:10px;">
                  <div style="display:flex;justify-content:space-between;font-size:0.65em;color:${t.color};font-weight:bold;margin-bottom:3px;">
                    <span>探索进度</span><span>${Math.round(pc)}%</span>
                  </div>
                  <div style="width:100%;height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
                    <div style="width:${pc}%;height:100%;background:${t.glow};box-shadow:0 0 8px ${t.glow};border-radius:3px;"></div>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 积分兑换商城 -->
      <div>
        <div class="glass-card" style="padding:25px;border-color:rgba(245,158,11,0.25);">
          <h3 style="color:#fbbf24;font-weight:700;margin-bottom:15px;">🎁 积分兑换商城</h3>
          <div id="shop-catalog" style="max-height:550px;overflow-y:auto;"></div>
        </div>
      </div>
    </div>
  `;
  renderRewardsList('dabao');
}


function loadErbaoHUD() {
  // Restore screen scrolling using global helper
  unlockViewportScrolling();

  initAppState();
  const player = appState.players.erbao;

  if (!player.progress) {
    player.progress = { spatial:1, numeric:1, attention:1, deduction:1, pattern:1, memory:1, language:1, analogy:1, mixed:1 };
  }
  // 补全新维度
  ['spatial','numeric','attention','deduction','pattern','memory','language','analogy','mixed'].forEach(k => {
    if (typeof player.progress[k] !== 'number') player.progress[k] = 1;
  });
  saveAppState();

  const p = player.progress;
  const clamp = v => Math.min(v > 50 ? 50 : v, 50);
  const pct = v => Math.min(((clamp(v) - 1) / 50) * 100, 100);

  const tracks = [
    { key:'spatial',  icon:'📐', color:'#fbbf24', glow:'#fbbf24', label:'平面形状分类',   desc:'圆形、方形、三角形大卡片拖动匹配，手眼协调感知' },
    { key:'numeric',  icon:'🔢', color:'#facc15', glow:'#eab308', label:'淼淼数字数数',   desc:'视觉红气球与泡泡计数，点选对应数字手脑对应' },
    { key:'attention',icon:'⚡', color:'#34d399', glow:'#10b981', label:'趣味找不同',     desc:'3×3大颗粒极简熊猫中找小兔，注意力定位筛选' },
    { key:'deduction',icon:'🔍', color:'#d8b4fe', glow:'#a855f7', label:'动物大小分类',   desc:'大象归大箱，老鼠归小箱，大小演绎分类感知' },
    { key:'pattern',  icon:'🎨', color:'#fb7185', glow:'#f43f5e', label:'图形 ABAB 规律',  desc:'交替色彩规律匹配，补齐图案，规律重复直觉' },
    { key:'memory',   icon:'🧠', color:'#f472b6', glow:'#ec4899', label:'闪现记忆配对',   desc:'单个物体卡片闪现记忆，恒常性追踪与暂存训练' },
    { key:'language', icon:'🔊', color:'#2dd4bf', glow:'#14b8a6', label:'声光探测仪',     desc:'听小猫小狗叫声点击匹配，视听通道反射整合' },
    { key:'analogy',  icon:'🔗', color:'#c4b5fd', glow:'#8b5cf6', label:'淼淼认知关联',   desc:'宝宝生活常识因果匹配，培养逻辑关系直觉' },
  ];

  const container = document.getElementById('game-stage');
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:2.4fr 1fr;gap:25px;padding-top:20px;">
      <div>
        <div class="glass-card" style="padding:25px;border-color:rgba(251,191,36,0.25);margin-bottom:25px;">
          <h2 style="color:#fbbf24;font-weight:800;display:flex;align-items:center;gap:10px;margin:0;">
            🐰 启蒙特训控制台（淼淼舱）
          </h2>
          <p style="color:var(--text-muted);font-size:0.82em;margin-top:6px;">
            针对淼淼 2 岁脑部发育定制 · 大颗粒无字触控分类 · 8大感官轨道 · 共 400 关综合启蒙
          </p>

          <!-- 每日综合特训航线入口 banner -->
          <div class="glass-card glow-erbao pulse-hover" style="padding: 20px; margin-top: 20px; cursor: pointer; border: 2px solid #fbbf24; background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.15)); border-radius: 16px; box-shadow: 0 8px 32px rgba(251, 191, 36, 0.15); margin-bottom: 25px;" onclick="launchMixedMode()">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
              <div style="text-align: left;">
                <span style="font-size: 1.8em; display: block; margin-bottom: 6px;">🚀 宇宙早教综合航线 (Mixed Mode)</span>
                <h3 style="font-weight: 800; color: #fff; margin: 0; font-size: 1.1em; display: flex; align-items: center; gap: 8px;">
                  开启 400 关淼淼专属综合启蒙特训 <span style="background: #fbbf24; color: #000; font-size: 0.65em; padding: 2px 8px; border-radius: 20px; font-weight: 800; letter-spacing: 1px; animation: blinker 1.2s infinite;">BABY 推荐</span>
                </h3>
                <p style="font-size: 0.75em; color: var(--text-muted); margin-top: 5px; line-height: 1.4; max-width: 480px;">
                  8大早期认知维度打乱穿插出题！数数、连连看、听音识萌宠、找找小兔子，防枯燥效果绝佳，全面激发淼淼脑部潜能！
                </p>
              </div>
              <div style="text-align: right; min-width: 120px;">
                <span style="font-size: 0.85em; color: #fde68a; font-weight: bold; display: block; margin-bottom: 4px;">启蒙进度</span>
                <span style="font-size: 1.15em; color: #fbbf24; font-weight: 800; display: block; margin-bottom: 6px; font-family: var(--font-fira);">${player.progress.mixed || 1} / 400 关</span>
                <div style="width: 120px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-left: auto;">
                  <div style="width: ${Math.min(((player.progress.mixed || 1) - 1) / 400 * 100 + 0.25, 100)}%; height: 100%; background: linear-gradient(90deg, #fbbf24, #f59e0b); box-shadow: 0 0 8px #fbbf24; border-radius: 3px;"></div>
                </div>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px;">
            ${tracks.map(t => {
              const lv = clamp(p[t.key] || 1);
              const pc = pct(p[t.key] || 1);
              return `
              <div class="glass-card pulse-hover" style="padding:18px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;min-height:155px;border-color:rgba(255,255,255,0.06);" onclick="launchTest('${t.key}')" onmouseover="this.style.borderColor='${t.glow}44'" onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:2em;">${t.icon}</span>
                    <span style="font-size:0.75em;color:${t.color};font-weight:bold;">第${lv}/50关</span>
                  </div>
                  <h3 style="font-weight:700;color:#fff;font-size:0.95em;margin-top:8px;">${t.label}</h3>
                  <p style="font-size:0.7em;color:var(--text-muted);margin-top:4px;line-height:1.3;">${t.desc}</p>
                </div>
                <div style="margin-top:10px;">
                  <div style="display:flex;justify-content:space-between;font-size:0.65em;color:${t.color};font-weight:bold;margin-bottom:3px;">
                    <span>探索进度</span><span>${Math.round(pc)}%</span>
                  </div>
                  <div style="width:100%;height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
                    <div style="width:${pc}%;height:100%;background:${t.glow};box-shadow:0 0 8px ${t.glow};border-radius:3px;"></div>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 积分兑换商城 -->
      <div>
        <div class="glass-card" style="padding:25px;border-color:rgba(255,191,36,0.25);">
          <h3 style="color:#fbbf24;font-weight:700;margin-bottom:15px;">🎁 积分兑换商城</h3>
          <div id="shop-catalog" style="max-height: 480px; overflow-y: auto;">
            <!-- catalog loaded dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;
  renderRewardsList('erbao');
}

function renderRewardsList(playerId) {
  initAppState();
  const catalog = document.getElementById("shop-catalog");
  const player = appState.players[playerId];
  const myStars = player.stars || 0;
  const isErbao = playerId === 'erbao';
  const accentColor = isErbao ? '#fbbf24' : '#818cf8';
  const glowClass = isErbao ? 'glow-erbao' : 'glow-dabao';

  // Filter by player and sort by cost ascending
  const filtered = appState.rewards
    .filter(r => r.target === playerId)
    .sort((a, b) => a.cost - b.cost);

  if (filtered.length === 0) {
    catalog.innerHTML = `<p style="color:var(--text-muted); text-align:center; font-size:0.8em; padding:20px;">商城暂无当前成员的专属奖品。</p>`;
    return;
  }

  catalog.innerHTML = filtered.map(r => {
    const canAfford = myStars >= r.cost;
    const pct = Math.min((myStars / r.cost) * 100, 100);
    const borderColor = canAfford ? `${accentColor}66` : 'rgba(255,255,255,0.04)';
    const badge = canAfford
      ? `<span style="font-size:0.7em;background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);padding:2px 8px;border-radius:20px;font-weight:700;">✅ 可兑换</span>`
      : `<span style="font-size:0.7em;background:rgba(255,255,255,0.03);color:#64748b;border:1px solid rgba(255,255,255,0.06);padding:2px 8px;border-radius:20px;">🔒 攒中…</span>`;
    return `
    <div class="glass-card" style="padding:14px;margin-bottom:10px;border-color:${borderColor};transition:border-color 0.3s;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
        <span style="font-weight:700;font-size:0.92em;color:#fff;line-height:1.35;flex:1;display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span>${r.title}</span>
          <span class="option-speak-btn" style="position:static;transform:none;padding:2px 4px;font-size:0.7em;display:inline-flex;" onclick="event.stopPropagation(); speakText('${r.title.replace(/['"\n]/g," ")}')" title="朗读奖品">🔊</span>
        </span>
        <span style="font-size:0.95em;color:#fbbf24;font-weight:800;font-family:var(--font-fira);white-space:nowrap;">🪙 ${r.cost}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        ${badge}
        <span style="font-size:0.7em;color:#64748b;">已攒 ${myStars} / ${r.cost}</span>
      </div>
      <div style="width:100%;height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;margin-bottom:8px;">
        <div style="width:${pct}%;height:100%;background:${canAfford ? '#34d399' : accentColor};border-radius:2px;transition:width 0.5s;"></div>
      </div>
      <button class="mock-button ${glowClass}" onclick="redeemReward('${r.id}')"
        style="padding:6px 12px;font-size:0.8em;width:100%;border-radius:6px;font-weight:700;margin-top:0;
        ${canAfford ? '' : 'opacity:0.45;cursor:not-allowed;'}">
        ${canAfford ? '🎁 立即兑换' : '⏳ 星星不够，继续加油！'}
      </button>
    </div>`;
  }).join("");
}


function redeemReward(rewardId) {
  initAppState();
  const reward = appState.rewards.find(r => r.id === rewardId);
  const player = appState.players[currentPlayerId];
  
  if (player.stars < reward.cost) {
    alert(`❌ 兑换失败！您的星星不太够哦。这件宝贝需要 ${reward.cost} 颗星星，您当前只有 ${player.stars} 颗。继续挑战脑力任务攒星星吧！🌟`);
    return;
  }
  
  // Submit request to parent
  appState.redemptions.push({
    id: `redemp_${Date.now()}`,
    playerId: currentPlayerId,
    playerName: player.name,
    rewardId: reward.id,
    rewardTitle: reward.title,
    cost: reward.cost,
    date: new Date().toISOString().slice(0, 10),
    status: "pending"
  });
  
  // Save progress
  saveAppState();
  
  alert(`🎉 兑换申请成功！\n系统已暂扣 ${reward.cost} 颗星星，兑换清单已发给爸爸妈妈。快让他们在家长控制台确认发放，领取您的精美小礼品吧！🧸`);
  
  // Update local view coins
  document.getElementById("star-count").innerText = `🪙 ${player.stars}`;
}
