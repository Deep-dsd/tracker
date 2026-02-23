import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { JoinCategory } from '@/types/session';
import { Card } from '@/components/ui/Card';

interface JoinDistributionChartProps {
  joinDistribution: JoinCategory[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export function JoinDistributionChart({ joinDistribution }: JoinDistributionChartProps) {
  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Join Distribution</h3>
        <p className="text-sm text-gray-500">
          When attendees joined relative to session start
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={joinDistribution}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
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
            formatter={(value) => [value ?? 0, 'Attendees']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {joinDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
