"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bell, Check, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/patient";

interface NotificationsPageProps {
  notifications: {
    id: string;
    title: string;
    read: boolean;
    createdAt: Date;
  }[];
}

export default function NotificationsPage({ notifications }: NotificationsPageProps) {
  const [markingAll, setMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    setMarkingIds((prev) => new Set(prev).add(id));
    try {
      await markNotificationRead(id);
    } finally {
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
    } finally {
      setMarkingAll(false);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">No Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have any notifications yet. You'll be notified when your scans are reviewed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
            {unreadCount > 0 && <span className="ml-2">({unreadCount} unread)</span>}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markingAll}>
            {markingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Marking all...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Mark All as Read
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`transition-colors ${!notification.read ? "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${!notification.read ? "text-slate-900 dark:text-slate-50" : "text-slate-700 dark:text-slate-300"}`}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                {!notification.read && !markingIds.has(notification.id) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMarkRead(notification.id)}
                    disabled={markingIds.has(notification.id)}
                    aria-label="Mark as read"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </Button>
                )}
                {markingIds.has(notification.id) && (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}