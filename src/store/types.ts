interface TileSheet {
  id: number;
  name: string;
  filename: string;
}

export interface Layer {
  id: number;
  name: string;
}

export default interface AppState {
  tilesheets: TileSheet[];
  selectedTilesheet: number;
  tileSize: number;
  tilesheetWidth: number;
  layers: Layer[];
  activeLayer: number;
}
