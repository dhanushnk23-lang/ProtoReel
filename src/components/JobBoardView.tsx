import { useMemo, useState } from 'react';
import { Briefcase, CheckCircle2, MapPin, Plus, Search, X } from 'lucide-react';
import type { JobOpening, JobRoleType, StudentProfile } from '../types';
import { formatINR } from '../utils/currency';

interface JobBoardViewProps {
  jobs: JobOpening[];
  students: StudentProfile[];
  onJobCreated: (job: JobOpening) => void;
  onJobUpdated: (job: JobOpening) => void;
}

const ROLE_TYPES: ('All' | JobRoleType)[] = [
  'All',
  'Full-Time',
  'Internship',
  'Co-op',
  'Research Fellow',
];

export function JobBoardView({
  jobs,
  students,
  onJobCreated,
  onJobUpdated,
}: JobBoardViewProps) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | JobRoleType>('All');

  // Post Job Modal State
  const [postOpen, setPostOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Bengaluru, IN');
  const [roleType, setRoleType] = useState<JobRoleType>('Full-Time');
  const [compPeriod, setCompPeriod] = useState<'year' | 'month'>('year');
  const [compMin, setCompMin] = useState('1000000');
  const [compMax, setCompMax] = useState('1500000');
  const [skillsText, setSkillsText] = useState('');
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Apply Modal State
  const [applyingJob, setApplyingJob] = useState<JobOpening | null>(null);
  const [applyStudentId, setApplyStudentId] = useState(students[0]?.id || '');
  const [applying, setApplying] = useState(false);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (roleFilter !== 'All' && job.roleType !== roleFilter) return false;
      if (!q) return true;
      const text = [
        job.title,
        job.company,
        job.location,
        job.description,
        ...job.skillsRequired,
      ]
        .join(' ')
        .toLowerCase();
      return text.includes(q);
    });
  }, [jobs, query, roleFilter]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);
    if (!title.trim() || !company.trim() || !description.trim()) {
      setPostError('Job title, company name, and role description are required.');
      return;
    }

    setPosting(true);
    try {
      const skillsRequired = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          company: company.trim(),
          location: location.trim() || 'Bengaluru, IN',
          roleType,
          compensationPeriod: compPeriod,
          compensationMinInr: Number(compMin) || 0,
          compensationMaxInr: Number(compMax) || Number(compMin) || 0,
          skillsRequired: skillsRequired.length > 0 ? skillsRequired : ['Hardware Engineering'],
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || 'Could not publish job opening.');
      }

      const created = (await res.json()) as JobOpening;
      onJobCreated(created);
      setTitle('');
      setCompany('');
      setSkillsText('');
      setDescription('');
      setPostOpen(false);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Unable to post job.');
    } finally {
      setPosting(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob || !applyStudentId) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/jobs/${applyingJob.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: applyStudentId }),
      });
      if (res.ok) {
        const updated = (await res.json()) as JobOpening;
        onJobUpdated(updated);
        setApplyingJob(updated);
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-200">
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Engineering &amp; Maker Job Board
          </h1>
          <p className="text-sm md:text-base text-zinc-600 max-w-2xl">
            Companies hiring hands-on student builders for robotics, embedded systems, and product engineering roles across India.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPostOpen(true)}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Post Opening</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Search
            className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter openings by role, company, city, or skill (e.g. STM32, ROS2, Bengaluru)..."
            aria-label="Search job openings"
            className="w-full min-h-[44px] pl-11 pr-10 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear job search"
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          {ROLE_TYPES.map((type) => {
            const active = roleFilter === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setRoleFilter(type)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'bg-[#F7F7F5] text-zinc-700 hover:bg-zinc-200/80'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-3">
          <p className="font-display text-lg font-semibold text-zinc-900">
            No matching openings right now
          </p>
          <p className="text-sm text-zinc-600">
            Adjust your filter or post a new engineering opening for student inventors.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <article
              key={job.id}
              className="bg-white border border-zinc-200/90 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-sm transition-shadow"
            >
              <div className="space-y-2.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-900">{job.company}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-orange-700">{job.roleType}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    {job.location}
                  </span>
                </div>

                <h2 className="font-display text-lg md:text-xl font-bold text-zinc-900">
                  {job.title}
                </h2>

                <p className="text-sm text-zinc-600 leading-relaxed max-w-3xl">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-1">
                  <span className="font-mono font-semibold text-zinc-900 tabular-nums">
                    {formatINR(job.compensationMinInr)} – {formatINR(job.compensationMaxInr)} /{' '}
                    {job.compensationPeriod === 'month' ? 'mo' : 'yr'}
                  </span>
                  <span className="text-zinc-500 truncate">
                    {job.skillsRequired.join(' · ')}
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-row md:flex-col items-center md:items-end justify-between gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100">
                <span className="text-xs text-zinc-500 tabular-nums">
                  {job.appliedStudentIds.length}{' '}
                  {job.appliedStudentIds.length === 1 ? 'applicant' : 'applicants'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setApplyStudentId(students[0]?.id || '');
                    setApplyingJob(job);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Apply with Profile</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Post Opening Modal */}
      {postOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Post a job opening"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
          onClick={() => !posting && setPostOpen(false)}
        >
          <div
            className="bg-white w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:hidden pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
            </div>
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-zinc-900">
                Post Engineering Opening
              </h2>
              <button
                type="button"
                disabled={posting}
                onClick={() => setPostOpen(false)}
                aria-label="Close post job modal"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#F7F7F5] text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="p-5 space-y-4">
              {postError && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
                >
                  {postError}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="job-title" className="text-xs font-semibold text-zinc-800">
                  Role Title
                </label>
                <input
                  id="job-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Robotics Control Firmware Intern"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="job-company" className="text-xs font-semibold text-zinc-800">
                    Company Name
                  </label>
                  <input
                    id="job-company"
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Agnikul Cosmos"
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="job-location" className="text-xs font-semibold text-zinc-800">
                    Location
                  </label>
                  <input
                    id="job-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Chennai, IN"
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="job-type" className="text-xs font-semibold text-zinc-800">
                    Role Type
                  </label>
                  <select
                    id="job-type"
                    value={roleType}
                    onChange={(e) => {
                      const next = e.target.value as JobRoleType;
                      setRoleType(next);
                      if (next === 'Internship' || next === 'Co-op') {
                        setCompPeriod('month');
                        setCompMin('40000');
                        setCompMax('60000');
                      } else {
                        setCompPeriod('year');
                        setCompMin('1000000');
                        setCompMax('1500000');
                      }
                    }}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Co-op">Co-op</option>
                    <option value="Research Fellow">Research Fellow</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="job-period" className="text-xs font-semibold text-zinc-800">
                    Pay Cadence
                  </label>
                  <select
                    id="job-period"
                    value={compPeriod}
                    onChange={(e) => setCompPeriod(e.target.value as 'year' | 'month')}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                  >
                    <option value="year">Annual CTC (₹ / yr)</option>
                    <option value="month">Monthly Stipend (₹ / mo)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="job-min" className="text-xs font-semibold text-zinc-800">
                    Min Compensation (₹)
                  </label>
                  <input
                    id="job-min"
                    type="number"
                    min={0}
                    value={compMin}
                    onChange={(e) => setCompMin(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm font-mono tabular-nums text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-zinc-500 tabular-nums">
                    {formatINR(Number(compMin) || 0)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="job-max" className="text-xs font-semibold text-zinc-800">
                    Max Compensation (₹)
                  </label>
                  <input
                    id="job-max"
                    type="number"
                    min={0}
                    value={compMax}
                    onChange={(e) => setCompMax(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm font-mono tabular-nums text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-zinc-500 tabular-nums">
                    {formatINR(Number(compMax) || 0)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="job-skills" className="text-xs font-semibold text-zinc-800">
                  Required Skills (comma separated)
                </label>
                <input
                  id="job-skills"
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="ROS2, Embedded C, KiCad, SolidWorks"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="job-desc" className="text-xs font-semibold text-zinc-800">
                  Role Scope &amp; Prototype Focus
                </label>
                <textarea
                  id="job-desc"
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the hardware/software challenges the student will own."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setPostOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F7F7F5] text-zinc-800 text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
                >
                  {posting ? 'Publishing...' : 'Publish Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply with Student Profile Modal */}
      {applyingJob && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Apply to ${applyingJob.title}`}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
          onClick={() => setApplyingJob(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs text-zinc-500">{applyingJob.company}</div>
                <h3 className="font-display text-base font-bold text-zinc-900 truncate">
                  {applyingJob.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setApplyingJob(null)}
                aria-label="Close application modal"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-[#F7F7F5] text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="apply-stu" className="text-xs font-semibold text-zinc-800">
                  Select Your Student Profile
                </label>
                <select
                  id="apply-stu"
                  value={applyStudentId}
                  onChange={(e) => setApplyStudentId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.university}
                    </option>
                  ))}
                </select>
              </div>

              {applyingJob.appliedStudentIds.includes(applyStudentId) ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2 text-xs font-medium text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Application submitted with your Project Portfolio and demo videos.</span>
                </div>
              ) : null}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F7F7F5] text-zinc-800 text-sm font-medium cursor-pointer"
                >
                  Close
                </button>
                {!applyingJob.appliedStudentIds.includes(applyStudentId) && (
                  <button
                    type="submit"
                    disabled={applying}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
