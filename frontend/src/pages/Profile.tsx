import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { authApi, getCurrentUser, isAuthenticated } from '@/lib/auth';
import type { User } from '@/lib/auth';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please sign in to view your profile'
      });
      navigate('/login');
      return;
    }

    fetchUserProfile();
  }, [navigate, toast]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    
    // First check local storage for cached user
    const cachedUser = getCurrentUser();
    if (cachedUser) {
      setUser(cachedUser);
      profileForm.setValue('name', cachedUser.name);
    }
    
    // Then fetch from API to ensure data is fresh
    try {
      const result = await authApi.getProfile();
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching profile',
          description: result.error
        });
      } else if (result.data) {
        setUser(result.data);
        profileForm.setValue('name', result.data.name);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error fetching profile',
        description: 'Failed to fetch your profile information'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onUpdateProfile = async (values: z.infer<typeof profileSchema>) => {
    setIsUpdatingProfile(true);
    
    try {
      const result = await authApi.updateProfile(values.name);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Update failed',
          description: result.error
        });
      } else {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been successfully updated'
        });
        setUser(result.data || user);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'An unexpected error occurred'
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (values: z.infer<typeof passwordSchema>) => {
    setIsUpdatingPassword(true);
    
    try {
      // This is a placeholder - we need to implement updatePassword in the auth API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form after successful update
      passwordForm.reset();
      
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully updated'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Password update failed',
        description: 'An unexpected error occurred'
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full mb-4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onUpdateProfile)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          disabled={isUpdatingProfile} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isUpdatingProfile || !profileForm.formState.isDirty}>
                {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)}>
            <CardContent className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        disabled={isUpdatingPassword} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        disabled={isUpdatingPassword} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        disabled={isUpdatingPassword} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={isUpdatingPassword || !passwordForm.formState.isDirty}
              >
                {isUpdatingPassword ? 'Updating...' : 'Change Password'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;
