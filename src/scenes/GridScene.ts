import Phaser from "phaser";
import { getCoordinatesFromPointer } from "../helpers/coordinates";
import MenuScene from "./MenuScene";

export default class GridScene extends Phaser.Scene {
  private gridSize = 48;
  private layers!: Phaser.GameObjects.Container[];

  constructor() {
    super("GridScene");
    this.layers = [];
  }

  create() {
    const { width, height } = this.scale;
    // Draw grid container
    const gridContainer = this.add.container(0, 0).setDepth(0);

    this.layers.push(gridContainer);
    // Draw grid
    const columns = Math.ceil(width / this.gridSize);
    const rows = Math.ceil(height / this.gridSize);
    this.drawGrid(columns, rows);
    // Draw layers
    const layersData = this.registry.get("layers");
    layersData.forEach((layerData: { id: number; name: string }) => {
      const layerContainer = this.add.container(0, 0);
      layerContainer.setDepth(layerData.id);
      this.layers.push(layerContainer);
    });
    // Listen for pointer events
    this.input.on("pointerdown", this.handleGridClick, this);
    // Listen for layer updates
    const eventEmitter = this.registry.get("eventEmitter");
    eventEmitter.on("updateLayers", this.updateLayers, this);
  }

  updateLayers(_: any, key: string, data: { id: number; name: string }) {
    if (key === "add") {
      // Draw layers
      const layerContainer = this.add.container(0, 0);
      layerContainer.name = data.name;
      layerContainer.setDepth(data.id);
      this.layers.push(layerContainer);
    } else if (key === "remove") {
      // Remove layer
      this.layers = this.layers.filter((layer: any) => {
        if (layer.name === data.name) {
          layer.destroy();
        }
        return layer.name !== data.name;
      });
    }
  }

  drawGrid(columns: number, rows: number) {
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
        this.layers[0].add(rect);
      }
    }
  }

  resize() {
    const { width, height } = this.scale;
    // Clear grid
    this.clearGrid();
    // Draw grid
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

  handleGridClick(pointer: Phaser.Input.Pointer) {
    const { x, y } = getCoordinatesFromPointer(pointer, this.gridSize);

    const menuScene = this.scene.get("MenuScene") as MenuScene;
    const selectedTile = menuScene.getSelectedTile();
    const selectedLayerIndex = menuScene.getActiveLayerIndex();

    if (selectedTile && selectedTile.texture) {
      const tile = this.add
        .image(
          x - (selectedTile.x ?? 0),
          y - (selectedTile.y ?? 0),
          selectedTile.texture.key
        )
        .setCrop(
          selectedTile.x,
          selectedTile.y,
          selectedTile.width,
          selectedTile.height
        )
        .setOrigin(0)
        .setDepth(selectedLayerIndex + 1);

      this.layers[selectedLayerIndex + 1].add(tile);
    }
  }
}
