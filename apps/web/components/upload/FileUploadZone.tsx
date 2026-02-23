'use client';

import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function FileUploadZone({ onFilesSelected, disabled = false }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.name.endsWith('.csv') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
    );

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [disabled, onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onFilesSelected(files);
    }
    e.target.value = '';
  }, [disabled, onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isDragging && !disabled ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 bg-gray-50'}
      `}
    >
      <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging && !disabled ? 'text-indigo-600' : 'text-gray-400'}`} />
      <p className="text-sm font-medium text-gray-900 mb-1">
        Drop attendance files here or click to browse
      </p>
      <p className="text-xs text-gray-500 mb-4">
        Supports .csv, .xlsx, .xls files
      </p>
      <label>
        <input
          type="file"
          multiple
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />
        <span
          className={`inline-block px-4 py-2 text-sm font-medium rounded-lg ${
            disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Select Files
        </span>
      </label>
    </div>
  );
}
