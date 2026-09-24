'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { ApiError } from '@/lib/api';
import { CURRENT_USER_KEY } from '@/lib/auth';

/**
 * Données (TanStack Query) et notifications. Une réponse 401 en cours de
 * session (session expirée) renvoie vers la connexion ; les autres erreurs de
 * mutation s'affichent en notification, sauf les erreurs de validation (422),
 * affichées sur les champs par le formulaire concerné.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    const onError = (error: Error, client: () => QueryClient) => {
      if (error instanceof ApiError && error.status === 401) {
        client().setQueryData(CURRENT_USER_KEY, null);
      }
    };
    const client: QueryClient = new QueryClient({
      queryCache: new QueryCache({ onError: (error) => onError(error, () => client) }),
      mutationCache: new MutationCache({
        onError: (error) => {
          onError(error, () => client);
          if (!(error instanceof ApiError && (error.status === 422 || error.status === 401))) {
            toast.error(error.message);
          }
        },
      }),
      defaultOptions: {
        queries: { refetchOnWindowFocus: false, retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2 },
      },
    });
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
