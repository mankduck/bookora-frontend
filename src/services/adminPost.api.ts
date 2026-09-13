import api from './api'

export interface AdminPost {
  id: number; title: string; slug: string; excerpt: string | null; content: string; featured_image: string | null
  status: 'draft' | 'published'; published_at: string | null; meta_title: string | null; meta_description: string | null
  author?: { id: number; name: string }
}
export const adminPostApi = {
  async list(params: any = {}) { const r = await api.get('/api/v1/admin/posts', { params }); return r.data.data },
  async create(payload: Partial<AdminPost>) { const r = await api.post('/api/v1/admin/posts', payload); return r.data.data.post as AdminPost },
  async update(id: number, payload: Partial<AdminPost>) { const r = await api.put(`/api/v1/admin/posts/${id}`, payload); return r.data.data.post as AdminPost },
  async remove(id: number) { await api.delete(`/api/v1/admin/posts/${id}`) },
}
