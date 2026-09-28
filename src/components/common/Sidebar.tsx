import React from 'react';
import {
  LayoutDashboard,
  Gamepad2,
  Scan,
  Camera,
  Activity,
  History,
  MapPin,
  Lightbulb,
  FileText,
  Settings,
  Cpu,
  Radio,
  Eye,
  ShieldCheck,
  X,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { NavigationPage } from '../../types';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  unreadAlertCount?: number;
  isOffline?: boolean;
}

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  unreadAlertCount = 0,
  isOffline = true,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rover', label: 'Rover Control', icon: Gamepad2, badge: isOffline ? 'Offline' : 'ESP32', badgeColor: isOffline ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    { id: 'detect', label: 'Disease Detection', icon: Scan, badge: 'AI', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'camera', label: 'Live Camera', icon: Camera, badge: isOffline ? 'Offline' : '2 Feeds', badgeColor: isOffline ? 'bg-slate-800 text-slate-400' : 'bg-blue-100 text-blue-800' },
    { id: 'health', label: 'Crop Health', icon: Activity },
    { id: 'history', label: 'Detection History', icon: History },
    { id: 'field', label: 'Field Monitoring', icon: MapPin },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30">
            <Scan className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">AgriRakshak</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold tracking-wide uppercase">
              AI Crop Doctor
            </p>
          </div>
        </div>

        {/* Mobile Close */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 group text-left ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/50'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-700/80 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hardware & Edge Status Panel at bottom of sidebar */}
      <div className="p-3 border-t border-slate-800/90 bg-slate-950/60 space-y-2">
        <div className="px-2 pt-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Edge Hardware Status</span>
          <span className="flex h-1.5 w-1.5 relative">
            {isOffline ? (
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </>
            )}
          </span>
        </div>

        <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800/80 space-y-1.5 text-[11px]">
          {/* System Status */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              System Status
            </span>
            {isOffline ? (
              <span className="font-semibold text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Offline Mode
              </span>
            ) : (
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            )}
          </div>

          {/* Camera Status */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Camera className="w-3 h-3 text-slate-400" />
              Camera Status
            </span>
            {isOffline ? (
              <span className="font-semibold text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                Offline (0/3)
              </span>
            ) : (
              <span className="font-semibold text-blue-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                2 Connected
              </span>
            )}
          </div>

          {/* AI Model Status */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              AI Model Status
            </span>
            <span className="font-semibold text-amber-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              MobileNetV2 (Edge)
            </span>
          </div>

          {/* Raspberry Pi Connection */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-slate-400" />
              Raspberry Pi
            </span>
            {isOffline ? (
              <span className="font-semibold text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                Disconnected
              </span>
            ) : (
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Connected
              </span>
            )}
          </div>
        </div>

        {/* User Profile Card */}
        <div
          onClick={() => handleNavClick('settings')}
          className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800/60"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center ring-1 ring-emerald-500">
              FJ
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Farmer John</p>
              <p className="text-[10px] text-slate-400">Green Valley Agro</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
