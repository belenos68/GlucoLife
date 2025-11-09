import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../App';
import { ShareIcon, XMarkIcon } from './icons/Icons';

interface ShareChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    chartContainerRef: React.RefObject<HTMLDivElement>;
}

const ShareChartModal: React.FC<ShareChartModalProps> = ({ isOpen, onClose, chartContainerRef }) => {
    const { t } = useLanguage();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageBlob, setImageBlob] = useState<Blob | null>(null);

    useEffect(() => {
        if (isOpen && chartContainerRef.current) {
            const generateImage = async () => {
                setIsLoading(true);
                setError('');
                setImageBlob(null);

                await new Promise(resolve => setTimeout(resolve, 50));

                try {
                    const sourceElement = chartContainerRef.current;
                    const svgElement = sourceElement.querySelector('svg');
                    if (!svgElement) {
                        throw new Error("Chart SVG element not found.");
                    }

                    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
                    
                    if (document.documentElement.classList.contains('dark')) {
                        svgClone.querySelectorAll('text, .recharts-text').forEach((textElement) => {
                             (textElement as SVGTextElement).style.fill = '#4a5568';
                        });
                        svgClone.querySelectorAll('.recharts-cartesian-axis-line, .recharts-cartesian-axis-tick-line, .recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line').forEach(line => {
                             (line as SVGLineElement).style.stroke = '#e0e0e0';
                        })
                    }

                    const svgString = new XMLSerializer().serializeToString(svgClone);
                    const svgUrl = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));
                    
                    const img = new Image();
                    img.src = svgUrl;

                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (!ctx) throw new Error("Could not get canvas context");

                        const width = 1080;
                        const height = 1080;
                        const padding = 80;

                        canvas.width = width;
                        canvas.height = height;

                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, width, height);

                        ctx.fillStyle = '#1f2937';
                        ctx.font = 'bold 64px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.fillText('GlucoLife', width / 2, padding);

                        ctx.font = '42px sans-serif';
                        ctx.globalAlpha = 0.8;
                        ctx.fillText(t('dashboard.historyChartTitle'), width / 2, padding + 70);
                        ctx.globalAlpha = 1.0;
                        
                        const chartAspectRatio = img.width / img.height;
                        const drawArea = {
                            x: padding,
                            y: padding + 150,
                            width: width - padding * 2,
                            height: height - padding * 2 - 230
                        };
                        let drawWidth = drawArea.width;
                        let drawHeight = drawWidth / chartAspectRatio;
                        if (drawHeight > drawArea.height) {
                            drawHeight = drawArea.height;
                            drawWidth = drawHeight * chartAspectRatio;
                        }
                        const drawX = drawArea.x + (drawArea.width - drawWidth) / 2;
                        const drawY = drawArea.y + (drawArea.height - drawHeight) / 2;
                        
                        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

                        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                        ctx.font = '32px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        ctx.fillText('Shared from GlucoLife App', width / 2, height - padding / 2);

                        if(canvasRef.current) {
                            const previewCtx = canvasRef.current.getContext('2d');
                            canvasRef.current.width = width;
                            canvasRef.current.height = height;
                            previewCtx?.drawImage(canvas, 0, 0);
                        }

                        canvas.toBlob((blob) => {
                            if (blob) setImageBlob(blob);
                        }, 'image/png');

                        URL.revokeObjectURL(svgUrl);
                        setIsLoading(false);
                    };

                    img.onerror = () => {
                        URL.revokeObjectURL(svgUrl);
                        throw new Error("Image could not be loaded from SVG data.");
                    };

                } catch (err) {
                    console.error("Failed to generate chart image:", err);
                    setError(t('shareTip.error'));
                    setIsLoading(false);
                }
            };
            generateImage();
        }
    }, [isOpen, chartContainerRef, t]);

    const handleShare = async () => {
        if (!imageBlob) return;

        const file = new File([imageBlob], 'glucolife-chart.png', { type: 'image/png' });
        const shareData = {
            title: t('dashboard.historyChartTitle'),
            text: t('shareTip.shareText'),
            files: [file],
        };

        try {
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                 const link = document.createElement('a');
                 link.href = URL.createObjectURL(imageBlob);
                 link.download = 'glucolife-chart.png';
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
                    <canvas ref={canvasRef} className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading || error ? 'opacity-0' : 'opacity-100'}`} />
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

export default ShareChartModal;
