import { useEffect, useState } from 'react';
import { ImagePlus, Plus, Trash2, X } from 'lucide-react';
import type { DevelopmentLogEntry, Invention, InventionSpec } from '../types';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface ProjectDetailsModalProps {
  invention: Invention | null;
  onClose: () => void;
  onUpdated: (updated: Invention) => void;
}

export function ProjectDetailsModal({
  invention,
  onClose,
  onUpdated,
}: ProjectDetailsModalProps) {
  const [activeSection, setActiveSection] = useState<'gallery' | 'specs' | 'logs' | 'budget'>(
    'gallery'
  );
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<InventionSpec[]>([]);
  const [devLogs, setDevLogs] = useState<DevelopmentLogEntry[]>([]);
  const [budgetInr, setBudgetInr] = useState<string>('15000');
  const [totalBudgetInr, setTotalBudgetInr] = useState<string>('25000');

  // New Spec inputs
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // New Log inputs
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogNotes, setNewLogNotes] = useState('');
  const [newLogSpend, setNewLogSpend] = useState('');

  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invention) return;
    setGalleryImages(
      invention.galleryImages?.length ? invention.galleryImages : [invention.posterUrl]
    );
    setSpecifications(invention.specifications || []);
    setDevLogs(invention.devLogs || []);
    setBudgetInr(String(invention.budgetInr || 15000));
    setTotalBudgetInr(String(invention.totalBudgetInr || invention.budgetInr || 25000));
    setNewSpecLabel('');
    setNewSpecValue('');
    setNewLogTitle('');
    setNewLogNotes('');
    setNewLogSpend('');
    setError(null);
  }, [invention]);

  useEffect(() => {
    if (!invention) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [invention, saving, onClose]);

  if (!invention) return null;

  const handleMultiImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const res = await fetch('/api/images/upload', {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'image/jpeg',
            'X-Filename': encodeURIComponent(file.name),
          },
          body: file,
        });
        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
        const data = (await res.json()) as { url: string };
        uploadedUrls.push(data.url);
      }
      if (uploadedUrls.length > 0) {
        setGalleryImages((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAddSpec = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setSpecifications((prev) => [
      ...prev,
      { label: newSpecLabel.trim(), value: newSpecValue.trim() },
    ]);
    setNewSpecLabel('');
    setNewSpecValue('');
  };

  const handleAddLog = () => {
    if (!newLogTitle.trim() || !newLogNotes.trim()) return;
    const spend = Number(newLogSpend);
    const entry: DevelopmentLogEntry = {
      id: `log-${Date.now()}`,
      date: newLogDate || new Date().toISOString().slice(0, 10),
      title: newLogTitle.trim(),
      notes: newLogNotes.trim(),
      spendInr: Number.isFinite(spend) && spend > 0 ? Math.round(spend) : undefined,
    };
    setDevLogs((prev) => [entry, ...prev]);
    setNewLogTitle('');
    setNewLogNotes('');
    setNewLogSpend('');
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const parsedBom = Math.max(0, Math.round(Number(budgetInr) || 0));
      const parsedTotal = Math.max(parsedBom, Math.round(Number(totalBudgetInr) || parsedBom));

      const res = await fetch(`/api/inventions/${invention.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryImages,
          specifications,
          devLogs,
          budgetInr: parsedBom,
          totalBudgetInr: parsedTotal,
        }),
      });

      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error || 'Could not update project details.');
      }

      const updated = (await res.json()) as Invention;
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save project changes.');
    } finally {
      setSaving(false);
    }
  };

  const sectionTabs: { id: 'gallery' | 'specs' | 'logs' | 'budget'; label: string }[] = [
    { id: 'gallery', label: `Photos (${galleryImages.length})` },
    { id: 'specs', label: `Specs (${specifications.length})` },
    { id: 'logs', label: `Dev Logs (${devLogs.length})` },
    { id: 'budget', label: 'Budget (₹)' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Manage ${invention.title} portfolio details`}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
      onClick={() => !saving && onClose()}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="text-xs text-zinc-500">Edit Project Portfolio Entry</div>
            <h2 className="font-display text-lg font-bold text-zinc-900 truncate">
              {invention.title}
            </h2>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close editor"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-700 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Section Switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-zinc-100 flex items-center gap-2 overflow-x-auto shrink-0">
          {sectionTabs.map((tab) => {
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'bg-[#F7F7F5] text-zinc-700 hover:bg-zinc-200/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          {activeSection === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-zinc-600">
                  Add CAD renders, PCB close-ups, or field test photos for employers to inspect.
                </p>
                <label className="min-h-[40px] px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer">
                  <ImagePlus className="w-4 h-4" aria-hidden="true" />
                  <span>{uploadingImages ? 'Uploading...' : 'Add Photos'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingImages}
                    className="sr-only"
                    onChange={(e) => void handleMultiImageUpload(e.target.files)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}`}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 group"
                  >
                    <ResilientImage
                      src={imgUrl}
                      alt={`${invention.title} photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {galleryImages.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remove photo ${idx + 1}`}
                        onClick={() =>
                          setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-2 right-2 min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-black/65 hover:bg-red-600 text-white cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end bg-[#F7F7F5] p-3.5 rounded-xl">
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="spec-label" className="text-xs font-semibold text-zinc-700">
                    Parameter
                  </label>
                  <input
                    id="spec-label"
                    type="text"
                    value={newSpecLabel}
                    onChange={(e) => setNewSpecLabel(e.target.value)}
                    placeholder="e.g. Battery Life"
                    className="w-full min-h-[40px] px-3 rounded-lg bg-white border border-zinc-200 text-sm text-zinc-900 focus:border-orange-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="spec-value" className="text-xs font-semibold text-zinc-700">
                    Value
                  </label>
                  <input
                    id="spec-value"
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="e.g. 14 hrs (1800 mAh)"
                    className="w-full min-h-[40px] px-3 rounded-lg bg-white border border-zinc-200 text-sm text-zinc-900 focus:border-orange-600 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="min-h-[40px] px-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Add</span>
                </button>
              </div>

              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl">
                {specifications.length === 0 ? (
                  <p className="p-4 text-xs text-zinc-500 text-center">
                    No specifications added yet.
                  </p>
                ) : (
                  specifications.map((spec, idx) => (
                    <div
                      key={`${spec.label}-${idx}`}
                      className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <span className="font-medium text-zinc-600 truncate">{spec.label}</span>
                        <span className="font-mono text-zinc-900 truncate">{spec.value}</span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove specification ${spec.label}`}
                        onClick={() =>
                          setSpecifications((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSection === 'logs' && (
            <div className="space-y-4">
              <div className="bg-[#F7F7F5] p-4 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-zinc-900">
                  Add Development Log Entry
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="log-date" className="text-xs text-zinc-600">
                      Date
                    </label>
                    <input
                      id="log-date"
                      type="date"
                      value={newLogDate}
                      onChange={(e) => setNewLogDate(e.target.value)}
                      className="w-full min-h-[40px] px-3 rounded-lg bg-white border border-zinc-200 text-sm text-zinc-900 focus:border-orange-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="log-spend" className="text-xs text-zinc-600">
                      Milestone Spend in ₹ (optional)
                    </label>
                    <input
                      id="log-spend"
                      type="number"
                      min={0}
                      value={newLogSpend}
                      onChange={(e) => setNewLogSpend(e.target.value)}
                      placeholder="e.g. 4500"
                      className="w-full min-h-[40px] px-3 rounded-lg bg-white border border-zinc-200 text-sm text-zinc-900 tabular-nums focus:border-orange-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="log-title" className="text-xs text-zinc-600">
                    Milestone Title
                  </label>
                  <input
                    id="log-title"
                    type="text"
                    value={newLogTitle}
                    onChange={(e) => setNewLogTitle(e.target.value)}
                    placeholder="e.g. Rev C thermal & waterproofing validation"
                    className="w-full min-h-[40px] px-3 rounded-lg bg-white border border-zinc-200 text-sm text-zinc-900 focus:border-orange-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="log-notes" className="text-xs text-zinc-600">
                    Engineering Notes
                  </label>
                  <textarea
                    id="log-notes"
                    rows={2}
                    value={newLogNotes}
                    onChange={(e) => setNewLogNotes(e.target.value)}
                    placeholder="Describe what changed, test measurements, or design trade-offs."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-200 text-sm text-zinc-900 focus:border-orange-600 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddLog}
                    className="min-h-[40px] px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span>Add Log Entry</span>
                  </button>
                </div>
              </div>

              <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl">
                {devLogs.length === 0 ? (
                  <p className="p-4 text-xs text-zinc-500 text-center">
                    No development logs recorded yet.
                  </p>
                ) : (
                  devLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 tabular-nums">
                          <span className="font-mono">{log.date}</span>
                          {typeof log.spendInr === 'number' && log.spendInr > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono font-medium text-zinc-800">
                                {formatINR(log.spendInr)} spent
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-zinc-900">{log.title}</div>
                        <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
                          {log.notes}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Delete log ${log.title}`}
                        onClick={() => setDevLogs((prev) => prev.filter((l) => l.id !== log.id))}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSection === 'budget' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-600">
                All hardware build costs and R&D budgets are displayed across ProtoReel in Indian Rupees (₹).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="edit-bom-inr" className="text-xs font-semibold text-zinc-800">
                    Unit BOM Cost (₹)
                  </label>
                  <input
                    id="edit-bom-inr"
                    type="number"
                    min={0}
                    value={budgetInr}
                    onChange={(e) => setBudgetInr(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 font-mono tabular-nums focus:bg-white focus:border-orange-600 focus:outline-none"
                  />
                  <div className="text-xs text-zinc-500 tabular-nums">
                    Preview: {formatINR(Number(budgetInr) || 0)} BOM
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="edit-total-inr" className="text-xs font-semibold text-zinc-800">
                    Total R&D Prototype Budget (₹)
                  </label>
                  <input
                    id="edit-total-inr"
                    type="number"
                    min={0}
                    value={totalBudgetInr}
                    onChange={(e) => setTotalBudgetInr(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 font-mono tabular-nums focus:bg-white focus:border-orange-600 focus:outline-none"
                  />
                  <div className="text-xs text-zinc-500 tabular-nums">
                    Preview: {formatINR(Number(totalBudgetInr) || 0)} Total Budget
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-100 flex items-center justify-end gap-3 shrink-0 bg-white">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-800 text-sm font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || uploadingImages}
            onClick={() => void handleSave()}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Portfolio Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
