import React from 'react';

export function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
      </div>
      <div className="text-sm text-gray-500">
        {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </header>
  );
}
