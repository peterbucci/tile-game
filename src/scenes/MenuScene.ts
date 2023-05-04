import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  private menuOpen: boolean;
  private sidebarContainer!: Phaser.GameObjects.Container;
  private sidebar!: Phaser.GameObjects.Rectangle;
  private menuButton!: Phaser.GameObjects.Text;
  private tilesheet?: Phaser.GameObjects.Image;
  private gridSize = 48;

  constructor() {
    super("MenuScene");
    this.menuOpen = false;
  }

  preload() {
    const tilesheets = this.registry.get("tilesheets");

    tilesheets.forEach((tilesheet: { name: string; filename: string }) => {
      const { name, filename } = tilesheet;
      this.load.image(`tilesheet-${name}`, `/assets/tilesheets/${filename}`);
    });
  }

  create() {
    const { height } = this.scale;

    this.sidebarContainer = this.add.container(-(4 * this.gridSize), 0);
    this.sidebar = this.add
      .rectangle(0, 0, 4 * this.gridSize, height, 0x111111)
      .setOrigin(0);
    this.sidebar.setDepth(1); // Set sidebar depth to 1

    this.menuButton = this.add
      .text(4 * this.gridSize + 10, 10, "Menu", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive();
    this.menuButton.setDepth(2); // Set menu button depth to 1

    this.sidebarContainer.add([this.sidebar, this.menuButton]);
    this.drawSelectedTilesheet();

    this.menuButton.on("pointerdown", this.toggleMenu, this);
    this.menuButton.on("pointerover", this.toggleHoverCursor, this);
    this.menuButton.on("pointerout", this.toggleHoverCursor, this);
  }

  drawSelectedTilesheet() {
    const tilesheets = this.registry.get("tilesheets");
    const selectedTilesheet = this.registry.get("selectedTilesheet");
    const tilesheetKey = `tilesheet-${tilesheets[selectedTilesheet].name}`;

    if (this.tilesheet) {
      this.tilesheet.destroy();
    }

    this.tilesheet = this.add.image(0, 0, tilesheetKey).setOrigin(0);
    this.tilesheet.setCrop(0, 0, 4 * this.gridSize, this.sidebar.height);
    this.tilesheet.setDepth(1); // Set the depth higher than the sidebar

    this.sidebarContainer.add(this.tilesheet);
  }

  toggleHoverCursor() {
    const style = document.body.style;
    style.cursor === "pointer"
      ? (style.cursor = "default")
      : (style.cursor = "pointer");
  }

  toggleMenu() {
    const targetX = this.menuOpen ? 0 : -(4 * this.gridSize);

    this.tweens.add({
      targets: this.sidebarContainer,
      x: targetX,
      duration: 300,
      ease: Phaser.Math.Easing.Quadratic.Out,
    });

    this.menuOpen = !this.menuOpen;
  }
}
