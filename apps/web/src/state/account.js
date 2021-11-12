import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, _get) => ({
      register: () => set(),
      login: () => set(),
    }),
    {
      name: 'stackup-account',
    },
  ),
);
