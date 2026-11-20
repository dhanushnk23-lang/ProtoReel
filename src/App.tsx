import { useCallback, useEffect, useMemo, useState } from 'react';
import { BottomTabBar } from './components/BottomTabBar';
import { ChallengesView } from './components/ChallengesView';
import { ContactModal } from './components/ContactModal';
import { InventionDetailModal } from './components/InventionDetailModal';
import { JobBoardView } from './components/JobBoardView';
import { ProjectDetailsModal } from './components/ProjectDetailsModal';
import { ShowcaseFeed } from './components/ShowcaseFeed';
import { StudentFormModal } from './components/StudentFormModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { StudentProfilesView } from './components/StudentProfilesView';
import { TalentSearchView } from './components/TalentSearchView';
import { TopBar, type AppTab } from './components/TopBar';
import { UploadDemoModal } from './components/UploadDemoModal';
import type {
  BootstrapPayload,
  InnovationChallenge,
  Invention,
  JobOpening,
  StudentProfile,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('showcase');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [inventions, setInventions] = useState<Invention[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [challenges, setChallenges] = useState<InnovationChallenge[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedInvention, setSelectedInvention] = useState<Invention | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [contactStudent, setContactStudent] = useState<StudentProfile | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadStudentId, setUploadStudentId] = useState<string | undefined>(undefined);

  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [managingInvention, setManagingInvention] = useState<Invention | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) throw new Error('Failed to load showcase data.');
      const data = (await res.json()) as BootstrapPayload;
      setStudents(data.students);
      setInventions(data.inventions);
      setShortlistedIds(data.shortlistedIds);
      setJobs(data.jobs || []);
      setChallenges(data.challenges || []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const studentById = useMemo(() => {
    const map = new Map<string, StudentProfile>();
    for (const s of students) map.set(s.id, s);
    return map;
  }, [students]);

  const handleWatchInvention = useCallback((invention: Invention) => {
    setSelectedInvention(invention);
    setInventions((prev) =>
      prev.map((item) =>
        item.id === invention.id ? { ...item, viewsCount: item.viewsCount + 1 } : item
      )
    );
    void fetch(`/api/inventions/${invention.id}/view`, { method: 'POST' }).catch(() => {});
  }, []);

  const handleToggleShortlist = useCallback(async (studentId: string) => {
    setShortlistedIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
    try {
      const res = await fetch('/api/shortlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { shortlistedIds: string[] };
        setShortlistedIds(data.shortlistedIds);
      }
    } catch {
      // ignore transient toggle error
    }
  }, []);

  const handleOpenUpload = useCallback((forStudentId?: string) => {
    setUploadStudentId(forStudentId);
    setUploadOpen(true);
  }, []);

  const handlePublishedInvention = useCallback((created: Invention) => {
    setInventions((prev) => [created, ...prev]);
    setUploadOpen(false);
    setActiveTab('showcase');
  }, []);

  const handleSavedStudent = useCallback(
    (saved: StudentProfile, isEdit: boolean) => {
      setStudents((prev) =>
        isEdit ? prev.map((s) => (s.id === saved.id ? saved : s)) : [saved, ...prev]
      );
      setStudentFormOpen(false);
      setEditingStudent(null);
      if (selectedStudent?.id === saved.id) {
        setSelectedStudent(saved);
      }
      if (!isEdit) {
        setUploadStudentId(saved.id);
      }
    },
    [selectedStudent]
  );

  const handleUpdatedInvention = useCallback((updated: Invention) => {
    setInventions((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
    setSelectedInvention((prev) => (prev?.id === updated.id ? updated : prev));
    setManagingInvention(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-zinc-900 flex flex-col">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenUpload={() => handleOpenUpload()}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-24 md:pb-14">
        {loading ? (
          <div className="space-y-6" aria-busy="true" aria-label="Loading student inventions">
            <div className="h-24 rounded-2xl bg-zinc-200/70 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80 rounded-2xl bg-zinc-200/70 animate-pulse" />
              <div className="h-80 rounded-2xl bg-zinc-200/70 animate-pulse" />
            </div>
          </div>
        ) : loadError ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-4">
            <p className="font-display text-lg font-bold text-zinc-900">
              Could not load invention showcase
            </p>
            <p className="text-sm text-zinc-600">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadData()}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'showcase' && (
              <ShowcaseFeed
                inventions={inventions}
                students={students}
                shortlistedIds={shortlistedIds}
                onWatchInvention={handleWatchInvention}
                onSelectStudent={setSelectedStudent}
                onToggleShortlist={handleToggleShortlist}
                onOpenUpload={() => handleOpenUpload()}
              />
            )}

            {activeTab === 'talent' && (
              <TalentSearchView
                students={students}
                inventions={inventions}
                shortlistedIds={shortlistedIds}
                onSelectStudent={setSelectedStudent}
                onWatchInvention={handleWatchInvention}
                onToggleShortlist={handleToggleShortlist}
                onContactStudent={setContactStudent}
              />
            )}

            {activeTab === 'jobs' && (
              <JobBoardView
                jobs={jobs}
                students={students}
                onJobCreated={(created) => setJobs((prev) => [created, ...prev])}
                onJobUpdated={(updated) =>
                  setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)))
                }
              />
            )}

            {activeTab === 'challenges' && (
              <ChallengesView
                challenges={challenges}
                inventions={inventions}
                onChallengeCreated={(created) => setChallenges((prev) => [created, ...prev])}
                onChallengeUpdated={(updated) =>
                  setChallenges((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
                }
                onWatchInvention={handleWatchInvention}
                onOpenUpload={() => handleOpenUpload()}
              />
            )}

            {activeTab === 'profiles' && (
              <StudentProfilesView
                students={students}
                inventions={inventions}
                onSelectStudent={setSelectedStudent}
                onOpenCreateProfile={() => {
                  setEditingStudent(null);
                  setStudentFormOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

      <footer className="hidden md:block border-t border-zinc-200/80 bg-[#F7F7F5]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-zinc-500">
          <span>ProtoReel · Free Student Invention &amp; Engineering Showcase</span>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('talent')}
              className="hover:text-zinc-900 cursor-pointer"
            >
              Find Talent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('jobs')}
              className="hover:text-zinc-900 cursor-pointer"
            >
              Job Board
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('challenges')}
              className="hover:text-zinc-900 cursor-pointer"
            >
              Innovation Challenges
            </button>
          </div>
        </div>
      </footer>

      <BottomTabBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Modals & Bottom Sheets */}
      <InventionDetailModal
        invention={selectedInvention}
        student={selectedInvention ? studentById.get(selectedInvention.studentId) : undefined}
        isShortlisted={
          selectedInvention ? shortlistedIds.includes(selectedInvention.studentId) : false
        }
        onClose={() => setSelectedInvention(null)}
        onSelectStudent={setSelectedStudent}
        onToggleShortlist={handleToggleShortlist}
        onContactStudent={setContactStudent}
        onManageProjectDetails={(inv) => setManagingInvention(inv)}
      />

      <StudentProfileModal
        student={selectedStudent}
        inventions={inventions}
        isShortlisted={selectedStudent ? shortlistedIds.includes(selectedStudent.id) : false}
        onClose={() => setSelectedStudent(null)}
        onWatchInvention={handleWatchInvention}
        onToggleShortlist={handleToggleShortlist}
        onContactStudent={setContactStudent}
        onEditProfile={(stu) => {
          setEditingStudent(stu);
          setStudentFormOpen(true);
        }}
        onUploadForStudent={(stuId) => handleOpenUpload(stuId)}
        onManageProjectDetails={(inv) => setManagingInvention(inv)}
      />

      <ProjectDetailsModal
        invention={managingInvention}
        onClose={() => setManagingInvention(null)}
        onUpdated={handleUpdatedInvention}
      />

      <UploadDemoModal
        isOpen={uploadOpen}
        students={students}
        initialStudentId={uploadStudentId}
        onClose={() => setUploadOpen(false)}
        onPublished={handlePublishedInvention}
        onRequestNewStudent={() => {
          setEditingStudent(null);
          setStudentFormOpen(true);
        }}
      />

      <StudentFormModal
        isOpen={studentFormOpen}
        editingStudent={editingStudent}
        onClose={() => {
          setStudentFormOpen(false);
          setEditingStudent(null);
        }}
        onSaved={handleSavedStudent}
      />

      <ContactModal
        student={contactStudent}
        onClose={() => setContactStudent(null)}
      />
    </div>
  );
}
