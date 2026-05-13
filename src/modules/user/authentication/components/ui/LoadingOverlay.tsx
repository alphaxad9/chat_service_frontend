// src/components/TopDashedLoadingBar.tsx
import React from "react";

export interface LoadingOverlayProps {
  show: boolean;
  label?: string; // accepted but unused — for compatibility
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Content is loading"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      style={{ height: '4px' }}
    >
      {/* Animated solid bar — smooth, Gmail-style */}
      <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-80 animate-moveShine" />
    </div>
  );
};