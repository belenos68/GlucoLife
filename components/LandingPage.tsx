
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../App';

const FeatureCard: React.FC<{ title: string, description: string, icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-mint-green text-white mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    
    useEffect(() => {
        if(user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-mint-green-light to-calm-blue">
            <div className="container mx-auto max-w-lg px-4 py-8 text-white text-center">
                <header className="py-16">
                    <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">GlucoLife</h1>
                    <p className="text-xl mb-8 font-light">{t('landing.subtitle')}</p>
                    <button 
                        onClick={() => navigate('/auth')}
                        className="bg-white text-mint-green font-bold py-3 px-8 rounded-full shadow-xl transform hover:scale-105 transition-transform duration-300 ease-in-out"
                    >
                        {t('landing.cta')}
                    </button>
                </header>

                <section className="py-12">
                    <h2 className="text-3xl font-bold mb-10">{t('landing.discoverTitle')}</h2>
                    <div className="grid grid-cols-1 gap-8">
                        <FeatureCard 
                            title={t('landing.feature1Title')}
                            description={t('landing.feature1Desc')}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        />
                         <FeatureCard 
                            title={t('landing.feature2Title')}
                            description={t('landing.feature2Desc')}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        />
                         <FeatureCard 
                            title={t('landing.feature3Title')}
                            description={t('landing.feature3Desc')}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
                        />
                    </div>
                </section>
                 <footer className="py-8 text-white/70">
                    <p>{t('landing.footer', { year: new Date().getFullYear() })}</p>
                    <p className="text-xs text-white/70 mt-4 px-4">{t('dashboard.disclaimer')}</p>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
