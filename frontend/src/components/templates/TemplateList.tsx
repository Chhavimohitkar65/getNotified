import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { templateApi } from '@/lib/api';
import type { Template } from '@/lib/api';

// Template interface already imported from '@/lib/api'

const TemplateList = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const response = await templateApi.list();
        if (response.error) {
          setError(response.error);
          toast({
            title: 'Error',
            description: response.error,
            variant: 'destructive',
          });
        } else if (response.data) {
          // Type check the response data
          if (Array.isArray(response.data)) {
            setTemplates(response.data as Template[]);
            setError(null);
          } else {
            setError('Invalid data format received from server');
          }
        }
      } catch (err) {
        setError('Failed to fetch templates');
        toast({
          title: 'Error',
          description: 'Failed to fetch templates',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  const handleDeleteTemplate = async (id: number) => {
    try {
      const response = await templateApi.delete(id);
      
      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      } else {
        setTemplates(templates.filter(template => template.id !== id));
        toast({
          title: 'Template deleted',
          description: 'The template has been deleted successfully.',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      // Create a new template based on the existing one
      const templateData = {
        name: `${template.name} (Copy)`,
        description: template.description,
        subject: template.subject,
        channel: template.channel,
        content: template.content,
      };
      
      const response = await templateApi.create(templateData);
      
      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      } else if (response.data) {
        // Refresh templates list
        const listResponse = await templateApi.list();
        if (listResponse.data) {
          if (Array.isArray(listResponse.data)) {
            setTemplates(listResponse.data as Template[]);
          }
        }
        
        toast({
          title: 'Template duplicated',
          description: 'A copy of the template has been created.',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate template',
        variant: 'destructive',
      });
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Notification Templates</CardTitle>
          <CardDescription>Manage your notification templates</CardDescription>
        </div>
        <Button asChild>
          <Link to="/templates/new">
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
              <h3 className="mt-2 text-lg font-semibold">Loading templates...</h3>
              <p className="text-muted-foreground">Please wait</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-destructive">⚠️</div>
              <h3 className="mt-2 text-lg font-semibold">Error loading templates</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-lg font-semibold">No templates found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Create your first template to get started"}
              </p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Link
                      to={`/templates/${template.id}`}
                      className="font-medium hover:underline"
                    >
                      {template.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <span className="uppercase tracking-wide bg-secondary px-2 py-0.5 rounded text-xs font-medium">
                        {template.channel}
                      </span>
                      <span className="mx-2">•</span>
                      <span>Updated {new Date(template.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/templates/${template.id}`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateList;