export class UI {
  constructor(game) {
    this.game = game;
    this.app = document.getElementById('app');
  }

  render() {
    const { w, h, cell } = this.game.getMazeSize();
    const mazeOptions = {
      showSolution: this.game.showSolution,
      player: this.game.player
    };

    this.app.innerHTML = `
      <div class="container">
        <h1>Ludwigs labyrint</h1>
        
        <div class="controls">
          <div class="control-group">
            <label>Form</label>
            <div class="radio-group">
              <label>
                <input type="radio" name="shape" value="square" ${this.game.shape === 'square' ? 'checked' : ''}>
                <span>Kvadrat</span>
              </label>
              <label>
                <input type="radio" name="shape" value="portrait" ${this.game.shape === 'portrait' ? 'checked' : ''}>
                <span>Portrett</span>
              </label>
            </div>
          </div>
        </div>

        <div class="maze-box">
          <h2 class="maze-title">Ludwigs labyrint</h2>
          <div id="level-display">Nivå ${this.game.currentLevel} (Beste: ${this.game.maxLevel})</div>
          <div id="moves">Trekk: ${this.game.playerMoves}</div>
          <div id="maze-container">
            ${this.game.currentMaze.render(cell, mazeOptions)}
          </div>
        </div>

        <div class="inventory" id="inventory">
          ${this.renderInventorySlots()}
        </div>

        <div class="actions">
          <button class="btn btn-primary" id="generate">Generer</button>
          <button class="btn btn-secondary" id="print">Skriv ut</button>
          <button class="btn btn-solution ${this.game.showSolution ? 'active' : ''}" id="solution">
            ${this.game.showSolution ? 'Skjul løsning' : 'Vis løsning'}
          </button>
        </div>
      </div>
    `;

    this.bindUIEvents();
  }

  renderInventorySlots() {
    let html = '';
    for (let i = 0; i < 3; i++) {
      const item = this.game.inventory.items[i];
      if (item) {
        const icon = item.icon.endsWith('.png') 
          ? `<img src="/${item.icon}" style="width:40px;height:40px;object-fit:contain;">`
          : `<span style="font-size:2rem">${item.icon}</span>`;
        html += `
          <div class="inventory-slot" data-slot="${i}">
            <span class="item-icon">${icon}</span>
            <span class="item-name">${item.name}</span>
          </div>
        `;
      } else {
        html += `<div class="inventory-slot empty"><span class="item-name"></span></div>`;
      }
    }
    return html;
  }

  updateMoves() {
    const el = document.getElementById('moves');
    if (el) el.textContent = `Trekk: ${this.game.playerMoves}`;
  }

  bindUIEvents() {
    document.getElementById('generate')?.addEventListener('click', () => this.game.generate());
    document.getElementById('print')?.addEventListener('click', () => window.print());
    document.getElementById('solution')?.addEventListener('click', () => {
      this.game.toggleSolution();
      this.render();
    });

    document.querySelectorAll('input[name="shape"]').forEach(r => {
      r.addEventListener('change', (e) => this.game.setShape(e.target.value));
    });

    document.querySelectorAll('.inventory-slot[data-slot]').forEach(slot => {
      slot.addEventListener('click', () => {
        this.game.inventory.use(parseInt(slot.dataset.slot));
        this.render();
      });
    });
  }

  showCelebration(score) {
    const messages = { 3: 'Bra jobba!', 2: 'Godt forsøk!', 1: 'Løsning funnet!' };
    const lootPool = [
      { type: 'bread', name: 'Brød', icon: '🍞' },
      { type: 'bottle', name: 'Magnetflaske', icon: '🧪' },
      { type: 'potion', name: 'Porsjon', icon: 'potion_small.png' }
    ];
    const newItem = lootPool[Math.floor(Math.random() * lootPool.length)];
    const addedItem = this.game.inventory.add(newItem);
    const lootIcon = newItem.icon.endsWith('.png')
      ? `<img src="/${newItem.icon}" style="width:32px;height:32px;object-fit:contain;vertical-align:middle;">`
      : newItem.icon;

    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    // Note: innerHTML used with hardcoded loot pool values only (no user input)
    overlay.innerHTML = `
      <div class="celebration-content">
        <div class="celebration-title">${messages[score.stars]}</div>
        <div class="celebration-stars">${'⭐'.repeat(score.stars)}</div>
        <div>Trekk: ${score.moves}</div>
        ${addedItem
          ? `<div class="celebration-loot">Du fant: <span class="celebration-loot-item">${lootIcon} ${newItem.name}</span></div>`
          : '<div style="margin-top:8px;color:#E84040;">Inventaret er fullt!</div>'}
        <div style="margin-top:12px;font-size:1.2rem;">Nivå ${this.game.currentLevel} fullført!</div>
        <div style="margin-top:8px;">
          <button class="btn btn-primary nextlevel-btn" style="margin-right:8px;">Neste nivå</button>
          <button class="btn btn-secondary retry-btn">Prøv igjen</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    for (let i = 0; i < 30; i++) {
      const conf = document.createElement('div');
      conf.className = 'confetti';
      conf.style.left = Math.random() * 100 + 'vw';
      conf.style.background = ['#C4A000', '#E84040', '#228B22', '#0078F0'][Math.floor(Math.random() * 4)];
      conf.style.animationDelay = Math.random() * 2 + 's';
      document.body.appendChild(conf);
    }

    overlay.addEventListener('click', (e) => {
      if (e.target.classList.contains('nextlevel-btn')) {
        overlay.remove();
        document.querySelectorAll('.confetti').forEach(c => c.remove());
        this.game.nextLevel();
      } else if (e.target.classList.contains('retry-btn')) {
        overlay.remove();
        document.querySelectorAll('.confetti').forEach(c => c.remove());
        this.game.retryLevel();
      }
    });
  }
}
