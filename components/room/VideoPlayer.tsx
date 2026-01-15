'use client';

import { Play, Pause, Volume2, Maximize, SkipForward, Settings, VolumeX } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeEvent, YouTubeProps } from 'react-youtube';
import screenfull from 'screenfull';
import { cn } from '@/lib/utils';

type RoomState = {
    current_video_id: string | null;
    is_playing: boolean;
    playback_rate: number;
    last_synced_at: string;
};

interface VideoPlayerProps {
    state: RoomState;
    onUpdate: (updates: Partial<RoomState>) => void;
    isHost?: boolean;
}

export function VideoPlayer({ state, onUpdate, isHost = true }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [player, setPlayer] = useState<any>(null);
    const [showSettings, setShowSettings] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    // Sync with remote state
    useEffect(() => {
        if (!player) return;

        try {
            // Safety check for underlying iframe
            if (!player.getInternalPlayer?.() && !player.getIframe?.()) return;

            // Sync play/pause
            if (state.is_playing) {
                if (player.getPlayerState() !== 1) player.playVideo();
            } else {
                if (player.getPlayerState() !== 2) player.pauseVideo();
            }

            // Sync playback rate
            if (player.getPlaybackRate() !== state.playback_rate) {
                player.setPlaybackRate(state.playback_rate);
            }
        } catch (err) {
            console.warn('VideoPlayer sync error:', err);
        }
    }, [state.is_playing, state.playback_rate, player]);

    const onReady: YouTubeProps['onReady'] = (event: YouTubeEvent) => {
        setPlayer(event.target);
        setDuration(event.target.getDuration());
        setVolume(event.target.getVolume());

        // Initial sync
        if (state.is_playing) event.target.playVideo();
        event.target.setPlaybackRate(state.playback_rate);
    };

    const onStateChange: YouTubeProps['onStateChange'] = (event: YouTubeEvent) => {
        // event.data: 1 = playing, 2 = paused, 3 = buffering, -1 = unstarted
        const isPlayingState = event.data === 1;
        const isPausedState = event.data === 2;

        setIsPlaying(isPlayingState);

        if (isPlayingState) {
            startProgressTimer();
        } else {
            stopProgressTimer();
        }

        // Only sync if the state is stable (Play or Pause) and it differs from intended state
        if (isHost && (isPlayingState || isPausedState)) {
            if (isPlayingState !== state.is_playing) {
                onUpdate({ is_playing: isPlayingState });
            }
        }
    };

    const startProgressTimer = () => {
        stopProgressTimer();
        progressInterval.current = setInterval(() => {
            if (player) {
                setCurrentTime(player.getCurrentTime());
            }
        }, 1000);
    };

    const stopProgressTimer = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
    };

    useEffect(() => {
        return () => stopProgressTimer();
    }, []);

    const togglePlay = () => {
        if (!player || !isHost) return;
        // User clicked play/pause
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    const toggleMute = () => {
        if (!player) return;
        if (isMuted) {
            player.unMute();
            setIsMuted(false);
        } else {
            player.mute();
            setIsMuted(true);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!player) return;
        const newVol = parseInt(e.target.value);
        player.setVolume(newVol);
        setVolume(newVol);
        if (newVol > 0 && isMuted) {
            player.unMute();
            setIsMuted(false);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!player || !isHost) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const seekToTime = duration * percentage;
        player.seekTo(seekToTime, true);
        setCurrentTime(seekToTime);
    };

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        return `${mm}:${ss}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div ref={containerRef} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-violet-900/20 group ring-1 ring-white/10">

            {state.current_video_id ? (
                <YouTube
                    videoId={state.current_video_id}
                    className="absolute inset-0 w-full h-full"
                    iframeClassName="w-full h-full"
                    opts={{
                        height: '100%',
                        width: '100%',
                        playerVars: {
                            autoplay: state.is_playing ? 1 : 0,
                            controls: 0,
                            modestbranding: 1,
                            rel: 0,
                        },
                    }}
                    onReady={onReady}
                    onStateChange={onStateChange}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/50 backdrop-blur-sm border-2 border-dashed border-white/5 rounded-2xl m-2">
                    <div className="h-16 w-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
                        <Play className="h-8 w-8 text-violet-400 opacity-50" />
                    </div>
                    <p className="text-slate-400 font-medium">No video active</p>
                    <p className="text-slate-600 text-xs mt-1">Add a video from the search or queue to start</p>
                </div>
            )}

            {/* Glass Overlay Controls */}
            {state.current_video_id && (
                <div className="absolute inset-x-0 bottom-0 p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20">

                    {/* Progress Bar */}
                    <div
                        className="mb-4 h-1.5 w-full cursor-pointer rounded-full bg-white/20 group/seek relative"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 relative"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 scale-0 rounded-full bg-white shadow-lg group-hover/seek:scale-100 transition-transform" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={togglePlay}
                                disabled={!isHost}
                                className={cn(
                                    "p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95",
                                    !isHost && "opacity-50 cursor-not-allowed"
                                )}
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
                                        max={100}
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="h-1 w-full bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                    />
                                </div>
                            </div>

                            <span className="text-sm font-medium text-slate-300 font-mono">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 relative">
                            <button
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                onClick={() => setShowSettings(!showSettings)}
                            >
                                <Settings className="h-5 w-5" />
                            </button>

                            {showSettings && (
                                <div className="absolute bottom-12 right-0 w-40 bg-black/90 border border-white/10 text-white backdrop-blur-xl p-2 rounded-xl shadow-xl z-20">
                                    <div className="text-xs font-semibold text-slate-400 mb-2 px-2">Playback Speed</div>
                                    {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                                        <button
                                            key={rate}
                                            onClick={() => {
                                                if (player) {
                                                    onUpdate({ playback_rate: rate });
                                                    setShowSettings(false);
                                                }
                                            }}
                                            className="w-full text-left px-2 py-1.5 hover:bg-white/10 rounded text-sm flex items-center justify-between group/rate"
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    if (screenfull.isEnabled && containerRef.current) {
                                        screenfull.toggle(containerRef.current);
                                    }
                                }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <Maximize className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Center Play Button Overlay (when paused) - Only for host */}
            {state.current_video_id && !isPlaying && isHost && (
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
