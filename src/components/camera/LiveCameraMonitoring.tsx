import React from 'react';
import {
  Camera,
  Layers,
  Sparkles,
  ShieldCheck,
  Radio,
  Sliders,
  Info,
  Maximize2,
  Radar,
  Activity
} from 'lucide-react';
import { CameraDevice, NavigationPage } from '../../types';
import { CameraFeed } from './CameraFeed';
import { RealSenseDepthFeed } from './RealSenseDepthFeed';

interface LiveCameraMonitoringProps {
  cameras: CameraDevice[];
  onToggleCameraAI: (id: string, active: boolean) => Promise<void>;
  onCaptureFrameToDetection: (frameUrl: string, cameraName: string) => void;
  onNavigate: (page: NavigationPage) => void;
}

export const LiveCameraMonitoring: React.FC<LiveCameraMonitoringProps> = ({
  cameras,
  onToggleCameraAI,
  onCaptureFrameToDetection,
  onNavigate,
}) => {
  const frontDepthCamera = cameras.find(c => c.isDepthCamera || c.id === 'cam-front-realsense') || {
    id: 'cam-front-realsense',
    name: 'Front Intel RealSense D435i',
    location: 'Rover Front Mast (Autonomous Navigation)',
    status: 'Online' as const,
    resolution: '1280x720 Depth + 1080p RGB',
    fps: 30,
    fieldId: 'field-01',
    streamUrl: '',
    aiDetectionActive: true,
    leafBoxActive: true,
    isDepthCamera: true,
  };

  const leftCamera = cameras.find(c => c.id === 'cam-left') || cameras[0];
  const rightCamera = cameras.find(c => c.id === 'cam-right') || cameras[1] || cameras[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Optical & 3D Depth Sensor Surveillance
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                <Radar className="w-3.5 h-3.5 text-blue-600" />
                Intel RealSense + Dual 720p Feeds
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Stereo crop canopy monitoring with front-mounted 3D depth point cloud for autonomous navigation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('rover')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rover Driving HUD</span>
          </button>
          <button
            onClick={() => onNavigate('detect')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all"
          >
            Manual Leaf Scan
          </button>
        </div>
      </div>

      {/* SECTION 1: FRONT INTEL REALSENSE DEPTH CAMERA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-sm font-extrabold text-slate-800">
              Primary Nav Sensor: Front Intel RealSense D435i Depth Camera
            </h2>
          </div>
          <span className="text-xs font-mono text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
            Autonomous Obstacle Avoidance & Jet Depth Heatmap
          </span>
        </div>

        <RealSenseDepthFeed
          camera={frontDepthCamera}
          onToggleAI={onToggleCameraAI}
          onCaptureFrame={onCaptureFrameToDetection}
        />
      </div>

      {/* SECTION 2: DUAL 720P OPTICAL CANOPY CAMERAS (Left & Right) */}
      <div className="space-y-3 pt-2">
        <div className="px-2">
          <h2 className="text-sm font-extrabold text-slate-800">
            Lateral Optical Crop Inspection Feeds
          </h2>
          <p className="text-xs text-slate-400">
            Left & right side cameras positioned to inspect mature foliage and disease focal points
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera 1: Left Camera */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-extrabold text-slate-800">
                  Camera 1 – Left Optical Feed
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Sector A (North Beds)
              </span>
            </div>

            <CameraFeed
              camera={leftCamera}
              onToggleAI={onToggleCameraAI}
              onCaptureFrame={onCaptureFrameToDetection}
              feedType="left"
            />
          </div>

          {/* Camera 2: Right Camera */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-extrabold text-slate-800">
                  Camera 2 – Right Optical Feed
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Sector B (East Beds)
              </span>
            </div>

            <CameraFeed
              camera={rightCamera}
              onToggleAI={onToggleCameraAI}
              onCaptureFrame={onCaptureFrameToDetection}
              feedType="right"
            />
          </div>
        </div>
      </div>

      {/* Technical Spec Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-950">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Autonomous Sensor Fusion Architecture:</strong> The front Intel RealSense D435i provides stereo IR active depth ranging up to 10 meters with an 87° × 58° field-of-view, feeding real-time point clouds to the Raspberry Pi 5 navigation planner to guide rover furrow tracking and collision braking.
        </div>
      </div>
    </div>
  );
};
