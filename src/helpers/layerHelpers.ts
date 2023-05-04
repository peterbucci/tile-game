export function createLayer(layers: { id: number; name: string }[]) {
  const newLayerId = layers.length + 1;
  const newLayer = {
    id: newLayerId,
    name: `Layer ${newLayerId}`,
  };
  layers.push(newLayer);
  return layers;
}

export function deleteLayer(
  layers: { id: number; name: string }[],
  activeLayer: number
) {
  if (layers.length === 1) {
    console.warn("Cannot delete the last remaining layer.");
    return layers;
  }
  layers.splice(activeLayer, 1);
  return layers;
}
