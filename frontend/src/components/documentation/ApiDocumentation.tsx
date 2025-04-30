import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, Book, Code, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ApiDocumentation = () => {
  const [documentation, setDocumentation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, you would fetch this from an API endpoint
        // For now, we'll use the document content as a string
        const apiDocContent = `# GetNotified API Documentation

## API Key Usage Guide

This documentation explains how to use the GetNotified API with your API keys to send notifications through various channels.

### Introduction

GetNotified provides a powerful notification system that allows you to send emails and other types of notifications through a simple API. This document will guide you through the process of obtaining, configuring, and using your API keys.

### API Key Overview

When you create a channel in GetNotified, you'll receive an API key that authenticates your requests. These keys are specific to each channel type (email, SMS, etc.) and should be kept secure.

### How to Obtain an API Key

1. **Register an account** on GetNotified platform
2. **Navigate to Settings** and select "Channels"
3. **Create a new channel** or select an existing one
4. **Configure the channel** with the required credentials (e.g., email provider details)
5. **Save the channel** to generate your API key

### Authentication

All API requests require authentication using either:
- JWT token (for web application users)
- API key (for server-to-server integration)

Add your API key to the request header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

### Sending Notifications

#### Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/api/v1/notifications\` | Send a notification |
| GET | \`/api/v1/notifications\` | Get a list of sent notifications |
| GET | \`/api/v1/notifications/:id\` | Get details of a specific notification |

#### Request Schema

When sending a notification, use the following JSON structure:

\`\`\`json
{
  "recipient": "user@example.com",
  "subject": "Your Notification Subject",
  "content": "Your notification content or HTML",
  "channel": "email",
  "template_id": 123,     // Optional: use a predefined template
  "variables": {          // Optional: variables to replace in template
    "name": "John Doe",
    "action_url": "https://example.com/action"
  }
}
\`\`\`

#### Response Schema

A successful notification request will return:

\`\`\`json
{
  "id": 456,
  "status": "queued",
  "message": "Notification queued successfully"
}
\`\`\``;

        // Set the documentation content
        setDocumentation(apiDocContent);
        setError(null);
      } catch (err) {
        console.error('Failed to load documentation:', err);
        setError('Failed to load documentation. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentation();
  }, []);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  // These are code blocks that we'll render with copy functionality
  const pythonExample = `import requests
import json

def send_notification(api_key, recipient, subject, content):
    url = "https://your-getnotified-instance.com/api/v1/notifications"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "recipient": recipient,
        "subject": subject,
        "content": content,
        "channel": "email"
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    return response.json()

# Example usage
api_key = "your_api_key_here"
recipient = "user@example.com"
subject = "Important Notification"
content = "<h1>Hello!</h1><p>This is an important notification.</p>"

result = send_notification(api_key, recipient, subject, content)
print(result)`;

  const goExample = `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type NotificationRequest struct {
	Recipient string            \`json:"recipient"\`
	Subject   string            \`json:"subject"\`
	Content   string            \`json:"content"\`
	Channel   string            \`json:"channel"\`
	Variables map[string]string \`json:"variables,omitempty"\`
}

func sendNotification(apiKey, recipient, subject, content string) (map[string]interface{}, error) {
	requestBody := NotificationRequest{
		Recipient: recipient,
		Subject:   subject,
		Content:   content,
		Channel:   "email",
	}
	
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}
	
	req, err := http.NewRequest("POST", "https://your-getnotified-instance.com/api/v1/notifications", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	
	return result, nil
}

func main() {
	apiKey := "your_api_key_here"
	recipient := "user@example.com"
	subject := "Important Notification"
	content := "<h1>Hello!</h1><p>This is an important notification.</p>"
	
	result, err := sendNotification(apiKey, recipient, subject, content)
	if err != nil {
		fmt.Printf("Error: %v\\n", err)
		return
	}
	
	fmt.Printf("Result: %v\\n", result)
}`;

  const requestExample = `{
  "recipient": "user@example.com",
  "subject": "Your Notification Subject",
  "content": "Your notification content or HTML",
  "channel": "email",
  "template_id": 123,     // Optional: use a predefined template
  "variables": {          // Optional: variables to replace in template
    "name": "John Doe",
    "action_url": "https://example.com/action"
  }
}`;

  const responseExample = `{
  "id": 456,
  "status": "queued",
  "message": "Notification queued successfully"
}`;

  const authExample = `Authorization: Bearer YOUR_API_KEY`;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-semibold">Loading Documentation</h3>
        <p className="text-muted-foreground mt-2">Please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <Card className="border-none shadow-none">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-2 bg-primary/10 rounded-full mb-2">
            <Book className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">GetNotified API Documentation</CardTitle>
          <CardDescription className="text-lg">
            Learn how to integrate notifications into your applications
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Introduction Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">API Key Usage Guide</h2>
            <p className="text-muted-foreground">
              This documentation explains how to use the GetNotified API with your API keys to send notifications through various channels.
            </p>
          </section>

          {/* Key Concepts */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Introduction</h2>
            <p className="text-muted-foreground">
              GetNotified provides a powerful notification system that allows you to send emails and other types of notifications through a simple API. 
              This document will guide you through the process of obtaining, configuring, and using your API keys.
            </p>
          </section>

          {/* API Key Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">API Key Overview</h2>
            <p className="text-muted-foreground">
              When you create a channel in GetNotified, you'll receive an API key that authenticates your requests. 
              These keys are specific to each channel type (email, SMS, etc.) and should be kept secure.
            </p>
          </section>

          {/* How to Obtain */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">How to Obtain an API Key</h2>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li><span className="font-medium text-foreground">Register an account</span> on GetNotified platform</li>
              <li><span className="font-medium text-foreground">Navigate to Settings</span> and select "Channels"</li>
              <li><span className="font-medium text-foreground">Create a new channel</span> or select an existing one</li>
              <li><span className="font-medium text-foreground">Configure the channel</span> with the required credentials (e.g., email provider details)</li>
              <li><span className="font-medium text-foreground">Save the channel</span> to generate your API key</li>
            </ol>
          </section>

          {/* Authentication */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Authentication</h2>
            <p className="text-muted-foreground mb-4">
              All API requests require authentication using either:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><span className="font-medium text-foreground">JWT token</span> (for web application users)</li>
              <li><span className="font-medium text-foreground">API key</span> (for server-to-server integration)</li>
            </ul>
            <p className="text-muted-foreground mb-4">Add your API key to the request header:</p>
            <div className="relative rounded-md bg-muted p-4 font-mono text-sm">
              {authExample}
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={() => copyToClipboard(authExample, 'auth')}
              >
                {copiedSection === 'auth' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </section>

          {/* Sending Notifications */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Sending Notifications</h2>
            
            {/* Endpoint Reference */}
            <h3 className="text-xl font-medium mt-6">Endpoint Reference</h3>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">Method</th>
                    <th className="px-4 py-2 text-left">Endpoint</th>
                    <th className="px-4 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">POST</td>
                    <td className="px-4 py-2 font-mono text-sm">/api/v1/notifications</td>
                    <td className="px-4 py-2">Send a notification</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">GET</td>
                    <td className="px-4 py-2 font-mono text-sm">/api/v1/notifications</td>
                    <td className="px-4 py-2">Get a list of sent notifications</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">GET</td>
                    <td className="px-4 py-2 font-mono text-sm">/api/v1/notifications/:id</td>
                    <td className="px-4 py-2">Get details of a specific notification</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Request Schema */}
            <h3 className="text-xl font-medium mt-6">Request Schema</h3>
            <p className="text-muted-foreground mb-4">When sending a notification, use the following JSON structure:</p>
            <div className="relative rounded-md bg-muted p-4 font-mono text-sm">
              <pre>{requestExample}</pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={() => copyToClipboard(requestExample, 'request')}
              >
                {copiedSection === 'request' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Response Schema */}
            <h3 className="text-xl font-medium mt-6">Response Schema</h3>
            <p className="text-muted-foreground mb-4">A successful notification request will return:</p>
            <div className="relative rounded-md bg-muted p-4 font-mono text-sm">
              <pre>{responseExample}</pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={() => copyToClipboard(responseExample, 'response')}
              >
                {copiedSection === 'response' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </section>

          {/* Code Examples */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Code Examples</h2>
            
            <Tabs defaultValue="python">
              <TabsList className="mb-4">
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="go">Go</TabsTrigger>
              </TabsList>
              
              <TabsContent value="python">
                <div className="relative rounded-md bg-muted p-4 font-mono text-sm overflow-auto max-h-[400px]">
                  <pre className="text-sm whitespace-pre-wrap">{pythonExample}</pre>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => copyToClipboard(pythonExample, 'python')}
                  >
                    {copiedSection === 'python' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="go">
                <div className="relative rounded-md bg-muted p-4 font-mono text-sm overflow-auto max-h-[400px]">
                  <pre className="text-sm whitespace-pre-wrap">{goExample}</pre>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => copyToClipboard(goExample, 'go')}
                  >
                    {copiedSection === 'go' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          {/* Security Best Practices */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Security Best Practices</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><span className="font-medium text-foreground">Never share your API keys</span> - Keep them secret and secure</li>
              <li><span className="font-medium text-foreground">Rotate API keys periodically</span> - Create new keys and phase out old ones</li>
              <li><span className="font-medium text-foreground">Use environment variables</span> - Don't hardcode API keys in your source code</li>
              <li><span className="font-medium text-foreground">Implement rate limiting</span> - Prevent API abuse by limiting request frequency</li>
              <li><span className="font-medium text-foreground">Monitor API usage</span> - Track and audit API activity for suspicious patterns</li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Troubleshooting</h2>
            <p className="text-muted-foreground mb-4">If you encounter issues with your API requests:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><span className="font-medium text-foreground">Verify your API key</span> is valid and active</li>
              <li><span className="font-medium text-foreground">Check request format</span> matches the required schema</li>
              <li><span className="font-medium text-foreground">Confirm the channel</span> is properly configured</li>
              <li><span className="font-medium text-foreground">Review error responses</span> for specific error codes and messages</li>
              <li><span className="font-medium text-foreground">Check server logs</span> for additional debugging information</li>
            </ul>
          </section>

          {/* Rate Limits */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Rate Limits</h2>
            <p className="text-muted-foreground mb-4">To ensure system stability and fair usage, the following rate limits apply:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>100 requests per minute per API key</li>
              <li>5,000 requests per day per API key</li>
            </ul>
            <p className="text-muted-foreground mt-4">Exceeding these limits will result in a 429 "Too Many Requests" response.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocumentation;
