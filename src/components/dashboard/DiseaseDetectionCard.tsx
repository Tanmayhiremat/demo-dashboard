import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  Sparkles,
  Loader2,
  CheckCircle2,
  Layers,
  Leaf,
  Info,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface DiseaseDetectionCardProps {
  onAnalyzeImage: (imageSource: string | File) => Promise<void>;
  isAnalyzing: boolean;
  selectedModelName?: string;
}

export const DiseaseDetectionCard: React.FC<DiseaseDetectionCardProps> = ({
  onAnalyzeImage,
  isAnalyzing,
  selectedModelName = 'MobileNetV2 (38 Classes)',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSnapping, setIsSnapping] = useState<string | null>(null);
  const [snapError, setSnapError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }
    setSnapError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleTriggerAnalysis = async () => {
    if (selectedFile) {
      await onAnalyzeImage(selectedFile);
    } else if (previewUrl) {
      await onAnalyzeImage(previewUrl);
    }
  };

  // Direct snapshot capture from Pi Hardware Cameras
  const snapPiCamera = async (camType: 'left' | 'right' | 'realsense') => {
    setIsSnapping(camType);
    setSnapError(null);
    try {
      const backendHost = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';
      const snapUrl = `http://${backendHost}:8000/api/camera/snapshot/${camType}?t=${Date.now()}`;
      const res = await fetch(snapUrl, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], `pi_${camType}_${Date.now()}.jpg`, { type: 'image/jpeg' });
        processFile(file);
        await onAnalyzeImage(file);
      } else {
        setSnapError(`Hardware ${camType} camera is offline. Please upload a local plant leaf photo to test inference.`);
      }
    } catch {
      setSnapError(`Hardware ${camType} camera is offline (no signal). Please upload a local plant leaf photo to test inference.`);
    } finally {
      setIsSnapping(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              AI Disease Detection
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Upload leaf photo or snap in real-time from Raspberry Pi connected cameras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500">Active Model:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Layers className="w-3 h-3 text-emerald-600" />
            {selectedModelName}
          </span>
        </div>
      </div>

      {snapError && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{snapError}</span>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/70 scale-[1.005]'
            : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />

        {isAnalyzing ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
              <Sparkles className="w-5 h-5 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm font-bold text-slate-800 animate-pulse">
              Running MobileNetV2 Diagnostic Inference...
            </p>
            <p className="text-xs text-slate-500">
              Extracting convolutional feature maps & classifying 38 pathology categories
            </p>
          </div>
        ) : previewUrl ? (
          <div className="py-2 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="relative group">
              <img
                src={previewUrl}
                alt="Uploaded Leaf Preview"
                className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-2xl shadow-md border-2 border-emerald-400 ring-4 ring-emerald-50"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                Change Image
              </div>
            </div>
            <div className="text-left space-y-2 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Image Loaded & Ready
              </div>
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {selectedFile ? selectedFile.name : 'Selected Leaf Image'}
              </h3>
              <p className="text-xs text-slate-500">
                Click “Run AI Diagnostics” to execute deep learning classification on this crop leaf.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerAnalysis();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" /> Run AI Diagnostics
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Upload Plant Leaf Image for Diagnosis
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Drag and drop a JPG or PNG file, or snap from connected hardware camera
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                Choose Local File
              </button>

              <button
                type="button"
                disabled={isSnapping !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  snapPiCamera('left');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all border border-slate-200"
              >
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                {isSnapping === 'left' ? 'Connecting...' : 'Snap Left Camera'}
              </button>

              <button
                type="button"
                disabled={isSnapping !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  snapPiCamera('right');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all border border-slate-200"
              >
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                {isSnapping === 'right' ? 'Connecting...' : 'Snap Right Camera'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Supported Formats: JPG, JPEG, PNG, WEBP (Max 25MB)
            </p>
          </div>
        )}
      </div>

      {/* Supported Crop Diagnostics Info */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            Edge Model Diagnostics Scope
          </span>
          <span className="text-[11px] text-slate-400 font-medium">38 Plant Pathology Classes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {['Tomato', 'Potato', 'Corn', 'Bell Pepper', 'Soybean', 'Apple', 'Grape'].map((crop) => (
            <div
              key={crop}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center"
            >
              <p className="text-xs font-bold text-slate-800">{crop}</p>
              <p className="text-[10px] text-slate-400">Multi-class</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
