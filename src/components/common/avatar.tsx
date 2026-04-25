'use client';

interface AvatarProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({
  avatarUrl,
  fullName,
  email,
  size = 'md',
}: Readonly<AvatarProps>) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  const getBackgroundColor = () => {
    const initials = getInitials();
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-green-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-indigo-500',
    ];
    const index = (initials.codePointAt(0) ?? 0) % colors.length;
    return colors[index];
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName || 'User avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-amber-400/50`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${getBackgroundColor()} rounded-full flex items-center justify-center font-semibold text-white border-2 border-amber-400/50`}
    >
      {getInitials()}
    </div>
  );
}
