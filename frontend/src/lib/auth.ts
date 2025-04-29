// Import the API base URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

// User types
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// JWT token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Failed to parse user data', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getCurrentUser();
};

// Auth API
export const authApi = {
  async register(data: RegisterRequest): Promise<{ data?: AuthResponse; error?: string }> {
    try {
      console.log('Making API request to:', `${API_BASE_URL}/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.log('Registration error response:', errorData);
          
          // Handle nested error objects or direct error strings
          const errorMessage = errorData.error || 
                              (errorData.details ? JSON.stringify(errorData.details) : null) || 
                              'Registration failed';
                              
          return { error: errorMessage };
        } catch (e) {
          console.error('Failed to parse error response:', e);
          return { error: `Registration failed with status: ${response.status}` };
        }
      }

      // Parse the response
      const responseData = await response.json();
      console.log('Registration successful response:', responseData);
      
      // For successful registration, we need to log in to get the token
      const loginResult = await this.login({
        email: data.email,
        password: data.password
      });
      
      if (loginResult.error) {
        console.error('Auto-login after registration failed:', loginResult.error);
        // Even if auto-login fails, consider registration successful
        return { 
          data: {
            token: 'registration-success', // Placeholder token, user will need to log in
            user: {
              id: 0,
              email: data.email,
              name: data.name,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        };
      }
      
      return loginResult;
    } catch (error) {
      console.error('Register error:', error);
      return { error: 'An unexpected error occurred' };
    }
  },

  async login(data: LoginRequest): Promise<{ data?: AuthResponse; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          return { error: errorData.error || 'Login failed' };
        } catch (e) {
          return { error: `Login failed with status: ${response.status}` };
        }
      }

      // Parse the response
      const responseData = await response.json();
      
      // Check the structure of the response
      if (responseData.token && responseData.user) {
        // Proper auth response with token and user
        setAuthToken(responseData.token);
        setCurrentUser(responseData.user);
        return { data: responseData };
      }
      
      // Direct user object response (fallback for older API)
      const authData = {
        token: 'temp-token', // Temporary token for now
        user: responseData // The response itself is the user data
      };
      setAuthToken(authData.token);
      setCurrentUser(responseData);
      return { data: authData };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'An unexpected error occurred' };
    }
  },

  logout() {
    removeAuthToken();
    window.location.href = '/login';
  },

  async getProfile(): Promise<{ data?: User; error?: string }> {
    const token = getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          removeAuthToken();
          return { error: 'Session expired' };
        }
        
        const errorData = await response.json();
        return { error: errorData.error || 'Failed to fetch profile' };
      }

      const userData = await response.json();
      setCurrentUser(userData);
      return { data: userData };
    } catch (error) {
      console.error('Get profile error:', error);
      return { error: 'An unexpected error occurred' };
    }
  },

  async updateProfile(name: string): Promise<{ data?: User; error?: string }> {
    const token = getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Failed to update profile' };
      }

      const userData = await response.json();
      setCurrentUser(userData);
      return { data: userData };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'An unexpected error occurred' };
    }
  },
};
