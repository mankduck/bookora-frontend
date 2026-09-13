import api from './api'
export const publicPostApi = {
  async list(params: any = {}) { const r = await api.get('/api/v1/public/posts', { params }); return r.data.data },
  async get(slug: string) { const r = await api.get(`/api/v1/public/posts/${slug}`); return r.data.data.post },
}
