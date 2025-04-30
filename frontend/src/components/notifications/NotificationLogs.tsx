import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Badge } from '@/components/ui/badge';
import { notificationApi } from '@/lib/api';
import type { Notification } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const statusColorMap: Record<string, string> = {
  queued: 'bg-yellow-400 hover:bg-yellow-600',
  sent: 'bg-blue-400 hover:bg-blue-600',
  delivered: 'bg-green-500 hover:bg-green-700',
  failed: 'bg-red-500 hover:bg-red-700',
};

const NotificationLogs: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use a try-catch to handle connection errors better
      const response = await notificationApi.list(page, pageSize);
      
      if (response.error) {
        console.error('Error fetching notifications:', response.error);
        setError(response.error);
        toast({
          title: 'Error',
          description: 'Failed to load notifications. Please try again.',
          variant: 'destructive',
        });
      } else if (response.data) {
        // Successfully fetched data
        if (Array.isArray(response.data)) {
          // Response is directly an array
          setNotifications(response.data);
          setTotalPages(Math.max(1, Math.ceil(response.data.length / pageSize)));
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Response is an object with a data property containing the array
          setNotifications(response.data.data);
          
          // Use the total_pages from the response if available
          if (typeof response.data.total_pages === 'number') {
            setTotalPages(response.data.total_pages);
          } else {
            // Otherwise calculate from total items
            const total = response.data.total || response.data.data.length;
            setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
          }
        } else {
          // Empty or unexpected response
          console.warn('Unexpected data format:', response.data);
          setNotifications([]);
          setTotalPages(1);
          setError('No notifications available');
        }
      } else {
        // Empty response
        setNotifications([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Exception when fetching notifications:', err);
      const errorMessage = err instanceof Error ? err.message : 'Server connection error';
      setError(errorMessage);
      toast({
        title: 'Connection Error',
        description: 'Could not connect to notification service. Please ensure the server is running.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Define fetchNotifications inside useEffect to ensure all dependencies are captured
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use a try-catch to handle connection errors better
        const response = await notificationApi.list(page, pageSize);
        
        if (response.error) {
          console.error('Error fetching notifications:', response.error);
          setError(response.error);
          toast({
            title: 'Error',
            description: 'Failed to load notifications. Please try again.',
            variant: 'destructive',
          });
        } else if (response.data) {
          // Successfully fetched data
          if (Array.isArray(response.data)) {
            // Response is directly an array
            setNotifications(response.data);
            setTotalPages(Math.max(1, Math.ceil(response.data.length / pageSize)));
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // Response is an object with a data property containing the array
            setNotifications(response.data.data);
            
            // Use the total_pages from the response if available
            if (typeof response.data.total_pages === 'number') {
              setTotalPages(response.data.total_pages);
            } else {
              // Otherwise calculate from total items
              const total = response.data.total || response.data.data.length;
              setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
            }
          } else {
            // Empty or unexpected response
            console.warn('Unexpected data format:', response.data);
            setNotifications([]);
            setTotalPages(1);
            setError('No notifications available');
          }
        } else {
          // Empty response
          setNotifications([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Exception when fetching notifications:', err);
        const errorMessage = err instanceof Error ? err.message : 'Server connection error';
        setError(errorMessage);
        toast({
          title: 'Connection Error',
          description: 'Could not connect to notification service. Please ensure the server is running.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
  }, [page, pageSize, statusFilter, toast]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1); // Reset to first page when filter changes
  };

  const filteredNotifications = statusFilter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Notification Logs</h2>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading notifications...</span>
        </div>
      ) : error ? (
        <div className="h-96 flex flex-col items-center justify-center text-center">
          <div className="text-destructive text-xl mb-2">⚠️ Error loading notifications</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchNotifications}>Try Again</Button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center text-center">
          <div className="text-xl mb-2">No notifications found</div>
          <p className="text-muted-foreground">
            {statusFilter !== 'all' 
              ? `No ${statusFilter} notifications exist.` 
              : 'No notifications have been sent yet.'}
          </p>
        </div>
      ) : (
        <>
          <Table>
            <TableCaption>A list of your recent notifications</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">{notification.id}</TableCell>
                  <TableCell>{notification.template_id}</TableCell>
                  <TableCell>{notification.recipient}</TableCell>
                  <TableCell>
                    <Badge className={statusColorMap[notification.status] || 'bg-gray-500'}>
                      {notification.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="uppercase text-xs">{notification.channel}</TableCell>
                  <TableCell>
                    {notification.sent_at 
                      ? format(new Date(notification.sent_at), 'MMM dd, yyyy HH:mm')
                      : 'Not sent yet'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => page > 1 && handlePageChange(page - 1)}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={`page-${i + 1}`}>
                  <PaginationLink
                    onClick={() => handlePageChange(i + 1)}
                    isActive={page === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => page < totalPages && handlePageChange(page + 1)}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
};

export default NotificationLogs;
