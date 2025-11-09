import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useLanguage } from '../App';
import { User } from '../types';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [view, setView] = useState<'auth' | 'forgot'>('auth');
    const [message, setMessage] = useState('');
    const [nickname, setNickname] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login } = useAuth();
    const { t } = useLanguage();

    const from = location.state?.from?.pathname || '/dashboard';
    
    useEffect(() => {
        if(user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const nameInput = form.elements.namedItem('name') as HTMLInputElement;
        const emailInput = form.elements.namedItem('email') as HTMLInputElement;
        const email = emailInput?.value || 'default@example.com';
        const name = nameInput?.value || (isLogin ? email.split('@')[0] : 'Nouveau Membre');

        let userToLogin: User = {
            name: name,
            email: email,
            avatarUrl: `https://picsum.photos/seed/${name.split(' ')[0].toLowerCase()}/200`,
            trackingProgram: 'Prévention',
            nickname: isLogin ? name.split(' ')[0] : (nickname.trim() || undefined),
        };
        
        // Check for admin user
        if (email.toLowerCase() === 'belenos.abryelos@gmail.com') {
            userToLogin.isAdmin = true;
            userToLogin.name = 'Belenos Abryelos';
            userToLogin.nickname = 'Admin';
            userToLogin.avatarUrl = `https://picsum.photos/seed/admin/200`;
        }
        
        if (!isLogin) {
            // A notification for new user registration should be sent to belenos.abryelos@gmail.com.
            // This requires a backend service to handle email sending securely without exposing credentials on the client-side.
            // For now, we'll log this event to the console as a placeholder for the backend functionality.
            console.log(`New user registered: ${userToLogin.name} (${userToLogin.email}). An email notification should be sent.`);
        }
        
        login(userToLogin);
        navigate(from, { replace: true });
    };

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(t('auth.resetLinkSent'));
    };

    if (view === 'forgot') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-green-light to-calm-blue p-4 relative">
                <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6">
                     <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('auth.forgotTitle')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">{t('auth.forgotSubtitle')}</p>
                    </div>
                    {message ? (
                        <div className="p-4 text-center bg-mint-green/10 text-mint-green-dark rounded-lg">
                            {message}
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handlePasswordReset}>
                            <div>
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block">{t('auth.email')}</label>
                                <input className="w-full p-3 mt-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-mint-green" type="email" placeholder="alex.doe@example.com" required/>
                            </div>
                            <button type="submit" className="w-full py-3 mt-6 font-bold text-white bg-gradient-to-r from-mint-green to-calm-blue rounded-lg hover:from-mint-green-dark hover:to-calm-blue-dark transition-all duration-300 shadow-lg">
                                {t('auth.sendResetLink')}
                            </button>
                        </form>
                    )}
                    <div className="text-center">
                        <button onClick={() => { setView('auth'); setMessage(''); }} className="text-sm text-gray-600 dark:text-gray-400 hover:text-mint-green transition-colors">
                           {t('auth.backToLogin')}
                        </button>
                    </div>
                </div>
                <footer className="absolute bottom-4 left-0 right-0">
                    <p className="text-center text-xs text-white/80 px-4">
                        {t('dashboard.disclaimer')}
                    </p>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-green-light to-calm-blue p-4 relative">
            <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">GlucoLife</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {!isLogin && (
                         <>
                            <div>
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block">{t('auth.name')}</label>
                                <input name="name" className="w-full p-3 mt-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-mint-green" type="text" placeholder="Alex Doe" required />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block">{t('auth.nickname')}</label>
                                <input value={nickname} onChange={e => setNickname(e.target.value)} className="w-full p-3 mt-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-mint-green" type="text" placeholder={t('auth.nicknamePlaceholder')} />
                            </div>
                         </>
                    )}
                     <div>
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block">{t('auth.email')}</label>
                        <input name="email" className="w-full p-3 mt-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-mint-green" type="email" placeholder="alex.doe@example.com" required />
                    </div>
                     <div>
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block">{t('auth.password')}</label>
                        <input name="password" className="w-full p-3 mt-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-mint-green" type="password" placeholder="********" required />
                    </div>

                    <div className="flex items-center justify-end">
                        <button type="button" onClick={() => setView('forgot')} className="text-sm text-gray-600 dark:text-gray-400 hover:text-mint-green transition-colors">
                            {t('auth.forgotPassword')}
                        </button>
                    </div>

                    <button type="submit" className="w-full py-3 mt-6 font-bold text-white bg-gradient-to-r from-mint-green to-calm-blue rounded-lg hover:from-mint-green-dark hover:to-calm-blue-dark transition-all duration-300 shadow-lg">
                        {isLogin ? t('auth.login') : t('auth.signup')}
                    </button>
                </form>

                <div className="text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-600 dark:text-gray-400 hover:text-mint-green transition-colors">
                        {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                    </button>
                </div>
            </div>
            <footer className="absolute bottom-4 left-0 right-0">
                <p className="text-center text-xs text-white/80 px-4">
                    {t('dashboard.disclaimer')}
                </p>
            </footer>
        </div>
    );
};

// Fix: Add default export for the component.
export default Auth;