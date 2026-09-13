import {
  onMounted,
  reactive,
  ref,
} from 'vue'
import axios from 'axios'
import { adminMediaApi } from '@/services/adminMedia.api'
import serviceApi, {
  type Service,
  type ServiceVariant,
} from '@/services/service.api'
import serviceCategoryApi, {
  type ServiceCategory,
} from '@/services/serviceCategory.api'

export function useServicesView() {
  const services = ref<Service[]>([])

  const categories = ref<ServiceCategory[]>([])

  const loading = ref(false)

  const saving = ref(false)

  const search = ref('')

  const categoryFilter = ref('')

  const statusFilter = ref('')

  const expandedServiceId =
    ref<number | null>(null)

  const serviceModalOpen = ref(false)

  const variantModalOpen = ref(false)

  const editingService =
    ref<Service | null>(null)

  const selectedService =
    ref<Service | null>(null)

  const editingVariant =
    ref<ServiceVariant | null>(null)

  const formError = ref('')

  const serviceForm = reactive({
    category_id: null as number | null,
    name: '',
    slug: '',
    short_description: '',
    description: '',
    thumbnail: '',
    base_price: 0,
    default_duration_minutes: 60,
    status: 'active' as 'active' | 'inactive',
    is_featured: false,
    sort_order: 0,
  })

  const variantForm = reactive({
    name: '',
    code: '',
    description: '',
    thumbnail: '',
    price: 0,
    sale_price: null as number | null,
    duration_minutes: 60,
    deposit_type: 'none' as
      | 'none'
      | 'fixed'
      | 'percent',
    deposit_value: 0,
    status: 'active' as
      | 'active'
      | 'inactive',
    sort_order: 0,
  })

  let searchTimer:
    | ReturnType<typeof setTimeout>
    | undefined

  const formatMoney = (
    value: string | number | null,
  ) => {
    const number = Number(value ?? 0)
  
    return new Intl.NumberFormat(
      'vi-VN',
      {
        style: 'currency',
        currency: 'VND',
      },
    ).format(number)
  }

  const depositText = (
    variant: ServiceVariant,
  ) => {
    if (variant.deposit_type === 'none') {
      return 'Không'
    }
  
    if (variant.deposit_type === 'percent') {
      return `${Number(
        variant.deposit_value,
      )}%`
    }
  
    return formatMoney(
      variant.deposit_value,
    )
  }

  const loadCategories = async () => {
    const result =
      await serviceCategoryApi.getAll({
        per_page: 100,
      })
  
    categories.value = result.data
  }

  const loadServices = async () => {
    loading.value = true
  
    try {
      const result =
        await serviceApi.getAll({
          search:
            search.value || undefined,
  
          category_id:
            categoryFilter.value
              ? Number(categoryFilter.value)
              : undefined,
  
          status:
            statusFilter.value ||
            undefined,
  
          per_page: 50,
        })
  
      services.value = result.data
    } finally {
      loading.value = false
    }
  }

  const reloadFromFirstPage = () => {
    loadServices()
  }

  const handleSearch = () => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
  
    searchTimer = setTimeout(
      loadServices,
      350,
    )
  }

  const toggleVariants = (
    serviceId: number,
  ) => {
    expandedServiceId.value =
      expandedServiceId.value === serviceId
        ? null
        : serviceId
  }

  const resetServiceForm = () => {
    serviceForm.category_id = null
    serviceForm.name = ''
    serviceForm.slug = ''
    serviceForm.short_description = ''
    serviceForm.description = ''
    serviceForm.thumbnail = ''
    serviceForm.base_price = 0
    serviceForm.default_duration_minutes = 60
    serviceForm.status = 'active'
    serviceForm.is_featured = false
    serviceForm.sort_order = 0
  
    formError.value = ''
  }

  const openCreateService = () => {
    resetServiceForm()
  
    editingService.value = null
    serviceModalOpen.value = true
  }

  const openEditService = (
    service: Service,
  ) => {
    resetServiceForm()
  
    editingService.value = service
  
    serviceForm.category_id =
      service.category_id
  
    serviceForm.name =
      service.name
  
    serviceForm.slug =
      service.slug
  
    serviceForm.short_description =
      service.short_description ?? ''
  
    serviceForm.description =
      service.description ?? ''

    serviceForm.thumbnail = service.thumbnail ?? ''
  
    serviceForm.base_price =
      Number(service.base_price)
  
    serviceForm.default_duration_minutes =
      service.default_duration_minutes
  
    serviceForm.status =
      service.status
  
    serviceForm.is_featured =
      service.is_featured
  
    serviceForm.sort_order =
      service.sort_order
  
    serviceModalOpen.value = true
  }

  const closeServiceModal = () => {
    serviceModalOpen.value = false
    editingService.value = null
    resetServiceForm()
  }

  const uploadServiceImage = async (event: Event) => {
    const file=(event.target as HTMLInputElement).files?.[0]
    if(!file)return
    saving.value=true
    try{serviceForm.thumbnail=await adminMediaApi.uploadImage(file)}
    catch{formError.value='Không thể tải ảnh dịch vụ.'}
    finally{saving.value=false}
  }

  const saveService = async () => {
    formError.value = ''
  
    if (!serviceForm.name.trim()) {
      formError.value =
        'Vui lòng nhập tên dịch vụ.'
      return
    }
  
    saving.value = true
  
    try {
      const payload = {
        category_id:
          serviceForm.category_id,
  
        name:
          serviceForm.name.trim(),
  
        slug:
          serviceForm.slug.trim() ||
          undefined,
  
        short_description:
          serviceForm.short_description,
  
        description:
          serviceForm.description,

        thumbnail:
          serviceForm.thumbnail || null,
  
        base_price:
          Number(serviceForm.base_price),
  
        default_duration_minutes:
          Number(
            serviceForm.default_duration_minutes,
          ),
  
        status:
          serviceForm.status,
  
        is_featured:
          serviceForm.is_featured,
  
        sort_order:
          Number(
            serviceForm.sort_order,
          ),
      }
  
      if (editingService.value) {
        await serviceApi.update(
          editingService.value.id,
          payload,
        )
      } else {
        await serviceApi.create(payload)
      }
  
      closeServiceModal()
      await loadServices()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        formError.value =
          error.response?.data?.message ||
          Object.values(
            error.response?.data?.errors ?? {},
          )?.[0]?.[0] ||
          'Không thể lưu dịch vụ.'
      }
    } finally {
      saving.value = false
    }
  }

  const removeService = async (
    service: Service,
  ) => {
    if (
      !window.confirm(
        `Xóa dịch vụ "${service.name}"?`,
      )
    ) {
      return
    }
  
    try {
      await serviceApi.remove(service.id)
      await loadServices()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        window.alert(
          error.response?.data?.message ||
          'Không thể xóa dịch vụ.',
        )
      }
    }
  }

  const resetVariantForm = () => {
    variantForm.name = ''
    variantForm.code = ''
    variantForm.description = ''
    variantForm.thumbnail = ''
    variantForm.price = 0
    variantForm.sale_price = null
    variantForm.duration_minutes = 60
    variantForm.deposit_type = 'none'
    variantForm.deposit_value = 0
    variantForm.status = 'active'
    variantForm.sort_order = 0
  
    formError.value = ''
  }

  const openCreateVariant = (
    service: Service,
  ) => {
    resetVariantForm()
  
    selectedService.value = service
    editingVariant.value = null
  
    variantForm.price =
      Number(service.base_price)
  
    variantForm.duration_minutes =
      service.default_duration_minutes
  
    variantModalOpen.value = true
  }

  const openEditVariant = (
    service: Service,
    variant: ServiceVariant,
  ) => {
    resetVariantForm()
  
    selectedService.value = service
    editingVariant.value = variant
  
    variantForm.name = variant.name
    variantForm.code = variant.code ?? ''
    variantForm.description =
      variant.description ?? ''

    variantForm.thumbnail = variant.thumbnail ?? ''
  
    variantForm.price =
      Number(variant.price)
  
    variantForm.sale_price =
      variant.sale_price === null
        ? null
        : Number(variant.sale_price)
  
    variantForm.duration_minutes =
      variant.duration_minutes
  
    variantForm.deposit_type =
      variant.deposit_type
  
    variantForm.deposit_value =
      Number(variant.deposit_value)
  
    variantForm.status =
      variant.status
  
    variantForm.sort_order =
      variant.sort_order
  
    variantModalOpen.value = true
  }

  const closeVariantModal = () => {
    variantModalOpen.value = false
    selectedService.value = null
    editingVariant.value = null
  
    resetVariantForm()
  }

  const uploadVariantImage = async (event: Event) => {
    const file=(event.target as HTMLInputElement).files?.[0]
    if(!file)return
    saving.value=true
    try{variantForm.thumbnail=await adminMediaApi.uploadImage(file)}
    catch{formError.value='Không thể tải ảnh gói dịch vụ.'}
    finally{saving.value=false}
  }

  const saveVariant = async () => {
    if (!selectedService.value) {
      return
    }
  
    formError.value = ''
  
    if (!variantForm.name.trim()) {
      formError.value =
        'Vui lòng nhập tên gói.'
      return
    }
  
    saving.value = true
  
    try {
      const payload = {
        name: variantForm.name.trim(),
  
        code:
          variantForm.code.trim() ||
          null,
  
        description:
          variantForm.description,

        thumbnail:
          variantForm.thumbnail || null,
  
        price:
          Number(variantForm.price),
  
        sale_price:
          variantForm.sale_price === null ||
          variantForm.sale_price === 0
            ? null
            : Number(
                variantForm.sale_price,
              ),
  
        duration_minutes:
          Number(
            variantForm.duration_minutes,
          ),
  
        deposit_type:
          variantForm.deposit_type,
  
        deposit_value:
          variantForm.deposit_type ===
          'none'
            ? 0
            : Number(
                variantForm.deposit_value,
              ),
  
        status:
          variantForm.status,
  
        sort_order:
          Number(
            variantForm.sort_order,
          ),
      }
  
      if (editingVariant.value) {
        await serviceApi.updateVariant(
          selectedService.value.id,
          editingVariant.value.id,
          payload,
        )
      } else {
        await serviceApi.createVariant(
          selectedService.value.id,
          payload,
        )
      }
  
      const serviceId =
        selectedService.value.id
  
      closeVariantModal()
  
      await loadServices()
  
      expandedServiceId.value =
        serviceId
    } catch (error) {
      if (axios.isAxiosError(error)) {
        formError.value =
          error.response?.data?.message ||
          Object.values(
            error.response?.data?.errors ?? {},
          )?.[0]?.[0] ||
          'Không thể lưu gói.'
      }
    } finally {
      saving.value = false
    }
  }

  const removeVariant = async (
    service: Service,
    variant: ServiceVariant,
  ) => {
    if (
      !window.confirm(
        `Xóa gói "${variant.name}"?`,
      )
    ) {
      return
    }
  
    try {
      await serviceApi.removeVariant(
        service.id,
        variant.id,
      )
  
      await loadServices()
  
      expandedServiceId.value =
        service.id
    } catch (error) {
      if (axios.isAxiosError(error)) {
        window.alert(
          error.response?.data?.message ||
          'Không thể xóa gói.',
        )
      }
    }
  }

  onMounted(async () => {
    await loadCategories()
    await loadServices()
  })

  return {
    services,
    categories,
    loading,
    saving,
    search,
    categoryFilter,
    statusFilter,
    expandedServiceId,
    serviceModalOpen,
    variantModalOpen,
    editingService,
    selectedService,
    editingVariant,
    formError,
    serviceForm,
    variantForm,
    formatMoney,
    depositText,
    reloadFromFirstPage,
    handleSearch,
    toggleVariants,
    openCreateService,
    openEditService,
    closeServiceModal,
    saveService,
    uploadServiceImage,
    removeService,
    openCreateVariant,
    openEditVariant,
    closeVariantModal,
    saveVariant,
    uploadVariantImage,
    removeVariant,
  };
}
