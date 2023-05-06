import Phaser from "phaser";
import { getCoordinatesFromPointer } from "../helpers/coordinates";
import MenuScene from "./MenuScene";

export default class MapScene extends Phaser.Scene {
  private gridSize = 48;
  private layers!: Phaser.GameObjects.Container[];

  constructor() {
    super("MapScene");
    this.layers = [];
  }

  create() {
    this.clearLayers();
    this.createLayers();
    this.initializeHoverTile();
    this.registerInputListeners();
    this.listenForLayerUpdates();
  }

  clearLayers() {
    this.layers.forEach((layer: any) => {
      layer.removeAll(true);
    });
  }

  createLayers() {
    const layersData = this.registry.get("layers");
    const createdLayers = layersData.map(
      (layerData: { id: string; name: string }, i: any) => {
        return this.createLayerContainer(i + 1, layerData.id);
      }
    );
    this.layers = createdLayers;
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
    const hoverContainer = this.createLayerContainer(1000, "hover");
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      hoverContainer.removeAll(true);
      this.drawTiles(pointer, hoverContainer, hoverContainer.depth);
    });
  }

  registerInputListeners() {
    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer) => {
        const activeLayer = this.registry.get("activeLayer");
        const container = this.layers.find((layer) => {
          return layer.name === activeLayer;
        });
        if (container) {
          const depth = container.depth;
          this.drawTiles(pointer, container, depth);
        }
      },
      this
    );
  }

  listenForLayerUpdates() {
    const eventEmitter = this.registry.get("eventEmitter");
    eventEmitter.on("updateLayers", this.updateLayers, this);
  }

  updateLayers(_: any, key: string, data: { id: string; name: string }) {
    if (key === "add") {
      // Draw layers
      const layerContainer = this.add.container(0, 0);
      layerContainer.name = data.id;
      layerContainer.setDepth(this.layers.length);
      this.layers.push(layerContainer);
    } else if (key === "remove") {
      // Remove layer
      const activeLayer = this.registry.get("activeLayer");
      this.layers = this.layers.filter((layer) => {
        if (layer.name === activeLayer) layer.destroy();
        return layer.name !== activeLayer;
      });
      const tiles = this.registry.get("placedTiles") ?? [];
      const updatedTiles = tiles.filter((tile: any) => {
        return tile.layer !== activeLayer;
      });
      this.registry.set("placedTiles", updatedTiles);
    }
  }

  resize() {
    const { width, height } = this.scale;
    // Clear layers
    this.clearLayers();
    // Draw placed tiles
    const tiles = this.registry.get("placedTiles") ?? [];
    tiles.forEach((tile: any) => {
      this.drawTile(
        tile,
        this.layers.find((layer) => layer.name === tile.layer)
      );
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
      depth: number;
    },
    container: any
  ) {
    const { gridX, gridY, sourceX, sourceY, width, height, tilesheet, depth } =
      tile;
    const tileToAdd = this.add
      .image(gridX, gridY, tilesheet)
      .setCrop(sourceX, sourceY, width, height)
      .setOrigin(0)
      .setDepth(depth);
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
              depth,
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
              layer: container.name,
              depth,
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
