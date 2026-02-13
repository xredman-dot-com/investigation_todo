<template>
  <div>
    <h1 class="page-title">时间线</h1>
    <p class="page-subtitle">按日期查看任务流。</p>

    <div class="card rise" style="animation-delay: 0.05s">
      <div class="control-row">
        <input v-model="startDate" type="date" class="input" />
        <input v-model="endDate" type="date" class="input" />
        <button class="btn-primary" @click="load">刷新</button>
      </div>
    </div>

    <div class="section-grid" style="margin-top: 16px;">
      <div class="card rise" v-for="bucket in buckets" :key="bucket.date">
        <h3>{{ bucket.date }}</h3>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="task in bucket.tasks" :key="task.id">
            <div>
              <strong>{{ task.title }}</strong>
              <div class="page-subtitle">{{ task.due_time || '无时间' }}</div>
            </div>
            <span class="badge">P{{ task.priority }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { fetchTimeline, type TimelineBucket } from "../../api/views"

const buckets = ref<TimelineBucket[]>([])
const startDate = ref("")
const endDate = ref("")

const load = async () => {
  buckets.value = await fetchTimeline({
    start_date: startDate.value || undefined,
    end_date: endDate.value || undefined
  })
}

onMounted(() => {
  const today = new Date()
  const start = new Date()
  start.setDate(today.getDate() - 7)
  startDate.value = start.toISOString().slice(0, 10)
  endDate.value = today.toISOString().slice(0, 10)
  load()
})
</script>
