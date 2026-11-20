import { useEffect, useState } from 'react';
import {
  Award,
  Bookmark,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Play,
  Plus,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { Invention, StudentProfile } from '../types';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface StudentProfileModalProps {
  student: StudentProfile | null;
  inventions: Invention[];
  isShortlisted: boolean;
  onClose: () => void;
  onWatchInvention: (invention: Invention) => void;
  onToggleShortlist: (studentId: string) => void;
  onContactStudent: (student: StudentProfile) => void;
  onEditProfile: (student: StudentProfile) => void;
  onUploadForStudent: (studentId: string) => void;
  onManageProjectDetails: (invention: Invention) => void;
}

type PortfolioCardTab = 'specs' | 'logs' | 'gallery';

export function StudentProfileModal({
  student,
  inventions,
  isShortlisted,
  onClose,
  onWatchInvention,
  onToggleShortlist,
  onContactStudent,
  onEditProfile,
  onUploadForStudent,
  onManageProjectDetails,
}: StudentProfileModalProps) {
  const [cardTabs, setCardTabs] = useState<Record<string, PortfolioCardTab>>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (!student) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [student, lightboxImage, onClose]);

  if (!student) return null;

  const studentInventions = inventions.filter((inv) => inv.studentId === student.id);
  const totalPortfolioBudget = studentInventions.reduce(
    (sum, inv) => sum + (inv.totalBudgetInr || inv.budgetInr || 0),
    0
  );

  const getTab = (invId: string): PortfolioCardTab => cardTabs[invId] || 'specs';
  const setTab = (invId: string, tab: PortfolioCardTab) =>
    setCardTabs((prev) => ({ ...prev, [invId]: tab }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${student.name} profile`}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
        </div>

        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-zinc-500">Student Profile & Portfolio</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEditProfile(student)}
              className="min-h-[40px] px-3 rounded-xl bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close student profile"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-700 cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-6">
          {/* Identity Header */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <ResilientImage
              src={student.avatarUrl}
              alt={student.name}
              className="w-24 h-24 rounded-2xl object-cover border border-zinc-200 shrink-0"
            />
            <div className="space-y-1.5 min-w-0 flex-1">
              <h2 className="font-display text-2xl font-bold text-zinc-900">{student.name}</h2>
              <p className="text-sm font-medium text-zinc-800">{student.major}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600">
                <span>
                  {student.university} · Class of {student.gradYear}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  {student.location}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-orange-700">{student.availability}</span>
              </div>
              {student.featuredAward && (
                <div className="pt-1 flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                  <Award className="w-4 h-4 text-orange-600 shrink-0" aria-hidden="true" />
                  <span>{student.featuredAward}</span>
                </div>
              )}
            </div>
          </div>

          {/* Employer & Student Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onContactStudent(student)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>Request Intro</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleShortlist(student.id)}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                isShortlisted
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'bg-[#F7F7F5] text-zinc-800 hover:bg-zinc-200/80'
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`}
                aria-hidden="true"
              />
              <span>{isShortlisted ? 'Shortlisted' : 'Shortlist Talent'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onUploadForStudent(student.id);
              }}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Invention Demo</span>
            </button>
          </div>

          {/* Bio & Skills */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="space-y-1.5">
              <h3 className="font-display text-sm font-bold text-zinc-900">About</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{student.bio}</p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-sm font-bold text-zinc-900">Technical Skills</h3>
              <p className="text-sm text-zinc-700 leading-relaxed">
                {student.skills.join(' · ')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-orange-700">
              <a
                href={`mailto:${student.email}`}
                className="inline-flex items-center gap-1 hover:underline py-1 text-zinc-800"
              >
                <Mail className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
                <span>{student.email}</span>
              </a>
              {student.githubUrl && (
                <a
                  href={student.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline py-1"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
              {student.portfolioUrl && (
                <a
                  href={student.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline py-1"
                >
                  <span>Portfolio Site</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Dedicated Project Portfolio Section */}
          <section
            aria-label="Project Portfolio"
            className="space-y-4 pt-5 border-t border-zinc-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h3 className="font-display text-lg font-bold text-zinc-900">
                Project Portfolio
              </h3>
              <div className="text-xs text-zinc-500 tabular-nums">
                {studentInventions.length}{' '}
                {studentInventions.length === 1 ? 'invention' : 'inventions'}
                {totalPortfolioBudget > 0 && (
                  <>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono font-medium text-zinc-800">
                      {formatINR(totalPortfolioBudget)} total R&amp;D budget
                    </span>
                  </>
                )}
              </div>
            </div>

            {studentInventions.length === 0 ? (
              <div className="bg-[#F7F7F5] rounded-2xl p-6 text-center space-y-2">
                <p className="text-sm text-zinc-600">
                  No inventions added to this student&apos;s Project Portfolio yet.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onUploadForStudent(student.id);
                  }}
                  className="text-xs font-semibold text-orange-700 hover:underline cursor-pointer min-h-[36px] px-2"
                >
                  Upload first invention demo
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {studentInventions.map((inv) => {
                  const activeTab = getTab(inv.id);
                  const photos = inv.galleryImages?.length ? inv.galleryImages : [inv.posterUrl];
                  const specs = inv.specifications || [];
                  const logs = inv.devLogs || [];

                  return (
                    <article
                      key={inv.id}
                      className="border border-zinc-200 rounded-2xl overflow-hidden bg-white"
                    >
                      {/* Project Summary + Media Header */}
                      <div className="p-4 md:p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-x-2">
                              <span className="font-medium text-orange-700">{inv.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{inv.stage}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums text-zinc-800">
                                {formatINR(inv.budgetInr)} BOM
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums text-zinc-600">
                                {formatINR(inv.totalBudgetInr || inv.budgetInr)} Budget
                              </span>
                            </div>
                            <h4 className="font-display text-base md:text-lg font-bold text-zinc-900">
                              {inv.title}
                            </h4>
                            <p className="text-sm text-zinc-600 leading-relaxed">{inv.summary}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => onManageProjectDetails(inv)}
                              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#F7F7F5] hover:bg-zinc-200/80 text-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onWatchInvention(inv);
                              }}
                              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                              <span>Play Video</span>
                            </button>
                          </div>
                        </div>

                        {/* Segmented Tabs inside Portfolio Project */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-100 overflow-x-auto">
                          <button
                            type="button"
                            onClick={() => setTab(inv.id, 'specs')}
                            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                              activeTab === 'specs'
                                ? 'bg-zinc-900 text-white'
                                : 'bg-[#F7F7F5] text-zinc-700 hover:bg-zinc-200/70'
                            }`}
                          >
                            Specifications ({specs.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setTab(inv.id, 'logs')}
                            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                              activeTab === 'logs'
                                ? 'bg-zinc-900 text-white'
                                : 'bg-[#F7F7F5] text-zinc-700 hover:bg-zinc-200/70'
                            }`}
                          >
                            Dev Logs ({logs.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setTab(inv.id, 'gallery')}
                            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                              activeTab === 'gallery'
                                ? 'bg-zinc-900 text-white'
                                : 'bg-[#F7F7F5] text-zinc-700 hover:bg-zinc-200/70'
                            }`}
                          >
                            Photos ({photos.length})
                          </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'specs' && (
                          <div className="divide-y divide-zinc-100 text-xs md:text-sm">
                            <div className="py-2 flex items-center justify-between gap-4">
                              <span className="text-zinc-500">Key Benchmark</span>
                              <span className="font-mono font-medium text-zinc-900 text-right">
                                {inv.keyMetric}
                              </span>
                            </div>
                            <div className="py-2 flex items-center justify-between gap-4">
                              <span className="text-zinc-500">Unit BOM / R&amp;D Budget</span>
                              <span className="font-mono font-medium text-zinc-900 tabular-nums text-right">
                                {formatINR(inv.budgetInr)} /{' '}
                                {formatINR(inv.totalBudgetInr || inv.budgetInr)}
                              </span>
                            </div>
                            {specs.map((spec, idx) => (
                              <div
                                key={`${spec.label}-${idx}`}
                                className="py-2 flex items-center justify-between gap-4"
                              >
                                <span className="text-zinc-500">{spec.label}</span>
                                <span className="font-mono text-zinc-900 text-right">
                                  {spec.value}
                                </span>
                              </div>
                            ))}
                            <div className="py-2 flex items-start justify-between gap-4">
                              <span className="text-zinc-500 shrink-0">Stack</span>
                              <span className="text-zinc-800 text-right">
                                {inv.tools.join(' · ')}
                              </span>
                            </div>
                          </div>
                        )}

                        {activeTab === 'logs' && (
                          <div className="divide-y divide-zinc-100">
                            {logs.length === 0 ? (
                              <p className="py-3 text-xs text-zinc-500">
                                No development logs yet. Tap Edit Details to add engineering milestones.
                              </p>
                            ) : (
                              logs.map((log) => (
                                <div key={log.id} className="py-3 first:pt-1 last:pb-1 space-y-1">
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 tabular-nums">
                                    <span className="font-mono">{log.date}</span>
                                    {typeof log.spendInr === 'number' && log.spendInr > 0 && (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span className="font-mono font-medium text-zinc-800">
                                          {formatINR(log.spendInr)}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <div className="text-sm font-semibold text-zinc-900">
                                    {log.title}
                                  </div>
                                  <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
                                    {log.notes}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {activeTab === 'gallery' && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {photos.map((photoUrl, idx) => (
                              <button
                                key={`${photoUrl}-${idx}`}
                                type="button"
                                onClick={() => setLightboxImage(photoUrl)}
                                className="aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 cursor-pointer hover:opacity-95 transition-opacity"
                              >
                                <ResilientImage
                                  src={photoUrl}
                                  alt={`${inv.title} gallery photo ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Simple Photo Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxImage(null);
          }}
        >
          <button
            type="button"
            aria-label="Close full image"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <img
            src={lightboxImage}
            alt="Project gallery detail"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[85vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
