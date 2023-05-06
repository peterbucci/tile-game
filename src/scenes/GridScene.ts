import Phaser from "phaser";

export default class GridScene extends Phaser.Scene {
  private gridSize = 48;

  constructor() {
    super("GridScene");
  }

  create() {
    this.createGridContainer();
    this.createGrid();
    this.scene.launch("MapScene");
  }

  createGridContainer() {
    const gridContainer = this.add.container(0, 0).setDepth(0);
    this.registry.set("gridContainer", gridContainer);
  }

  createGrid() {
    const { width, height } = this.scale;
    const columns = Math.ceil(width / this.gridSize);
    const rows = Math.ceil(height / this.gridSize);
    this.drawGrid(columns, rows);
  }

  drawGrid(columns: number, rows: number) {
    const gridContainer = this.registry.get("gridContainer");
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        // Calculate grid element position
        const x = j * this.gridSize;
        const y = i * this.gridSize;
        // Draw grid element
        const rect = this.add
          .rectangle(x, y, this.gridSize, this.gridSize, 0xcccccc)
          .setOrigin(0);
        rect.setStrokeStyle(1, 0x000000);
        rect.setDepth(0); // Set grid elements depth to 0
        // Add grid element to grid container
        gridContainer.add(rect);
      }
    }
  }

  resize() {
    const { width, height } = this.scale;
    // Clear grid container
    const gridContainer = this.registry.get("gridContainer");
    gridContainer.removeAll(true);
    // Draw grid
    const columns = Math.ceil(width / this.gridSize);
    const rows = Math.ceil(height / this.gridSize);
    this.drawGrid(columns, rows);
  }
}
