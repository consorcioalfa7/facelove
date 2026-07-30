'use client';

import { useEffect, useState, useCallback } from 'react';

interface SWRegistrationState {
  supported: boolean;
  registered: boolean;
  controller: ServiceWorkerController | null;
  error: string | null;
}

interface ServiceWorkerController {
  state: string;
}

// Initialize state with defaults
const initialState: SWRegistrationState = {
  supported: false,
  registered: false,
  controller: null,
  error: null,
};

export function PWARegisterSW() {
  const [swState, setSwState] = useState<SWRegistrationState>(initialState);

  const registerServiceWorker = useCallback(async () => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service workers not supported');
      return;
    }

    setSwState((prev) => ({ ...prev, supported: true }));

    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[PWA] Service Worker registered successfully:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          console.log('[PWA] Service Worker state:', newWorker.state);
          
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available - could show update notification here
            console.log('[PWA] New version available! Refresh to update.');
          }
        });
      });

      // Track controller changes - use event handler pattern
      if (registration.active) {
        setSwState((prev) => ({
          ...prev,
          registered: true,
          controller: { state: registration.active.state },
        }));
      }

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      setSwState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
    }
  }, []);

  // Set up event listeners for controller changes and messages
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Listen for controller change (new SW took control)
    const handleControllerChange = () => {
      console.log('[PWA] New controller activated');
      setSwState((prev) => ({
        ...prev,
        controller: { state: navigator.serviceWorker.controller?.state || 'unknown' },
      }));
    };

    // Handle messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('[PWA] Cache updated:', event.data.url);
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Register after page load for better performance
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      const handleLoad = () => registerServiceWorker();
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [registerServiceWorker]);

  // This component doesn't render anything visible
  // It's purely for service worker registration
  return null;
}

// Hook for checking SW status in other components
export function useServiceWorkerStatus() {
  const [status, setStatus] = useState<SWRegistrationState>(initialState);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          setStatus({
            supported: true,
            registered: true,
            controller: registration.active ? { state: registration.active.state } : null,
            error: null,
          });
        } else {
          setStatus((prev) => ({ ...prev, supported: true }));
        }
      });
    }
  }, []);

  return status;
}

export default PWARegisterSW;
