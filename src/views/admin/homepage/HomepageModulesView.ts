import { computed, onMounted, reactive, ref } from 'vue'
import { homepageModuleApi, type HomepageServiceOption } from '@/services/homepageModule.api'
import type { HomepageModule } from '@/services/site.api'
import { useSiteStore } from '@/stores/site'

const MAX_SERVICES = 6

export function useHomepageModulesView() {
  const modules = ref<HomepageModule[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const showForm = ref(false)
  const editing = ref<HomepageModule | null>(null)
  const dragId = ref<number | null>(null)
  const selectedServiceDragId = ref<number | null>(null)
  const serviceOptions = ref<HomepageServiceOption[]>([])
  const serviceSearch = ref('')
  const serviceOptionsLoaded = ref(false)

  const site = useSiteStore()

  const form = reactive({
    name: '',
    title: '',
    content: '',
    custom_css: '',
    show_in_nav: true,
    nav_label: '',
    service_ids: [] as number[],
  })

  const selectedServices = computed(() => {
    const byId = new Map(serviceOptions.value.map((service) => [service.id, service]))
    return form.service_ids
      .map((id) => byId.get(id))
      .filter((service): service is HomepageServiceOption => Boolean(service))
  })

  const availableServices = computed(() => {
    const query = serviceSearch.value.trim().toLocaleLowerCase('vi')
    const selected = new Set(form.service_ids)

    return serviceOptions.value.filter((service) => {
      if (selected.has(service.id)) return false
      if (!query) return true

      return [service.name, service.category?.name || '']
        .join(' ')
        .toLocaleLowerCase('vi')
        .includes(query)
    })
  })

  const load = async () => {
    loading.value = true
    try {
      modules.value = await homepageModuleApi.list()
    } finally {
      loading.value = false
    }
  }

  const ensureServiceOptions = async () => {
    if (serviceOptionsLoaded.value) return
    serviceOptions.value = await homepageModuleApi.serviceOptions()
    serviceOptionsLoaded.value = true
  }

  const resetForm = () => {
    Object.assign(form, {
      name: '',
      title: '',
      content: '',
      custom_css: '',
      show_in_nav: true,
      nav_label: '',
      service_ids: [],
    })
    serviceSearch.value = ''
  }

  const openCreate = () => {
    editing.value = null
    resetForm()
    showForm.value = true
  }

  const openEdit = async (module: HomepageModule) => {
    editing.value = module

    const configuredServiceIds = Array.isArray(module.settings?.service_ids)
      ? module.settings?.service_ids.map(Number).filter(Number.isFinite).slice(0, MAX_SERVICES)
      : []

    Object.assign(form, {
      name: module.name,
      title: module.title || '',
      content: module.content || '',
      custom_css: module.custom_css || '',
      show_in_nav: module.show_in_nav,
      nav_label: module.nav_label || '',
      service_ids: configuredServiceIds,
    })

    serviceSearch.value = ''
    showForm.value = true

    if (module.type === 'services') {
      await ensureServiceOptions()

      // Existing installations did not have service_ids. Prefill the old featured order once in the editor.
      if (!Array.isArray(module.settings?.service_ids)) {
        form.service_ids = serviceOptions.value
          .filter((service) => service.is_featured)
          .slice(0, MAX_SERVICES)
          .map((service) => service.id)

        if (!form.service_ids.length) {
          form.service_ids = serviceOptions.value
            .slice(0, MAX_SERVICES)
            .map((service) => service.id)
        }
      }
    }
  }

  const closeForm = () => {
    if (saving.value) return
    showForm.value = false
    editing.value = null
  }

  const save = async () => {
    if (saving.value) return

    saving.value = true
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        title: form.title || null,
        show_in_nav: form.show_in_nav,
        nav_label: form.nav_label || null,
      }

      if (!editing.value || editing.value.type === 'custom_html') {
        payload.content = form.content
        payload.custom_css = form.custom_css || null
      }

      if (editing.value?.type === 'services') {
        payload.settings = {
          service_ids: [...form.service_ids].slice(0, MAX_SERVICES),
        }
      }

      if (editing.value) {
        await homepageModuleApi.update(editing.value.id, payload)
      } else {
        await homepageModuleApi.create(payload)
      }

      showForm.value = false
      editing.value = null
      await Promise.all([load(), site.load(true)])
    } finally {
      saving.value = false
    }
  }

  const toggle = async (module: HomepageModule) => {
    await homepageModuleApi.update(module.id, { is_enabled: !module.is_enabled })
    module.is_enabled = !module.is_enabled
    await site.load(true)
  }

  const remove = async (module: HomepageModule) => {
    if (!window.confirm(`Xóa module "${module.name}"?`)) return
    await homepageModuleApi.remove(module.id)
    modules.value = modules.value.filter((item) => item.id !== module.id)
    await site.load(true)
  }

  const dragStart = (id: number) => {
    dragId.value = id
  }

  const drop = async (targetId: number) => {
    const sourceId = dragId.value
    dragId.value = null

    if (!sourceId || sourceId === targetId) return

    const list = [...modules.value]
    const from = list.findIndex((module) => module.id === sourceId)
    const to = list.findIndex((module) => module.id === targetId)

    if (from < 0 || to < 0) return

    const [item] = list.splice(from, 1)
    if (!item) return

    list.splice(to, 0, item)
    modules.value = list

    await homepageModuleApi.reorder(list.map((module) => module.id))
    await site.load(true)
  }

  const addService = (service: HomepageServiceOption) => {
    if (form.service_ids.includes(service.id) || form.service_ids.length >= MAX_SERVICES) return
    form.service_ids.push(service.id)
  }

  const removeService = (serviceId: number) => {
    form.service_ids = form.service_ids.filter((id) => id !== serviceId)
  }

  const selectedServiceDragStart = (serviceId: number) => {
    selectedServiceDragId.value = serviceId
  }

  const selectedServiceDrop = (targetId: number) => {
    const sourceId = selectedServiceDragId.value
    selectedServiceDragId.value = null

    if (!sourceId || sourceId === targetId) return

    const ids = [...form.service_ids]
    const from = ids.indexOf(sourceId)
    const to = ids.indexOf(targetId)

    if (from < 0 || to < 0) return

    const [moved] = ids.splice(from, 1)
    if (moved === undefined) return

    ids.splice(to, 0, moved)
    form.service_ids = ids
  }

  onMounted(load)

  return {
    modules,
    loading,
    saving,
    showForm,
    editing,
    form,
    serviceOptions,
    serviceSearch,
    selectedServices,
    availableServices,
    maxServices: MAX_SERVICES,
    openCreate,
    openEdit,
    closeForm,
    save,
    toggle,
    remove,
    dragStart,
    drop,
    addService,
    removeService,
    selectedServiceDragStart,
    selectedServiceDrop,
  }
}
