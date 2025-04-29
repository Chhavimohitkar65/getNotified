import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Bell, Phone, Check } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Channel } from '@/lib/channel';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

const emailSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  apiKey: z.string().min(1, 'API key is required'),
  fromEmail: z.string().email('Must be a valid email address'),
  fromName: z.string().min(1, 'From name is required'),
  enabled: z.boolean(),
});

interface ChannelSettingsProps {
  onSave: (success: boolean) => Promise<void>;
  existingChannel?: Channel;
  userMode?: boolean;
}

const ChannelSettings = ({ onSave, existingChannel, userMode = false }: ChannelSettingsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      provider: 'resend',
      apiKey: '',
      fromEmail: '',
      fromName: '',
      enabled: true,
    },
  });

  useEffect(() => {
    // Initialize form with existing channel data if provided
    if (existingChannel && existingChannel.type === 'email') {
      const config = existingChannel.config;
      if (typeof config === 'object' && 'provider' in config) {
        form.reset({
          provider: typeof config.provider === 'string' ? config.provider : 'resend',
          apiKey: typeof config.api_key === 'string' ? config.api_key : '',
          fromEmail: typeof config.from_email === 'string' ? config.from_email : '',
          fromName: typeof config.from_name === 'string' ? config.from_name : '',
          enabled: typeof config.is_default === 'boolean' ? config.is_default : true,
        });
      }
    }
  }, [existingChannel, form]);

  const onSubmit = async (values: z.infer<typeof emailSchema>) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would send the data to your backend
      console.log('Email configuration:', values);
      
      // Prepare channel data for the backend
      const channelData: {
        name: string;
        type: string;
        config: Record<string, unknown>;
        is_active: boolean;
      } = {
        name: `${values.provider} Email Channel`,
        type: 'email',
        config: {
          provider: values.provider,
          api_key: values.apiKey,
          from_email: values.fromEmail,
          from_name: values.fromName,
          is_default: values.enabled
        },
        is_active: values.enabled
      };
      
      // Log the channel data that would be sent to the backend
      console.log('Channel data for backend:', channelData);
      
      toast({
        title: 'Channel settings saved',
        description: 'Your email channel has been configured',
      });
      
      // Call the onSave prop with success=true when form submission succeeds
      await onSave(true);
    } catch (error) {
      console.error('Error saving channel settings:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save settings',
        description: 'An error occurred while saving your channel settings',
      });
      
      // Notify parent component of failure
      await onSave(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Settings</CardTitle>
        <CardDescription>
          Configure your notification delivery channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </TabsTrigger>
            <TabsTrigger value="sms" disabled className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>SMS</span>
            </TabsTrigger>
            <TabsTrigger value="push" disabled className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Push</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" disabled className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>WhatsApp</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Email Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                      Set up your email provider to send notifications
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormLabel>Enabled</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="resend">Resend</SelectItem>
                            <SelectItem value="mailersend">Mailersend</SelectItem>
                            <SelectItem value="sendgrid">SendGrid</SelectItem>
                            <SelectItem value="mailgun">Mailgun</SelectItem>
                            <SelectItem value="ses">Amazon SES</SelectItem>
                            <SelectItem value="smtp">Custom SMTP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select your preferred email service provider. Resend is currently used by the system.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your API key" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The API key for your email service provider
                        </FormDescription>
                        {form.watch('provider') === 'resend' && (
                          <Alert className="mt-2 bg-blue-50">
                            <Mail className="h-4 w-4" />
                            <AlertTitle>Resend Configuration</AlertTitle>
                            <AlertDescription>
                              Make sure to also set up your domain in the Resend dashboard and verify it.
                              You can get your API key from the Resend dashboard.
                            </AlertDescription>
                          </Alert>
                        )}
                        {form.watch('provider') === 'mailersend' && (
                          <Alert className="mt-2 bg-indigo-50">
                            <Mail className="h-4 w-4" />
                            <AlertTitle>Mailersend Configuration</AlertTitle>
                            <AlertDescription>
                              You'll need to create a Mailersend account, set up a domain, and generate an API token
                              with email sending permissions.
                            </AlertDescription>
                          </Alert>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="notifications@yourcompany.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The email address notifications will be sent from
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your Company Name" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The name that will appear in the sender field
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Verify your domain</AlertTitle>
                  <AlertDescription>
                    For better deliverability, we recommend verifying your sending domain
                    with your email provider.
                  </AlertDescription>
                </Alert>
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="sms">
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="mt-4 text-lg font-medium">SMS Coming Soon</h3>
              <p className="text-muted-foreground mt-1">
                SMS notifications will be available in a future update.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="push">
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="mt-4 text-lg font-medium">Push Coming Soon</h3>
              <p className="text-muted-foreground mt-1">
                Push notifications will be available in a future update.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="whatsapp">
            <div className="text-center py-12">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="mt-4 text-lg font-medium">WhatsApp Coming Soon</h3>
              <p className="text-muted-foreground mt-1">
                WhatsApp notifications will be available in a future update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t bg-muted/40 flex justify-between">
        <div>
          <h4 className="font-medium">Need more channels?</h4>
          <p className="text-sm text-muted-foreground">
            We're constantly adding new notification channels
          </p>
        </div>
        <Button variant="outline">
          Request a channel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChannelSettings;
