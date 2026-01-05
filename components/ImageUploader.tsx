import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageFile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageUploaderProps {
  label: string;
  subLabel?: string;
  image: ImageFile | null;
  onImageChange: (image: ImageFile | null) => void;
  id: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  subLabel,
  image,
  onImageChange,
  id,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange({
        file,
        previewUrl: result, // result is a data URL
        base64: result,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <label className="text-sm font-semibold text-zinc-300">
        {label}
      </label>
      
      <div
        className={`relative flex-1 min-h-[200px] border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out group 
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10' 
            : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
          }
          ${image ? 'border-none p-0 overflow-hidden' : 'p-4'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !image && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept="image/*"
          className="hidden"
          id={id}
        />

        {image ? (
          <div className="relative w-full h-full min-h-[200px]">
            <img
              src={image.previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
               <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 cursor-pointer">
            <div className={`p-4 rounded-full bg-zinc-800 mb-3 group-hover:bg-zinc-700 transition-colors ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : ''}`}>
              <Upload size={24} />
            </div>
            <p className="text-sm font-medium text-zinc-400">{t.dragDrop}</p>
            {subLabel && <p className="text-xs text-zinc-600 mt-1 text-center max-w-[80%]">{subLabel}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;