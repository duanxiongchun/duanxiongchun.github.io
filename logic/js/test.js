const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("🔨 Setting up browser sandbox mock environment...");

// 1. Setup standard browser API mocks on Node's 'global' scope:
const localStorageStore = Object.create(null);
const localStorageMock = {
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(localStorageStore, key) ? localStorageStore[key] : null;
  },
  setItem(key, value) {
    localStorageStore[key] = String(value);
  },
  removeItem(key) {
    delete localStorageStore[key];
  },
  clear() {
    for (const key in localStorageStore) {
      delete localStorageStore[key];
    }
  }
};

// Dummy DOM Element Generator
function createDummyDOMElement(tagName = 'div') {
  const el = {
    tagName: tagName.toUpperCase(),
    innerText: "",
    innerHTML: "",
    value: "",
    style: {},
    className: "",
    classList: {
      classes: new Set(),
      add(cls) { this.classes.add(cls); },
      remove(cls) { this.classes.delete(cls); },
      toggle(cls) {
        if (this.classes.has(cls)) {
          this.classes.delete(cls);
          return false;
        } else {
          this.classes.add(cls);
          return true;
        }
      },
      contains(cls) { return this.classes.has(cls); }
    },
    childNodes: [],
    parentNode: null,
    appendChild(child) {
      if (child) {
        child.parentNode = this;
        this.childNodes.push(child);
      }
      return child;
    },
    removeChild(child) {
      if (child) {
        const idx = this.childNodes.indexOf(child);
        if (idx !== -1) {
          this.childNodes.splice(idx, 1);
          child.parentNode = null;
        }
      }
      return child;
    },
    remove() {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    },
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return createDummyDOMElement();
    },
    querySelectorAll() {
      return [createDummyDOMElement()];
    },
    getAttribute() {
      return null;
    },
    setAttribute() {},
    removeAttribute() {},
    getContext() {
      return {
        fillRect() {},
        clearRect() {},
        beginPath() {},
        moveTo() {},
        lineTo() {},
        stroke() {},
        fill() {},
        arc() {},
        createLinearGradient() {
          return { addColorStop() {} };
        },
        drawImage() {},
        fillText() {},
        measureText() { return { width: 10 }; }
      };
    },
    play() { return Promise.resolve(); },
    pause() {}
  };
  return el;
}

const elementCache = {};
const mockDocument = {
  body: createDummyDOMElement('body'),
  documentElement: createDummyDOMElement('html'),
  getElementById(id) {
    const key = `#${id}`;
    if (!elementCache[key]) {
      elementCache[key] = createDummyDOMElement();
    }
    return elementCache[key];
  },
  createElement(tagName) {
    return createDummyDOMElement(tagName);
  },
  querySelector(selector) {
    if (!elementCache[selector]) {
      elementCache[selector] = createDummyDOMElement();
    }
    return elementCache[selector];
  },
  querySelectorAll(selector) {
    if (!elementCache[selector]) {
      elementCache[selector] = [createDummyDOMElement()];
    }
    return elementCache[selector];
  },
  addEventListener() {},
  removeEventListener() {}
};

// AudioContext & webkitAudioContext Mock
const mockAudioParam = {
  setValueAtTime() {},
  exponentialRampToValueAtTime() {},
  linearRampToValueAtTime() {}
};

class MockOscillatorNode {
  constructor() {
    this.frequency = { ...mockAudioParam };
    this.type = 'sine';
  }
  connect() {}
  start() {}
  stop() {}
}

class MockGainNode {
  constructor() {
    this.gain = { ...mockAudioParam };
  }
  connect() {}
}

class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.destination = {};
  }
  createOscillator() {
    return new MockOscillatorNode();
  }
  createGain() {
    return new MockGainNode();
  }
}

// SpeechSynthesis & SpeechSynthesisUtterance Mock
class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text || "";
    this.voice = null;
    this.lang = "";
    this.rate = 1;
    this.pitch = 1;
  }
}

const mockSpeechSynthesis = {
  getVoices() {
    return [
      { name: "Tingting", lang: "zh-CN" },
      { name: "Xiaoxiao", lang: "zh-CN" },
      { name: "Google 普通话", lang: "zh-CN" }
    ];
  },
  cancel() {},
  speak() {},
  onvoiceschanged: null
};

// Set up globals
global.localStorage = localStorageMock;
global.window = global;
global.location = { href: "" };
global.confirm = () => true;
global.alert = () => {};
global.document = mockDocument;
global.AudioContext = MockAudioContext;
global.webkitAudioContext = MockAudioContext;
global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
global.speechSynthesis = mockSpeechSynthesis;

console.log("✅ Browser sandbox mock environment established.");

// 2. Ingest and evaluate production files in correct sequence
const files = [
  'app.js',
  'sensory.js',
  'questions.js',
  'games/spatial.js',
  'games/numeric.js',
  'games/attention.js',
  'games/deduction.js',
  'games/pattern.js',
  'games/memory.js',
  'games/language.js',
  'games/analogy.js',
  'games.js',
  'custom-rewards.js'
];

console.log("📦 Ingesting production files...");
let combinedCode = '';
for (const file of files) {
  const absolutePath = path.resolve(__dirname, file);
  combinedCode += `// --- START OF FILE: ${file} ---\n`;
  combinedCode += fs.readFileSync(absolutePath, 'utf8') + '\n';
  combinedCode += `// --- END OF FILE: ${file} ---\n\n`;
}

// Discover all top-level declared names to export to Node global scope
const cleanCode = combinedCode
  .replace(/\/\*[\s\S]*?\*\//g, '') // remove multi-line comments
  .replace(/\/\/.*/g, '');          // remove single-line comments

const declaredNames = new Set([
  // Core globals we definitely want to expose
  'appState', 'initAppState', 'saveAppState', 'selectPlayer', 'logoutPlayer', 'clearAllHistory',
  'launchSensory', 'launchErbaoSensory', 'setupSensoryDragDrop', 'erbaoSensoryChoice',
  'MIRROR_QUESTIONS', 'ROTATION_QUESTIONS', 'COMPLETION_QUESTIONS', 'UNFOLDING_QUESTIONS',
  'getDynamicNumeric', 'ATTENTION_SPOT_TEMPLATES', 'SCHULTE_TEMPLATES',
  'ATTENTION_SEQUENCE_TEMPLATES', 'CHRONOLOGY_QUESTIONS', 'CAUSE_EFFECT_QUESTIONS',
  'GRID_3X3_QUESTIONS', 'MEMORY_GRID_TEMPLATES', 'MEMORY_BACKWARDS_QUESTIONS',
  'MEMORY_IMAGE_QUESTIONS', 'LANGUAGE_CATEGORY_QUESTIONS', 'LANGUAGE_ODD_ONE_OUT',
  'LANGUAGE_SCENE_QUESTIONS', 'ANALOGY_RELATION_QUESTIONS',
  'launchSpatial', 'checkSpatialChoice', 'getSpatialStack', 'renderIsometricSVG',
  'launchNumeric', 'checkNumericAnswer', 'generateNumericFormulaQuestion',
  'generatePyramidQuestion', 'checkInteractiveFormula', 'checkInteractivePyramid',
  'launchAttention', 'clickAttentionSchulte', 'clickAttentionSequence',
  'launchDeduction', 'checkDeductionChoice', 'checkDeductionOrder',
  'launchPattern', 'checkPatternChoice',
  'launchMemory', 'submitMemorySequence', 'clickMemoryTile', 'submitMemoryTile', 'submitMemoryBackwards',
  'launchLanguage', 'checkLanguageChoice',
  'launchAnalogy', 'checkAnalogyChoice',
  'currentAnswer6yo', 'getLevelTitle', 'renderOptionContent', 'loadBestVoice',
  'speakText', 'getNextAvailableLevel', 'trigger6yoVictory', 'trigger6yoFailure',
  'launchTest', 'launchMixedMode', 'nextMixedQuestion',
  'loadDabaoHUD', 'loadErbaoHUD', 'redeemReward'
]);

// Auto-discover top-level declarations using regex
let match;
const funcRegex = /^function\s+([a-zA-Z0-9_$]+)/gm;
while ((match = funcRegex.exec(cleanCode)) !== null) {
  declaredNames.add(match[1]);
}
const varRegex = /^(?:const|let|var)\s+([a-zA-Z0-9_$]+)/gm;
while ((match = varRegex.exec(cleanCode)) !== null) {
  declaredNames.add(match[1]);
}

// Generate explicit exports to global scope
let exportCode = '\n// --- AUTO GENERATED EXPORTS TO GLOBAL SCOPE ---\n';
for (const name of declaredNames) {
  if (name === 'appState') {
    exportCode += `if (typeof appState !== 'undefined') { Object.defineProperty(global, 'appState', { get: () => appState, set: (v) => { appState = v; }, configurable: true }); }\n`;
  } else {
    exportCode += `if (typeof ${name} !== 'undefined') { global.${name} = ${name}; }\n`;
  }
}

combinedCode += exportCode;

// Compile and run the concatenated script within a new Function wrapper
// Compile and run the concatenated script within a new Function wrapper
try {
  const evalFn = new Function(combinedCode);
  evalFn();
} catch (error) {
  console.error("❌ Failed to compile or execute sandbox code:", error);
  throw error;
}

console.log("⚡ Verification tests starting...");

// Simple TDD / self-verification checks:
assert.ok(global.appState, "appState should be loaded and globally accessible.");
assert.strictEqual(typeof global.initAppState, "function", "initAppState should be a globally accessible function.");
assert.strictEqual(typeof global.selectPlayer, "function", "selectPlayer should be a globally accessible function.");
assert.strictEqual(typeof global.launchSensory, "function", "launchSensory should be a globally accessible function.");
assert.ok(Array.isArray(global.MIRROR_QUESTIONS), "MIRROR_QUESTIONS should be a loaded array.");
assert.strictEqual(typeof global.launchSpatial, "function", "launchSpatial should be a globally accessible function.");
assert.strictEqual(typeof global.launchNumeric, "function", "launchNumeric should be a globally accessible function.");

// Verify mock localStorage behavior through production functions
localStorageMock.clear();
global.initAppState();
assert.ok(global.appState.players, "appState.players should be initialized.");
assert.strictEqual(global.appState.players.dabao.name, "果果 (6岁)", "Dabao's name should be migrated/initialized to Guoguo.");
assert.strictEqual(global.appState.players.erbao.name, "淼淼 (2岁)", "Erbao's name should be migrated/initialized to Miaomiao.");

console.log("🚀 Mocks and scripts loaded successfully!");

// --- TEST SUITE A: STATE, PERSISTENCE, AND REDEMPTIONS ---
console.log("\n--- Running Test Suite A: State & Rewards ---");

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    localStorage.clear();
    // Reset appState to a fresh copy of DEFAULT_STATE
    global.appState = JSON.parse(JSON.stringify(global.DEFAULT_STATE));
    fn();
    console.log(`\x1b[32m  ✓ [PASS] ${name}\x1b[0m`);
    passedTests++;
  } catch (err) {
    console.error(`\x1b[31m  ✗ [FAIL] ${name}\x1b[0m`);
    console.error(err.stack);
    failedTests++;
  }
}

// Test 1: Default state initialization
test("Default state initialization", () => {
  global.initAppState();
  assert.strictEqual(global.appState.players.dabao.stars, 0);
  assert.strictEqual(global.appState.players.dabao.streaks, 2);
  assert.ok(Array.isArray(global.appState.redemptions));
  assert.strictEqual(global.appState.redemptions.length, 0);
});

// Test 2: Data serialization and persistence
test("Data serialization and persistence", () => {
  global.initAppState();
  global.appState.players.dabao.stars = 99;
  global.saveAppState();
  
  const rawStore = localStorage.getItem("kids_logic_lab_state");
  assert.ok(rawStore, "LocalStorage should contain the state string");
  const stored = JSON.parse(rawStore);
  assert.strictEqual(stored.players.dabao.stars, 99);
});

// Test 3: Insufficient stars redemption failure
test("Insufficient stars redemption failure", () => {
  global.initAppState();
  global.appState.players.dabao.stars = 10;
  global.saveAppState();
  
  const success = global.requestRedemption('dabao', 'd1');
  assert.strictEqual(success, false);
  assert.strictEqual(global.appState.players.dabao.stars, 10);
  assert.strictEqual(global.appState.redemptions.length, 0);
});

// Test 4: Sufficient stars redemption success
test("Sufficient stars redemption success", () => {
  global.initAppState();
  global.appState.players.dabao.stars = 50;
  global.saveAppState();
  
  const success = global.requestRedemption('dabao', 'd1');
  assert.strictEqual(success, true);
  assert.strictEqual(global.appState.players.dabao.stars, 30);
  assert.strictEqual(global.appState.redemptions.length, 1);
  assert.strictEqual(global.appState.redemptions[0].rewardId, 'd1');
});

console.log(`\n📊 Suite A Summary: Passed ${passedTests}, Failed ${failedTests}`);
if (failedTests > 0) {
  process.exit(1);
}
