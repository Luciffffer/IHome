export const sceneKeys = {
  all: ['scenes'] as const,
  global: () => [...sceneKeys.all, 'global'] as const,
  mine: (userId: string) => [...sceneKeys.all, 'mine', userId] as const,
}