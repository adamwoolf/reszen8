import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import './AudioPlayer.css';
const AudioPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);
    // Calm wave audio URL (you can replace this with your own audio file)
    const audioSrc = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            }
            else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    };
    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.volume = volume || 0.5;
                setVolume(volume || 0.5);
            }
            else {
                audioRef.current.volume = 0;
                setVolume(0);
            }
            setIsMuted(!isMuted);
        }
    };
    // Set initial volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, []);
    return (_jsxs("div", { className: "audio-player", children: [_jsx("audio", { ref: audioRef, src: audioSrc, loop: true, onPlay: () => setIsPlaying(true), onPause: () => setIsPlaying(false) }), _jsx("button", { onClick: togglePlay, className: "audio-control", "aria-label": isPlaying ? 'Pause' : 'Play', children: isPlaying ? _jsx(FaPause, {}) : _jsx(FaPlay, {}) }), _jsxs("div", { className: "volume-control", children: [_jsx("button", { onClick: toggleMute, className: "volume-button", "aria-label": isMuted ? 'Unmute' : 'Mute', children: isMuted ? _jsx(FaVolumeMute, {}) : _jsx(FaVolumeUp, {}) }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.01", value: volume, onChange: handleVolumeChange, className: "volume-slider", "aria-label": "Volume control" })] })] }));
};
export default AudioPlayer;
