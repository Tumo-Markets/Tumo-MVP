'use client';

import { useEffect, useState } from 'react';
import { Wifi, Battery } from 'lucide-react';

export default function MobileSafeArea() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-8 py-3 text-sm font-semibold text-black dark:text-white relative z-10">
      {/* Left side - Time */}
      <div>{currentTime}</div>

      {/* Right side - Status icons */}
      <div className="flex items-center gap-1.5">
        {/* Signal strength bars */}
        <div className="flex items-end gap-0.5 h-3">
          <div className="w-[3px] h-[40%] bg-current rounded-sm" />
          <div className="w-[3px] h-[60%] bg-current rounded-sm" />
          <div className="w-[3px] h-[80%] bg-current rounded-sm" />
          <div className="w-[3px] h-full bg-current rounded-sm" />
        </div>

        {/* WiFi */}
        <Wifi size={14} strokeWidth={2.5} />

        {/* Battery with percentage */}
        <div className="flex items-center gap-1">
          <Battery size={20} strokeWidth={2} />
          <span className="text-xs">200%</span>
        </div>
      </div>
    </div>
  );
}
