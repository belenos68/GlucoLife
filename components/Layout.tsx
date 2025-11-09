
import React from 'react';
import BottomNav from './BottomNav';
import { useLanguage } from '../App';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col font-sans">
      <main className="flex-grow pb-20 flex flex-col">
        <div className="container mx-auto max-w-lg p-0 flex-grow">
          {children}
        </div>
        <footer className="container mx-auto max-w-lg px-4 pt-4 flex-shrink-0">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.disclaimer')}
          </p>
        </footer>
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
