import React from 'react';
import { Sprout, HeartPulse, Bug, Gauge } from 'lucide-react';
import { StatCard } from '../common/StatCard';

interface StatCardsGroupProps {
  cropsCount?: number;
  healthyPercentage?: number;
  detectedThisMonth?: number;
  aiAccuracy?: number;
  isOffline?: boolean;
  onNavigate?: (page: any) => void;
}

export const StatCardsGroup: React.FC<StatCardsGroupProps> = ({
  cropsCount = 0,
  healthyPercentage = 0,
  detectedThisMonth = 0,
  aiAccuracy = 95.0,
  isOffline = false,
  onNavigate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Card 1 – Crops Monitored */}
      <StatCard
        title="Crops Monitored"
        value={cropsCount > 0 ? cropsCount : isOffline ? '--' : 0}
        subtitle={cropsCount > 0 ? 'Active farm cultivars' : 'No crops registered'}
        icon={Sprout}
        accentColor="emerald"
        trend={cropsCount > 0 ? { value: `${cropsCount}`, isPositive: true, label: "cultivars" } : undefined}
        onClick={() => onNavigate?.('health')}
      />

      {/* Card 2 – Healthy Plants */}
      <StatCard
        title="Canopy Vitality"
        value={cropsCount > 0 ? `${healthyPercentage}%` : isOffline ? '--' : '0%'}
        subtitle={cropsCount > 0 ? 'Overall health score' : 'Awaiting sensor scans'}
        icon={HeartPulse}
        accentColor="emerald"
        circularProgress={cropsCount > 0 ? { percentage: healthyPercentage } : undefined}
        onClick={() => onNavigate?.('health')}
      />

      {/* Card 3 – Diseases Detected */}
      <StatCard
        title="Diseases Detected"
        value={detectedThisMonth}
        subtitle={detectedThisMonth > 0 ? 'Pathology flags this session' : '0 active infections'}
        icon={Bug}
        accentColor="rose"
        onClick={() => onNavigate?.('history')}
      />

      {/* Card 4 – AI Accuracy / Confidence */}
      <StatCard
        title="Edge AI Model"
        value={`${aiAccuracy}%`}
        subtitle="MobileNetV2 Validation"
        icon={Gauge}
        accentColor="blue"
        liveBadge={isOffline ? "Edge Local Engine" : "Live AI Analysis"}
        tooltip="MobileNetV2 edge model benchmark accuracy on PlantVillage 38 class dataset."
        onClick={() => onNavigate?.('models')}
      />
    </div>
  );
};
