import React from 'react';
import ChannelSettings from '../components/channels/ChannelSettings';

const Settings = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">
          Configure your notification channels and account preferences
        </p>
      </div>
      
      <ChannelSettings />
    </div>
  );
};

export default Settings;
