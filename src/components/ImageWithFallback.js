"use client";

import { useState } from 'react';

export default function ImageWithFallback({ src, alt, className = '', fallbackIcon = 'sports_esports', style = {} }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={'flex items-center justify-center bg-surface-container-high ' + className} style={style}>
        <span className="material-symbols-outlined text-outline-variant opacity-40" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>{fallbackIcon}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}
