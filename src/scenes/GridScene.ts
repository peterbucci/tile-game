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
    this.clearLayers();
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
    const hoverContainer = this.createLayerContainer(1000);
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      hoverContainer.removeAll(true);
      this.drawTiles(pointer, hoverContainer, hoverContainer.depth);
    });
  }

  registerInputListeners() {
    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer) => {
        const activeLayer = this.registry.get("activeLayer") + 1;
        const container = this.layers[activeLayer];
        const depth = activeLayer;
        this.drawTiles(pointer, container, depth);
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
      const activeLayer = this.registry.get("activeLayer");
      const removedLayer = this.layers.splice(activeLayer + 1, 1);
      removedLayer[0].destroy();
      const tiles = this.registry.get("placedTiles");
      const updatedTiles = tiles.filter((tile: any) => {
        return tile.layer !== activeLayer + 1;
      });
      this.registry.set("placedTiles", updatedTiles);
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
    // Clear layers
    this.clearLayers();
    // Draw grid
    const columns = Math.ceil(width / this.gridSize);
    const rows = Math.ceil(height / this.gridSize);
    this.drawGrid(columns, rows);
    // Draw placed tiles
    const tiles = this.registry.get("placedTiles");
    tiles.forEach((tile: any) => {
      this.drawTile(tile, this.layers[tile.layer]);
    });
  }

  clearLayers() {
    this.layers.forEach((layer: any) => {
      layer.removeAll(true);
    });
  }

  drawTile(
    tile: {
      gridX: number;
      gridY: number;
      sourceX: number;
      sourceY: number;
      width: number;
      height: number;
      tilesheet: any;
      layer: number;
    },
    container: any
  ) {
    const { gridX, gridY, sourceX, sourceY, width, height, tilesheet, layer } =
      tile;
    const tileToAdd = this.add
      .image(gridX, gridY, tilesheet)
      .setCrop(sourceX, sourceY, width, height)
      .setOrigin(0)
      .setDepth(layer);
    container.add(tileToAdd);
    return tileToAdd;
  }

  drawTiles(pointer: Phaser.Input.Pointer, container: any, depth: number) {
    const menuScene = this.scene.get("MenuScene") as MenuScene;
    const selectedTiles = menuScene.getSelectedTiles();
    const pointerEvent = pointer.event.type;

    if (selectedTiles) {
      for (const selectedTile of selectedTiles) {
        if (selectedTile && selectedTile.texture && menuScene.tilesheet) {
          const gridCoords = getCoordinatesFromPointer(pointer, this.gridSize);
          const x = gridCoords.x - menuScene.tilesheet.thisHighlightClick.x;
          const y = gridCoords.y - menuScene.tilesheet.thisHighlightClick.y;
          const tile = this.drawTile(
            {
              gridX: x,
              gridY: y,
              sourceX: selectedTile.x,
              sourceY: selectedTile.y,
              width: selectedTile.width,
              height: selectedTile.height,
              tilesheet: selectedTile.texture.key,
              layer: depth,
            },
            container
          );

          if (pointerEvent === "mousedown") {
            // Add the tile object to an array in the registry
            const tileData = {
              gridX: x,
              gridY: y,
              sourceX: selectedTile.x,
              sourceY: selectedTile.y,
              width: selectedTile.width,
              height: selectedTile.height,
              tilesheet: selectedTile.texture.key,
              layer: depth,
            };
            const placedTiles = this.registry.get("placedTiles") || [];
            placedTiles.push(tileData);
            this.registry.set("placedTiles", placedTiles);
          } else {
            tile.alpha = 0.5;
          }
        }
      }
    }
  }
}
