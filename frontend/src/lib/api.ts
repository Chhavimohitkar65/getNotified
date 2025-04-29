/**
 * API client for communicating with the backend
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Template interfaces
export interface Template {
  id: number;
  name: string;
  description: string;
  subject: string;
  channel: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  subject: string;
  channel: string;
  content: string;
}

// Notification interfaces
export interface Notification {
  id: number;
  template_id: number;
  recipient: string;
  subject: string;
  content: string;
  status: string;
  channel: string;
  metadata: Record<string, unknown>;
  created_at: string;
  sent_at: string | null;
}

export interface SendNotificationRequest {
  template_id: number;
  recipient: string;
  channel: string; // Add the required channel field
  metadata?: Record<string, unknown>;
}

// Use JWT token for authentication
import { getAuthToken } from './auth';

async function fetchWithErrorHandling<T>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get JWT token from auth system
    const token = getAuthToken();
    
    // Prepare headers with auth token if available
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `Error: ${response.status} ${response.statusText}`,
      };
    }

    return { data: data as T };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Template API
export const templateApi = {
  list: async (): Promise<ApiResponse<Template[]>> => {
    return fetchWithErrorHandling<Template[]>(`${API_BASE_URL}/templates`);
  },
  
  getById: async (id: number): Promise<ApiResponse<Template>> => {
    return fetchWithErrorHandling<Template>(`${API_BASE_URL}/templates/${id}`);
  },
  
  create: async (templateData: CreateTemplateRequest): Promise<ApiResponse<Template>> => {
    return fetchWithErrorHandling<Template>(`${API_BASE_URL}/templates`, {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  },
  
  update: async (id: number, templateData: CreateTemplateRequest): Promise<ApiResponse<Template>> => {
    return fetchWithErrorHandling<Template>(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  },
  
  delete: async (id: number): Promise<ApiResponse<{ success: boolean }>> => {
    return fetchWithErrorHandling<{ success: boolean }>(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
    });
  },
};

// Notification API
export const notificationApi = {
  send: async (notificationData: SendNotificationRequest): Promise<ApiResponse<Notification>> => {
    return fetchWithErrorHandling<Notification>(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  },
  
  list: async (page = 1, pageSize = 20): Promise<ApiResponse<Notification[]>> => {
    return fetchWithErrorHandling<Notification[]>(
      `${API_BASE_URL}/notifications?page=${page}&pageSize=${pageSize}`
    );
  },
  
  getById: async (id: number): Promise<ApiResponse<Notification>> => {
    return fetchWithErrorHandling<Notification>(`${API_BASE_URL}/notifications/${id}`);
  },
};

export default {
  templates: templateApi,
  notifications: notificationApi,
};
