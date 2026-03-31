---
date: 2026-03-30
topic: ludwig-personalized-maze
---

# Ludwig-personalized Maze Generator

## Problem Frame

A 7-year-old Norwegian boy named Ludwig wants to print and solve mazes. The current maze generator has too many options that confuse him, lacks any personalization, and doesn't feel "made for him." The goal is a simple, delightful experience where Ludwig immediately sees "Ludwigs labyrint" and knows it's his.

## Requirements

**Personalization**
- R1. Maze title always shows "Ludwigs labyrint"
- R2. No name input field needed - hardcoded for simplicity

**Interface Simplification**
- R3. Show only Difficulty (Easy/Medium/Hard) and Shape (Square/Portrait) controls
- R4. Hide Theme and Algorithm selectors from Ludwig's view
- R5. Buttons are large, clear, and easy to tap/click for a child

**Interaction**
- R6. Maze generates automatically on page load (no extra click needed)
- R7. Changing difficulty or shape triggers new maze generation immediately
- R8. "Vis løsning" button toggles the solution path
- R9. "Skriv ut" button opens browser print dialog with maze-only output

**Interactive Solving (On-Screen)**
- R13. Player can solve maze on screen instead of (or in addition to) printing
- R14. Touch support: tap adjacent cell to move (iPad-friendly)
- R15. Mouse support: click adjacent cell to move
- R16. Keyboard support: arrow keys to move
- R17. Current player position highlighted visually (distinct color, larger marker)
- R18. Win detection: when player reaches exit cell, trigger celebration
- R19. Player starts at entrance (top-left), must reach exit (bottom-right)
- R20. Invalid moves (into walls) are ignored with no error - smooth experience
- R21. Move counter displayed during play and shown in final score

**Celebration & Scoring**
- R22. On maze completion, trigger celebration sequence: confetti/sparkle CSS animation, message "Løsning funnet!", chest opening animation, loot reveal
- R23. Display final score with star rating (1-3 stars based on moves vs optimal path)
- R24. Option to "Prøv igjen" (try again) with same settings for better score
- R25. Star rating: 3 stars = optimal moves ±20%, 2 stars = optimal ×1.5, 1 star = completed

**Loot System**
- R26. Exit cell contains a treasure chest (visual indicator)
- R27. On completing maze, chest "opens" and reveals random loot item
- R28. Loot pool: sword, shield, potion, gem, crown, dragon egg, magic wand, golden key (8 items)
- R29. Collected loot shown in a simple inventory display after completion
- R30. Loot is cosmetic/reward only - no gameplay effect needed

**Child-Friendly UX**
- R31. All interactive elements minimum 48px touch target
- R32. Button text minimum 16px font size
- R33. Default difficulty is Easy (10x10 grid, 35px cells)

## Success Criteria

- Ludwig opens the page and immediately sees "Ludwigs labyrint"
- Default maze is Easy: 10×10 grid, 35px cells (large enough to color/walk)
- All controls labeled in Norwegian: Lett/Middels/Vanskelig, Kvadrat/Portrett, Vis løsning, Skriv ut
- Touch targets ≥48px for easy tapping
- One tap changes settings and generates new maze
- Ludwig can solve maze by tapping/clicking cells or using arrow keys
- Completing maze triggers: celebration animation, star rating, random loot reveal
- Treasure chest visible at maze exit

## Scope Boundaries

- Hardcoded name - no name editing by user
- No sound effects
- Keep existing themes (fantasy/warcraft/heroes) in code but not exposed in Ludwig's simplified UI
- Celebration should be exciting but appropriate for a 7-year-old (no scary effects)
- Loot is cosmetic only - no inventory management or gameplay impact

## Key Decisions

- Simplified UI is Ludwig-specific but could be extended with a "advanced mode" toggle later
- Auto-generate on any setting change removes unnecessary tap for a child
- Keep Norwegian language throughout (matches existing app)

## Dependencies / Assumptions

- Existing maze algorithms and rendering are solid - no changes needed there
- CSS can handle making buttons larger without breaking print styles

## Outstanding Questions

None - all decisions made during brainstorm.

## Next Steps

→ `/ce:plan` for structured implementation planning
