import { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Play, Plus, Trophy, X } from 'lucide-react';
import type { InnovationChallenge, Invention, InventionCategory } from '../types';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface ChallengesViewProps {
  challenges: InnovationChallenge[];
  inventions: Invention[];
  onChallengeCreated: (challenge: InnovationChallenge) => void;
  onChallengeUpdated: (challenge: InnovationChallenge) => void;
  onWatchInvention: (invention: Invention) => void;
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

export function ChallengesView({
  challenges,
  inventions,
  onChallengeCreated,
  onChallengeUpdated,
  onWatchInvention,
  onOpenUpload,
}: ChallengesViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<'All' | InventionCategory>('All');

  // Sponsor Challenge Modal State
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [category, setCategory] = useState<InventionCategory>('Robotics');
  const [prizePoolInr, setPrizePoolInr] = useState('400000');
  const [grantPerTeamInr, setGrantPerTeamInr] = useState('35000');
  const [deadline, setDeadline] = useState('2027-02-15');
  const [brief, setBrief] = useState('');
  const [criteriaText, setCriteriaText] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Enter Prototype Modal State
  const [enteringChallenge, setEnteringChallenge] = useState<InnovationChallenge | null>(null);
  const [selectedInventionId, setSelectedInventionId] = useState(inventions[0]?.id || '');
  const [submittingEntry, setSubmittingEntry] = useState(false);

  const inventionById = useMemo(() => {
    const map = new Map<string, Invention>();
    for (const inv of inventions) map.set(inv.id, inv);
    return map;
  }, [inventions]);

  const filteredChallenges = useMemo(() => {
    if (categoryFilter === 'All') return challenges;
    return challenges.filter((c) => c.category === categoryFilter);
  }, [challenges, categoryFilter]);

  const totalPrizePool = challenges.reduce((sum, c) => sum + c.prizePoolInr, 0);

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!title.trim() || !sponsorName.trim() || !brief.trim()) {
      setCreateError('Challenge title, sponsor name, and brief are required.');
      return;
    }

    setCreating(true);
    try {
      const judgingCriteria = criteriaText
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          sponsorName: sponsorName.trim(),
          category,
          prizePoolInr: Number(prizePoolInr) || 300000,
          grantPerTeamInr: Number(grantPerTeamInr) || 35000,
          deadline,
          brief: brief.trim(),
          judgingCriteria,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || 'Could not publish innovation challenge.');
      }

      const created = (await res.json()) as InnovationChallenge;
      onChallengeCreated(created);
      setTitle('');
      setSponsorName('');
      setBrief('');
      setCriteriaText('');
      setSponsorOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unable to launch challenge.');
    } finally {
      setCreating(false);
    }
  };

  const handleEnterPrototype = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteringChallenge || !selectedInventionId) return;
    setSubmittingEntry(true);
    try {
      const res = await fetch(`/api/challenges/${enteringChallenge.id}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventionId: selectedInventionId }),
      });
      if (res.ok) {
        const updated = (await res.json()) as InnovationChallenge;
        onChallengeUpdated(updated);
        setEnteringChallenge(updated);
      }
    } finally {
      setSubmittingEntry(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-200">
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Sponsored Innovation Challenges
          </h1>
          <p className="text-sm md:text-base text-zinc-600 max-w-2xl">
            Industry-backed hardware and embedded sprints with prototype hardware grants and prize pools totaling{' '}
            <strong className="font-mono text-zinc-900 tabular-nums">
              {formatINR(totalPrizePool)}
            </strong>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSponsorOpen(true)}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Sponsor Challenge</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                active
                  ? 'bg-zinc-900 text-white'
                  : 'bg-[#EFEFEC] text-zinc-700 hover:bg-zinc-200/80'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredChallenges.map((challenge) => {
          const enteredProjects = challenge.enteredInventionIds
            .map((id) => inventionById.get(id))
            .filter((item): item is Invention => Boolean(item));

          return (
            <article
              key={challenge.id}
              className="bg-white border border-zinc-200/90 rounded-2xl p-5 md:p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                  <div>
                    <span className="font-semibold text-zinc-900">{challenge.sponsorName}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-medium text-orange-700">{challenge.category}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    Due {challenge.deadline}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-lg md:text-xl font-bold text-zinc-900">
                    {challenge.title}
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed">{challenge.brief}</p>
                </div>

                {/* Prize Pool & Prototype Grant */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-100">
                  <div>
                    <div className="text-xs text-zinc-500">Prize Pool</div>
                    <div className="font-mono text-lg font-bold text-zinc-900 tabular-nums mt-0.5">
                      {formatINR(challenge.prizePoolInr)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Hardware Grant / Team</div>
                    <div className="font-mono text-lg font-bold text-orange-700 tabular-nums mt-0.5">
                      {formatINR(challenge.grantPerTeamInr)}
                    </div>
                  </div>
                </div>

                {/* Judging Focus */}
                <div className="text-xs text-zinc-600 leading-relaxed">
                  <span className="font-semibold text-zinc-900">Judging Focus: </span>
                  {challenge.judgingCriteria.join(' · ')}
                </div>

                {/* Submitted Demos Strip */}
                {enteredProjects.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-semibold text-zinc-800 tabular-nums">
                      Submitted Prototypes ({enteredProjects.length})
                    </div>
                    <div className="space-y-2">
                      {enteredProjects.map((inv) => (
                        <button
                          key={inv.id}
                          type="button"
                          onClick={() => onWatchInvention(inv)}
                          className="w-full flex items-center gap-3 p-2 rounded-xl bg-[#F7F7F5] hover:bg-zinc-200/70 text-left transition-colors cursor-pointer"
                        >
                          <div className="relative w-14 aspect-[4/3] rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                            <ResilientImage
                              src={inv.posterUrl}
                              alt={inv.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 text-white fill-current" aria-hidden="true" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-zinc-900 truncate">
                              {inv.title}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono tabular-nums truncate">
                              {formatINR(inv.budgetInr)} BOM · {inv.keyMetric}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-500 tabular-nums">
                  {challenge.enteredInventionIds.length}{' '}
                  {challenge.enteredInventionIds.length === 1 ? 'submission' : 'submissions'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInventionId(inventions[0]?.id || '');
                    setEnteringChallenge(challenge);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Enter Prototype</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Sponsor Challenge Modal */}
      {sponsorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sponsor a new innovation challenge"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
          onClick={() => !creating && setSponsorOpen(false)}
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
                Sponsor Innovation Challenge
              </h2>
              <button
                type="button"
                disabled={creating}
                onClick={() => setSponsorOpen(false)}
                aria-label="Close sponsor challenge modal"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#F7F7F5] text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="p-5 space-y-4">
              {createError && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
                >
                  {createError}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="chal-title" className="text-xs font-semibold text-zinc-800">
                  Challenge Title
                </label>
                <input
                  id="chal-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Low-Cost Solar Micro-Inverter Challenge"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="chal-sponsor" className="text-xs font-semibold text-zinc-800">
                    Sponsor Organization
                  </label>
                  <input
                    id="chal-sponsor"
                    type="text"
                    required
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="e.g. Tata Power Labs"
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="chal-cat" className="text-xs font-semibold text-zinc-800">
                    Discipline
                  </label>
                  <select
                    id="chal-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InventionCategory)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="chal-prize" className="text-xs font-semibold text-zinc-800">
                    Total Prize Pool (₹)
                  </label>
                  <input
                    id="chal-prize"
                    type="number"
                    min={25000}
                    value={prizePoolInr}
                    onChange={(e) => setPrizePoolInr(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm font-mono tabular-nums text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-zinc-500 tabular-nums">
                    {formatINR(Number(prizePoolInr) || 0)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="chal-grant" className="text-xs font-semibold text-zinc-800">
                    Prototype Grant / Team (₹)
                  </label>
                  <input
                    id="chal-grant"
                    type="number"
                    min={0}
                    value={grantPerTeamInr}
                    onChange={(e) => setGrantPerTeamInr(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm font-mono tabular-nums text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-zinc-500 tabular-nums">
                    {formatINR(Number(grantPerTeamInr) || 0)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="chal-deadline" className="text-xs font-semibold text-zinc-800">
                  Submission Deadline
                </label>
                <input
                  id="chal-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="chal-brief" className="text-xs font-semibold text-zinc-800">
                  Problem Statement &amp; Hardware Constraints
                </label>
                <textarea
                  id="chal-brief"
                  required
                  rows={3}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Describe target BOM cost in ₹, performance benchmarks, and required demo evidence."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="chal-criteria" className="text-xs font-semibold text-zinc-800">
                  Judging Criteria (comma separated)
                </label>
                <input
                  id="chal-criteria"
                  type="text"
                  value={criteriaText}
                  onChange={(e) => setCriteriaText(e.target.value)}
                  placeholder="BOM under ₹8,000, Field test video, Thermal safety"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setSponsorOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F7F7F5] text-zinc-800 text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
                >
                  {creating ? 'Publishing...' : 'Launch Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter Prototype Modal */}
      {enteringChallenge && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Enter ${enteringChallenge.title}`}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
          onClick={() => setEnteringChallenge(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs text-zinc-500">{enteringChallenge.sponsorName}</div>
                <h3 className="font-display text-base font-bold text-zinc-900 truncate">
                  Submit Prototype to Challenge
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEnteringChallenge(null)}
                aria-label="Close entry modal"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-[#F7F7F5] text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleEnterPrototype} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="entry-inv" className="text-xs font-semibold text-zinc-800">
                    Choose Uploaded Invention Demo
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEnteringChallenge(null);
                      onOpenUpload();
                    }}
                    className="text-xs font-semibold text-orange-700 hover:underline cursor-pointer"
                  >
                    + Upload new demo
                  </button>
                </div>
                <select
                  id="entry-inv"
                  value={selectedInventionId}
                  onChange={(e) => setSelectedInventionId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
                >
                  {inventions.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.title} ({formatINR(inv.budgetInr)} BOM)
                    </option>
                  ))}
                </select>
              </div>

              {enteringChallenge.enteredInventionIds.includes(selectedInventionId) && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2 text-xs font-medium text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>This prototype is entered in {enteringChallenge.title}.</span>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEnteringChallenge(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F7F7F5] text-zinc-800 text-sm font-medium cursor-pointer"
                >
                  Close
                </button>
                {!enteringChallenge.enteredInventionIds.includes(selectedInventionId) && (
                  <button
                    type="submit"
                    disabled={submittingEntry}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
                  >
                    {submittingEntry ? 'Submitting...' : 'Submit Prototype'}
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
