import React from 'react';

export default function UserAvatar({ user }) {
  const name = user?.user_metadata?.full_name || user?.email || "";
  const initials = getInitials(name);

  return (
    <div className="flex items-center space-x-2">
      <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full font-bold uppercase">
        {initials}
      </div>
    </div>
  );
}

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
