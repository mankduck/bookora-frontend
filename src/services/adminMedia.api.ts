import api from './api'
export const adminMediaApi={async uploadImage(file:File):Promise<string>{const form=new FormData();form.append('image',file,file.name);const r=await api.post('/api/v1/admin/media/image',form,{headers:{'Content-Type':'multipart/form-data'}});return r.data.data.url}}
