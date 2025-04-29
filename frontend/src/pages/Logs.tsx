import React from 'react';
import NotificationLogs from '@/components/notifications/NotificationLogs';

const Logs = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Notification Logs</h1>
        <p className="text-muted-foreground">
          Monitor the status and delivery of your notifications
        </p>
      </div>
      
      <div className="p-6 border rounded-lg bg-card">
        <NotificationLogs />
      </div>
    </div>
  );
};

export default Logs;
