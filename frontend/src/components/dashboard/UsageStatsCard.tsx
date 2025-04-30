import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { statsApi } from '@/lib/api_stats';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const UsageStatsCard = () => {
  const [chartData, setChartData] = useState<{name: string; sent: number; delivered: number; failed: number}[]>([]);
  const [currentMonthStats, setCurrentMonthStats] = useState({
    sent: 0,
    delivered: 0,
    failed: 0,
    deliveryRate: "0%"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await statsApi.getNotificationStats();
        
        if (response.error) {
          setError(response.error);
          toast({
            title: 'Error loading stats',
            description: response.error,
            variant: 'destructive',
          });
        } else if (response.data) {
          // Update chart data
          setChartData(response.data.monthly_breakdown);
          
          // Update current month stats
          setCurrentMonthStats({
            sent: response.data.current_month.total_sent,
            delivered: response.data.current_month.total_delivered,
            failed: response.data.current_month.total_failed,
            deliveryRate: response.data.current_month.delivery_rate
          });
          
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch notification stats:', err);
        setError('Failed to load notification statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [toast]);

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
          {isLoading ? (
            <div className="flex justify-center items-center h-[230px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-[230px] text-destructive">
              <p>Error loading statistics</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  width={35}
                />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="sent" 
                  stackId="1"
                  stroke="#84cc16" 
                  fill="url(#sentGradient)" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="delivered" 
                  stackId="2"
                  stroke="#60a5fa" 
                  fill="url(#deliveredGradient)" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageStatsCard;