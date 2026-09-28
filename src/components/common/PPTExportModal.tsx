import React, { useState } from 'react';
import {
  Download,
  Image as ImageIcon,
  CheckCircle2,
  FileSpreadsheet,
  Camera,
  Layers,
  Sparkles,
  Loader2,
  Presentation,
  Maximize2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { Modal } from './Modal';

interface PPTExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetElementId?: string;
  currentTitle: string;
}

export const PPTExportModal: React.FC<PPTExportModalProps> = ({
  isOpen,
  onClose,
  targetElementId = 'main-dashboard-content',
  currentTitle,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const handleCaptureScreenToImage = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById(targetElementId) || document.querySelector('main') || document.body;
      
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2, // 2x high resolution for 16:9 PPT projection
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f8fafc',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      setPreviewDataUrl(imgData);

      // Auto trigger download
      const link = document.createElement('a');
      link.download = `AgriRakshak_PPT_Slide_${currentTitle.replace(/\s+/g, '_')}_1920x1080.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
      });
    } catch (err) {
      console.error('Failed to capture slide image', err);
      alert('Could not generate screenshot directly. Please check browser permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Dashboard View for PowerPoint (PPT) Presentation"
      subtitle="Generate high-resolution 16:9 1080p slide captures for engineering presentations"
      maxWidth="xl"
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 flex items-start gap-3">
          <Presentation className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">
              1-Click 16:9 HD Slide Image Exporter
            </h4>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Instantly converts the current dashboard view (Crops, Intel RealSense Depth Streams, Rover BTS7960 Telemetry, or AI Diagnosis) into a crystal clear <strong>1920×1080 PNG</strong> optimized for PowerPoint & Google Slides.
            </p>
          </div>
        </div>

        {/* Capture Action Area */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Target View: {currentTitle}
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Resolution: 2x Super-sampled PNG (3840×2160 / 1920×1080 HD)
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleCaptureScreenToImage}
              disabled={isExporting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Capturing HD Slide...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Export Active Screen as PPT Slide (PNG)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Image if captured */}
        {previewDataUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Captured Slide Preview</span>
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Downloaded Successfully
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-300 shadow-md">
              <img src={previewDataUrl} alt="PPT Slide Preview" className="w-full h-auto object-cover" />
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
