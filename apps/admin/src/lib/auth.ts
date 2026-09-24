'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, toApiError, unwrap } from './api';

export const CURRENT_USER_KEY = ['auth', 'me'] as const;

export type CurrentUser = Awaited<ReturnType<typeof fetchCurrentUser>>;

async function fetchCurrentUser() {
  return unwrap(api.GET('/api/auth/me'));
}

/** Utilisateur connecté ; `null` si pas de session (401). */
export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: async () => {
      try {
        return await fetchCurrentUser();
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          return null;
        }
        throw e;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

/** Connexion : POST /api/auth/login (hors OpenAPI, réponse = profil). */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(credentials),
      });
      const body: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw toApiError(response.status, response.status === 401 && !(body as { error?: string }).error ? { error: 'Identifiants invalides.' } : body);
      }
      return body as CurrentUser;
    },
    onSuccess: (user) => queryClient.setQueryData(CURRENT_USER_KEY, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    onSettled: () => {
      queryClient.clear();
      queryClient.setQueryData(CURRENT_USER_KEY, null);
    },
  });
}

export function isAdmin(user: CurrentUser | null | undefined): boolean {
  return !!user?.roles.includes('ROLE_ADMIN');
}
