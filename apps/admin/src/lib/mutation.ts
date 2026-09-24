'use client';

import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Écriture sur l'API : notification de succès et rafraîchissement des
 * données concernées. Les erreurs sont notifiées globalement (providers.tsx),
 * sauf les 422, affichées sur les champs.
 */
export function useApiMutation<TVariables, TResult>(options: {
  mutationFn: (variables: TVariables) => Promise<TResult>;
  invalidate: QueryKey[];
  success?: string | ((result: TResult) => string);
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: async (result) => {
      await Promise.all(options.invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      if (options.success) {
        toast.success(typeof options.success === 'function' ? options.success(result) : options.success);
      }
    },
  });
}
