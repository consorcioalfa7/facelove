/**
 * Toast notification utility for FaceLove
 * Provides helper functions for common toast notifications
 */

import { toast as sonnerToast } from "sonner";

// Type for toast options
interface ToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Success notifications
export function toastSuccess(title: string, options?: ToastOptions) {
  return sonnerToast.success(title, {
    description: options?.description,
    action: options?.action,
    className: "!border-green-200 dark:!border-green-800",
    duration: 4000,
  });
}

export function toastFavoriteAdded(storyTitle: string) {
  return toastSuccess("Adicionado aos Favoritos!", {
    description: `"${storyTitle}" foi salvo em sua coleção.`,
    action: {
      label: "Ver Favoritos",
      onClick: () => window.location.assign("/favorites"),
    },
  });
}

export function toastFavoriteRemoved(storyTitle: string) {
  return sonnerToast.info("Removido dos Favoritos", {
    description: `"${storyTitle}" foi removido de sua coleção.`,
    className: "!border-amber-200 dark:!border-amber-800",
    duration: 3000,
  });
}

// Error notifications
export function toastError(title: string, options?: ToastOptions) {
  return sonnerToast.error(title, {
    description: options?.description,
    action: options?.action,
    duration: 5000,
  });
}

// Info notifications
export function toastInfo(title: string, options?: ToastOptions) {
  return sonnerToast.info(title, {
    description: options?.description,
    action: options?.action,
    duration: 3500,
  });
}

// Loading/promise notifications
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
): Promise<T> {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
}

// Story-related toasts
export function toastStoryShared(storyTitle: string) {
  return toastSuccess("História Compartilhada!", {
    description: `Link de "${storyTitle}" copiado para a área de transferência.`,
  });
}

export function toastReadingProgressSaved(progress: number) {
  return toastInfo("Progresso Salvo", {
    description: `Você leu ${progress}% desta história. Continuará de onde parou.`,
  });
}

// Newsletter toasts
export function toastNewsletterSubscribed(email: string) {
  return toastSuccess("Inscrito com Sucesso!", {
    description: `Confirmação enviada para ${email}`,
  });
}

// Generic action feedback
export function toastActionComplete(action: string) {
  return toastSuccess(`${action} Concluído`);
}
