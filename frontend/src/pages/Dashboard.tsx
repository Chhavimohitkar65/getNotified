import React from 'react';
import APIKeyCard from '../components/dashboard/APIKeyCard';
import UsageStatsCard from '../components/dashboard/UsageStatsCard';
import QuickActions from '../components/dashboard/QuickActions';

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your notification metrics and manage your account
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <UsageStatsCard />
        </div>
        <div className="space-y-6">
          <APIKeyCard />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;