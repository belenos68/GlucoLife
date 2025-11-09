
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, ScanIcon, CompassIcon, ChatIcon, ProfileIcon } from './icons/Icons';
import { useLanguage } from '../App';

const BottomNav = () => {
  const { t } = useLanguage();

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: t('nav.dashboard') },
    { path: '/scanner', icon: ScanIcon, label: t('nav.scanner') },
    { path: '/share', icon: CompassIcon, label: t('nav.share') },
    { path: '/assistant', icon: ChatIcon, label: t('nav.assistant') },
    { path: '/profile', icon: ProfileIcon, label: t('nav.profile') },
  ];

  const activeLinkClass = 'text-mint-green';
  const inactiveLinkClass = 'text-gray-400 dark:text-gray-500 hover:text-mint-green-light';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-t-lg border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="container mx-auto max-w-lg flex justify-around h-16 items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
