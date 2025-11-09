import React from 'react';
import { useLanguage } from '../App';
import { Achievement } from '../types';
import { ShareIcon, XMarkIcon } from './icons/Icons';

interface AchievementUnlockedModalProps {
    achievement: Achievement | null;
    isOpen: boolean;
    onClose: () => void;
}

const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({ achievement, isOpen, onClose }) => {
    const { t } = useLanguage();

    if (!isOpen || !achievement) {
        return null;
    }

    const handleShare = async () => {
        const shareText = t('trophy.shareMessage', { trophyName: t(`trophy.${achievement.id}.name`) });
        try {
            if (navigator.share) {
                await navigator.share({
                    title: t('trophy.unlockTitle'),
                    text: shareText,
                    url: window.location.href,
                });
            } else {
                navigator.clipboard.writeText(shareText);
                alert('Copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 space-y-4 w-full max-w-sm text-center transform scale-100 transition-transform duration-300 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative">
                    <h3 className="text-2xl font-bold text-mint-green">{t('trophy.unlockTitle')}</h3>
                    <button onClick={onClose} className="absolute -top-2 -right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-col items-center space-y-3 py-4">
                    <div className="p-4 bg-yellow-400/20 rounded-full animate-pulse">
                        <achievement.icon className="w-20 h-20 text-yellow-500" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t(`trophy.${achievement.id}.name`)}</h4>
                    <p className="text-gray-500 dark:text-gray-400">{t(`trophy.${achievement.id}.description`)}</p>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                    <button onClick={onClose} className="w-1/2 p-3 font-bold text-gray-600 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        OK
                    </button>
                    <button onClick={handleShare} className="w-1/2 p-3 font-bold text-white bg-mint-green rounded-lg hover:bg-mint-green-dark transition-colors flex items-center justify-center space-x-2">
                        <ShareIcon className="w-5 h-5" />
                        <span>{t('scanner.share')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AchievementUnlockedModal;
