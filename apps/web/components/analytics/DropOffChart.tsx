import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ExitWindow } from '@/types/session';
import { Card } from '@/components/ui/Card';

interface DropOffChartProps {
  exitDistribution: ExitWindow[];
}

export function DropOffChart({ exitDistribution }: DropOffChartProps) {
  const maxCount = Math.max(...exitDistribution.map((e) => e.count));
  const biggestDropIdx = exitDistribution.findIndex((e) => e.count === maxCount);

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exit Distribution</h3>
        <p className="text-sm text-gray-500">
          When attendees left the session (5-minute intervals)
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={exitDistribution}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="window"
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
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
            formatter={(value) => [value ?? 0, 'Exits']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {exitDistribution.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === biggestDropIdx ? '#ef4444' : '#4f46e5'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
