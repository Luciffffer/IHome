export const screenToWorld = (
    screenX: number,
    screenY: number,
    pan: { x: number, y: number },
    zoom: number
) => {
    return {
        x: (screenX - pan.x) / zoom,
        y: (screenY - pan.y) / zoom,
    }
}

export const worldToScreen = (
    worldX: number,
    worldY: number,
    pan: { x: number, y: number },
    zoom: number
) => {
    return {
        x: worldX * zoom + pan.x,
        y: worldY * zoom + pan.y,
    }
}