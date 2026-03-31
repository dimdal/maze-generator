---
title: "feat: Add enemies with HP and weapon combat"
type: feat
status: completed
date: 2026-03-30
origin: docs/brainstorms/2026-03-30-ludwig-personalized-maze-requirements.md
revised: 2026-03-30
---

# Add Enemies with HP and Weapon Combat

## Overview

Add combat-capable enemies to the maze that spawn along the solution path. Player has HP (hearts) and attacks with spacebar (facing direction) or by clicking adjacent enemies. Enemies appear only on levels 4+ and spawn in limited numbers along the path. PC/Mac is the primary platform.

## Problem Frame

Ludwig's maze needs more challenge and engagement. Current system has no enemies or combat. Adding enemies with HP tracking and weapon attacks creates gameplay depth while maintaining child-friendly presentation.

## Requirements Trace

- Existing: R13-R21 (interactive solving, movement, win detection)
- This plan: Combat enemies, HP system, weapon activation (spacebar + click)

## Scope Boundaries

- Enemies spawn only on path cells (not in walls)
- No enemy AI movement — enemies are stationary hazards
- No player death state — HP depletes but game continues (child-friendly)
- Weapon is always available (no weapon inventory needed)

## Key Technical Decisions

- **Enemy placement**: Along solution path, min 3 cells from start/exit, min 3 cells between enemies
- **HP display**: Heart icons (❤️/🖤) — simple for children
- **Platform**: PC/Mac (keyboard primary input)
- **Attack input**: Spacebar attacks in facing direction (last movement). Click adjacent enemy also works.
- **Contact model**: Walking into enemy = lose 1 HP, enemy removed, player stays on enemy's cell (no knockback)
- **HP at zero**: Reset to 3 hearts, lose 1 star from final rating
- **HP on new level**: Always reset to 3
- **Facing direction**: Track last movement direction. Show directional indicator on player circle.
- **Enemy HP bar**: Visible HP pips below each enemy emoji
- **Attack animation**: Sword swing (⚔️) emoji overlay on target cell, 300ms
- **Minotaur feedback**: Visual change after first hit (emoji stays, HP bar updates, 💢 indicator)
- **Kill stat**: Track `enemyKills` per level, persist total to localStorage, show in celebration

## Implementation Units

- [x] **Unit 1: Enemy data model and spawning**

**Goal:** Define enemy types and spawn logic

**Requirements:** Enemies on levels 4+, random type along path, limited count, safe spacing

**Files:**
- Modify: `index.html`

**Approach:**
- Define ENEMY_TYPES array with name, emoji icon, hp
- Calculate spawn count: `min(3, Math.floor(level / 4))`
- Select random path cells from solution, excluding:
  - First 3 cells of solution path (near start)
  - Last 3 cells of solution path (near exit)
  - Cells within 3 path-steps of another enemy
- Store enemies array: `currentMaze.enemies = [{x, y, type, icon, hp, maxHp}, ...]`
- Clear enemies in `generate()` and reset `playerHP = 3`

**Technical design:**
```javascript
const ENEMY_TYPES = [
  { type: 'skeleton', name: 'Skjelett', icon: '💀', hp: 1, maxHp: 1 },
  { type: 'ghost', name: 'Spøkelse', icon: '👻', hp: 1, maxHp: 1 },
  { type: 'minotaur', name: 'Minotaur', icon: '🐂', hp: 2, maxHp: 2 },
  { type: 'bees', name: 'Bier', icon: '🐝', hp: 1, maxHp: 1 }
];

function spawnEnemies(maze, level) {
  if (level < 4) return [];
  const count = Math.min(3, Math.floor(level / 4));
  const path = maze.solution;
  // Eligible cells: indices 3 to path.length-4
  const eligible = path.slice(3, -3);
  // Shuffle, pick N with min 3-cell spacing
  // ...
}
```

**Test scenarios:**
- Level 3: no enemies spawned
- Level 4: 1 enemy, not within 3 cells of start/exit
- Level 8: 2 enemies, min 3 cells apart on path
- Level 12+: 3 enemies max
- Portrait mode (fewer path cells): still spawns correctly

**Verification:** Enemies appear only on eligible path cells, spacing rules respected

---

- [x] **Unit 2: HP system with heart display**

**Goal:** Player has HP that depletes on enemy contact

**Requirements:** Visual HP indicator, damage on contact, soft penalty at 0 HP

**Files:**
- Modify: `index.html`

**Approach:**
- Add `let playerHP = 3` and `let hpPenalty = 0` globals
- Add `<div id="hp-display">` between level-display and moves
- Render hearts: `❤️`.repeat(playerHP) + `🖤`.repeat(3-playerHP)
- CSS: font-size 1.5rem, centered, with brief scale animation on damage
- When HP reaches 0: reset to 3, increment `hpPenalty`
- Star rating modified: `if (hpPenalty > 0) stars = Math.max(1, stars - hpPenalty)`
- HP resets to 3 in `generate()` (new level, retry, regenerate)

**Technical design:**
```javascript
let playerHP = 3;
let hpPenalty = 0;

function updateHPDisplay() {
  const el = document.getElementById('hp-display');
  if (el) el.textContent = '❤️'.repeat(playerHP) + '🖤'.repeat(3 - playerHP);
}
```

**Test scenarios:**
- Player starts with 3 hearts displayed
- Taking damage: 3→2 hearts, display updates
- HP reaches 0: resets to 3, hpPenalty increments
- Celebration: star rating reduced by hpPenalty
- New level: HP and hpPenalty reset

**Verification:** Hearts display correctly, HP decrements on contact, star penalty works

---

- [x] **Unit 3: Attack system (spacebar + click)**

**Goal:** Player can attack adjacent enemies with spacebar (primary) or click

**Requirements:** Spacebar attacks in facing direction. Click on adjacent enemy also attacks. Sword swing overlay animation.

**Files:**
- Modify: `index.html`

**Approach — facing direction:**
- Add `let playerFacing = {dx: 1, dy: 0}` (default: right)
- Update in `handleMove()`: `playerFacing = {dx, dy}` on each move
- Render facing indicator on player circle: small triangle/arrow pointing in facing direction

**Approach — spacebar attack:**
- On spacebar: calculate target cell = `(playerX + playerFacing.dx, playerY + playerFacing.dy)`
- If enemy at target cell → `attackEnemy(targetX, targetY)`
- Show ⚔️ sword swing emoji overlay on target cell for 300ms
- 300ms cooldown to prevent spam

**Approach — click attack (secondary):**
- Modify click handler: if adjacent cell has enemy → `attackEnemy()` instead of move
- This is a convenience — spacebar is the primary attack input

**Attack logic:**
- Find enemy at target cell in `currentMaze.enemies`
- Decrement enemy.hp
- Show ⚔️ overlay animation on target cell (absolute-positioned div, 300ms fadeout)
- If enemy.hp <= 0: remove from enemies array, increment `enemyKills`
- Show notification: "💀 Beseiret!" on kill, "💥 Treff!" on hit (multi-HP enemy)
- Render current to update enemy HP bar

**Technical design:**
```javascript
let playerFacing = { dx: 1, dy: 0 };
let enemyKills = 0;
let totalEnemyKills = parseInt(localStorage.getItem('ludwigTotalKills') || '0');

function attackEnemy(cellX, cellY) {
  const enemies = currentMaze.enemies;
  const idx = enemies.findIndex(e => e.x === cellX && e.y === cellY);
  if (idx === -1) return false;
  showSwordSwing(cellX, cellY); // ⚔️ overlay at cell position
  enemies[idx].hp--;
  if (enemies[idx].hp <= 0) {
    enemies.splice(idx, 1);
    enemyKills++;
    totalEnemyKills++;
    localStorage.setItem('ludwigTotalKills', totalEnemyKills);
    showNotification('💀 Beseiret!');
  } else {
    showNotification('💥 Treff!');
  }
  renderCurrent();
  return true;
}

function showSwordSwing(cellX, cellY) {
  // Create ⚔️ overlay positioned over the target SVG cell
  // Absolute-positioned div, fades out over 300ms
  const svg = document.querySelector('#maze-container svg');
  const rect = svg.getBoundingClientRect();
  const overlay = document.createElement('div');
  overlay.textContent = '⚔️';
  overlay.style.cssText = `position:fixed;font-size:${currentCellSize}px;
    left:${rect.left + cellX * currentCellSize}px;
    top:${rect.top + cellY * currentCellSize}px;
    pointer-events:none;z-index:100;
    animation:sword-swing 0.3s ease-out forwards;`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 300);
}
```

**Modified click handler:**
```javascript
// In maze-container click handler:
if (Math.abs(dx) + Math.abs(dy) === 1) {
  const hasEnemy = currentMaze.enemies?.some(e => e.x === cellX && e.y === cellY);
  if (hasEnemy) {
    attackEnemy(cellX, cellY);
  } else {
    handleMove(dx, dy);
  }
}
```

**Spacebar handler:**
```javascript
// In keydown handler, add:
if (e.key === ' ') {
  e.preventDefault();
  const targetX = playerX + playerFacing.dx;
  const targetY = playerY + playerFacing.dy;
  if (targetX >= 0 && targetX < currentMaze.w && targetY >= 0 && targetY < currentMaze.h) {
    attackEnemy(targetX, targetY);
  }
}
```

**Test scenarios:**
- Spacebar attacks cell in facing direction
- Click adjacent enemy → attacks enemy
- Click adjacent empty cell → moves (unchanged)
- Minotaur (2 HP): spacebar twice to kill, shows "Treff!" then "Beseiret!"
- ⚔️ overlay appears briefly on target cell
- 300ms cooldown prevents rapid spam
- `enemyKills` counter increments on kill
- `totalEnemyKills` persisted to localStorage

**Verification:** Spacebar attack works with facing direction. Click attack works as secondary. Sword swing animation visible.

---

- [x] **Unit 4: Enemy rendering in SVG maze**

**Goal:** Enemies visually appear in the maze

**Requirements:** Show enemy emoji on path cells, visible HP bar below each enemy, damaged minotaur feedback

**Files:**
- Modify: `index.html` (inside `Maze.render()`)

**Approach:**
- In render(): iterate `this.enemies`, draw:
  1. Enemy emoji centered on cell using `<text>` SVG element (70% cell size)
  2. HP bar below emoji: small rectangles showing remaining HP pips
  3. 💢 indicator on damaged multi-HP enemies
- Player renders on top of enemies (z-order: walls → enemies → breadcrumbs → player)
- Also render facing indicator on player: small triangle pointing in `playerFacing` direction

**Technical design:**
```javascript
// In render(), after breadcrumbs, before player:
if (this.enemies) {
  for (const e of this.enemies) {
    const ex = (e.x + 0.5) * cellSize;
    const ey = (e.y + 0.5) * cellSize;
    const fontSize = cellSize * 0.7;
    // Enemy emoji
    svg += `<text x="${ex}" y="${ey}" font-size="${fontSize}" text-anchor="middle" dominant-baseline="central">${e.icon}</text>`;
    // HP bar: small pips below enemy
    const barWidth = cellSize * 0.6;
    const pipWidth = barWidth / e.maxHp;
    const barX = ex - barWidth / 2;
    const barY = ey + fontSize * 0.4;
    for (let i = 0; i < e.maxHp; i++) {
      const color = i < e.hp ? '#E84040' : '#666';
      svg += `<rect x="${barX + i * pipWidth}" y="${barY}" width="${pipWidth - 1}" height="${cellSize * 0.08}" fill="${color}" rx="1"/>`;
    }
    // Damage indicator for hit multi-HP enemies
    if (e.hp < e.maxHp && e.hp > 0) {
      svg += `<text x="${ex + fontSize*0.35}" y="${ey - fontSize*0.35}" font-size="${fontSize*0.35}" text-anchor="middle">💢</text>`;
    }
  }
}

// Facing indicator on player (small triangle)
if (showPlayer) {
  // ... existing player circle ...
  const arrowSize = ico * 0.3;
  const ax = (playerX + 0.5) * cellSize + playerFacing.dx * ico * 0.5;
  const ay = (playerY + 0.5) * cellSize + playerFacing.dy * ico * 0.5;
  svg += `<circle cx="${ax}" cy="${ay}" r="${arrowSize}" fill="white" opacity="0.8"/>`;
}
```

**Test scenarios:**
- Enemy emoji appears on correct path cell
- HP bar shows below each enemy (1 pip for skeleton, 2 for minotaur)
- Damaged minotaur: 1 red pip + 1 grey pip + 💢 indicator
- Player has small white dot showing facing direction
- Multiple enemies render correctly
- Enemies don't appear on levels 1-3

**Verification:** Enemies visible with HP bars, minotaur shows damage state, player facing visible

---

- [x] **Unit 5: Enemy collision in handleMove()**

**Goal:** Integrate HP damage with movement

**Requirements:** Moving into enemy cell deals damage and removes enemy. No knockback.

**Files:**
- Modify: `index.html`

**Approach:**
- In `handleMove()`: after position update, check for enemy at new (playerX, playerY)
- If enemy present: `playerHP--`, remove enemy, show damage feedback
- If playerHP reaches 0: reset to 3, increment hpPenalty, show "Ai!" notification
- Player stays on the cell (enemy is removed, path is now clear)
- Show brief red border flash on maze-box (200ms)
- Update HP display

**Integration with potion teleport:**
- In `usePotion()`: filter enemy cells from valid teleport destinations
- When selecting the target cell, skip any cell in `currentMaze.enemies`

**Technical design:**
```javascript
// In handleMove(), after playerX += dx; playerY += dy;
const enemyIdx = currentMaze.enemies.findIndex(e => e.x === playerX && e.y === playerY);
if (enemyIdx !== -1) {
  currentMaze.enemies.splice(enemyIdx, 1);
  playerHP--;
  updateHPDisplay();
  if (playerHP <= 0) {
    playerHP = 3;
    hpPenalty++;
    showNotification('Ai! Hjerter tilbake!');
  } else {
    showNotification('Au! -1 ❤️');
  }
  updateHPDisplay();
}
```

**Test scenarios:**
- Walk into enemy: HP decreases, enemy removed, player on that cell
- Walk into enemy at 1 HP: HP resets to 3, hpPenalty++
- Potion teleport to enemy cell: handled (damage or filtered)
- Breadcrumb on enemy cell: breadcrumb drops normally at pre-move cell

**Verification:** Contact triggers damage, enemy removed, HP display updates

---

- [x] **Unit 6: HP UI component**

**Goal:** Add HP display to game UI

**Requirements:** Show hearts above maze, update on damage, animate loss

**Files:**
- Modify: `index.html` (HTML structure + CSS)

**Approach:**
- Add `<div id="hp-display">` between level-display and moves divs
- CSS: text-align center, font-size 1.5rem, color #6B4423, margin-bottom 4px
- Add CSS keyframe `@keyframes heart-shake` for damage feedback
- On damage: briefly add `.damaged` class to hp-display (shake animation, 300ms)
- Hidden on levels 1-3 (no enemies = no HP display needed)

**Technical design:**
```css
#hp-display {
  text-align: center;
  font-size: 1.5rem;
  color: #6B4423;
  margin-bottom: 4px;
}
#hp-display.damaged {
  animation: heart-shake 0.3s ease-out;
}
@keyframes heart-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```

**Test scenarios:**
- Levels 1-3: HP display hidden
- Level 4+: HP display shows 3 hearts
- Damage: heart disappears with shake animation
- HP reset: all 3 hearts restored

**Verification:** Hearts display clearly, animate on damage, hidden pre-level-4

## System-Wide Impact

- **State:** New `playerHP`, `hpPenalty`, `playerFacing`, `enemyKills`, `totalEnemyKills`, `enemies[]`
- **Render:** Enemies + HP bars added to SVG. Facing indicator on player circle.
- **Movement:** `handleMove()` updates `playerFacing`, checks enemy collision after position update
- **Input:** Spacebar attacks in facing direction. Click branches: enemy → attack, empty → move.
- **Items:** `usePotion()` filters enemy cells from teleport destinations
- **Celebration:** Star rating reduced by `hpPenalty`. Shows "Du beseiret N monstre!" if kills > 0.
- **Generate:** Resets `playerHP=3`, `hpPenalty=0`, `enemyKills=0`, calls `spawnEnemies()`
- **localStorage:** `ludwigTotalKills` persisted across sessions
- **UI:** HP display element added (hidden on levels 1-3), sword swing CSS animation

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Enemies blocking essential path | Removed on contact (1 HP loss), or attackable via tap |
| Combat too hard for child | No death, HP resets at 0, enemies are 1-2 HP, soft star penalty only |
| Performance with many enemies | Max 3 enemies, simple emoji rendering via SVG `<text>` |
| Player misses with spacebar | Facing indicator shows direction; click also works as fallback |
| Two enemies adjacent on path | Min 3-cell spacing rule in spawn logic |
| Potion lands on enemy | Filter enemy cells from teleport destinations |
| Minotaur unclear after 1 hit | 💢 damage indicator shows it's been hit |

## Interaction Matrix (item × enemy)

| Item/Action | Enemy interaction |
|-------------|-------------------|
| Walk into enemy | Lose 1 HP, enemy removed, player lands on cell |
| Tap/click enemy | Attack: enemy.hp--, removed at 0 hp |
| Spacebar near enemy | Attack nearest adjacent enemy |
| Potion teleport | Enemy cells excluded from destinations |
| Bread (breadcrumbs) | Breadcrumb drops at pre-move cell as normal |
| Magnetflaske (hint) | Hint direction unchanged, no enemy warning |
| Solution overlay | Shows path through enemy cells (enemies visible on path) |

## Documentation / Operational Notes

- Enemy types use emoji for simplicity (no image assets needed)
- Levels 1-3 remain enemy-free for new player onboarding
- HP display hidden on levels 1-3
- Attack animation uses CSS + brief ⚔️ emoji overlay (no sprites needed)
- Primary input: spacebar (facing direction). Secondary: click adjacent enemy cell.
- Enemies are avoidable by detouring off the solution path (intended — keeps it child-friendly)

## Resolved Decisions

- **Kill stat:** Yes — track `enemyKills` per level, `totalEnemyKills` in localStorage. Show in celebration.
- **Enemy HP bar:** Yes — visible pips below each enemy emoji in SVG.
- **Attack animation:** Sword swing ⚔️ emoji overlay on target cell, 300ms.
- **Minotaur feedback:** 💢 indicator + HP bar shows 1/2 pips filled after first hit.
- **Platform:** PC/Mac primary. Spacebar attack with facing direction.

## Unresolved Questions

- Should magnetflaske hint warn about enemies? ("Gå nordover, men pass deg!")
- `@keyframes sword-swing` CSS: scale up + rotate + fadeout? Or simpler opacity fade?

## Explicitly Deferred

- Enemy behavior differentiation (ghost moves, bees poison, etc.) — separate plan if wanted after v1 ships
