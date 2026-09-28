import React, { useState, useEffect } from 'react';
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
  Settings as SettingsIcon,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Radio,
  Cpu,
  RefreshCw,
  Bell,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import {
  AIModelInfo,
  AlertItem,
  CameraDevice,
  CropHealthStat,
  DetectionResult,
  DiseaseDistributionItem,
  DiseaseRecommendation,
  FieldZone,
  NavigationPage,
  RoverState,
  SystemHardwareStatus,
  TrendDataPoint
} from './types';
import { apiService } from './services/mockApi';

// Common Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';

// Dashboard Components
import { StatCardsGroup } from './components/dashboard/StatCardsGroup';
import { DiseaseDetectionCard } from './components/dashboard/DiseaseDetectionCard';
import { DetectionResultCard } from './components/dashboard/DetectionResultCard';
import { CropHealthOverview } from './components/dashboard/CropHealthOverview';
import { DiseaseDistributionChart } from './components/dashboard/DiseaseDistributionChart';
import { DiseaseTrendChart } from './components/dashboard/DiseaseTrendChart';
import { AIProcessingPipeline } from './components/dashboard/AIProcessingPipeline';
import { RecentAlertsCard } from './components/dashboard/RecentAlertsCard';

// Rover Components
import { RoverControlPanel } from './components/rover/RoverControlPanel';
import { RoverTelemetryCard } from './components/rover/RoverTelemetryCard';

// Page Views
import { LiveCameraMonitoring } from './components/camera/LiveCameraMonitoring';
import { DetectionHistoryTable } from './components/history/DetectionHistoryTable';
import { FieldMonitoringView } from './components/field/FieldMonitoringView';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { ModelInformationView } from './components/models/ModelInformationView';
import { SystemHardwareView } from './components/hardware/SystemHardwareView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

export const App: React.FC = () => {
  // Navigation State
  const validPages: NavigationPage[] = ['dashboard', 'rover', 'detect', 'camera', 'health', 'history', 'field', 'recommendations', 'models', 'hardware', 'reports', 'settings'];
  const [currentPage, setCurrentPage] = useState<NavigationPage>(() => {
    const hash = window.location.hash.replace('#', '') as NavigationPage;
    return validPages.includes(hash) ? hash : 'dashboard';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Sync hash changes with navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavigationPage;
      if (validPages.includes(hash)) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: NavigationPage) => {
    window.location.hash = page;
    setCurrentPage(page);
  };

  // Application Data States (Initialized empty in Offline Mode)
  const [crops, setCrops] = useState<CropHealthStat[]>([]);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [activeResult, setActiveResult] = useState<DetectionResult | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [activeModelId, setActiveModelId] = useState('model-mobilenetv2');
  const [distribution, setDistribution] = useState<DiseaseDistributionItem[]>([]);
  const [trendRange, setTrendRange] = useState<'7d' | '30d' | '3m'>('7d');
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [fieldZones, setFieldZones] = useState<FieldZone[]>([]);
  const [hardware, setHardware] = useState<SystemHardwareStatus | null>(null);
  const [recommendations, setRecommendations] = useState<DiseaseRecommendation[]>([]);
  const [rover, setRover] = useState<RoverState | null>(null);

  // Inference state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    const initData = async () => {
      const online = await apiService.checkBackendHealth();
      setIsBackendOnline(online);

      const [
        fetchedCrops,
        fetchedDetections,
        fetchedCameras,
        fetchedAlerts,
        fetchedModels,
        fetchedDist,
        fetchedTrends,
        fetchedFields,
        fetchedHardware,
        fetchedRecs,
        fetchedRover,
      ] = await Promise.all([
        apiService.getCropHealth(),
        apiService.getDetections(),
        apiService.getCameras(),
        apiService.getAlerts(),
        apiService.getAIModels(),
        apiService.getDiseaseDistribution(),
        apiService.getTrends('7d'),
        apiService.getFieldZones(),
        apiService.getSystemHardwareStatus(),
        apiService.getRecommendations(),
        apiService.getRoverState(),
      ]);

      setCrops(fetchedCrops);
      setDetections(fetchedDetections);
      if (fetchedDetections.length > 0) {
        setActiveResult(fetchedDetections[0]);
      } else {
        setActiveResult(null);
      }
      setCameras(fetchedCameras);
      setAlerts(fetchedAlerts);
      setModels(fetchedModels);
      setDistribution(fetchedDist);
      setTrendData(fetchedTrends);
      setFieldZones(fetchedFields);
      setHardware(fetchedHardware);
      setRecommendations(fetchedRecs);
      setRover(fetchedRover);
    };

    initData();
  }, []);

  // Periodic health check & telemetry poll
  useEffect(() => {
    const timer = setInterval(async () => {
      const online = await apiService.checkBackendHealth();
      setIsBackendOnline(online);
      const [hw, rov] = await Promise.all([
        apiService.getSystemHardwareStatus(),
        apiService.getRoverState(),
      ]);
      setHardware(hw);
      setRover(rov);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleRangeChange = async (range: '7d' | '30d' | '3m') => {
    setTrendRange(range);
    const data = await apiService.getTrends(range);
    setTrendData(data);
  };

  const handleAnalyzeImage = async (source: string | File) => {
    setIsAnalyzing(true);
    try {
      const result = await apiService.detectPlantDisease(source, activeModelId);
      setActiveResult(result);
      
      // Refresh dynamic metrics
      const [updatedDets, updatedCrops, updatedDist, updatedTrends, updatedAlerts, updatedRecs] = await Promise.all([
        apiService.getDetections(),
        apiService.getCropHealth(),
        apiService.getDiseaseDistribution(),
        apiService.getTrends(trendRange),
        apiService.getAlerts(),
        apiService.getRecommendations(),
      ]);

      setDetections(updatedDets);
      setCrops(updatedCrops);
      setDistribution(updatedDist);
      setTrendData(updatedTrends);
      setAlerts(updatedAlerts);
      setRecommendations(updatedRecs);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveDetection = async (item: DetectionResult) => {
    await apiService.saveDetection(item);
    const updated = await apiService.getDetections();
    setDetections(updated);
  };

  const handleUpdateCrops = async (updated: CropHealthStat[]) => {
    const saved = await apiService.updateCropHealth(updated);
    setCrops(saved);
  };

  const handleToggleCameraAI = async (id: string, active: boolean) => {
    await apiService.toggleCameraAI(id, active);
    const cams = await apiService.getCameras();
    setCameras(cams);
  };

  const handleCaptureFrameToDetection = (frameUrl: string, cameraName: string) => {
    setCurrentPage('detect');
    handleAnalyzeImage(frameUrl);
  };

  const handleMarkAlertRead = async (id: string) => {
    await apiService.markAlertRead(id);
    const alts = await apiService.getAlerts();
    setAlerts(alts);
  };

  const handleRefreshHardware = async () => {
    const hw = await apiService.getSystemHardwareStatus();
    setHardware(hw);
  };

  // Rover Handlers
  const handleSendRoverMotors = async (left: number, right: number) => {
    const updated = await apiService.sendRoverMotors(left, right);
    setRover(updated);
  };

  const handleSendRoverSprayer = async (pump: boolean, sol1: boolean, sol2: boolean) => {
    const updated = await apiService.sendRoverSprayer(pump, sol1, sol2);
    setRover(updated);
  };

  const handleRoverEmergencyStop = async () => {
    const updated = await apiService.sendRoverEmergencyStop();
    setRover(updated);
  };

  const handleRoverPing = async () => {
    const updated = await apiService.sendRoverPing();
    setRover(updated);
  };

  const handleRoverSelfTest = async () => {
    const updated = await apiService.sendRoverSelfTest();
    setRover(updated);
  };

  const handleRoverRawSerial = async (cmd: string) => {
    const updated = await apiService.sendRoverRawSerialCommand(cmd);
    setRover(updated);
  };

  // Active Model Name
  const currentModel = models.find(m => m.id === activeModelId) || models[0];

  // Dynamic calculations from real data
  const cropsCount = crops.length;
  const healthyPercentage = crops.length > 0 
    ? Math.round(crops.reduce((acc, c) => acc + c.healthyPct, 0) / crops.length) 
    : 0;
  const detectedDiseasesCount = detections.filter(d => d.severity !== 'Healthy').length;

  const pageTitles: Record<NavigationPage, string> = {
    dashboard: 'AgriRakshak Executive Dashboard',
    rover: 'AgriRakshak Rover Actuation & Teleoperation',
    detect: 'AI Plant Pathology Diagnostics',
    camera: 'Intel RealSense & Optical Field Surveillance',
    health: 'Farm Crop Health & Canopy Vitality',
    history: 'Diagnostic Ledger & Detection History',
    field: 'Field Spatial Map & Micro-climate',
    recommendations: 'Agronomy Treatment Protocols',
    models: 'AI Neural Inference Architectures',
    hardware: 'Raspberry Pi & Sensor Telemetry',
    reports: 'Plant Pathology Audit Certification',
    settings: 'Dashboard & Node Preferences',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        unreadAlertCount={alerts.filter(a => !a.read).length}
        isOffline={!isBackendOnline}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-12">
        {/* Sticky Header */}
        <Header
          alerts={alerts}
          onNavigate={(page) => setCurrentPage(page)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onMarkAlertRead={handleMarkAlertRead}
          onSelectAlert={() => setCurrentPage('dashboard')}
          currentPageTitle={pageTitles[currentPage]}
          isOffline={!isBackendOnline}
        />

        {/* System Offline Mode Notice Banner */}
        {!isBackendOnline && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="flex-1">
                <span className="font-extrabold mr-1">System in Offline Mode:</span>
                <span>
                  External hardware sensors and backend server are disconnected. Edge AI diagnostics will process local leaf photo uploads.
                </span>
              </div>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                Standby Mode
              </span>
            </div>
          </div>
        )}

        {/* Page Views Switcher */}
        <main id="main-dashboard-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* 1. DASHBOARD PAGE */}
          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              {/* Top 4 Key Statistics Cards */}
              <StatCardsGroup
                cropsCount={cropsCount}
                healthyPercentage={healthyPercentage}
                detectedThisMonth={detectedDiseasesCount}
                aiAccuracy={currentModel ? currentModel.accuracyTop1 : 95.0}
                isOffline={!isBackendOnline && detections.length === 0}
                onNavigate={setCurrentPage}
              />

              {/* AgriRakshak Rover Quick Telemetry & Actuator Card */}
              {rover && (
                <RoverTelemetryCard
                  rover={rover}
                  onNavigate={setCurrentPage}
                  onEmergencyStop={handleRoverEmergencyStop}
                  onSendSprayer={handleSendRoverSprayer}
                />
              )}

              {/* Primary AI Workflow: Disease Detection Card & Result Card */}
              <div className="space-y-6">
                <DiseaseDetectionCard
                  onAnalyzeImage={handleAnalyzeImage}
                  isAnalyzing={isAnalyzing}
                  selectedModelName={currentModel?.name || 'MobileNetV2 Plant Disease Classifier'}
                />

                {activeResult && (
                  <DetectionResultCard
                    result={activeResult}
                    onNavigate={setCurrentPage}
                    onSaveDetection={handleSaveDetection}
                  />
                )}
              </div>

              {/* Crop Health Overview */}
              <CropHealthOverview
                crops={crops}
                onUpdateCrops={handleUpdateCrops}
              />

              {/* Charts Grid: Donut Distribution & Detection Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <DiseaseDistributionChart
                    data={distribution}
                    totalDetections={detections.length}
                  />
                </div>
                <div className="lg:col-span-7">
                  <DiseaseTrendChart
                    trendData={trendData}
                    selectedRange={trendRange}
                    onRangeChange={handleRangeChange}
                  />
                </div>
              </div>

              {/* AI Processing Status Pipeline */}
              <AIProcessingPipeline />

              {/* Recent Alerts Panel */}
              <RecentAlertsCard
                alerts={alerts}
                onMarkRead={handleMarkAlertRead}
                onNavigate={setCurrentPage}
              />
            </div>
          )}

          {/* 2. AGRI-RAKSHAK ROVER TELEOPERATION PAGE */}
          {currentPage === 'rover' && rover && (
            <RoverControlPanel
              rover={rover}
              onSendMotors={handleSendRoverMotors}
              onSendSprayer={handleSendRoverSprayer}
              onEmergencyStop={handleRoverEmergencyStop}
              onSendPing={handleRoverPing}
              onSendSelfTest={handleRoverSelfTest}
              onSendRawSerial={handleRoverRawSerial}
            />
          )}

          {/* 3. DISEASE DETECTION DEDICATED PAGE */}
          {currentPage === 'detect' && (
            <div className="space-y-6">
              <DiseaseDetectionCard
                onAnalyzeImage={handleAnalyzeImage}
                isAnalyzing={isAnalyzing}
                selectedModelName={currentModel?.name || 'MobileNetV2'}
              />

              {activeResult && (
                <DetectionResultCard
                  result={activeResult}
                  onNavigate={setCurrentPage}
                  onSaveDetection={handleSaveDetection}
                />
              )}
            </div>
          )}

          {/* 4. LIVE CAMERA MONITORING */}
          {currentPage === 'camera' && (
            <LiveCameraMonitoring
              cameras={cameras}
              onToggleCameraAI={handleToggleCameraAI}
              onCaptureFrameToDetection={handleCaptureFrameToDetection}
              onNavigate={setCurrentPage}
            />
          )}

          {/* 5. CROP HEALTH */}
          {currentPage === 'health' && (
            <div className="space-y-6">
              <CropHealthOverview
                crops={crops}
                onUpdateCrops={handleUpdateCrops}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DiseaseDistributionChart
                  data={distribution}
                  totalDetections={detections.length}
                />
                <DiseaseTrendChart
                  trendData={trendData}
                  selectedRange={trendRange}
                  onRangeChange={handleRangeChange}
                />
              </div>
            </div>
          )}

          {/* 6. DETECTION HISTORY */}
          {currentPage === 'history' && (
            <DetectionHistoryTable
              detections={detections}
              onSelectDetection={(d) => {
                setActiveResult(d);
                setCurrentPage('detect');
              }}
            />
          )}

          {/* 7. FIELD MONITORING */}
          {currentPage === 'field' && (
            <FieldMonitoringView
              fields={fieldZones}
              onNavigate={setCurrentPage}
            />
          )}

          {/* 8. RECOMMENDATIONS */}
          {currentPage === 'recommendations' && (
            <RecommendationsView
              recommendations={recommendations}
              onNavigate={setCurrentPage}
            />
          )}

          {/* 9. AI MODELS */}
          {currentPage === 'models' && (
            <ModelInformationView
              models={models}
              activeModelId={activeModelId}
              onSelectModel={(id) => setActiveModelId(id)}
            />
          )}

          {/* 10. SYSTEM HARDWARE */}
          {currentPage === 'hardware' && hardware && (
            <SystemHardwareView
              hardware={hardware}
              onRefresh={handleRefreshHardware}
            />
          )}

          {/* 11. REPORTS */}
          {currentPage === 'reports' && (
            <ReportsView
              detections={detections}
              crops={crops}
            />
          )}

          {/* 12. SETTINGS */}
          {currentPage === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around lg:hidden shadow-lg">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold ${
            currentPage === 'dashboard' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentPage('rover')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold ${
            currentPage === 'rover' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <Gamepad2 className="w-5 h-5 text-emerald-600" />
          <span>Rover</span>
        </button>

        <button
          onClick={() => setCurrentPage('detect')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold ${
            currentPage === 'detect' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <Scan className="w-5 h-5" />
          <span>Detect</span>
        </button>

        <button
          onClick={() => setCurrentPage('camera')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold ${
            currentPage === 'camera' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span>Cameras</span>
        </button>

        <button
          onClick={() => setCurrentPage('history')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold ${
            currentPage === 'history' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <History className="w-5 h-5" />
          <span>History</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
