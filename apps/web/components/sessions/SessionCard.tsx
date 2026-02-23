'use client';

import React from 'react';
import { SessionListItem } from '@/types/session';

interface SessionCardProps {
  session: SessionListItem;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <div className="p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {session.session_name || session.filename}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(session.session_datetime || session.upload_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })} • {session.summary.total_attendees} attendees
          </p>
        </div>
      </div>
    </div>
  );
}
