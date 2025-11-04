import { useContext } from 'react';
import { FloorsContext } from './context';

export function useFloors() {
  const ctx = useContext(FloorsContext);
  if (!ctx) throw new Error('useFloors must be used within a FloorsProvider');
  return ctx;
}