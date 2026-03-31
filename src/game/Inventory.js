export class Inventory {
  constructor(game) {
    this.game = game;
    this.items = [];
    this.load();
  }

  load() {
    this.items = JSON.parse(localStorage.getItem('ludwigInventory') || '[]');
  }

  save() {
    localStorage.setItem('ludwigInventory', JSON.stringify(this.items));
  }

  add(item) {
    if (this.items.length >= 3) return false;
    this.items.push(item);
    this.save();
    return true;
  }

  remove(index) {
    if (index >= this.items.length) return;
    this.items.splice(index, 1);
    this.save();
  }

  use(index) {
    if (index >= this.items.length) return;
    const item = this.items[index];
    this.remove(index);
    return item;
  }
}
