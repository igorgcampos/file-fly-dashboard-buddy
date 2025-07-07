import { useQuery } from '@tanstack/react-query';
import { apiService, DashboardStats, RecentUser } from '@/services/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
  });
};

export const useRecentUsers = () => {
  return useQuery({
    queryKey: ['recent-users'],
    queryFn: () => apiService.getRecentUsers(),
    refetchInterval: 60000, // Refresh every minute
    retry: 3,
  });
};