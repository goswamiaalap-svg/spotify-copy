import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,

            login: (userData, token) => {
                set({ user: userData, token });
            },

            logout: () => {
                set({ user: null, token: null });
                localStorage.removeItem('auth-storage');
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);

export default useAuthStore;
