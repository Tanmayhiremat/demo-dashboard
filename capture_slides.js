import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, 'exported_ppt_slides');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pages = [
  { id: 'dashboard', name: '01_Dashboard_Overview.png', title: 'Dashboard Overview & Executive Health Summary' },
  { id: 'detect', name: '02_AI_Crop_Disease_Diagnosis.png', title: 'AI Plant Pathology Leaf Scanner & Diagnosis' },
  { id: 'camera', name: '03_Live_Cameras_Intel_RealSense.png', title: 'Live Camera Feeds & Intel RealSense D435i Depth Sensing' },
  { id: 'rover', name: '04_AgriRakshak_Rover_Teleoperation.png', title: 'AgriRakshak Rover ESP32 Actuators & Teleoperation Controls' },
  { id: 'health', name: '05_Crop_Health_Analytics.png', title: 'Crop Health NDVI & Disease Distribution Analytics' },
  { id: 'field', name: '06_Field_Zones_Monitoring.png', title: 'Field Block Monitoring & Environmental Zones' },
  { id: 'history', name: '07_Detection_History_Audit.png', title: 'Historical Disease Detections & Audit Log' },
  { id: 'recommendations', name: '08_Organic_BioFungicide_Treatments.png', title: 'Bio-Fungicide Recommendations & Spray Protocols' },
  { id: 'models', name: '09_AI_Model_Architecture.png', title: 'MobileNetV2 & Vision Transformer AI Models' },
  { id: 'hardware', name: '10_IoT_Sensors_Hardware_Status.png', title: 'IoT Soil, Battery, ESP32 & System Hardware' },
  { id: 'reports', name: '11_Agricultural_Reports_Compliance.png', title: 'Agricultural Compliance & Export Reports' },
  { id: 'settings', name: '12_System_Configuration.png', title: 'Telemetry Thresholds & System Settings' },
];

async function captureAllSlides() {
  console.log('🚀 Launching System Google Chrome for High-Res Presentation Slide Capture...');
  
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2,
  });

  for (const item of pages) {
    const targetUrl = `http://localhost:5173/#${item.id}`;
    console.log(`📸 Capturing Slide: [${item.id}] -> ${item.name} (${item.title})...`);
    
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1200));

    const filePath = path.join(outputDir, item.name);
    await page.screenshot({
      path: filePath,
      fullPage: false,
    });
    console.log(`  ✅ Saved: ${filePath}`);
  }

  await browser.close();
  console.log(`\n🎉 All ${pages.length} dashboard slides exported successfully into folder: ${outputDir}`);
}

captureAllSlides().catch(err => {
  console.error('❌ Error during slide capture:', err);
  process.exit(1);
});
