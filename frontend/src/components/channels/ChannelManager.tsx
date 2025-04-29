import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import ChannelSettings from './ChannelSettings';
import { channelApi } from '@/lib/channel';
import type { Channel } from '@/lib/channel';
import { isAuthenticated } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

export const ChannelManager: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please sign in to manage your notification channels'
      });
      navigate('/login');
      return;
    }

    fetchChannels();
  }, [navigate, toast]);

  const fetchChannels = async () => {
    setIsLoading(true);
    console.log('Fetching channels...');
    try {
      const result = await channelApi.list();
      console.log('Channel API response:', result);
      if (result.error) {
        console.error('Error fetching channels:', result.error);
        toast({
          variant: 'destructive',
          title: 'Error fetching channels',
          description: result.error
        });
      } else if (result.data) {
        console.log('Channels fetched successfully:', result.data);
        setChannels(result.data);
      } else {
        console.log('No channels data returned from API');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error fetching channels',
        description: 'Failed to fetch your notification channels'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChannel = async (success: boolean) => {
    if (success) {
      setIsSettingsOpen(false);
      setEditingChannel(null);
      // Add a small delay before fetching channels to ensure the backend has processed the changes
      setTimeout(() => {
        fetchChannels();
        console.log('Refreshing channels list after save');
      }, 500);
    }
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;

    try {
      const result = await channelApi.delete(channelToDelete.id);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error deleting channel',
          description: result.error
        });
      } else {
        toast({
          title: 'Channel deleted',
          description: 'The notification channel has been deleted successfully'
        });
        await fetchChannels();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error deleting channel',
        description: 'Failed to delete the notification channel'
      });
    } finally {
      setDeleteDialogOpen(false);
      setChannelToDelete(null);
    }
  };

  const confirmDelete = (channel: Channel) => {
    setChannelToDelete(channel);
    setDeleteDialogOpen(true);
  };

  const getChannelTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return 'Mail';
      case 'sms':
        return 'MessageSquare';
      case 'push':
        return 'Bell';
      case 'whatsapp':
        return 'MessageCircle';
      default:
        return 'Bell';
    }
  };

  const getChannelTypeBadge = (type: string) => {
    const colorMap: Record<string, string> = {
      email: 'bg-blue-100 text-blue-800',
      sms: 'bg-green-100 text-green-800',
      push: 'bg-purple-100 text-purple-800',
      whatsapp: 'bg-emerald-100 text-emerald-800'
    };

    return (
      <Badge 
        className={`mr-2 ${colorMap[type] || 'bg-gray-100 text-gray-800'}`}
      >
        {type.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Notification Channels</h2>
        </div>
        {[1, 2, 3].map((n) => (
          <Card key={n} className="w-full mb-4">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24 mr-2" />
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notification Channels</h2>
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingChannel(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] mx-auto my-auto">
            <DialogHeader>
              <DialogTitle>{editingChannel ? 'Edit Channel' : 'Add New Channel'}</DialogTitle>
              <DialogDescription>
                Configure your notification channel settings here. This information will be used to send notifications.
              </DialogDescription>
            </DialogHeader>
            <ChannelSettings 
              onSave={handleSaveChannel} 
              existingChannel={editingChannel}
              userMode={true}
            />
          </DialogContent>
        </Dialog>
      </div>

      {channels.length === 0 ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>No channels configured</CardTitle>
            <CardDescription>
              You don't have any notification channels yet. Add a channel to start sending notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notification channels allow you to send messages via different methods like email, SMS, etc.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setIsSettingsOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Channel
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <Card key={channel.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{channel.name}</CardTitle>
                  {getChannelTypeBadge(channel.type)}
                </div>
                <CardDescription>
                  {channel.is_active ? 'Active' : 'Inactive'} • Created {new Date(channel.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="font-semibold">Provider:</div>
                  <div className="text-muted-foreground mb-2">
                    {typeof channel.config === 'object' && 'provider' in channel.config
                      ? String(channel.config.provider)
                      : 'Not specified'}
                  </div>
                  
                  <div className="font-semibold">From:</div>
                  <div className="text-muted-foreground mb-2">
                    {channel.type === 'email' && typeof channel.config === 'object' && 'from_email' in channel.config
                      ? String(channel.config.from_email)
                      : channel.type === 'sms' && typeof channel.config === 'object' && 'from_number' in channel.config
                        ? String(channel.config.from_number)
                        : 'Not configured'
                    }
                  </div>
                  
                  {typeof channel.config === 'object' && 'is_default' in channel.config && channel.config.is_default && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Default {channel.type} channel
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditingChannel(channel);
                    setIsSettingsOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => confirmDelete(channel)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the channel "{channelToDelete?.name}". Any notifications configured to use this channel may fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChannel}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChannelManager;
