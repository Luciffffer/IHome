export const floorsKey = ['floors'] as const;
export const devicesKey = (floorId: string | null | undefined) =>
  ['devices', floorId ?? null] as const;