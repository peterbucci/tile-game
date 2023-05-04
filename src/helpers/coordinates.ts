export function getCoordinatesFromPointer(
  pointer: Phaser.Input.Pointer,
  tileSize: number
) {
  const x = Math.floor(pointer.x / tileSize) * tileSize + tileSize / 2;
  const y = Math.floor(pointer.y / tileSize) * tileSize + tileSize / 2;
  return { x, y };
}
