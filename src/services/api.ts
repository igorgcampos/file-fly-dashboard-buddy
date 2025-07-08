const API_BASE_URL = 'http://backend:8000';

export interface DashboardStats {
  active_users: number;
  server_status: string;
  server_version: string;
  uptime: string;
  transfers_24h: number;
  disk_used_gb: number;
  disk_total_gb: number;
  disk_usage_percent: number;
}

export interface RecentUser {
  name: string;
  status: string;
  last_access: string;
  transfers: number;
}

export interface User {
  username: string;
  home_dir: string;
  quota_mb: number;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  home_dir?: string;
  quota_mb?: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/dashboard/stats');
  }

  async getRecentUsers(): Promise<RecentUser[]> {
    return this.request<RecentUser[]>('/api/dashboard/recent-users');
  }

  // User management endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }

  async createUser(userData: CreateUserRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(username: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/users/${username}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();