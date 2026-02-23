import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DurationBucket } from '@/types/session';
import { Card } from '@/components/ui/Card';

interface DurationPieChartProps {
  durationBuckets: DurationBucket[];
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#4f46e5'];

export function DurationPieChart({ durationBuckets }: DurationPieChartProps) {
  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Duration Breakdown</h3>
        <p className="text-sm text-gray-500">
          Distribution of attendee session durations
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={durationBuckets}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="label"
          >
            {durationBuckets.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
