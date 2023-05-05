export function getCoordinatesFromPointer(
  pointer: Phaser.Input.Pointer,
  tileSize: number
) {
  const x = Math.floor(pointer.x / tileSize) * tileSize;
  const y = Math.floor(pointer.y / tileSize) * tileSize;
  console.log(x, y);
  return { x, y };
}
