export function getCoordinatesFromPointer(
  pointer: Phaser.Input.Pointer,
  tileSize: number
) {
  const x = Math.floor(pointer.x / tileSize) * tileSize;
  const y = Math.floor(pointer.y / tileSize) * tileSize;
  return { x, y };
}
