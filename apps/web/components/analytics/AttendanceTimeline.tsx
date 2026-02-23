import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimelinePoint } from '@/types/session';
import { Card } from '@/components/ui/Card';

interface AttendanceTimelineProps {
  timeline: TimelinePoint[];
}

export function AttendanceTimeline({ timeline }: AttendanceTimelineProps) {
  const peak = Math.max(...timeline.map((t) => t.count));
  const peakMinute = timeline.find((t) => t.count === peak)?.minute || 0;

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Attendance Timeline
        </h3>
        <p className="text-sm text-gray-500">
          Peak attendance: <span className="font-medium text-gray-900">{peak} people</span> at minute {peakMinute}
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={timeline}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="minute"
            label={{ value: 'Minutes', position: 'insideBottom', offset: -5 }}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            label={{ value: 'Attendees', angle: -90, position: 'insideLeft' }}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value) => [value ?? 0, 'Attendees']}
            labelFormatter={(minute) => `Minute ${minute}`}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ fill: '#4f46e5', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
