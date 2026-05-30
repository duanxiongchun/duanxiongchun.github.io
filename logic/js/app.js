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
      progress: { spatial: 1, numeric: 1, attention: 1, deduction: 1 }, // Stably tracks 果果's 50 progressive levels per track
      stats: { spatial: 75, numeric: 60, attention: 85, deduction: 50 }
    },
    erbao: {
      name: "淼淼 (2岁)",
      avatar: "🐰",
      stars: 30, // default initial reward stars for trial
      stickers: ["happy_bunny"],
      solvedQuestions: [], // Tracks successfully solved sensory level IDs for Miaomiao
      lastTrainedDate: null
    }
  },
  rewards: [
    { id: "r1", title: "看动画片 30 分钟 📺", cost: 40, target: "dabao" },
    { id: "r2", title: "去楼下坐摇摇车 2 次 🎠", cost: 30, target: "erbao" },
    { id: "r3", title: "买乐高小积木 1 套 🧱", cost: 150, target: "dabao" },
    { id: "r4", title: "吃美味冰淇淋 1 个 🍦", cost: 100, target: "dabao" },
    { id: "r5", title: "喝一瓶小酸奶 🍼", cost: 20, target: "erbao" }
  ],
  redemptions: []
};

let appState = DEFAULT_STATE;

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
          // Critical migration: Inject and persist progress tracking schema if missing in browser database
          if (!appState.players.dabao.progress) {
            appState.players.dabao.progress = { spatial: 1, numeric: 1, attention: 1, deduction: 1 };
          }
        }
        if (appState.players.erbao) {
          if (appState.players.erbao.name.includes("二宝") || appState.players.erbao.name.includes("小宝")) {
            appState.players.erbao.name = "淼淼 (2岁)";
          }
          if (!appState.players.erbao.solvedQuestions) {
            appState.players.erbao.solvedQuestions = [];
          }
        }
      }
      
      saveAppState();
    } catch (e) {
      console.warn("Storage structure mismatch. Resetting to defaults.", e);
      appState = DEFAULT_STATE;
      saveAppState();
    }
  } else {
    appState = DEFAULT_STATE;
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
}

function clearAllHistory() {
  if (confirm("⚠️ 确定要清空所有数据吗？\n这将永久清除果果和淼淼的星星数量、解锁的勋章以及所有通关记录，重置后无法恢复！")) {
    localStorage.removeItem(STORAGE_KEY);
    alert("🎉 历史记录清除成功！正在重新载入系统...");
    window.location.href = "index.html";
  }
}

// Global initialization
initAppState();
