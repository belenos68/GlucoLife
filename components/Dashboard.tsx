import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth, useLanguage, useTheme, useAppData, useFavorites } from '../App';
import { Meal, GlucoseReading, Goal, TrackingProgram } from '../types';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea, ReferenceDot } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { LightbulbIcon, FireIcon, ShareIcon, StarIcon, ScanIcon, CalendarDaysIcon, SparklesIcon } from './icons/Icons';
import ShareTipModal from './ShareTipModal';
import ShareChartModal from './ShareChartModal';

const MealCard: React.FC<{ meal: Meal }> = ({ meal }) => {
    const { t } = useLanguage();
    const { isFavorite, toggleFavorite } = useFavorites();
    const isMealFavorite = isFavorite(meal.id);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent any parent click handlers
        toggleFavorite(meal.id);
    };
    
    return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden p-3">
        <div className="flex items-start space-x-4">
            <img src={meal.imageUrl} alt={meal.name} className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-grow">
                 <div className="flex justify-between items-start">
                    <div className="pr-2">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{meal.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(meal.timestamp).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="font-bold text-soft-violet text-2xl">{meal.glycemicScore}</p>
                        <p className="text-xs text-soft-violet-dark -mt-1">{t('dashboard.glycemicScore').split(' ')[0]}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full px-2.5 py-1">
                        <span>{t('scanner.carbs')}:</span>
                        <span className="font-bold ml-1.5">{meal.carbohydrates}g</span>
                    </div>
                    {meal.protein !== undefined && (
                        <div className="flex items-center text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-full px-2.5 py-1">
                            <span>{t('scanner.protein')}:</span>
                            <span className="font-bold ml-1.5">{meal.protein}g</span>
                        </div>
                    )}
                    {meal.fats !== undefined && (
                        <div className="flex items-center text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-full px-2.5 py-1">
                            <span>{t('scanner.fats')}:</span>
                            <span className="font-bold ml-1.5">{meal.fats}g</span>
                        </div>
                    )}
                    {meal.fiber !== undefined && (
                        <div className="flex items-center text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full px-2.5 py-1">
                            <span>{t('scanner.fiber')}:</span>
                            <span className="font-bold ml-1.5">{meal.fiber}g</span>
                        </div>
                    )}
                </div>
            </div>
             <button 
                onClick={handleFavoriteClick} 
                className="p-2 -mt-2 -mr-2 rounded-full text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={isMealFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <StarIcon className={`w-6 h-6 ${isMealFavorite ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
            </button>
        </div>
        {meal.personalizedAdvice && (
             <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                    {meal.personalizedAdvice}
                </p>
            </div>
        )}
    </div>
)};

const CustomTooltip = ({ active, payload, label }: any) => {
    const { t } = useLanguage();

    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;

        return (
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    {new Date(label).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
                
                {dataPoint.mealName && <p className="font-bold text-calm-blue mb-1 text-sm">{dataPoint.mealName}</p>}

                {dataPoint.glucose && (
                    <p style={{ color: '#8b5cf6' }} className="text-sm">
                        {t('dashboard.glucose')}: <span className="font-semibold">{dataPoint.glucose} mg/dL</span>
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const MealEventDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.mealName) {
        return (
            <svg x={cx-6} y={cy-6} width="12" height="12" fill="#38bdf8" viewBox="0 0 1024 1024">
                <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0z m0 896c-212.1 0-384-171.9-384-384S299.9 128 512 128s384 171.9 384 384-171.9 384-384 384z" />
                <path d="M544 288h-64v224h64V288z m-32 384c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" />
            </svg>
        );
    }
    return null;
}

const HistoryChart: React.FC<{ 
    meals: Meal[], 
    glucoseReadings: GlucoseReading[],
    chartRef: React.RefObject<HTMLDivElement>,
    onShare: () => void
}> = ({ meals, glucoseReadings, chartRef, onShare }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();

    const combinedData = useMemo(() => {
        const allPoints = new Map<number, { glucose?: number; score?: number; mealName?: string }>();

        glucoseReadings.forEach(r => {
            const time = new Date(r.timestamp).getTime();
            if (!allPoints.has(time)) allPoints.set(time, {});
            allPoints.get(time)!.glucose = r.value;
        });

        meals.forEach(m => {
            const time = new Date(m.timestamp).getTime();
            if (!allPoints.has(time)) allPoints.set(time, {});
            allPoints.get(time)!.score = m.glycemicScore;
            allPoints.get(time)!.mealName = m.name;
            if(m.preMealGlucose && !allPoints.get(time)!.glucose){
                allPoints.get(time)!.glucose = m.preMealGlucose;
            }
        });

        return Array.from(allPoints.entries())
            .map(([time, values]) => ({ time, ...values }))
            .sort((a, b) => a.time - b.time);
    }, [meals, glucoseReadings]);

    const glucoseData = useMemo(() => combinedData.filter(d => d.glucose !== undefined), [combinedData]);

    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    const textColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const glucoseColor = '#8b5cf6'; // soft-violet
    
    const chartHasData = glucoseData.length >= 2;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md" ref={chartRef}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">{t('dashboard.historyChartTitle')}</h3>
              <button 
                  onClick={onShare} 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-mint-green dark:hover:text-mint-green transition-colors"
                  aria-label={t('scanner.share')}
              >
                  <ShareIcon className="h-5 w-5" />
              </button>
            </div>

            { !chartHasData ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">{t('dashboard.glucoseChartEmpty')}</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                     <AreaChart data={glucoseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                         <defs>
                            <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={glucoseColor} stopOpacity={0.7}/>
                                <stop offset="95%" stopColor={glucoseColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis 
                            dataKey="time"
                            tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            tick={{ fontSize: 10, fill: textColor }} 
                            axisLine={{ stroke: gridColor }} 
                            tickLine={{ stroke: gridColor }}
                        />
                        <YAxis 
                            domain={['dataMin - 20', 'dataMax + 20']}
                            tick={{ fontSize: 10, fill: textColor }} 
                            axisLine={{ stroke: gridColor }} 
                            tickLine={{ stroke: gridColor }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceArea y1={70} y2={140} fill="#10b981" fillOpacity={0.1} label={{ value: "Cible", position: "insideTopRight", fill: "#059669", fontSize: 10 }} />
                        <Area type="monotone" dataKey="glucose" stroke={glucoseColor} fill="url(#colorGlucose)" strokeWidth={2} name={t('dashboard.glucose')} connectNulls dot={<MealEventDot />} />
                     </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

const DashboardSummary: React.FC<{ meals: Meal[] }> = ({ meals }) => {
    const { t } = useLanguage();

    const totalMeals = meals.length;

    const mealsToday = useMemo(() => {
        const today = new Date();
        const todayString = today.toDateString();
        return meals.filter(meal => {
            const mealDate = new Date(meal.timestamp);
            return mealDate.toDateString() === todayString;
        }).length;
    }, [meals]);

    const lastMealScore = useMemo(() => {
        if (meals.length > 0) {
            return meals[0].glycemicScore; // Meals are pre-sorted
        }
        return null;
    }, [meals]);

    const summaryItems = [
        { label: t('dashboard.summary.totalMeals'), value: totalMeals, icon: <ScanIcon className="h-6 w-6 text-mint-green" /> },
        { label: t('dashboard.summary.mealsToday'), value: mealsToday, icon: <CalendarDaysIcon className="h-6 w-6 text-calm-blue" /> },
        { label: t('dashboard.summary.lastScore'), value: lastMealScore !== null ? `${lastMealScore}/100` : 'N/A', icon: <SparklesIcon className="h-6 w-6 text-soft-violet" /> }
    ];
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md">
            <div className="grid grid-cols-3 gap-2 text-center">
                {summaryItems.map(item => (
                    <div key={item.label} className="flex flex-col items-center p-2">
                        <div className="mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700">
                           {item.icon}
                        </div>
                        <p className="font-bold text-xl text-gray-800 dark:text-gray-100">{item.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { t, language, tArray } = useLanguage();
    const { streak, logActivity } = useAppData();
    const [meals, setMeals] = useState<Meal[]>([]);
    const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([]);
    const [goal, setGoal] = useState<Goal | null>(null);
    const [newGlucoseValue, setNewGlucoseValue] = useState('');
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isInsightLoading, setIsInsightLoading] = useState<boolean>(false);
    const [scoreTrend, setScoreTrend] = useState<'stable' | 'en hausse' | 'en baisse' | null>(null);
    const [isTipShareModalOpen, setIsTipShareModalOpen] = useState(false);
    const [isChartShareModalOpen, setIsChartShareModalOpen] = useState(false);
    const [dailyTip, setDailyTip] = useState('');
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const insightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const initialInsightGenerated = useRef(false);

    const refreshData = () => {
        const storedMeals = localStorage.getItem('gluco-meals');
        if (storedMeals) {
            try {
                const parsedMeals: Meal[] = JSON.parse(storedMeals);
                setMeals(parsedMeals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            } catch (e) { console.error("Failed to parse meals", e); }
        }
        const storedReadings = localStorage.getItem('gluco-readings');
        if (storedReadings) {
            try {
                const parsedReadings: GlucoseReading[] = JSON.parse(storedReadings);
                setGlucoseReadings(parsedReadings);
            } catch (e) { console.error("Failed to parse readings", e); }
        }
        const storedGoal = localStorage.getItem('gluco-goal');
        if (storedGoal) {
            try {
                setGoal(JSON.parse(storedGoal));
            } catch (e) { console.error("Failed to parse goal", e); }
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    useEffect(() => {
        const tips = tArray('tips');
        if (tips.length > 0) {
            const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
            const tip = tips[dayOfYear % tips.length];
            setDailyTip(tip);
        }
    }, [tArray]);

    const averageScore = useMemo(() => (
        meals.length > 0 ? (meals.reduce((sum, meal) => sum + meal.glycemicScore, 0) / meals.length) : null
    ), [meals]);
    
    useEffect(() => {
        if (meals.length >= 3) {
            const recentMeals = meals.slice(0, 3);
            const olderMeals = meals.slice(3, 6);
            if (olderMeals.length > 0) {
                const recentAvg = recentMeals.reduce((s, m) => s + m.glycemicScore, 0) / recentMeals.length;
                const olderAvg = olderMeals.reduce((s, m) => s + m.glycemicScore, 0) / olderMeals.length;
                if (recentAvg > olderAvg + 5) setScoreTrend('en hausse');
                else if (recentAvg < olderAvg - 5) setScoreTrend('en baisse');
                else setScoreTrend('stable');
            }
        }
    }, [meals]);

    const generateAiInsight = useCallback(async () => {
        if (!user || !averageScore) return;
        setIsInsightLoading(true);
        
        // Timeout to prevent infinite loading
        insightTimeoutRef.current = setTimeout(() => {
            if (isInsightLoading) {
                setAiInsight(t('dashboard.aiError'));
                setIsInsightLoading(false);
            }
        }, 15000);

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error("API_KEY is not configured.");
            const ai = new GoogleGenAI({ apiKey });

            const goalString = goal ? t('dashboard.goalSet', { targetReduction: goal.targetReduction, durationDays: goal.durationDays }) : t('dashboard.goalMissing');

            const prompt = t('dashboard.aiPrompt', {
                program: user.trackingProgram,
                avgScore: averageScore.toFixed(0),
                trend: scoreTrend ? t(`dashboard.trend${scoreTrend.charAt(0).toUpperCase() + scoreTrend.slice(1).replace(' ', '')}`) : 'stable',
                goal: goalString,
                language: language === 'fr' ? 'français' : 'English'
            });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setAiInsight(response.text);
        } catch (error: any) {
            console.error("AI Insight Error:", error);
            if(error.message?.includes('429')) {
                setAiInsight(t('dashboard.aiRateLimitError'));
            } else {
                setAiInsight(t('dashboard.aiError'));
            }
        } finally {
            if (insightTimeoutRef.current) clearTimeout(insightTimeoutRef.current);
            setIsInsightLoading(false);
        }
    }, [user, averageScore, scoreTrend, goal, t, language]);

    useEffect(() => {
        if (meals.length > 0 && !initialInsightGenerated.current) {
            initialInsightGenerated.current = true;
            generateAiInsight();
        }
    }, [meals, generateAiInsight]);

    const handleAddGlucose = () => {
        const value = parseFloat(newGlucoseValue);
        if (!isNaN(value) && value > 0) {
            const newReading: GlucoseReading = {
                id: new Date().toISOString(),
                timestamp: new Date().toISOString(),
                value: value,
            };
            const updatedReadings = [...glucoseReadings, newReading];
            localStorage.setItem('gluco-readings', JSON.stringify(updatedReadings));
            setGlucoseReadings(updatedReadings);
            setNewGlucoseValue('');
            logActivity();
        }
    };

    return (
        <div className="p-4 space-y-6">
            <header className="relative">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('dashboard.greeting', { name: user?.name.split(' ')[0] })}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('dashboard.tagline')}</p>
                </div>
                 <div className="absolute top-0 right-0 flex items-center space-x-2 text-orange-500">
                    <FireIcon className="h-6 w-6" />
                    <span className="font-bold text-lg">{streak}</span>
                </div>
            </header>

            <DashboardSummary meals={meals} />

            {/* AI Insight */}
            <div className="bg-gradient-to-r from-calm-blue to-soft-violet p-4 rounded-2xl shadow-lg text-white">
                <div className="relative mb-1 text-center">
                    <h3 className="font-bold text-center">{t('dashboard.aiTipTitle')}</h3>
                    <button onClick={generateAiInsight} disabled={isInsightLoading} className="absolute top-1/2 -translate-y-1/2 right-0 bg-white/20 hover:bg-white/30 p-1.5 rounded-full disabled:opacity-50">
                        <svg className={`h-4 w-4 ${isInsightLoading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>
                    </button>
                </div>
                <p className="text-xs opacity-80 mb-2 text-center">{t('dashboard.aiTipSubtitle')}</p>
                <div className="text-center">
                    {isInsightLoading ? (
                        <p className="text-sm italic">{t('dashboard.aiLoading')}</p>
                    ) : aiInsight ? (
                        <p className="text-sm">{aiInsight}</p>
                    ) : (
                        <p className="text-sm text-white/80">
                            {meals.length > 0 
                                ? t('dashboard.aiInitialMessage') 
                                : t('dashboard.aiNoData')}
                        </p>
                    )}
                </div>
            </div>

            {/* Daily Tip */}
            {dailyTip && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col items-center text-center">
                    <div className="p-2 bg-yellow-400/20 rounded-full mb-3">
                        <LightbulbIcon className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">{t('dashboard.dailyTipTitle')}</h3>
                    <p className="text-lg font-semibold font-serif italic text-gray-700 dark:text-gray-200">
                        &ldquo;{dailyTip}&rdquo;
                    </p>
                    <div className="mt-4">
                        <button 
                            onClick={() => setIsTipShareModalOpen(true)}
                            className="text-sm font-semibold text-mint-green hover:text-mint-green-dark transition-colors"
                        >
                            {t('scanner.share')}
                        </button>
                    </div>
                </div>
            )}

            {/* History Chart */}
            <HistoryChart meals={meals} glucoseReadings={glucoseReadings} chartRef={chartContainerRef} onShare={() => setIsChartShareModalOpen(true)} />

            {/* Add Glucose Reading */}
             <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md">
                 <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">{t('dashboard.addReadingTitle')}</h3>
                <div className="flex items-center space-x-2">
                    <input 
                        type="number"
                        value={newGlucoseValue}
                        onChange={(e) => setNewGlucoseValue(e.target.value)}
                        placeholder={t('dashboard.glucosePlaceholder')}
                        className="w-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green"
                    />
                     <button onClick={handleAddGlucose} className="p-2 bg-mint-green text-white font-semibold rounded-lg hover:bg-mint-green-dark transition-colors">
                        {t('dashboard.add')}
                    </button>
                </div>
            </div>

            {/* Recent Meals */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('dashboard.recentMeals')}</h2>
                {meals.length > 0 ? (
                    <div className="space-y-3">
                        {meals.slice(0, 3).map(meal => <MealCard key={meal.id} meal={meal} />)}
                    </div>
                ) : (
                     <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('dashboard.noMeals')}</p>
                        <Link to="/scanner" className="bg-mint-green text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-mint-green-dark transition-transform transform hover:scale-105">
                           {t('dashboard.scanFirstMeal')}
                        </Link>
                    </div>
                )}
            </div>

            <ShareTipModal
                isOpen={isTipShareModalOpen}
                onClose={() => setIsTipShareModalOpen(false)}
                tipText={dailyTip}
            />
            <ShareChartModal
                isOpen={isChartShareModalOpen}
                onClose={() => setIsChartShareModalOpen(false)}
                chartContainerRef={chartContainerRef}
            />
        </div>
    );
};

export default Dashboard;