import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function initials(name: string): string {
  const words = name.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Avatar d'un compte (/uploads/users/…, servi par Symfony) ; initiales à
 * défaut d'image ou si elle ne se charge pas.
 */
export function UserAvatar({ user, size }: { user: { avatar: string | null; fullName: string | null; email: string }; size?: 'sm' | 'default' | 'lg' }) {
  const name = user.fullName || user.email;

  return (
    <Avatar size={size}>
      {user.avatar && <AvatarImage src={user.avatar} alt="" />}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
