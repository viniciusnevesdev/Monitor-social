import React from 'react';
import { Compass, Users, PlusCircle, Target, Sliders } from 'lucide-react';

export type TabType = 'painel' | 'contatos' | 'registrar' | 'metas' | 'config';

interface BottomNavBarProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  neglectedCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onChangeTab,
  neglectedCount,
}) => {
  const tabs = [
    {
      id: 'painel' as TabType,
      label: 'Painel',
      icon: Compass,
      badge: neglectedCount > 0 ? neglectedCount : null,
    },
    {
      id: 'contatos' as TabType,
      label: 'Pessoas',
      icon: Users,
    },
    {
      id: 'registrar' as TabType,
      label: 'Registrar',
      icon: PlusCircle,
      isPrimaryAction: true,
    },
    {
      id: 'metas' as TabType,
      label: 'Metas',
      icon: Target,
    },
    {
      id: 'config' as TabType,
      label: 'Ajustes',
      icon: Sliders,
    },
  ];

  return (
    <nav
      id="apple-capsule-nav"
      aria-label="Navegação Principal"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md pointer-events-auto select-none"
    >
      {/* Outer Floating Apple-Style Capsule with Glassmorphism */}
      <div className="relative p-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_12px_36px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5">
        <ul className="flex items-center justify-between relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <li key={tab.id} className="relative flex-1">
                <button
                  id={`nav-btn-${tab.id}`}
                  onClick={() => onChangeTab(tab.id)}
                  type="button"
                  className={`group relative flex flex-col items-center justify-center w-full py-2 px-1 transition-all duration-300 rounded-full ${
                    isActive
                      ? 'text-indigo-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {/* Apple-style animated bubble behind active item */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full bg-indigo-50/90 border border-indigo-100/80 shadow-sm shadow-indigo-100 transition-all duration-300 -z-10"
                      style={{
                        animation: 'bubblePulse 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  )}

                  {/* Icon with subtle scale on active */}
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? 'scale-110 text-indigo-600 stroke-[2.4]' : 'group-hover:scale-105 stroke-[1.8]'
                      } ${tab.isPrimaryAction && !isActive ? 'text-indigo-500' : ''}`}
                    />
                    
                    {/* Badge for neglected alerts */}
                    {tab.badge && (
                      <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-sm">
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[11px] mt-0.5 tracking-tight whitespace-nowrap transition-colors duration-200 ${
                      isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 font-medium'
                    }`}
                  >
                    {tab.label}
                  </span>

                  {/* Little Apple dot under active label */}
                  {isActive && (
                    <span className="w-1 h-1 mt-0.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
