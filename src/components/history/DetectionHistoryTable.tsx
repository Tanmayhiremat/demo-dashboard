import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  ChevronDown,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DetectionResult } from '../../types';
import { Modal } from '../common/Modal';

interface DetectionHistoryTableProps {
  detections: DetectionResult[];
  onSelectDetection?: (detection: DetectionResult) => void;
}

export const DetectionHistoryTable: React.FC<DetectionHistoryTableProps> = ({
  detections,
  onSelectDetection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedDisease, setSelectedDisease] = useState('All');
  const [selectedCamera, setSelectedCamera] = useState('All');
  const [minConfidence, setMinConfidence] = useState(0);
  const [selectedItem, setSelectedItem] = useState<DetectionResult | null>(null);

  // Extract unique options for filters
  const cropsList = useMemo(() => ['All', ...new Set(detections.map(d => d.crop))], [detections]);
  const diseasesList = useMemo(() => ['All', ...new Set(detections.map(d => d.disease))], [detections]);
  const camerasList = useMemo(() => ['All', ...new Set(detections.map(d => d.cameraSource || 'Manual Upload'))], [detections]);

  // Filtered dataset
  const filteredDetections = useMemo(() => {
    return detections.filter((item) => {
      const matchesSearch =
        item.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCrop = selectedCrop === 'All' || item.crop === selectedCrop;
      const matchesDisease = selectedDisease === 'All' || item.disease === selectedDisease;
      const matchesCamera =
        selectedCamera === 'All' || (item.cameraSource || 'Manual Upload') === selectedCamera;
      const matchesConf = item.confidence >= minConfidence;

      return matchesSearch && matchesCrop && matchesDisease && matchesCamera && matchesConf;
    });
  }, [detections, searchQuery, selectedCrop, selectedDisease, selectedCamera, minConfidence]);

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = ['ID,Date,Crop,Disease,Confidence,Camera,Severity,Status\n'];
    const rows = filteredDetections.map(
      d =>
        `"${d.id}","${d.timestamp}","${d.crop}","${d.disease}",${d.confidence}%,"${d.cameraSource || 'Manual'}","${d.severity}","${d.status}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agrirakshak_detection_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Detection History & Pathology Log
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Historical ledger of all edge AI plant diagnoses and automated camera scans
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crop or disease..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        {/* Crop Filter */}
        <div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Crops</option>
            {cropsList.filter(c => c !== 'All').map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>

        {/* Disease Filter */}
        <div>
          <select
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Diseases</option>
            {diseasesList.filter(d => d !== 'All').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Camera Source Filter */}
        <div>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Cameras</option>
            {camerasList.filter(cam => cam !== 'All').map(cam => (
              <option key={cam} value={cam}>{cam}</option>
            ))}
          </select>
        </div>

        {/* Confidence Threshold */}
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            Min Conf: {minConfidence}%
          </span>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseInt(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Crop</th>
              <th className="py-3.5 px-4">Disease / Diagnosis</th>
              <th className="py-3.5 px-4">Confidence</th>
              <th className="py-3.5 px-4">Camera Source</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredDetections.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">No Pathology Records Logged</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      System is in Offline Mode. Diagnostic scans performed via camera or manual photo upload will be automatically logged in this pathology ledger.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDetections.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {item.timestamp}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.imageUrl}
                        alt={item.crop}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <span className="font-bold text-slate-900">{item.crop}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`font-semibold ${
                      item.disease.toLowerCase().includes('healthy')
                        ? 'text-emerald-700'
                        : 'text-slate-800'
                    }`}>
                      {item.disease}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800">
                        {item.confidence}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {item.cameraSource || 'Manual Upload'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'Review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 transition-colors"
                      title="Inspect record"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Inspect Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={`Diagnostic Record: ${selectedItem?.crop} – ${selectedItem?.disease}`}
        subtitle={`Logged: ${selectedItem?.timestamp} | Camera: ${selectedItem?.cameraSource || 'Upload'}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <img
              src={selectedItem?.imageUrl}
              alt="Leaf"
              className="w-full h-44 object-cover rounded-2xl border border-slate-200 shadow-xs"
            />
            <div className="space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pathogen Classification</span>
                <p className="font-extrabold text-sm text-slate-900">{selectedItem?.crop} – {selectedItem?.disease}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Model Top-1 Confidence</span>
                <p className="font-bold text-emerald-700 font-mono">{selectedItem?.confidence}%</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Severity Level</span>
                <p className="font-bold text-slate-800">{selectedItem?.severity}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
            <strong className="font-bold block">Prescribed Action:</strong>
            <p>{selectedItem?.immediateAction}</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setSelectedItem(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
