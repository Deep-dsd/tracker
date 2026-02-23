'use client';

import React, { useState, useMemo } from 'react';
import { AttendeeData } from '@/types/session';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, ArrowUpDown } from 'lucide-react';

interface AttendeeTableProps {
  attendees: AttendeeData[];
}

type SortKey = 'name' | 'duration_minutes' | 'joined' | 'exited';
type SortOrder = 'asc' | 'desc';

export function AttendeeTable({ attendees }: AttendeeTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('duration_minutes');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...attendees];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [attendees, searchQuery, sortKey, sortOrder]);

  const getStatusBadge = (status: AttendeeData['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'left_early':
        return <Badge variant="warning">Left Early</Badge>;
      case 'briefly_joined':
        return <Badge variant="error">Brief</Badge>;
    }
  };

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendee Details</h3>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th
                className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th
                className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('duration_minutes')}
              >
                <div className="flex items-center gap-1">
                  Duration
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('joined')}
              >
                <div className="flex items-center gap-1">
                  Joined
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('exited')}
              >
                <div className="flex items-center gap-1">
                  Exited
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No attendees match your search' : 'No attendees'}
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((attendee, index) => (
                <tr
                  key={`${attendee.email}-${index}`}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {attendee.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{attendee.email}</td>
                  <td className="py-3 px-4 text-gray-900">
                    {Math.round(attendee.duration_minutes)} min
                  </td>
                  <td className="py-3 px-4 text-gray-600">{attendee.joined}</td>
                  <td className="py-3 px-4 text-gray-600">{attendee.exited}</td>
                  <td className="py-3 px-4">{getStatusBadge(attendee.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Showing {filteredAndSorted.length} of {attendees.length} attendees
      </div>
    </Card>
  );
}
