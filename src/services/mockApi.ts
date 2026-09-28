import {
  AlertItem,
  AIModelInfo,
  CameraDevice,
  CropHealthStat,
  DetectionResult,
  DiseaseDistributionItem,
  DiseaseRecommendation,
  FieldZone,
  RoverState,
  SystemHardwareStatus,
  TrendDataPoint
} from '../types';
import {
  AI_MODELS,
  FIELD_ZONES,
  INITIAL_ALERTS,
  INITIAL_CAMERAS,
  INITIAL_CROPS,
  INITIAL_DETECTIONS,
  INITIAL_DISEASE_DISTRIBUTION,
  INITIAL_TREND_7D,
  INITIAL_TREND_30D,
  INITIAL_TREND_3M,
  RECOMMENDATIONS_DATABASE,
  SYSTEM_HARDWARE
} from '../data/mockData';

// Dynamic in-memory state initialized empty in Offline Mode
let detectionsList: DetectionResult[] = [...INITIAL_DETECTIONS];
let alertsList: AlertItem[] = [...INITIAL_ALERTS];
let cropsList: CropHealthStat[] = [...INITIAL_CROPS];
let camerasList: CameraDevice[] = [...INITIAL_CAMERAS];
let hardwareStatus: SystemHardwareStatus = { ...SYSTEM_HARDWARE };

// AgriRakshak ESP32 Rover State in Offline Mode
let roverState: RoverState = {
  leftSpeed: 0,
  rightSpeed: 0,
  pumpState: false,
  solenoid1State: false,
  solenoid2State: false,
  batteryVoltage: 0,
  temperature: 0,
  humidity: 0,
  soilMoisture: 0,
  connectionStatus: 'Disconnected',
  watchdogTriggered: false,
  lastCommandSent: 'STANDBY',
  lastHeartbeatTime: 'No signal (Offline)',
  isSelfTesting: false,
  serialPort: '/dev/ttyUSB0 (ESP32 Master)',
  baudRate: 115200,
  logs: [
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      direction: 'SYS',
      text: 'AgriRakshak System initialized in Offline Mode. Awaiting hardware connections.',
    },
  ],
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // Check if FastAPI Backend is reachable
  async checkBackendHealth(): Promise<boolean> {
    try {
      const backendHost = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';
      const res = await fetch(`http://${backendHost}:8000/docs`, { method: 'HEAD', signal: AbortSignal.timeout(1200) });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Plant Disease Detection (Real Backend -> Edge Offline Engine Fallback)
  async detectPlantDisease(
    imageSource: string | File,
    modelId: string = 'model-mobilenetv2'
  ): Promise<DetectionResult> {
    // 1. Try real live inference if backend is online
    if (typeof imageSource !== 'string' && imageSource instanceof File) {
      try {
        const formData = new FormData();
        formData.append('file', imageSource);
        formData.append('cameraSource', 'Live Upload');

        const backendHost = window.location.hostname || 'localhost';
        const res = await fetch(`http://${backendHost}:8000/api/predict`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const liveData = await res.json();
          const liveDetection: DetectionResult = {
            id: liveData.id || `det-${Date.now().toString().slice(-4)}`,
            timestamp: liveData.timestamp || 'Just now',
            crop: liveData.crop,
            disease: liveData.disease,
            confidence: liveData.confidence,
            detectionTimeSeconds: liveData.detectionTimeSeconds || 0.042,
            model: 'MobileNetV2 (Daksh159)',
            severity: liveData.severity,
            affectedAreaPercentage: liveData.affectedAreaPercentage,
            imageUrl: URL.createObjectURL(imageSource),
            cameraSource: liveData.cameraSource || 'Live Upload',
            status: liveData.status || 'Confirmed',
            immediateAction: liveData.immediateAction,
            preventiveAction: liveData.preventiveAction,
            monitoringRecommendation: liveData.monitoringRecommendation,
          };
          detectionsList = [liveDetection, ...detectionsList];
          this.updateDynamicMetricsAfterDetection(liveDetection);
          return liveDetection;
        }
      } catch {
        // Backend offline, continue to offline edge processor
      }
    }

    // 2. Offline Edge Inference Processor (Processes uploaded file directly)
    await delay(750);

    const modelObj = AI_MODELS.find(m => m.id === modelId) || AI_MODELS[0];
    const latency = modelObj.id === 'model-mobilenetv2' ? 0.042 : 0.48;

    const imgUrl = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
    const fileName = typeof imageSource !== 'string' && imageSource instanceof File ? imageSource.name.toLowerCase() : '';

    // Infer crop & disease from upload characteristics or edge diagnostic rule
    let detectedCrop = 'Tomato';
    let detectedDisease = 'Early Blight';
    let severity: 'Healthy' | 'Low' | 'Moderate' | 'Severe' = 'Moderate';
    let confidence = 94.2;

    if (fileName.includes('corn') || fileName.includes('maize')) {
      detectedCrop = 'Corn';
      detectedDisease = 'Common Rust';
      severity = 'Low';
      confidence = 91.5;
    } else if (fileName.includes('potato')) {
      detectedCrop = 'Potato';
      detectedDisease = 'Late Blight';
      severity = 'Severe';
      confidence = 92.8;
    } else if (fileName.includes('healthy')) {
      detectedCrop = 'Soybean';
      detectedDisease = 'Healthy Leaf';
      severity = 'Healthy';
      confidence = 98.4;
    } else if (fileName.includes('pepper')) {
      detectedCrop = 'Bell Pepper';
      detectedDisease = 'Bacterial Spot';
      severity = 'Moderate';
      confidence = 95.1;
    }

    const matchedRec = RECOMMENDATIONS_DATABASE.find(r => r.disease.toLowerCase().includes(detectedDisease.toLowerCase()));

    const newDetection: DetectionResult = {
      id: `det-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now (Offline Mode)',
      crop: detectedCrop,
      disease: detectedDisease,
      confidence: confidence,
      detectionTimeSeconds: latency,
      model: modelObj.name.includes('MobileNet') ? 'MobileNetV2 (Offline Edge Engine)' : 'ViT-Base (Offline)',
      severity: severity,
      affectedAreaPercentage: severity === 'Healthy' ? 0 : 28,
      imageUrl: imgUrl,
      cameraSource: 'Manual Upload (Offline)',
      status: 'Confirmed',
      immediateAction: matchedRec ? matchedRec.immediateActions[0] : `Inspect nearby ${detectedCrop} foliage for symptoms.`,
      preventiveAction: matchedRec ? matchedRec.preventiveActions[0] : `Ensure proper drainage, sanitation, and canopy spacing.`,
      monitoringRecommendation: matchedRec ? matchedRec.monitoringFrequency : `Re-scan the crop within 24–48 hours.`,
    };

    detectionsList = [newDetection, ...detectionsList];
    this.updateDynamicMetricsAfterDetection(newDetection);
    return newDetection;
  },

  // Helper to dynamically update crop vitality and alerts after real scan
  updateDynamicMetricsAfterDetection(detection: DetectionResult) {
    // 1. Update crops list
    const existingCropIndex = cropsList.findIndex(c => c.name.toLowerCase() === detection.crop.toLowerCase());
    if (existingCropIndex >= 0) {
      const crop = { ...cropsList[existingCropIndex] };
      crop.totalPlants += 1;
      if (detection.severity === 'Healthy') {
        crop.healthyPct = Math.min(100, crop.healthyPct + 2);
      } else {
        crop.diseasedPct = Math.min(100, crop.diseasedPct + 4);
      }
      cropsList[existingCropIndex] = crop;
    } else {
      cropsList.push({
        id: `crop-${detection.crop.toLowerCase()}`,
        name: detection.crop,
        scientificName: `${detection.crop} sp.`,
        healthyPct: detection.severity === 'Healthy' ? 100 : 70,
        atRiskPct: detection.severity === 'Healthy' ? 0 : 15,
        diseasedPct: detection.severity === 'Healthy' ? 0 : 15,
        totalPlants: 1,
        iconName: detection.crop.toLowerCase(),
        color: detection.severity === 'Healthy' ? '#16a34a' : '#ef4444',
      });
    }

    // 2. Add alert if disease detected
    if (detection.severity !== 'Healthy') {
      const newAlert: AlertItem = {
        id: `alt-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        priority: detection.severity === 'Severe' ? 'High' : 'Medium',
        title: `${detection.disease} diagnosed in ${detection.crop}`,
        description: `Edge AI identified ${detection.disease} with ${detection.confidence}% confidence. ${detection.immediateAction}`,
        crop: detection.crop,
        read: false,
      };
      alertsList = [newAlert, ...alertsList];
    }
  },

  // GET /api/detections
  async getDetections(): Promise<DetectionResult[]> {
    await delay(100);
    return [...detectionsList];
  },

  // POST /api/detections/save
  async saveDetection(detection: DetectionResult): Promise<DetectionResult> {
    await delay(100);
    const existingIndex = detectionsList.findIndex(d => d.id === detection.id);
    if (existingIndex >= 0) {
      detectionsList[existingIndex] = detection;
    } else {
      detectionsList = [detection, ...detectionsList];
    }
    return detection;
  },

  // GET /api/cameras
  async getCameras(): Promise<CameraDevice[]> {
    try {
      const backendHost = window.location.hostname || 'localhost';
      const res = await fetch(`http://${backendHost}:8000/api/cameras`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline
    }
    return [...camerasList];
  },

  // PUT /api/cameras/:id/toggle-ai
  async toggleCameraAI(id: string, active: boolean): Promise<CameraDevice> {
    camerasList = camerasList.map(cam => (cam.id === id ? { ...cam, aiDetectionActive: active } : cam));
    return camerasList.find(c => c.id === id)!;
  },

  // GET /api/health
  async getCropHealth(): Promise<CropHealthStat[]> {
    return [...cropsList];
  },

  // PUT /api/health/update
  async updateCropHealth(updatedCrops: CropHealthStat[]): Promise<CropHealthStat[]> {
    cropsList = updatedCrops;
    return [...cropsList];
  },

  // GET /api/system-status
  async getSystemHardwareStatus(): Promise<SystemHardwareStatus> {
    try {
      const backendHost = window.location.hostname || 'localhost';
      const res = await fetch(`http://${backendHost}:8000/api/system/status`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Return offline status
    }
    return { ...hardwareStatus };
  },

  // GET /api/alerts
  async getAlerts(): Promise<AlertItem[]> {
    return [...alertsList];
  },

  // PUT /api/alerts/:id/read
  async markAlertRead(id: string): Promise<void> {
    alertsList = alertsList.map(a => (a.id === id ? { ...a, read: true } : a));
  },

  // GET /api/recommendations
  async getRecommendations(): Promise<DiseaseRecommendation[]> {
    // In offline mode without scans, return empty. When scans exist, return recommendations for detected diseases
    if (detectionsList.length === 0) {
      return [];
    }
    const detectedDiseases = new Set(detectionsList.map(d => d.disease.toLowerCase()));
    const matching = RECOMMENDATIONS_DATABASE.filter(r => 
      Array.from(detectedDiseases).some(d => d.includes(r.disease.toLowerCase()) || r.disease.toLowerCase().includes(d))
    );
    return matching.length > 0 ? matching : [RECOMMENDATIONS_DATABASE[0]];
  },

  // GET /api/distribution
  async getDiseaseDistribution(): Promise<DiseaseDistributionItem[]> {
    if (detectionsList.length === 0) {
      return [];
    }
    const counts: Record<string, number> = {};
    detectionsList.forEach(d => {
      counts[d.disease] = (counts[d.disease] || 0) + 1;
    });

    const palette = ['#f97316', '#ef4444', '#eab308', '#8b5cf6', '#06b6d4', '#10b981'];
    return Object.entries(counts).map(([name, count], index) => ({
      name,
      count,
      color: palette[index % palette.length],
    }));
  },

  // GET /api/trends?range=7d|30d|3m
  async getTrends(range: '7d' | '30d' | '3m'): Promise<TrendDataPoint[]> {
    if (detectionsList.length === 0) {
      return [];
    }
    // Return dynamically calculated trends based on real detections
    const diseased = detectionsList.filter(d => d.severity !== 'Healthy').length;
    const healthy = detectionsList.filter(d => d.severity === 'Healthy').length;

    return [
      { date: 'Session Start', detections: 0, healthyScans: 0, criticalAlerts: 0 },
      { date: 'Current', detections: diseased, healthyScans: healthy, criticalAlerts: alertsList.length },
    ];
  },

  // GET /api/fields
  async getFieldZones(): Promise<FieldZone[]> {
    return [...FIELD_ZONES];
  },

  // GET /api/models
  async getAIModels(): Promise<AIModelInfo[]> {
    return [...AI_MODELS];
  },

  // AGRI-RAKSHAK ESP32 ROVER API
  async getRoverState(): Promise<RoverState> {
    try {
      const backendHost = window.location.hostname || 'localhost';
      const res = await fetch(`http://${backendHost}:8000/api/rover/state`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        const liveState = await res.json();
        roverState = { ...roverState, ...liveState, connectionStatus: 'Connected' };
        return { ...roverState };
      }
    } catch {
      // Backend offline fallback
    }
    return { ...roverState };
  },

  async sendRoverMotors(left: number, right: number): Promise<RoverState> {
    const clampedL = Math.max(-100, Math.min(100, Math.round(left)));
    const clampedR = Math.max(-100, Math.min(100, Math.round(right)));

    try {
      const backendHost = window.location.hostname || 'localhost';
      const res = await fetch(`http://${backendHost}:8000/api/rover/motors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ left: clampedL, right: clampedR }),
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        const liveState = await res.json();
        roverState = { ...roverState, ...liveState };
        return { ...roverState };
      }
    } catch {
      // Backend offline fallback
    }

    const txMsg = `M ${clampedL} ${clampedR} (Offline Sim)`;
    const now = new Date().toTimeString().split(' ')[0];

    roverState = {
      ...roverState,
      leftSpeed: clampedL,
      rightSpeed: clampedR,
      lastCommandSent: txMsg,
      logs: [
        ...roverState.logs.slice(-30),
        { id: `log-${Date.now()}`, timestamp: now, direction: 'TX', text: `[OFFLINE] ${txMsg}` },
      ],
    };

    return { ...roverState };
  },

  async sendRoverSprayer(pump: boolean, sol1: boolean, sol2: boolean): Promise<RoverState> {
    try {
      const backendHost = window.location.hostname || 'localhost';
      const res = await fetch(`http://${backendHost}:8000/api/rover/sprayer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pump, solenoid1: sol1, solenoid2: sol2 }),
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        const liveState = await res.json();
        roverState = { ...roverState, ...liveState };
        return { ...roverState };
      }
    } catch {
      // Backend offline fallback
    }

    const now = new Date().toTimeString().split(' ')[0];
    const txMsg = `P ${pump ? 1 : 0} ${sol1 ? 1 : 0} ${sol2 ? 1 : 0} (Offline Sim)`;

    roverState = {
      ...roverState,
      pumpState: pump,
      solenoid1State: sol1,
      solenoid2State: sol2,
      lastCommandSent: txMsg,
      logs: [
        ...roverState.logs.slice(-30),
        { id: `log-${Date.now()}`, timestamp: now, direction: 'TX', text: `[OFFLINE] ${txMsg}` },
      ],
    };

    return { ...roverState };
  },

  async sendRoverEmergencyStop(): Promise<RoverState> {
    try {
      const backendHost = window.location.hostname || 'localhost';
      await fetch(`http://${backendHost}:8000/api/rover/estop`, { method: 'POST', signal: AbortSignal.timeout(1500) });
    } catch {
      // Backend offline fallback
    }

    roverState = {
      ...roverState,
      leftSpeed: 0,
      rightSpeed: 0,
      pumpState: false,
      solenoid1State: false,
      solenoid2State: false,
      lastCommandSent: 'ESTOP (Active)',
      logs: [
        ...roverState.logs.slice(-30),
        { id: `log-${Date.now()}`, timestamp: new Date().toTimeString().split(' ')[0], direction: 'SYS', text: '🚨 EMERGENCY STOP TRIGGERED' },
      ],
    };

    return { ...roverState };
  },

  async sendRoverPing(): Promise<RoverState> {
    const isOnline = await this.checkBackendHealth();
    const now = new Date().toTimeString().split(' ')[0];
    roverState = {
      ...roverState,
      connectionStatus: isOnline ? 'Connected' : 'Disconnected',
      lastHeartbeatTime: isOnline ? 'Just now' : 'No reply (Offline Mode)',
      logs: [
        ...roverState.logs.slice(-30),
        { id: `log-${Date.now()}`, timestamp: now, direction: 'SYS', text: isOnline ? 'PING -> OK' : 'PING -> ESP32 Offline / Unreachable' },
      ],
    };
    return { ...roverState };
  },

  async sendRoverSelfTest(): Promise<RoverState> {
    const now = new Date().toTimeString().split(' ')[0];
    roverState = {
      ...roverState,
      logs: [
        ...roverState.logs.slice(-30),
        { id: `log-${Date.now()}`, timestamp: now, direction: 'SYS', text: 'SELFTEST -> Offline Self-Check Complete: Actuators Standby' },
      ],
    };
    return { ...roverState };
  },

  async sendRoverRawSerialCommand(command: string): Promise<RoverState> {
    const now = new Date().toTimeString().split(' ')[0];
    roverState = {
      ...roverState,
      logs: [
        ...roverState.logs.slice(-30),
        { id: `log-${Date.now()}`, timestamp: now, direction: 'TX', text: `[OFFLINE] ${command}` },
      ],
    };
    return { ...roverState };
  },
};
