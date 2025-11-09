import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Meal } from '../types';
import { UploadIcon, CameraIcon, ShareIcon } from './icons/Icons';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage, useAppData } from '../App';


// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

type AnalysisState = 'initial' | 'preview' | 'loading' | 'analyzed';

const MealScanner: React.FC = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const { logActivity } = useAppData();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [stagedMeal, setStagedMeal] = useState<Partial<Meal> | null>(null);
    const [analysisState, setAnalysisState] = useState<AnalysisState>('initial');
    const [error, setError] = useState<string | null>(null);
    const [preMealGlucose, setPreMealGlucose] = useState('');
    const [postMealGlucose, setPostMealGlucose] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const isAnalysisCancelled = useRef(false);
    const navigate = useNavigate();

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleReset();
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setAnalysisState('preview');
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleReset = () => {
        setImagePreview(null);
        setImageFile(null);
        setStagedMeal(null);
        setError(null);
        setPreMealGlucose('');
        setPostMealGlucose('');
        setAnalysisState('initial');
        isAnalysisCancelled.current = false;
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    const calculateGlycemicScore = (carbs: number, gi: string, spike?: number): number => {
        if (spike !== undefined && spike >= 0) {
            if (spike < 30) return Math.floor(Math.random() * 10) + 90; // 90-99
            if (spike < 50) return Math.floor(Math.random() * 20) + 70; // 70-89
            if (spike < 80) return Math.floor(Math.random() * 30) + 40; // 40-69
            return Math.floor(Math.random() * 40); // 0-39
        }
        
        const giMultiplier = gi.toLowerCase() === 'élevé' || gi.toLowerCase() === 'high' ? 1.5 : gi.toLowerCase() === 'moyen' || gi.toLowerCase() === 'medium' ? 1 : 0.5;
        const score = 100 - (carbs * giMultiplier);
        return Math.max(0, Math.round(score));
    };

    const handleAnalyze = async () => {
        if (!imageFile) {
            setError(t('scanner.selectImageError'));
            return;
        }

        isAnalysisCancelled.current = false;
        setAnalysisState('loading');
        setError(null);

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error("API_KEY is not configured.");

            const ai = new GoogleGenAI({ apiKey });
            const base64Image = await fileToBase64(imageFile);

            const prompt = t('scanner.analysisPrompt');

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: imageFile.type, data: base64Image } }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            mealName: { type: Type.STRING, description: "Name of the dish" },
                            ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of identified main ingredients" },
                            carbohydrates: { type: Type.NUMBER, description: "Carbohydrates in grams" },
                            protein: { type: Type.NUMBER, description: "Protein in grams" },
                            fats: { type: Type.NUMBER, description: "Fats in grams" },
                            fiber: { type: Type.NUMBER, description: "Fiber in grams" },
                            glycemicIndex: { type: Type.STRING, description: "Glycemic index (low, medium, or high)" },
                            advice: { type: Type.STRING, description: "Nutritional advice" },
                        },
                        required: ["mealName", "ingredients", "carbohydrates", "protein", "fats", "fiber", "glycemicIndex", "advice"]
                    }
                }
            });
            
            if (isAnalysisCancelled.current) return;
            
            const parsedResult = JSON.parse(response.text.trim());
            
            const mealData: Partial<Meal> = {
                name: parsedResult.mealName,
                imageUrl: imagePreview!,
                ingredients: parsedResult.ingredients,
                carbohydrates: parsedResult.carbohydrates,
                protein: parsedResult.protein,
                fats: parsedResult.fats,
                fiber: parsedResult.fiber,
                glycemicIndex: parsedResult.glycemicIndex,
                advice: parsedResult.advice,
            };
            setStagedMeal(mealData);
            setAnalysisState('analyzed');

        } catch (err) {
            if (isAnalysisCancelled.current) return;
            console.error(err);
            setError(t('scanner.analysisError'));
            setAnalysisState('preview');
        }
    };
    
    const handleInterruptAnalysis = () => {
        isAnalysisCancelled.current = true;
        setAnalysisState('preview');
    };
    
    const handleShare = async () => {
        if (!stagedMeal || !imageFile) return;

        const shareText = t('scanner.shareText', {
            mealName: stagedMeal.name,
            carbs: stagedMeal.carbohydrates?.toFixed(0),
            gi: stagedMeal.glycemicIndex,
            advice: stagedMeal.advice,
        });

        const shareData = {
            title: t('scanner.shareTitle'),
            text: shareText,
            files: [imageFile],
        };
        
        try {
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else if (navigator.share) {
                await navigator.share({ title: shareData.title, text: shareData.text });
            } else {
                // Fallback for browsers that don't support Web Share API
                navigator.clipboard.writeText(shareText);
                alert(t('scanner.shareSuccess'));
            }
        } catch (error) {
            // This can happen if the user cancels the share dialog, so we don't always show an error.
            if (error instanceof DOMException && error.name === 'AbortError') {
              console.log('Share was cancelled by the user.');
            } else {
              console.error('Sharing failed', error);
              alert(t('scanner.shareError'));
            }
        }
    };


    const handleSaveMeal = async () => {
        if (!stagedMeal || !user) return;

        setAnalysisState('loading');
        let finalMeal: Meal = {
            id: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            name: stagedMeal.name!,
            imageUrl: stagedMeal.imageUrl!,
            carbohydrates: stagedMeal.carbohydrates!,
            glycemicIndex: stagedMeal.glycemicIndex!,
            advice: stagedMeal.advice!,
            glycemicScore: calculateGlycemicScore(stagedMeal.carbohydrates!, stagedMeal.glycemicIndex!),
            ingredients: stagedMeal.ingredients,
            protein: stagedMeal.protein,
            fats: stagedMeal.fats,
            fiber: stagedMeal.fiber,
        };

        const preValue = parseFloat(preMealGlucose);
        const postValue = parseFloat(postMealGlucose);

        if (!isNaN(preValue) && !isNaN(postValue) && postValue > preValue) {
            finalMeal.preMealGlucose = preValue;
            finalMeal.postMealGlucose = postValue;
            const spike = postValue - preValue;
            finalMeal.glycemicScore = calculateGlycemicScore(finalMeal.carbohydrates, finalMeal.glycemicIndex, spike);

            try {
                const apiKey = process.env.API_KEY;
                if (!apiKey) throw new Error("API_KEY is not configured.");

                const ai = new GoogleGenAI({ apiKey });
                const prompt = t('scanner.personalizedAdvicePrompt', {
                    program: user.trackingProgram,
                    mealName: finalMeal.name,
                    carbs: finalMeal.carbohydrates,
                    gi: finalMeal.glycemicIndex,
                    preValue: preValue,
                    postValue: postValue,
                    spike: spike.toFixed(1),
                    language: language === 'fr' ? 'français' : 'English'
                });
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });

                finalMeal.personalizedAdvice = response.text.trim();

            } catch (err) {
                console.error("Failed to get personalized advice:", err);
                finalMeal.personalizedAdvice = t('scanner.personalizedAdviceError');
            }
        }
        
        const storedMeals = localStorage.getItem('gluco-meals');
        const meals: Meal[] = storedMeals ? JSON.parse(storedMeals) : [];
        meals.push(finalMeal);
        localStorage.setItem('gluco-meals', JSON.stringify(meals));
        logActivity();
        navigate('/dashboard');
    };

    return (
        <div className="p-4 space-y-6">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 from-mint-green to-calm-blue bg-clip-text text-transparent bg-gradient-to-r">{t('scanner.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{t('scanner.subtitle')}</p>
            </header>

            {analysisState === 'initial' && (
                <div className="space-y-4">
                     <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
                     <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                    <button onClick={() => cameraInputRef.current?.click()} className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col justify-center items-center text-gray-500 dark:text-gray-400 cursor-pointer hover:border-mint-green hover:text-mint-green transition-colors space-y-2">
                        <CameraIcon className="h-10 w-10" />
                        <span className="font-semibold">{t('scanner.takePhoto')}</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col justify-center items-center text-gray-500 dark:text-gray-400 cursor-pointer hover:border-calm-blue hover:text-calm-blue transition-colors space-y-2">
                        <UploadIcon className="h-10 w-10" />
                        <span className="font-semibold">{t('scanner.uploadPhoto')}</span>
                    </button>
                </div>
            )}

            {imagePreview && analysisState !== 'initial' && (
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg">
                         <img src={imagePreview} alt={t('scanner.mealPreview')} className="w-full h-full object-cover" />
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            {analysisState === 'loading' && (
                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                    <div className="flex items-center">
                        <svg className="animate-spin h-8 w-8 text-mint-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="ml-3 text-gray-600 dark:text-gray-300">{t('scanner.analyzing')}</p>
                    </div>
                    <button onClick={handleInterruptAnalysis} className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-semibold px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                        {t('scanner.interrupt')}
                    </button>
                </div>
            )}
            
            {analysisState === 'analyzed' && stagedMeal && (
                <div className="w-full bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md animate-fade-in space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{stagedMeal.name}</h2>
                        <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-mint-green dark:hover:text-mint-green transition-colors" aria-label={t('scanner.share')}>
                           <ShareIcon className="h-6 w-6" />
                        </button>
                    </div>
                    
                    {stagedMeal.ingredients && stagedMeal.ingredients.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('scanner.ingredients')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {stagedMeal.ingredients.map((ingredient, index) => (
                                    <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
                                        {ingredient}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">{t('scanner.carbs')}</p>
                            <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{stagedMeal.carbohydrates?.toFixed(0) ?? 'N/A'}g</p>
                        </div>
                        <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-300 font-medium">{t('scanner.protein')}</p>
                            <p className="font-bold text-lg text-red-600 dark:text-red-400">{stagedMeal.protein?.toFixed(0) ?? 'N/A'}g</p>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">{t('scanner.fats')}</p>
                            <p className="font-bold text-lg text-yellow-600 dark:text-yellow-400">{stagedMeal.fats?.toFixed(0) ?? 'N/A'}g</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-lg">
                            <p className="text-sm text-green-800 dark:text-green-300 font-medium">{t('scanner.fiber')}</p>
                            <p className="font-bold text-lg text-green-600 dark:text-green-400">{stagedMeal.fiber?.toFixed(0) ?? 'N/A'}g</p>
                        </div>
                    </div>

                    <div className="bg-calm-blue/10 p-3 rounded-lg">
                        <p className="text-sm text-calm-blue-dark text-center font-medium">{t('scanner.glycemicIndex')}</p>
                        <p className="font-bold text-lg text-calm-blue capitalize text-center">{stagedMeal.glycemicIndex}</p>
                    </div>
                    
                     <div>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200">{t('scanner.aiAdvice')}</h3>
                        <p className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mt-1">{stagedMeal.advice}</p>
                    </div>
                    <div className="pt-2">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-center mb-2">{t('scanner.customizeScore')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder={t('scanner.preMealGlucose')} value={preMealGlucose} onChange={e => setPreMealGlucose(e.target.value)} className="w-full p-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green" />
                             <input type="number" placeholder={t('scanner.postMealGlucose')} value={postMealGlucose} onChange={e => setPostMealGlucose(e.target.value)} className="w-full p-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green" />
                        </div>
                    </div>
                </div>
            )}


            {analysisState !== 'initial' && analysisState !== 'loading' && (
                <div className="flex items-center space-x-4">
                     <button onClick={handleReset} className="w-1/3 text-gray-500 dark:text-gray-400 font-semibold hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 text-center">
                        {t('scanner.cancel')}
                    </button>
                    <button
                        onClick={analysisState === 'preview' ? handleAnalyze : handleSaveMeal}
                        className="w-2/3 py-3 font-bold text-white bg-gradient-to-r from-mint-green to-calm-blue rounded-lg hover:from-mint-green-dark hover:to-calm-blue-dark transition-all duration-300 shadow-lg disabled:opacity-50"
                    >
                        {analysisState === 'preview' ? t('scanner.analyze') : t('scanner.save')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MealScanner;