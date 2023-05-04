interface TileSheet {
  id: number;
  name: string;
  filename: string;
}

export default interface AppState {
  tilesheets: TileSheet[];
  selectedTilesheet: number;
}
