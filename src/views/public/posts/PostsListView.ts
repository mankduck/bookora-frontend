import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { publicPostApi } from '@/services/publicPost.api'
export function usePostsListView(){const posts=ref<any[]>([]),loading=ref(true);const load=async()=>{loading.value=true;try{const r=await publicPostApi.list({per_page:12});posts.value=r.data}finally{loading.value=false}};onMounted(load);return{RouterLink,posts,loading}}
