export class Player {
  constructor(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
  }

  reset() {
    this.x = 0;
    this.y = 0;
  }

  canMove(dx, dy, maze) {
    return maze.canMove(this.x, this.y, dx, dy);
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  render(cellSize) {
    const px = (this.x + 0.5) * cellSize;
    const py = (this.y + 0.5) * cellSize;
    const size = cellSize * 1.2;
    return `<image href="${import.meta.env.BASE_URL}warrior.png" x="${px - size / 2}" y="${py - size / 2}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>`;
  }
}
