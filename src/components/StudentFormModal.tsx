import { useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';
import type { AvailabilityStatus, StudentProfile } from '../types';
import { ResilientImage } from './ResilientImage';

interface StudentFormModalProps {
  isOpen: boolean;
  editingStudent: StudentProfile | null;
  onClose: () => void;
  onSaved: (student: StudentProfile, isEdit: boolean) => void;
}

const AVAILABILITY_OPTIONS: AvailabilityStatus[] = [
  'Seeking Full-Time',
  'Internship / Co-op',
  'Available Now',
  'Open to Research',
];

export function StudentFormModal({
  isOpen,
  editingStudent,
  onClose,
  onSaved,
}: StudentFormModalProps) {
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('2026');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState<AvailabilityStatus>('Seeking Full-Time');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [featuredAward, setFeaturedAward] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/src/assets/images/student_maya_chen_1794884426318.jpg');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editingStudent) {
      setName(editingStudent.name);
      setUniversity(editingStudent.university);
      setMajor(editingStudent.major);
      setGradYear(String(editingStudent.gradYear));
      setLocation(editingStudent.location);
      setAvailability(editingStudent.availability);
      setEmail(editingStudent.email);
      setBio(editingStudent.bio);
      setSkillsText(editingStudent.skills.join(', '));
      setFeaturedAward(editingStudent.featuredAward || '');
      setGithubUrl(editingStudent.githubUrl || '');
      setPortfolioUrl(editingStudent.portfolioUrl || '');
      setAvatarUrl(editingStudent.avatarUrl);
      setAvatarPreview('');
      setAvatarFile(null);
    } else {
      setName('');
      setUniversity('');
      setMajor('');
      setGradYear('2026');
      setLocation('');
      setAvailability('Seeking Full-Time');
      setEmail('');
      setBio('');
      setSkillsText('');
      setFeaturedAward('');
      setGithubUrl('');
      setPortfolioUrl('');
      setAvatarUrl('/src/assets/images/student_maya_chen_1794884426318.jpg');
      setAvatarPreview('');
      setAvatarFile(null);
    }
  }, [isOpen, editingStudent]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  const handleAvatarPick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please pick a JPEG, PNG, or WebP portrait image.');
      return;
    }
    setError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !university.trim() || !major.trim() || !email.trim()) {
      setError('Name, university, major, and email are required.');
      return;
    }

    setSaving(true);
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const imgRes = await fetch('/api/images/upload', {
          method: 'POST',
          headers: {
            'Content-Type': avatarFile.type || 'image/jpeg',
            'X-Filename': encodeURIComponent(avatarFile.name),
          },
          body: avatarFile,
        });
        if (!imgRes.ok) throw new Error('Could not upload portrait image.');
        const uploaded = (await imgRes.json()) as { url: string };
        finalAvatarUrl = uploaded.url;
      }

      const skills = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const endpoint = editingStudent
        ? `/api/students/${editingStudent.id}`
        : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          university: university.trim(),
          major: major.trim(),
          gradYear: Number(gradYear) || 2026,
          location: location.trim() || 'Campus Lab',
          availability,
          email: email.trim(),
          bio: bio.trim() || 'Student engineer building working prototypes.',
          skills: skills.length > 0 ? skills : ['Prototyping', 'CAD'],
          featuredAward: featuredAward.trim(),
          githubUrl: githubUrl.trim(),
          portfolioUrl: portfolioUrl.trim(),
          avatarUrl: finalAvatarUrl,
        }),
      });

      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error || 'Could not save student profile.');
      }

      const saved = (await res.json()) as StudentProfile;
      onSaved(saved, Boolean(editingStudent));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={editingStudent ? 'Edit student profile' : 'Create student profile'}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
      onClick={() => !saving && onClose()}
    >
      <div
        className="bg-white w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
        </div>

        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg md:text-xl font-bold text-zinc-900">
            {editingStudent ? 'Edit Student Profile' : 'Create Student Profile'}
          </h2>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close profile form"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-700 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          {/* Avatar Picker */}
          <div className="flex items-center gap-4">
            <ResilientImage
              src={avatarPreview || avatarUrl}
              alt="Student portrait preview"
              className="w-16 h-16 rounded-xl object-cover border border-zinc-200 shrink-0"
            />
            <label className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F7F7F5] hover:bg-zinc-200/80 text-xs font-semibold text-zinc-800 inline-flex items-center gap-2 cursor-pointer">
              <Camera className="w-4 h-4 text-orange-600" aria-hidden="true" />
              <span>{avatarFile ? 'Change portrait' : 'Upload portrait photo'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => handleAvatarPick(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="stu-name" className="text-xs font-semibold text-zinc-800">
                Full Name
              </label>
              <input
                id="stu-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Alvarez"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="stu-email" className="text-xs font-semibold text-zinc-800">
                University Email
              </label>
              <input
                id="stu-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@university.edu"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="stu-uni" className="text-xs font-semibold text-zinc-800">
                University
              </label>
              <input
                id="stu-uni"
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="UC Berkeley"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="stu-major" className="text-xs font-semibold text-zinc-800">
                Major / Discipline
              </label>
              <input
                id="stu-major"
                type="text"
                required
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Electrical Engineering & CS"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="stu-grad" className="text-xs font-semibold text-zinc-800">
                Graduation Year
              </label>
              <input
                id="stu-grad"
                type="number"
                min={2024}
                max={2032}
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 tabular-nums focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="stu-avail" className="text-xs font-semibold text-zinc-800">
                Hiring Availability
              </label>
              <select
                id="stu-avail"
                value={availability}
                onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              >
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="stu-location" className="text-xs font-semibold text-zinc-800">
              Location
            </label>
            <input
              id="stu-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Berkeley, CA"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="stu-bio" className="text-xs font-semibold text-zinc-800">
              Maker Bio
            </label>
            <textarea
              id="stu-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What do you love building? Mention lab experience, hardware stacks, or systems you've shipped."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="stu-skills" className="text-xs font-semibold text-zinc-800">
              Skills (comma separated)
            </label>
            <input
              id="stu-skills"
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Embedded C, KiCad, SolidWorks, Python"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="stu-github" className="text-xs font-semibold text-zinc-800">
                GitHub URL (optional)
              </label>
              <input
                id="stu-github"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="stu-award" className="text-xs font-semibold text-zinc-800">
                Highlight / Award (optional)
              </label>
              <input
                id="stu-award"
                type="text"
                value={featuredAward}
                onChange={(e) => setFeaturedAward(e.target.value)}
                placeholder="Hackathon Winner 2026"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-800 text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingStudent ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
