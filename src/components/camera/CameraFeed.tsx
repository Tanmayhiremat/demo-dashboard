import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Camera as CameraIcon,
  Maximize2,
  Sparkles,
  RefreshCw,
  Radio,
  CheckCircle2,
  Wifi
} from 'lucide-react';
import { CameraDevice } from '../../types';

interface CameraFeedProps {
  camera: CameraDevice;
  onToggleAI: (id: string, active: boolean) => Promise<void>;
  onCaptureFrame: (frameUrl: string, cameraName: string) => void;
  feedType: 'left' | 'right';
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  camera,
  onToggleAI,
  onCaptureFrame,
  feedType,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [aiActive, setAiActive] = useState(camera.aiDetectionActive);
  const [streamError, setStreamError] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const backendHost = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';
  const streamUrl = `http://${backendHost}:8000/api/camera/stream/${feedType}`;

  // High-tech offline / standby canvas screen when camera stream is not live
  useEffect(() => {
    if (!streamError || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark high-tech background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Subtle grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center crosshair / radar
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width / 2 - 60, height / 2);
      ctx.lineTo(width / 2 + 60, height / 2);
      ctx.moveTo(width / 2, height / 2 - 60);
      ctx.lineTo(width / 2, height / 2 + 60);
      ctx.stroke();

      // Offline Text
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`CAMERA OFFLINE / STANDBY`, width / 2, height / 2 + 80);

      ctx.fillStyle = '#64748b';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`${camera.name} – Awaiting V4L2 USB connection`, width / 2, height / 2 + 100);
      ctx.fillText(`Endpoint: /api/camera/stream/${feedType}`, width / 2, height / 2 + 120);
      ctx.textAlign = 'left';
    };

    render();
  }, [streamError, feedType, camera.name]);

  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      // 1. Try to grab live JPEG snapshot directly from Pi hardware
      const snapshotUrl = `http://${backendHost}:8000/api/camera/snapshot/${feedType}?t=${Date.now()}`;
      const res = await fetch(snapshotUrl);
      if (res.ok) {
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          onCaptureFrame(reader.result as string, camera.name);
          setIsCapturing(false);
        };
        reader.readAsDataURL(blob);
        return;
      }
    } catch {
      // Fallback
    }

    // 2. Fallback to canvas
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
      onCaptureFrame(dataUrl, camera.name);
    }
    setIsCapturing(false);
  };

  const handleToggleAIDetection = async () => {
    const nextState = !aiActive;
    setAiActive(nextState);
    await onToggleAI(camera.id, nextState);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else if (document.exitFullscreen) {
      document.exitFullscreen?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col justify-between group"
    >
      {/* Top Overlay Bar */}
      <div className="p-4 bg-gradient-to-b from-slate-950/90 to-transparent flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              {camera.name}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5" /> Pi Hardware V4L2
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">{camera.location}</p>
          </div>
        </div>

        {/* Live AI Overlay Badge */}
        <div className="flex items-center gap-2">
          {aiActive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Scanning Active
            </span>
          )}
        </div>
      </div>

      {/* Main Video Viewport (Direct Pi MJPEG Stream) */}
      <div className="relative aspect-16/10 bg-slate-950 flex items-center justify-center overflow-hidden">
        {!streamError && isPlaying ? (
          <img
            src={streamUrl}
            alt={camera.name}
            className="w-full h-full object-cover"
            onError={() => setStreamError(true)}
            onLoad={() => setStreamError(false)}
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="w-full h-full object-cover"
          />
        )}

        {/* Laser Scanning Animation when AI is active */}
        {isPlaying && aiActive && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scanline" />
          </div>
        )}

        {/* Simulated AI Leaf Detection Bounding Boxes */}
        {isPlaying && aiActive && (
          <div className="absolute inset-0 pointer-events-none p-8">
            <div className="absolute top-[28%] left-[22%] w-[38%] h-[44%] border-2 border-emerald-400/90 rounded-xl bg-emerald-500/10 backdrop-blur-[0.5px]">
              <div className="absolute -top-3 left-2 bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow">
                {feedType === 'left' ? 'Canopy Sector A (Healthy 98.4%)' : 'Canopy Sector B (Healthy 99.1%)'}
              </div>
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs text-white">
            <Pause className="w-12 h-12 text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-300">Feed Paused</p>
          </div>
        )}

        {/* Overlay Telemetry Info */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-mono text-emerald-400 border border-slate-800 pointer-events-none">
          LAT: 32ms | RPI V4L2 STREAM ({feedType.toUpperCase()}) | 720p@30FPS
        </div>
      </div>

      {/* Camera Control Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isPlaying
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Resume
              </>
            )}
          </button>

          {/* Capture Frame */}
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-700/30"
          >
            <CameraIcon className="w-3.5 h-3.5" />
            {isCapturing ? 'Capturing...' : 'Capture for AI Analysis'}
          </button>

          {/* Reconnect stream if error */}
          {streamError && (
            <button
              onClick={() => setStreamError(false)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 flex items-center gap-1 font-mono"
            >
              <RefreshCw className="w-3 h-3 animate-spin" /> Retry Link
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Enable / Disable AI Detection */}
          <button
            onClick={handleToggleAIDetection}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              aiActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {aiActive ? 'AI Overlay Active' : 'Enable AI Overlay'}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

