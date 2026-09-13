import api from './api'
export interface AdminActivityLog{id:number;action:string;module:string;description:string;method:string|null;path:string|null;ip_address:string|null;created_at:string;admin?:{id:number;name:string;email:string|null}|null}
export const adminActivityApi={async list(params:Record<string,any>={}){const r=await api.get('/api/v1/admin/activity-logs',{params});return r.data.data as {data:AdminActivityLog[];current_page:number;last_page:number;total:number}}}
