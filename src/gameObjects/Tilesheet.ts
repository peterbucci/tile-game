import Phaser from "phaser";
import { getCoordinatesFromPointer } from "../helpers/coordinates";

export default class Tilesheet extends Phaser.GameObjects.Image {
  private sidebarContainer!: Phaser.GameObjects.Container;
  private sidebarWidth: number;
  private sidebarHeight: number;
  private tileSize: number;
  private thisHighlightClick!: Phaser.GameObjects.Rectangle;
  private thisHighlightHover!: Phaser.GameObjects.Rectangle;

  constructor(
    sidebarContainer: Phaser.GameObjects.Container,
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    sidebarWidth: number,
    sidebarHeight: number,
    tileSize: number
  ) {
    super(scene, x, y, texture);
    this.sidebarWidth = sidebarWidth;
    this.sidebarHeight = sidebarHeight;
    this.tileSize = tileSize;
    this.sidebarContainer = sidebarContainer;

    this.setOrigin(0)
      .setCrop(0, 0, this.sidebarWidth, this.sidebarHeight)
      .setDepth(1) // Set tilesheet depth to 1
      .setInteractive({
        hitArea: new Phaser.Geom.Rectangle(
          0,
          0,
          this.sidebarWidth - 1,
          this.sidebarHeight
        ),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        draggable: true,
        useHandCursor: true,
      });

    // Add click event listener for the tilesheet
    this.on("pointerdown", this.drawHighlightClickRectangle, this);
    this.on("pointerover", this.drawHighlightHoverRectangle, this);
    this.on("pointermove", this.drawHighlightHoverRectangle, this);
    this.on("pointerout", () => {
      this.thisHighlightHover.visible = false;
    });
  }

  updateCrop() {
    this.setCrop(0, 0, this.sidebarWidth, this.sidebarHeight);
  }

  drawHighlightClickRectangle(pointer: Phaser.Input.Pointer) {
    const { x, y } = getCoordinatesFromPointer(pointer, this.tileSize);
    if (!this.thisHighlightClick) {
      this.thisHighlightClick = this.scene.add
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
      this.thisHighlightHover = this.scene.add
        .rectangle(x, y, this.tileSize, this.tileSize)
        .setFillStyle(0xff0000, 0.5);
      this.sidebarContainer.add(this.thisHighlightHover);
    } else {
      this.thisHighlightHover.visible = true;
      this.thisHighlightHover.setPosition(x, y);
    }
  }
}
