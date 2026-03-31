# Maze Generator - Printable Themed Mazes

## Concept & Vision

A maze generator that produces high-quality, printable mazes with gaming themes (Warcraft, Heroes of the Storm). The experience feels like opening a game manual or strategy guide - polished, thematic, and exciting for kids. Mazes are always solvable via recursive backtracking or similar guaranteed-solution algorithms.

## Design Language

### Aesthetic Direction
Game manual/strategy guide aesthetic - parchment textures, dramatic borders, glowing accents reminiscent of Blizzard games' UI.

### Color Palettes

**Warcraft Theme:**
- Primary: `#C4A000` (gold trim)
- Secondary: `#1A1A2E` (dark navy)
- Accent: `#E84040` (blood red)
- Background: `#2D2D44` (slate)
- Walls: `#8B7355` (wooden brown)

**Heroes of the Storm Theme:**
- Primary: `#0078F0` (Nexus blue)
- Secondary: `#1A1A2E` (dark)
- Accent: `#F0A000` (gold energy)
- Background: `#0D1117` (void black)
- Walls: `#2D3748` (steel blue)

**Fantasy Default:**
- Primary: `#6B4423` (leather brown)
- Secondary: `#F5E6C8` (parchment)
- Accent: `#8B0000` (deep red)
- Background: `#F5E6C8` (parchment)
- Walls: `#3D2914` (dark wood)

### Typography
- Headings: `Cinzel Decorative` (epic fantasy feel)
- Body/UI: `Cinzel` for labels, `Arial` for small text
- Fallback: Georgia, serif

### Spatial System
- Page: A4 (210×297mm) or Letter (8.5×11")
- Margins: 15mm all sides
- Maze area: Max 180×250mm (leaving room for header/footer)
- Cell sizes: Easy=30px, Medium=20px, Hard=12px

### Motion Philosophy
N/A - Static print output

### Visual Assets
- Corner decorations (SVG flourishes per theme)
- Entrance: Gate/portal icon
- Exit: Treasure/flag icon
- Optional: Character silhouette near entrance
- Border patterns matching game UI style

## Layout & Structure

### Screen Layout (generator UI)
```
┌─────────────────────────────────────────┐
│  [Theme Selector]  [Difficulty]  [Size] │
│  [Algorithm]      [Variation]           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │         MAZE PREVIEW            │   │
│  │         (SVG Canvas)            │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Generate New]  [Print]  [Show Solution]│
└─────────────────────────────────────────┘
```

### Print Layout
- Theme header with game title/logo styling
- Centered maze with decorative border
- Footer: "Find the path from entrance to exit!"
- NO UI controls visible

## Features & Interactions

### Core Features

1. **Maze Generation Algorithms**
   - Recursive Backtracking (classic, winding corridors)
   - Prim's Algorithm (more loops, less linear)
   - Kruskal's Algorithm (random-looking, multiple paths)
   - Eller's Algorithm (row-by-row, unique style)

2. **Maze Variations**
   - Square Grid (standard)
   - Rectangular (more interesting aspect ratio)
   - "Labyrinth" (very few dead ends, long winding path)

3. **Difficulty Levels**
   - Easy: 10×10 grid, large cells, simple paths
   - Medium: 20×15 grid, medium complexity
   - Hard: 30×20 grid, many dead ends, complex

4. **Theming**
   - Warcraft: Gold/red UI, angular Blizzard-style borders
   - Heroes of the Storm: Blue energy, Nexus-inspired
   - Fantasy Default: Parchment, medieval book style

5. **Print Functionality**
   - Print button opens native print dialog
   - CSS `@media print` hides all UI
   - High-contrast black walls on white background for print

6. **Solution Toggle**
   - "Show Solution" button reveals the correct path
   - Solution drawn as dashed line through maze
   - Hidden by default (answer key mode)

### Interactions
- **Generate**: Creates new maze with current settings
- **Print**: Opens print dialog with maze only
- **Show Solution**: Toggles red dashed path overlay
- **Theme/Difficulty/Size Change**: Auto-generates new maze

### Edge Cases
- Minimum maze size: 5×5
- Maximum maze size: 50×40
- Always ensures entrance (top-left) and exit (bottom-right) are accessible

## Component Inventory

### Theme Selector (Dropdown)
- Options: Warcraft, Heroes of the Storm, Fantasy Default
- Each option styled with theme preview swatch
- States: default, hover (highlight), focus (outline)

### Difficulty Selector (Radio/Segmented)
- Easy / Medium / Hard
- Visual indicator of grid size
- States: unselected, selected (filled), hover

### Algorithm Selector (Dropdown)
- Recursive Backtracking (default)
- Prim's Algorithm
- Kruskal's Algorithm
- Eller's Algorithm

### Variation Selector (Radio)
- Standard Square
- Rectangle
- Labyrinth (few dead ends)

### Generate Button
- Primary action styling
- Hover: slight glow/brighten
- Active: pressed effect
- Loading: subtle pulse while generating

### Print Button
- Secondary styling (outline)
- Icon: printer emoji or SVG

### Show Solution Toggle
- Checkbox or button
- When ON: shows solution path
- When OFF: clean maze (no solution visible)

### Maze Display (SVG Canvas)
- Renders current maze as vector
- Responsive container (max-width)
- Print: exact dimensions, no scaling issues

### Corner Decorations (SVG)
- Theme-specific flourishes
- Positioned at maze corners
- Print: included in output

## Technical Approach

### Stack
- **Vanilla HTML/CSS/JavaScript** - no build step, maximum portability
- **SVG for maze rendering** - crisp at any print resolution
- **CSS Custom Properties** - easy theming via variables

### Architecture
```
index.html
├── Inline CSS (theme variables, print styles)
├── SVG Defs (reusable patterns, decorations)
└── JavaScript
    ├── MazeGenerator class
    │   ├── generate() - runs algorithm
    │   ├── toSVG() - renders to SVG
    │   └── getSolution() - returns path array
    ├── ThemeManager
    │   ├── applyTheme(name)
    │   └── themeConfigs{}
    └── App
        ├── init()
        ├── bindEvents()
        └── print()
```

### Maze Data Structure
```javascript
{
  width: 20,      // cells horizontal
  height: 15,     // cells vertical
  cells: [        // 2D array
    [{n: true, e: true, s: false, w: true}, ...],
    ...
  ],
  entrance: {x: 0, y: 0},
  exit: {x: 19, y: 14}
}
```

### Print Implementation
- `@media print` CSS hides `.controls`, `.ui-container`
- `@page` sets size to A4 or Letter
- SVG uses `width/height` in mm for accurate sizing
- Colors invert: white background, black walls

### Algorithms (all guarantee solvable)

**Recursive Backtracking:**
1. Start at (0,0), mark visited
2. While unvisited cells: pick random unvisited neighbor, carve passage, recurse
3. Backtrack when stuck until maze complete

**Prim's:**
1. Start with all walls
2. Pick random cell, add to "in maze" set
3. While cells remain outside: add random wall touching maze, if other side unvisited, carve passage
4. Results in more loops and shorter dead ends

**Kruskal's:**
1. Each cell separate set
2. Pick random wall, if cells on either side different sets, remove wall and union sets
3. Continue until one set

### Assets
- Google Fonts: Cinzel Decorative, Cinzel
- All decorative elements as inline SVG (no external dependencies)
- Icons: inline SVG (printer, wand/treasure)
