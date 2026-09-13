import { onMounted, reactive, ref, watch } from 'vue'
import { adminSettingsApi } from '@/services/adminSettings.api'
import { adminActivityApi, type AdminActivityLog } from '@/services/adminActivity.api'
import { useSiteStore } from '@/stores/site'
export function useSettingsView(){
 const site=useSiteStore(),activeTab=ref('general'),loading=ref(true),saving=ref(false),message=ref(''),error=ref(''),logoFile=ref<File|null>(null),activities=ref<AdminActivityLog[]>([]),activityLoading=ref(false),activitySearch=ref(''),activityModule=ref('')
 const form=reactive<any>({site_name:'',company_name:'',tagline:'',logo_url:'',phone:'',email:'',address:'',business_hours:'',map_embed_url:'',facebook_url:'',instagram_url:'',primary_color:'#181916',secondary_color:'#f4f4f1',admin_language:'vi'})
 const load=async()=>{loading.value=true;try{Object.assign(form,await adminSettingsApi.get())}catch(e:any){error.value=e?.response?.data?.message||'Không thể tải cài đặt.'}finally{loading.value=false}}
 const loadActivities=async()=>{activityLoading.value=true;try{activities.value=(await adminActivityApi.list({search:activitySearch.value||undefined,module:activityModule.value||undefined,per_page:60})).data}finally{activityLoading.value=false}}
 const onLogo=(event:Event)=>{logoFile.value=(event.target as HTMLInputElement).files?.[0]||null}
 const save=async()=>{saving.value=true;message.value='';error.value='';try{Object.assign(form,await adminSettingsApi.update(form,logoFile.value));logoFile.value=null;message.value='Đã lưu cài đặt.';await site.load(true)}catch(e:any){error.value=e?.response?.data?.message||'Không thể lưu cài đặt.'}finally{saving.value=false}}
 const formatDate=(v:string)=>new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date(v))
 watch(activeTab,(tab)=>{if(tab==='history')loadActivities()})
 onMounted(load);return{activeTab,loading,saving,message,error,form,onLogo,save,activities,activityLoading,activitySearch,activityModule,loadActivities,formatDate}
}
