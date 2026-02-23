'use client';

import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export interface UploadItem {
  filename: string;
  status: 'uploading' | 'success' | 'error';
  message?: string;
}

interface UploadProgressProps {
  items: UploadItem[];
}

export function UploadProgress({ items }: UploadProgressProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={`${item.filename}-${index}`}
          className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {item.status === 'uploading' && (
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin flex-shrink-0" />
            )}
            {item.status === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            )}
            {item.status === 'error' && (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.filename}
              </p>
              {item.message && (
                <p className="text-xs text-gray-500 mt-0.5">{item.message}</p>
              )}
            </div>
          </div>
          
          <div className="ml-4">
            {item.status === 'uploading' && (
              <span className="text-xs text-gray-500">Processing...</span>
            )}
            {item.status === 'success' && (
              <span className="text-xs text-green-600">Complete</span>
            )}
            {item.status === 'error' && (
              <span className="text-xs text-red-600">Failed</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
