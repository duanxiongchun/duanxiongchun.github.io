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
const suiteAFailed = failedTests;
const suiteAPassed = passedTests;

// --- TEST SUITE B: PROGRESSION, STREAKS, MILESTONES, AND SPACED REPETITION ---
console.log("\n--- Running Test Suite B: Progression & Spaced Repetition ---");

// Mock setTimeout globally to prevent process hangs or async state changes during the tests
const originalSetTimeout = global.setTimeout;
global.setTimeout = () => {};

// Reset counters for Suite B
let suiteBPassed = 0;
let suiteBFailed = 0;

function testB(name, fn) {
  try {
    localStorage.clear();
    // Reset appState to a fresh copy of DEFAULT_STATE
    global.appState = JSON.parse(JSON.stringify(global.DEFAULT_STATE));
    // Reset currentGameTrack, currentPlayerId, isMixedMode, isReviewMode, reviewLevelKey, etc.
    window.currentGameTrack = 'spatial';
    window.currentPlayerId = 'dabao';
    window.currentGameLevel = 1;
    window.isMixedMode = false;
    window.isReviewMode = false;
    window.reviewLevelKey = null;
    
    fn();
    console.log(`\x1b[32m  ✓ [PASS] ${name}\x1b[0m`);
    suiteBPassed++;
  } catch (err) {
    console.error(`\x1b[31m  ✗ [FAIL] ${name}\x1b[0m`);
    console.error(err.stack);
    suiteBFailed++;
  }
}

// Test 5: Base stars per difficulty level
testB("Base stars per difficulty level (Level 5 -> 2, Level 15 -> 5, Level 30 -> 12, Level 45 -> 30)", () => {
  global.initAppState();
  window.currentGameTrack = 'spatial';
  window.currentPlayerId = 'dabao';
  window.isMixedMode = false;
  
  // Set streak to 1 to ensure multiplier is 1.0x
  global.appState.players.dabao.streaks = 1;

  // Level 5: Easy (Level 1-12) -> +2 stars
  global.appState.players.dabao.stars = 0;
  window.currentGameLevel = 5;
  global.trigger6yoVictory(10, 'Level 5 Easy');
  assert.strictEqual(global.appState.players.dabao.stars, 2);

  // Level 15: Medium (Level 13-28) -> +5 stars
  global.appState.players.dabao.stars = 0;
  window.currentGameLevel = 15;
  global.trigger6yoVictory(10, 'Level 15 Medium');
  assert.strictEqual(global.appState.players.dabao.stars, 5);

  // Level 30: Hard (Level 29-42) -> +12 stars
  global.appState.players.dabao.stars = 0;
  window.currentGameLevel = 30;
  global.trigger6yoVictory(10, 'Level 30 Hard');
  assert.strictEqual(global.appState.players.dabao.stars, 12);

  // Level 45: Ultimate (Level 43-50) -> +30 stars
  global.appState.players.dabao.stars = 0;
  window.currentGameLevel = 45;
  global.trigger6yoVictory(10, 'Level 45 Ultimate');
  assert.strictEqual(global.appState.players.dabao.stars, 30);
});

// Test 6: Streak multipliers (1.0x, 1.2x, 1.5x)
testB("Streak multipliers (1.0x, 1.2x, 1.5x)", () => {
  global.initAppState();
  window.currentGameTrack = 'spatial';
  window.currentPlayerId = 'dabao';
  window.isMixedMode = false;
  window.currentGameLevel = 45; // Ultimate base stars = 30

  // Streak 1 (1.0x) -> 30 stars
  global.appState.players.dabao.stars = 0;
  global.appState.players.dabao.streaks = 1;
  global.trigger6yoVictory(10, 'Streak 1');
  assert.strictEqual(global.appState.players.dabao.stars, 30);

  // Streak 3 (1.2x) -> Math.round(30 * 1.2) = 36 stars
  global.appState.players.dabao.stars = 0;
  global.appState.players.dabao.streaks = 3;
  global.trigger6yoVictory(10, 'Streak 3');
  assert.strictEqual(global.appState.players.dabao.stars, 36);

  // Streak 7 (1.5x) -> Math.round(30 * 1.5) = 45 stars
  global.appState.players.dabao.stars = 0;
  global.appState.players.dabao.streaks = 7;
  global.trigger6yoVictory(10, 'Streak 7');
  assert.strictEqual(global.appState.players.dabao.stars, 45);
});

// Test 7: Milestone +150 stars bonus on Level 50 normal mode victory vs mixed mode
testB("Milestone +150 stars bonus on Level 50 normal mode victory", () => {
  global.initAppState();
  window.currentGameTrack = 'spatial';
  window.currentPlayerId = 'dabao';
  window.currentGameLevel = 50; // Ultimate base stars = 30
  global.appState.players.dabao.streaks = 1; // 1.0x multiplier

  // Part A: Normal mode victory -> 30 base + 150 milestone = 180 stars
  window.isMixedMode = false;
  global.appState.players.dabao.stars = 0;
  global.trigger6yoVictory(10, 'Normal Level 50 Milestone');
  assert.strictEqual(global.appState.players.dabao.stars, 180);

  // Part B: Mixed mode victory -> 30 base stars, NO milestone bonus
  window.isMixedMode = true;
  global.appState.players.dabao.stars = 0;
  global.trigger6yoVictory(10, 'Mixed Level 50 No Milestone');
  assert.strictEqual(global.appState.players.dabao.stars, 30);
});

// Test 8: Single progress increment vs. progress.mixed 综合航线 increment
testB("Single progress increment vs. progress.mixed increment", () => {
  global.initAppState();
  window.currentGameTrack = 'spatial';
  window.currentPlayerId = 'dabao';
  
  // Part A: Normal mode -> advances specific game track progress
  window.isMixedMode = false;
  window.currentGameLevel = 5;
  global.appState.players.dabao.progress.spatial = 5;
  global.trigger6yoVictory(10, 'Normal victory');
  assert.strictEqual(global.appState.players.dabao.progress.spatial, 6);

  // Part B: Mixed mode -> advances progress.mixed progress
  window.isMixedMode = true;
  window.currentGameLevel = 5;
  window.currentGameMixedLevel = 10;
  global.appState.players.dabao.progress.mixed = 10;
  global.trigger6yoVictory(10, 'Mixed victory');
  assert.strictEqual(global.appState.players.dabao.progress.mixed, 11);
});

// Test 9: Failure wrong questions log with timestamps
testB("Failure wrong questions log with timestamps", () => {
  global.initAppState();
  window.currentGameTrack = 'spatial';
  window.currentPlayerId = 'dabao';
  window.isMixedMode = false;
  window.currentGameLevel = 8;
  global.appState.players.dabao.progress.spatial = 8;

  const originalDateNow = Date.now;
  const mockTimestamp = 1600000000000;
  Date.now = () => mockTimestamp;

  try {
    global.trigger6yoFailure('Failed attempt', 'Explanation');
    // Timestamp should be recorded accurately
    assert.strictEqual(global.appState.players.dabao.wrongQuestions['spatial-8'], mockTimestamp);
    // Failure advances level progress normally in normal mode (to prevent child frustration)
    assert.strictEqual(global.appState.players.dabao.progress.spatial, 9);
  } finally {
    Date.now = originalDateNow;
  }
});

// Test 10: 48-hour wrong question cooldown skipping vs. revival review modes (isReviewMode)
testB("48-hour wrong question cooldown skipping vs. revival review modes", () => {
  global.initAppState();
  window.currentGameTrack = 'spatial';
  window.currentPlayerId = 'dabao';
  window.isMixedMode = false;

  const now = Date.now();

  // Part A: Skipping question failed within 48-hour cooldown (1 hour ago)
  global.appState.players.dabao.solvedQuestions = [];
  global.appState.players.dabao.wrongQuestions = {
    'spatial-5': now - 3600 * 1000 // failed 1 hr ago (within 2 days)
  };
  let nextLevel = global.getNextAvailableLevel('dabao', 'spatial', 5);
  assert.strictEqual(nextLevel, 6, "Should skip level 5 because it was failed within 48 hours");

  // Part B: Repeating question failed outside 48-hour cooldown (50 hours ago)
  global.appState.players.dabao.wrongQuestions = {
    'spatial-5': now - 50 * 3600 * 1000 // failed 50 hrs ago (> 48 hours)
  };
  nextLevel = global.getNextAvailableLevel('dabao', 'spatial', 5);
  assert.strictEqual(nextLevel, 5, "Should NOT skip level 5 because 48-hour cooldown expired");

  // Part C: Successful review mode removes question from wrong pool
  global.appState.players.dabao.wrongQuestions = {
    'spatial-5': now - 3600 * 1000
  };
  window.currentGameLevel = 5;
  window.isReviewMode = true;
  window.reviewLevelKey = 'spatial-5';

  global.trigger6yoVictory(10, 'Review success');

  assert.strictEqual(global.appState.players.dabao.wrongQuestions['spatial-5'], undefined, "Successful review should remove question from wrong pool");
  assert.strictEqual(window.isReviewMode, false, "Should turn off review mode");
  assert.strictEqual(window.reviewLevelKey, null, "Should clear reviewLevelKey");

  // Part D: Unsuccessful review mode keeps question in wrong pool and does NOT advance level progress
  global.appState.players.dabao.wrongQuestions = {
    'spatial-5': now - 3600 * 1000
  };
  global.appState.players.dabao.progress.spatial = 5;
  window.currentGameLevel = 5;
  window.isReviewMode = true;
  window.reviewLevelKey = 'spatial-5';

  global.trigger6yoFailure('Review failed', 'Explanation');

  assert.ok(global.appState.players.dabao.wrongQuestions['spatial-5'] >= now, "Should update wrong question timestamp to current time");
  assert.strictEqual(window.isReviewMode, false, "Should turn off review mode");
  assert.strictEqual(window.reviewLevelKey, null, "Should clear reviewLevelKey");
  assert.strictEqual(global.appState.players.dabao.progress.spatial, 5, "Level progress should NOT advance on review mode failure");
});

// Restore setTimeout
global.setTimeout = originalSetTimeout;

console.log(`\n📊 Suite B Summary: Passed ${suiteBPassed}, Failed ${suiteBFailed}`);

// --- TEST SUITE C: QUESTION CONTENT VALIDITY & DIFFICULTY COMPLIANCE ---
console.log("\n--- Running Test Suite C: Question Content & Difficulty ---");

let suiteCPassed = 0;
let suiteCFailed = 0;

function testC(name, fn) {
  try {
    fn();
    console.log(`\x1b[32m  ✓ [PASS] ${name}\x1b[0m`);
    suiteCPassed++;
  } catch (err) {
    console.error(`\x1b[31m  ✗ [FAIL] ${name}\x1b[0m`);
    console.error(err.stack);
    suiteCFailed++;
  }
}

// Test 11: Uniqueness (No duplicate questions)
testC("Database Uniqueness - Ensure no duplicate question contents exist in static arrays", () => {
  // Helper to check for duplicates in a simple field or string representation
  function assertNoDuplicates(arr, keySelector, arrayName) {
    const seen = new Set();
    arr.forEach((q, idx) => {
      const key = keySelector(q);
      assert.ok(!seen.has(key), `Duplicate detected in ${arrayName} at index ${idx}: "${key}"`);
      seen.add(key);
    });
  }

  // 1. Check Mirror Questions
  assertNoDuplicates(global.MIRROR_QUESTIONS, q => q.original.trim(), "MIRROR_QUESTIONS");
  
  // 2. Check Rotation Questions
  assertNoDuplicates(global.ROTATION_QUESTIONS, q => q.title + '::' + q.original.trim(), "ROTATION_QUESTIONS");
  
  // 3. Check Completion Questions
  assertNoDuplicates(global.COMPLETION_QUESTIONS, q => q.desc + '::' + q.items.join(','), "COMPLETION_QUESTIONS");

  // 4. Check Unfolding Questions
  assertNoDuplicates(global.UNFOLDING_QUESTIONS, q => q.title, "UNFOLDING_QUESTIONS");

  // 5. Check Size Deduction Questions
  assertNoDuplicates(global.DEDUCTION_SIZE_QUESTIONS, q => q.text, "DEDUCTION_SIZE_QUESTIONS");

  // 6. Check Weight Deduction Questions
  assertNoDuplicates(global.DEDUCTION_WEIGHT_QUESTIONS, q => q.text + '::' + q.clues.join(','), "DEDUCTION_WEIGHT_QUESTIONS");

  // 7. Check Causal Deduction Questions
  assertNoDuplicates(global.DEDUCTION_CAUSAL_QUESTIONS, q => q.text, "DEDUCTION_CAUSAL_QUESTIONS");

  // 8. Check Queue Deduction Questions
  assertNoDuplicates(global.DEDUCTION_QUEUE_QUESTIONS, q => q.text, "DEDUCTION_QUEUE_QUESTIONS");

  // 9. Check Timelines
  assertNoDuplicates(global.DEDUCTION_TIMELINES, q => q.text, "DEDUCTION_TIMELINES");

  // 10. Check Pattern Questions
  assertNoDuplicates(global.PATTERN_QUESTIONS, q => q.text + '::' + q.matrix.join(','), "PATTERN_QUESTIONS");

  // 11. Check Attention Track Questions (Paths and hints distinguish questions with the same pairings)
  assertNoDuplicates(global.ATTENTION_TRACK_QUESTIONS, q => q.targetFood + '::' + q.ans + '::' + q.hint, "ATTENTION_TRACK_QUESTIONS");

  // 12. Check Language Questions
  assertNoDuplicates(global.LANGUAGE_QUESTIONS, q => q.text, "LANGUAGE_QUESTIONS");

  // 13. Check Analogy Questions
  assertNoDuplicates(global.ANALOGY_QUESTIONS, q => q.text, "ANALOGY_QUESTIONS");

  // 14. Check Erbao Analogy Questions
  assert.ok(Array.isArray(global.ERBAO_ANALOGY_QUESTIONS), "ERBAO_ANALOGY_QUESTIONS must be loaded in the sandbox");
  assertNoDuplicates(global.ERBAO_ANALOGY_QUESTIONS, q => q.q, "ERBAO_ANALOGY_QUESTIONS");
});

// Test 12: Dabao (6yo) Spatial Mirror Correctness (Strict Mathematical Horizontal Flip)
testC("Dabao (6yo) Spatial Mirror - Verifies correct answer is a strict mathematical horizontal flip", () => {
  function getHorizontalFlip(gridStr) {
    return gridStr.trim().split('\n').map(row => {
      return Array.from(row.trim()).reverse().join('');
    }).join('\n');
  }

  global.MIRROR_QUESTIONS.forEach((q, idx) => {
    const expectedMirror = getHorizontalFlip(q.original);
    assert.strictEqual(q.correct.trim(), expectedMirror, `Mirror question at index ${idx} is mathematically incorrect! Original:\n${q.original}\nExpected:\n${expectedMirror}\nGot:\n${q.correct}`);
  });
});

// Test 13: Dabao (6yo) Equivalence & Weight - Clue format and Zero-Prerequisite compliance
testC("Dabao (6yo) Equivalence & Weight - Clue structures and No-Algebra policy compliance", () => {
  global.DEDUCTION_WEIGHT_QUESTIONS.forEach((q, idx) => {
    // Clues must contain scales emojis or comparison verbs
    q.clues.forEach(clue => {
      assert.ok(clue.includes('⚖️') || clue.includes('显示') || clue.includes('天平'), `Weight deduction clues at index ${idx} must use concrete天平 scale symbols to remain zero-prerequisite: "${clue}"`);
    });
    
    // Abstract algebraic symbols (x, y, z) are strictly forbidden for 6yos
    assert.ok(!q.text.toLowerCase().includes(' x ') && !q.text.toLowerCase().includes(' y ') && !q.text.toLowerCase().includes(' z '), `Weight deduction text at index ${idx} must avoid abstract algebraic equations: "${q.text}"`);
  });
});

// Test 14: Dabao (6yo) Social Metacognition & Etiquette Values Correctness
testC("Dabao (6yo) Social Metacognition - Verifies correct option promotes positive social values", () => {
  const politeKeywords = ['对不起', '谢谢', '早上好', '请问', '再见', '没关系', '轮流', '先入座', '倾听', '轻轻地'];

  // Check language category questions (e.g. indices 0-9 in LANGUAGE_QUESTIONS for type 5 are returned by getDynamicLanguage(qIdx, 5))
  for (let i = 0; i < 10; i++) {
    const q = global.getDynamicLanguage(i, 5);
    assert.ok(q, `getDynamicLanguage(${i}, 5) must return a valid question`);
    const correctOpt = q.opts[q.ans];
    
    // Verify that the correct option contains at least one positive polite keyword
    const hasPoliteWord = politeKeywords.some(kw => correctOpt.includes(kw));
    assert.ok(hasPoliteWord, `Etiquette question correct answer at index ${i} must promote positive values: "${correctOpt}"`);
  }
});

// Test 15: Erbao (2yo) Numeric Counting - Cognitive bandwidth compliance (1 to 5 range)
testC("Erbao (2yo) Numeric Counting - Cognitive limits check (items count strictly 1 to 5)", () => {
  for (let level = 1; level <= 50; level++) {
    const config = global.getErbaoNumericConfig(level);
    assert.ok(config.count >= 1 && config.count <= 5, `Erbao level ${level} count ${config.count} is out of toddler ZPD counting range (1-5)`);
    // JavaScript string .length accounts for UTF-16 surrogate pairs, so itemStr length must equal count * icon.length
    assert.strictEqual(config.itemStr.length, config.count * config.icon.length, `Counting icons string length mismatch at level ${level}`);
  }
});

// Test 16: Erbao (2yo) Pattern Sequences - Alternating loops structure (ABAB / AAB / ABB)
testC("Erbao (2yo) Pattern Logic - Alternating loops structure compliance", () => {
  for (let level = 1; level <= 50; level++) {
    const config = global.getErbaoPatternConfig(level);
    
    // Toddler pattern sequence length should be 4 or 5 elements to keep working memory light
    assert.ok(config.sequence.length === 4 || config.sequence.length === 5, `Erbao pattern length at level ${level} is out of bounds: ${config.sequence.length}`);
    
    // Elements should only consist of two items (a and b) representing simple ABAB/AAB/ABB loops
    config.sequence.forEach(el => {
      assert.ok(el === config.a || el === config.b, `Pattern element at level ${level} introduces out-of-loop elements: "${el}"`);
    });
    
    // Correct answer is the mathematical continuation of the loop sequence
    let expectedAnswer = config.a;
    if (level > 40) expectedAnswer = config.b;      // 'abb' pattern -> next is b
    else if (level > 25) expectedAnswer = config.b; // 'aab' pattern -> next is b
    
    assert.strictEqual(config.ans, expectedAnswer, `Correct answer mismatch at level ${level}: expected "${expectedAnswer}", got "${config.ans}"`);
  }
});

// Test 17: Erbao (2yo) Size Deduction - Sensory contrast check
testC("Erbao (2yo) Size Deduction - Sensory size contrast verification", () => {
  for (let level = 1; level <= 50; level++) {
    const config = global.getErbaoDeductionConfig(level);
    
    // Verifies large and small icons are defined and representing contrasting sizes
    assert.ok(config.bigName && config.bigIcon, `Level ${level} big animal undefined`);
    assert.ok(config.smallName && config.smallIcon, `Level ${level} small animal undefined`);
    assert.notStrictEqual(config.bigName, config.smallName, `Level ${level} animals must be distinct`);
  }
});

// Test 18: Erbao (2yo) Attention Spotting - Size and uniqueness verification
testC("Erbao (2yo) Attention Search - Grid size and uniqueness limits compliance", () => {
  for (let level = 1; level <= 50; level++) {
    const config = global.getErbaoAttentionConfig(level);
    
    // Grid size must be either 2x2 or 3x3 for toddlers to prevent information scanning fatigue
    assert.ok(config.gridSize === 2 || config.gridSize === 3, `Erbao level ${level} gridSize ${config.gridSize} violates ZPD toddler boundaries`);
    
    // Items array must contain exactly one single divergent element at diffIdx
    const countOfDiff = config.items.filter(x => x === config.diffEmoji).length;
    assert.strictEqual(countOfDiff, 1, `Erbao attention grid at level ${level} must have exactly one single divergent element`);
    assert.strictEqual(config.items[config.diffIdx], config.diffEmoji, `Divergent element must be positioned exactly at diffIdx`);
  }
});

// Test 19: Erbao (2yo) Analogies - Toddler experiential cause-effect checks
testC("Erbao (2yo) Analogies - Cognitive associations and option constraints check", () => {
  // Retrieve analogical questions array
  assert.ok(Array.isArray(global.ERBAO_ANALOGY_QUESTIONS), "ERBAO_ANALOGY_QUESTIONS must be loaded in the sandbox");
  
  global.ERBAO_ANALOGY_QUESTIONS.forEach((q, idx) => {
    // 1. Verifies that there are exactly 2 options (binary choice) to reduce toddler choice paralysis
    assert.strictEqual(q.opts.length, 2, `Erbao analogy at index ${idx} must contain exactly 2 options: "${q.q}"`);
    
    // 2. Correct answer is in the options
    assert.ok(q.opts.includes(q.ans), `Correct answer "${q.ans}" at index ${idx} is missing from options`);
  });
});

console.log(`\n📊 Suite C Summary: Passed ${suiteCPassed}, Failed ${suiteCFailed}`);

// --- CONSOLIDATED TEST REPORT ---
const totalPassed = suiteAPassed + suiteBPassed + suiteCPassed;
const totalFailed = suiteAFailed + suiteBFailed + suiteCFailed;
console.log("\n==============================================");
console.log(`🏆 FINAL TEST REPORT: Passed ${totalPassed}, Failed ${totalFailed}`);
console.log("==============================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
