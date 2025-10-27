
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader.tsx';
import { GeneratedContent } from './components/GeneratedContent.tsx';
import { WandIcon } from './components/Icons.tsx';
import { generateAllContent } from './services/geminiService.ts';
import type { ImageData, GeneratedResult } from './types.ts';

const OptionGroup: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
    <div className="flex flex-col items-center gap-2">
        <label className="block text-sm font-medium text-slate-400">{label}</label>
        <div className="flex items-center gap-3 flex-wrap justify-center">{children}</div>
    </div>
);

const OptionButton: React.FC<{selected: boolean, onClick: () => void, children: React.ReactNode}> = ({selected, onClick, children}) => (
    <button 
        onClick={onClick}
        className={`px-6 py-3 text-lg rounded-lg font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transform active:translate-y-0.5 ${
            selected 
            ? 'bg-blue-600 text-white border-b-4 border-blue-800 shadow-xl' 
            : 'bg-slate-700 text-slate-300 border-b-4 border-slate-800 hover:bg-slate-600 shadow-lg'
        }`}
    >
        {children}
    </button>
);


const App: React.FC = () => {
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [productImage, setProductImage] = useState<ImageData | null>(null);
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [voice, setVoice] = useState<'male' | 'female'>('female');
  const [region, setRegion] = useState<'south' | 'north'>('south');
  const [numberOfResults, setNumberOfResults] = useState<number>(1);
  const [outfitSuggestion, setOutfitSuggestion] = useState<string>('');
  const [backgroundSuggestion, setBackgroundSuggestion] = useState<string>('');
  const [productInfo, setProductInfo] = useState<string>('');


  const handleGenerateContent = useCallback(async () => {
    if (!modelImage || !productImage) {
      setError('Vui lòng tải lên cả ảnh người mẫu và ảnh sản phẩm.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const generatedResults = await generateAllContent(
        modelImage.base64, 
        productImage.base64,
        aspectRatio,
        voice,
        region,
        numberOfResults,
        outfitSuggestion,
        backgroundSuggestion,
        productInfo
      );
      setResults(generatedResults.map((res, index) => ({...res, id: `result-${index}-${Date.now()}`})));
    } catch (err) {
      setError(err instanceof Error ? `Đã xảy ra lỗi: ${err.message}` : 'Đã xảy ra lỗi không xác định.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [modelImage, productImage, aspectRatio, voice, region, numberOfResults, outfitSuggestion, backgroundSuggestion, productInfo]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 lg:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-4xl lg:text-5xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Affiliate Shorts Video - By. </span>
            <span className="text-yellow-400">Huỳnh Xuyên Sơn</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Ứng dụng tạo ảnh sản phẩm và Prompt quảng cáo thích hợp cho bán hàng Tiktok và Facebook.
          </p>
        </header>

        <main className="flex flex-col gap-8 w-full">
          {/* AI Options */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
              <OptionGroup label="Tỷ lệ ảnh">
                  <OptionButton selected={aspectRatio === '9:16'} onClick={() => setAspectRatio('9:16')}>9:16</OptionButton>
                  <OptionButton selected={aspectRatio === '16:9'} onClick={() => setAspectRatio('16:9')}>16:9</OptionButton>
              </OptionGroup>
              <OptionGroup label="Giọng đọc thoại">
                  <OptionButton selected={voice === 'female'} onClick={() => setVoice('female')}>Nữ</OptionButton>
                  <OptionButton selected={voice === 'male'} onClick={() => setVoice('male')}>Nam</OptionButton>
              </OptionGroup>
              <OptionGroup label="Vùng miền">
                  <OptionButton selected={region === 'south'} onClick={() => setRegion('south')}>Miền Nam</OptionButton>
                  <OptionButton selected={region === 'north'} onClick={() => setRegion('north')}>Miền Bắc</OptionButton>
              </OptionGroup>
              <OptionGroup label="Số lượng kết quả">
                  {[1, 2, 3, 4].map(num => (
                    <OptionButton key={num} selected={numberOfResults === num} onClick={() => setNumberOfResults(num)}>{num}</OptionButton>
                  ))}
              </OptionGroup>
          </div>
          
          <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
              {/* Creative Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                      <label htmlFor="outfit-suggestion" className="block text-sm font-medium text-slate-400 mb-2">Gợi ý trang phục (không bắt buộc)</label>
                      <input 
                          type="text" 
                          id="outfit-suggestion"
                          value={outfitSuggestion}
                          onChange={(e) => setOutfitSuggestion(e.target.value)}
                          placeholder="Ví dụ: váy maxi hoa, áo sơ mi trắng..."
                          className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                  </div>
                  <div className="flex flex-col">
                      <label htmlFor="background-suggestion" className="block text-sm font-medium text-slate-400 mb-2">Gợi ý bối cảnh (không bắt buộc)</label>
                      <input 
                          type="text" 
                          id="background-suggestion"
                          value={backgroundSuggestion}
                          onChange={(e) => setBackgroundSuggestion(e.target.value)}
                          placeholder="Ví dụ: quán cà phê, bãi biển hoàng hôn..."
                          className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                  </div>
              </div>

               {/* Product Info */}
               <div className="flex flex-col">
                   <label htmlFor="product-info" className="block text-sm font-medium text-slate-400 mb-2">Thông tin sản phẩm (để tạo lời thoại hay hơn)</label>
                   <textarea
                       id="product-info"
                       value={productInfo}
                       onChange={(e) => setProductInfo(e.target.value)}
                       placeholder="Ví dụ: Son môi siêu lì, màu đỏ ruby, giữ màu 8 tiếng, chứa vitamin E..."
                       rows={6}
                       className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y"
                   />
               </div>
          </div>


          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
            <ImageUploader title="1. Tải ảnh khuôn mặt" onImageUpload={setModelImage} />
            <ImageUploader title="2. Tải ảnh sản phẩm" onImageUpload={setProductImage} />
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
             <button
                onClick={handleGenerateContent}
                disabled={!modelImage || !productImage || isLoading}
                className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg border-b-4 border-blue-800 hover:bg-blue-700 disabled:bg-slate-600 disabled:border-slate-700 disabled:cursor-not-allowed transition-all transform active:translate-y-1 disabled:transform-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
             >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                    <WandIcon />
                )}
                <span className="text-lg">{isLoading ? `Đang tạo ${numberOfResults} kết quả...` : 'Tạo Nội dung'}</span>
             </button>
          </div>

          {/* Output Section */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: numberOfResults }).map((_, index) => (
                    <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 min-h-[300px] flex flex-col justify-center">
                        <div className="w-full animate-pulse flex flex-col gap-4">
                            <div className="aspect-square bg-slate-700 rounded-lg"></div>
                            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((result) => (
                  <GeneratedContent
                      key={result.id}
                      image={result.imageUrl}
                      promptSets={result.promptSets}
                      isLoading={false}
                  />
              ))}
            </div>
          )}
          
          {!isLoading && results.length === 0 && !error && (
             <div className="text-center text-slate-500 py-16 border-2 border-dashed border-slate-700 rounded-xl">
                <p>Kết quả của bạn sẽ xuất hiện ở đây.</p>
            </div>
          )}
        </main>
        
        {error && (
            <div className="mt-4 w-full max-w-3xl mx-auto p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-center">
                <p>{error}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;