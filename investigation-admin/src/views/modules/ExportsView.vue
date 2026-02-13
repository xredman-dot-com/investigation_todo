<template>
  <div>
    <h1 class="page-title">数据导出</h1>
    <p class="page-subtitle">获取全量 JSON 并快速预览。</p>

    <div class="card rise" style="animation-delay: 0.05s">
      <button class="btn-primary" @click="runExport">拉取导出</button>
      <textarea class="input" style="margin-top: 12px; width: 100%; min-height: 280px;" v-model="payload" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { exportFull } from "../../api/exports"

const payload = ref("")

const runExport = async () => {
  const data = await exportFull()
  payload.value = JSON.stringify(data, null, 2)
}
</script>
