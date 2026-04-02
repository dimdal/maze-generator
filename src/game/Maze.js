export class Maze {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.cells = [];
    this.solution = [];
    this.init();
  }

  init() {
    this.cells = [];
    for (let y = 0; y < this.h; y++) {
      const row = [];
      for (let x = 0; x < this.w; x++) {
        row.push({ n: true, e: true, s: true, w: true, v: false });
      }
      this.cells.push(row);
    }
  }

  generate() {
    this.init();
    const stack = [];
    let x = 0, y = 0;
    this.cells[y][x].v = true;
    let visited = 1;
    const total = this.w * this.h;

    while (visited < total) {
      const neighs = this.getUnvisitedNeighbors(x, y);
      if (neighs.length > 0) {
        const next = neighs[Math.floor(Math.random() * neighs.length)];
        stack.push({ x, y });
        this.carve(x, y, next.x, next.y);
        x = next.x;
        y = next.y;
        this.cells[y][x].v = true;
        visited++;
      } else if (stack.length > 0) {
        const prev = stack.pop();
        x = prev.x;
        y = prev.y;
      }
    }
  }

  getUnvisitedNeighbors(x, y) {
    const neighs = [];
    if (y > 0 && !this.cells[y - 1][x].v) neighs.push({ x, y: y - 1 });
    if (x < this.w - 1 && !this.cells[y][x + 1].v) neighs.push({ x: x + 1, y });
    if (y < this.h - 1 && !this.cells[y + 1][x].v) neighs.push({ x, y: y + 1 });
    if (x > 0 && !this.cells[y][x - 1].v) neighs.push({ x: x - 1, y });
    return neighs;
  }

  carve(x1, y1, x2, y2) {
    const c1 = this.cells[y1][x1];
    const c2 = this.cells[y2][x2];
    if (x2 === x1 + 1) { c1.e = false; c2.w = false; }
    else if (x2 === x1 - 1) { c1.w = false; c2.e = false; }
    else if (y2 === y1 + 1) { c1.s = false; c2.n = false; }
    else if (y2 === y1 - 1) { c1.n = false; c2.s = false; }
  }

  getCell(x, y) {
    return this.cells[y]?.[x];
  }

  canMove(x, y, dx, dy) {
    const cell = this.cells[y][x];
    if (dx === 1 && cell.e) return false;
    if (dx === -1 && cell.w) return false;
    if (dy === 1 && cell.s) return false;
    if (dy === -1 && cell.n) return false;
    return true;
  }

  solve() {
    const queue = [{ x: 0, y: 0 }];
    const visited = new Map([['0,0', null]]);
    let head = 0;

    while (head < queue.length) {
      const curr = queue[head++];
      if (curr.x === this.w - 1 && curr.y === this.h - 1) {
        const path = [];
        let key = `${curr.x},${curr.y}`;
        while (key) {
          const [cx, cy] = key.split(',').map(Number);
          path.unshift({ x: cx, y: cy });
          const parent = visited.get(key);
          key = parent ? `${parent.px},${parent.py}` : null;
        }
        this.solution = path;
        return;
      }

      const neighs = this.getOpenNeighbors(curr.x, curr.y);
      for (const n of neighs) {
        const key = `${n.x},${n.y}`;
        if (!visited.has(key)) {
          visited.set(key, { px: curr.x, py: curr.y });
          queue.push(n);
        }
      }
    }
    this.solution = [];
  }

  getOpenNeighbors(x, y) {
    const c = this.cells[y][x];
    const result = [];
    if (!c.n && y > 0) result.push({ x, y: y - 1 });
    if (!c.e && x < this.w - 1) result.push({ x: x + 1, y });
    if (!c.s && y < this.h - 1) result.push({ x, y: y + 1 });
    if (!c.w && x > 0) result.push({ x: x - 1, y });
    return result;
  }

  render(cellSize, options = {}) {
    const pad = Math.ceil(cellSize * 0.5);
    const w = this.w * cellSize + pad;
    const h = this.h * cellSize + pad;
    
    let svg = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
    svg += `<rect width="100%" height="100%" fill="#FFF8EE"/>`;
    svg += `<g stroke="#6B4423" stroke-width="2" fill="none">`;

    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = this.cells[y][x];
        const px = x * cellSize;
        const py = y * cellSize;
        if (c.n) svg += `<line x1="${px}" y1="${py}" x2="${px + cellSize}" y2="${py}"/>`;
        if (c.e) svg += `<line x1="${px + cellSize}" y1="${py}" x2="${px + cellSize}" y2="${py + cellSize}"/>`;
        if (c.s) svg += `<line x1="${px}" y1="${py + cellSize}" x2="${px + cellSize}" y2="${py + cellSize}"/>`;
        if (c.w) svg += `<line x1="${px}" y1="${py}" x2="${px}" y2="${py + cellSize}"/>`;
      }
    }
    svg += `</g>`;

    if (options.showSolution && this.solution.length > 1) {
      let d = `M${(this.solution[0].x + 0.5) * cellSize},${(this.solution[0].y + 0.5) * cellSize}`;
      for (let i = 1; i < this.solution.length; i++) {
        d += `L${(this.solution[i].x + 0.5) * cellSize},${(this.solution[i].y + 0.5) * cellSize}`;
      }
      svg += `<path d="${d}" stroke="#E84040" stroke-width="${Math.max(3, cellSize / 6)}" fill="none" stroke-dasharray="${cellSize / 3},${cellSize / 6}"/>`;
    }

    svg += this.renderStart(cellSize);
    svg += this.renderChest(cellSize);
    
    if (options.player) {
      svg += options.player.render(cellSize);
    }

    svg += `</svg>`;
    return svg;
  }

  renderStart(cellSize) {
    const ico = cellSize * 0.5;
    const off = (cellSize - ico) / 2;
    return `<rect x="${off}" y="${off}" width="${ico}" height="${ico}" fill="#228B22" rx="2"/>`;
  }

  renderChest(cellSize) {
    const cx = (this.w - 0.5) * cellSize;
    const cy = (this.h - 0.5) * cellSize;
    const size = cellSize * 1.2;
    return `<image href="${import.meta.env.BASE_URL}chestv2.png" x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>`;
  }
}
