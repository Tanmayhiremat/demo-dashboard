import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Menu,
  Presentation
} from 'lucide-react';
import { AlertItem, NavigationPage } from '../../types';
import { PPTExportModal } from './PPTExportModal';
import { WifiOff } from 'lucide-react';

interface HeaderProps {
  alerts: AlertItem[];
  onNavigate: (page: NavigationPage) => void;
  onOpenMobileMenu: () => void;
  onMarkAlertRead: (id: string) => void;
  onSelectAlert: (alert: AlertItem) => void;
  currentPageTitle?: string;
  isOffline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  alerts,
  onNavigate,
  onOpenMobileMenu,
  onMarkAlertRead,
  onSelectAlert,
  currentPageTitle = 'AgriRakshak Dashboard',
  isOffline = true,
}) => {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPPTModal, setShowPPTModal] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.read);

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Hamburger & Greetings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight">
                  Good Morning, Farmer
                </h1>
                {isOffline ? (
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                    <WifiOff className="w-3 h-3 mr-1 text-amber-600" />
                    Offline Mode
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                    AI Active
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Monitor your crops and detect plant diseases using AI.
              </p>
            </div>
          </div>

          {/* Mobile Right Icons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>

        {/* Right Section: Date, Notifications, User Profile */}
        <div className="hidden md:flex items-center gap-3">
          {/* Date Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-600 shadow-xs">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{currentDate}</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-600 hover:text-slate-900 transition-all duration-150 shadow-xs"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fadeIn">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">Field Alerts</span>
                    {unreadAlerts.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        {unreadAlerts.length} new
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">Live AI feed</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      <p className="font-bold text-slate-600 mb-0.5">No Active Alerts</p>
                      <p className="text-[11px]">System is operating in offline mode.</p>
                    </div>
                  ) : (
                    alerts.map(alert => (
                      <div
                        key={alert.id}
                        onClick={() => {
                          onMarkAlertRead(alert.id);
                          onSelectAlert(alert);
                          setShowAlertsDropdown(false);
                        }}
                        className={`p-3.5 text-left cursor-pointer hover:bg-slate-50/80 transition-colors ${
                          !alert.read ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {alert.priority === 'High' ? (
                              <span className="h-2 w-2 rounded-full bg-rose-500 block ring-4 ring-rose-100" />
                            ) : alert.priority === 'Medium' ? (
                              <span className="h-2 w-2 rounded-full bg-amber-500 block ring-4 ring-amber-100" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-emerald-500 block ring-4 ring-emerald-100" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{alert.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{alert.description}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowAlertsDropdown(false);
                      onNavigate('dashboard');
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    View Alert Center
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick AI Disease Scan Button */}
          <button
            onClick={() => onNavigate('detect')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scan Plant</span>
          </button>

          {/* Export Slide for PPT Button */}
          <button
            onClick={() => setShowPPTModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Export full resolution slide image for PowerPoint presentations"
          >
            <Presentation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export for PPT</span>
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-200">
                FJ
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">Farmer John</p>
                <p className="text-[10px] text-slate-500">Green Valley Agro</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-800">Johnathan Miller</p>
                  <p className="text-[10px] text-slate-500">Farm ID: GVA-8842</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium">
                    {isOffline ? (
                      <span className="text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> System: Offline Mode
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Edge Sync: Online
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" /> Farm Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('hardware');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Info className="w-3.5 h-3.5 text-slate-500" /> Hardware Health
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PPT Slide Export Modal */}
      <PPTExportModal
        isOpen={showPPTModal}
        onClose={() => setShowPPTModal(false)}
        currentTitle={currentPageTitle}
      />
    </header>
  );
};
