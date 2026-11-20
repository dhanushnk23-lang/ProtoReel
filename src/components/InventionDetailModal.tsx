import { useEffect, useState } from 'react';
import { ArrowUpRight, Bookmark, Mail, Play, SlidersHorizontal, X } from 'lucide-react';
import type { Invention, StudentProfile } from '../types';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface InventionDetailModalProps {
  invention: Invention | null;
  student: StudentProfile | undefined;
  isShortlisted: boolean;
  onClose: () => void;
  onSelectStudent: (student: StudentProfile) => void;
  onToggleShortlist: (studentId: string) => void;
  onContactStudent: (student: StudentProfile) => void;
  onManageProjectDetails: (invention: Invention) => void;
}

export function InventionDetailModal({
  invention,
  student,
  isShortlisted,
  onClose,
  onSelectStudent,
  onToggleShortlist,
  onContactStudent,
  onManageProjectDetails,
}: InventionDetailModalProps) {
  const [selectedMedia, setSelectedMedia] = useState<'video' | string>('video');

  useEffect(() => {
    setSelectedMedia('video');
  }, [invention?.id]);

  useEffect(() => {
    if (!invention) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [invention, onClose]);

  if (!invention) return null;

  const photos = invention.galleryImages?.length ? invention.galleryImages : [invention.posterUrl];
  const specs = invention.specifications || [];
  const logs = invention.devLogs || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={invention.title}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Grab Handle */}
        <div className="md:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
        </div>

        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-zinc-500 truncate">
              <span className="font-medium text-orange-700">{invention.category}</span>
              <span aria-hidden="true"> · </span>
              <span>{invention.stage}</span>
            </div>
            <h2 className="font-display text-lg md:text-xl font-bold text-zinc-900 truncate">
              {invention.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onManageProjectDetails(invention)}
              className="min-h-[40px] px-3 rounded-xl bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Add Photos / Logs</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close project demo"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-700 cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Primary Media Stage (Video Demo or Selected Photo) */}
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden bg-zinc-950 aspect-[4/3]">
              {selectedMedia === 'video' ? (
                <video
                  key={invention.id}
                  src={invention.videoUrl}
                  poster={invention.posterUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <ResilientImage
                  src={selectedMedia}
                  alt={`${invention.title} project photo`}
                  className="w-full h-full object-contain bg-zinc-950"
                />
              )}
            </div>

            {/* Media Switcher Strip (Demo Video + Multiple Photos) */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedMedia('video')}
                className={`relative w-24 aspect-[4/3] rounded-lg overflow-hidden shrink-0 border-2 transition-colors cursor-pointer ${
                  selectedMedia === 'video' ? 'border-orange-600' : 'border-zinc-200 opacity-80 hover:opacity-100'
                }`}
              >
                <ResilientImage
                  src={invention.posterUrl}
                  alt="Demo video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white">
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span className="text-[10px] font-semibold mt-0.5">Demo Video</span>
                </div>
              </button>

              {photos.map((photoUrl, idx) => (
                <button
                  key={`${photoUrl}-${idx}`}
                  type="button"
                  onClick={() => setSelectedMedia(photoUrl)}
                  className={`w-24 aspect-[4/3] rounded-lg overflow-hidden shrink-0 border-2 transition-colors cursor-pointer ${
                    selectedMedia === photoUrl
                      ? 'border-orange-600'
                      : 'border-zinc-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <ResilientImage
                    src={photoUrl}
                    alt={`${invention.title} image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Engineering Summary & Key Metrics */}
          <div className="space-y-4">
            <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
              {invention.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-zinc-100 text-xs md:text-sm">
              <div>
                <div className="text-zinc-500">Benchmark</div>
                <div className="font-mono font-medium text-zinc-900 mt-0.5 truncate">
                  {invention.keyMetric}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">Unit BOM Cost</div>
                <div className="font-mono font-medium text-zinc-900 mt-0.5 truncate tabular-nums">
                  {formatINR(invention.budgetInr)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">Total R&amp;D Budget</div>
                <div className="font-mono font-medium text-zinc-900 mt-0.5 truncate tabular-nums">
                  {formatINR(invention.totalBudgetInr || invention.budgetInr)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">Demo Views</div>
                <div className="font-mono font-medium text-zinc-900 mt-0.5 tabular-nums">
                  {invention.viewsCount}
                </div>
              </div>
            </div>

            <div className="text-xs md:text-sm text-zinc-600">
              <span className="font-semibold text-zinc-900">Build Stack: </span>
              {invention.tools.join(' · ')}
            </div>
          </div>

          {/* Detailed Technical Specifications */}
          {specs.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-zinc-100">
              <h3 className="font-display text-sm md:text-base font-bold text-zinc-900">
                Technical Specifications
              </h3>
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl text-xs md:text-sm">
                {specs.map((spec, idx) => (
                  <div
                    key={`${spec.label}-${idx}`}
                    className="px-4 py-2.5 flex items-center justify-between gap-4"
                  >
                    <span className="text-zinc-500">{spec.label}</span>
                    <span className="font-mono font-medium text-zinc-900 text-right">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Development Logs */}
          {logs.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-zinc-100">
              <h3 className="font-display text-sm md:text-base font-bold text-zinc-900">
                Development Logs ({logs.length})
              </h3>
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 tabular-nums">
                      <span className="font-mono">{log.date}</span>
                      {typeof log.spendInr === 'number' && log.spendInr > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-medium text-zinc-800">
                            {formatINR(log.spendInr)} spend
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-zinc-900">{log.title}</div>
                    <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">{log.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Inventor Card */}
          {student && (
            <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectStudent(student);
                }}
                className="flex items-center gap-3 text-left group cursor-pointer min-h-[44px]"
              >
                <ResilientImage
                  src={student.avatarUrl}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover border border-zinc-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-display text-sm md:text-base font-bold text-zinc-900 group-hover:text-orange-700 flex items-center gap-1">
                    <span>{student.name}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-60" aria-hidden="true" />
                  </div>
                  <div className="text-xs text-zinc-600 truncate">
                    {student.university} · {student.major} · {student.availability}
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleShortlist(student.id)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isShortlisted
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-[#F7F7F5] text-zinc-800 hover:bg-zinc-200/80'
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`}
                    aria-hidden="true"
                  />
                  <span>{isShortlisted ? 'Saved' : 'Shortlist'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onContactStudent(student)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>Contact</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
