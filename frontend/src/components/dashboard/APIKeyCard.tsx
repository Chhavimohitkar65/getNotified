import React, { useState, useEffect } from 'react';
import { Copy, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { userApi } from '@/lib/api';

const APIKeyCard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const { toast } = useToast();
  
  // Fetch API key on component mount
  useEffect(() => {
    fetchApiKey();
  }, []);
  
  const fetchApiKey = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAPIKey();
      if (response.data) {
        setApiKey(response.data.api_key || '');
      } else if (response.error) {
        toast({
          title: 'Error fetching API key',
          description: response.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch API key. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  const copyToClipboard = () => {
    if (!apiKey) return;
    
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API key copied",
      description: "The API key has been copied to your clipboard.",
      duration: 3000,
    });
  };
  
  const regenerateKey = async () => {
    if (regenerating) return;
    
    setRegenerating(true);
    try {
      const response = await userApi.regenerateAPIKey();
      if (response.data) {
        setApiKey(response.data.api_key);
        toast({
          title: "API key regenerated",
          description: "A new API key has been generated. The old key is no longer valid.",
          duration: 5000,
        });
      } else if (response.error) {
        toast({
          title: 'Error regenerating API key',
          description: response.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to regenerate API key. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setRegenerating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>API Key</CardTitle>
        <CardDescription>
          Use this API key to authenticate your requests to the Get Notified API
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="bg-muted p-4 rounded-md flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading API key...</span>
          </div>
        ) : (
          <div className="bg-muted p-4 rounded-md flex items-center justify-between">
            <code className="text-sm font-mono overflow-auto">
              {apiKey && isVisible ? apiKey : "••••••••••••••••••••••••••••••••"}
            </code>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVisibility}
                aria-label={isVisible ? "Hide API key" : "Show API key"}
                disabled={!apiKey}
              >
                {isVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                aria-label="Copy API key"
                disabled={!apiKey}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={regenerateKey}
          disabled={regenerating || loading}
        >
          {regenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            "Regenerate API Key"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default APIKeyCard;
