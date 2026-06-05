# 🪞 镜像与反转图形对齐优化 (SVG Dynamic Grid Alignment) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve emoji/character alignment and scrambling issues across different devices (iOS, Android, Windows) by rendering question grids as dynamically-scaled vector SVGs.

**Architecture:** Parse question grid strings in JS to check if they represent standard matrix puzzles. If they do, dynamically generate a scalable SVG. We will draw custom SVG shapes for core geometrical assets (squares, circles, stars, arrows) and use SVG absolute centering (`dominant-baseline="central" text-anchor="middle"`) for characters and text.

**Tech Stack:** Vanilla JavaScript, HTML5 SVG, Node.js Assert (for test runner verification).

---

### Task 1: Unify and Update `renderOptionContent` in `games.js` and `games/spatial.js`

We need to replace the old text-based flex rendering with our new SVG Dynamic Grid Rendering Engine. Since `renderOptionContent` is defined twice (in `logic/js/games.js` and `logic/js/games/spatial.js`), we will update both files.

**Files:**
- Modify: `logic/js/games.js:14-36`
- Modify: `logic/js/games/spatial.js:3-26`

- [ ] **Step 1: Modify `logic/js/games.js` to implement SVG Dynamic Grid Rendering**
  Replace the old implementation of `renderOptionContent` with the new SVG-based implementation.

  Code to replace inside `logic/js/games.js`:
  ```javascript
  function renderOptionContent(opt) {
    if (typeof opt !== 'string') {
      return opt;
    }
    
    // Set of symbols that qualify as grid items
    const gridSymbols = new Set([
      '⬜', '⬛', '🔴', '🟢', '🟡', '🔵', '⭐', '🌟', '🍊', '🎈', '☀️', '🌙',
      '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↖️', '↙️', '🟪', '🟨', '🟧', '🔹', '🔸',
      '🔺', '🔻', '⭕', '🔲', '▲', '▼', '◀️', '▶️', '◀', '▶', '⚫', '⚪',
      '🅰️', '🅱️', '➕', '➖', '🟰', '╳', '┃', '━', 'd', 'p', 'q', 'b', 'L', 'T', '?',
      '🚗', '🐱', '🐶', '🐰', '🍒', '🍎', '🍇', '🍌', '🍯', '🐻', '🛹', '🚲', '🛴',
      '🛵', '🍦', '🍨', '🧑', '🧢', '👧', '🎀', '👦', '🕶', '👓', '🕛', '🕒', '🕕', '🕘'
    ]);
    
    const hasGridSymbol = Array.from(opt).some(char => gridSymbols.has(char));
    const isGrid = opt.includes('\n') || (opt.length <= 6 && hasGridSymbol);
    
    if (!isGrid) {
      return opt;
    }
    
    const rows = opt.trim().split('\n');
    const rowCount = rows.length;
    const colCount = Math.max(...rows.map(r => Array.from(r.trim()).length));
    
    const cellSize = 40;
    const totalWidth = colCount * cellSize;
    const totalHeight = rowCount * cellSize;
    
    let svg = `<svg viewBox="0 0 ${totalWidth} ${totalHeight}" style="display:block; width:100%; height:100%; max-width:${totalWidth}px; margin:0 auto;" class="spatial-svg-grid">`;
    
    const colors = {
      '🔴': '#f87171', // soft red
      '🟢': '#34d399', // soft green
      '🟡': '#fbbf24', // soft yellow
      '🔵': '#60a5fa', // soft blue
      '🟪': '#c084fc', // purple
      '🟨': '#fbbf24', // yellow
      '🟧': '#fb923c', // orange
      '⚫': '#3f3f46', // dark grey
      '⚪': '#f4f4f5', // light grey
    };
    
    for (let r = 0; r < rowCount; r++) {
      const row = rows[r].trim();
      const cells = Array.from(row);
      for (let c = 0; c < colCount; c++) {
        const cell = cells[c] || '⬜';
        const x = c * cellSize;
        const y = r * cellSize;
        
        let rectFill = 'rgba(255, 255, 255, 0.03)';
        let rectStroke = 'rgba(255, 255, 255, 0.08)';
        let rx = 6;
        
        if (cell === '⬛') {
          rectFill = 'rgba(99, 102, 241, 0.1)';
          rectStroke = 'rgba(99, 102, 241, 0.35)';
        } else if (cell === '⬜') {
          rectFill = 'rgba(255, 255, 255, 0.02)';
          rectStroke = 'rgba(255, 255, 255, 0.06)';
        }
        
        svg += `<rect x="${x + 2}" y="${y + 2}" width="${cellSize - 4}" height="${cellSize - 4}" rx="${rx}" fill="${rectFill}" stroke="${rectStroke}" stroke-width="1.5" />`;
        
        if (cell === '⬜' || cell === '⬛') {
          continue;
        }
        
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        
        if (colors[cell]) {
          svg += `<circle cx="${cx}" cy="${cy}" r="12" fill="${colors[cell]}" />`;
        } else if (cell === '⭐' || cell === '🌟') {
          svg += `<path d="M ${cx} ${cy - 12} L ${cx + 3.5} ${cy - 3.5} L ${cx + 12} ${cy - 3.5} L ${cx + 5} ${cy + 1.5} L ${cx + 7.5} ${cy + 10} L ${cx} ${cy + 5} L ${cx - 7.5} ${cy + 10} L ${cx - 5} ${cy + 1.5} L ${cx - 12} ${cy - 3.5} L ${cx - 3.5} ${cy - 3.5} Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1" stroke-linejoin="round" />`;
        } else if (['➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↖️', '↙️', '▶️', '◀️', '▲', '▼', '◀', '▶'].includes(cell)) {
          let angle = 0;
          if (cell === '➡️' || cell === '▶️' || cell === '▶') angle = 0;
          else if (cell === '⬇️' || cell === '▼') angle = 90;
          else if (cell === '⬅️' || cell === '◀️' || cell === '◀') angle = 180;
          else if (cell === '⬆️' || cell === '▲') angle = 270;
          else if (cell === '↗️') angle = 315;
          else if (cell === '↘️') angle = 45;
          else if (cell === '↙️') angle = 135;
          else if (cell === '↖️') angle = 225;
          
          svg += `<g transform="rotate(${angle}, ${cx}, ${cy})">`;
          svg += `<path d="M ${cx - 10} ${cy - 3} L ${cx + 4} ${cy - 3} L ${cx + 1} ${cy - 8} L ${cx + 11} ${cy} L ${cx + 1} ${cy + 8} L ${cx + 4} ${cy + 3} L ${cx - 10} ${cy + 3} Z" fill="#818cf8" stroke="#6366f1" stroke-width="1" stroke-linejoin="round" />`;
          svg += `</g>`;
        } else {
          svg += `<text x="${cx}" y="${cy}" font-size="20" dominant-baseline="central" text-anchor="middle" fill="#ffffff" style="font-family:'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif; line-height:1;">${cell}</text>`;
        }
      }
    }
    
    svg += `</svg>`;
    return svg;
  }
  ```

- [ ] **Step 2: Modify `logic/js/games/spatial.js` with the identical implementation**
  Paste the exact same rendering engine in `spatial.js` to ensure module independence.

- [ ] **Step 3: Run the local tests**
  Verify that existing tests still compile and run correctly.
  Run: `node logic/js/test.js`
  Expected: Suite A and Suite B pass successfully.

- [ ] **Step 4: Commit the changes**
  Run:
  ```bash
  git add logic/js/games.js logic/js/games/spatial.js
  git commit -m "feat: implement SVG dynamic grid renderer in games.js and spatial.js"
  ```

---

### Task 2: Integrate Renderer in `pattern.js`

We need to wrap matrix cells and options in the pattern logic module with `renderOptionContent()` to fix alignment issues in matrix puzzles.

**Files:**
- Modify: `logic/js/games/pattern.js:55-60, 70-75`

- [ ] **Step 1: Wrap matrix grid cells in pattern.js**
  Find line 57 in `logic/js/games/pattern.js`:
  ```javascript
  ${i===8 ? '❓' : cell}
  ```
  And change it to:
  ```javascript
  ${i===8 ? '❓' : renderOptionContent(cell)}
  ```

- [ ] **Step 2: Wrap option choice items in pattern.js**
  Find line 71 in `logic/js/games/pattern.js`:
  ```javascript
  ${item.o}
  ```
  And change it to:
  ```javascript
  ${renderOptionContent(item.o)}
  ```

- [ ] **Step 3: Run the local tests**
  Verify everything compiles.
  Run: `node logic/js/test.js`
  Expected: Passed 10, Failed 0.

- [ ] **Step 4: Commit the changes**
  Run:
  ```bash
  git add logic/js/games/pattern.js
  git commit -m "feat: integrate renderOptionContent in pattern game logic"
  ```

---

### Task 3: Add Verification Tests to `test.js`

We will write unit tests specifically to verify that `renderOptionContent` correctly generates the expected SVG structures and does not corrupt plain text options.

**Files:**
- Modify: `logic/js/test.js:613-631` (at the bottom)

- [ ] **Step 1: Add Suite C tests at the end of `test.js`**
  Append a new test suite "Suite C: SVG Grid Renderer" in `logic/js/test.js` right before the report logging.

  Code to add:
  ```javascript
  // --- Running Test Suite C: SVG Grid Renderer ---
  console.log("\n--- Running Test Suite C: SVG Grid Renderer ---");
  let suiteCPassed = 0;
  let suiteCFailed = 0;
  
  function testC(name, fn) {
    try {
      fn();
      console.log(`  ✓ [PASS] ${name}`);
      suiteCPassed++;
    } catch (e) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error(e);
      suiteCFailed++;
    }
  }
  
  testC("Should ignore standard plain text", () => {
    const raw = "90°";
    const res = global.renderOptionContent(raw);
    assert.strictEqual(res, raw);
  });
  
  testC("Should render multi-line grid with expected SVG tags", () => {
    const grid = "⭐⬜\n⬜⭐";
    const res = global.renderOptionContent(grid);
    assert.ok(res.startsWith("<svg"));
    assert.ok(res.includes("viewBox=\"0 0 80 80\""));
    assert.ok(res.includes("<rect"));
    assert.ok(res.includes("<path")); // stars render as path
  });
  
  testC("Should render single-line grid with grid symbols", () => {
    const grid = "⬜⭐";
    const res = global.renderOptionContent(grid);
    assert.ok(res.startsWith("<svg"));
    assert.ok(res.includes("viewBox=\"0 0 80 40\""));
  });
  
  testC("Should fallback to centered text for normal emojis", () => {
    const grid = "🍊⬜";
    const res = global.renderOptionContent(grid);
    assert.ok(res.includes("dominant-baseline=\"central\""));
    assert.ok(res.includes("text-anchor=\"middle\""));
    assert.ok(res.includes("🍊"));
  });
  ```

  And update the final console logs report:
  ```javascript
  // --- CONSOLIDATED TEST REPORT ---
  const totalPassed = suiteAPassed + suiteBPassed + suiteCPassed;
  const totalFailed = suiteAFailed + suiteBFailed + suiteCFailed;
  console.log("\n==============================================");
  console.log(`🏆 FINAL TEST REPORT: Passed ${totalPassed}, Failed ${totalFailed}`);
  console.log("==============================================");
  ```

- [ ] **Step 2: Run the full test suite**
  Run: `node logic/js/test.js`
  Expected Output: Passed 14, Failed 0. Final Report includes Test Suite C.

- [ ] **Step 3: Commit the verification tests**
  Run:
  ```bash
  git add logic/js/test.js
  git commit -m "test: add verification tests for SVG grid renderer"
  ```
