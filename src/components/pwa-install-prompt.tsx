'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Download, Heart, Sparkles } from 'lucide-react';

// Types for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  /** Delay in ms before showing the prompt (default: 3000) */
  delay?: number;
  /** Number of sessions before showing again after dismissal (default: 7) */
  sessionThreshold?: number;
  /** Custom className for the container */
  className?: string;
}

type PromptState = 'hidden' | 'visible' | 'installing' | 'installed' | 'dismissed';

const STORAGE_KEY = 'facelove-pwa-install';
const DISMISSED_KEY = 'facelove-pwa-dismissed';
const SESSION_COUNT_KEY = 'facelove-pwa-sessions';

// Helper functions outside component
function getIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function getIsIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function getDismissalStatus(sessionThreshold: number): boolean {
  if (typeof window === 'undefined') return false;
  
  const dismissed = localStorage.getItem(DISMISSED_KEY);
  if (dismissed) {
    const { timestamp } = JSON.parse(dismissed);
    const sessionsSinceDismissal = parseInt(localStorage.getItem(SESSION_COUNT_KEY) || '0', 10);
    
    // Show again after threshold sessions
    if (sessionsSinceDismissal >= sessionThreshold) {
      localStorage.removeItem(DISMISSED_KEY);
      localStorage.removeItem(SESSION_COUNT_KEY);
      return false;
    }
    
    // Check if dismissed within last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (timestamp > thirtyDaysAgo) {
      return true;
    }
    
    localStorage.removeItem(DISMISSED_KEY);
  }
  return false;
}

function incrementSessionCount(): void {
  if (typeof window === 'undefined') return;
  const currentCount = parseInt(localStorage.getItem(SESSION_COUNT_KEY) || '0', 10);
  localStorage.setItem(SESSION_COUNT_KEY, (currentCount + 1).toString());
}

export function PWAInstallPrompt({
  delay = 3000,
  sessionThreshold = 7,
  className = '',
}: PWAInstallPromptProps) {
  const [promptState, setPromptState] = useState<PromptState>('hidden');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS] = useState(() => getIsIOS());
  const [isInStandaloneMode] = useState(() => getIsStandalone());
  
  // Use ref to track if we should show the prompt
  const shouldShowPrompt = useRef(false);

  // Handle install prompt
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    setPromptState('installing');
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setPromptState('installed');
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
          installed: true, 
          date: new Date().toISOString() 
        }));
      } else {
        setPromptState('dismissed');
      }
    } catch (error) {
      console.error('[PWA Install] Error during install:', error);
      setPromptState('visible');
    }
    
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setPromptState('dismissed');
    localStorage.setItem(DISMISSED_KEY, JSON.stringify({
      timestamp: Date.now(),
      count: 0,
    }));
    localStorage.setItem(SESSION_COUNT_KEY, '0');
  }, []);

  // Set up event listeners
  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (isInStandaloneMode || getDismissalStatus(sessionThreshold)) {
      return;
    }

    incrementSessionCount();

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after delay using state update in event handler
      setTimeout(() => {
        setPromptState('visible');
      }, delay);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS devices, show instructions after delay
    if (isIOS && !isInStandaloneMode) {
      setTimeout(() => {
        setPromptState('visible');
      }, delay + 1000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [delay, isIOS, isInStandaloneMode, sessionThreshold]);

  // Listen for successful installation
  useEffect(() => {
    const handler = () => {
      setPromptState('installed');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        installed: true, 
        date: new Date().toISOString() 
      }));
    };

    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  // Don't render if hidden, installed, or dismissed
  if (promptState === 'hidden' || promptState === 'installed' || promptState === 'dismissed') {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-5 duration-500 ${className}`}
      style={{
        animationFillMode: 'both',
      }}
    >
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl border"
        style={{
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-5 pt-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Instalar FaceLove
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </h3>
              <p className="text-sm text-white/80">Leve suas histórias para qualquer lugar</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-white/90 mb-4 leading-relaxed">
            Instale o FaceLove no seu dispositivo para acesso rápido offline, 
            notificações de novas histórias e uma experiência completa.
          </p>

          {/* Features list */}
          <ul className="space-y-2 mb-5 text-sm text-white/90">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
              Acesso rápido sem navegador
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
              Leia histórias offline
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
              Ícone na tela inicial
            </li>
          </ul>

          {/* Install button or iOS instructions */}
          {isIOS ? (
            <div
              className="rounded-xl p-4 text-sm text-white"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            >
              <p className="font-medium mb-2">Como instalar no iOS:</p>
              <ol className="space-y-1.5 text-white/90">
                <li>1. Toque no botão <strong>Compartilhar</strong> (📤)</li>
                <li>2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                <li>3. Toque em <strong>"Adicionar"</strong></li>
              </ol>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              disabled={promptState === 'installing'}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                color: '#ec4899',
              }}
            >
              {promptState === 'installing' ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Instalando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Instalar Aplicativo
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for programmatic PWA install control
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => getIsStandalone());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[usePWAInstall] Error:', error);
      return false;
    }
  };

  return { canInstall, isInstalled, install };
}

export default PWAInstallPrompt;
