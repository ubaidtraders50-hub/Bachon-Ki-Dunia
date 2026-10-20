import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'light' | 'dark' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showTagline = true,
  showText = true,
  className = '',
}) => {
  const isLight = variant === 'light' || variant === 'white';
  const [imageError, setImageError] = useState(false);

  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-32 sm:h-32',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px] sm:text-xs',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm sm:text-base',
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Official Brand Logo Image */}
      <div
        className={`${iconSizes[size]} relative rounded-full overflow-hidden flex-shrink-0 bg-white shadow-xs group-hover:shadow-md transition-all duration-300 group-hover:scale-105 border-2 border-amber-300/80 p-0.5`}
      >
        {!imageError ? (
          <img
            src="/logo.jpg"
            alt="Bachon Ki Dunia Logo"
            className="w-full h-full object-cover rounded-full"
            onError={() => setImageError(true)}
          />
        ) : (
          /* SVG Fallback */
          <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-900 font-black text-xs">
            BKD
          </div>
        )}
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-black tracking-tight font-['Outfit'] ${titleSizes[size]} ${
                isLight ? 'text-white' : 'text-slate-950'
              }`}
            >
              Bachon <span className="text-amber-500">Ki</span> Dunia
            </span>
          </div>
          {showTagline && (
            <span
              className={`font-semibold tracking-wide font-['Plus_Jakarta_Sans'] ${taglineSizes[size]} ${
                isLight ? 'text-amber-300' : 'text-slate-500'
              }`}
            >
              Little Clothes, Big Smiles!
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
