import { SELECT_TILESHEET } from "./actions";
import AppState from "./types";

const initialState: AppState = {
  tilesheets: [
    {
      id: 1,
      name: "Modern Tileset",
      filename: "Modern_Exteriors_Complete_Tileset_48x48.png",
    },
  ],
  selectedTilesheet: 0,
  tileSize: 48,
  tilesheetWidth: 5,
  layers: [
    {
      id: 1,
      name: "Layer 1",
    },
  ],
  activeLayer: 0,
};

const rootReducer = (state = initialState, action: any): AppState => {
  switch (action.type) {
    case SELECT_TILESHEET:
      return {
        ...state,
        selectedTilesheet: action.payload,
      };

    default:
      return state;
  }
};

export default rootReducer;
