/* 🧠 脑力认知研究所 - 积分兑换与乘员面板 HUD & Rewards Engine */

function loadDabaoHUD() {
  initAppState();
  const player = appState.players.dabao;
  
  // Safely guarantee progress schemas are initialized
  if (!player.progress) {
    player.progress = { spatial: 1, numeric: 1, attention: 1, deduction: 1 };
  }
  
  const progress = player.progress;
  const lSpatial = progress.spatial > 50 ? 50 : progress.spatial;
  const lNumeric = progress.numeric > 50 ? 50 : progress.numeric;
  const lAttention = progress.attention > 50 ? 50 : progress.attention;
  const lDeduction = progress.deduction > 50 ? 50 : progress.deduction;
  
  // Progress percentages calculations
  const pSpatial = Math.min(((lSpatial - 1) / 50) * 100, 100);
  const pNumeric = Math.min(((lNumeric - 1) / 50) * 100, 100);
  const pAttention = Math.min(((lAttention - 1) / 50) * 100, 100);
  const pDeduction = Math.min(((lDeduction - 1) / 50) * 100, 100);

  const container = document.getElementById("game-stage");
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 2.2fr 1fr; gap: 25px; padding-top: 20px;">
      
      <!-- Logic Outposts Dashboard -->
      <div>
        <div class="glass-card" style="padding: 25px; border-color: rgba(99, 102, 241, 0.25); margin-bottom: 25px;">
          <h2 style="color: #818cf8; font-weight: 800; display: flex; align-items: center; gap: 10px; margin: 0;">
            🛰️ 脑力特训控制台 (果果舱)
          </h2>
          <p style="color: var(--text-muted); font-size: 0.85em; margin-top: 5px;">
            系统已加载「八少八素起航线」特训大纲。每项特训包含 50 道高难度逻辑关卡，共计 200 关大题库：
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px;">
            
            <!-- Category 1: Spatial -->
            <div class="glass-card glow-dabao pulse-hover" style="padding: 20px; cursor: pointer; display:flex; flex-direction:column; justify-content:space-between; min-height:165px;" onclick="launchTest('spatial')">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size: 2.2em;">🧱</span>
                  <span style="font-size:0.8em; color:#a5b4fc; font-weight:bold; font-family:var(--font-fira);">第 ${lSpatial}/50 关</span>
                </div>
                <h3 style="font-weight: 700; color: #fff; font-size:1.05em; margin-top:10px;">空间与图形推理</h3>
                <p style="font-size: 0.75em; color: var(--text-muted); margin-top: 5px; line-height: 1.35;">
                  3D积木折叠计数与对称旋转，锻炼空间多维想象力。
                </p>
              </div>
              <div style="margin-top:12px;">
                <div style="display:flex; justify-content:space-between; font-size:0.7em; color:#6366f1; font-weight:bold; margin-bottom:3px;">
                  <span>探索进度</span>
                  <span>${Math.round(pSpatial)}%</span>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                  <div style="width:${pSpatial}%; height:100%; background:#6366f1; box-shadow:0 0 8px #6366f1; border-radius:3px;"></div>
                </div>
              </div>
            </div>
            
            <!-- Category 2: Numeric -->
            <div class="glass-card glow-dabao pulse-hover" style="padding: 20px; cursor: pointer; display:flex; flex-direction:column; justify-content:space-between; min-height:165px;" onclick="launchTest('numeric')">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size: 2.2em;">🧮</span>
                  <span style="font-size:0.8em; color:#22d3ee; font-weight:bold; font-family:var(--font-fira);">第 ${lNumeric}/50 关</span>
                </div>
                <h3 style="font-weight: 700; color: #fff; font-size:1.05em; margin-top:10px;">数理与逻辑计算</h3>
                <p style="font-size: 0.75em; color: var(--text-muted); margin-top: 5px; line-height: 1.35;">
                  加减乘倍模式匹配与天平等量代换，锻炼数字抽象推理。
                </p>
              </div>
              <div style="margin-top:12px;">
                <div style="display:flex; justify-content:space-between; font-size:0.7em; color:#06b6d4; font-weight:bold; margin-bottom:3px;">
                  <span>探索进度</span>
                  <span>${Math.round(pNumeric)}%</span>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                  <div style="width:${pNumeric}%; height:100%; background:#06b6d4; box-shadow:0 0 8px #06b6d4; border-radius:3px;"></div>
                </div>
              </div>
            </div>
            
            <!-- Category 3: Attention -->
            <div class="glass-card glow-dabao pulse-hover" style="padding: 20px; cursor: pointer; display:flex; flex-direction:column; justify-content:space-between; min-height:165px;" onclick="launchTest('attention')">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size: 2.2em;">⚡</span>
                  <span style="font-size:0.8em; color:#34d399; font-weight:bold; font-family:var(--font-fira);">第 ${lAttention}/50 关</span>
                </div>
                <h3 style="font-weight: 700; color: #fff; font-size:1.05em; margin-top:10px;">瞬时记忆与注意力</h3>
                <p style="font-size: 0.75em; color: var(--text-muted); margin-top: 5px; line-height: 1.35;">
                  双数倒数舒尔特方格与亮光阵列复现，开发视觉追踪速度。
                </p>
              </div>
              <div style="margin-top:12px;">
                <div style="display:flex; justify-content:space-between; font-size:0.7em; color:#10b981; font-weight:bold; margin-bottom:3px;">
                  <span>探索进度</span>
                  <span>${Math.round(pAttention)}%</span>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                  <div style="width:${pAttention}%; height:100%; background:#10b981; box-shadow:0 0 8px #10b981; border-radius:3px;"></div>
                </div>
              </div>
            </div>
            
            <!-- Category 4: Deduction -->
            <div class="glass-card glow-dabao pulse-hover" style="padding: 20px; cursor: pointer; display:flex; flex-direction:column; justify-content:space-between; min-height:165px;" onclick="launchTest('deduction')">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size: 2.2em;">🔍</span>
                  <span style="font-size:0.8em; color:#d8b4fe; font-weight:bold; font-family:var(--font-fira);">第 ${lDeduction}/50 关</span>
                </div>
                <h3 style="font-weight: 700; color: #fff; font-size:1.05em; margin-top:10px;">逻辑演绎与推理</h3>
                <p style="font-size: 0.75em; color: var(--text-muted); margin-top: 5px; line-height: 1.35;">
                  时序先后因果重排与机器人真假辩词，塑造科学逻辑力。
                </p>
              </div>
              <div style="margin-top:12px;">
                <div style="display:flex; justify-content:space-between; font-size:0.7em; color:#a855f7; font-weight:bold; margin-bottom:3px;">
                  <span>探索进度</span>
                  <span>${Math.round(pDeduction)}%</span>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                  <div style="width:${pDeduction}%; height:100%; background:#a855f7; box-shadow:0 0 8px #a855f7; border-radius:3px;"></div>
                </div>
              </div>
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
  renderRewardsList("dabao");
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
