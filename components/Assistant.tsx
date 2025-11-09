import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage, Meal, GlucoseReading } from '../types';
import { useAuth, useLanguage } from '../App';
import { SendIcon, SparklesIcon, SearchIcon } from './icons/Icons';

type WebSource = { web: { uri: string; title?: string } };

const Assistant: React.FC = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const chatRef = useRef<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat');

    // State for Search functionality
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ text: string; sources: WebSource[] } | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    useEffect(() => {
        const initChat = () => {
            try {
                const apiKey = process.env.API_KEY;
                if (!apiKey) {
                    throw new Error("API_KEY is not configured.");
                }
                const ai = new GoogleGenAI({ apiKey });
                
                const systemInstruction = t('assistant.systemPrompt', {
                    name: user?.name,
                    program: user?.trackingProgram
                });

                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction },
                });

                setMessages([{
                    role: 'model',
                    text: t('assistant.welcomeMessage', { name: user?.name.split(' ')[0] })
                }]);
            } catch (error) {
                console.error("Failed to initialize AI Assistant:", error);
                setMessages([{
                    role: 'model',
                    text: t('assistant.initError')
                }]);
            }
        };

        if (user && !chatRef.current) {
            initChat();
        }
    }, [user, t]);
    
    useEffect(() => {
        if(activeTab === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    const handleSendMessage = async (prompt?: string) => {
        const messageText = (prompt || input).trim();
        if (!messageText || !chatRef.current || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const storedMeals = localStorage.getItem('gluco-meals');
            const storedReadings = localStorage.getItem('gluco-readings');
            const meals: Meal[] = storedMeals ? JSON.parse(storedMeals) : [];
            const readings: GlucoseReading[] = storedReadings ? JSON.parse(storedReadings) : [];

            const recentMeals = meals.slice(0, 3).map(m => ({ 
                name: m.name, 
                score: m.glycemicScore, 
                carbs: m.carbohydrates,
                timestamp: m.timestamp 
            }));
            const recentReadings = readings.slice(0, 5).map(r => ({
                value: r.value,
                timestamp: r.timestamp
            }));

            const mealsContext = recentMeals.length > 0 ? JSON.stringify(recentMeals) : 'none';
            const readingsContext = recentReadings.length > 0 ? JSON.stringify(recentReadings) : 'none';

            const contextString = t('assistant.dataContextPrompt', {
                meals: mealsContext,
                readings: readingsContext
            });

            const fullPrompt = `${contextString}\n\nUser question: "${messageText}"`;

            const result = await chatRef.current.sendMessageStream({ message: fullPrompt });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            for await (const chunk of result) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1].role === 'model') {
                   newMessages[newMessages.length - 1].text = t('assistant.errorMessage');
                } else {
                   newMessages.push({ role: 'model', text: t('assistant.errorMessage') });
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResults(null);
        setSearchError(null);

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error("API_KEY is not configured.");
            const ai = new GoogleGenAI({ apiKey });
            
            const prompt = t('assistant.search.searchPrompt', {
                query: searchQuery,
                language: language === 'fr' ? 'français' : 'English'
            });

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            const sources: WebSource[] = [];
            if (Array.isArray(groundingChunks)) {
                const webSources = groundingChunks.filter(
                    (chunk): chunk is WebSource => {
                        const anyChunk = chunk as any;
                        return !!anyChunk?.web?.uri && typeof anyChunk.web.uri === 'string';
                    }
                );
                sources.push(...webSources);
            }

            setSearchResults({
                text: response.text,
                sources: sources
            });

        } catch (error) {
            console.error("Health resource search failed:", error);
            setSearchError(t('assistant.search.searchError'));
        } finally {
            setIsSearching(false);
        }
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    };
    
    const TabButton: React.FC<{ tabId: 'chat' | 'search'; label: string; }> = ({ tabId, label }) => (
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

    const QuickActionButton: React.FC<{ text: string }> = ({ text }) => (
        <button
            onClick={() => handleSendMessage(text)}
            disabled={isLoading}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
            {text}
        </button>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)]">
            <header className="p-4 text-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="inline-flex items-center space-x-2">
                    <SparklesIcon className="h-6 w-6 text-soft-violet" />
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('assistant.title')}</h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('assistant.subtitle')}</p>
            </header>

            <nav className="flex justify-around border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <TabButton tabId="chat" label={t('assistant.tabChat')} />
                <TabButton tabId="search" label={t('assistant.tabSearch')} />
            </nav>

            {activeTab === 'chat' ? (
                <>
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl whitespace-pre-wrap ${
                                    msg.role === 'user' 
                                        ? 'bg-mint-green text-white rounded-br-none' 
                                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                                }`}>
                                    {msg.text}
                                    {isLoading && msg.role === 'model' && index === messages.length -1 && (
                                        <span className="inline-block w-1 h-4 bg-gray-600 dark:bg-gray-300 animate-pulse ml-1"></span>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {messages.length <= 1 && (
                        <div className="p-4 pt-0 flex-shrink-0">
                             <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">{t('assistant.quickActionsTitle')}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <QuickActionButton text={t('assistant.quickAction1')} />
                                <QuickActionButton text={t('assistant.quickAction2')} />
                                <QuickActionButton text={t('assistant.quickAction3')} />
                            </div>
                        </div>
                    )}
                    
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                        <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t('assistant.placeholder')}
                                disabled={isLoading}
                                className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-mint-green"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="p-3 bg-mint-green text-white rounded-full disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-mint-green-dark transition-colors"
                            >
                                <SendIcon className="h-6 w-6" />
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-grow overflow-y-auto p-4 space-y-6">
                     <section className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md">
                        <h2 className="text-lg font-bold text-mint-green mb-3">{t('assistant.search.searchTitle')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('assistant.search.searchSubtitle')}</p>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={t('assistant.search.searchPlaceholder')}
                                className="w-full p-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green"
                                disabled={isSearching}
                            />
                            <button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="bg-mint-green text-white p-2 rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors">
                                {isSearching ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <SearchIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {searchError && <p className="text-red-500 text-sm mt-2">{searchError}</p>}
                        {searchResults && (
                            <div className="mt-4 space-y-3 animate-fade-in">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{searchResults.text}</p>
                                {searchResults.sources.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{t('assistant.search.sources')}</h4>
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                            {searchResults.sources.map((source, index) => (
                                                <li key={index} className="text-sm">
                                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-calm-blue hover:underline">
                                                        {source.web.title || new URL(source.web.uri).hostname}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default Assistant;