'use client';

import { useState, useEffect } from 'react';
import { User, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    initialValue?: string;
    title?: string;
    description?: string;
}

export function NameModal({
    isOpen,
    onClose,
    onSave,
    initialValue = '',
    title = 'Welcome to vibe2g',
    description = 'Please enter your name to join the room and start vibing together.'
}: NameModalProps) {
    const [name, setName] = useState(initialValue);

    useEffect(() => {
        if (isOpen) {
            const savedName = localStorage.getItem('vibe2g_username');
            if (savedName) setName(savedName);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            localStorage.setItem('vibe2g_username', name.trim());
            onSave(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-md overflow-hidden rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-violet-600/20 flex items-center justify-center ring-1 ring-violet-500/20">
                        <User className="h-6 w-6 text-violet-400" />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-2 mb-8">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                            <User className="h-5 w-5" />
                        </div>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name..."
                            className="w-full h-14 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full h-14 group inline-flex items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-950 transition-all hover:bg-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                    >
                        Continue
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
}
