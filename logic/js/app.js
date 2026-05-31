/* 🧠 脑力认知研究所 - 状态及本地数据引擎 SPA State Engine & LocalStorage Manager */

const STORAGE_KEY = "kids_logic_lab_state";

const DEFAULT_STATE = {
  lastUpdated: Date.now(),
  players: {
    dabao: {
      name: "果果 (6岁)",
      avatar: "🦁",
      stars: 120, // default initial reward stars for trial
      streaks: 2,
      lastTrainedDate: null,
      medals: ["spatial_rookie"],
      solvedQuestions: [], // Tracks successfully solved logic level IDs for Guoguo
      wrongQuestions: {}, // Tracks incorrectly solved logic levels with their last attempt timestamp
      progress: { spatial: 1, numeric: 1, attention: 1, deduction: 1, pattern: 1, memory: 1, language: 1, analogy: 1, mixed: 1 }, // 8大维度各50关 + 1个400关综合航线
      stats: { spatial: 75, numeric: 60, attention: 85, deduction: 50 }
    },
    erbao: {
      name: "淼淼 (2岁)",
      avatar: "🐰",
      stars: 30, // default initial reward stars for trial
      stickers: ["happy_bunny"],
      solvedQuestions: [], // Tracks successfully solved sensory level IDs for Miaomiao
      wrongQuestions: {}, // Tracks incorrectly solved sensory levels with their last attempt timestamp
      lastTrainedDate: null
    }
  },
  rewards: [
    { id: "r1", title: "看动画片 30 分钟 📺", cost: 180, target: "dabao" },
    { id: "r2", title: "去楼下坐摇摇车 2 次 🎠", cost: 90, target: "erbao" },
    { id: "r3", title: "兑换闪亮魔法水晶宝石 1 颗 💎", cost: 750, target: "dabao" },
    { id: "r4", title: "吃美味冰淇淋 1 个 🍦", cost: 450, target: "dabao" },
    { id: "r5", title: "喝一瓶小酸奶 🍼", cost: 60, target: "erbao" },
    { id: "r6", title: "兑换七彩水晶洞 1 个 (自选颜色) 🔮", cost: 1320, target: "dabao" }
  ],
  redemptions: [],
  versionInfo: {
    major: 1,
    minor: 5,
    build: 83 // We will auto-increment this representing total publish counts
  }
};

// Deep-copy so runtime mutations never pollute DEFAULT_STATE
let appState = JSON.parse(JSON.stringify(DEFAULT_STATE));

function initAppState() {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      appState = JSON.parse(local);
      
      // Auto-migrate old state names and add solvedQuestions array if missing
      if (appState.players) {
        if (appState.players.dabao) {
          if (appState.players.dabao.name.includes("大宝")) {
            appState.players.dabao.name = "果果 (6岁)";
          }
          if (!appState.players.dabao.solvedQuestions) {
            appState.players.dabao.solvedQuestions = [];
          }
          if (!appState.players.dabao.wrongQuestions) {
            appState.players.dabao.wrongQuestions = {};
          }
          // 确保所有8个维度的进度字段都存在
          if (!appState.players.dabao.progress) {
            appState.players.dabao.progress = {};
          }
          const defaultProgress = { spatial: 1, numeric: 1, attention: 1, deduction: 1, pattern: 1, memory: 1, language: 1, analogy: 1, mixed: 1 };
          Object.keys(defaultProgress).forEach(k => {
            if (typeof appState.players.dabao.progress[k] !== 'number') {
              appState.players.dabao.progress[k] = defaultProgress[k];
            }
          });
        }
        if (appState.players.erbao) {
          if (appState.players.erbao.name.includes("二宝") || appState.players.erbao.name.includes("小宝")) {
            appState.players.erbao.name = "淼淼 (2岁)";
          }
          if (!appState.players.erbao.solvedQuestions) {
            appState.players.erbao.solvedQuestions = [];
          }
          if (!appState.players.erbao.wrongQuestions) {
            appState.players.erbao.wrongQuestions = {};
          }
        }
      }
      
      // Auto-migrate rewards to ensure "r6" Crystal Geode exists
      if (!appState.rewards) {
        appState.rewards = [...DEFAULT_STATE.rewards];
      } else {
        if (!appState.rewards.some(r => r.id === "r6")) {
          appState.rewards.push({ id: "r6", title: "兑换七彩水晶洞 1 个 (自选颜色) 🔮", cost: 1320, target: "dabao" });
        }
      }
      
      // Auto-migrate and update version info
      if (!appState.versionInfo) {
        appState.versionInfo = { ...DEFAULT_STATE.versionInfo };
      } else {
        // Increment build (publish count) on new model sessions.
        // To prevent looping build count on simple page refresh, we sync with the master DEFAULT_STATE publish count
        // and increment if DEFAULT_STATE.versionInfo has a larger or equal build version.
        if (appState.versionInfo.build < DEFAULT_STATE.versionInfo.build) {
          appState.versionInfo.build = DEFAULT_STATE.versionInfo.build;
        }
        // Sync major & minor with target configuration values confirmed by user
        appState.versionInfo.major = DEFAULT_STATE.versionInfo.major;
        appState.versionInfo.minor = DEFAULT_STATE.versionInfo.minor;
      }
      
      saveAppState();
    } catch (e) {
      console.warn("Storage structure mismatch. Resetting to defaults.", e);
      appState = DEFAULT_STATE;
      saveAppState();
    }
  } else {
    // Deep-copy so the fresh state is independent of DEFAULT_STATE
    appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveAppState();
  }
}

function saveAppState() {
  appState.lastUpdated = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function selectPlayer(playerId) {
  initAppState();
  window.currentPlayerId = playerId;
  const player = appState.players[playerId];
  
  document.getElementById("player-gate").style.display = "none";
  document.getElementById("app-container").style.display = "block";
  document.getElementById("nav-avatar").innerText = player.avatar;
  document.getElementById("nav-player-name").innerText = player.name;
  document.getElementById("nav-player-title").innerText = playerId === "dabao" ? "级别: L5 逻辑探险家 🧭" : "级别: 萌新感官启蒙舱 🐰";
  document.getElementById("star-count").innerText = `🪙 ${player.stars}`;
  
  if (playerId === "dabao") {
    loadDabaoHUD();
  } else {
    loadErbaoHUD();
  }
}

function logoutPlayer() {
  document.getElementById("app-container").style.display = "none";
  document.getElementById("player-gate").style.display = "flex";
  window.currentPlayerId = null;
  // Restore screen scrolling using global helper
  unlockViewportScrolling();
}

// --- Unified Global Viewport Scroll Lock/Unlock for iPad/Mobile WebKit Compatibility ---
function preventScrollHandler(e) {
  if (e.cancelable) e.preventDefault();
}

function lockViewportScrolling() {
  document.addEventListener('touchmove', preventScrollHandler, { passive: false });
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100%';
}

function unlockViewportScrolling() {
  document.removeEventListener('touchmove', preventScrollHandler, { passive: false });
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.height = '';
}

function clearAllHistory() {
  if (confirm("⚠️ 确定要清空所有数据吗？\n这将永久清除果果 and 淼淼的星星数量、解锁的勋章以及所有通关记录，重置后无法恢复！")) {
    localStorage.removeItem(STORAGE_KEY);
    alert("🎉 历史记录清除成功！正在重新载入系统...");
    window.location.href = "index.html";
  }
}

// Render dynamic version tag to front lobby page
function renderLobbyVersion() {
  const versionEl = document.getElementById("version-build-count");
  if (versionEl && appState.versionInfo) {
    versionEl.innerText = `BUILD #${appState.versionInfo.build}`;
  }
}

// Global initialization
initAppState();
renderLobbyVersion();
