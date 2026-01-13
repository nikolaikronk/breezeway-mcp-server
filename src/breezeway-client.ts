import fetch from 'node-fetch';

interface BreezewayConfig {
  apiKey: string; // client_id
  apiSecret: string; // client_secret
  baseUrl?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface Property {
  id: string;
  name: string;
  address?: string;
  status?: string;
  [key: string]: any;
}

interface Task {
  id: string;
  title: string;
  status?: string;
  property_id?: string;
  [key: string]: any;
}

interface Reservation {
  id: string;
  property_id?: string;
  check_in?: string;
  check_out?: string;
  [key: string]: any;
}

export class BreezewayClient {
  private config: BreezewayConfig;
  private tokens: AuthTokens | null = null;
  private baseUrl: string;

  constructor(config: BreezewayConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.breezeway.io';
  }

  /**
   * Authenticate with Breezeway API and get access tokens
   */
  private async authenticate(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/public/auth/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.apiKey,
        client_secret: this.config.apiSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Authentication failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as any;

    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || '',
      // Tokens valid for 24 hours, refresh before expiry
      expiresAt: Date.now() + (23 * 60 * 60 * 1000),
    };
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      await this.authenticate();
      return;
    }

    const response = await fetch(`${this.baseUrl}/public/auth/v1/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `JWT ${this.tokens.refreshToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // If refresh fails, re-authenticate
      await this.authenticate();
      return;
    }

    const data = await response.json() as any;

    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || '',
      expiresAt: Date.now() + (23 * 60 * 60 * 1000),
    };
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureAuthenticated(): Promise<string> {
    // If no tokens or tokens expired, authenticate
    if (!this.tokens || Date.now() >= this.tokens.expiresAt) {
      await this.refreshAccessToken();
    }

    return this.tokens!.accessToken;
  }

  /**
   * Make an authenticated request to the Breezeway API
   */
  private async request<T>(endpoint: string, options: any = {}): Promise<T> {
    const token = await this.ensureAuthenticated();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json() as T;
  }

  /**
   * Search across multiple entity types in Breezeway
   */
  async search(query: string, types?: string[]): Promise<any[]> {
    const results: any[] = [];
    const searchTypes = types || ['properties', 'tasks', 'reservations'];

    // Search properties if requested
    if (searchTypes.includes('properties')) {
      try {
        const properties = await this.request<{ results: Property[] }>('/public/inventory/v1/property', {
          method: 'GET',
        });

        if (properties.results) {
          const filtered = properties.results.filter((prop: Property) => {
            const searchStr = JSON.stringify(prop).toLowerCase();
            return searchStr.includes(query.toLowerCase());
          });

          results.push(...filtered.map((prop: Property) => ({
            type: 'property',
            id: prop.id,
            title: prop.name,
            snippet: `Address: ${prop.address || 'N/A'} | Status: ${prop.status || 'N/A'}`,
            data: prop,
          })));
        }
      } catch (error) {
        console.error('Error searching properties:', error);
      }
    }

    // Search tasks if requested
    if (searchTypes.includes('tasks')) {
      try {
        const tasks = await this.request<{ results: Task[] }>('/public/inventory/v1/task/', {
          method: 'GET',
        });

        if (tasks.results) {
          const filtered = tasks.results.filter((task: Task) => {
            const searchStr = JSON.stringify(task).toLowerCase();
            return searchStr.includes(query.toLowerCase());
          });

          results.push(...filtered.map((task: Task) => ({
            type: 'task',
            id: task.id,
            title: task.title,
            snippet: `Status: ${task.status || 'N/A'}`,
            data: task,
          })));
        }
      } catch (error) {
        console.error('Error searching tasks:', error);
      }
    }

    // Search reservations if requested
    if (searchTypes.includes('reservations')) {
      try {
        const reservations = await this.request<{ results: Reservation[] }>('/public/inventory/v1/reservation', {
          method: 'GET',
        });

        if (reservations.results) {
          const filtered = reservations.results.filter((res: Reservation) => {
            const searchStr = JSON.stringify(res).toLowerCase();
            return searchStr.includes(query.toLowerCase());
          });

          results.push(...filtered.map((res: Reservation) => ({
            type: 'reservation',
            id: res.id,
            title: `Reservation ${res.id}`,
            snippet: `Check-in: ${res.check_in || 'N/A'} | Check-out: ${res.check_out || 'N/A'}`,
            data: res,
          })));
        }
      } catch (error) {
        console.error('Error searching reservations:', error);
      }
    }

    return results;
  }

  /**
   * Fetch detailed information about a specific entity
   */
  async fetch(type: string, id: string): Promise<any> {
    switch (type) {
      case 'property':
        return await this.request(`/public/inventory/v1/property/${id}`, { method: 'GET' });

      case 'task':
        return await this.request(`/public/inventory/v1/task/${id}`, { method: 'GET' });

      case 'reservation':
        return await this.request(`/public/inventory/v1/reservation/${id}`, { method: 'GET' });

      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
  }

  /**
   * Get all properties
   */
  async getProperties(params?: any): Promise<Property[]> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await this.request<{ results: Property[] }>(`/public/inventory/v1/property${queryString}`, {
      method: 'GET',
    });
    return response.results || [];
  }

  /**
   * Get all tasks (Note: Breezeway API requires property_id for tasks)
   */
  async getTasks(params?: any): Promise<Task[]> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await this.request<{ results: Task[] }>(`/public/inventory/v1/task/${queryString}`, {
      method: 'GET',
    });
    return response.results || [];
  }

  /**
   * Get all reservations
   */
  async getReservations(params?: any): Promise<Reservation[]> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await this.request<{ results: Reservation[] }>(`/public/inventory/v1/reservation${queryString}`, {
      method: 'GET',
    });
    return response.results || [];
  }

  /**
   * Update a property
   */
  async updateProperty(propertyId: string, updates: any): Promise<Property> {
    const response = await this.request<Property>(`/public/inventory/v1/property/${propertyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response;
  }
}
