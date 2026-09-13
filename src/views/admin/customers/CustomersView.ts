import {
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue'
import axios from 'axios'
import adminCustomerApi, {
  type Customer,
  type CustomerDetail,
  type CustomerPagination,
  type CustomerStatus,
} from '@/services/adminCustomer.api'

export function useCustomersView() {
  const customers =
    ref<Customer[]>([])

  const pagination =
    reactive<CustomerPagination>({
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
      from: null,
      to: null,
    })

  const loading = ref(false)

  const loadingDetail =
    ref(false)

  const saving = ref(false)

  const creating = ref(false)

  const errorMessage = ref('')

  const formError = ref('')

  const createError = ref('')

  const search = ref('')

  const statusFilter = ref('')

  const drawerOpen = ref(false)

  const createModalOpen =
    ref(false)

  const editing = ref(false)

  const selectedCustomer =
    ref<CustomerDetail | null>(null)

  const form = reactive({
    name: '',
    phone: '',
    email: '',
    status: 'active' as CustomerStatus,
  })

  const createForm = reactive({
    name: '',
    phone: '',
    email: '',
    password: '',
    status: 'active' as CustomerStatus,
  })

  let searchTimer:
    | ReturnType<typeof setTimeout>
    | undefined

  const getErrorMessage = (
    error: unknown,
    fallback: string,
  ) => {
    if (!axios.isAxiosError(error)) {
      return fallback
    }
  
    const data =
      error.response?.data
  
    const errors =
      data?.errors
  
    if (errors) {
      const firstKey =
        Object.keys(errors)[0]
  
      const firstMessage =
        errors[firstKey]?.[0]
  
      if (firstMessage) {
        return firstMessage
      }
    }
  
    return (
      data?.message ||
      fallback
    )
  }

  const loadCustomers = async (
    page = pagination.current_page,
  ) => {
    loading.value = true
    errorMessage.value = ''
  
    try {
      const data =
        await adminCustomerApi.getAll({
          search:
            search.value ||
            undefined,
  
          status:
            statusFilter.value ||
            undefined,
  
          page,
  
          per_page: 15,
        })
  
      customers.value =
        data.customers
  
      Object.assign(
        pagination,
        data.pagination,
      )
    } catch (error) {
      errorMessage.value =
        getErrorMessage(
          error,
          'Không thể tải danh sách khách hàng.',
        )
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
  
    searchTimer = setTimeout(
      () => {
        loadCustomers(1)
      },
      350,
    )
  }

  const applyFilters = () => {
    loadCustomers(1)
  }

  const goToPage = (
    page: number,
  ) => {
    if (
      page < 1 ||
      page > pagination.last_page
    ) {
      return
    }
  
    loadCustomers(page)
  }

  const resetCreateForm = () => {
    createForm.name = ''
    createForm.phone = ''
    createForm.email = ''
    createForm.password = ''
    createForm.status = 'active'
  
    createError.value = ''
  }

  const openCreateModal = () => {
    resetCreateForm()
  
    createModalOpen.value = true
  }

  const closeCreateModal = () => {
    if (creating.value) {
      return
    }
  
    createModalOpen.value = false
  
    resetCreateForm()
  }

  const createCustomer = async () => {
    if (creating.value) {
      return
    }
  
    creating.value = true
    createError.value = ''
  
    try {
      await adminCustomerApi.create({
        name: createForm.name,
        phone: createForm.phone,
        email:
          createForm.email ||
          null,
        password:
          createForm.password,
        status:
          createForm.status,
      })
  
      createModalOpen.value =
        false
  
      resetCreateForm()
  
      await loadCustomers(1)
    } catch (error) {
      createError.value =
        getErrorMessage(
          error,
          'Không thể tạo khách hàng.',
        )
    } finally {
      creating.value = false
    }
  }

  const openCustomer = async (
    customerId: number,
  ) => {
    drawerOpen.value = true
    loadingDetail.value = true
    selectedCustomer.value = null
    editing.value = false
    formError.value = ''
  
    try {
      selectedCustomer.value =
        await adminCustomerApi.getOne(
          customerId,
        )
    } catch (error) {
      errorMessage.value =
        getErrorMessage(
          error,
          'Không thể tải thông tin khách hàng.',
        )
  
      drawerOpen.value = false
    } finally {
      loadingDetail.value = false
    }
  }

  const closeDrawer = () => {
    drawerOpen.value = false
    selectedCustomer.value = null
    editing.value = false
    formError.value = ''
  }

  const startEditing = () => {
    if (!selectedCustomer.value) {
      return
    }
  
    form.name =
      selectedCustomer.value.name
  
    form.phone =
      selectedCustomer.value.phone || ''
  
    form.email =
      selectedCustomer.value.email || ''
  
    form.status =
      selectedCustomer.value.status
  
    editing.value = true
  }

  const cancelEditing = () => {
    editing.value = false
    formError.value = ''
  }

  const saveCustomer = async () => {
    if (
      !selectedCustomer.value ||
      saving.value
    ) {
      return
    }
  
    saving.value = true
    formError.value = ''
  
    try {
      await adminCustomerApi.update(
        selectedCustomer.value.id,
        {
          name: form.name,
          phone: form.phone,
          email:
            form.email ||
            null,
          status:
            form.status,
        },
      )
  
      const id =
        selectedCustomer.value.id
  
      selectedCustomer.value =
        await adminCustomerApi.getOne(
          id,
        )
  
      editing.value = false
  
      await loadCustomers(
        pagination.current_page,
      )
    } catch (error) {
      formError.value =
        getErrorMessage(
          error,
          'Không thể cập nhật khách hàng.',
        )
    } finally {
      saving.value = false
    }
  }

  const getInitial = (
    name: string,
  ) =>
    name
      ?.trim()
      .charAt(0)
      .toUpperCase() ||
    '?'

  const formatMoney = (
    value:
      | number
      | string
      | null
      | undefined,
  ) =>
    new Intl.NumberFormat(
      'vi-VN',
      {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      },
    ).format(
      Number(value || 0),
    )

  const formatDate = (
    value: string,
  ) =>
    new Intl.DateTimeFormat(
      'vi-VN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    ).format(
      new Date(value),
    )

  const formatTime = (
    value: string,
  ) =>
    new Intl.DateTimeFormat(
      'vi-VN',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(
      new Date(value),
    )

  const formatDateTime = (
    value: string,
  ) =>
    `${formatDate(value)} · ${formatTime(value)}`

  const formatJoinedDate = (
    value: string,
  ) =>
    `Tham gia ${formatDate(value)}`

  onMounted(() => {
    loadCustomers(1)
  })

  onBeforeUnmount(() => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
  })

  return {
    ref,
    customers,
    pagination,
    loading,
    loadingDetail,
    saving,
    creating,
    errorMessage,
    formError,
    createError,
    search,
    statusFilter,
    drawerOpen,
    createModalOpen,
    editing,
    selectedCustomer,
    form,
    createForm,
    loadCustomers,
    handleSearch,
    applyFilters,
    goToPage,
    openCreateModal,
    closeCreateModal,
    createCustomer,
    openCustomer,
    closeDrawer,
    startEditing,
    cancelEditing,
    saveCustomer,
    getInitial,
    formatMoney,
    formatDate,
    formatTime,
    formatDateTime,
    formatJoinedDate,
  };
}
