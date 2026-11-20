import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import type { StudentProfile } from '../types';

interface ContactModalProps {
  student: StudentProfile | null;
  onClose: () => void;
}

export function ContactModal({ student, onClose }: ContactModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!student) return;
    setSent(false);
    setError(null);
    setMessage(`Hi ${student.name.split(' ')[0]}, we saw your invention demo on ProtoReel and would love to chat about engineering opportunities on our team.`);
  }, [student]);

  useEffect(() => {
    if (!student) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [student, onClose]);

  if (!student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          companyName: companyName.trim(),
          recruiterEmail: recruiterEmail.trim(),
          message: message.trim(),
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error || 'Could not send intro request.');
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Contact ${student.name}`}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
        </div>

        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-zinc-900">
              Request Intro with {student.name}
            </h2>
            <p className="text-xs text-zinc-500">
              {student.university} · {student.availability}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close contact dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-700 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {sent ? (
          <div className="p-6 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" aria-hidden="true" />
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-zinc-900">Intro Request Sent</h3>
              <p className="text-sm text-zinc-600">
                Your note has been delivered to {student.name} ({student.email}).
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="inq-company" className="text-xs font-semibold text-zinc-800">
                Company / Team Name
              </label>
              <input
                id="inq-company"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Boston Dynamics, Rivian Hardware"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="inq-email" className="text-xs font-semibold text-zinc-800">
                Your Work Email
              </label>
              <input
                id="inq-email"
                type="email"
                required
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="hiring@company.com"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="inq-msg" className="text-xs font-semibold text-zinc-800">
                Message
              </label>
              <textarea
                id="inq-msg"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F7F7F5] text-zinc-800 text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send Intro'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
