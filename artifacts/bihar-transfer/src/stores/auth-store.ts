import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  setAuthenticated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (state) => set({ isAuthenticated: state }),
}));
