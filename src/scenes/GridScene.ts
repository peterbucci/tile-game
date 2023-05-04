import Phaser from "phaser";

export default class GridScene extends Phaser.Scene {
  private gridSize = 48;

  constructor() {
    super("GridScene");
  }

  create() {
    const { width, height } = this.scale;

    const columns = Math.ceil(width / this.gridSize);
    const rows = Math.ceil(height / this.gridSize);

    this.drawGrid(columns, rows);
  }

  drawGrid(columns: number, rows: number) {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const x = j * this.gridSize;
        const y = i * this.gridSize;

        const rect = this.add
          .rectangle(x, y, this.gridSize, this.gridSize, 0xcccccc)
          .setOrigin(0);
        rect.setStrokeStyle(1, 0x000000);
        rect.setDepth(0); // Set grid elements depth to 0
      }
    }
  }

  resize(width: number, height: number) {
    this.clearGrid();
    const columns = Math.ceil(width / this.gridSize);
    const rows = Math.ceil(height / this.gridSize);
    this.drawGrid(columns, rows);
  }

  clearGrid() {
    this.children.each((child) => {
      if (child instanceof Phaser.GameObjects.Rectangle) {
        child.destroy();
      }
    });
  }
}
