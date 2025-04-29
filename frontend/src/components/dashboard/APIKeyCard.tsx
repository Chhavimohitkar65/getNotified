import React, { useState } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const APIKeyCard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  
  // Mock API key
  const apiKey = "gn_21f8ba9d5e834c7ab12345678901234";
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API key copied",
      description: "The API key has been copied to your clipboard.",
      duration: 3000,
    });
  };
  
  const regenerateKey = () => {
    // In a real app, this would call an API to generate a new key
    toast({
      title: "API key regenerated",
      description: "A new API key has been generated. The old key is no longer valid.",
      duration: 5000,
    });
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
        <div className="bg-muted p-4 rounded-md flex items-center justify-between">
          <code className="text-sm font-mono">
            {isVisible ? apiKey : "••••••••••••••••••••••••••••••••"}
          </code>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide API key" : "Show API key"}
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
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={regenerateKey}>
          Regenerate API Key
        </Button>
      </CardFooter>
    </Card>
  );
};

export default APIKeyCard;
