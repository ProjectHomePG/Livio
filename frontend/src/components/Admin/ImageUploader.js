"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, Plus, X, Image as ImageIcon, Loader2, Star, Link as LinkIcon } from 'lucide-react';
import storageService from '@/services/storageService';

export default function ImageUploader({ images = [], onChange, maxImages = 10 }) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlBox, setShowUrlBox] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed.`);
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const url = await storageService.uploadImage(file, 'listings');
        uploadedUrls.push(url);
      }
      onChange([...images, ...uploadedUrls]);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload photo. Please verify connection.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('Please enter a valid https:// image link');
      return;
    }
    setError(null);
    onChange([...images, trimmed]);
    setUrlInput('');
    setShowUrlBox(false);
  };

  const handleRemove = (indexToRemove) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimary = (indexToPrimary) => {
    if (indexToPrimary === 0) return;
    const selected = images[indexToPrimary];
    const rest = images.filter((_, idx) => idx !== indexToPrimary);
    onChange([selected, ...rest]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Property Photos ({images.length}/{maxImages})
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            High quality photos of rooms, washrooms, and building facade increase inquiries by 3x.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlBox(!showUrlBox)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{showUrlBox ? 'Hide URL paste' : 'Paste photo URL'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </div>
      )}

      {showUrlBox && (
        <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/... or hosted image link"
            className="flex-1 bg-white dark:bg-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:bg-black transition-colors"
          >
            Add Photo
          </button>
        </div>
      )}

      {/* Grid of Image Previews */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <Image
              src={url}
              alt={`Photo ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
              unoptimized
            />

            {/* Badges & Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex justify-between items-start">
                {idx === 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    className="p-1 rounded-full bg-black/60 text-white hover:text-amber-400 hover:bg-black transition-colors"
                    title="Set as cover photo"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {idx === 0 && (
              <span className="group-hover:opacity-0 transition-opacity absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                Cover Photo
              </span>
            )}
          </div>
        ))}

        {/* Upload Trigger Tile */}
        {images.length < maxImages && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 transition-all cursor-pointer group disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Uploading...</span>
              </>
            ) : (
              <>
                <div className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40 group-hover:text-primary-600 transition-colors">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold block text-slate-700 dark:text-slate-200">Upload Photo</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
                </div>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
