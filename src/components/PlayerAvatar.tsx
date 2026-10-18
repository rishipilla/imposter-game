/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PlayerAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  highlight?: boolean;
  isImposterGlitch?: boolean;
  subtext?: string;
  showLabel?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  size = 'md',
  highlight = false,
  isImposterGlitch = false,
  subtext,
  showLabel = true,
}) => {
  const getInitials = (str: string) => {
    const trimmed = str.trim();
    if (!trimmed) return '?';
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm font-semibold',
    lg: 'w-20 h-20 text-xl font-bold',
    xl: 'w-28 h-28 text-3xl font-extrabold',
  };

  const initials = getInitials(name);

  return (
    <div className="flex flex-col items-center select-none text-center">
      <div
        className={`relative ${sizeClasses[size]} rounded-2xl flex items-center justify-center transition-all duration-200 ${
          highlight
            ? 'bg-zinc-100 text-zinc-950 ring-2 ring-white ring-offset-2 ring-offset-zinc-950 shadow-lg shadow-white/10 scale-105 font-bold'
            : isImposterGlitch
            ? 'bg-zinc-800 text-white ring-2 ring-zinc-400 animate-pulse'
            : 'bg-zinc-900 text-zinc-200 border border-zinc-700/80 hover:border-zinc-500'
        }`}
      >
        <span>{initials}</span>
      </div>

      {showLabel && name && (
        <div className="mt-1.5">
          <p className="text-sm font-medium text-zinc-200 truncate max-w-[120px]">
            {name}
          </p>
          {subtext && (
            <p className="text-[11px] text-zinc-400 font-mono truncate max-w-[120px]">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
