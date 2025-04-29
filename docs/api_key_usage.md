# GetNotified API Documentation

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

```
Authorization: Bearer YOUR_API_KEY
```

### Sending Notifications

#### Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/notifications` | Send a notification |
| GET | `/api/v1/notifications` | Get a list of sent notifications |
| GET | `/api/v1/notifications/:id` | Get details of a specific notification |

#### Request Schema

When sending a notification, use the following JSON structure:

```json
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
```

#### Response Schema

A successful notification request will return:

```json
{
  "id": 456,
  "status": "queued",
  "message": "Notification queued successfully"
}
```

### Code Examples

#### Python Example

```python
import requests
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
print(result)
```

#### Go Example

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type NotificationRequest struct {
	Recipient string            `json:"recipient"`
	Subject   string            `json:"subject"`
	Content   string            `json:"content"`
	Channel   string            `json:"channel"`
	Variables map[string]string `json:"variables,omitempty"`
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
		fmt.Printf("Error: %v\n", err)
		return
	}
	
	fmt.Printf("Result: %v\n", result)
}
```

### Security Best Practices

1. **Never share your API keys** - Keep them secret and secure
2. **Rotate API keys periodically** - Create new keys and phase out old ones
3. **Use environment variables** - Don't hardcode API keys in your source code
4. **Implement rate limiting** - Prevent API abuse by limiting request frequency
5. **Monitor API usage** - Track and audit API activity for suspicious patterns

### Troubleshooting

If you encounter issues with your API requests:

1. **Verify your API key** is valid and active
2. **Check request format** matches the required schema
3. **Confirm the channel** is properly configured
4. **Review error responses** for specific error codes and messages
5. **Check server logs** for additional debugging information

### Rate Limits

To ensure system stability, the API enforces the following rate limits:

- 100 requests per minute per API key
- 1,000 requests per hour per API key
- 10,000 requests per day per API key

Exceeding these limits will result in HTTP 429 (Too Many Requests) responses.

### Additional Resources

- [GetNotified Website](https://getnotified.example.com)
- [Full API Reference](https://docs.getnotified.example.com)
- [Community Forums](https://community.getnotified.example.com)
- [Support Email](mailto:support@getnotified.example.com)

### Need Help?

If you need assistance with API integration or have questions about using GetNotified, please contact our support team at support@getnotified.example.com.
