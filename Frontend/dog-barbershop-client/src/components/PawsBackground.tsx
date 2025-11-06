import React from 'react';

interface PawsBackgroundProps {
  backgroundColor: string; // e.g., '#E8F5E9' for green, '#FFD79B' for orange
  patternColor: string;   // e.g., '#C8E6C9' for green, '#E07A5F' for orange
}

export const PawsBackground: React.FC<PawsBackgroundProps> = ({ backgroundColor, patternColor }) => {
  // Convert hex to rgba for opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const patternColor20 = hexToRgba(patternColor, 0.20);
  const patternColor12 = hexToRgba(patternColor, 0.12);

  return (
    <div className="fixed inset-0 -z-10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          {/* Paw icon (group) */}
          <g id="icon-paw-bg">
            {/* pad */}
            <circle cx="0" cy="6" r="10" fill={patternColor20} />
            {/* toes */}
            <circle cx="-10" cy="-4" r="5" fill={patternColor12} />
            <circle cx="10" cy="-4" r="5" fill={patternColor12} />
            <circle cx="-3" cy="-10" r="5" fill={patternColor12} />
            <circle cx="3" cy="-10" r="5" fill={patternColor12} />
          </g>

          {/* Bone icon */}
          <g id="icon-bone-bg" fill={patternColor12}>
            <path d="M-40,-6
                     c-6,-10 -24,-10 -30,0
                     c-10,6 -10,24 0,30
                     c6,10 24,10 30,0
                     l20,0
                     c6,10 24,10 30,0
                     c10,-6 10,-24 0,-30
                     c-6,-10 -24,-10 -30,0
                     z" />
          </g>

          {/* Seamless pattern tile 200x200 */}
          <pattern id="bb-pattern-bg" patternUnits="userSpaceOnUse" width="200" height="200">
            {/* base */}
            <rect width="200" height="200" fill={backgroundColor} />
            {/* scatter paws and bones */}
            <use href="#icon-paw-bg" x="40" y="50" transform="rotate(-10 40 50)" />
            <use href="#icon-paw-bg" x="150" y="80" transform="rotate(20 150 80) scale(0.9)" />
            <use href="#icon-paw-bg" x="90" y="150" transform="rotate(-35 90 150) scale(1.1)" />

            <use href="#icon-bone-bg" x="60" y="120" transform="rotate(25 60 120) scale(0.8)" />
            <use href="#icon-bone-bg" x="160" y="30" transform="rotate(-15 160 30) scale(0.7)" />
            <use href="#icon-bone-bg" x="120" y="170" transform="rotate(8 120 170) scale(0.9)" />
          </pattern>
        </defs>

        {/* Fill the whole artboard with the seamless pattern */}
        <rect x="0" y="0" width="100%" height="100%" fill="url(#bb-pattern-bg)" />
      </svg>
    </div>
  );
};

