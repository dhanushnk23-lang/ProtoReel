import { Briefcase, Film, Search, Trophy, Users } from 'lucide-react';
import type { AppTab } from './TopBar';

interface BottomTabBarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export function BottomTabBar({ activeTab, onSelectTab }: BottomTabBarProps) {
  const tabs: { id: AppTab; label: string; icon: typeof Film }[] = [
    { id: 'showcase', label: 'Showcase', icon: Film },
    { id: 'talent', label: 'Talent', icon: Search },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'profiles', label: 'Profiles', icon: Users },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 pb-safe"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 rounded-lg transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-600 ${
                isActive ? 'text-orange-600' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
              <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
