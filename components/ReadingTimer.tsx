'use client';

import { Clock } from 'lucide-react';
import React from 'react';

interface ReadingTimerProps {
  seconds: number;
}

export function ReadingTimer({ seconds }: ReadingTimerProps) {
  // Format the seconds into a MM:SS string
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
      <Clock className="h-4 w-4" />
      <span>Time spent: {formattedTime}</span>
    </div>
  );
}