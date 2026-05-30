/* 🧠 脑力认知研究所 - 积分兑换与乘员面板 HUD & Rewards Engine */

function loadDabaoHUD() {
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
  const container = document.getElementById("game-stage");
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 2.2fr 1fr; gap: 25px; padding-top: 20px;">
      
      <!-- Early Sensory Dashboard -->
      <div>
        <div class="glass-card" style="padding: 25px; border-color: rgba(245, 158, 11, 0.25); margin-bottom: 25px;">
          <h2 style="color: #fbbf24; font-weight: 800; display: flex; align-items: center; gap: 10px;">
            🐰 萌新早教启蒙舱 (淼淼舱)
          </h2>
          <p style="color: var(--text-muted); font-size: 0.85em; margin-top: 5px;">
            针对淼淼 2 岁发育特点，设计色彩、形状、声音大颗粒无字触控匹配，锻炼手脑协调力：
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px;">
            
            <!-- Sensory 1 -->
            <div class="glass-card glow-erbao pulse-hover" style="padding: 22px; cursor: pointer;" onclick="launchSensory('color')">
              <span style="font-size: 2.2em; display: block; margin-bottom: 8px;">🎨</span>
              <h3 style="font-weight: 700; color: #fff;">色彩能量站</h3>
              <p style="font-size: 0.8em; color: var(--text-muted); margin-top: 5px; line-height: 1.4;">
                可爱彩色泡泡和七彩飞船舱配对，培养早期视觉色彩归纳。
              </p>
            </div>
            
            <!-- Sensory 2 -->
            <div class="glass-card glow-erbao pulse-hover" style="padding: 22px; cursor: pointer;" onclick="launchSensory('shape')">
              <span style="font-size: 2.2em; display: block; margin-bottom: 8px;">📐</span>
              <h3 style="font-weight: 700; color: #fff;">形状分类厂</h3>
              <p style="font-size: 0.8em; color: var(--text-muted); margin-top: 5px; line-height: 1.4;">
                圆形、方形和三角形大卡片拖动匹配，磁力对齐吸附，训练抓握和平面感知。
              </p>
            </div>
            
            <!-- Sensory 3 -->
            <div class="glass-card glow-erbao pulse-hover" style="padding: 22px; cursor: pointer;" onclick="launchSensory('sound')">
              <span style="font-size: 2.2em; display: block; margin-bottom: 8px;">🔊</span>
              <h3 style="font-weight: 700; color: #fff;">声光探测仪</h3>
              <p style="font-size: 0.8em; color: var(--text-muted); margin-top: 5px; line-height: 1.4;">
                听小猫小狗和小山羊声音，点击识别匹配卡片，训练视听反射。
              </p>
            </div>
            
          </div>
        </div>
      </div>
      
      <!-- Reward shop -->
      <div>
        <div class="glass-card" style="padding: 25px; border-color: rgba(245, 158, 11, 0.25);">
          <h3 style="color:#fbbf24; font-weight:700; margin-bottom: 15px;">🎁 积分兑换商城</h3>
          <div id="shop-catalog" style="max-height: 480px; overflow-y: auto;">
            <!-- catalog loaded dynamically -->
          </div>
        </div>
      </div>
      
    </div>
  `;
  renderRewardsList("erbao");
}

function renderRewardsList(playerId) {
  initAppState();
  const catalog = document.getElementById("shop-catalog");
  const filtered = appState.rewards.filter(r => r.target === playerId);
  
  if (filtered.length === 0) {
    catalog.innerHTML = `<p style="color:var(--text-muted); text-align:center; font-size:0.8em; padding:20px;">商城暂无当前成员的专属奖品。</p>`;
    return;
  }
  
  catalog.innerHTML = filtered.map(r => `
    <div class="glass-card" style="padding: 15px; margin-bottom: 12px; border-color: rgba(255,255,255,0.04); display: flex; flex-direction: column; gap: 8px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <span style="font-weight: 700; font-size: 0.95em; color: #fff; line-height:1.3;">${r.title}</span>
        <span style="font-size: 0.85em; color: #fbbf24; font-weight:700; font-family:var(--font-fira); white-space:nowrap;">🪙 ${r.cost}</span>
      </div>
      <button class="mock-button glow-erbao" onclick="redeemReward('${r.id}')" style="padding: 6px 12px; font-size: 0.8em; width: 100%; border-radius:6px; font-weight:700; margin-top:2px;">一键兑换</button>
    </div>
  `).join("");
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
