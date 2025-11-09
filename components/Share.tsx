
import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage, useFavorites, useAppData, useAuth } from '../App';
import { allArticles } from '../data/articles';
import { Article, Meal, CommunityPost } from '../types';
import { SearchIcon, XMarkIcon, CalendarDaysIcon, StarIcon, DocumentTextIcon, CameraIcon, ScanIcon, TrophyIcon, SparklesIcon, ShareIcon } from './icons/Icons';
import { useNavigate } from 'react-router-dom';
import CommunityView from './CommunityView';
import { GoogleGenAI } from "@google/genai";

const ArticleCard: React.FC<{ article: Article; onClick: () => void }> = ({ article, onClick }) => (
    <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
        onClick={onClick}
    >
        <div className="h-40 overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
            <span className="text-xs font-semibold text-mint-green bg-mint-green/10 px-2 py-1 rounded-full">{article.category}</span>
            <h3 className="font-bold text-lg mt-2 text-gray-800 dark:text-gray-100">{article.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{article.summary}</p>
        </div>
    </div>
);

const ArticleDetailModal: React.FC<{ article: Article | null; onClose: () => void }> = ({ article, onClose }) => {
    if (!article) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex-shrink-0">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-56 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>

                    <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                        <span className="text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{article.category}</span>
                        <h3 className="text-3xl font-extrabold mt-2 drop-shadow-md">{article.title}</h3>
                    </div>
                </div>
                
                <div className="overflow-y-auto p-6">
                    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
            </div>
        </div>
    );
};

const ArticlesContent: React.FC<{ onArticleSelect: (article: Article) => void }> = ({ onArticleSelect }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);

    useEffect(() => {
        const shuffleArray = (array: any[]) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const selectNewArticles = (): Article[] => {
            const nutrition = shuffleArray([...allArticles.Nutrition]).slice(0, 2);
            const lifestyle = shuffleArray([...allArticles.Lifestyle]).slice(0, 2);
            const recipes = shuffleArray([...allArticles.Recipes]).slice(0, 2);
            return shuffleArray([...nutrition, ...lifestyle, ...recipes]);
        };

        const storedData = localStorage.getItem('gluco-daily-articles');
        let articlesToDisplay: Article[] = [];

        if (storedData) {
            try {
                const { articles, timestamp } = JSON.parse(storedData);
                const hoursElapsed = (Date.now() - timestamp) / (1000 * 60 * 60);

                if (hoursElapsed < 48 && Array.isArray(articles) && articles.length > 0) {
                    articlesToDisplay = articles;
                }
            } catch (error) {
                console.error("Failed to parse stored articles, fetching new ones.", error);
                localStorage.removeItem('gluco-daily-articles');
            }
        }

        if (articlesToDisplay.length === 0) {
            articlesToDisplay = selectNewArticles();
            localStorage.setItem(
                'gluco-daily-articles',
                JSON.stringify({ articles: articlesToDisplay, timestamp: Date.now() })
            );
        }
        
        setDisplayedArticles(articlesToDisplay);
    }, []);


    const categories = useMemo(() => [
        { key: 'All', name: t('share.all') },
        { key: 'Nutrition', name: t('share.nutrition') },
        { key: 'Lifestyle', name: t('share.lifestyle') },
        { key: 'Recipes', name: t('share.recipes') },
    ], [t]);

    const filteredArticles = useMemo(() => {
        return displayedArticles.filter(article => {
            const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
            const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || article.summary.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [displayedArticles, selectedCategory, searchTerm]);

    return (
        <div className="space-y-6">
            <div>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('share.searchPlaceholder')}
                        className="w-full p-3 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-mint-green"
                    />
                </div>
                <div className="flex space-x-2 overflow-x-auto pt-4 pb-2 scrollbar-hide">
                    {categories.map(category => (
                        <button
                            key={category.key}
                            onClick={() => setSelectedCategory(category.key)}
                            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                                selectedCategory === category.key
                                    ? 'bg-mint-green text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredArticles.map(article => (
                        <ArticleCard key={article.id} article={article} onClick={() => onArticleSelect(article)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500 dark:text-gray-400">{t('share.noResults')}</p>
                </div>
            )}
        </div>
    );
};

const ShareMealModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onShare: (message: string) => void;
    meal: Meal;
}> = ({ isOpen, onClose, onShare, meal }) => {
    const { t } = useLanguage();
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setMessage(t('share.community.shareMealModal.defaultMessage'));
        }
    }, [isOpen, t]);

    if (!isOpen) return null;

    const handleShare = () => {
        onShare(message);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">{t('share.community.shareMealModal.title')}</h3>
                <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <img src={meal.imageUrl} alt={meal.name} className="w-12 h-12 rounded-md object-cover"/>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">{meal.name}</p>
                </div>
                <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 block mb-2">{t('share.community.shareMealModal.prompt')}</label>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={4}
                        placeholder={t('share.community.shareMealModal.placeholder')}
                        className="w-full p-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green"
                    />
                </div>
                <div className="flex items-center space-x-4 pt-2">
                    <button onClick={onClose} className="w-1/2 p-3 font-bold text-gray-600 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        {t('profile.cancel')}
                    </button>
                    <button onClick={handleShare} className="w-1/2 p-3 font-bold text-white bg-calm-blue rounded-lg hover:bg-calm-blue-dark transition-colors">
                        {t('share.community.publish')}
                    </button>
                </div>
            </div>
        </div>
    );
};


const MealDetailModal: React.FC<{ 
    meal: Meal | null; 
    onClose: () => void; 
    onDelete?: () => void;
    onAddToLog?: () => void;
    isCommunityMeal?: boolean;
    onUpdateMeal?: (updatedMeal: Meal) => void;
    onShare?: (meal: Meal) => void;
}> = ({ meal, onClose, onDelete, onAddToLog, isCommunityMeal = false, onUpdateMeal, onShare }) => {
    const { t } = useLanguage();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [hoverRating, setHoverRating] = useState(0);
    if (!meal) return null;

    const glycemicSpike = meal.preMealGlucose && meal.postMealGlucose ? meal.postMealGlucose - meal.preMealGlucose : null;
    
    const handleSetRating = (rating: number) => {
        if (!meal || !onUpdateMeal) return;
        const updatedMeal = { ...meal, userRating: rating };
        onUpdateMeal(updatedMeal);
    };

    const isMealFavorite = isFavorite(meal.id);
    const handleFavoriteClick = () => toggleFavorite(meal.id);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('share.mealDetail.title')}</h2>
                    <div className="flex items-center space-x-2">
                        {!isCommunityMeal && (
                            <button 
                                onClick={handleFavoriteClick} 
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                aria-label={isMealFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <StarIcon className={`h-6 w-6 transition-colors ${isMealFavorite ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </header>
                
                <div className="overflow-y-auto p-4 space-y-4">
                    <img src={meal.imageUrl} alt={meal.name} className="w-full h-48 object-cover rounded-xl" />
                    
                    <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">{meal.name}</h3>
                    {!isCommunityMeal &&
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                            {new Date(meal.timestamp).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                        </p>
                    }

                    {isCommunityMeal && (meal.communityRating || meal.scanCount) && (
                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            {meal.communityRating && (
                                <div className="flex items-center space-x-1">
                                    <StarIcon className="w-4 h-4 text-yellow-400" />
                                    <span>{t('share.mealDetail.communityRating')}: <strong>{meal.communityRating.toFixed(1)}</strong></span>
                                </div>
                            )}
                             {meal.scanCount && (
                                <div className="flex items-center space-x-1">
                                    <ScanIcon className="w-4 h-4" />
                                    <span>{t('share.mealDetail.scanCount', {count: meal.scanCount})}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">{t('scanner.carbs')}</p>
                            <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{meal.carbohydrates?.toFixed(0) ?? 'N/A'}g</p>
                        </div>
                        <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-300 font-medium">{t('scanner.protein')}</p>
                            <p className="font-bold text-lg text-red-600 dark:text-red-400">{meal.protein?.toFixed(0) ?? 'N/A'}g</p>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">{t('scanner.fats')}</p>
                            <p className="font-bold text-lg text-yellow-600 dark:text-yellow-400">{meal.fats?.toFixed(0) ?? 'N/A'}g</p>
                        </div>
                         {meal.fiber !== undefined && (
                            <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-lg">
                                <p className="text-sm text-green-800 dark:text-green-300 font-medium">{t('scanner.fiber')}</p>
                                <p className="font-bold text-lg text-green-600 dark:text-green-400">{meal.fiber?.toFixed(0) ?? 'N/A'}g</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-calm-blue/10 p-3 rounded-lg">
                            <p className="text-sm text-calm-blue-dark">{t('scanner.glycemicIndex')}</p>
                            <p className="font-bold text-lg text-calm-blue capitalize">{meal.glycemicIndex}</p>
                        </div>
                        <div className="bg-soft-violet/10 p-3 rounded-lg">
                            <p className="text-sm text-soft-violet-dark">{t('dashboard.glycemicScore').split(' ')[0]}</p>
                            <p className="font-bold text-lg text-soft-violet">{meal.glycemicScore}/100</p>
                        </div>
                    </div>
                    
                    { (meal.preMealGlucose || meal.postMealGlucose) && (
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div><p className="font-semibold text-gray-700 dark:text-gray-200">{meal.preMealGlucose || 'N/A'}</p><p className="text-xs text-gray-500">{t('scanner.preMealGlucose').split(' (')[0]}</p></div>
                            <div className="font-bold text-3xl text-gray-400 dark:text-gray-500 flex items-center justify-center">&rarr;</div>
                            <div><p className="font-semibold text-gray-700 dark:text-gray-200">{meal.postMealGlucose || 'N/A'}</p><p className="text-xs text-gray-500">{t('scanner.postMealGlucose').split(' (')[0]}</p></div>
                        </div>
                    )}
                     { glycemicSpike !== null && (
                        <div className="text-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-300">{t('share.mealDetail.glycemicSpike')}</p>
                             <p className={`font-bold text-lg ${glycemicSpike > 50 ? 'text-red-500' : 'text-mint-green-dark'}`}>
                                +{glycemicSpike.toFixed(0)} mg/dL
                             </p>
                        </div>
                     )}

                    <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200">{t('scanner.aiAdvice')}</h4>
                        <p className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mt-1 text-sm">{meal.advice}</p>
                    </div>

                    { meal.personalizedAdvice && (
                        <div>
                             <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center space-x-2">
                                <SparklesIcon className="w-5 h-5 text-soft-violet"/>
                                <span>{t('assistant.title')}</span>
                             </h4>
                             <p className="text-gray-600 dark:text-gray-300 bg-soft-violet/10 p-3 rounded-lg mt-1 text-sm">{meal.personalizedAdvice}</p>
                        </div>
                    )}
                    
                    {!isCommunityMeal && onUpdateMeal && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-center mb-2">{t('share.mealDetail.rateThisMeal')}</h4>
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
                                                (hoverRating || meal.userRating || 0) >= star
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    {isCommunityMeal ? (
                         <button onClick={onAddToLog} className="w-full py-3 font-bold text-white bg-mint-green rounded-lg hover:bg-mint-green-dark transition-colors">
                            {t('share.mealDetail.addToLog')}
                        </button>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <button onClick={onDelete} className="w-1/3 py-3 font-bold text-red-500 bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg hover:bg-red-200 transition-colors">
                                {t('share.history.deleteMeal')}
                            </button>
                            <button onClick={() => onShare?.(meal)} className="w-2/3 py-3 font-bold text-white bg-calm-blue rounded-lg hover:bg-calm-blue-dark transition-colors flex items-center justify-center space-x-2">
                               <ShareIcon className="w-5 h-5" />
                               <span>{t('share.community.shareMeal')}</span>
                            </button>
                        </div>
                    )}
                </footer>
            </div>
        </div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
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

const MealComparisonModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    meals: Meal[];
}> = ({ isOpen, onClose, meals }) => {
    const { t, language } = useLanguage();
    const [comparisonInsight, setComparisonInsight] = useState('');
    const [isInsightLoading, setIsInsightLoading] = useState(false);

    useEffect(() => {
        if (isOpen && meals.length === 2) {
            const generateInsight = async () => {
                setIsInsightLoading(true);
                setComparisonInsight('');
                try {
                    const apiKey = process.env.API_KEY;
                    if (!apiKey) throw new Error("API_KEY is not configured.");
                    const ai = new GoogleGenAI({ apiKey });

                    const mealA = meals[0];
                    const mealB = meals[1];

                    const prompt = t('share.history.compare.aiPrompt', {
                        mealAName: mealA.name,
                        mealACarbs: mealA.carbohydrates,
                        mealAGI: mealA.glycemicIndex,
                        mealAScore: mealA.glycemicScore,
                        mealBName: mealB.name,
                        mealBCarbs: mealB.carbohydrates,
                        mealBGI: mealB.glycemicIndex,
                        mealBScore: mealB.glycemicScore,
                        language: language === 'fr' ? 'français' : 'English',
                    });
                    
                    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                    setComparisonInsight(response.text);

                } catch (error) {
                    console.error("Meal comparison insight error:", error);
                    setComparisonInsight(t('share.history.compare.aiError'));
                } finally {
                    setIsInsightLoading(false);
                }
            };
            generateInsight();
        }
    }, [isOpen, meals, t, language]);

    if (!isOpen || meals.length !== 2) return null;

    const [mealA, mealB] = meals;
    const stats = [
        { label: t('scanner.carbs'), key: 'carbohydrates', unit: 'g' },
        { label: t('scanner.protein'), key: 'protein', unit: 'g' },
        { label: t('scanner.fats'), key: 'fats', unit: 'g' },
        { label: t('scanner.fiber'), key: 'fiber', unit: 'g' },
        { label: t('scanner.glycemicIndex'), key: 'glycemicIndex', unit: '' },
        { label: t('dashboard.glycemicScore'), key: 'glycemicScore', unit: '/100' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-gray-50 dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('share.history.compare.modalTitle')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </header>
                <div className="overflow-y-auto p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[mealA, mealB].map((meal, index) => (
                            <div key={index} className="text-center">
                                <img src={meal.imageUrl} alt={meal.name} className="w-full h-24 object-cover rounded-lg mb-2"/>
                                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{meal.name}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        {stats.map(stat => {
                            const valueA = mealA[stat.key as keyof Meal] ?? 'N/A';
                            const valueB = mealB[stat.key as keyof Meal] ?? 'N/A';
                            return(
                                <div key={stat.label} className="grid grid-cols-3 items-center text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{`${valueA}${stat.unit}`}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                                    <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{`${valueB}${stat.unit}`}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-gradient-to-r from-calm-blue/10 to-soft-violet/10 p-4 rounded-xl">
                         <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center space-x-2 mb-2">
                            <SparklesIcon className="w-5 h-5 text-soft-violet"/>
                            <span>{t('share.history.compare.aiAnalysisTitle')}</span>
                         </h4>
                         {isInsightLoading ? (
                             <p className="text-sm text-gray-500 dark:text-gray-400 italic">{t('share.history.compare.aiLoading')}</p>
                         ) : (
                             <p className="text-sm text-gray-700 dark:text-gray-300">{comparisonInsight}</p>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const MealHistoryView: React.FC<{
    onMealSelect: (meal: Meal) => void;
}> = ({ onMealSelect }) => {
    const { t } = useLanguage();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [allMeals, setAllMeals] = useState<Meal[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [selectedMealsForCompare, setSelectedMealsForCompare] = useState<Meal[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);


    const fetchUserMeals = () => {
        const storedMeals = localStorage.getItem('gluco-meals');
        if (storedMeals) {
            try {
                const parsedMeals: Meal[] = JSON.parse(storedMeals);
                setAllMeals(parsedMeals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            } catch (e) { console.error("Failed to parse meals", e); }
        } else {
            setAllMeals([]);
        }
    };
    
    const toggleMealForCompare = (meal: Meal) => {
        setSelectedMealsForCompare(prev => {
            if (prev.find(m => m.id === meal.id)) {
                return prev.filter(m => m.id !== meal.id);
            }
            if (prev.length < 2) {
                return [...prev, meal];
            }
            return prev;
        });
    };

    const cancelCompare = () => {
        setIsCompareMode(false);
        setSelectedMealsForCompare([]);
    };

    useEffect(() => {
        fetchUserMeals();
        const handleStorageChange = () => fetchUserMeals();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
    
    useEffect(() => {
        const handleMealsUpdate = () => fetchUserMeals();
        window.addEventListener('gluco-meals-updated', handleMealsUpdate);
        return () => window.removeEventListener('gluco-meals-updated', handleMealsUpdate);
    }, []);

    const handleFavoriteClick = (e: React.MouseEvent, mealId: string) => {
        e.stopPropagation();
        toggleFavorite(mealId);
    };

    const filteredMeals = useMemo(() => {
        return allMeals.filter(meal => meal.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allMeals, searchTerm]);

    const groupedMeals = useMemo(() => {
        const groups: { [key: string]: Meal[] } = {};
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

        filteredMeals.forEach(meal => {
            const mealDate = new Date(meal.timestamp);
            let dateKey: string;

            if (isSameDay(mealDate, today)) dateKey = t('share.history.today');
            else if (isSameDay(mealDate, yesterday)) dateKey = t('share.history.yesterday');
            else dateKey = mealDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(meal);
        });
        return groups;
    }, [filteredMeals, t]);
    
    return (
        <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-2 gap-4">
                <div className="relative col-span-2 sm:col-span-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('share.history.searchPlaceholder')}
                        className="w-full p-2 pl-10 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green"
                    />
                </div>
                 <button onClick={() => setIsCompareMode(true)} className="col-span-2 sm:col-span-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    <span>{t('share.history.compare.button')}</span>
                </button>
            </div>
            
            {Object.keys(groupedMeals).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(groupedMeals).map(([date, meals]) => (
                        <div key={date}>
                            <div className="flex items-center space-x-2 mb-3">
                                <CalendarDaysIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <h2 className="font-bold text-gray-700 dark:text-gray-200 capitalize">{date}</h2>
                            </div>
                            <div className="space-y-3">
                                {(meals as Meal[]).map(meal => {
                                    const isSelectedForCompare = selectedMealsForCompare.some(m => m.id === meal.id);
                                    return (
                                    <div 
                                        key={meal.id} 
                                        onClick={() => isCompareMode ? toggleMealForCompare(meal) : onMealSelect(meal)} 
                                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 flex items-center space-x-4 cursor-pointer transition-all duration-200 ${isSelectedForCompare ? 'ring-2 ring-calm-blue' : 'hover:shadow-lg'}`}
                                    >
                                        <img src={meal.imageUrl} alt={meal.name} className="w-16 h-16 rounded-lg object-cover" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{meal.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(meal.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <button
                                            onClick={(e) => handleFavoriteClick(e, meal.id)}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            aria-label={isFavorite(meal.id) ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            <StarIcon className={`w-6 h-6 transition-colors ${isFavorite(meal.id) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                        </button>
                                        <div className="text-center">
                                            <p className="font-bold text-soft-violet text-lg">{meal.glycemicScore}</p>
                                            <p className="text-xs text-soft-violet-dark">Score</p>
                                            {meal.userRating && (
                                                <div className="flex items-center justify-center mt-1 space-x-1">
                                                    <StarIcon className="w-3 h-3 text-yellow-400" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{meal.userRating}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md flex flex-col items-center space-y-4">
                        <DocumentTextIcon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{t('share.history.noMeals')}</p>
                        <button onClick={() => navigate('/scanner')} className="bg-mint-green text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-mint-green-dark transition-transform transform hover:scale-105 flex items-center space-x-2">
                            <CameraIcon className="h-5 w-5" />
                            <span>{t('share.history.scanFirst')}</span>
                        </button>
                    </div>
                </div>
            )}
            
            {isCompareMode && (
                <div className="fixed bottom-20 left-0 right-0 z-20 p-4 max-w-lg mx-auto">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-3 flex justify-between items-center">
                        <button onClick={cancelCompare} className="font-semibold text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('profile.cancel')}</button>
                        <button 
                            onClick={() => {
                                setIsCompareModalOpen(true);
                                setIsCompareMode(false);
                            }}
                            disabled={selectedMealsForCompare.length !== 2}
                            className="bg-calm-blue text-white font-bold px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {t('share.history.compare.buttonAction', { count: selectedMealsForCompare.length })}
                        </button>
                    </div>
                </div>
            )}

            <MealComparisonModal
                isOpen={isCompareModalOpen}
                onClose={() => {
                    setIsCompareModalOpen(false);
                    setSelectedMealsForCompare([]);
                }}
                meals={selectedMealsForCompare}
            />
        </div>
    );
};

const Share: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { logActivity } = useAppData();
    const [activeTab, setActiveTab] = useState<'history' | 'community' | 'articles'>('history');
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [selectedCommunityMeal, setSelectedCommunityMeal] = useState<Meal | null>(null);
    const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);
    const [mealToShare, setMealToShare] = useState<Meal | null>(null);
    
    const handleDeleteMeal = () => {
        if (!mealToDelete) return;
        const storedMeals = localStorage.getItem('gluco-meals');
        const allMeals = storedMeals ? JSON.parse(storedMeals) : [];
        const updatedMeals = allMeals.filter((meal: Meal) => meal.id !== mealToDelete.id);
        localStorage.setItem('gluco-meals', JSON.stringify(updatedMeals));
        window.dispatchEvent(new CustomEvent('gluco-meals-updated'));
        setSelectedMeal(null);
        setMealToDelete(null);
    };
    
    const handleUpdateMeal = (updatedMeal: Meal) => {
        const storedMeals = localStorage.getItem('gluco-meals');
        const allMeals: Meal[] = storedMeals ? JSON.parse(storedMeals) : [];
        const updatedMeals = allMeals.map(meal => meal.id === updatedMeal.id ? updatedMeal : meal);
        localStorage.setItem('gluco-meals', JSON.stringify(updatedMeals));
        window.dispatchEvent(new CustomEvent('gluco-meals-updated'));
        setSelectedMeal(updatedMeal);
    };

    const handleAddCommunityMealToLog = (mealToAdd: Meal) => {
        const newMealForUser: Meal = {
            ...mealToAdd,
            id: new Date().toISOString(),
            timestamp: new Date().toISOString(),
        };
        const storedMeals = localStorage.getItem('gluco-meals');
        const allMeals: Meal[] = storedMeals ? JSON.parse(storedMeals) : [];
        const updatedMeals = [...allMeals, newMealForUser];
        localStorage.setItem('gluco-meals', JSON.stringify(updatedMeals));
        logActivity();
        window.dispatchEvent(new CustomEvent('gluco-meals-updated'));
        setSelectedCommunityMeal(null);
        alert(t('share.history.addSuccess'));
        setActiveTab('history');
    };
    
    const handleShareMeal = (message: string) => {
        if (!mealToShare || !user) return;

        const newPost: CommunityPost = {
            id: new Date().toISOString(),
            author: { name: user.name, avatarUrl: user.avatarUrl, nickname: user.nickname },
            content: message,
            category: 'Partage',
            timestamp: new Date().toISOString(),
            reactions: { like: 0, love: 0, idea: 0 },
            sharedMeal: mealToShare,
        };

        const storedPosts = localStorage.getItem('gluco-community-posts');
        const posts: CommunityPost[] = storedPosts ? JSON.parse(storedPosts) : [];
        const updatedPosts = [newPost, ...posts];
        localStorage.setItem('gluco-community-posts', JSON.stringify(updatedPosts));
        
        window.dispatchEvent(new CustomEvent('gluco-community-posts-updated'));
        
        setMealToShare(null);
        setSelectedMeal(null);
        alert(t('share.community.shareMealModal.success'));
        setActiveTab('community');
    };


    const TabButton: React.FC<{ tabId: 'articles' | 'history' | 'community'; label: string; }> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`w-full py-3 font-semibold transition-colors text-sm ${
                activeTab === tabId
                    ? 'text-mint-green border-b-2 border-mint-green'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <>
            <header className="text-center pt-8 p-4">
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('share.title')}</h1>
                 <p className="text-gray-500 dark:text-gray-400 mt-1">{t('share.subtitle')}</p>
            </header>

            <nav className="sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                <div className="flex justify-around border-b border-gray-200 dark:border-gray-700">
                    <TabButton tabId="history" label={t('share.tabHistory')} />
                    <TabButton tabId="community" label={t('share.tabCommunity')} />
                    <TabButton tabId="articles" label={t('share.tabArticles')} />
                </div>
            </nav>

            <div className="p-4">
                {activeTab === 'articles' && <ArticlesContent onArticleSelect={setSelectedArticle} />}
                {activeTab === 'history' && (
                    <MealHistoryView 
                        onMealSelect={setSelectedMeal}
                    />
                )}
                {activeTab === 'community' && <CommunityView onCommunityMealSelect={setSelectedCommunityMeal} />}
            </div>

            <ArticleDetailModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
             <MealDetailModal 
                meal={selectedMeal} 
                onClose={() => setSelectedMeal(null)}
                onDelete={() => setMealToDelete(selectedMeal)}
                onUpdateMeal={handleUpdateMeal}
                onShare={setMealToShare}
            />
            <MealDetailModal 
                meal={selectedCommunityMeal} 
                isCommunityMeal={true}
                onClose={() => setSelectedCommunityMeal(null)}
                onAddToLog={() => handleAddCommunityMealToLog(selectedCommunityMeal!)}
            />
            {mealToShare && (
                <ShareMealModal
                    isOpen={!!mealToShare}
                    onClose={() => setMealToShare(null)}
                    onShare={handleShareMeal}
                    meal={mealToShare}
                />
            )}
            <ConfirmationModal
                isOpen={!!mealToDelete}
                onClose={() => setMealToDelete(null)}
                onConfirm={handleDeleteMeal}
                title={t('share.history.deleteConfirmTitle')}
                message={t('share.history.deleteConfirmMessage')}
                confirmText={t('share.history.deleteMeal')}
                cancelText={t('profile.cancel')}
            />
        </>
    );
};

export default Share;
