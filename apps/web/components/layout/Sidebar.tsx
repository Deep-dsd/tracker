'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, Calendar, Settings } from 'lucide-react';

const navItems = [
  {
    label: 'Attendance Analysis',
    href: '/dashboard/attendance',
    icon: BarChart3,
    active: true,
  },
  {
    label: 'Student Management',
    href: '/dashboard/students',
    icon: Users,
    active: false,
  },
  {
    label: 'Schedule',
    href: '/dashboard/schedule',
    icon: Calendar,
    active: false,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    active: false,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Attendance Tracker</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          const isDisabled = !item.active;
          
          if (isDisabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed"
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100 text-xs text-gray-500">
        v1.0.0
      </div>
    </aside>
  );
}
