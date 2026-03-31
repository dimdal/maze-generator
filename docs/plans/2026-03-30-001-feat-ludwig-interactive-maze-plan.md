---
title: feat: Ludwig-personalized interactive maze
type: feat
status: completed
date: 2026-03-30
origin: docs/brainstorms/2026-03-30-ludwig-personalized-maze-requirements.md
---

# Ludwig-personalized Interactive Maze

## Overview

Transform the maze generator into a personalized, interactive experience for 7-year-old Ludwig. Add on-screen solving with touch/mouse/keyboard, treasure chest loot at exit, celebration animations, and star rating. Simplify UI to difficulty + shape controls only, with "Ludwigs labyrint" as the permanent title.

## Problem Frame

Ludwig (age 7) wants a maze that feels "made for him" and can be solved on screen or printed. Current maze generator has too many options, no personalization, and no interactive solving mode.

## Requirements Trace

- R1. Maze title always shows "Ludwigs labyrint"
- R3. Show only Difficulty and Shape controls
- R5. Buttons are large (≥48px touch targets, ≥16px font)
- R6. Maze generates automatically on page load
- R7. Changing difficulty/shape triggers new maze immediately
- R13. Player can solve maze on screen
- R14-R16. Touch, mouse, keyboard support for movement
- R17. Current player position highlighted visually
- R18. Win detection triggers celebration
- R21. Move counter displayed during play
- R22. Celebration: confetti/sparkle animation, message, chest opening, loot reveal
- R23. Star rating based on moves vs optimal
- R24. "Prøv igjen" button to retry with same settings
- R26. Treasure chest at maze exit (visual indicator)
- R27. Chest opens on completion, reveals random loot
- R28. Loot pool: sword, shield, potion, gem, crown, dragon egg, magic wand, golden key
- R29. Collected loot shown in inventory display after completion

## Scope Boundaries

- Single HTML file (index.html) modification only
- No backend, no persistence, no sound
- Celebration must be CSS-based (no canvas/WebGL)
- Loot is cosmetic - no inventory management

## Context & Research

### Relevant Code and Patterns

- `index.html` - single file, vanilla JS, SVG rendering (lines 115-246)
- Maze class: `init()`, `generate()`, `solve()`, `render()` methods
- Cell structure: `{ n: true, e: true, s: true, w: true, v: false }` (walls + visited)
- State: `showSol`, `currentMaze`, `currentCellSize`, `currentTheme` globals
- Solve returns `this.solution = [{x,y}, ...]` via BFS

### External References

- CSS confetti via `@keyframes` animations (pure CSS, no libraries)
- SVG click/touch handling via coordinate-to-cell conversion

## Key Technical Decisions

- **Player state tracked separately**: `{ px: 0, py: 0 }` added alongside maze data, not modifying it
- **Movement validation**: Check wall flags on current cell before allowing move in any direction
- **Click/tap handling**: Convert click coordinates to cell via `Math.floor(coord / cellSize)`, validate adjacency to player position
- **Click debouncing**: Add 100ms debounce on movement to prevent double-moves on slow tap devices
- **Keyboard handling**: Arrow keys map to N/E/S/W moves after wall validation; call `e.preventDefault()` to stop page scroll
- **Win detection**: When `playerX === maze.w-1 && playerY === maze.h-1`, trigger celebration
- **Optimal path length**: Use `maze.solution.length` from BFS as baseline for star rating
- **Star thresholds (child-friendly)**: 3 stars = moves ≤ optimal × 2.0, 2 stars = moves ≤ optimal × 3.0, 1 star = completed (loosened for 7-year-old)
- **Encouraging messages**: Show "Bra jobba!" for 3 stars, "Godt forsøk!" for 2 stars, "Løsning funnet!" for 1 star
- **Loot selection**: `LOOT_ITEMS[Math.floor(Math.random() * LOOT_ITEMS.length)]`
- **Treasure chest**: Replace exit `<circle>` with inline SVG chest shape at same coordinates

## Open Questions

### Resolved During Planning

- **How to handle touch on iPad**: Use `click` event on SVG - works for both mouse and touch uniformly. Touch-friendly via 48px+ cell sizes on easy mode.

### Deferred to Implementation

- Exact confetti animation style (CSS keyframes vs SVG animate)
- Chest SVG icon design (simple geometric or detailed)
- Loot item visual representation (emoji? SVG icons?)

## High-Level Technical Design

```
User clicks/taps/arrows
       │
       ▼
Convert to cell coords
       │
       ▼
Adjacent to player? ─No──► Ignore
       │Yes
       ▼
Wall blocks move? ─Yes──► Ignore
       │No
       ▼
Move player, increment counter
       │
       ▼
At exit cell? ─No──► Continue
       │Yes
       ▼
Trigger celebration overlay
       │
       ├── Show "Løsning funnet!"
       ├── Confetti animation
       ├── Calculate stars
       ├── Reveal random loot
       └── Show "Prøv igjen" button
```

## Implementation Units

- [ ] **Unit 1: UI Simplification & Personalization**

**Goal:** Simplify controls for child-friendly use, hardcode Ludwig's name

**Requirements:** R1, R3, R5, R6, R7

**Dependencies:** None

**Files:**
- Modify: `index.html`

**Approach:**
- Remove theme selector dropdown and algorithm dropdown from DOM (keep in JS for future toggle)
- Remove subtitle or make it empty
- Change `<h1>` text to "Ludwigs labyrint" (hardcoded)
- Increase button sizes: padding 12px→16px, font-size 16px min
- Increase radio button labels to 48px min touch targets
- Change generate button behavior: attach to `change` events on difficulty/shape radios
- Remove explicit "Generate" button from UI (or keep for "New maze" functionality only)

**Patterns to follow:**
- Existing CSS class patterns for `.controls`, `.radio-group`
- Existing button styling with `.btn`

**Test scenarios:**
- Happy path: Page loads and immediately shows "Ludwigs labyrint" with a generated maze
- Happy path: Changing difficulty auto-generates new maze
- Happy path: Changing shape auto-generates new maze
- Edge case: All controls hidden except difficulty and shape

**Verification:**
- Title shows "Ludwigs labyrint" without any user interaction
- No scrolling needed to see full maze on 1024px screen

- [ ] **Unit 2: Interactive Player Movement**

**Goal:** Allow Ludwig to solve maze on screen via click, tap, or arrow keys

**Requirements:** R13, R14, R15, R16, R17, R20

**Dependencies:** Unit 1

**Files:**
- Modify: `index.html`

**Approach:**
- Add `playerX`, `playerY` state (starts at 0, 0)
- Add move counter `playerMoves = 0`
- Modify `render()` to accept optional player position, render player marker if provided
- Add `handleMove(dx, dy)` function: check wall, update position, re-render
- Add SVG click handler: get click coords, convert to cell, if adjacent to player → call handleMove
- Add keyboard handler: `keydown` listener for ArrowUp/Down/Left/Right → call handleMove with appropriate dx/dy
- Render player as colored circle/avatar at player position (distinct from start square marker)

**Patterns to follow:**
- Existing `neighbors()` function for wall checking
- Existing BFS `solve()` for understanding cell adjacency

**Test scenarios:**
- Happy path: Click cell to right of player → player moves right if no wall
- Happy path: Press right arrow → player moves right if no wall
- Edge case: Click non-adjacent cell → nothing happens
- Edge case: Click cell with wall between → nothing happens
- Edge case: Press arrow into wall → nothing happens
- Edge case: Arrow keys work after clicking anywhere on page (no focus trap)

**Verification:**
- Player can navigate from start to any adjacent open cell via click
- Player can navigate via arrow keys
- Invalid moves are silently ignored (no errors in console)

- [ ] **Unit 3: Treasure Chest & Win Detection**

**Goal:** Replace exit marker with treasure chest, detect when player reaches exit

**Requirements:** R18, R26

**Dependencies:** Unit 2

**Files:**
- Modify: `index.html`

**Approach:**
- Define `CHEST_SVG` constant with inline SVG chest shape
- Modify `render()`: when rendering exit cell, use CHEST_SVG instead of `<circle>`
- Add `checkWin()`: if playerX === maze.w-1 && playerY === maze.h-1 → return true
- Modify `handleMove()`: after successful move, call `checkWin()`. If true, trigger `showCelebration()`

**Patterns to follow:**
- Existing SVG rendering in `render()` method
- Existing exit coordinate calculation `(this.w - 0.5) * cellSize`

**Test scenarios:**
- Happy path: Player reaches exit cell → celebration triggers
- Edge case: Solution path calculated but player takes different route → still wins when reaching exit

**Verification:**
- Treasure chest visible at maze exit from game start
- Reaching exit cell triggers celebration sequence

- [ ] **Unit 4: Move Counter & Star Rating**

**Goal:** Display moves during play, compute star rating on completion

**Requirements:** R21, R23, R25

**Dependencies:** Unit 3

**Files:**
- Modify: `index.html`

**Approach:**
- Add move display element in UI (e.g., `<div id="moves">Trekk: 0</div>`)
- Update move display in `handleMove()` after each successful move
- Add `calculateStars(moves, optimal)`:
  - if moves <= optimal * 1.2 → return 3
  - if moves <= optimal * 1.5 → return 2
  - return 1
- Store optimal path length: `maze.solution.length`
- Pass stars to `showCelebration()`

**Patterns to follow:**
- Existing `currentMaze.solve()` call to compute solution

**Test scenarios:**
- Happy path: Move counter increments on each valid move
- Edge case: Move counter starts at 0
- Calculation: 3 stars when moves ≤ optimal × 2.0
- Calculation: 2 stars when moves ≤ optimal × 3.0
- Calculation: 1 star when completed
- Edge case: calculateStars(0, 0) returns 3 (handles trivial maze)

**Verification:**
- Move counter visible during gameplay
- Star rating appears in celebration overlay

- [ ] **Unit 5: Celebration & Loot System**

**Goal:** Show victory overlay with confetti, loot reveal, and retry option

**Requirements:** R22, R24, R27, R28, R29

**Dependencies:** Unit 4

**Files:**
- Modify: `index.html`

**Approach:**
- Define `LOOT_ITEMS` array: ['sword', 'shield', 'potion', 'gem', 'crown', 'dragon egg', 'magic wand', 'golden key']
- Define `STAR_SVGS` for 1-3 star display
- Add `showCelebration(moves, stars, lootItem)` function:
  - Create overlay `<div>` with position:fixed, full screen, semi-transparent bg
  - Add encouraging message based on stars ("Bra jobba!" / "Godt forsøk!" / "Løsning funnet!")
  - Add star display (SVG stars)
  - Add "Trekk: X" moves summary
  - Add loot reveal with item name and simple icon (emoji or SVG)
  - Add "Prøv igjen" button that calls `resetForRetry()`
- Add CSS keyframe confetti animation (colored squares falling from top)
- Add `resetForRetry()`: hide overlay, reset playerX/Y to 0, reset moves, re-render maze (keep same settings)
- Add CSS for overlay (centered content, celebratory colors - gold/red)

**Patterns to follow:**
- Existing button styling `.btn`
- Existing overlay pattern in print CSS (position:fixed)

**Test scenarios:**
- Happy path: Celebration overlay appears on maze completion
- Happy path: Loot shows random item from pool each completion
- Happy path: "Prøv igjen" resets and starts new maze with same settings
- Edge case: Multiple completions give different loot items

**Verification:**
- Confetti animation visible and celebratory
- Loot item name is readable
- "Prøv igjen" button resets game state correctly
- Celebration overlay hidden via `@media print { .celebration-overlay { display: none; } }`

## System-Wide Impact

- **Print behavior unchanged**: Player marker, move counter, and celebration overlay are not visible in print (same as controls - hidden via `@media print`)
- **Existing solve() behavior**: Still works as before - solution path display (show solution) is independent of player movement
- **No external API changes**: Single HTML file, no network requests

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Confetti animation causes performance issues on older iPads | Use CSS animations (GPU-accelerated), limit particle count to ~30 |
| Click coordinate calculation wrong for responsive SVG | SVG uses viewBox + width/height attributes, use viewBox coordinates directly |
| Touch and mouse conflict | `click` event fires for both - no special touch handling needed |

## Documentation / Operational Notes

- No documentation updates needed (single-user local tool)
- No deployment changes (static HTML file)
