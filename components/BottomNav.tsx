import React from 'react';
import { PlusCircleIcon, SparklesIcon, ChartBarIcon, BellIcon } from './icons';

type Page = 'log' | 'predict' | 'insights' | 'alerts';

interface Props {
  activePage: Page;
  onPageChange: (page: Page) => void;
}

const NavItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => {
  const activeClasses = 'text-cyan-400';
  const inactiveClasses = 'text-gray-400 hover:text-white';
  
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon className="w-7 h-7" />
      <span className="text-xs font-medium mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<Props> = ({ activePage, onPageChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-sm border-t border-white/10 flex justify-around items-center z-50">
      <NavItem
        icon={PlusCircleIcon}
        label="Log"
        isActive={activePage === 'log'}
        onClick={() => onPageChange('log')}
      />
      <NavItem
        icon={SparklesIcon}
        label="Predict"
        isActive={activePage === 'predict'}
        onClick={() => onPageChange('predict')}
      />
      <NavItem
        icon={ChartBarIcon}
        label="Insights"
        isActive={activePage === 'insights'}
        onClick={() => onPageChange('insights')}
      />
       <NavItem
        icon={BellIcon}
        label="Alerts"
        isActive={activePage === 'alerts'}
        onClick={() => onPageChange('alerts')}
      />
    </nav>
  );
};

export default BottomNav;