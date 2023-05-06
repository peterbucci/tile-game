import Phaser from "phaser";
import { getCoordinatesFromPointer } from "../helpers/coordinates";

export default class Tilesheet extends Phaser.GameObjects.Image {
  private sidebarContainer!: Phaser.GameObjects.Container;
  private sidebarWidth: number;
  private sidebarHeight: number;
  private tileSize: number;
  public thisHighlightClick!: Phaser.GameObjects.Rectangle;
  private thisHighlightHover!: Phaser.GameObjects.Rectangle;
  private selectedTilePosition?: Phaser.Geom.Point;

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

  drawHighlightClickRectangle(pointer: Phaser.Input.Pointer) {
    if (pointer.event.shiftKey && this.selectedTilePosition) {
      const { x, y } = getCoordinatesFromPointer(pointer, this.tileSize);
      this.selectTilesInRange(
        this.selectedTilePosition,
        new Phaser.Geom.Point(x, y)
      );
    } else {
      const { x, y } = getCoordinatesFromPointer(pointer, this.tileSize);
      this.selectedTilePosition = new Phaser.Geom.Point(x, y);

      if (!this.thisHighlightClick) {
        this.thisHighlightClick = this.scene.add
          .rectangle(x, y, this.tileSize, this.tileSize)
          .setFillStyle(0xff0000, 0.5)
          .setOrigin(0);
        this.sidebarContainer.add(this.thisHighlightClick);
      } else {
        this.thisHighlightClick.setPosition(x, y);
        this.thisHighlightClick.setSize(this.tileSize, this.tileSize);
      }
    }
  }

  selectTilesInRange(startTile: Phaser.Geom.Point, endTile: Phaser.Geom.Point) {
    const startX = Math.min(startTile.x, endTile.x);
    const endX = Math.max(startTile.x, endTile.x);
    const startY = Math.min(startTile.y, endTile.y);
    const endY = Math.max(startTile.y, endTile.y);

    const width = endX - startX + this.tileSize;
    const height = endY - startY + this.tileSize;

    this.thisHighlightClick.setPosition(startX, startY);
    this.thisHighlightClick.setSize(width, height);
  }

  drawHighlightHoverRectangle(pointer: Phaser.Input.Pointer) {
    const { x, y } = getCoordinatesFromPointer(pointer, this.tileSize);

    if (!this.thisHighlightHover) {
      this.thisHighlightHover = this.scene.add
        .rectangle(x, y, this.tileSize, this.tileSize)
        .setStrokeStyle(2, 0xff0000)
        .setOrigin(0);

      this.sidebarContainer.add(this.thisHighlightHover);
    } else {
      this.thisHighlightHover.visible = true;
      this.thisHighlightHover.setPosition(x, y);
    }
  }

  getSelectedTiles():
    | {
        x: number;
        y: number;
        width: number;
        height: number;
        texture: { key: string };
      }[]
    | null {
    if (!this.thisHighlightClick) return null;

    const tiles: {
      x: number;
      y: number;
      width: number;
      height: number;
      texture: { key: string };
    }[] = [];

    const startX = this.thisHighlightClick.x;
    const startY = this.thisHighlightClick.y;
    const endX = startX + this.thisHighlightClick.width;
    const endY = startY + this.thisHighlightClick.height;

    for (let y = startY; y < endY; y += this.tileSize) {
      for (let x = startX; x < endX; x += this.tileSize) {
        tiles.push({
          x,
          y,
          width: this.tileSize,
          height: this.tileSize,
          texture: this.texture,
        });
      }
    }

    return tiles;
  }
}
