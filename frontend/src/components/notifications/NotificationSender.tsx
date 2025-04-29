import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { templateApi, notificationApi } from '@/lib/api';
import type { Template } from '@/lib/api';

// Define the schema for our form
const notificationSchema = z.object({
  template_id: z.string().min(1, 'Template selection is required'),
  recipient: z.string().email('A valid email address is required'),
  metadata: z.string().optional(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

const NotificationSender = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      template_id: '',
      recipient: '',
      metadata: '{\n  "name": "John Doe",\n  "action_url": "https://example.com/verify"\n}',
    },
  });

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const response = await templateApi.list();
        if (response.error) {
          setError(response.error);
          toast({
            title: 'Error',
            description: `Failed to load templates: ${response.error}`,
            variant: 'destructive',
          });
        } else if (response.data && Array.isArray(response.data)) {
          setTemplates(response.data);
          setError(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load templates: ${errorMessage}`);
        toast({
          title: 'Error',
          description: 'Failed to load notification templates',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  // Handle template selection change
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    setSelectedTemplate(template || null);
    form.setValue('template_id', templateId);
  };

  // Handle form submission
  const onSubmit = async (values: NotificationFormValues) => {
    setIsSending(true);
    setError(null);
    
    try {
      // Parse metadata JSON if provided
      let metadata = {};
      if (values.metadata) {
        try {
          metadata = JSON.parse(values.metadata);
        } catch (err) {
          setError('Invalid metadata format. Please provide valid JSON.');
          toast({
            title: 'Error',
            description: 'Metadata must be valid JSON',
            variant: 'destructive',
          });
          setIsSending(false);
          return;
        }
      }
      
      // Prepare notification data
      const notificationData = {
        template_id: Number.parseInt(values.template_id, 10),
        recipient: values.recipient,
        channel: 'email', // Add the required channel field
        metadata,
      };
      
      // Send notification
      const response = await notificationApi.send(notificationData);
      
      if (response.error) {
        setError(response.error);
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Notification Sent',
          description: 'Your notification has been queued for delivery.',
        });
        
        // Reset form (except template_id)
        form.reset({
          template_id: values.template_id,
          recipient: '',
          metadata: values.metadata,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Notification</CardTitle>
        <CardDescription>
          Select a template and provide recipient details to send a notification
        </CardDescription>
        {error && <div className="text-sm text-destructive mt-2">{error}</div>}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="template_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Template</FormLabel>
                  <Select 
                    onValueChange={(value) => handleTemplateChange(value)} 
                    defaultValue={field.value}
                    disabled={isLoadingTemplates}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingTemplates ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading templates...</span>
                        </div>
                      ) : templates.length === 0 ? (
                        <div className="p-2 text-center text-muted-foreground">
                          No templates available. Create one first.
                        </div>
                      ) : (
                        templates.map((template) => (
                          <SelectItem 
                            key={template.id} 
                            value={template.id.toString()}
                          >
                            {template.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {selectedTemplate.description}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email</FormLabel>
                  <FormControl>
                    <Input placeholder="recipient@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    The email address where the notification will be sent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metadata (Template Variables)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{\n  "name": "John Doe",\n  "action_url": "https://example.com/verify"\n}'
                      className="min-h-[120px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    JSON object containing variables for the template (matches {"{{variableName}}"} in template)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTemplate && (
              <div className="rounded-md bg-muted p-4">
                <h4 className="mb-2 font-medium">Template Preview</h4>
                <div className="text-sm">
                  <div className="mb-1"><strong>Subject:</strong> {selectedTemplate.subject}</div>
                  <div className="mb-1"><strong>Channel:</strong> {selectedTemplate.channel}</div>
                  <div className="mt-2 p-3 border rounded-md bg-background whitespace-pre-wrap font-mono text-xs">
                    {selectedTemplate.content}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSending || isLoadingTemplates}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Notification'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default NotificationSender;
