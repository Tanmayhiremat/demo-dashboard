import React from 'react';
import {
  Gamepad2,
  Zap,
  Droplets,
  Battery,
  ShieldAlert,
  ChevronRight,
  Radio,
  ArrowUp,
  Square,
  WifiOff
} from 'lucide-react';
import { RoverState, NavigationPage } from '../../types';

interface RoverTelemetryCardProps {
  rover: RoverState;
  onNavigate: (page: NavigationPage) => void;
  onEmergencyStop: () => Promise<void>;
  onSendSprayer: (pump: boolean, sol1: boolean, sol2: boolean) => Promise<void>;
}

export const RoverTelemetryCard: React.FC<RoverTelemetryCardProps> = ({
  rover,
  onNavigate,
  onEmergencyStop,
  onSendSprayer,
}) => {
  const isOffline = rover.connectionStatus !== 'Connected';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                AgriRakshak Rover Status & Actuators
              </h2>
              {isOffline ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  ESP32 Offline (Standby)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ESP32 Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Autonomous mobile field rover with precision BTS7960 motors and chemical spray valves
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEmergencyStop}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> ESTOP
          </button>
          <button
            onClick={() => onNavigate('rover')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/20 flex items-center gap-1 transition-all"
          >
            <span>Rover Controls</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Telemetry Quick Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Battery */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] uppercase">
            <span>Battery (GPIO 34)</span>
            <Battery className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="font-mono font-black text-slate-900 text-base">
            {isOffline ? '-- V' : `${rover.batteryVoltage.toFixed(2)}V`}
          </p>
          <span className="text-[10px] text-slate-400 font-medium block">
            {isOffline ? 'Sensor Disconnected' : '12V Bus Nominal'}
          </span>
        </div>

        {/* Motors */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] uppercase">
            <span>BTS7960 Motors</span>
            <Zap className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="font-mono font-black text-slate-900 text-base">
            L: {rover.leftSpeed}% | R: {rover.rightSpeed}%
          </p>
          <span className="text-[10px] text-slate-400 block">
            {isOffline ? 'Standby (0% PWM)' : 'PWM 1000Hz Output'}
          </span>
        </div>

        {/* Sprayer Pump */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] uppercase">
            <span>12V Pump (GPIO 32)</span>
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="font-mono font-black text-slate-900 text-base">
            {rover.pumpState ? 'ACTIVE (ON)' : 'IDLE (OFF)'}
          </p>
          <span className="text-[10px] text-slate-400 font-medium block">
            {rover.solenoid1State ? 'V1 Active' : rover.solenoid2State ? 'V2 Active' : 'Valves Closed'}
          </span>
        </div>

        {/* Soil Moisture */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] uppercase">
            <span>Soil ADC (GPIO 35)</span>
            <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-slate-400' : 'bg-emerald-500'}`} />
          </div>
          <p className="font-mono font-black text-slate-900 text-base">
            {isOffline ? '-- %' : `${rover.soilMoisture.toFixed(1)}%`}
          </p>
          <span className="text-[10px] text-slate-400 block">
            {isOffline ? 'DHT11: Offline' : `DHT11: ${rover.temperature}°C / ${rover.humidity}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
