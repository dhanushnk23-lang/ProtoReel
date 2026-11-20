import { useMemo, useState } from 'react';
import { Bookmark, Mail, Play, Search, X } from 'lucide-react';
import type { AvailabilityStatus, Invention, StudentProfile } from '../types';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface TalentSearchViewProps {
  students: StudentProfile[];
  inventions: Invention[];
  shortlistedIds: string[];
  shortlistOnly?: boolean;
  onSelectStudent: (student: StudentProfile) => void;
  onWatchInvention: (invention: Invention) => void;
  onToggleShortlist: (studentId: string) => void;
  onContactStudent: (student: StudentProfile) => void;
}

const AVAILABILITY_FILTERS: ('All' | AvailabilityStatus)[] = [
  'All',
  'Seeking Full-Time',
  'Internship / Co-op',
  'Available Now',
  'Open to Research',
];

export function TalentSearchView({
  students,
  inventions,
  shortlistedIds,
  shortlistOnly = false,
  onSelectStudent,
  onWatchInvention,
  onToggleShortlist,
  onContactStudent,
}: TalentSearchViewProps) {
  const [query, setQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | AvailabilityStatus>('All');
  const [onlyShortlisted, setOnlyShortlisted] = useState(shortlistOnly);

  const inventionsByStudent = useMemo(() => {
    const map = new Map<string, Invention[]>();
    for (const inv of inventions) {
      const list = map.get(inv.studentId) || [];
      list.push(inv);
      map.set(inv.studentId, list);
    }
    return map;
  }, [inventions]);

  const effectiveShortlistOnly = shortlistOnly || onlyShortlisted;

  const matchingStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((student) => {
      if (effectiveShortlistOnly && !shortlistedIds.includes(student.id)) {
        return false;
      }
      if (availabilityFilter !== 'All' && student.availability !== availabilityFilter) {
        return false;
      }
      if (!q) return true;

      const studentInventions = inventionsByStudent.get(student.id) || [];
      const searchable = [
        student.name,
        student.university,
        student.major,
        student.location,
        student.bio,
        ...student.skills,
        ...studentInventions.flatMap((inv) => [
          inv.title,
          inv.category,
          inv.summary,
          ...inv.tools,
          ...(inv.specifications || []).flatMap((sp) => [sp.label, sp.value]),
          ...(inv.devLogs || []).flatMap((lg) => [lg.title, lg.notes]),
        ]),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [
    students,
    query,
    availabilityFilter,
    effectiveShortlistOnly,
    shortlistedIds,
    inventionsByStudent,
  ]);

  const quickQueries = ['ROS2', 'Embedded C', 'Carbon', 'KiCad', 'IIT', 'PX4'];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-zinc-200">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 [text-wrap:balance]">
          {shortlistOnly ? 'Shortlisted Student Inventors' : 'Find Engineering & Maker Talent'}
        </h1>
        <p className="text-sm md:text-base text-zinc-600 max-w-2xl">
          {shortlistOnly
            ? 'Review your saved candidates, replay their hardware or software demos, and send intro requests.'
            : 'Search verified student inventors by technical skill, university, graduation year, or working prototype — completely free to connect.'}
        </p>
      </div>

      {/* Simple Employer Search Box */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 md:p-5 space-y-4">
        <div className="relative">
          <Search
            className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, majors, universities, or inventions (e.g. ROS2, STM32, Braille)..."
            aria-label="Search student talent"
            className="w-full min-h-[48px] pl-11 pr-11 py-3 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm md:text-base text-zinc-900 placeholder:text-zinc-500 focus:bg-white focus:border-orange-600 focus:outline-none transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Quick Skill Shortcuts + Availability Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-zinc-500 shrink-0 mr-1">Try:</span>
            {quickQueries.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(query === term ? '' : term)}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  query.toLowerCase() === term.toLowerCase()
                    ? 'bg-orange-600 text-white'
                    : 'bg-[#F7F7F5] text-zinc-700 hover:bg-zinc-200/80'
                }`}
              >
                {term}
              </button>
            ))}
          </div>

          {!shortlistOnly && (
            <button
              type="button"
              onClick={() => setOnlyShortlisted((prev) => !prev)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer self-start sm:self-auto ${
                onlyShortlisted
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'bg-[#EFEFEC] text-zinc-700 hover:bg-zinc-200/80'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyShortlisted ? 'fill-current' : ''}`} aria-hidden="true" />
              <span>Shortlisted ({shortlistedIds.length})</span>
            </button>
          )}
        </div>

        {/* Availability Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-zinc-100">
          {AVAILABILITY_FILTERS.map((status) => {
            const active = availabilityFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setAvailabilityFilter(status)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs md:text-sm text-zinc-600 tabular-nums">
        <span>
          Showing <strong className="text-zinc-900 font-semibold">{matchingStudents.length}</strong>{' '}
          {matchingStudents.length === 1 ? 'student inventor' : 'student inventors'}
        </span>
        {(query || availabilityFilter !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setAvailabilityFilter('All');
              setOnlyShortlisted(false);
            }}
            className="text-orange-700 hover:text-orange-800 font-medium cursor-pointer min-h-[36px] px-2"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Matching Talent List */}
      {matchingStudents.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 text-center space-y-3">
          <p className="font-display text-lg font-semibold text-zinc-900">
            {shortlistOnly ? 'No students shortlisted yet' : 'No matching student profiles found'}
          </p>
          <p className="text-sm text-zinc-600 max-w-md mx-auto">
            {shortlistOnly
              ? 'Tap Save on any invention demo or student profile to keep top candidates in one place.'
              : 'Try searching a broader engineering discipline like C++, Python, PCB, or Robotics.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {matchingStudents.map((student) => {
            const studentInventions = inventionsByStudent.get(student.id) || [];
            const leadDemo = studentInventions[0];
            const isShortlisted = shortlistedIds.includes(student.id);

            return (
              <article
                key={student.id}
                className="bg-white border border-zinc-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:shadow-sm transition-shadow"
              >
                <div className="space-y-3">
                  {/* Top Student Identity Row */}
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectStudent(student)}
                      className="flex items-center gap-3.5 text-left group cursor-pointer min-w-0"
                    >
                      <ResilientImage
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover shrink-0 border border-zinc-200"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <h2 className="font-display text-base md:text-lg font-bold text-zinc-900 group-hover:text-orange-700 transition-colors truncate">
                          {student.name}
                        </h2>
                        <div className="text-xs md:text-sm text-zinc-600 truncate">
                          {student.university} · Class of {student.gradYear}
                        </div>
                        <div className="text-xs font-medium text-orange-700 truncate">
                          {student.availability} · {student.location}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleShortlist(student.id)}
                      aria-label={isShortlisted ? `Remove ${student.name} from shortlist` : `Shortlist ${student.name}`}
                      className={`min-h-[44px] min-w-[44px] px-3 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                        isShortlisted
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-[#F7F7F5] text-zinc-700 hover:bg-zinc-200/70'
                      }`}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`}
                        aria-hidden="true"
                      />
                      <span className="hidden sm:inline">{isShortlisted ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  {/* Major & Bio */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-zinc-800">{student.major}</div>
                    <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                      {student.bio}
                    </p>
                  </div>

                  {/* Unboxed Skills List */}
                  <div className="text-xs text-zinc-600 leading-relaxed">
                    <span className="font-medium text-zinc-900">Skills: </span>
                    {student.skills.join(' · ')}
                  </div>
                  {leadDemo && (
                    <div className="text-xs text-zinc-500 tabular-nums">
                      <span className="font-medium text-zinc-800">Portfolio Budget: </span>
                      <span className="font-mono">{formatINR(leadDemo.budgetInr)} BOM</span>
                      <span aria-hidden="true"> · </span>
                      <span>
                        {leadDemo.galleryImages?.length || 1} photos ·{' '}
                        {leadDemo.devLogs?.length || 0} dev logs
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                  {leadDemo ? (
                    <button
                      type="button"
                      onClick={() => onWatchInvention(leadDemo)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F7F7F5] hover:bg-zinc-200/80 text-zinc-900 text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer max-w-full"
                    >
                      <Play className="w-3.5 h-3.5 text-orange-600 fill-current shrink-0" aria-hidden="true" />
                      <span className="truncate">Watch: {leadDemo.title}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectStudent(student)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F7F7F5] hover:bg-zinc-200/80 text-zinc-800 text-xs font-semibold cursor-pointer"
                    >
                      View Profile
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onContactStudent(student)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Request Intro</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
