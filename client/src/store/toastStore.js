import { create } from 'zustand';

const useToastStore = create((set, get) => ({
    toasts: [],
    showToast: (msg) => {
        const id = Date.now();
        set((state) => {
            const newToasts = [...state.toasts, { id, message: msg }];
            // Keep max stack: 3 toasts
            if (newToasts.length > 3) newToasts.shift();
            return { toasts: newToasts };
        });

        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter(t => t.id !== id)
            }));
        }, 3000);
    },
    hideToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }))
}));

export default useToastStore;
