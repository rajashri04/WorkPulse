import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base',
  };

  // Color generator based on name hash for distinct consistent avatar fallback backgrounds
  const getColorFromName = (str: string) => {
    const colors = [
      'bg-slate-700 text-slate-100',
      'bg-blue-700 text-blue-100',
      'bg-teal-700 text-teal-100',
      'bg-indigo-700 text-indigo-100',
      'bg-cyan-800 text-cyan-100',
      'bg-emerald-700 text-emerald-100',
      'bg-violet-700 text-violet-100',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (!src || imageError) {
    return (
      <div 
        className={`inline-flex items-center justify-center font-medium rounded-full shrink-0 select-none ${sizeClasses[size]} ${getColorFromName(name)} ${className}`}
        aria-label={name}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setImageError(true)}
      className={`rounded-full object-cover shrink-0 ${sizeClasses[size]} ${className}`}
    />
  );
};
