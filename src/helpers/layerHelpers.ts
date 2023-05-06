import { v4 as uuidv4 } from "uuid";

export function createLayer(layers: { id: string; name: string }[]) {
  const newLayerId = uuidv4();
  const newLayer = {
    id: newLayerId,
    name: `Layer ${layers.length + 1}`,
  };
  layers.push(newLayer);
  return layers;
}

export function deleteLayer(
  layers: { id: string; name: string }[],
  activeLayer: string
) {
  if (layers.length === 1) {
    console.warn("Cannot delete the last remaining layer.");
    return layers;
  }
  const updatedLayers = layers.filter((layer) => layer.id !== activeLayer);
  return updatedLayers;
}
