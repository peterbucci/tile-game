export const SELECT_TILESHEET = "SELECT_TILESHEET";

export const selectTilesheet = (index: number) => ({
  type: SELECT_TILESHEET,
  payload: index,
});
