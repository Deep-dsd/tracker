import React from 'react';
import { SessionSummary } from '@/types/session';
import { Card } from '@/components/ui/Card';
import { Users, Clock, CheckCircle, TrendingDown, Timer } from 'lucide-react';

interface SummaryCardsProps {
  summary: SessionSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const completionRate = summary.total_attendees > 0
    ? ((summary.full_session_count / summary.total_attendees) * 100).toFixed(1)
    : '0.0';

  const cards = [
    {
      label: 'Total Attendees',
      value: summary.total_attendees.toString(),
      icon: Users,
      color: 'text-indigo-600',
    },
    {
      label: 'Avg Duration',
      value: `${Math.round(summary.avg_duration_minutes)} min`,
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Drop-off Rate',
      value: `${summary.drop_off_rate.toFixed(1)}%`,
      icon: TrendingDown,
      color: 'text-red-600',
    },
    {
      label: 'Session Length',
      value: `${summary.session_duration_minutes} min`,
      icon: Timer,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${card.color}`} />
              <span className="text-xs text-gray-500 font-medium">
                {card.label}
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
          </Card>
        );
      })}
    </div>
  );
}
