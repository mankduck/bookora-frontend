import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { publicPostApi } from '@/services/publicPost.api'
export function usePostDetailView(){const route=useRoute(),post=ref<any>(null),loading=ref(true);onMounted(async()=>{try{post.value=await publicPostApi.get(String(route.params.slug))}finally{loading.value=false}});return{RouterLink,post,loading}}
