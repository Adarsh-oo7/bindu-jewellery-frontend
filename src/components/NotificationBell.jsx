import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';

const NotificationBell = ({ className }) => {
  const { data: countData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => api.get('/notifications/notifications/unread-count/').then(res => res.data),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = countData?.unread_count || 0;
  const { user } = useAuth();
  const isStaffRole = ['staff', 'telecaller', 'field_staff', 'custom'].includes(user?.role);
  const notificationsPath = isStaffRole ? "/staff/notifications" : "/notifications";

  return (
    <Link 
      to={notificationsPath} 
      className={cn(
        "relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted group",
        className
      )}
    >
      <Bell size={20} className="group-hover:scale-110 transition-transform" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background animate-in zoom-in">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
