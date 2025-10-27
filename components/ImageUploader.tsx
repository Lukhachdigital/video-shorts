
import React, { useState, useRef, useCallback } from 'react';
import type { ImageData } from '../types.ts';
import { UploadIcon } from './Icons.tsx';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (imageData: ImageData) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove the "data:image/...;base64," part
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      const base64 = await fileToBase64(file);
      onImageUpload({
        file: file,
        previewUrl: previewUrl,
        base64: base64,
      });
    }
  }, [onImageUpload, preview]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-blue-500 hover:bg-slate-800">
      <h3 className="text-lg font-semibold text-slate-300 mb-3">{title}</h3>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <div
        onClick={handleClick}
        className="w-full aspect-square bg-slate-900/70 rounded-lg cursor-pointer flex items-center justify-center border-2 border-dashed border-slate-600 hover:border-blue-600 transition-colors"
      >
        {preview ? (
          <img src={preview} alt="Uploaded preview" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="flex flex-col items-center text-slate-500">
            <UploadIcon />
            <p className="mt-2 text-sm">Nhấp để tải lên</p>
          </div>
        )}
      </div>
    </div>
  );
};