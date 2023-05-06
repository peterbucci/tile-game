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
    this.clearGrid();
    this.createGridContainer();
    this.createGrid();
    this.createLayers();
    this.initializeHoverTile();
    this.registerInputListeners();
    this.listenForLayerUpdates();
  }

  createGridContainer() {
    const gridContainer = this.add.container(0, 0).setDepth(0);
    this.layers.push(gridContainer);
  }

  createGrid() {
    const { width, height } = this.scale;
    const columns = Math.ceil(width / this.gridSize);
    const rows = Math.ceil(height / this.gridSize);
    this.drawGrid(columns, rows);
  }

  createLayers() {
    const layersData = this.registry.get("layers");
    layersData.forEach((layerData: { id: number; name: string }) => {
      const layerContainer = this.createLayerContainer(
        layerData.id,
        layerData.name
      );
      this.layers.push(layerContainer);
    });
  }

  createLayerContainer(
    depth: number,
    name?: string
  ): Phaser.GameObjects.Container {
    const layerContainer = this.add.container(0, 0);
    layerContainer.setDepth(depth);
    if (name) layerContainer.name = name;
    return layerContainer;
  }

  initializeHoverTile() {
    const hoverContainer = this.createLayerContainer(this.layers.length + 1);
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      hoverContainer.removeAll(true);
      const tile = this.drawTile(pointer, hoverContainer, hoverContainer.depth);
      if (tile) tile.alpha = 0.5;
    });
  }

  registerInputListeners() {
    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer) => {
        const activeLayer = this.registry.get("activeLayer");
        const container = this.layers[activeLayer];
        const depth = activeLayer + 1;
        this.drawTile(pointer, container, depth);
      },
      this
    );
  }

  listenForLayerUpdates() {
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
    this.layers.forEach((layer: any) => {
      layer.removeAll(true);
    });
  }

  drawTile(pointer: Phaser.Input.Pointer, container: any, depth: number) {
    const { x, y } = getCoordinatesFromPointer(pointer, this.gridSize);

    const menuScene = this.scene.get("MenuScene") as MenuScene;
    const selectedTile = menuScene.getSelectedTile();

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
        .setDepth(depth);

      container.add(tile);
      return tile;
    }
  }
}
