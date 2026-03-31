import './styles/main.css';
import { Game } from './game/Game.js';
import { Maze } from './game/Maze.js';
import { Player } from './game/Player.js';
import { Inventory } from './game/Inventory.js';
import { UI } from './components/UI.js';

const game = new Game({
  mazeClass: Maze,
  playerClass: Player,
  inventoryClass: Inventory,
  uiClass: UI
});

game.init();
