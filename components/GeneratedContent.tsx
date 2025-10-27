import React, { useState } from 'react';
import { FilmIcon, SparklesIcon, CopyIcon, CheckIcon, SaveIcon } from './Icons';
import type { PromptSet } from '../types';

interface GeneratedContentProps {
  image: string | null;
  promptSets: PromptSet[] | null;
  isLoading: boolean;
}

const SkeletonLoader: React.FC = () => (
    <div className="w-full animate-pulse flex flex-col gap-4">
        <div className="aspect-square bg-slate-700 rounded-lg"></div>
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
    </div>
);


export const GeneratedContent: React.FC<GeneratedContentProps> = ({ 
    image, 
    promptSets,
    isLoading
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  const handleSaveImage = () => {
    if (image) {
        const link = document.createElement('a');
        link.href = image;
        link.download = `ai-product-shot-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };
  
  const promptSet = promptSets?.[0];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 min-h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-300">Kết quả từ AI</h3>
        {image && (
            <button
                onClick={handleSaveImage}
                className="flex items-center gap-1.5 px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded-lg border-b-2 border-slate-800 hover:bg-slate-600 transition-all transform active:translate-y-0.5"
            >
                <SaveIcon />
                <span>Lưu ảnh</span>
            </button>
        )}
      </div>
        {isLoading ? (
            <SkeletonLoader />
        ) : image && promptSet ? (
            <div className="space-y-4">
                <img src={image} alt="Generated content" className="w-full object-contain rounded-lg shadow-lg" />
                
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
                    <div>
                        <h4 className="font-semibold text-blue-400 flex items-center gap-2"><SparklesIcon /> Lời thoại</h4>
                        <p className="text-slate-300 mt-2 text-sm md:text-base">{promptSet.description}</p>
                    </div>

                    {promptSet.animationPrompt && (() => {
                      const formattedPrompt = JSON.stringify(promptSet.animationPrompt, null, 2);
                      return (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-purple-400 flex items-center gap-2"><FilmIcon /> Prompt Chuyển động</h4>
                                <button 
                                    onClick={() => handleCopy(formattedPrompt)}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded-lg border-b-2 border-slate-800 hover:bg-slate-600 transition-all transform active:translate-y-0.5 disabled:bg-green-600 disabled:border-green-800 disabled:text-white"
                                    disabled={copied}
                                >
                                    {copied ? <CheckIcon /> : <CopyIcon />}
                                    <span>{copied ? 'Đã chép!' : 'Sao chép'}</span>
                                </button>
                            </div>
                            <pre className="text-slate-300 text-xs md:text-sm whitespace-pre-wrap font-sans bg-slate-900 p-3 rounded">{formattedPrompt}</pre>
                        </div>
                      )
                    })()}
                </div>
            </div>
        ) : (
            <div className="text-center text-slate-500 flex flex-col items-center justify-center h-full flex-grow">
                <SparklesIcon className="w-12 h-12" />
                <p className="mt-2">Kết quả của bạn sẽ xuất hiện ở đây.</p>
            </div>
        )}
    </div>
  );
};