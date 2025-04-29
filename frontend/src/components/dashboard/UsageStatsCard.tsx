import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Mock data for the chart
const data = [
  { name: 'Jan', sent: 400, delivered: 380, failed: 20 },
  { name: 'Feb', sent: 500, delivered: 470, failed: 30 },
  { name: 'Mar', sent: 600, delivered: 570, failed: 30 },
  { name: 'Apr', sent: 780, delivered: 750, failed: 30 },
  { name: 'May', sent: 900, delivered: 870, failed: 30 },
  { name: 'Jun', sent: 1100, delivered: 1050, failed: 50 },
  { name: 'Jul', sent: 1500, delivered: 1450, failed: 50 },
];

const UsageStatsCard = () => {
  // Stats for current month
  const currentMonthStats = {
    sent: 1500,
    delivered: 1450,
    failed: 50,
    deliveryRate: "96.7%"
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>
          Your notification delivery statistics over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Sent (This Month)</p>
            <p className="text-2xl font-semibold">{currentMonthStats.sent.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Delivered</p>
            <p className="text-2xl font-semibold">{currentMonthStats.delivered.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-semibold">{currentMonthStats.failed.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Delivery Rate</p>
            <p className="text-2xl font-semibold">{currentMonthStats.deliveryRate}</p>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="sent" 
                stackId="1" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.8} 
              />
              <Area 
                type="monotone" 
                dataKey="delivered" 
                stackId="2" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6} 
              />
              <Area 
                type="monotone" 
                dataKey="failed" 
                stackId="3" 
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.6} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageStatsCard;