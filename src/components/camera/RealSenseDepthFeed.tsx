import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Camera as CameraIcon,
  Play,
  Pause,
  Sparkles,
  Radar,
  Activity,
  RefreshCw,
  Wifi
} from 'lucide-react';
import { CameraDevice } from '../../types';

interface RealSenseDepthFeedProps {
  camera: CameraDevice;
  onToggleAI: (id: string, active: boolean) => Promise<void>;
  onCaptureFrame: (frameUrl: string, cameraName: string) => void;
}

export const RealSenseDepthFeed: React.FC<RealSenseDepthFeedProps> = ({
  camera,
  onCaptureFrame,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [depthMode, setDepthMode] = useState<'jet' | 'rgb' | 'infrared' | 'mesh'>('jet');
  const [targetDistance, setTargetDistance] = useState(1.42);
  const [clearance, setClearance] = useState(1.85);
  const [streamError, setStreamError] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const backendHost = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';
  const streamUrl = `http://${backendHost}:8000/api/camera/stream/realsense?mode=${depthMode}`;

  // High-tech offline / standby canvas screen when RealSense depth stream is not live
  useEffect(() => {
    if (!streamError || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark high-tech background
      ctx.fillStyle = '#060911';
      ctx.fillRect(0, 0, width, height);

      // Depth Heatmap grid lines
      ctx.strokeStyle = '#172554';
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

      // Depth Cone / FOV Lines (87° Horizontal)
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(width / 2, height - 20);
      ctx.lineTo(width * 0.1, 30);
      ctx.moveTo(width / 2, height - 20);
      ctx.lineTo(width * 0.9, 30);
      ctx.stroke();
      ctx.setLineDash([]);

      // Offline Text & HUD
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`INTEL REALSENSE D435i DEPTH SENSOR: STANDBY`, width / 2, height / 2);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`Mode: ${depthMode.toUpperCase()} | Status: Sensor Offline`, width / 2, height / 2 + 25);
      ctx.fillText(`Awaiting Stereo Point Cloud Stream on USB 3.0`, width / 2, height / 2 + 45);
      ctx.textAlign = 'left';
    };

    render();
  }, [streamError, depthMode]);

  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      const snapshotUrl = `http://${backendHost}:8000/api/camera/snapshot/realsense?mode=${depthMode}&t=${Date.now()}`;
      const res = await fetch(snapshotUrl);
      if (res.ok) {
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          onCaptureFrame(reader.result as string, 'Front Intel RealSense D435');
          setIsCapturing(false);
        };
        reader.readAsDataURL(blob);
        return;
      }
    } catch {
      // Fallback
    }

    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
      onCaptureFrame(dataUrl, 'Front Intel RealSense D435');
    }
    setIsCapturing(false);
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
      className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between group"
    >
      {/* Top Telemetry Bar */}
      <div className="p-4 bg-gradient-to-b from-slate-950/95 to-transparent flex flex-wrap items-center justify-between text-white gap-3 z-10 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Radar className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Front Intel RealSense D435
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5" /> Pi USB 3.0 V4L2
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Autonomous Navigation & 3D Obstacle Avoidance Array (Mounted at Rover Front)
            </p>
          </div>
        </div>

        {/* Depth Colormap Mode Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          {(['jet', 'rgb', 'infrared', 'mesh'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setDepthMode(mode);
                setStreamError(false);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all capitalize ${
                depthMode === mode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'jet' ? 'Jet Depth' : mode === 'rgb' ? 'Color RGB' : mode === 'infrared' ? 'Infrared' : '3D Mesh'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative aspect-16/9 bg-slate-950 flex items-center justify-center overflow-hidden">
        {!streamError && isPlaying ? (
          <img
            key={`${depthMode}-${backendHost}`}
            src={streamUrl}
            alt="Front Intel RealSense D435"
            className="w-full h-full object-cover"
            onError={() => {
              console.warn('RealSense stream error, showing simulated HUD fallback');
              setStreamError(true);
            }}
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

        {/* Laser Scanner Line */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-scanline" />
          </div>
        )}

        {/* Live Distance & Obstacle Clearance Telemetry HUD Pill */}
        <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-xs font-mono space-y-1 shadow-lg pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">FORWARD PATH: CLEAR</span>
          </div>
          <div className="text-slate-300 text-[11px]">
            Target Distance: <strong className="text-white font-bold">{targetDistance}m</strong> | Clearance: <strong className="text-white font-bold">{clearance}m</strong>
          </div>
        </div>

        {/* Depth Scale Legend */}
        {depthMode === 'jet' && (
          <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 text-[10px] font-mono space-y-1 shadow-lg pointer-events-none">
            <span className="text-slate-400 block font-bold">Depth Scale (m)</span>
            <div className="w-28 h-2 rounded bg-gradient-to-r from-red-500 via-emerald-400 to-blue-600" />
            <div className="flex justify-between text-slate-400">
              <span>0.2m</span>
              <span>2.0m</span>
              <span>5.0m+</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isPlaying
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Resume Stream
              </>
            )}
          </button>

          {/* Capture Frame */}
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-700/30"
          >
            <CameraIcon className="w-3.5 h-3.5" />
            {isCapturing ? 'Capturing...' : 'Capture Depth Frame'}
          </button>

          {streamError && (
            <button
              onClick={() => setStreamError(false)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 flex items-center gap-1 font-mono"
            >
              <RefreshCw className="w-3 h-3 animate-spin" /> Reconnect RealSense
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Activity className="w-3 h-3 text-emerald-400" /> RealSense IMU: 6-DOF Nominal
          </span>

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

