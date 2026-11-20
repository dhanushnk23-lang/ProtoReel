import { useEffect, useRef, useState } from 'react';
import { Film, ImagePlus, Plus, Trash2, Upload, X } from 'lucide-react';
import type {
  DevelopmentLogEntry,
  Invention,
  InventionCategory,
  InventionSpec,
  StudentProfile,
} from '../types';
import { formatINR } from '../utils/currency';

interface UploadDemoModalProps {
  isOpen: boolean;
  students: StudentProfile[];
  initialStudentId?: string;
  onClose: () => void;
  onPublished: (invention: Invention) => void;
  onRequestNewStudent: () => void;
}

const CATEGORIES: InventionCategory[] = [
  'Robotics',
  'CleanTech',
  'Assistive Tech',
  'Aerospace',
  'Embedded',
];

function uploadBinaryWithProgress(
  endpoint: string,
  file: Blob,
  filename: string,
  contentType: string,
  onProgress?: (pct: number) => void
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);
    xhr.setRequestHeader('Content-Type', contentType || 'application/octet-stream');
    xhr.setRequestHeader('X-Filename', encodeURIComponent(filename));

    if (onProgress) {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as { url: string });
        } catch {
          reject(new Error('Invalid server response during upload.'));
        }
      } else {
        reject(new Error('Upload failed. Please try a smaller MP4 or WebM clip.'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error while uploading file.'));
    xhr.send(file);
  });
}

async function captureVideoFrame(videoEl: HTMLVideoElement): Promise<Blob | null> {
  try {
    const width = videoEl.videoWidth || 960;
    const height = videoEl.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoEl, 0, 0, width, height);
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  } catch {
    return null;
  }
}

export function UploadDemoModal({
  isOpen,
  students,
  initialStudentId,
  onClose,
  onPublished,
  onRequestNewStudent,
}: UploadDemoModalProps) {
  const [studentId, setStudentId] = useState(initialStudentId || students[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<InventionCategory>('Robotics');
  const [summary, setSummary] = useState('');
  const [stage, setStage] = useState('Working Prototype');
  const [budgetInr, setBudgetInr] = useState('14500');
  const [totalBudgetInr, setTotalBudgetInr] = useState('22000');
  const [keyMetric, setKeyMetric] = useState('');
  const [toolsText, setToolsText] = useState('');

  // Multi-image gallery files
  const [galleryFiles, setGalleryFiles] = useState<{ file: File; previewUrl: string }[]>([]);

  // Initial Specifications
  const [specifications, setSpecifications] = useState<InventionSpec[]>([]);
  const [specLabel, setSpecLabel] = useState('');
  const [specValue, setSpecValue] = useState('');

  // Initial Development Log
  const [logTitle, setLogTitle] = useState('');
  const [logNotes, setLogNotes] = useState('');

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [durationSeconds, setDurationSeconds] = useState<number>(12);

  const [uploadPct, setUploadPct] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (initialStudentId) {
      setStudentId(initialStudentId);
    } else if (!studentId && students[0]) {
      setStudentId(students[0].id);
    }
  }, [initialStudentId, students, studentId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, submitting, onClose]);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  if (!isOpen) return null;

  const handleVideoSelected = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, WebM, or MOV).');
      return;
    }
    if (file.size > 110 * 1024 * 1024) {
      setError('Video file must be under 110 MB.');
      return;
    }
    setError(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleGalleryFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const next: { file: File; previewUrl: string }[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        next.push({ file, previewUrl: URL.createObjectURL(file) });
      }
    }
    if (next.length > 0) {
      setGalleryFiles((prev) => [...prev, ...next]);
    }
  };

  const handleAddSpec = () => {
    if (!specLabel.trim() || !specValue.trim()) return;
    setSpecifications((prev) => [...prev, { label: specLabel.trim(), value: specValue.trim() }]);
    setSpecLabel('');
    setSpecValue('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentId) {
      setError('Please select or create a student profile first.');
      return;
    }
    if (!title.trim() || !summary.trim()) {
      setError('Please enter a project title and concise engineering summary.');
      return;
    }
    if (!videoFile) {
      setError('Please attach a demo video file for your invention.');
      return;
    }

    setSubmitting(true);
    setUploadPct(0);

    try {
      const videoRes = await uploadBinaryWithProgress(
        '/api/videos/upload',
        videoFile,
        videoFile.name,
        videoFile.type || 'video/mp4',
        setUploadPct
      );

      const uploadedImages: string[] = [];
      for (const item of galleryFiles) {
        const imgRes = await uploadBinaryWithProgress(
          '/api/images/upload',
          item.file,
          item.file.name,
          item.file.type || 'image/jpeg'
        );
        uploadedImages.push(imgRes.url);
      }

      if (uploadedImages.length === 0 && previewVideoRef.current) {
        const frameBlob = await captureVideoFrame(previewVideoRef.current);
        if (frameBlob) {
          const posterRes = await uploadBinaryWithProgress(
            '/api/images/upload',
            frameBlob,
            `${title.slice(0, 20)}-frame.jpg`,
            'image/jpeg'
          );
          uploadedImages.push(posterRes.url);
        }
      }

      const posterUrl =
        uploadedImages[0] || '/src/assets/images/invention_prosthetic_hand_1794884424777.jpg';

      const tools = toolsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const parsedBom = Math.max(0, Math.round(Number(budgetInr) || 14500));
      const parsedTotal = Math.max(parsedBom, Math.round(Number(totalBudgetInr) || parsedBom));

      const devLogs: DevelopmentLogEntry[] =
        logTitle.trim() && logNotes.trim()
          ? [
              {
                id: `log-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                title: logTitle.trim(),
                notes: logNotes.trim(),
                spendInr: parsedBom,
              },
            ]
          : [];

      const response = await fetch('/api/inventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          title: title.trim(),
          category,
          summary: summary.trim(),
          videoUrl: videoRes.url,
          posterUrl,
          galleryImages: uploadedImages.length > 0 ? uploadedImages : [posterUrl],
          durationSeconds,
          stage: stage.trim() || 'Working Prototype',
          budgetInr: parsedBom,
          totalBudgetInr: parsedTotal,
          keyMetric: keyMetric.trim() || 'Bench Verified',
          tools: tools.length > 0 ? tools : ['Hardware Prototype'],
          specifications,
          devLogs,
        }),
      });

      if (!response.ok) {
        const errBody = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error || 'Could not publish invention demo.');
      }

      const created = (await response.json()) as Invention;
      setTitle('');
      setSummary('');
      setKeyMetric('');
      setToolsText('');
      setSpecifications([]);
      setLogTitle('');
      setLogNotes('');
      galleryFiles.forEach((g) => URL.revokeObjectURL(g.previewUrl));
      setGalleryFiles([]);
      setVideoFile(null);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl('');
      onPublished(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while publishing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Upload project video demo"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
        </div>

        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg md:text-xl font-bold text-zinc-900">
            Upload Project Demo
          </h2>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="Close upload modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-700 cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          {/* Student Profile Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="upload-student" className="text-xs font-semibold text-zinc-800">
                Student Inventor Profile
              </label>
              <button
                type="button"
                onClick={onRequestNewStudent}
                className="text-xs font-semibold text-orange-700 hover:underline cursor-pointer"
              >
                + New student profile
              </button>
            </div>
            <select
              id="upload-student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.university} ({s.major})
                </option>
              ))}
            </select>
          </div>

          {/* Video File Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-800">
              Demo Video (MP4, WebM, MOV)
            </label>

            {!videoPreviewUrl ? (
              <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-[#F7F7F5] hover:border-orange-500 hover:bg-orange-50/40 px-6 py-8 text-center transition-colors cursor-pointer">
                <Upload className="w-7 h-7 text-orange-600" aria-hidden="true" />
                <div className="text-sm font-semibold text-zinc-900">
                  Tap to choose or record project video
                </div>
                <div className="text-xs text-zinc-500">
                  Show your prototype running on the bench (up to 110 MB)
                </div>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  className="sr-only"
                  onChange={(e) => handleVideoSelected(e.target.files?.[0])}
                />
              </label>
            ) : (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden bg-zinc-950 aspect-[4/3]">
                  <video
                    ref={previewVideoRef}
                    src={videoPreviewUrl}
                    controls
                    muted
                    playsInline
                    onLoadedMetadata={(e) => {
                      const d = e.currentTarget.duration;
                      if (Number.isFinite(d) && d > 0) setDurationSeconds(Math.round(d));
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Film className="w-3.5 h-3.5 text-orange-600 shrink-0" aria-hidden="true" />
                    <span className="truncate">{videoFile?.name}</span>
                  </span>
                  <label className="text-orange-700 font-semibold hover:underline cursor-pointer shrink-0 ml-3">
                    Replace video
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      className="sr-only"
                      onChange={(e) => handleVideoSelected(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Invention Details & INR Budgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="inv-title" className="text-xs font-semibold text-zinc-800">
                Invention Title
              </label>
              <input
                id="inv-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ExoWrist Cable-Driven Rehab Orthosis"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="inv-category" className="text-xs font-semibold text-zinc-800">
                Category
              </label>
              <select
                id="inv-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as InventionCategory)}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="inv-stage" className="text-xs font-semibold text-zinc-800">
                Prototype Stage
              </label>
              <input
                id="inv-stage"
                type="text"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                placeholder="e.g. Field Tested"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="inv-bom" className="text-xs font-semibold text-zinc-800">
                Unit BOM Cost (₹)
              </label>
              <input
                id="inv-bom"
                type="number"
                min={0}
                value={budgetInr}
                onChange={(e) => setBudgetInr(e.target.value)}
                placeholder="14500"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm font-mono tabular-nums text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
              <div className="text-[11px] text-zinc-500 tabular-nums">
                {formatINR(Number(budgetInr) || 0)} BOM
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="inv-total-budget" className="text-xs font-semibold text-zinc-800">
                Total Prototype Budget (₹)
              </label>
              <input
                id="inv-total-budget"
                type="number"
                min={0}
                value={totalBudgetInr}
                onChange={(e) => setTotalBudgetInr(e.target.value)}
                placeholder="22000"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm font-mono tabular-nums text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
              <div className="text-[11px] text-zinc-500 tabular-nums">
                {formatINR(Number(totalBudgetInr) || 0)} Budget
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="inv-metric" className="text-xs font-semibold text-zinc-800">
                Key Benchmark Metric
              </label>
              <input
                id="inv-metric"
                type="text"
                value={keyMetric}
                onChange={(e) => setKeyMetric(e.target.value)}
                placeholder="e.g. 18 ms loop rate"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="inv-tools" className="text-xs font-semibold text-zinc-800">
                Tools & Stack (comma separated)
              </label>
              <input
                id="inv-tools"
                type="text"
                value={toolsText}
                onChange={(e) => setToolsText(e.target.value)}
                placeholder="STM32, SolidWorks, ROS2"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="inv-summary" className="text-xs font-semibold text-zinc-800">
              Engineering Summary
            </label>
            <textarea
              id="inv-summary"
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Explain what problem your invention solves, how the mechanism or firmware works, and what you tested in the video."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
            />
          </div>

          {/* Multi-Image Project Gallery Upload */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-800">
                Project Photo Gallery (optional, multiple)
              </span>
              <label className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#F7F7F5] hover:bg-zinc-200/80 text-xs font-semibold text-zinc-800 inline-flex items-center gap-1.5 cursor-pointer">
                <ImagePlus className="w-4 h-4 text-orange-600" aria-hidden="true" />
                <span>Add Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => handleGalleryFilesSelected(e.target.files)}
                />
              </label>
            </div>
            {galleryFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {galleryFiles.map((item, idx) => (
                  <div
                    key={item.previewUrl}
                    className="relative aspect-[4/3] rounded-lg overflow-hidden border border-zinc-200"
                  >
                    <img
                      src={item.previewUrl}
                      alt={`Selected photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`Remove photo ${idx + 1}`}
                      onClick={() => {
                        URL.revokeObjectURL(item.previewUrl);
                        setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center rounded-md bg-black/65 text-white cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technical Specifications Builder */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-100">
            <span className="block text-xs font-semibold text-zinc-800">
              Detailed Specifications (optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <input
                type="text"
                value={specLabel}
                onChange={(e) => setSpecLabel(e.target.value)}
                placeholder="Spec name (e.g. Mass)"
                className="sm:col-span-2 min-h-[40px] px-3 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
              <input
                type="text"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                placeholder="Value (e.g. 410 g)"
                className="sm:col-span-2 min-h-[40px] px-3 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="min-h-[40px] px-3 rounded-xl bg-zinc-900 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add</span>
              </button>
            </div>
            {specifications.length > 0 && (
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl text-xs">
                {specifications.map((s, idx) => (
                  <div key={`${s.label}-${idx}`} className="px-3 py-2 flex items-center justify-between">
                    <span>
                      <strong className="text-zinc-700">{s.label}:</strong>{' '}
                      <span className="font-mono text-zinc-900">{s.value}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSpecifications((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-zinc-400 hover:text-red-600 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Initial Development Log */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-100">
            <span className="block text-xs font-semibold text-zinc-800">
              First Development Log Entry (optional)
            </span>
            <input
              type="text"
              value={logTitle}
              onChange={(e) => setLogTitle(e.target.value)}
              placeholder="Milestone title (e.g. Bench calibration & firmware v1)"
              className="w-full min-h-[40px] px-3 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
            />
            <textarea
              rows={2}
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="Notes on fabrication, design revisions, or test results..."
              className="w-full px-3 py-2 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
            />
          </div>

          {submitting && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-600 tabular-nums">
                <span>Uploading project demo &amp; portfolio assets...</span>
                <span>{uploadPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-200 overflow-hidden">
                <div
                  className="h-full bg-orange-600 transition-all duration-150"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-800 text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Publishing...' : 'Publish Demo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
