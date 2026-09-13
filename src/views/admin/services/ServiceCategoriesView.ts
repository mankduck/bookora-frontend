import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'
import axios from 'axios'
import serviceCategoryApi, {
  type ServiceCategory,
} from '@/services/serviceCategory.api'

export function useServiceCategoriesView() {
  const categories = ref<ServiceCategory[]>([])

  const loading = ref(false)

  const saving = ref(false)

  const search = ref('')

  const statusFilter = ref('')

  const modalOpen = ref(false)

  const editingCategory =
    ref<ServiceCategory | null>(null)

  const formError = ref('')

  const errors = reactive({
    name: '',
  })

  const pagination = reactive({
    page: 1,
    lastPage: 1,
    total: 0,
  })

  const form = reactive({
    parent_id: null as number | null,
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    status: 'active' as 'active' | 'inactive',
  })

  const parentOptions = computed(() =>
    categories.value.filter(
      (category) =>
        category.id !== editingCategory.value?.id,
    ),
  )

  let searchTimer: ReturnType<typeof setTimeout>

  const loadCategories = async () => {
    loading.value = true
  
    try {
      const result =
        await serviceCategoryApi.getAll({
          search: search.value || undefined,
          status:
            statusFilter.value || undefined,
          page: pagination.page,
          per_page: 20,
        })
  
      categories.value = result.data
  
      pagination.page = result.current_page
      pagination.lastPage = result.last_page
      pagination.total = result.total
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    clearTimeout(searchTimer)
  
    searchTimer = setTimeout(() => {
      pagination.page = 1
      loadCategories()
    }, 350)
  }

  const changePage = (page: number) => {
    pagination.page = page
    loadCategories()
  }

  const resetForm = () => {
    form.parent_id = null
    form.name = ''
    form.slug = ''
    form.description = ''
    form.sort_order = 0
    form.status = 'active'
  
    errors.name = ''
    formError.value = ''
  }

  const openCreate = () => {
    resetForm()
  
    editingCategory.value = null
    modalOpen.value = true
  }

  const openEdit = (
    category: ServiceCategory,
  ) => {
    resetForm()
  
    editingCategory.value = category
  
    form.parent_id = category.parent_id
    form.name = category.name
    form.slug = category.slug
    form.description =
      category.description ?? ''
    form.sort_order = category.sort_order
    form.status = category.status
  
    modalOpen.value = true
  }

  const closeModal = () => {
    modalOpen.value = false
    editingCategory.value = null
    resetForm()
  }

  const saveCategory = async () => {
    errors.name = ''
    formError.value = ''
  
    if (!form.name.trim()) {
      errors.name =
        'Vui lòng nhập tên danh mục.'
      return
    }
  
    saving.value = true
  
    try {
      const payload = {
        parent_id: form.parent_id,
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description,
        sort_order: form.sort_order,
        status: form.status,
      }
  
      if (editingCategory.value) {
        await serviceCategoryApi.update(
          editingCategory.value.id,
          payload,
        )
      } else {
        await serviceCategoryApi.create(
          payload,
        )
      }
  
      closeModal()
      await loadCategories()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        errors.name =
          error.response?.data?.errors?.name?.[0] ??
          ''
  
        formError.value =
          error.response?.data?.message ??
          'Không thể lưu danh mục.'
      } else {
        formError.value =
          'Có lỗi xảy ra khi lưu dữ liệu.'
      }
    } finally {
      saving.value = false
    }
  }

  const removeCategory = async (
    category: ServiceCategory,
  ) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa "${category.name}"?`,
    )
  
    if (!confirmed) {
      return
    }
  
    try {
      await serviceCategoryApi.remove(
        category.id,
      )
  
      await loadCategories()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        window.alert(
          error.response?.data?.message ??
            'Không thể xóa danh mục.',
        )
      }
    }
  }

  onMounted(loadCategories)

  return {
    categories,
    loading,
    saving,
    search,
    statusFilter,
    modalOpen,
    editingCategory,
    formError,
    errors,
    pagination,
    form,
    parentOptions,
    loadCategories,
    handleSearch,
    changePage,
    openCreate,
    openEdit,
    closeModal,
    saveCategory,
    removeCategory,
  };
}
