import Phaser from "phaser";
import { getCoordinatesFromPointer } from "../helpers/coordinates";
import { createLayer, deleteLayer } from "../helpers/layerHelpers";

export default class MenuScene extends Phaser.Scene {
  private menuOpen: boolean;
  private sidebarContainer!: Phaser.GameObjects.Container;
  private sidebar!: Phaser.GameObjects.Rectangle;
  private menuButton!: Phaser.GameObjects.Text;
  private tileSize!: number;
  private tilesheetData!: { name: string; filename: string };
  private sidebarWidth!: number;
  private tilesheet?: Phaser.GameObjects.Image;
  private thisHighlightClick!: Phaser.GameObjects.Rectangle;
  private thisHighlightHover!: Phaser.GameObjects.Rectangle;

  constructor() {
    super("MenuScene");
    this.menuOpen = true;
  }

  preload() {
    const tilesheets = this.registry.get("tilesheets");
    const selectedTilesheet = this.registry.get("selectedTilesheet");
    const tilesheetWidth = this.registry.get("tilesheetWidth");
    this.tileSize = this.registry.get("tileSize");
    this.tilesheetData = tilesheets[selectedTilesheet];
    this.sidebarWidth = tilesheetWidth * this.tileSize;

    tilesheets.forEach((tilesheet: { name: string; filename: string }) => {
      const { name, filename } = tilesheet;
      this.load.image(`tilesheet-${name}`, `/assets/tilesheets/${filename}`);
    });
  }

  create() {
    const { height } = this.scale;

    this.sidebarContainer = this.add.container(-this.sidebarWidth, 0);
    this.sidebar = this.add
      .rectangle(0, 0, this.sidebarWidth, height, 0x111111)
      .setOrigin(0)
      .setDepth(1); // Set sidebar depth to 1

    this.menuButton = this.add
      .text(this.sidebarWidth + 10, 10, "Menu", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive({
        useHandCursor: true,
      })
      .setDepth(2); // Set menu button depth to 2

    this.sidebarContainer.add([this.sidebar, this.menuButton]);
    this.drawSelectedTilesheet();

    this.menuButton.on("pointerdown", this.toggleMenu, this);

    // Add event listener for window resize
    window.addEventListener("resize", () => {
      this.resizeSidebar();
    });

    const addLayerButton = this.add
      .text(this.sidebarWidth + 10, 50, "Add Layer", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive({
        useHandCursor: true,
      })
      .setDepth(2);

    addLayerButton.on("pointerdown", this.createLayer, this);

    const deleteLayerButton = this.add
      .text(this.sidebarWidth + 10, 90, "Delete Layer", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive({
        useHandCursor: true,
      })
      .setDepth(2);

    deleteLayerButton.on("pointerdown", this.deleteLayer, this);

    const switchLayerButton = this.add
      .text(this.sidebarWidth + 10, 130, "Switch Layer", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive({
        useHandCursor: true,
      })
      .setDepth(2);

    switchLayerButton.on("pointerdown", () => {
      const layers = this.registry.get("layers");
      const activeLayer = this.registry.get("activeLayer");
      const newIndex = (activeLayer + 1) % layers.length;
      this.setActiveLayer(newIndex);
    });
  }

  shutdown() {
    // Remove event listener for window resize
    window.removeEventListener("resize", () => {
      this.resizeSidebar();
    });
  }

  drawSelectedTilesheet() {
    const tilesheetKey = `tilesheet-${this.tilesheetData.name}`;

    if (this.tilesheet) {
      this.tilesheet.destroy();
    }

    this.tilesheet = this.add
      .image(0, 0, tilesheetKey)
      .setOrigin(0)
      .setCrop(0, 0, this.sidebarWidth, this.sidebar.height)
      .setDepth(1) // Set tilesheet depth to 1
      .setInteractive({
        hitArea: new Phaser.Geom.Rectangle(
          0,
          0,
          this.sidebarWidth,
          this.sidebar.height
        ),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        draggable: true,
        useHandCursor: true,
      });

    this.sidebarContainer.add(this.tilesheet);

    // Add click event listener for the tilesheet
    this.tilesheet.on("pointerdown", this.drawHighlightClickRectangle, this);
    this.tilesheet.on("pointerover", this.drawHighlightHoverRectangle, this);
    this.tilesheet.on("pointermove", this.drawHighlightHoverRectangle, this);
    this.tilesheet.on("pointerout", () => {
      this.thisHighlightHover.visible = false;
    });
  }

  toggleMenu() {
    const targetX = this.menuOpen ? 0 : -this.sidebarWidth;

    this.tweens.add({
      targets: this.sidebarContainer,
      x: targetX,
      duration: 300,
      ease: Phaser.Math.Easing.Quadratic.Out,
    });

    this.menuOpen = !this.menuOpen;
  }

  resizeSidebar() {
    const { height } = this.scale;
    this.sidebar.setSize(this.sidebarWidth, height);
    if (this.tilesheet) {
      this.tilesheet.setCrop(0, 0, this.sidebarWidth, this.sidebar.height);
    }
  }

  drawHighlightClickRectangle(pointer: Phaser.Input.Pointer) {
    const { x, y } = getCoordinatesFromPointer(pointer, this.tileSize);
    if (!this.thisHighlightClick) {
      this.thisHighlightClick = this.add
        .rectangle(x, y, this.tileSize, this.tileSize)
        .setStrokeStyle(2, 0xff0000);
      this.sidebarContainer.add(this.thisHighlightClick);
    } else {
      this.thisHighlightClick.setPosition(x, y);
    }
  }
  drawHighlightHoverRectangle(pointer: Phaser.Input.Pointer) {
    const { x, y } = getCoordinatesFromPointer(pointer, this.tileSize);
    if (!this.thisHighlightHover) {
      this.thisHighlightHover = this.add
        .rectangle(x, y, this.tileSize, this.tileSize)
        .setFillStyle(0xff0000, 0.5);
      this.sidebarContainer.add(this.thisHighlightHover);
    } else {
      this.thisHighlightHover.visible = true;
      this.thisHighlightHover.setPosition(x, y);
    }
  }
  createLayer() {
    const eventEmitter = this.registry.get("eventEmitter");
    const layers = this.registry.get("layers");
    const updatedLayers = createLayer(layers);
    this.registry.set("layers", updatedLayers);
    this.setActiveLayer(updatedLayers.length - 1);
    eventEmitter.emit("updateLayers", this, "add", updatedLayers.slice(-1)[0]);
  }

  deleteLayer() {
    const eventEmitter = this.registry.get("eventEmitter");
    const layers = this.registry.get("layers");
    const activeLayer = this.registry.get("activeLayer");
    const deletedLayer = layers[activeLayer];

    const updatedLayers = deleteLayer(layers, activeLayer);
    this.registry.set("layers", updatedLayers);

    const newIndex = activeLayer === 0 ? 0 : activeLayer - 1;
    this.setActiveLayer(newIndex);
    eventEmitter.emit("updateLayers", this, "remove", deletedLayer);
  }

  setActiveLayer(index: number) {
    this.registry.set("activeLayer", index);
  }
}
