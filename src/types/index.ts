export type NavigationPage = 
  | 'dashboard'
  | 'rover'
  | 'detect'
  | 'camera'
  | 'health'
  | 'history'
  | 'field'
  | 'recommendations'
  | 'models'
  | 'hardware'
  | 'reports'
  | 'settings';

export interface RoverState {
  leftSpeed: number; // -100 to 100
  rightSpeed: number; // -100 to 100
  pumpState: boolean;
  solenoid1State: boolean; // Solenoid 1: Blight Treatment
  solenoid2State: boolean; // Solenoid 2: Mold/Rust Treatment
  batteryVoltage: number; // e.g. 12.4V from ADC
  temperature: number; // °C from DHT11
  humidity: number; // % from DHT11
  soilMoisture: number; // % from Soil ADC
  connectionStatus: 'Connected' | 'Disconnected' | 'Watchdog Alert';
  watchdogTriggered: boolean;
  lastCommandSent: string;
  lastHeartbeatTime: string;
  isSelfTesting: boolean;
  serialPort: string;
  baudRate: number;
  logs: {
    id: string;
    timestamp: string;
    direction: 'TX' | 'RX' | 'SYS';
    text: string;
  }[];
}

export type DiseaseSeverity = 'Low' | 'Moderate' | 'Severe' | 'Healthy';

export interface DetectionResult {
  id: string;
  timestamp: string;
  crop: string;
  disease: string;
  confidence: number;
  detectionTimeSeconds: number;
  model: string;
  severity: DiseaseSeverity;
  affectedAreaPercentage: number | null; // null if segmentation not available
  imageUrl: string;
  cameraSource?: string;
  status: 'Confirmed' | 'Review' | 'Dismissed';
  notes?: string;
  immediateAction: string;
  preventiveAction: string;
  monitoringRecommendation: string;
}

export interface CropHealthStat {
  id: string;
  name: string;
  scientificName: string;
  healthyPct: number;
  atRiskPct: number;
  diseasedPct: number;
  totalPlants: number;
  iconName: string;
  color: string;
}

export interface DiseaseDistributionItem {
  name: string;
  count: number;
  color: string;
}

export interface TrendDataPoint {
  date: string;
  detections: number;
  healthyScans: number;
  criticalAlerts: number;
}

export interface RealSenseDepthData {
  model: string; // Intel RealSense D435i
  distanceToTargetM: number;
  obstacleClearanceM: number;
  pathCorridorStatus: 'Path Clear' | 'Caution: Furrow Narrowing' | 'Obstacle Detected';
  depthResolution: string;
  fps: number;
  activeColormap: 'Jet Heatmap' | 'Turbo' | 'Infrared 1' | 'Point Cloud 3D';
  fovHorizontalDeg: number;
  fovVerticalDeg: number;
  autoBrakingTriggered: boolean;
}

export interface CameraDevice {
  id: string;
  name: string;
  location: string;
  status: 'Online' | 'Offline' | 'Warning';
  resolution: string;
  fps: number;
  fieldId: string;
  streamUrl: string;
  aiDetectionActive: boolean;
  leafBoxActive: boolean;
  lastDetection?: string;
  isDepthCamera?: boolean;
  depthData?: RealSenseDepthData;
}

export interface FieldZone {
  id: string;
  name: string;
  areaAcres: number;
  crop: string;
  overallHealthPct: number;
  activeDetectionsCount: number;
  lastScanTime: string;
  soilMoisturePct: number;
  ambientTempC: number;
  humidityPct: number;
  gridCells: {
    x: number;
    y: number;
    status: 'Healthy' | 'At Risk' | 'Disease Detected';
    label: string;
    details?: string;
  }[];
}

export interface AlertItem {
  id: string;
  timestamp: string;
  priority: 'High' | 'Medium' | 'System';
  title: string;
  description: string;
  crop?: string;
  field?: string;
  read: boolean;
}

export interface AIModelInfo {
  id: string;
  name: string;
  architecture: string;
  inputSize: string;
  classesCount: number;
  parameterCount: string;
  task: string;
  latencyEdgeMs: number;
  accuracyTop1: number;
  isActive: boolean;
  supportedCrops: string[];
  warningNote?: string;
  recommendedDeployment: 'Edge (Raspberry Pi)' | 'Cloud / Server GPU';
}

export interface SystemHardwareStatus {
  edgeDevice: {
    name: string;
    model: string;
    status: 'Online' | 'Offline';
    uptime: string;
    ipAddress: string;
  };
  cameras: {
    name: string;
    type: string;
    status: 'Connected' | 'Disconnected';
    fps: number;
  }[];
  inferenceEngine: {
    name: string;
    status: 'Running' | 'Paused' | 'Error';
    currentModel: string;
    averageLatencyMs: number;
  };
  network: {
    type: string;
    status: 'Connected' | 'Unstable' | 'Disconnected';
    latencyMs: number;
    signalStrength: string;
  };
  metrics: {
    cpuUsagePct: number;
    ramUsageGb: number;
    ramTotalGb: number;
    temperatureC: number;
    diskUsagePct: number;
  };
}

export interface DiseaseRecommendation {
  crop: string;
  disease: string;
  confidence: number;
  severity: DiseaseSeverity;
  immediateActions: string[];
  preventiveActions: string[];
  monitoringFrequency: string;
  organicControls: string[];
  fieldSanitationTips: string[];
  verifiedSource: string;
}
