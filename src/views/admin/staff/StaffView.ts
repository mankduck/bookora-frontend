import {
  onMounted,
  reactive,
  ref,
} from 'vue'
import axios from 'axios'
import { adminMediaApi } from '@/services/adminMedia.api'
import staffApi, {
  type Staff,
} from '@/services/staff.api'
import serviceApi, {
  type Service,
} from '@/services/service.api'

export function useStaffView() {
  const staffList = ref<Staff[]>([])

  const services = ref<Service[]>([])

  const loading = ref(false)

  const saving = ref(false)

  const search = ref('')

  const serviceFilter = ref('')

  const statusFilter = ref('')

  const modalOpen = ref(false)

  const editingStaff =
    ref<Staff | null>(null)

  const formError = ref('')

  const defaultSchedules = () =>
    Array.from({ length: 7 }, (_, day) => ({
      day_of_week: day,
      start_time: '08:00',
      end_time: '17:00',
      is_working:
        day !== 0,
    }))

  const form = reactive({
    name: '',
    email: '',
    phone: '',
    password: '',
    avatar: '',
    employee_code: '',
    position: '',
    bio: '',
    experience_years: 0,
    is_bookable: true,
    status: 'active' as
      | 'active'
      | 'inactive',
    sort_order: 0,
    service_ids: [] as number[],
    schedules: defaultSchedules(),
  })

  let searchTimer:
    | ReturnType<typeof setTimeout>
    | undefined

  const dayName = (day: number) => {
    const days = [
      'Chủ nhật',
      'Thứ hai',
      'Thứ ba',
      'Thứ tư',
      'Thứ năm',
      'Thứ sáu',
      'Thứ bảy',
    ]
  
    return days[day]
  }

  const loadServices = async () => {
    const result =
      await serviceApi.getAll({
        per_page: 100,
        status: 'active',
      })
  
    services.value = result.data
  }

  const loadStaff = async () => {
    loading.value = true
  
    try {
      const result =
        await staffApi.getAll({
          search:
            search.value || undefined,
  
          service_id:
            serviceFilter.value
              ? Number(serviceFilter.value)
              : undefined,
  
          status:
            statusFilter.value ||
            undefined,
  
          per_page: 100,
        })
  
      staffList.value =
        result.data
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
  
    searchTimer = setTimeout(
      loadStaff,
      350,
    )
  }

  const resetForm = () => {
    form.name = ''
    form.email = ''
    form.phone = ''
    form.password = ''
    form.avatar = ''
    form.employee_code = ''
    form.position = ''
    form.bio = ''
    form.experience_years = 0
    form.is_bookable = true
    form.status = 'active'
    form.sort_order = 0
    form.service_ids = []
    form.schedules =
      defaultSchedules()
  
    formError.value = ''
  }

  const openCreate = () => {
    resetForm()
    editingStaff.value = null
    modalOpen.value = true
  }

  const openEdit = (
    staff: Staff,
  ) => {
    resetForm()
  
    editingStaff.value =
      staff
  
    form.name =
      staff.user.name
  
    form.email =
      staff.user.email ?? ''
  
    form.phone =
      staff.user.phone ?? ''

    form.avatar = staff.user.avatar ?? ''
  
    form.employee_code =
      staff.employee_code ?? ''
  
    form.position =
      staff.position ?? ''
  
    form.bio =
      staff.bio ?? ''
  
    form.experience_years =
      staff.experience_years ?? 0
  
    form.is_bookable =
      staff.is_bookable
  
    form.status =
      staff.status
  
    form.sort_order =
      staff.sort_order ?? 0
  
    form.service_ids =
      staff.services.map(
        (service) => service.id,
      )
  
    const schedules =
      defaultSchedules()
  
    staff.schedules.forEach(
      (savedSchedule) => {
        const index =
          savedSchedule.day_of_week
  
        schedules[index] = {
          day_of_week:
            savedSchedule.day_of_week,
  
          start_time:
            savedSchedule.start_time
              .slice(0, 5),
  
          end_time:
            savedSchedule.end_time
              .slice(0, 5),
  
          is_working:
            savedSchedule.is_working,
        }
      },
    )
  
    form.schedules = schedules
  
    modalOpen.value = true
  }

  const closeModal = () => {
    modalOpen.value = false
    editingStaff.value = null
    resetForm()
  }

  const uploadStaffAvatar = async (event: Event) => {
    const file=(event.target as HTMLInputElement).files?.[0]
    if(!file)return
    saving.value=true
    try{form.avatar=await adminMediaApi.uploadImage(file)}
    catch{formError.value='Không thể tải ảnh nhân viên.'}
    finally{saving.value=false}
  }

  const saveStaff = async () => {
    formError.value = ''
  
    if (!form.name.trim()) {
      formError.value =
        'Vui lòng nhập họ tên.'
      return
    }
  
    if (!form.phone.trim()) {
      formError.value =
        'Vui lòng nhập số điện thoại.'
      return
    }
  
    if (
      !editingStaff.value &&
      form.password.length < 8
    ) {
      formError.value =
        'Mật khẩu phải có ít nhất 8 ký tự.'
      return
    }
  
    for (
      const schedule of form.schedules
    ) {
      if (
        schedule.is_working &&
        schedule.start_time >=
          schedule.end_time
      ) {
        formError.value =
          `${dayName(
            schedule.day_of_week,
          )}: giờ kết thúc phải sau giờ bắt đầu.`
  
        return
      }
    }
  
    saving.value = true
  
    try {
      const payload = {
        name:
          form.name.trim(),
  
        email:
          form.email.trim() ||
          null,
  
        phone:
          form.phone.trim(),
  
        password:
          form.password || undefined,

        avatar:
          form.avatar || null,
  
        employee_code:
          form.employee_code.trim() ||
          null,
  
        position:
          form.position.trim() ||
          null,
  
        bio:
          form.bio,
  
        experience_years:
          Number(
            form.experience_years,
          ),
  
        is_bookable:
          form.is_bookable,
  
        status:
          form.status,
  
        sort_order:
          Number(form.sort_order),
  
        service_ids:
          form.service_ids,
  
        schedules:
          form.schedules.map(
            (schedule) => ({
              day_of_week:
                schedule.day_of_week,
  
              start_time:
                schedule.start_time,
  
              end_time:
                schedule.end_time,
  
              is_working:
                schedule.is_working,
            }),
          ),
      }
  
      if (editingStaff.value) {
        await staffApi.update(
          editingStaff.value.id,
          payload,
        )
      } else {
        await staffApi.create(
          payload,
        )
      }
  
      closeModal()
      await loadStaff()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errors =
          error.response?.data?.errors
  
        const firstError =
          errors
            ? Object.values(errors)
                .flat()
                .at(0)
            : null
  
        formError.value =
          String(
            firstError ||
            error.response?.data?.message ||
            'Không thể lưu nhân viên.',
          )
      } else {
        formError.value =
          'Có lỗi xảy ra.'
      }
    } finally {
      saving.value = false
    }
  }

  const removeStaff = async (
    staff: Staff,
  ) => {
    if (
      !window.confirm(
        `Xóa nhân viên "${staff.user.name}"?`,
      )
    ) {
      return
    }
  
    try {
      await staffApi.remove(
        staff.id,
      )
  
      await loadStaff()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        window.alert(
          error.response?.data?.message ||
          'Không thể xóa nhân viên.',
        )
      }
    }
  }

  onMounted(async () => {
    await loadServices()
    await loadStaff()
  })

  return {
    staffList,
    services,
    loading,
    saving,
    search,
    serviceFilter,
    statusFilter,
    modalOpen,
    editingStaff,
    formError,
    form,
    dayName,
    loadStaff,
    handleSearch,
    openCreate,
    openEdit,
    closeModal,
    saveStaff,
    uploadStaffAvatar,
    removeStaff,
  };
}
