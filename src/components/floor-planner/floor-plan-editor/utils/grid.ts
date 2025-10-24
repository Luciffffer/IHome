export const GRID_SIZE = 50; // 1m = 50px

export const snapToGrid = (coord: number) => {
    return Math.round(coord / GRID_SIZE) * GRID_SIZE;
};