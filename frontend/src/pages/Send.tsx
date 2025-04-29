import React from 'react';
import NotificationSender from '@/components/notifications/NotificationSender';

const Send = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Send Notification</h1>
        <p className="text-muted-foreground">
          Create and send notifications to your users
        </p>
      </div>
      
      <NotificationSender />
    </div>
  );
};

export default Send;
