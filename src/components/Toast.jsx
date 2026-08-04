import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Toast component that displays a timed feedback notification centered in the viewport.
 * Uses a two-layer approach: outer overlay for positioning (pure inline styles),
 * inner box for appearance (Tailwind classes).
 */
export default function Toast({ type = 'success', message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      text: '#166534',
      iconColor: '#22c55e',
      Icon: CheckCircle,
    },
    error: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#991b1b',
      iconColor: '#ef4444',
      Icon: AlertTriangle,
    },
    info: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#1e40af',
      iconColor: '#3b82f6',
      Icon: Info,
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const { Icon, bg, border, text, iconColor } = config;

  return (
    // Outer overlay — pure inline styles, no Tailwind classes at all
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* Inner toast box — only visual styles */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          backgroundColor: bg,
          border: `1px solid ${border}`,
          color: text,
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          pointerEvents: 'auto',
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 600,
        }}
        role="alert"
      >
        <Icon style={{ width: 20, height: 20, flexShrink: 0, color: iconColor }} />
        <span style={{ paddingRight: '8px' }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            padding: '4px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Close notification"
        >
          <X style={{ width: 16, height: 16, opacity: 0.6 }} />
        </button>
      </div>
    </div>
  );
}
