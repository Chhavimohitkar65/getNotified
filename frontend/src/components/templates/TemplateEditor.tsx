import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { templateApi } from '@/lib/api';
import type { Template, CreateTemplateRequest } from '@/lib/api';
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
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  channel: z.string().min(1, 'Channel is required'),
  content: z.string().min(1, 'Content is required'),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

// No props needed - we'll get the template from the API when editing

const TemplateEditor = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      subject: '',
      channel: 'email',
      content: '',
    },
  });
  
  // Fetch template data if editing
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!isEditing || !id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await templateApi.getById(Number.parseInt(id, 10));
        if (response.error) {
          setError(response.error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: `Failed to load template: ${response.error}`,
          });
        } else if (response.data) {
          const template = response.data;
          form.reset({
            name: template.name,
            description: template.description || '',
            subject: template.subject,
            channel: template.channel,
            content: template.content,
          });
        }
      } catch (err) {
        setError('Failed to load template');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'There was a problem loading the template.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [id, isEditing, form, toast]);

  const onSubmit = async (values: TemplateFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare template data
      const templateData: CreateTemplateRequest = {
        name: values.name,
        description: values.description || '',
        subject: values.subject,
        channel: values.channel,
        content: values.content,
      };
      
      // Make API call to create or update template
      const response = isEditing && id
        ? await templateApi.update(Number.parseInt(id, 10), templateData)
        : await templateApi.create(templateData);
      
      if (response.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error,
        });
        setError(response.error);
      } else {
        toast({
          title: isEditing ? 'Template updated' : 'Template created',
          description: isEditing
            ? 'Your notification template has been updated.'
            : 'Your new notification template has been created.',
        });
        navigate('/templates');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem saving your template.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Template' : 'Create Template'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update your notification template details'
            : 'Define a new notification template'}
        </CardDescription>
        {isLoading && <div className="text-sm text-muted-foreground mt-2">Loading template data...</div>}
        {error && <div className="text-sm text-destructive mt-2">{error}</div>}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Welcome Email" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique name for this template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms" disabled>SMS (Coming Soon)</SelectItem>
                        <SelectItem value="push" disabled>Push (Coming Soon)</SelectItem>
                        <SelectItem value="whatsapp" disabled>WhatsApp (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How this notification will be delivered
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional description" {...field} />
                  </FormControl>
                  <FormDescription>
                    A brief description of when this template is used
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Line</FormLabel>
                  <FormControl>
                    <Input placeholder="Email subject" {...field} />
                  </FormControl>
                  <FormDescription>
                    The subject line for email notifications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hello {{name}},\n\nWelcome to our service!"
                      className="min-h-[200px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use {"{{variableName}}"} syntax for dynamic content
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/templates')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                ? 'Update Template'
                : 'Create Template'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default TemplateEditor;