import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../App';
import { ShareIcon, XMarkIcon } from './icons/Icons';

interface ShareTipModalProps {
    isOpen: boolean;
    onClose: () => void;
    tipText: string;
}

// Canvas text wrapping function
const wrapText = (
    context: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    lineHeight: number
) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && i > 0) {
            context.fillText(line, x, currentY);
            line = words[i] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, currentY);
};

const ShareTipModal: React.FC<ShareTipModalProps> = ({ isOpen, onClose, tipText }) => {
    const { t } = useLanguage();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageBlob, setImageBlob] = useState<Blob | null>(null);

    useEffect(() => {
        if (isOpen && tipText) {
            const generateImage = async () => {
                setIsLoading(true);
                setError('');
                setImageBlob(null);

                // Delay to allow modal to render before canvas operations
                await new Promise(resolve => setTimeout(resolve, 50));

                try {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    if (!context) throw new Error('Could not get canvas context');
                    
                    const width = 1080;
                    const height = 1080;
                    const padding = 80;
                    
                    canvas.width = width;
                    canvas.height = height;

                    // Background Gradient
                    const gradient = context.createLinearGradient(0, 0, width, height);
                    gradient.addColorStop(0, '#7dd3fc'); // calm-blue-light
                    gradient.addColorStop(1, '#34d399'); // mint-green-light
                    context.fillStyle = gradient;
                    context.fillRect(0, 0, width, height);

                    // Title
                    context.fillStyle = 'white';
                    context.font = 'bold 64px sans-serif';
                    context.textAlign = 'center';
                    context.textBaseline = 'top';
                    context.fillText('GlucoLife', width / 2, padding);

                    // Subtitle
                    context.font = 'italic 36px sans-serif';
                    context.globalAlpha = 0.8;
                    context.fillText("Today's AI Tip", width / 2, padding + 70);
                    context.globalAlpha = 1.0;

                    // Tip Text
                    context.fillStyle = 'rgba(255, 255, 255, 0.95)';
                    context.font = '52px sans-serif';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    wrapText(context, `"${tipText}"`, width / 2, height / 2, width - padding * 2, 64);

                    // Watermark
                    context.fillStyle = 'rgba(255, 255, 255, 0.6)';
                    context.font = '32px sans-serif';
                    context.textAlign = 'center';
                    context.textBaseline = 'bottom';
                    context.fillText('Shared from GlucoLife App', width / 2, height - padding);
                    
                    // Assign to visible canvas for preview
                    if (canvasRef.current) {
                        const previewCtx = canvasRef.current.getContext('2d');
                        canvasRef.current.width = width;
                        canvasRef.current.height = height;
                        previewCtx?.drawImage(canvas, 0, 0);
                    }

                    canvas.toBlob((blob) => {
                        if (blob) {
                            setImageBlob(blob);
                        } else {
                            throw new Error('Canvas to Blob conversion failed');
                        }
                    }, 'image/png');

                } catch (err) {
                    console.error(err);
                    setError(t('shareTip.error'));
                } finally {
                    setIsLoading(false);
                }
            };

            generateImage();
        }
    }, [isOpen, tipText, t]);

    const handleShare = async () => {
        if (!imageBlob) return;

        const file = new File([imageBlob], 'glucolife-tip.png', { type: 'image/png' });
        const shareData = {
            title: t('dashboard.aiTipTitle'),
            text: t('shareTip.shareText'),
            files: [file],
        };

        try {
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                 const link = document.createElement('a');
                 link.href = URL.createObjectURL(imageBlob);
                 link.download = 'glucolife-tip.png';
                 link.click();
                 URL.revokeObjectURL(link.href);
            }
        } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
                console.error('Sharing failed', error);
            }
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('shareTip.title')}</h3>
                     <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {isLoading && (
                         <div className="absolute inset-0 flex flex-col justify-center items-center">
                            <svg className="animate-spin h-8 w-8 text-mint-green mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400">{t('shareTip.generating')}</p>
                        </div>
                    )}
                    {error && <p className="text-red-500 p-4 text-center">{error}</p>}
                    <canvas ref={canvasRef} className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`} />
                </div>

                <button 
                    onClick={handleShare} 
                    disabled={isLoading || !!error || !imageBlob}
                    className="w-full p-3 font-bold text-white bg-mint-green rounded-lg hover:bg-mint-green-dark transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                    <ShareIcon className="w-5 h-5" />
                    <span>{t('shareTip.share')}</span>
                </button>
            </div>
        </div>
    );
};

export default ShareTipModal;
