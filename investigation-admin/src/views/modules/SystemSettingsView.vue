<template>
  <div>
    <h1 class="page-title">系统配置</h1>
    <p class="page-subtitle">集中管理后台配置项，支持 JSON 值。</p>

    <div class="section-grid two">
      <div class="card rise" style="animation-delay: 0.05s">
        <h3>配置列表</h3>
        <div class="control-row" style="margin-top: 12px;">
          <button class="btn-secondary" @click="loadSettings">刷新</button>
        </div>
        <div class="list" style="margin-top: 12px;">
          <div
            class="list-item"
            v-for="setting in settings"
            :key="setting.id"
            @click="selectSetting(setting)"
            style="cursor: pointer;"
          >
            <div>
              <strong>{{ setting.key }}</strong>
              <div class="page-subtitle">{{ formatValue(setting.value) }}</div>
            </div>
            <span class="badge">已配置</span>
          </div>
        </div>
      </div>

      <div class="card rise" style="animation-delay: 0.12s">
        <h3>编辑配置</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="form.key" class="input" placeholder="配置键" />
        </div>
        <div style="margin-top: 12px;">
          <textarea
            v-model="form.description"
            class="input"
            placeholder="配置描述"
            style="width: 100%; min-height: 60px;"
          ></textarea>
        </div>
        <div style="margin-top: 12px;">
          <textarea
            v-model="form.valueText"
            class="input"
            placeholder='配置值 (支持 JSON，例如 {"enabled": true})'
            style="width: 100%; min-height: 140px;"
          ></textarea>
        </div>
        <div class="control-row" style="margin-top: 12px;">
          <button class="btn-primary" @click="saveSetting">保存</button>
          <button class="btn-secondary" @click="resetForm">清空</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { fetchSystemSettings, updateSystemSetting, type SystemSettingItem } from "../../api/systemSettings"

const settings = ref<SystemSettingItem[]>([])
const form = ref({ key: "", description: "", valueText: "" })

const loadSettings = async () => {
  settings.value = await fetchSystemSettings()
}

const selectSetting = (setting: SystemSettingItem) => {
  form.value = {
    key: setting.key,
    description: setting.description || "",
    valueText: formatValue(setting.value, true)
  }
}

const parseValue = (text: string) => {
  if (!text.trim()) return null
  try {
    return JSON.parse(text)
  } catch (error) {
    return text
  }
}

const saveSetting = async () => {
  if (!form.value.key) return
  const payload = {
    value: parseValue(form.value.valueText),
    description: form.value.description
  }
  await updateSystemSetting(form.value.key, payload)
  await loadSettings()
}

const resetForm = () => {
  form.value = { key: "", description: "", valueText: "" }
}

const formatValue = (value: any, pretty = false) => {
  if (value === null || value === undefined) return "空"
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, pretty ? 2 : 0)
  } catch (error) {
    return String(value)
  }
}

onMounted(loadSettings)
</script>
