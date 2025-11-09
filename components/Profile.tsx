import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage, useTheme, Theme as AppTheme } from '../App';
import { TrackingProgram, Goal, Meal, User, Feedback, FeedbackType } from '../types';
import { ShieldCheckIcon, HeartPulseIcon, SparklesIcon, TargetIcon, TrophyIcon, MoonIcon, SunIcon, ComputerDesktopIcon, ArrowDownTrayIcon, TrashIcon, DocumentTextIcon, ChevronRightIcon, ChatBubbleOvalLeftEllipsisIcon, TableCellsIcon, CodeBracketIcon, ShareIcon, PhotoIcon, CameraIcon, StarIcon, UserPlusIcon } from './icons/Icons';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Helper functions for data export
const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
};

const convertObjectToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    const rows = data.map(item =>
        headers.map(header => {
            let value = item[header];
            if (Array.isArray(value)) value = value.join('; '); // Handle array values
            return JSON.stringify(value ?? '');
        }).join(',')
    );
    return [headerRow, ...rows].join('\n');
};

const ShareSummaryModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [meals, setMeals] = useState<Meal[]>([]);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const storedMeals = localStorage.getItem('gluco-meals');
            if (storedMeals) setMeals(JSON.parse(storedMeals));
            
            const storedAppData = localStorage.getItem('gluco-app-data');
            if (storedAppData) setStreak(JSON.parse(storedAppData).streak);
        }
    }, [isOpen]);

    if (!isOpen) return null;
    
    const averageScore = meals.length > 0 ? (meals.reduce((acc, m) => acc + m.glycemicScore, 0) / meals.length).toFixed(0) : 'N/A';
    
    const handleShare = async () => {
        const shareText = t('profile.settingsView.shareModal.shareText', {
          mealCount: meals.length,
          avgScore: averageScore,
          streak: streak,
        });

        try {
            if (navigator.share) {
                await navigator.share({
                    title: t('profile.settingsView.shareModal.summaryTitle'),
                    text: shareText,
                    url: window.location.href,
                });
            } else {
                navigator.clipboard.writeText(shareText);
                alert(t('profile.settingsView.shareModal.copied'));
            }
        } catch (error) {
            console.error('Error sharing', error);
            alert(t('profile.settingsView.shareModal.shareError'));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">{t('profile.settingsView.shareModal.title')}</h3>
                
                <div className="p-4 bg-gradient-to-br from-mint-green to-calm-blue rounded-xl text-white">
                    <h4 className="text-lg font-bold">{t('profile.settingsView.shareModal.summaryTitle')}</h4>
                    <p className="text-sm font-light">{t('profile.settingsView.shareModal.summaryFor', { name: user?.name })}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="font-bold text-2xl">{meals.length}</p>
                            <p className="text-xs opacity-80">{t('profile.settingsView.shareModal.mealsScanned')}</p>
                        </div>
                        <div>
                            <p className="font-bold text-2xl">{averageScore}</p>
                            <p className="text-xs opacity-80">{t('profile.settingsView.shareModal.avgScore')}</p>
                        </div>
                        <div>
                            <p className="font-bold text-2xl">{streak}</p>
                            <p className="text-xs opacity-80">{t('profile.settingsView.shareModal.dayStreak')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                    <button onClick={onClose} className="w-1/2 p-3 font-bold text-gray-600 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        {t('profile.cancel')}
                    </button>
                    <button onClick={handleShare} className="w-1/2 p-3 font-bold text-white bg-mint-green rounded-lg hover:bg-mint-green-dark transition-colors flex items-center justify-center space-x-2">
                        <ShareIcon className="w-5 h-5" />
                        <span>{t('profile.settingsView.shareModal.share')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ExportDataModal: React.FC<{ isOpen: boolean; onClose: () => void; onShare: () => void; }> = ({ isOpen, onClose, onShare }) => {
    const { t } = useLanguage();

    const handleCsvExport = () => {
        const mealsStr = localStorage.getItem('gluco-meals');
        if (mealsStr) {
            const meals: Meal[] = JSON.parse(mealsStr);
            const mealCsv = convertObjectToCSV(meals);
            if (mealCsv) {
                downloadFile(mealCsv, 'glucolife_meals.csv', 'text/csv');
            }
        }
        
        const readingsStr = localStorage.getItem('gluco-readings');
        if (readingsStr) {
            const readings = JSON.parse(readingsStr);
             const readingsCsv = convertObjectToCSV(readings);
            if (readingsCsv) {
                downloadFile(readingsCsv, 'glucolife_readings.csv', 'text/csv');
            }
        }

        alert('Données exportées en CSV.');
    };
    
    const handleJsonExport = () => {
        const allData = {
            user: JSON.parse(localStorage.getItem('gluco-user') || '{}'),
            meals: JSON.parse(localStorage.getItem('gluco-meals') || '[]'),
            readings: JSON.parse(localStorage.getItem('gluco-readings') || '[]'),
            goal: JSON.parse(localStorage.getItem('gluco-goal') || '{}'),
            appData: JSON.parse(localStorage.getItem('gluco-app-data') || '{}'),
        };
        const jsonString = JSON.stringify(allData, null, 2);
        downloadFile(jsonString, 'glucolife_data.json', 'application/json');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">{t('profile.settingsView.exportModal.title')}</h3>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">{t('profile.settingsView.exportModal.description')}</p>
                
                <div className="space-y-3 pt-2">
                    <button onClick={handleCsvExport} className="w-full flex items-center space-x-4 p-4 text-left bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <TableCellsIcon className="w-8 h-8 text-mint-green"/>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">{t('profile.settingsView.exportModal.csvTitle')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.settingsView.exportModal.csvDesc')}</p>
                        </div>
                    </button>
                    <button onClick={handleJsonExport} className="w-full flex items-center space-x-4 p-4 text-left bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <CodeBracketIcon className="w-8 h-8 text-calm-blue"/>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">{t('profile.settingsView.exportModal.jsonTitle')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.settingsView.exportModal.jsonDesc')}</p>
                        </div>
                    </button>
                    <button onClick={onShare} className="w-full flex items-center space-x-4 p-4 text-left bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <ShareIcon className="w-8 h-8 text-soft-violet"/>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">{t('profile.settingsView.exportModal.shareTitle')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.settingsView.exportModal.shareDesc')}</p>
                        </div>
                    </button>
                </div>

                <div className="pt-4">
                     <button onClick={onClose} className="w-full p-3 font-bold text-gray-600 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        {t('profile.settingsView.exportModal.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};


const ProgramCard: React.FC<{
  title: string;
  description: string;
  detailedDescription: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}> = ({ title, description, detailedDescription, icon, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'border-mint-green bg-mint-green/10 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-mint-green/50'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isSelected ? 'bg-mint-green text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
       <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isSelected ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="mt-4 pt-4 border-t border-mint-green/20">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {detailedDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccordionItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
                <h2 className="text-lg font-bold text-mint-green">{title}</h2>
                <ChevronRightIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-0 text-gray-600 dark:text-gray-300 text-sm space-y-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const HelpView: React.FC = () => {
    const { t } = useLanguage();
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    return (
        <>
        <div className="space-y-6 animate-fade-in">

            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md text-center">
                <SparklesIcon className="h-10 w-10 mx-auto text-soft-violet mb-3" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('profile.helpView.assistantLinkTitle')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 my-2">{t('profile.helpView.assistantLinkDescription')}</p>
                <Link to="/assistant" className="mt-2 inline-block bg-soft-violet text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-soft-violet-dark transition-colors">
                    {t('profile.helpView.assistantLinkButton')}
                </Link>
            </div>

            <AccordionItem title={t('profile.helpView.welcomeTitle')}>
                <p>{t('profile.helpView.welcomeDesc')}</p>
            </AccordionItem>
            
            <AccordionItem title={t('profile.helpView.dashboardTitle')}>
                <p dangerouslySetInnerHTML={{__html: t('profile.helpView.dashboardDesc1')}} />
                <p dangerouslySetInnerHTML={{__html: t('profile.helpView.dashboardDesc2')}} />
                <p dangerouslySetInnerHTML={{__html: t('profile.helpView.dashboardDesc3')}} />
                <p dangerouslySetInnerHTML={{__html: t('profile.helpView.dashboardDesc4')}} />
            </AccordionItem>

            <AccordionItem title={t('profile.helpView.scannerTitle')}>
                 <p dangerouslySetInnerHTML={{__html: t('profile.helpView.scannerDesc1')}} />
                 <p dangerouslySetInnerHTML={{__html: t('profile.helpView.scannerDesc2')}} />
                 <p dangerouslySetInnerHTML={{__html: t('profile.helpView.scannerDesc3')}} />
                 <p dangerouslySetInnerHTML={{__html: t('profile.helpView.scannerDesc4')}} />
                 <p dangerouslySetInnerHTML={{__html: t('profile.helpView.scannerDesc5')}} />
            </AccordionItem>

            <AccordionItem title={t('profile.helpView.assistantTitle')}>
                <p>{t('profile.helpView.assistantDesc')}</p>
            </AccordionItem>
            
            <AccordionItem title={t('profile.helpView.profileTitle')}>
                <p dangerouslySetInnerHTML={{__html: t('profile.helpView.profileDesc1')}} />
                <p dangerouslySetInnerHTML={{__html: t('profile.helpView.profileDesc2')}} />
                <p dangerouslySetInnerHTML={{__html: t('profile.helpView.profileDesc3')}} />
            </AccordionItem>

             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md">
                <button onClick={() => setIsFeedbackModalOpen(true)} className="w-full p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-2xl">
                    <span className="text-gray-700 dark:text-gray-200">{t('profile.feedback.button')}</span>
                    <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-gray-400" />
                </button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 px-2" dangerouslySetInnerHTML={{__html: t('profile.helpView.reminder')}} />
            </div>
        </div>
        <FeedbackModal 
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
        />
        </>
    );
};

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-300">{message}</p>
        <div className="flex items-center space-x-4 pt-4">
          <button
            onClick={onClose}
            className="w-full p-3 font-bold text-gray-600 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-full p-3 font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const TermsOfServiceModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { t, tArray } = useLanguage();
    const content = tArray('profile.settingsView.termsModal.content');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('profile.settingsView.termsModal.title')}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.settingsView.termsModal.lastUpdated')}</p>
                </header>
                <div className="overflow-y-auto p-6 space-y-4">
                    {content.map((item, index) => (
                        <div key={index}>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{item.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{item.text}</p>
                        </div>
                    ))}
                </div>
                <footer className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                    <button onClick={onClose} className="w-full p-3 font-bold text-white bg-mint-green rounded-lg hover:bg-mint-green-dark transition-colors">
                        {t('profile.settingsView.termsModal.close')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

const PrivacyPolicyModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { t, tArray } = useLanguage();
    const content = tArray('profile.settingsView.privacyModal.content');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('profile.settingsView.privacyModal.title')}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.settingsView.privacyModal.lastUpdated')}</p>
                </header>
                <div className="overflow-y-auto p-6 space-y-4">
                    {content.map((item, index) => (
                        <div key={index}>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{item.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{item.text}</p>
                        </div>
                    ))}
                </div>
                <footer className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                    <button onClick={onClose} className="w-full p-3 font-bold text-white bg-mint-green rounded-lg hover:bg-mint-green-dark transition-colors">
                        {t('profile.settingsView.privacyModal.close')}
                    </button>
                </footer>
            </div>
        </div>
    );
};


const SettingsView: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

    const handleExport = () => {
        setIsExportModalOpen(true);
    };
    
    const handleDelete = () => {
        setIsDeleteConfirmOpen(true);
    };
    
    const handleLogout = () => {
        logout();
        navigate('/landing');
    };

    const confirmDelete = () => {
        alert("Account deleted.");
        setIsDeleteConfirmOpen(false);
    };
    
    const themeOptions: { name: AppTheme, label: string, icon: React.ReactNode }[] = [
        { name: 'light', label: t('profile.settingsView.light'), icon: <SunIcon className="w-5 h-5"/> },
        { name: 'dark', label: t('profile.settingsView.dark'), icon: <MoonIcon className="w-5 h-5"/> },
        { name: 'system', label: t('profile.settingsView.system'), icon: <ComputerDesktopIcon className="w-5 h-5"/> },
    ];

    return (
         <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-2 space-y-2">
                 <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-3 pt-2">{t('profile.settingsView.appearance')}</h2>
                 <div className="p-3">
                    <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('profile.settingsView.theme')}</p>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                        {themeOptions.map(option => (
                             <button
                                key={option.name}
                                onClick={() => setTheme(option.name)}
                                className={`w-full flex justify-center items-center space-x-2 py-2 rounded-full font-semibold transition-colors text-sm ${theme === option.name ? 'bg-white dark:bg-gray-800 text-mint-green shadow' : 'text-gray-500 dark:text-gray-400'}`}
                             >
                                {option.icon}
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                 </div>
                 <div className="p-3">
                    <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('profile.language')}</p>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                        <button
                        onClick={() => setLanguage('fr')}
                        className={`w-full py-2 rounded-full font-semibold transition-colors ${language === 'fr' ? 'bg-white dark:bg-gray-800 text-mint-green shadow' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                        Français
                        </button>
                        <button
                        onClick={() => setLanguage('en')}
                        className={`w-full py-2 rounded-full font-semibold transition-colors ${language === 'en' ? 'bg-white dark:bg-gray-800 text-mint-green shadow' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                        English
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md divide-y divide-gray-200 dark:divide-gray-700">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-5 pt-4">{t('profile.settingsView.data')}</h2>
                <button onClick={handleExport} className="w-full flex items-center space-x-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <ArrowDownTrayIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    <p className="font-semibold text-gray-700 dark:text-gray-200">{t('profile.settingsView.export')}</p>
                </button>
                 <button onClick={handleDelete} className="w-full flex items-center space-x-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TrashIcon className="w-6 h-6 text-red-500" />
                    <p className="font-semibold text-red-500">{t('profile.settingsView.delete')}</p>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md divide-y divide-gray-200 dark:divide-gray-700">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-5 pt-4">{t('profile.settingsView.aboutSectionTitle')}</h2>
                <button onClick={() => setIsTermsModalOpen(true)} className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center space-x-4">
                        <DocumentTextIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        <p className="font-semibold text-gray-700 dark:text-gray-200">{t('profile.settingsView.terms')}</p>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </button>
                 <button onClick={() => setIsPrivacyModalOpen(true)} className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center space-x-4">
                        <ShieldCheckIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        <p className="font-semibold text-gray-700 dark:text-gray-200">{t('profile.settingsView.privacy')}</p>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </button>
            </div>
            <div className="px-4">
                <button
                    onClick={handleLogout}
                    className="w-full py-3 font-bold text-red-500 bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg hover:bg-red-200 transition-colors"
                >
                    {t('profile.logout')}
                </button>
            </div>
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title={t('profile.settingsView.delete')}
                message={t('profile.settingsView.deleteConfirm')}
                confirmText={t('profile.settingsView.delete')}
                cancelText={t('profile.cancel')}
            />
            <ExportDataModal 
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onShare={() => {
                    setIsExportModalOpen(false);
                    setIsShareModalOpen(true);
                }}
            />
            <ShareSummaryModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />
            <TermsOfServiceModal
                isOpen={isTermsModalOpen}
                onClose={() => setIsTermsModalOpen(false)}
            />
            <PrivacyPolicyModal
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
            />
        </div>
    );
};

const GoalProgressCard: React.FC<{ goal: Goal | null; meals: Meal[]; onSetGoal: () => void; onResetGoal: () => void; }> = ({ goal, meals, onSetGoal, onResetGoal }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    
    const progressData = useMemo(() => {
        if (!goal) return null;

        const startDate = new Date(goal.startDate);
        const endDate = new Date(startDate.getTime() + goal.durationDays * 24 * 60 * 60 * 1000);
        const now = new Date();
        
        if (now > endDate) {
            return { isExpired: true, reduction: 0, progressPercentage: 0, daysRemaining: 0, isCompleted: false, currentAvgScore: 0 };
        }
        
        const mealsSinceStart = meals.filter(m => new Date(m.timestamp) >= startDate);
        
        const currentAvgScore = mealsSinceStart.length > 0
            ? mealsSinceStart.reduce((acc, m) => acc + m.glycemicScore, 0) / mealsSinceStart.length
            : goal.initialAvgScore;
            
        const reduction = currentAvgScore - goal.initialAvgScore;
        const progressPercentage = goal.targetReduction > 0 ? (Math.abs(Math.min(reduction, 0)) / goal.targetReduction) * 100 : 0;
        
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const isCompleted = reduction <= -goal.targetReduction;
        
        return {
            reduction,
            progressPercentage: Math.min(progressPercentage, 100),
            daysRemaining,
            isCompleted,
            isExpired: false,
            currentAvgScore: Math.round(currentAvgScore)
        };
    }, [goal, meals]);

    const chartData = useMemo(() => {
        if (!goal) return [];
        const startDate = new Date(goal.startDate);
        const mealsSinceStart = meals
            .filter(m => new Date(m.timestamp) >= startDate)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
        if (mealsSinceStart.length < 2) return [];
    
        const data = mealsSinceStart.map((meal, index) => {
            const mealsUpToThisPoint = mealsSinceStart.slice(0, index + 1);
            const avgScore = mealsUpToThisPoint.reduce((sum, m) => sum + m.glycemicScore, 0) / mealsUpToThisPoint.length;
            return {
                mealIndex: index + 1,
                score: Math.round(avgScore)
            };
        });
        return data;
    }, [goal, meals]);

    if (!goal || progressData?.isExpired) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md text-center">
                <TargetIcon className="h-10 w-10 mx-auto text-mint-green mb-3" />
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">
                    { progressData?.isExpired ? t('profile.goalCard.expiredGoal') : t('profile.goalCard.noGoal') }
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    { progressData?.isExpired ? t('profile.goalCard.expiredGoalPrompt') : t('profile.goalCard.noGoalPrompt') }
                </p>
                <button
                    onClick={onSetGoal}
                    className="bg-mint-green text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-mint-green-dark transition-colors"
                >
                    {t('profile.goalCard.setGoal')}
                </button>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md relative overflow-hidden">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('profile.goalCard.title')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.goalCard.description', { target: goal.targetReduction })}</p>
                </div>
                { progressData.isCompleted ? (
                    <>
                        <div className="z-10 flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
                             <TrophyIcon className="h-4 w-4" /> 
                             <span>{t('profile.goalCard.completed')}</span>
                        </div>
                        <SparklesIcon className="absolute top-[15%] left-[10%] w-5 h-5 text-yellow-400 animate-pulse" style={{ animationDelay: '0s' }} />
                        <SparklesIcon className="absolute top-[20%] left-[85%] w-3 h-3 text-yellow-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <SparklesIcon className="absolute top-[75%] left-[15%] w-3 h-3 text-yellow-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
                        <SparklesIcon className="absolute top-[80%] left-[80%] w-5 h-5 text-yellow-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
                    </>
                ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('profile.goalCard.daysRemaining', { days: progressData.daysRemaining })}</div>
                )}
            </div>
            
            <div className="mt-4">
                 <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-gray-600 dark:text-gray-300">{t('profile.goalCard.progress')}</span>
                    <span className={`font-bold ${progressData.reduction <= 0 ? 'text-mint-green-dark' : 'text-red-500'}`}>
                        {progressData.reduction.toFixed(1)} / -{goal.targetReduction} pts
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-mint-green h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressData.progressPercentage}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                    <span>{t('profile.goalCard.initialScore')}: {goal.initialAvgScore}</span>
                    <span>{t('profile.goalCard.currentScore')}: {progressData.currentAvgScore}</span>
                </div>
            </div>

            {chartData.length > 0 && !progressData.isCompleted && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">{t('profile.goalCard.trendChartTitle')}</h4>
                    <div className="h-24">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScoreTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="mealIndex" 
                                    tick={{ fontSize: 10, fill: theme === 'dark' ? '#a0aec0' : '#6b7280' }} 
                                    axisLine={false} 
                                    tickLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis 
                                    domain={['dataMin - 5', 'dataMax + 5']} 
                                    tick={{ fontSize: 10, fill: theme === 'dark' ? '#a0aec0' : '#6b7280' }} 
                                    axisLine={false} 
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '0.5rem',
                                        fontSize: '0.75rem',
                                        backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
                                        borderColor: '#e5e7eb'
                                    }}
                                    labelFormatter={(label) => t('profile.goalCard.chartTooltipLabel', { mealIndex: label })}
                                    formatter={(value: number) => [value, t('profile.goalCard.chartYAxisLabel')]}
                                />
                                <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#colorScoreTrend)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {!progressData.isCompleted && (
                 <div className="text-center mt-4">
                    <button onClick={onResetGoal} className="text-xs text-gray-500 hover:text-red-500">{t('profile.goalCard.abandon')}</button>
                </div>
            )}
        </div>
    );
};

const GoalSetterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    target: string;
    setTarget: (t: string) => void;
    duration: string;
    setDuration: (d: string) => void;
}> = ({ isOpen, onClose, onSave, target, setTarget, duration, setDuration }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">{t('profile.goalModal.title')}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 block mb-2">{t('profile.goalModal.targetLabel')}</label>
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                             <input 
                                type="number"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                className="w-full p-2 text-lg font-bold text-center bg-transparent dark:text-gray-200 focus:outline-none"
                            />
                            <span className="text-gray-500 dark:text-gray-400 pr-3">{t('profile.goalModal.points')}</span>
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 block mb-2">{t('profile.goalModal.durationLabel')}</label>
                         <div className="grid grid-cols-3 gap-2">
                             <button onClick={() => setDuration('7')} className={`p-2 rounded-lg font-semibold transition ${duration === '7' ? 'bg-mint-green text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>{t('profile.goalModal.d7')}</button>
                             <button onClick={() => setDuration('14')} className={`p-2 rounded-lg font-semibold transition ${duration === '14' ? 'bg-mint-green text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>{t('profile.goalModal.d14')}</button>
                             <button onClick={() => setDuration('30')} className={`p-2 rounded-lg font-semibold transition ${duration === '30' ? 'bg-mint-green text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>{t('profile.goalModal.d30')}</button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                    <button
                      onClick={onClose}
                      className="w-full p-3 font-bold text-gray-600 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      {t('profile.cancel')}
                    </button>
                    <button
                      onClick={onSave}
                      className="w-full p-3 font-bold text-white bg-mint-green rounded-lg hover:bg-mint-green-dark transition-colors"
                    >
                      {t('profile.goalModal.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditProfileModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User;
    updateUser: (data: Partial<User>) => void;
}> = ({ isOpen, onClose, user, updateUser }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user, isOpen]);

    const handleSave = () => {
        updateUser({ name, email });
        onClose();
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ avatarUrl: reader.result as string });
                setIsAvatarModalOpen(false);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">{t('profile.editModal.title')}</h3>
                    
                    <div className="flex flex-col items-center space-y-2 pt-2">
                        <img src={user.avatarUrl} alt="User avatar" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700" />
                        <button onClick={() => setIsAvatarModalOpen(true)} className="text-sm font-semibold text-mint-green hover:underline">
                            {t('profile.avatarModalTitle')}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 block mb-2">{t('profile.editModal.nameLabel')}</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 block mb-2">{t('profile.editModal.emailLabel')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 pt-4">
                        <button onClick={onClose} className="w-full p-3 font-bold text-gray-600 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                            {t('profile.cancel')}
                        </button>
                        <button onClick={handleSave} className="w-full p-3 font-bold text-white bg-mint-green rounded-lg hover:bg-mint-green-dark transition-colors">
                            {t('profile.editModal.save')}
                        </button>
                    </div>
                </div>
            </div>

            {isAvatarModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4" onClick={() => setIsAvatarModalOpen(false)}>
                    <input type="file" accept="image/*" capture="user" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-center text-gray-800 dark:text-gray-100">{t('profile.avatarModalTitle')}</h3>
                        <button onClick={() => cameraInputRef.current?.click()} className="w-full flex items-center justify-center p-3 space-x-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                            <CameraIcon className="h-6 w-6 text-gray-600 dark:text-gray-300"/>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">{t('profile.takePhoto')}</span>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center p-3 space-x-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                            <PhotoIcon className="h-6 w-6 text-gray-600 dark:text-gray-300"/>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">{t('profile.choosePhoto')}</span>
                        </button>
                        <button onClick={() => setIsAvatarModalOpen(false)} className="w-full p-3 mt-2 font-bold text-gray-600 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                            {t('profile.cancel')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const FeedbackModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('General');
    const [feedbackText, setFeedbackText] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSend = () => {
        if (!feedbackText.trim()) return;

        // The recipient for this feedback is belenos.abryelos@gmail.com.
        // A backend service would be required to send this data as an email without exposing the address.
        // For this client-only version, we will save the feedback to local storage.
        const newFeedback: Feedback = {
            id: new Date().toISOString(),
            type: feedbackType,
            text: feedbackText,
            timestamp: new Date().toISOString(),
        };

        const storedFeedback = localStorage.getItem('gluco-feedback');
        const feedbackList: Feedback[] = storedFeedback ? JSON.parse(storedFeedback) : [];
        feedbackList.push(newFeedback);
        localStorage.setItem('gluco-feedback', JSON.stringify(feedbackList));

        setIsSent(true);
        setTimeout(() => {
            onClose();
            // Reset for next time
            setIsSent(false);
            setFeedbackText('');
            setFeedbackType('General');
        }, 2000);
    };

    if (!isOpen) return null;
    
    const feedbackTypes: { name: FeedbackType, label: string }[] = [
        { name: 'General', label: t('profile.feedback.typeGeneral') },
        { name: 'Bug', label: t('profile.feedback.typeBug') },
        { name: 'Feature Request', label: t('profile.feedback.typeFeature') },
    ];


    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">{t('profile.feedback.title')}</h3>
                
                {isSent ? (
                    <div className="text-center p-8">
                        <svg className="h-16 w-16 text-mint-green mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">{t('profile.feedback.success')}</p>
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 block mb-2">{t('profile.feedback.typeLabel')}</label>
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                                {feedbackTypes.map(ft => (
                                     <button
                                        key={ft.name}
                                        onClick={() => setFeedbackType(ft.name)}
                                        className={`w-full py-2 rounded-full font-semibold transition-colors text-sm ${feedbackType === ft.name ? 'bg-white dark:bg-gray-800 text-mint-green shadow' : 'text-gray-500 dark:text-gray-400'}`}
                                     >
                                        {ft.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder={t('profile.feedback.placeholder')}
                                rows={5}
                                className="w-full p-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green"
                            />
                        </div>

                        <div className="flex items-center space-x-4 pt-4">
                            <button onClick={onClose} className="w-full p-3 font-bold text-gray-600 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                {t('profile.cancel')}
                            </button>
                            <button onClick={handleSend} disabled={!feedbackText.trim()} className="w-full p-3 font-bold text-white bg-mint-green rounded-lg hover:bg-mint-green-dark transition-colors disabled:opacity-50">
                                {t('profile.feedback.send')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const RatingSection: React.FC = () => {
    const { t } = useLanguage();
    
    const [averageRating, setAverageRating] = useState(4.5);
    const [totalRatings, setTotalRatings] = useState(128);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        const storedUserRating = localStorage.getItem('gluco-user-rating');
        if (storedUserRating) {
            setUserRating(parseInt(storedUserRating, 10));
        }

        const storedAppRatings = localStorage.getItem('gluco-app-ratings');
        if (storedAppRatings) {
            const { totalScore, count } = JSON.parse(storedAppRatings);
            setTotalRatings(count);
            setAverageRating(count > 0 ? totalScore / count : 0);
        } else {
            const initialData = { totalScore: 576, count: 128 }; // ~4.5 average
            localStorage.setItem('gluco-app-ratings', JSON.stringify(initialData));
            setTotalRatings(initialData.count);
            setAverageRating(initialData.totalScore / initialData.count);
        }
    }, []);

    const handleSetRating = (rating: number) => {
        const oldRating = userRating;
        setUserRating(rating);
        localStorage.setItem('gluco-user-rating', rating.toString());

        const storedAppRatings = localStorage.getItem('gluco-app-ratings');
        const appRatings = storedAppRatings ? JSON.parse(storedAppRatings) : { totalScore: 0, count: 0 };
        
        if (oldRating === 0) { // First time rating
            appRatings.count += 1;
            appRatings.totalScore += rating;
        } else { // Changing rating
            appRatings.totalScore = appRatings.totalScore - oldRating + rating;
        }

        localStorage.setItem('gluco-app-ratings', JSON.stringify(appRatings));
        setTotalRatings(appRatings.count);
        setAverageRating(appRatings.count > 0 ? appRatings.totalScore / appRatings.count : 0);
    };


    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 text-center">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('profile.rating.title')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('profile.rating.subtitle')}</p>

            <div className="flex items-center justify-center space-x-2 mb-4">
                <StarIcon className="w-6 h-6 text-yellow-400" />
                <span className="text-xl font-bold text-gray-700 dark:text-gray-200">{t('profile.rating.averageRating', { average: averageRating.toFixed(1) })}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('profile.rating.totalRatings', { count: totalRatings })}</span>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('profile.rating.yourRating')}</p>
            <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleSetRating(star)}
                        className="focus:outline-none"
                        aria-label={`Rate ${star} star`}
                    >
                        <StarIcon
                            className={`w-8 h-8 cursor-pointer transition-colors ${
                                (hoverRating || userRating) >= star
                                    ? 'text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                            }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

const InviteFriendCard: React.FC = () => {
    const { t } = useLanguage();

    const handleInvite = async () => {
        const shareData = {
            title: t('profile.invite.shareTitle'),
            text: t('profile.invite.shareText'),
            url: 'https://aistudio.google.com/app/project/b0162a87-de5d-4f93-b6b8-5c45e69f8263',
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(shareData.text);
                alert(t('profile.invite.copied'));
            }
        } catch (error) {
            console.error('Error sharing invitation', error);
        }
    };

    return (
        <div className="bg-gradient-to-r from-soft-violet to-calm-blue p-5 rounded-2xl shadow-lg text-white flex items-center space-x-4">
            <div className="flex-shrink-0 bg-white/20 p-3 rounded-full">
                <UserPlusIcon className="w-8 h-8 text-white"/>
            </div>
            <div className="flex-grow">
                <h2 className="font-bold text-lg">{t('profile.invite.title')}</h2>
                <p className="text-sm opacity-90">{t('profile.invite.description')}</p>
            </div>
            <button
                onClick={handleInvite}
                className="bg-white text-soft-violet font-bold py-2 px-4 rounded-full shadow-md hover:bg-gray-100 transition-colors flex-shrink-0"
            >
                {t('profile.invite.button')}
            </button>
        </div>
    );
};


const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'main' | 'settings' | 'help'>('main');
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [targetReduction, setTargetReduction] = useState('10');
  const [duration, setDuration] = useState('30');

  useEffect(() => {
    const storedGoal = localStorage.getItem('gluco-goal');
    if (storedGoal) {
        try { setGoal(JSON.parse(storedGoal)); } 
        catch(e) { console.error("Failed to parse goal", e); }
    }

    const storedMeals = localStorage.getItem('gluco-meals');
    if (storedMeals) {
        try { setMeals(JSON.parse(storedMeals)); }
        catch(e) { console.error("Failed to parse meals", e); }
    }
  }, []);

  const handleSaveGoal = () => {
    const initialAvgScore = meals.length > 0
        ? meals.reduce((acc, m) => acc + m.glycemicScore, 0) / meals.length
        : 75;

    const newGoal: Goal = {
        id: new Date().toISOString(),
        targetReduction: parseInt(targetReduction, 10),
        durationDays: parseInt(duration, 10),
        startDate: new Date().toISOString(),
        initialAvgScore: Math.round(initialAvgScore)
    };
    
    localStorage.setItem('gluco-goal', JSON.stringify(newGoal));
    setGoal(newGoal);
    setIsGoalModalOpen(false);
  };

  if (!user) {
    return null; 
  }

  const tabs: { id: 'main' | 'settings' | 'help'; label: string }[] = [
    { id: 'main', label: t('profile.settingsView.aboutSectionTitle') },
    { id: 'settings', label: t('profile.settings') },
    { id: 'help', label: t('profile.help') },
  ];
  
  const programs = [
    { name: 'Prévention', title: t('programs.prevention'), description: t('programs.preventionDesc'), detailedDescription: t('programs.programDetails.prevention'), icon: <ShieldCheckIcon className="h-6 w-6"/> },
    { name: 'Gestion Diabète', title: t('programs.diabetes'), description: t('programs.diabetesDesc'), detailedDescription: t('programs.programDetails.diabetes'), icon: <HeartPulseIcon className="h-6 w-6"/> },
    { name: 'Optimisation Santé', title: t('programs.optimization'), description: t('programs.optimizationDesc'), detailedDescription: t('programs.programDetails.optimization'), icon: <SparklesIcon className="h-6 w-6"/> }
  ] as const;

  const handleProgramSelect = (program: TrackingProgram) => {
    updateUser({ trackingProgram: program });
  };
  
  const renderContent = () => {
    switch (activeTab) {
        case 'main':
            return (
                <div className="space-y-8 animate-fade-in">
                    <section>
                        <GoalProgressCard 
                            goal={goal} 
                            meals={meals} 
                            onSetGoal={() => setIsGoalModalOpen(true)}
                            onResetGoal={() => {
                                if(window.confirm(t('profile.goalCard.confirmAbandon'))) {
                                    localStorage.removeItem('gluco-goal');
                                    setGoal(null);
                                }
                            }}
                        />
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">{t('profile.trackingProgram')}</h2>
                        <div className="space-y-3">
                            {programs.map((p) => (
                            <ProgramCard
                                key={p.name}
                                title={p.title}
                                description={p.description}
                                detailedDescription={p.detailedDescription}
                                icon={p.icon}
                                isSelected={user.trackingProgram === p.name}
                                onClick={() => handleProgramSelect(p.name)}
                            />
                            ))}
                        </div>
                    </section>
                    <section>
                        <RatingSection />
                    </section>
                    <section>
                        <InviteFriendCard />
                    </section>
                </div>
            );
        case 'settings':
            return <SettingsView />;
        case 'help':
            return <HelpView />;
        default:
            return null;
    }
  }

  return (
    <>
      <div className="pb-12">
        <header className="p-4 flex flex-col items-center space-y-4 pt-8">
          <button onClick={() => setIsEditModalOpen(true)} className="relative focus:outline-none focus:ring-4 focus:ring-mint-green/50 rounded-full">
            <img
              src={user.avatarUrl}
              alt="User avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
            <div className="absolute bottom-0 right-0 bg-mint-green p-1.5 rounded-full border-2 border-white dark:border-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
              </svg>
            </div>
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
        </header>

        <nav className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 mt-6">
            <div className="flex justify-around" role="tablist" aria-label="Profile sections">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={`w-full py-3 px-1 text-center font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-mint-green ${
                            activeTab === tab.id
                                ? 'text-mint-green border-b-2 border-mint-green'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </nav>
        
        <div className="p-4 mt-4">
          {renderContent()}
        </div>
      </div>
      
      <GoalSetterModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          onSave={handleSaveGoal}
          target={targetReduction}
          setTarget={setTargetReduction}
          duration={duration}
          setDuration={setDuration}
      />
      {user && <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          updateUser={updateUser}
      />}
    </>
  );
};

export default Profile;