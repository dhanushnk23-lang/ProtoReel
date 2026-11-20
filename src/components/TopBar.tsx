import { Plus } from 'lucide-react';

export type AppTab = 'showcase' | 'talent' | 'jobs' | 'challenges' | 'profiles';

interface TopBarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenUpload: () => void;
}

export function TopBar({ activeTab, onSelectTab, onOpenUpload }: TopBarProps) {
  const navItems: { id: AppTab; label: string }[] = [
    { id: 'showcase', label: 'Showcase' },
    { id: 'talent', label: 'Find Talent' },
    { id: 'jobs', label: 'Job Board' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'profiles', label: 'Profiles' },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 bg-[#F7F7F5]/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-6xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('showcase')}
          className="font-display text-xl font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 rounded-sm cursor-pointer"
        >
          ProtoReel
        </button>

        {/* Zone 2: 5 clean single-line text nav links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 rounded-sm ${
                  isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-orange-600"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white text-xs md:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Upload Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
