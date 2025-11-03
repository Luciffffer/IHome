export const sceneKeys = {
  all: ['scenes'] as const,
  fast: () => [...sceneKeys.all, 'fast'] as const,
  global: () => [...sceneKeys.all, 'global'] as const,
  mine: (userId: string) => [...sceneKeys.all, 'mine', userId] as const,
}