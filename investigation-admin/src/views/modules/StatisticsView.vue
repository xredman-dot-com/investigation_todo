<template>
  <div>
    <h1 class="page-title">统计</h1>
    <p class="page-subtitle">查看任务、习惯与专注数据。</p>

    <div class="card rise" style="animation-delay: 0.05s">
      <div class="control-row">
        <input v-model="startDate" type="date" class="input" />
        <input v-model="endDate" type="date" class="input" />
        <button class="btn-primary" @click="load">刷新</button>
      </div>
    </div>

    <div class="card rise" style="margin-top: 16px; animation-delay: 0.12s">
      <h3>每日统计</h3>
      <div class="list" style="margin-top: 12px;">
        <div class="list-item" v-for="stat in stats" :key="stat.stat_date">
          <div>
            <strong>{{ stat.stat_date }}</strong>
            <div class="page-subtitle">完成 {{ stat.tasks_completed }} / 创建 {{ stat.tasks_created }}</div>
          </div>
          <div class="page-subtitle">番茄 {{ stat.pomodoro_count }} · 习惯 {{ stat.habits_completed }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { fetchDailyStats, type DailyStat } from "../../api/statistics"

const stats = ref<DailyStat[]>([])
const startDate = ref("")
const endDate = ref("")

const load = async () => {
  stats.value = await fetchDailyStats({
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
