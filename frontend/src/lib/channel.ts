// Define types and API functions for channel management
import { getAuthToken } from './auth';

// API base URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Channel types
export interface Channel {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  config: EmailChannelConfig | SMSChannelConfig | Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailChannelConfig {
  provider: 'resend' | 'mailersend' | 'sendgrid';
  api_key: string;
  from_email: string;
  from_name?: string;
  domain?: string;
  is_default: boolean;
}

export interface SMSChannelConfig {
  provider: 'twilio';
  account_sid: string;
  auth_token: string;
  from_number: string;
  is_default: boolean;
}

export interface ChannelRequest {
  name: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  config: EmailChannelConfig | SMSChannelConfig | Record<string, unknown>;
  is_active?: boolean;
}

// Channel API client
export const channelApi = {
  async create(data: ChannelRequest): Promise<{ data?: Channel; error?: string }> {
    const token = getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Failed to create channel' };
      }

      const channelData = await response.json();
      return { data: channelData };
    } catch (error) {
      console.error('Create channel error:', error);
      return { error: 'An unexpected error occurred' };
    }
  },

  async getById(id: number): Promise<{ data?: Channel; error?: string }> {
    const token = getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/channels/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Failed to get channel' };
      }

      const channelData = await response.json();
      return { data: channelData };
    } catch (error) {
      console.error('Get channel error:', error);
      return { error: 'An unexpected error occurred' };
    }
  },

  async list(): Promise<{ data?: Channel[]; error?: string }> {
    const token = getAuthToken();
    if (!token) {
      console.error('Channel list failed: No authentication token');
      return { error: 'Not authenticated' };
    }
    
    console.log('Fetching channels from API with token:', token.substring(0, 10) + '...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/channels`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Channels API response status:', response.status);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('Channel list error response:', errorData);
          return { error: errorData.error || `Failed to list channels: ${response.status}` };
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          return { error: `Server returned ${response.status}` };
        }
      }

      // Clone response before parsing to avoid "already read" errors
      const responseClone = response.clone();
      try {
        const channelsData = await response.json();
        console.log('Channels data received:', channelsData);
        return { data: channelsData };
      } catch (parseError) {
        console.error('Failed to parse channels response:', parseError);
        // Try to get the text to see what was returned
        const textResponse = await responseClone.text();
        console.log('Raw response:', textResponse);
        return { error: 'Invalid response format' };
      }
    } catch (error) {
      console.error('List channels network error:', error);
      return { error: 'Network error when fetching channels' };
    }
  },

  async update(id: number, data: ChannelRequest): Promise<{ data?: Channel; error?: string }> {
    const token = getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/channels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Failed to update channel' };
      }

      const channelData = await response.json();
      return { data: channelData };
    } catch (error) {
      console.error('Update channel error:', error);
      return { error: 'An unexpected error occurred' };
    }
  },

  async delete(id: number): Promise<{ success?: boolean; error?: string }> {
    const token = getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/channels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Failed to delete channel' };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete channel error:', error);
      return { error: 'An unexpected error occurred' };
    }
  },
};
