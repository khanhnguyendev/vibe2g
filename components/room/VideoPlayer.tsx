import { Play, Pause, Volume2, Maximize, SkipForward, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function VideoPlayer() {
    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-violet-900/20 group ring-1 ring-white/10">
            {/* Placeholder Video Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <span className="text-slate-500 font-medium">Video Player Placeholder</span>
            </div>

            {/* Glass Overlay Controls */}
            <div className="absolute inset-x-0 bottom-0 p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/80 to-transparent pt-20">

                {/* Progress Bar */}
                <div className="mb-4 h-1 w-full cursor-pointer rounded-full bg-white/20 group/seek">
                    <div className="relative h-full w-[35%] rounded-full bg-gradient-to-r from-violet-500 to-pink-500">
                        <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 scale-0 rounded-full bg-white shadow group-hover/seek:scale-100 transition-transform" />
                    </div>
                </div>

                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Play className="h-5 w-5 fill-white" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <SkipForward className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2 ml-2 group/vol">
                            <Volume2 className="h-5 w-5" />
                            <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                                <div className="h-1 w-full bg-white/20 rounded-full ml-2">
                                    <div className="h-full w-[70%] bg-white rounded-full" />
                                </div>
                            </div>
                        </div>
                        <span className="ml-2 text-xs font-medium text-slate-300">04:20 / 12:45</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Settings className="h-5 w-5" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Maximize className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Center Play Button (Optional, for paused state) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center ring-1 ring-white/20 shadow-xl opacity-0 scale-90">
                    <Play className="h-6 w-6 text-white ml-1" />
                </div>
            </div>
        </div>
    );
}
