import React, { useState } from 'react';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Check,
  ChevronRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { AlertItem } from '../../types';
import { Modal } from '../common/Modal';

interface RecentAlertsCardProps {
  alerts: AlertItem[];
  onMarkRead: (id: string) => Promise<void>;
  onNavigate?: (page: any) => void;
}

export const RecentAlertsCard: React.FC<RecentAlertsCardProps> = ({
  alerts,
  onMarkRead,
  onNavigate,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const getPriorityStyle = (priority: AlertItem['priority']) => {
    switch (priority) {
      case 'High':
        return {
          icon: AlertOctagon,
          iconColor: 'text-rose-600',
          bgColor: 'bg-rose-50 border-rose-200',
          dot: 'bg-rose-500',
          badge: 'High Priority',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      case 'Medium':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          bgColor: 'bg-amber-50 border-amber-200',
          dot: 'bg-amber-500',
          badge: 'Medium Priority',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'System':
      default:
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
          bgColor: 'bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-500',
          badge: 'System Notification',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Recent Alerts
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {alerts.filter(a => !a.read).length} unread
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium mb-4">
          Autonomous safety triggers and sensor telemetry alerts
        </p>
      </div>

      <div className="space-y-3 my-2 flex-1">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl my-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-700">No Active Pathology Alerts</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              System is in Offline Mode. Automated triggers and sensor warnings will be recorded here.
            </p>
          </div>
        ) : (
          alerts.slice(0, 3).map((alert) => {
            const style = getPriorityStyle(alert.priority);
            const Icon = style.icon;
            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border transition-all ${style.bgColor} ${
                  alert.read ? 'opacity-70' : 'shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-xl bg-white shadow-xs ${style.iconColor} shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badgeClass}`}>
                          {style.badge}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {alert.timestamp}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        {alert.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {alert.description}
                      </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 text-xs shadow-xs"
                    title="View details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {!alert.read && (
                    <button
                      onClick={() => onMarkRead(alert.id)}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-emerald-100 text-emerald-700 text-xs shadow-xs"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">Showing top field triggers</span>
        <button
          onClick={() => onNavigate?.('history')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          View Full History <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Alert Detail Modal */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert?.title || 'Alert Details'}
        subtitle={`Triggered: ${selectedAlert?.timestamp} | Priority: ${selectedAlert?.priority}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="leading-relaxed">{selectedAlert?.description}</p>
            {selectedAlert?.crop && (
              <div className="pt-2 flex items-center gap-2 border-t border-slate-200">
                <span className="font-bold text-slate-600">Affected Crop:</span>
                <span className="text-emerald-700 font-bold">{selectedAlert.crop}</span>
                {selectedAlert.field && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-slate-600">Location:</span>
                    <span className="text-slate-800">{selectedAlert.field}</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                if (selectedAlert) onMarkRead(selectedAlert.id);
                setSelectedAlert(null);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
            >
              Mark as Handled
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
