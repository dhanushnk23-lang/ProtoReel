import { useMemo } from 'react';
import { FolderKanban, UserPlus } from 'lucide-react';
import type { Invention, StudentProfile } from '../types';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface StudentProfilesViewProps {
  students: StudentProfile[];
  inventions: Invention[];
  onSelectStudent: (student: StudentProfile) => void;
  onOpenCreateProfile: () => void;
}

export function StudentProfilesView({
  students,
  inventions,
  onSelectStudent,
  onOpenCreateProfile,
}: StudentProfilesViewProps) {
  const portfolioSummaryByStudent = useMemo(() => {
    const map = new Map<string, { count: number; totalBudgetInr: number }>();
    for (const inv of inventions) {
      const current = map.get(inv.studentId) || { count: 0, totalBudgetInr: 0 };
      map.set(inv.studentId, {
        count: current.count + 1,
        totalBudgetInr: current.totalBudgetInr + (inv.totalBudgetInr || inv.budgetInr || 0),
      });
    }
    return map;
  }, [inventions]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-200">
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Student Inventor Profiles
          </h1>
          <p className="text-sm md:text-base text-zinc-600 max-w-xl">
            Browse maker Project Portfolios across universities, inspect specifications and dev logs, or publish your own student profile.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateProfile}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          <span>Create Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => {
          const summary = portfolioSummaryByStudent.get(student.id) || {
            count: 0,
            totalBudgetInr: 0,
          };

          return (
            <button
              key={student.id}
              type="button"
              onClick={() => onSelectStudent(student)}
              className="bg-white border border-zinc-200/90 rounded-2xl p-5 text-left flex flex-col justify-between gap-4 hover:shadow-md transition-shadow duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-600"
            >
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-4">
                  <ResilientImage
                    src={student.avatarUrl}
                    alt={student.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-zinc-200"
                  />
                  <div className="min-w-0 space-y-1">
                    <h2 className="font-display text-lg font-bold text-zinc-900 truncate">
                      {student.name}
                    </h2>
                    <p className="text-xs text-zinc-600 truncate">
                      {student.university} · &apos;{String(student.gradYear).slice(-2)}
                    </p>
                    <p className="text-xs font-medium text-orange-700 truncate">
                      {student.availability}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-zinc-800 truncate">
                    {student.major}
                  </div>
                  <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                    {student.bio}
                  </p>
                </div>
              </div>

              <div className="w-full pt-3 border-t border-zinc-100 space-y-2">
                <div className="text-xs text-zinc-500 truncate">
                  {student.skills.slice(0, 4).join(' · ')}
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-zinc-800 pt-1">
                  <span className="inline-flex items-center gap-1.5 tabular-nums truncate">
                    <FolderKanban className="w-3.5 h-3.5 text-orange-600 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {summary.count} {summary.count === 1 ? 'project' : 'projects'}
                      {summary.totalBudgetInr > 0
                        ? ` · ${formatINR(summary.totalBudgetInr)}`
                        : ''}
                    </span>
                  </span>
                  <span className="text-orange-700 shrink-0 ml-2">Portfolio →</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
