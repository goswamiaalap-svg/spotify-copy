import useToastStore from '../store/toastStore';
import { Check, X, PlusCircle, HeartOff } from 'lucide-react';

export default function Toast() {
    const { toasts } = useToastStore();

    if (toasts.length === 0) return null;

    const getIcon = (msg) => {
        if (msg.includes('Removed')) return <HeartOff size={16} className="text-[#a7a7a7]" />;
        if (msg.includes('wrong')) return <X size={16} className="text-[#e22134]" />;
        if (msg.includes('Added to')) return <Check size={16} className="text-[#1DB954]" />;
        return <PlusCircle size={16} className="text-[#1DB954]" />;
    };

    return (
        <div className="fixed bottom-24 left-6 z-[9999] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="bg-[#282828] border border-white/10 text-white px-[20px] py-[14px] rounded-lg shadow-lg flex items-center gap-3 animate-slideUpFadeIn text-[14px]"
                >
                    <div className="flex items-center justify-center shrink-0">
                        {getIcon(toast.message)}
                    </div>
                    <p className="font-semibold">{toast.message}</p>
                </div>
            ))}
        </div>
    );
}
