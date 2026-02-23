'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SessionListItem } from '@/types/session';
import { ChevronDown, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SessionSelectorProps {
  sessions: SessionListItem[];
  selectedIds: string[];
  onSelectionChange: (sessionIds: string[]) => void;
  loading?: boolean;
}

export function SessionSelector({
  sessions,
  selectedIds,
  onSelectionChange,
  loading = false,
}: SessionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSessions = sessions.filter((s) => selectedIds.includes(s.session_id));
  const displayText = selectedSessions.length === 0
    ? 'Select sessions to analyze'
    : selectedSessions.length === 1
    ? (selectedSessions[0].session_name || selectedSessions[0].filename)
    : `${selectedSessions.length} sessions selected`;

  const handleToggle = (sessionId: string) => {
    if (selectedIds.includes(sessionId)) {
      onSelectionChange(selectedIds.filter((id) => id !== sessionId));
    } else {
      onSelectionChange([...selectedIds, sessionId]);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-12 w-full" />
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 bg-white border border-gray-100 rounded-lg">
        <p className="text-gray-500 text-sm">
          No sessions yet. Upload attendance files to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-900 truncate">{displayText}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-gray-500 px-2 py-1 font-medium">
              Select one or more sessions
            </p>
          </div>
          <div className="border-t border-gray-100">
            {sessions.map((session) => {
              const isSelected = selectedIds.includes(session.session_id);
              
              return (
                <button
                  key={session.session_id}
                  onClick={() => handleToggle(session.session_id)}
                  className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                    isSelected ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {session.session_name || session.filename}
                        </h4>
                        <Badge
                          variant={session.status === 'processed' ? 'success' : 'error'}
                          className="flex-shrink-0"
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>
                          {new Date(session.session_datetime || session.upload_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {session.status === 'processed' && (
                          <>
                            <span>•</span>
                            <span>{session.summary.total_attendees} attendees</span>
                            <span>•</span>
                            <span>{Math.round(session.summary.avg_duration_minutes)} min avg</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
