'use client';

import { useState } from 'react';
import { Reply } from 'lucide-react';
import { Field } from '@/components/form/field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { api, unwrap } from '@/lib/api';
import { useApiMutation } from '@/lib/mutation';

/** Réponse de l'équipe, publiée immédiatement (CommentModeration). */
export function ReplyDialog({ commentId, authorName }: { commentId: number; authorName: string }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const reply = useApiMutation({
    mutationFn: () => unwrap(api.POST('/api/admin/comments/{id}/replies', { params: { path: { id: String(commentId) } }, body: { content } })),
    invalidate: [['comments']],
    success: 'Réponse publiée.',
  });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setContent('');
      reply.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm">
            <Reply /> Répondre
          </Button>
        }
      />
      <DialogContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            reply.mutate(undefined, { onSuccess: () => onOpenChange(false) });
          }}
        >
          <DialogHeader>
            <DialogTitle>Répondre à {authorName}</DialogTitle>
            <DialogDescription>La réponse est publiée immédiatement sous le nom de l&apos;équipe Alivaon.</DialogDescription>
          </DialogHeader>
          <Field label="Réponse" htmlFor="reply-content" error={reply.error} path="content">
            <Textarea id="reply-content" rows={6} value={content} onChange={(e) => setContent(e.target.value)} required />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={reply.isPending}>
              Publier la réponse
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
