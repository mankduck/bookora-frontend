<template>
  <section class="modules-page">
    <div class="module-page-header">
      <div>
        <span class="eyebrow">Giao diện</span>
        <h2>Bố cục trang chủ</h2>
        <p>Kéo thả để đổi thứ tự. Module hệ thống có thể đổi tên hoặc tắt; module HTML tùy chỉnh có thể xóa.</p>
      </div>
      <button class="primary-button" type="button" @click="openCreate">+ Thêm module HTML</button>
    </div>

    <div class="module-list">
      <div v-if="loading" class="state">Đang tải...</div>

      <article
        v-for="m in modules"
        :key="m.id"
        class="module-row"
        draggable="true"
        @dragstart="dragStart(m.id)"
        @dragover.prevent
        @drop="drop(m.id)"
      >
        <div class="drag-handle" title="Kéo để sắp xếp">⋮⋮</div>

        <div class="module-copy">
          <div>
            <strong>{{ m.name }}</strong>
            <span class="module-type">{{ m.type }}</span>
            <span v-if="m.is_locked" class="locked">Cố định</span>
          </div>
          <small>{{ m.title || 'Không có tiêu đề' }} · {{ m.show_in_nav ? 'Có trên menu' : 'Ẩn khỏi menu' }}</small>
        </div>

        <div class="module-actions">
          <button
            type="button"
            class="switch-button"
            :class="{ on: m.is_enabled }"
            :aria-label="m.is_enabled ? 'Tắt module' : 'Bật module'"
            :aria-pressed="m.is_enabled"
            @click="toggle(m)"
          >
            <span></span>
          </button>
          <button type="button" @click="openEdit(m)">Sửa</button>
          <button v-if="!m.is_locked" type="button" class="danger" @click="remove(m)">Xóa</button>
        </div>
      </article>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="module-modal" :class="{ wide: editing?.type === 'services' }">
        <div class="modal-head">
          <h3>{{ editing ? 'Chỉnh sửa module' : 'Thêm module HTML' }}</h3>
          <button type="button" :disabled="saving" @click="closeForm">×</button>
        </div>

        <div class="module-form">
          <label>
            <span>Tên module *</span>
            <input v-model="form.name" />
          </label>

          <label>
            <span>Tên hiển thị section</span>
            <input v-model="form.title" />
          </label>

          <label>
            <span>Tên trên menu</span>
            <input v-model="form.nav_label" />
          </label>

          <label class="check">
            <input v-model="form.show_in_nav" type="checkbox" />
            Hiển thị trên menu
          </label>

          <template v-if="editing?.type === 'services'">
            <div class="service-picker full">
              <div class="service-picker-heading">
                <div>
                  <strong>Dịch vụ hiển thị</strong>
                  <span>Chọn tối đa {{ maxServices }} dịch vụ và kéo thả để sắp xếp thứ tự trên trang chủ.</span>
                </div>
                <b>{{ form.service_ids.length }}/{{ maxServices }}</b>
              </div>

              <div class="service-picker-grid">
                <section class="service-picker-panel">
                  <div class="service-picker-panel-title">
                    <strong>Dịch vụ khả dụng</strong>
                    <span>Chỉ hiển thị dịch vụ đang hoạt động</span>
                  </div>

                  <input
                    v-model="serviceSearch"
                    class="service-search"
                    type="search"
                    placeholder="Tìm tên dịch vụ..."
                  />

                  <div class="service-option-list">
                    <button
                      v-for="service in availableServices"
                      :key="service.id"
                      type="button"
                      class="service-option"
                      :disabled="form.service_ids.length >= maxServices"
                      @click="addService(service)"
                    >
                      <span class="service-option-image">
                        <img v-if="service.thumbnail" :src="service.thumbnail" :alt="service.name" />
                        <i v-else>{{ service.name.charAt(0) }}</i>
                      </span>
                      <span class="service-option-copy">
                        <strong>{{ service.name }}</strong>
                        <small>{{ service.category?.name || 'Chưa có danh mục' }}</small>
                      </span>
                      <b>+</b>
                    </button>

                    <div v-if="!availableServices.length" class="service-picker-empty">
                      Không còn dịch vụ phù hợp.
                    </div>
                  </div>
                </section>

                <section class="service-picker-panel selected-panel">
                  <div class="service-picker-panel-title">
                    <strong>Đã chọn</strong>
                    <span>Kéo biểu tượng ⋮⋮ để đổi vị trí</span>
                  </div>

                  <div class="selected-service-list">
                    <article
                      v-for="(service, index) in selectedServices"
                      :key="service.id"
                      class="selected-service"
                      draggable="true"
                      @dragstart="selectedServiceDragStart(service.id)"
                      @dragover.prevent
                      @drop="selectedServiceDrop(service.id)"
                    >
                      <span class="selected-service-drag">⋮⋮</span>
                      <span class="selected-service-order">{{ index + 1 }}</span>
                      <span class="service-option-image">
                        <img v-if="service.thumbnail" :src="service.thumbnail" :alt="service.name" />
                        <i v-else>{{ service.name.charAt(0) }}</i>
                      </span>
                      <span class="service-option-copy">
                        <strong>{{ service.name }}</strong>
                        <small>{{ service.category?.name || 'Chưa có danh mục' }}</small>
                      </span>
                      <button type="button" class="remove-service" @click="removeService(service.id)">×</button>
                    </article>

                    <div v-if="!selectedServices.length" class="service-picker-empty selected-empty">
                      Chưa chọn dịch vụ nào. Trang chủ sẽ không hiển thị card dịch vụ sau khi lưu.
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </template>

          <label v-if="!editing || editing.type === 'custom_html'" class="full">
            <span>HTML hiển thị</span>
            <textarea v-model="form.content" rows="12" placeholder="<section>...</section>" />
            <small>Chỉ HTML an toàn. Script, onclick, javascript: sẽ bị loại bỏ.</small>
          </label>

          <label v-if="!editing || editing.type === 'custom_html'" class="full">
            <span>CSS riêng cho module</span>
            <textarea
              v-model="form.custom_css"
              rows="10"
              placeholder=".my-section { padding: 80px 24px; background: #181916; color: #fff; }"
            />
            <small>Nhập CSS thuần, không cần thẻ &lt;style&gt;. @import và javascript sẽ bị loại bỏ.</small>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" :disabled="saving" @click="closeForm">Hủy</button>
          <button type="button" class="primary-button" :disabled="saving" @click="save">
            {{ saving ? 'Đang lưu...' : 'Lưu' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useHomepageModulesView } from './HomepageModulesView.ts'

const {
  modules,
  loading,
  saving,
  showForm,
  editing,
  form,
  serviceSearch,
  selectedServices,
  availableServices,
  maxServices,
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
} = useHomepageModulesView()
</script>

<style scoped src="./HomepageModulesView.css"></style>
