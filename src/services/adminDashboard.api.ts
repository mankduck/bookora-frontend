import api from './api'

export interface DashboardData {
  stats: { today_bookings: number; pending_bookings: number; customers: number; today_revenue: number }
  today_status: { confirmed: number; in_progress: number; completed: number; cancelled: number }
  recent_bookings: any[]
}

export const adminDashboardApi = {
  async get(): Promise<DashboardData> {
    const response = await api.get('/api/v1/admin/dashboard')
    return response.data.data
  },
}
