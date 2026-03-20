'use client';

import React from 'react';

interface NoiseOverlayProps {
  /** Opacity of the noise layer (0-1), defaults to 0.03 */
  opacity?: number;
}

export const NoiseOverlay: React.FC<NoiseOverlayProps> = ({
  opacity = 0.03,
}) => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] mix-blend-difference"
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves={3}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
};
