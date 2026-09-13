import { onMounted, reactive, ref } from 'vue'
import { adminPostApi, type AdminPost } from '@/services/adminPost.api'
export function usePostsView(){
 const posts=ref<AdminPost[]>([]),loading=ref(false),showForm=ref(false),editing=ref<AdminPost|null>(null),error=ref('')
 const filters=reactive({search:'',status:''}); const form=reactive<any>({title:'',slug:'',excerpt:'',content:'',featured_image:'',status:'draft',meta_title:'',meta_description:''})
 const load=async()=>{loading.value=true;try{const r=await adminPostApi.list(filters);posts.value=r.data}catch(e:any){error.value=e?.response?.data?.message||'Không thể tải bài viết.'}finally{loading.value=false}}
 const openCreate=()=>{editing.value=null;Object.assign(form,{title:'',slug:'',excerpt:'',content:'',featured_image:'',status:'draft',meta_title:'',meta_description:''});showForm.value=true}
 const openEdit=(p:AdminPost)=>{editing.value=p;Object.assign(form,p);showForm.value=true}
 const save=async()=>{try{if(editing.value)await adminPostApi.update(editing.value.id,form);else await adminPostApi.create(form);showForm.value=false;await load()}catch(e:any){window.alert(e?.response?.data?.message||'Không thể lưu bài viết.')}}
 const remove=async(p:AdminPost)=>{if(!confirm(`Xóa bài viết "${p.title}"?`))return;await adminPostApi.remove(p.id);await load()}
 onMounted(load);return{posts,loading,showForm,editing,error,filters,form,load,openCreate,openEdit,save,remove}
}
