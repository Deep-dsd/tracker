'use client';

import React, { useEffect, useState } from 'react';
import { SessionDocument } from '@/types/session';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { getSession } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';

interface MultiSessionComparisonProps {
  sessionIds: string[];
}

export function MultiSessionComparison({ sessionIds }: MultiSessionComparisonProps) {
  const [sessions, setSessions] = useState<SessionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const promises = sessionIds.map((id) => getSession(id));
        const results = await Promise.all(promises);
        setSessions(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    if (sessionIds.length > 0) {
      fetchSessions();
    }
  }, [sessionIds]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-red-600 text-sm">{error}</p>
      </Card>
    );
  }

  const attendanceTrendData = sessions.map((session, idx) => ({
    name: `Session ${idx + 1}`,
    filename: session.filename.substring(0, 20),
    attendees: session.summary.total_attendees,
    avgDuration: Math.round(session.summary.avg_duration_minutes),
    dropOff: parseFloat(session.summary.drop_off_rate.toFixed(1)),
    completionRate: session.summary.total_attendees > 0
      ? parseFloat(((session.summary.full_session_count / session.summary.total_attendees) * 100).toFixed(1))
      : 0,
  }));

  const retentionData = sessions.map((session, idx) => {
    const completed = session.analysis.attendees.filter((a) => a.status === 'completed').length;
    const leftEarly = session.analysis.attendees.filter((a) => a.status === 'left_early').length;
    const brief = session.analysis.attendees.filter((a) => a.status === 'briefly_joined').length;
    
    return {
      name: `Session ${idx + 1}`,
      filename: session.filename.substring(0, 20),
      completed,
      leftEarly,
      brief,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Multi-Session Comparison
        </h2>
        <p className="text-sm text-gray-500">
          {sessions.length} sessions selected
        </p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Attendance Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={attendanceTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="attendees"
              stroke="#4f46e5"
              strokeWidth={2}
              name="Total Attendees"
            />
            <Line
              type="monotone"
              dataKey="avgDuration"
              stroke="#06b6d4"
              strokeWidth={2}
              name="Avg Duration (min)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Completion vs Drop-off Rates
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={attendanceTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value ?? 0}%`, '']}
            />
            <Legend />
            <Bar dataKey="completionRate" fill="#10b981" name="Completion Rate (%)" />
            <Bar dataKey="dropOff" fill="#ef4444" name="Drop-off Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Retention Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={retentionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
            <Bar dataKey="leftEarly" stackId="a" fill="#f59e0b" name="Left Early" />
            <Bar dataKey="brief" stackId="a" fill="#ef4444" name="Brief Join" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Summary Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                  Session
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                  Attendees
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                  Avg Duration
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                  Completion %
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                  Drop-off %
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const completionRate = session.summary.total_attendees > 0
                  ? ((session.summary.full_session_count / session.summary.total_attendees) * 100).toFixed(1)
                  : '0.0';
                
                return (
                  <tr key={session.session_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {session.filename}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {session.summary.total_attendees}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {Math.round(session.summary.avg_duration_minutes)} min
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {completionRate}%
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {session.summary.drop_off_rate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
