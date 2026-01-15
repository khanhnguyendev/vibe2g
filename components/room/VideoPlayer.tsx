'use client';

import { Play, Pause, Volume2, Maximize, SkipForward, Settings, VolumeX } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { cn } from '@/lib/utils';

export function VideoPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hasMounted, setHasMounted] = useState(false);
    const playerRef = useRef<ReactPlayer>(null);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleMute = () => setIsMuted(!isMuted);

    const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
        setProgress(state.played * 100);
    };

    const handleDuration = (duration: number) => {
        setDuration(duration);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        playerRef.current?.seekTo(percentage);
    };

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        return `${mm}:${ss}`;
    };

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-violet-900/20 group ring-1 ring-white/10">

            {hasMounted && (
                <ReactPlayer
                    ref={playerRef}
                    url="https://www.youtube.com/watch?v=Hu4Yvq-g7_Y"
                    width="100%"
                    height="100%"
                    playing={isPlaying}
                    volume={volume}
                    muted={isMuted}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    controls={false}
                    className="absolute inset-0"
                />
            )}

            {/* Glass Overlay Controls */}
            <div className="absolute inset-x-0 bottom-0 p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20">

                {/* Progress Bar */}
                <div
                    className="mb-4 h-1.5 w-full cursor-pointer rounded-full bg-white/20 group/seek relative"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 scale-0 rounded-full bg-white shadow-lg group-hover/seek:scale-100 transition-transform" />
                    </div>
                </div>

                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={togglePlay}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
                        >
                            {isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
                        </button>

                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95">
                            <SkipForward className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2 group/vol">
                            <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </button>
                            <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300">
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={volume}
                                    onChange={(e) => {
                                        setVolume(parseFloat(e.target.value));
                                        setIsMuted(false);
                                    }}
                                    className="h-1 w-full bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                />
                            </div>
                        </div>

                        <span className="text-sm font-medium text-slate-300 font-mono">
                            {formatTime(duration * (progress / 100))} / {formatTime(duration)}
                        </span>
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

            {/* Center Play Button Overlay (when paused) */}
            {!isPlaying && (
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                    onClick={togglePlay}
                >
                    <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center ring-1 ring-white/20 shadow-xl hover:scale-110 transition-transform duration-300 group">
                        <Play className="h-8 w-8 text-white fill-white ml-1 group-hover:text-pink-400 group-hover:fill-pink-400 transition-colors" />
                    </div>
                </div>
            )}
        </div>
    );
}
