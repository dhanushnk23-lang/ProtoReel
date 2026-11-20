import { useMemo, useState } from 'react';
import { Play, ArrowUpRight, Bookmark } from 'lucide-react';
import type { Invention, InventionCategory, StudentProfile } from '../types';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface ShowcaseFeedProps {
  inventions: Invention[];
  students: StudentProfile[];
  shortlistedIds: string[];
  onWatchInvention: (invention: Invention) => void;
  onSelectStudent: (student: StudentProfile) => void;
  onToggleShortlist: (studentId: string) => void;
  onOpenUpload: () => void;
}

const CATEGORIES: ('All' | InventionCategory)[] = [
  'All',
  'Robotics',
  'CleanTech',
  'Assistive Tech',
  'Aerospace',
  'Embedded',
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.max(0, Math.round(seconds % 60));
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ShowcaseFeed({
  inventions,
  students,
  shortlistedIds,
  onWatchInvention,
  onSelectStudent,
  onToggleShortlist,
  onOpenUpload,
}: ShowcaseFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | InventionCategory>('All');
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  const studentById = useMemo(() => {
    const map = new Map<string, StudentProfile>();
    for (const s of students) {
      map.set(s.id, s);
    }
    return map;
  }, [students]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return inventions;
    return inventions.filter((inv) => inv.category === selectedCategory);
  }, [inventions, selectedCategory]);

  return (
    <section className="space-y-6 md:space-y-8">
      {/* Editorial Intro Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-2 max-w-2xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 [text-wrap:balance]">
            Student invention demos built for the bench, not just slides.
          </h1>
          <p className="text-sm md:text-base text-zinc-600 leading-relaxed">
            Watch working hardware and software prototypes from university makers, inspect bill-of-materials specs in ₹, and connect directly with builders.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs md:text-sm text-zinc-600 shrink-0 tabular-nums">
          <div>
            <span className="block text-lg md:text-xl font-bold text-zinc-900 font-display">
              {inventions.length}
            </span>
            <span>Working Demos</span>
          </div>
          <div className="h-8 w-px bg-zinc-200" aria-hidden="true" />
          <div>
            <span className="block text-lg md:text-xl font-bold text-zinc-900 font-display">
              {students.length}
            </span>
            <span>Student Builders</span>
          </div>
        </div>
      </div>

      {/* Category Filter Segmented Controls */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {CATEGORIES.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-600 ${
                active
                  ? 'bg-zinc-900 text-white'
                  : 'bg-[#EFEFEC] text-zinc-700 hover:bg-zinc-200/80 hover:text-zinc-900'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Invention Showcase Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 text-center space-y-4">
          <p className="font-display text-lg font-semibold text-zinc-900">
            No invention demos in {selectedCategory} yet
          </p>
          <p className="text-sm text-zinc-600 max-w-md mx-auto">
            Upload a project video demo to share the first prototype in this discipline.
          </p>
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Upload Project Demo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((inv) => {
            const student = studentById.get(inv.studentId);
            const isShortlisted = student ? shortlistedIds.includes(student.id) : false;
            const isPreviewing = hoveredVideoId === inv.id;
            const photoCount = inv.galleryImages?.length || 1;
            const specCount = inv.specifications?.length || 0;
            const logCount = inv.devLogs?.length || 0;

            return (
              <article
                key={inv.id}
                className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden flex flex-col transition-shadow duration-150 hover:shadow-md"
              >
                {/* Video / Poster Container */}
                <div
                  className="relative aspect-[4/3] bg-zinc-950 overflow-hidden group cursor-pointer"
                  onMouseEnter={() => setHoveredVideoId(inv.id)}
                  onMouseLeave={() => setHoveredVideoId(null)}
                  onClick={() => onWatchInvention(inv)}
                >
                  {isPreviewing ? (
                    <video
                      src={inv.videoUrl}
                      poster={inv.posterUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ResilientImage
                      src={inv.posterUrl}
                      alt={`${inv.title} prototype preview`}
                      fallbackTitle={inv.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  )}

                  {/* Measured contrast scrim */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none"
                  />

                  {/* Center-left / accessible play affordance */}
                  <button
                    type="button"
                    aria-label={`Play demo video for ${inv.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onWatchInvention(inv);
                    }}
                    className="absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-black/55 hover:bg-orange-600 text-white backdrop-blur-sm transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
                  </button>

                  {/* Unboxed video metadata over scrim */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/95 font-medium">
                    <span className="truncate">{inv.stage}</span>
                    <span className="font-mono tabular-nums shrink-0 ml-3">
                      {formatDuration(inv.durationSeconds)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500">
                      <span className="font-medium text-orange-700">{inv.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-zinc-800">
                        {formatINR(inv.budgetInr)} BOM
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{inv.viewsCount} views</span>
                    </div>

                    <h2 className="font-display text-lg md:text-xl font-bold text-zinc-900 leading-snug">
                      <button
                        type="button"
                        onClick={() => onWatchInvention(inv)}
                        className="text-left hover:text-orange-700 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-600 rounded-sm"
                      >
                        {inv.title}
                      </button>
                    </h2>

                    <p className="text-sm text-zinc-600 leading-relaxed line-clamp-2">
                      {inv.summary}
                    </p>
                  </div>

                  {/* Clean unboxed spec & student row */}
                  <div className="space-y-3 pt-3 border-t border-zinc-100">
                    <div className="text-xs text-zinc-500 truncate tabular-nums">
                      <span className="font-mono font-medium text-zinc-800">{inv.keyMetric}</span>
                      <span aria-hidden="true"> · </span>
                      <span>
                        {photoCount} {photoCount === 1 ? 'photo' : 'photos'} · {specCount} specs ·{' '}
                        {logCount} logs
                      </span>
                    </div>

                    {student && (
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onSelectStudent(student)}
                          className="flex items-center gap-2.5 min-h-[44px] text-left group/stu cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-600 rounded-lg pr-2"
                        >
                          <ResilientImage
                            src={student.avatarUrl}
                            alt={student.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 border border-zinc-200"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-zinc-900 group-hover/stu:text-orange-700 transition-colors flex items-center gap-1 truncate">
                              <span className="truncate">{student.name}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-60" aria-hidden="true" />
                            </div>
                            <div className="text-xs text-zinc-500 truncate">
                              {student.university} · Class of {student.gradYear}
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleShortlist(student.id)}
                          aria-label={isShortlisted ? `Remove ${student.name} from shortlist` : `Shortlist ${student.name}`}
                          className={`min-h-[44px] min-w-[44px] px-3 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-orange-600 ${
                            isShortlisted
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'bg-[#F7F7F5] text-zinc-700 hover:bg-zinc-200/70'
                          }`}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`}
                            aria-hidden="true"
                          />
                          <span className="hidden sm:inline">
                            {isShortlisted ? 'Saved' : 'Save'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
