import {
  AlertItem,
  AIModelInfo,
  CameraDevice,
  CropHealthStat,
  DetectionResult,
  DiseaseDistributionItem,
  DiseaseRecommendation,
  FieldZone,
  SystemHardwareStatus,
  TrendDataPoint
} from '../types';

// In Offline Mode without pre-populated demo data, initial diagnostic lists start clean
export const INITIAL_CROPS: CropHealthStat[] = [];

export const INITIAL_DISEASE_DISTRIBUTION: DiseaseDistributionItem[] = [];

export const INITIAL_TREND_7D: TrendDataPoint[] = [];
export const INITIAL_TREND_30D: TrendDataPoint[] = [];
export const INITIAL_TREND_3M: TrendDataPoint[] = [];

export const INITIAL_CAMERAS: CameraDevice[] = [
  {
    id: 'cam-front-realsense',
    name: 'Front Intel RealSense D435i',
    location: 'Rover Front Mast (Autonomous Navigation & Obstacle Depth)',
    status: 'Offline',
    resolution: '1280x720 Depth + 1080p RGB',
    fps: 0,
    fieldId: 'field-01',
    streamUrl: '',
    aiDetectionActive: false,
    leafBoxActive: false,
    lastDetection: 'Standby – Camera Offline',
    isDepthCamera: true,
    depthData: {
      model: 'Intel RealSense D435i (Stereo Depth + RGB + IMU)',
      distanceToTargetM: 0,
      obstacleClearanceM: 0,
      pathCorridorStatus: 'Path Clear',
      depthResolution: '1280x720 Depth @ 30 FPS',
      fps: 0,
      activeColormap: 'Jet Heatmap',
      fovHorizontalDeg: 87,
      fovVerticalDeg: 58,
      autoBrakingTriggered: false,
    },
  },
  {
    id: 'cam-left',
    name: 'Left Canopy AI Camera',
    location: 'Rover Left Boom (Scans Left Bed -> Left Solenoid 1)',
    status: 'Offline',
    resolution: '1080p @ 30 FPS',
    fps: 0,
    fieldId: 'field-01',
    streamUrl: '',
    aiDetectionActive: false,
    leafBoxActive: false,
    lastDetection: 'Standby – Feed Offline',
  },
  {
    id: 'cam-right',
    name: 'Right Canopy AI Camera',
    location: 'Rover Right Boom (Scans Right Bed -> Right Solenoid 2)',
    status: 'Offline',
    resolution: '1080p @ 30 FPS',
    fps: 0,
    fieldId: 'field-01',
    streamUrl: '',
    aiDetectionActive: false,
    leafBoxActive: false,
    lastDetection: 'Standby – Feed Offline',
  },
];

export const INITIAL_DETECTIONS: DetectionResult[] = [];

export const INITIAL_ALERTS: AlertItem[] = [];

export const AI_MODELS: AIModelInfo[] = [
  {
    id: 'model-mobilenetv2',
    name: 'MobileNetV2 Plant Disease Classifier (Daksh159)',
    architecture: 'MobileNetV2 (PlantVillage 38 Classes)',
    inputSize: '224 × 224 RGB',
    classesCount: 38,
    parameterCount: '~3.5M parameters (8.91 MB weights)',
    task: 'Single-label multi-class crop pathology classification',
    latencyEdgeMs: 42,
    accuracyTop1: 95.0,
    isActive: true,
    supportedCrops: [
      'Apple', 'Blueberry', 'Cherry', 'Corn', 'Grape', 'Orange', 
      'Peach', 'Bell Pepper', 'Potato', 'Raspberry', 'Soybean', 
      'Squash', 'Strawberry', 'Tomato'
    ],
    recommendedDeployment: 'Edge (Raspberry Pi)',
  },
  {
    id: 'model-vit',
    name: 'PlantDiseaseDetectorViT2',
    architecture: 'Vision Transformer (ViT-Base)',
    inputSize: '224 × 224 RGB',
    classesCount: 44,
    parameterCount: '~85.8M parameters (340 MB)',
    task: 'Fine-grained visual classification & attention heatmaps',
    latencyEdgeMs: 480,
    accuracyTop1: 97.4,
    isActive: false,
    supportedCrops: [
      'Apple', 'Blueberry', 'Cherry', 'Corn', 'Grape', 'Orange', 
      'Peach', 'Bell Pepper', 'Potato', 'Raspberry', 'Soybean', 
      'Squash', 'Strawberry', 'Tomato', 'Wheat', 'Rice'
    ],
    warningNote: 'Higher computational requirement – evaluate before edge deployment.',
    recommendedDeployment: 'Cloud / Server GPU',
  },
];

export const SYSTEM_HARDWARE: SystemHardwareStatus = {
  edgeDevice: {
    name: 'Raspberry Pi 4 Model B (4GB)',
    model: 'BCM2711 Quad-core Cortex-A72 @ 1.5GHz',
    status: 'Offline',
    uptime: 'Disconnected',
    ipAddress: '192.168.1.142 (Offline)',
  },
  cameras: [
    { name: 'Front Depth Camera', type: 'Intel RealSense D435i (USB 3.1 Gen1)', status: 'Disconnected', fps: 0 },
    { name: 'Camera 1 (Left)', type: '720p USB Webcam', status: 'Disconnected', fps: 0 },
    { name: 'Camera 2 (Right)', type: '720p USB Webcam', status: 'Disconnected', fps: 0 },
  ],
  inferenceEngine: {
    name: 'TFLite Edge Accelerator',
    status: 'Paused',
    currentModel: 'MobileNetV2-PlantVillage-v2.1',
    averageLatencyMs: 0,
  },
  network: {
    type: 'Dual-Band 5GHz Wi-Fi (Field Mesh)',
    status: 'Disconnected',
    latencyMs: 0,
    signalStrength: 'No Signal (Offline Mode)',
  },
  metrics: {
    cpuUsagePct: 0,
    ramUsageGb: 0,
    ramTotalGb: 4.0,
    temperatureC: 0,
    diskUsagePct: 0,
  },
};

export const FIELD_ZONES: FieldZone[] = [];

// Botanical Recommendations Knowledge Base (Used dynamically when diseases are detected)
export const RECOMMENDATIONS_DATABASE: DiseaseRecommendation[] = [
  {
    crop: 'Tomato',
    disease: 'Early Blight',
    confidence: 94.8,
    severity: 'Moderate',
    immediateActions: [
      'Inspect nearby plants within a 3-meter radius for similar concentric leaf spot symptoms.',
      'Physically prune infected lower 2-3 leaf branches using alcohol-sterilized tools.',
      'Dispose of infected clippings immediately off-field; do NOT add to compost pile.',
    ],
    preventiveActions: [
      'Install organic straw or plastic mulch around plant bases to prevent soil splash onto foliage.',
      'Switch strictly to drip irrigation or soaker hoses to avoid wetting the upper canopy.',
      'Ensure 60cm plant spacing to facilitate rapid morning drying and airflow.',
    ],
    monitoringFrequency: 'Re-scan the crop within 24–48 hours.',
    organicControls: [
      'Copper octanoate or copper sulfate pentahydrate spray early morning.',
      'Bacillus subtilis bio-fungicide preventative soil and foliar drench.',
      'Neem seed oil emulsion (0.5%) as repellent and mild fungal growth inhibitor.',
    ],
    fieldSanitationTips: [
      'Clean trellises and stakes with 10% bleach solution between crop cycles.',
      'Implement a 3-year crop rotation avoiding Solanaceae family members (potatoes, eggplants).',
    ],
    verifiedSource: 'ICAR / Agricultural Extension Diagnostic Manual (2025 Ed.)',
  },
  {
    crop: 'Potato',
    disease: 'Late Blight',
    confidence: 91.2,
    severity: 'Severe',
    immediateActions: [
      'Immediately isolate the affected potato bed zone.',
      'Cut off infected vines at soil level if disease exceeds 50% canopy coverage.',
      'Verify whether neighboring fields have triggered regional late blight warnings.',
    ],
    preventiveActions: [
      'Ensure high hill mounding around potato tubers to prevent spores washing into the root zone.',
      'Avoid overhead irrigation entirely, particularly during cloudy, cool (12-22°C) high-humidity periods.',
      'Plant certified disease-free seed tubers for next seasonal sowing.',
    ],
    monitoringFrequency: 'Daily automated surveillance for the next 7 consecutive days.',
    organicControls: [
      'Fixed copper hydroxide protective barrier applied prior to forecasted rain periods.',
      'Trichoderma harzianum bio-agent applied at root zone.',
    ],
    fieldSanitationTips: [
      'Destroy volunteer potato plants and cull piles within 500m of crop perimeter.',
    ],
    verifiedSource: 'Global Phytophthora Infestans Management Protocol',
  },
  {
    crop: 'Corn',
    disease: 'Common Rust',
    confidence: 88.4,
    severity: 'Low',
    immediateActions: [
      'Check lower and middle canopy leaves for rusty reddish-brown pustules.',
      'Determine growth stage: if corn is past blister stage (R2), yield impact is typically minimal.',
    ],
    preventiveActions: [
      'Select rust-resistant hybrid seed varieties with Rp-gene resistance for future plantings.',
      'Plant early in the season to evade peak airborne spore influx from southerly wind currents.',
    ],
    monitoringFrequency: 'Re-scan in 3–5 days to check if rust pustules ascend into the ear leaf.',
    organicControls: [
      'Sulfur dust formulations applied under low-wind conditions.',
      'Potassium bicarbonate foliar sprays to alter leaf surface pH.',
    ],
    fieldSanitationTips: [
      'Deep till crop residues after harvest to accelerate residue decomposition.',
    ],
    verifiedSource: 'Cereal Pathology Field Guide',
  },
];
