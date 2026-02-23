'use client';

import React, { useState } from 'react';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { UploadProgress, UploadItem } from '@/components/upload/UploadProgress';
import { SessionSelector } from '@/components/sessions/SessionSelector';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { AttendanceTimeline } from '@/components/analytics/AttendanceTimeline';
import { DropOffChart } from '@/components/analytics/DropOffChart';
import { JoinDistributionChart } from '@/components/analytics/JoinDistributionChart';
import { DurationPieChart } from '@/components/analytics/DurationPieChart';
import { AttendeeTable } from '@/components/analytics/AttendeeTable';
import { MultiSessionComparison } from '@/components/analytics/MultiSessionComparison';
import { Button } from '@/components/ui/Button';
import { useSessions } from '@/hooks/useSessions';
import { useSessionAnalysis } from '@/hooks/useSessionAnalysis';
import { uploadFiles } from '@/lib/api';
import { Trash2, Upload as UploadIcon } from 'lucide-react';

export default function AttendancePage() {
  const { sessions, loading: sessionsLoading, refetch, deleteSession } = useSessions();
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const selectedSessionId = selectedSessionIds.length === 1 ? selectedSessionIds[0] : null;
  const { session } = useSessionAnalysis(selectedSessionId);

  const handleFilesSelected = async (files: File[]) => {
    setIsUploading(true);
    
    const newItems: UploadItem[] = files.map((file) => ({
      filename: file.name,
      status: 'uploading',
    }));
    
    setUploadItems(newItems);

    try {
      const results = await uploadFiles(files);
      
      const updatedItems = results.map((result) => ({
        filename: result.filename,
        status: result.status === 'processed' ? 'success' as const : 'error' as const,
        message: result.message,
      }));
      
      setUploadItems(updatedItems);
      
      setTimeout(() => {
        setUploadItems([]);
        refetch();
      }, 3000);
    } catch (error) {
      const errorItems = newItems.map((item) => ({
        ...item,
        status: 'error' as const,
        message: error instanceof Error ? error.message : 'Upload failed',
      }));
      setUploadItems(errorItems);
    } finally {
      setIsUploading(false);
    }
  };

  const [showUploadZone, setShowUploadZone] = useState(sessions.length === 0);

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await deleteSession(sessionId);
      setSelectedSessionIds((prev) => prev.filter((id) => id !== sessionId));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete session');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Attendance Analysis
          </h1>
          <p className="text-sm text-gray-600">
            Analyze Google Meet attendance data and track participation trends
          </p>
        </div>
        <Button
          variant={showUploadZone ? 'secondary' : 'primary'}
          onClick={() => setShowUploadZone(!showUploadZone)}
        >
          <UploadIcon className="w-4 h-4 mr-2" />
          {showUploadZone ? 'Hide Upload' : 'Upload Files'}
        </Button>
      </div>

      {showUploadZone && (
        <div>
          <FileUploadZone
            onFilesSelected={handleFilesSelected}
            disabled={isUploading}
          />
          {uploadItems.length > 0 && (
            <div className="mt-4">
              <UploadProgress items={uploadItems} />
            </div>
          )}
        </div>
      )}

      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Sessions
          </label>
          <SessionSelector
            sessions={sessions}
            selectedIds={selectedSessionIds}
            onSelectionChange={setSelectedSessionIds}
            loading={sessionsLoading}
          />
        </div>
      </div>

      <div className="space-y-6">
        {selectedSessionIds.length === 0 && (
          <div className="flex items-center justify-center h-96 bg-white border border-gray-100 rounded-xl">
            <p className="text-gray-500 text-sm">
              Select one or more sessions from the dropdown above to view analytics
            </p>
          </div>
        )}

        {selectedSessionIds.length === 1 && session && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {session.session_name || session.filename}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(session.session_datetime || session.upload_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteSession(session.session_id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>

            <SummaryCards summary={session.summary} />
            <AttendanceTimeline timeline={session.analysis.timeline} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DropOffChart exitDistribution={session.analysis.exit_distribution} />
              <JoinDistributionChart joinDistribution={session.analysis.join_distribution} />
            </div>
            
            <DurationPieChart durationBuckets={session.analysis.duration_buckets} />
            <AttendeeTable attendees={session.analysis.attendees} />
          </>
        )}

        {selectedSessionIds.length > 1 && (
          <MultiSessionComparison sessionIds={selectedSessionIds} />
        )}
      </div>
    </div>
  );
}
