import Phaser from "phaser";
import Tilesheet from "../gameObjects/Tilesheet";
import LayerDropdown from "../gameObjects/LayerDropdown";

export default class MenuScene extends Phaser.Scene {
  private menuOpen: boolean;
  private sidebarContainer!: Phaser.GameObjects.Container;
  private sidebar!: Phaser.GameObjects.Rectangle;
  private menuButton!: Phaser.GameObjects.Text;
  private tileSize!: number;
  private tilesheetData!: { name: string; filename: string };
  private sidebarWidth!: number;
  private tilesheet?: Tilesheet;
  private layerDropdown!: LayerDropdown;

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
    const { width, height } = this.scale;

    this.sidebarContainer = this.add.container(-this.sidebarWidth, 0);
    this.sidebar = this.add
      .rectangle(0, 0, this.sidebarWidth, height, 0x111111)
      .setOrigin(0)
      .setDepth(1);

    this.menuButton = this.add
      .text(this.sidebarWidth + 10, 10, "Menu", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive({
        useHandCursor: true,
      })
      .setDepth(2);

    this.sidebarContainer.add([this.sidebar, this.menuButton]);
    this.drawSelectedTilesheet();

    this.menuButton.on("pointerdown", this.toggleMenu, this);

    // Initialize the LayerDropdown
    this.layerDropdown = new LayerDropdown(this, width, 10);
    this.add.existing(this.layerDropdown);
  }

  drawSelectedTilesheet() {
    if (this.tilesheet) this.tilesheet.destroy();

    this.tilesheet = new Tilesheet(
      this.sidebarContainer,
      this,
      0,
      0,
      `tilesheet-${this.tilesheetData.name}`,
      this.sidebarWidth,
      this.sidebar.height,
      this.tileSize
    );

    this.sidebarContainer.add(this.tilesheet);
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

  resize() {
    this.resizeSidebar();
  }

  getSelectedTile() {
    if (this.tilesheet) {
      const tileData = this.tilesheet.getSelectedTile();
      return {
        ...tileData,
      };
    }
    return null;
  }

  getActiveLayerIndex() {
    return this.layerDropdown.getActiveLayerIndex();
  }
}
