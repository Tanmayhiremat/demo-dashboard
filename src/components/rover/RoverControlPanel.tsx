import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Zap,
  Droplets,
  ShieldAlert,
  Battery,
  Thermometer,
  Wind,
  Layers,
  Terminal,
  Play,
  RotateCcw,
  Radio,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Square,
  Sparkles,
  Send,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoverState } from '../../types';

interface RoverControlPanelProps {
  rover: RoverState;
  onSendMotors: (left: number, right: number) => Promise<void>;
  onSendSprayer: (pump: boolean, sol1: boolean, sol2: boolean) => Promise<void>;
  onEmergencyStop: () => Promise<void>;
  onSendPing: () => Promise<void>;
  onSendSelfTest: () => Promise<void>;
  onSendRawSerial: (cmd: string) => Promise<void>;
}

export const RoverControlPanel: React.FC<RoverControlPanelProps> = ({
  rover,
  onSendMotors,
  onSendSprayer,
  onEmergencyStop,
  onSendPing,
  onSendSelfTest,
  onSendRawSerial,
}) => {
  const [throttle, setThrottle] = useState(60);
  const [customCmd, setCustomCmd] = useState('');
  const [autoHeartbeat, setAutoHeartbeat] = useState(true);
  const [heartbeatCountdown, setHeartbeatCountdown] = useState(5);
  const [autoNavEnabled, setAutoNavEnabled] = useState(true);
  const [autoSprayEnabled, setAutoSprayEnabled] = useState(true);
  const [activeSpraySide, setActiveSpraySide] = useState<'none' | 'left' | 'right' | 'both'>('none');
  const [lastSprayedInfo, setLastSprayedInfo] = useState<string | null>(null);
  const [activeObstacle, setActiveObstacle] = useState<{
    label: string;
    distanceM: number;
    pos: 'left' | 'center' | 'right';
    confidence: number;
    avoidanceAction: string;
  }>({
    label: 'No Obstacles Detected',
    distanceM: 0,
    pos: 'center',
    confidence: 0,
    avoidanceAction: 'Standby Mode (Corridor Clear)',
  });
  const serialLogRef = useRef<HTMLDivElement | null>(null);
  const autoSprayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSprayingRef = useRef(false);

  // Auto-scroll serial log
  useEffect(() => {
    if (serialLogRef.current) {
      serialLogRef.current.scrollTop = serialLogRef.current.scrollHeight;
    }
  }, [rover.logs]);

  // Autonomous Directional Spot-Spraying Trigger Effect when Rover moves
  useEffect(() => {
    const isMoving = rover.leftSpeed !== 0 || rover.rightSpeed !== 0;

    if (isMoving && autoSprayEnabled && !isSprayingRef.current) {
      isSprayingRef.current = true;
      
      // Alternate or trigger based on turn direction / rover travel
      // Left turn or forward -> Left Camera spots Early Blight -> Left Solenoid 1
      // Right turn -> Right Camera spots Late Blight -> Right Solenoid 2
      const isLeftTarget = rover.leftSpeed >= rover.rightSpeed;
      const targetSide: 'left' | 'right' = isLeftTarget ? 'left' : 'right';
      
      setActiveSpraySide(targetSide);

      // Trigger 12V Pump + Target Solenoid (P <pump> <sol1_left> <sol2_right>)
      if (targetSide === 'left') {
        onSendSprayer(true, true, false); // Pump + Solenoid 1 (Left)
      } else {
        onSendSprayer(true, false, true); // Pump + Solenoid 2 (Right)
      }

      // Micro confetti directional spray effect
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7, x: targetSide === 'left' ? 0.3 : 0.7 },
        colors: targetSide === 'left' ? ['#10b981', '#06b6d4', '#3b82f6'] : ['#f59e0b', '#ef4444', '#8b5cf6'],
      });

      // 2.5 seconds targeted pulse then shutoff
      if (autoSprayTimerRef.current) clearTimeout(autoSprayTimerRef.current);
      autoSprayTimerRef.current = setTimeout(() => {
        onSendSprayer(false, false, false);
        setActiveSpraySide('none');
        setLastSprayedInfo(`${targetSide.toUpperCase()} Bed (${targetSide === 'left' ? 'Solenoid 1: Early Blight' : 'Solenoid 2: Late Blight'}) at ${new Date().toLocaleTimeString()}`);
        
        // Cooldown before next auto-trigger
        setTimeout(() => {
          isSprayingRef.current = false;
        }, 3500);
      }, 2500);
    }
  }, [rover.leftSpeed, rover.rightSpeed, autoSprayEnabled, onSendSprayer]);

  useEffect(() => {
    return () => {
      if (autoSprayTimerRef.current) clearTimeout(autoSprayTimerRef.current);
    };
  }, []);

  // Periodic heartbeat (PING) every 3 seconds to prevent watchdog safety timeout (5s)
  useEffect(() => {
    if (!autoHeartbeat) return;
    const interval = setInterval(() => {
      onSendPing();
      setHeartbeatCountdown(5);
    }, 3000);

    const timer = setInterval(() => {
      setHeartbeatCountdown((prev) => (prev > 0 ? prev - 1 : 5));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [autoHeartbeat, onSendPing]);

  // Keyboard controls for Rover (WASD / Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        e.preventDefault();
        onSendMotors(throttle, throttle);
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        e.preventDefault();
        onSendMotors(-throttle, -throttle);
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        e.preventDefault();
        onSendMotors(-throttle, throttle); // Spin Left
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        e.preventDefault();
        onSendMotors(throttle, -throttle); // Spin Right
      } else if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        onEmergencyStop();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (['w', 'W', 's', 'S', 'a', 'A', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        onSendMotors(0, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [throttle, onSendMotors, onEmergencyStop]);

  const handleCustomCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCmd.trim()) return;
    onSendRawSerial(customCmd);
    setCustomCmd('');
  };

  const handleSelfTestClick = async () => {
    await onSendSelfTest();
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#3b82f6'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                AgriRakshak Rover Actuator & Teleoperation
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ESP32 Master Node
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              BTS7960 Dual H-Bridge Motor Control, 12V Diaphragm Pump, and Dual Solenoid Chemical Valves
            </p>
          </div>
        </div>

        {/* Port & Heartbeat Watchdog Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>{rover.serialPort} @ {rover.baudRate}</span>
          </div>

          <button
            onClick={() => onSendPing()}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Send PING Heartbeat"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>PING ({heartbeatCountdown}s)</span>
          </button>

          {/* Large Emergency Stop */}
          <button
            onClick={onEmergencyStop}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency STOP</span>
          </button>
        </div>
      </div>

      {/* Live ESP32 Telemetry Gauges (Section 5 from ESP32 Code) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Battery Voltage (GPIO 34 ADC) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Bus Voltage</span>
            <Battery className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 font-mono">
              {rover.batteryVoltage.toFixed(2)}V
            </span>
            <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
              12V Nominal Li-Ion Bus (ADC1_CH6)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, (rover.batteryVoltage / 13.5) * 100)}%` }}
            />
          </div>
        </div>

        {/* Ambient Temperature (GPIO 21 DHT11) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">DHT11 Temp</span>
            <Thermometer className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 font-mono">
              {rover.temperature.toFixed(1)}°C
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Canopy Ambient (GPIO 21)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.min(100, (rover.temperature / 50) * 100)}%` }}
            />
          </div>
        </div>

        {/* Ambient Humidity (GPIO 21 DHT11) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">DHT11 Humidity</span>
            <Wind className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 font-mono">
              {rover.humidity.toFixed(1)}%
            </span>
            <span className="text-[11px] text-blue-600 font-medium block mt-0.5">
              Relative Humidity (RH)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${rover.humidity}%` }}
            />
          </div>
        </div>

        {/* Soil Moisture (GPIO 35 ADC) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Soil Moisture</span>
            <Droplets className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-700 font-mono">
              {rover.soilMoisture.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Capacitive ADC (GPIO 35)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${rover.soilMoisture}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls Grid: Dual Motor Steering & Sprayer Actuator Relays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: BTS7960 Motor Teleoperation (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                BTS7960 Dual H-Bridge Motor Control
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Differential steering via serial command: <code className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">M &lt;left&gt; &lt;right&gt;</code>
              </p>
            </div>

            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
              1000 Hz PWM
            </span>
          </div>

          {/* Motor Power & Speed Gauges */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Motor Status */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Left Motor (RPWM:18, LPWM:19)</span>
                <span className={`font-mono text-sm ${rover.leftSpeed !== 0 ? 'text-emerald-600 font-extrabold' : 'text-slate-500'}`}>
                  {rover.leftSpeed}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-200 ${rover.leftSpeed >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.abs(rover.leftSpeed)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">Enables: R_EN(23) L_EN(22) HIGH</span>
            </div>

            {/* Right Motor Status */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Right Motor (RPWM:25, LPWM:26)</span>
                <span className={`font-mono text-sm ${rover.rightSpeed !== 0 ? 'text-emerald-600 font-extrabold' : 'text-slate-500'}`}>
                  {rover.rightSpeed}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-200 ${rover.rightSpeed >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.abs(rover.rightSpeed)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">Enables: R_EN(27) L_EN(14) HIGH</span>
            </div>
          </div>

          {/* Speed Throttle Slider */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Drive Speed Throttle: {throttle}%
              </span>
              <span className="text-emerald-700 font-mono font-bold">Max PWM: {Math.round((throttle / 100) * 255)} / 255</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={throttle}
              onChange={(e) => setThrottle(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Precise Crawl (20%)</span>
              <span>Field Cruise (60%)</span>
              <span>Full Rapid (100%)</span>
            </div>
          </div>
          {/* 1. FRONT INTEL REALSENSE D435i + YOLO OBSTACLE AVOIDANCE HUD */}
          <div className="p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-3 shadow-lg overflow-hidden relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-blue-400" />
                  Front RealSense D435i + YOLO-Nano Obstacle Navigation
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Auto Navigation Switch */}
                <button
                  onClick={() => setAutoNavEnabled(!autoNavEnabled)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all font-mono flex items-center gap-1 ${
                    autoNavEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  title="Toggle Autonomous Obstacle Avoidance Steering"
                >
                  <Cpu className="w-3 h-3" />
                  <span>Auto-Nav: {autoNavEnabled ? 'ACTIVE' : 'MANUAL'}</span>
                </button>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                  activeObstacle.distanceM <= 0.65
                    ? 'bg-rose-500 text-white animate-ping font-black'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {activeObstacle.distanceM <= 0.65 ? '🛑 AUTO-BRAKE (<0.65m)' : `⚡ ${activeObstacle.avoidanceAction}`}
                </span>
              </div>
            </div>

            {/* RealSense 3D Depth Navigation Viewport with YOLO Obstacle Bounding Box */}
            <div className="relative h-48 sm:h-52 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {/* Dynamic Jet Depth Colormap Gradient Simulation */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-emerald-900/40 to-amber-900/50" />
              
              {/* Center Furrow Guidance Path Corridor */}
              <div className="absolute inset-x-12 bottom-0 top-4 border-x-2 border-dashed border-emerald-400/60 pointer-events-none flex justify-center">
                <div className={`w-1 h-full transition-all duration-500 ${
                  activeObstacle.pos === 'left' ? 'bg-emerald-400/80 translate-x-10' : activeObstacle.pos === 'right' ? 'bg-emerald-400/80 -translate-x-10' : 'bg-rose-400/80'
                }`} />
              </div>

              {/* Dynamic YOLO Field Obstacle Bounding Box */}
              <div className={`absolute transition-all duration-700 p-2 rounded-xl border-2 backdrop-blur-xs shadow-xl ${
                activeObstacle.distanceM <= 0.65
                  ? 'top-8 border-rose-500 bg-rose-950/80 shadow-rose-500/40 animate-pulse'
                  : activeObstacle.pos === 'left'
                  ? 'top-6 left-16 border-amber-400 bg-amber-950/60 shadow-amber-500/30'
                  : 'top-6 right-16 border-amber-400 bg-amber-950/60 shadow-amber-500/30'
              }`}>
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-amber-200">YOLO: {activeObstacle.label} ({activeObstacle.confidence}%)</span>
                </div>
                <div className="text-[9px] font-mono text-slate-300 mt-0.5 flex justify-between gap-3">
                  <span>Depth: {activeObstacle.distanceM}m</span>
                  <span className="text-emerald-300 font-bold">{activeObstacle.avoidanceAction}</span>
                </div>
              </div>

              {/* RealSense Center Crosshair Reticle & Avoidance Steering Vector */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 border border-blue-400/40 rounded-full flex items-center justify-center relative">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {/* Steering Deflection Vector Indicator */}
                  {autoNavEnabled && rover.leftSpeed !== 0 && (
                    <div className={`absolute text-xs font-black text-emerald-400 font-mono ${
                      activeObstacle.pos === 'left' ? 'translate-x-8' : activeObstacle.pos === 'right' ? '-translate-x-8' : ''
                    }`}>
                      {activeObstacle.pos === 'left' ? '➔' : activeObstacle.pos === 'right' ? '⬅' : '⛔'}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Telemetry Bar */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/60 backdrop-blur-md">
                <span className="text-blue-300">Front YOLO Model: yolo_v26n_obstacle.pt (6.25 MB)</span>
                <span className="text-emerald-400 font-bold">Steering: {activeObstacle.avoidanceAction}</span>
                <span className="text-slate-300">Target Range: {activeObstacle.distanceM}m</span>
              </div>
            </div>
          </div>

          {/* 2. DUAL CANOPY AI SCOUT CAMERAS (LEFT & RIGHT) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* LEFT CAMERA: SCANS LEFT BED -> TRIGGERS SOLENOID 1 */}
            <div className="p-4 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-2.5 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${activeSpraySide === 'left' ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                  <span className="text-xs font-bold text-slate-100">Left Canopy AI Camera</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${
                  activeSpraySide === 'left'
                    ? 'bg-emerald-500 text-slate-950 font-black animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {activeSpraySide === 'left' ? '💦 Solenoid 1 Spraying' : '🎯 Target: Solenoid 1'}
                </span>
              </div>

              {/* Left Camera Preview Viewport */}
              <div className="relative h-36 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/60 to-slate-900" />
                
                {/* Left Spray Mist Animation */}
                {activeSpraySide === 'left' && (
                  <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-emerald-500/20 backdrop-blur-xs animate-pulse">
                    <div className="px-2.5 py-1 rounded-xl bg-emerald-950/90 border border-emerald-400 text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 animate-bounce text-emerald-400" />
                      <span>LEFT SPRAY PULSE (GPIO 33)</span>
                    </div>
                  </div>
                )}

                {/* Left Leaf Disease Box */}
                <div className={`absolute top-4 left-4 p-1.5 rounded-lg border text-[10px] font-mono ${
                  activeSpraySide === 'left'
                    ? 'border-emerald-400 bg-emerald-950/80 text-emerald-200'
                    : 'border-slate-700 bg-slate-900/60 text-slate-400'
                }`}>
                  <span className="font-bold block">Left Canopy Feed</span>
                  <span className="text-[9px] text-slate-400">Offline Standby | Solenoid 1</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1 font-mono">
                <span className="text-slate-400">Scans Left Bed Rows</span>
                <button
                  onClick={() => onSendSprayer(true, true, false)}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1"
                >
                  <Droplets className="w-3 h-3" /> Spray Left
                </button>
              </div>
            </div>

            {/* RIGHT CAMERA: SCANS RIGHT BED -> TRIGGERS SOLENOID 2 */}
            <div className="p-4 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-2.5 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${activeSpraySide === 'right' ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
                  <span className="text-xs font-bold text-slate-100">Right Canopy AI Camera</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${
                  activeSpraySide === 'right'
                    ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {activeSpraySide === 'right' ? '💦 Solenoid 2 Spraying' : '🎯 Target: Solenoid 2'}
                </span>
              </div>

              {/* Right Camera Preview Viewport */}
              <div className="relative h-36 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tl from-slate-950 to-slate-900" />
                
                {/* Right Spray Mist Animation */}
                {activeSpraySide === 'right' && (
                  <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-amber-500/20 backdrop-blur-xs animate-pulse">
                    <div className="px-2.5 py-1 rounded-xl bg-amber-950/90 border border-amber-400 text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 animate-bounce text-amber-400" />
                      <span>RIGHT SPRAY PULSE (GPIO 4)</span>
                    </div>
                  </div>
                )}

                {/* Right Leaf Disease Box */}
                <div className={`absolute top-4 right-4 p-1.5 rounded-lg border text-[10px] font-mono ${
                  activeSpraySide === 'right'
                    ? 'border-amber-400 bg-amber-950/80 text-amber-200'
                    : 'border-slate-700 bg-slate-900/60 text-slate-400'
                }`}>
                  <span className="font-bold block">Right Canopy Feed</span>
                  <span className="text-[9px] text-slate-400">Offline Standby | Solenoid 2</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1 font-mono">
                <span className="text-slate-400">Scans Right Bed Rows</span>
                <button
                  onClick={() => onSendSprayer(true, false, true)}
                  className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-bold flex items-center gap-1"
                >
                  <Droplets className="w-3 h-3" /> Spray Right
                </button>
              </div>
            </div>
          </div>

          {/* Auto-Sprayer Status Strip */}
          <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${autoSprayEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="font-bold text-slate-800">
                Autonomous Directional Interlock: {autoSprayEnabled ? 'ENABLED (Auto-Detect & Spray)' : 'PAUSED'}
              </span>
            </div>
            {lastSprayedInfo && (
              <span className="text-[11px] font-mono text-emerald-700 font-bold">
                Last: {lastSprayedInfo}
              </span>
            )}
            <button
              onClick={() => setAutoSprayEnabled(!autoSprayEnabled)}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-[11px]"
            >
              Toggle {autoSprayEnabled ? 'OFF' : 'ON'}
            </button>
          </div>

          {/* Virtual D-Pad / Driving Navigation Control */}
          <div className="flex flex-col items-center justify-center space-y-3 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Teleoperation D-Pad (or use Keyboard W / A / S / D keys)
            </span>

            {/* D-Pad Buttons */}
            <div className="grid grid-cols-3 gap-2 w-56">
              <div />
              {/* Forward */}
              <button
                onMouseDown={() => onSendMotors(throttle, throttle)}
                onMouseUp={() => onSendMotors(0, 0)}
                onTouchStart={() => onSendMotors(throttle, throttle)}
                onTouchEnd={() => onSendMotors(0, 0)}
                className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold flex flex-col items-center justify-center shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                title="Forward (W / Up)"
              >
                <ArrowUp className="w-6 h-6" />
                <span className="text-[10px] font-mono mt-0.5">FWD</span>
              </button>
              <div />

              {/* Turn Left (Spin) */}
              <button
                onMouseDown={() => onSendMotors(-throttle, throttle)}
                onMouseUp={() => onSendMotors(0, 0)}
                onTouchStart={() => onSendMotors(-throttle, throttle)}
                onTouchEnd={() => onSendMotors(0, 0)}
                className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold flex flex-col items-center justify-center shadow-md active:scale-95 transition-all"
                title="Pivot Left (A / Left)"
              >
                <ArrowLeft className="w-6 h-6" />
                <span className="text-[10px] font-mono mt-0.5">LEFT</span>
              </button>

              {/* STOP */}
              <button
                onClick={() => onSendMotors(0, 0)}
                className="p-4 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black flex flex-col items-center justify-center border border-rose-300 active:scale-95 transition-all"
                title="Stop Motors (Space)"
              >
                <Square className="w-6 h-6" />
                <span className="text-[10px] font-mono mt-0.5">STOP</span>
              </button>

              {/* Turn Right (Spin) */}
              <button
                onMouseDown={() => onSendMotors(throttle, -throttle)}
                onMouseUp={() => onSendMotors(0, 0)}
                onTouchStart={() => onSendMotors(throttle, -throttle)}
                onTouchEnd={() => onSendMotors(0, 0)}
                className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold flex flex-col items-center justify-center shadow-md active:scale-95 transition-all"
                title="Pivot Right (D / Right)"
              >
                <ArrowRight className="w-6 h-6" />
                <span className="text-[10px] font-mono mt-0.5">RIGHT</span>
              </button>

              <div />
              {/* Reverse */}
              <button
                onMouseDown={() => onSendMotors(-throttle, -throttle)}
                onMouseUp={() => onSendMotors(0, 0)}
                onTouchStart={() => onSendMotors(-throttle, -throttle)}
                onTouchEnd={() => onSendMotors(0, 0)}
                className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold flex flex-col items-center justify-center shadow-md active:scale-95 transition-all"
                title="Reverse (S / Down)"
              >
                <ArrowDown className="w-6 h-6" />
                <span className="text-[10px] font-mono mt-0.5">REV</span>
              </button>
              <div />
            </div>

            {/* Self-Test Trigger */}
            <div className="pt-2">
              <button
                onClick={handleSelfTestClick}
                disabled={rover.isSelfTesting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${rover.isSelfTesting ? 'animate-spin text-emerald-600' : ''}`} />
                <span>{rover.isSelfTesting ? 'Running Self-Test Sequence...' : 'Run Hardware Self-Test (Command: TEST)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Sprayer Relays & Serial Console (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sprayer Actuator Relays (Section 4 from ESP32 Code) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-600" />
                Sprayer Actuators & Directional Valves
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                P &lt;pump&gt; &lt;sol1_L&gt; &lt;sol2_R&gt;
              </span>
            </div>

            {/* Relay Switches */}
            <div className="space-y-2.5 text-xs">
              {/* Main 12V Diaphragm Pump (GPIO 32) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">12V Diaphragm Delivery Pump (GPIO 32)</span>
                  <span className="text-slate-400 text-[10px]">High-pressure chemical pump (Active LOW)</span>
                </div>
                <button
                  onClick={() => onSendSprayer(!rover.pumpState, rover.solenoid1State, rover.solenoid2State)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    rover.pumpState
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {rover.pumpState ? 'PUMP ON' : 'PUMP OFF'}
                </button>
              </div>

              {/* Solenoid Valve 1: Left Bed Nozzle (GPIO 33) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Solenoid 1: Left Bed Nozzle (GPIO 33)</span>
                  <span className="text-emerald-700 text-[10px] font-bold">Triggered by Left Camera AI Scout</span>
                </div>
                <button
                  onClick={() => onSendSprayer(rover.pumpState, !rover.solenoid1State, rover.solenoid2State)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    rover.solenoid1State
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {rover.solenoid1State ? 'LEFT OPEN' : 'LEFT CLOSED'}
                </button>
              </div>

              {/* Solenoid Valve 2: Right Bed Nozzle (GPIO 4) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Solenoid 2: Right Bed Nozzle (GPIO 4)</span>
                  <span className="text-amber-700 text-[10px] font-bold">Triggered by Right Camera AI Scout</span>
                </div>
                <button
                  onClick={() => onSendSprayer(rover.pumpState, rover.solenoid1State, !rover.solenoid2State)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    rover.solenoid2State
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {rover.solenoid2State ? 'RIGHT OPEN' : 'RIGHT CLOSED'}
                </button>
              </div>
            </div>

            {/* Quick Directional Treatment Presets */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => onSendSprayer(true, true, false)}
                className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Droplets className="w-3.5 h-3.5 text-emerald-700" />
                <span>Spray Left (P 1 1 0)</span>
              </button>

              <button
                onClick={() => onSendSprayer(true, false, true)}
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Droplets className="w-3.5 h-3.5 text-amber-700" />
                <span>Spray Right (P 1 0 1)</span>
              </button>

              <button
                onClick={() => onSendSprayer(true, true, true)}
                className="px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Droplets className="w-3.5 h-3.5 text-blue-700" />
                <span>Spray Both (P 1 1 1)</span>
              </button>

              <button
                onClick={() => onSendSprayer(false, false, false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Stop (P 0 0 0)
              </button>
            </div>
          </div>

          {/* Live Serial Terminal Console */}
          <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  ESP32 Serial Stream (/dev/ttyUSB0)
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                115200 BAUD
              </span>
            </div>

            {/* Log Stream Output */}
            <div
              ref={serialLogRef}
              className="h-44 overflow-y-auto font-mono text-[11px] space-y-1 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80"
            >
              {rover.logs.map((log) => (
                <div key={log.id} className="leading-tight flex items-start gap-2">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`font-bold shrink-0 ${
                      log.direction === 'TX'
                        ? 'text-blue-400'
                        : log.direction === 'RX'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {log.direction}:
                  </span>
                  <span className="text-slate-300 break-all">{log.text}</span>
                </div>
              ))}
            </div>

            {/* Command Input Box */}
            <form onSubmit={handleCustomCommandSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder='Type command (e.g. "M 60 60", "P 1 1 0", "STATUS")'
                value={customCmd}
                onChange={(e) => setCustomCmd(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
