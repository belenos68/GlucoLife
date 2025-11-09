
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { User, Meal, Achievement, Goal } from './types';
import translationsData from './data/translations';
import { achievements } from './data/achievements';

import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MealScanner from './components/MealScanner';
import Assistant from './components/Assistant';
import Profile from './components/Profile';
import Share from './components/Share';
import AchievementUnlockedModal from './components/AchievementUnlockedModal';

// --- Language Context ---
type Language = 'fr' | 'en';
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  tArray: (key: string) => any[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        return (localStorage.getItem('gluco-lang') as Language) || 'fr';
    });

    const setLanguage = (lang: Language) => {
        localStorage.setItem('gluco-lang', lang);
        setLanguageState(lang);
    };

    const t = (key: string, options?: { [key: string]: string | number }): string => {
        const path = key.split('.');
        let current: any = translationsData[language];
        for (const p of path) {
            current = current?.[p];
            if (current === undefined) return key;
        }

        if (typeof current === 'string' && options) {
            return Object.entries(options).reduce(
                (acc, [optKey, optValue]) => acc.replace(`{{${optKey}}}`, String(optValue)),
                current
            );
        }
        return current || key;
    };
    
    const tArray = (key: string): any[] => {
        const path = key.split('.');
        let current: any = translationsData[language];
        for (const p of path) {
            current = current?.[p];
            if (current === undefined) return [];
        }
        return Array.isArray(current) ? current : [];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, tArray }}>
            {children}
        </LanguageContext.Provider>
    );
};

// --- Theme Context ---
export type Theme = 'light' | 'dark' | 'system';
interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        return (localStorage.getItem('gluco-theme') as Theme) || 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            root.classList.add(systemPrefersDark ? 'dark' : 'light');
        } else {
            root.classList.add(theme);
        }
    }, [theme]);
    
    const setTheme = (newTheme: Theme) => {
        localStorage.setItem('gluco-theme', newTheme);
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('gluco-user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (userData: User) => {
        localStorage.setItem('gluco-user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('gluco-user');
        setUser(null);
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem('gluco-user', JSON.stringify(updatedUser));
        }
    };
    
    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// --- AppData Context ---
interface AppDataContextType {
    streak: number;
    unlockedAchievements: string[];
    logActivity: () => void;
    newlyUnlockedAchievement: Achievement | null;
    clearNewlyUnlockedAchievement: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
    const context = useContext(AppDataContext);
    if (!context) throw new Error('useAppData must be used within an AppDataProvider');
    return context;
};

const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [streak, setStreak] = useState(0);
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
    const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);

    const checkAndUnlockAchievements = (currentStreak: number) => {
        const storedMeals = localStorage.getItem('gluco-meals');
        const meals: Meal[] = storedMeals ? JSON.parse(storedMeals) : [];
        const storedGoal = localStorage.getItem('gluco-goal');
        const goal: Goal | null = storedGoal ? JSON.parse(storedGoal) : null;
        const storedAchievements = JSON.parse(localStorage.getItem('gluco-achievements') || '[]');

        const achievementData = { meals, streak: currentStreak, goal };

        for (const achievement of achievements) {
            if (!storedAchievements.includes(achievement.id)) {
                if (achievement.criteria(achievementData)) {
                    const newUnlocked = [...storedAchievements, achievement.id];
                    localStorage.setItem('gluco-achievements', JSON.stringify(newUnlocked));
                    setUnlockedAchievements(newUnlocked);
                    setNewlyUnlockedAchievement(achievement);
                    // Only show one achievement at a time
                    break; 
                }
            }
        }
    };

    useEffect(() => {
        const storedAchievements = localStorage.getItem('gluco-achievements');
        if (storedAchievements) {
            setUnlockedAchievements(JSON.parse(storedAchievements));
        }

        const data = localStorage.getItem('gluco-app-data');
        if (data) {
            const { streak: currentStreak, lastActivityDate } = JSON.parse(data);
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 864e5).toDateString();
            let finalStreak = 0;
            if (lastActivityDate === today) {
                finalStreak = currentStreak;
            } else if (lastActivityDate === yesterday) {
                finalStreak = currentStreak;
            }
            setStreak(finalStreak);
            checkAndUnlockAchievements(finalStreak);
        }
    }, []);

    const logActivity = () => {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 864e5).toDateString();
        
        const data = localStorage.getItem('gluco-app-data');
        const appData = data ? JSON.parse(data) : { streak: 0, lastActivityDate: null };

        let newStreak = appData.streak;
        if (appData.lastActivityDate !== today) {
            if (appData.lastActivityDate === yesterday) {
                newStreak += 1; // Continue streak
            } else {
                newStreak = 1; // New streak
            }
        }
        
        setStreak(newStreak);
        localStorage.setItem('gluco-app-data', JSON.stringify({ streak: newStreak, lastActivityDate: today }));
        checkAndUnlockAchievements(newStreak);
    };
    
    const clearNewlyUnlockedAchievement = () => {
        setNewlyUnlockedAchievement(null);
    };

    return (
        <AppDataContext.Provider value={{ streak, unlockedAchievements, logActivity, newlyUnlockedAchievement, clearNewlyUnlockedAchievement }}>
            {children}
        </AppDataContext.Provider>
    );
};

// --- Favorites Context ---
interface FavoritesContextType {
    favoriteMealIds: string[];
    isFavorite: (mealId: string) => boolean;
    toggleFavorite: (mealId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
    return context;
};

const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [favoriteMealIds, setFavoriteMealIds] = useState<string[]>(() => {
        const storedFavorites = localStorage.getItem('gluco-favorites');
        return storedFavorites ? JSON.parse(storedFavorites) : [];
    });

    useEffect(() => {
        localStorage.setItem('gluco-favorites', JSON.stringify(favoriteMealIds));
    }, [favoriteMealIds]);

    const toggleFavorite = (mealId: string) => {
        setFavoriteMealIds(prevIds => {
            if (prevIds.includes(mealId)) {
                return prevIds.filter(id => id !== mealId);
            } else {
                return [...prevIds, mealId];
            }
        });
    };

    const isFavorite = (mealId: string) => {
        return favoriteMealIds.includes(mealId);
    };

    return (
        <FavoritesContext.Provider value={{ favoriteMealIds, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

// --- Routing Components ---
const ProtectedRoute = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <Layout><Outlet /></Layout>;
};

const AppWrapper: React.FC = () => {
    const { newlyUnlockedAchievement, clearNewlyUnlockedAchievement } = useAppData();
    return (
      <>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scanner" element={<MealScanner />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/share" element={<Share />} />
          </Route>
          
          <Route path="/" element={<AuthRedirector />} />
          <Route path="*" element={<AuthRedirector />} />
        </Routes>
        
        <AchievementUnlockedModal
          achievement={newlyUnlockedAchievement}
          isOpen={!!newlyUnlockedAchievement}
          onClose={clearNewlyUnlockedAchievement}
        />
      </>
    );
};

const AuthRedirector = () => {
    const { user } = useAuth();
    return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />;
};

// --- Main App Component ---
export const App = () => {
    return (
        <HashRouter>
            <LanguageProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <AppDataProvider>
                            <FavoritesProvider>
                                <AppWrapper />
                            </FavoritesProvider>
                        </AppDataProvider>
                    </AuthProvider>
                </ThemeProvider>
            </LanguageProvider>
        </HashRouter>
    );
};
