import { UI } from '../components/UI.js';

export class Game {
  constructor({ mazeClass, playerClass, inventoryClass, uiClass }) {
    this.Maze = mazeClass;
    this.Player = playerClass;
    this.Inventory = inventoryClass;
    this.UI = uiClass;
    
    this.currentMaze = null;
    this.player = null;
    this.inventory = null;
    this.ui = null;
    
    this.currentLevel = 1;
    this.maxLevel = 1;
    this.playerMoves = 0;
    this.showSolution = false;
    this.shape = 'square';
  }

  init() {
    this.loadState();
    this.ui = new UI(this);
    this.inventory = new this.Inventory(this);
    this.player = new this.Player(this);
    this.ui.render();
    this.generate();
    this.bindEvents();
  }

  loadState() {
    this.currentLevel = parseInt(localStorage.getItem('ludwigMaxLevel') || '1');
    this.maxLevel = this.currentLevel;
  }

  saveState() {
    localStorage.setItem('ludwigMaxLevel', this.maxLevel.toString());
    this.inventory.save();
  }

  generate() {
    const size = this.getMazeSize();
    this.currentMaze = new this.Maze(size.w, size.h);
    this.currentMaze.generate();
    this.currentMaze.solve();
    this.player.reset();
    this.playerMoves = 0;
    this.ui.render();
  }

  getMazeSize() {
    const baseSizes = {
      easy: [10, 10, 35],
      medium: [16, 14, 25],
      hard: [24, 20, 18]
    };
    const base = baseSizes.easy;
    const levelBonus = (this.currentLevel - 1) * 2;
    let w = base[0] + levelBonus;
    let h = base[1] + Math.floor(levelBonus * 0.5);
    let cell = Math.max(15, base[2] - (this.currentLevel - 1) * 2);

    if (this.shape === 'portrait') {
      w = Math.floor(w * 0.65);
      h += 4;
    }

    return { w, h, cell };
  }

  handleMove(dx, dy) {
    if (!this.player.canMove(dx, dy, this.currentMaze)) return;
    
    this.player.move(dx, dy);
    this.playerMoves++;
    this.ui.updateMoves();
    this.ui.render();
    
    this.checkWin();
  }

  checkWin() {
    if (this.player.x === this.currentMaze.w - 1 && 
        this.player.y === this.currentMaze.h - 1) {
      this.ui.showCelebration(this.getScore());
    }
  }

  getScore() {
    const optimal = this.currentMaze.solution.length;
    let stars = 1;
    if (this.playerMoves <= optimal * 2.0) stars = 3;
    else if (this.playerMoves <= optimal * 3.0) stars = 2;
    return { stars, moves: this.playerMoves, optimal };
  }

  nextLevel() {
    this.currentLevel++;
    if (this.currentLevel > this.maxLevel) {
      this.maxLevel = this.currentLevel;
    }
    this.saveState();
    this.generate();
  }

  retryLevel() {
    this.generate();
  }

  toggleSolution() {
    this.showSolution = !this.showSolution;
    this.ui.render();
  }

  setShape(shape) {
    this.shape = shape;
    this.generate();
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') this.handleMove(0, -1);
      else if (e.key === 'ArrowDown') this.handleMove(0, 1);
      else if (e.key === 'ArrowLeft') this.handleMove(-1, 0);
      else if (e.key === 'ArrowRight') this.handleMove(1, 0);
    });

    document.getElementById('app').addEventListener('click', (e) => {
      const svg = e.target.closest('svg');
      if (!svg || !this.currentMaze) return;
      
      const rect = svg.getBoundingClientRect();
      const cellSize = this.getMazeSize().cell;
      const cellX = Math.floor((e.clientX - rect.left) / cellSize);
      const cellY = Math.floor((e.clientY - rect.top) / cellSize);
      
      if (cellX < 0 || cellX >= this.currentMaze.w || 
          cellY < 0 || cellY >= this.currentMaze.h) return;
      
      const dx = cellX - this.player.x;
      const dy = cellY - this.player.y;
      
      if (Math.abs(dx) + Math.abs(dy) === 1) {
        this.handleMove(dx, dy);
      }
    });
  }
}
