<template>
  <div>
    <h1 class="page-title">仪表盘</h1>
    <p class="page-subtitle">今日节奏与系统状态一览</p>

    <div class="section-grid three">
      <div class="card rise" style="animation-delay: 0.05s">
        <div class="badge">待办</div>
        <h2>{{ summary?.active_tasks_count || 0 }}</h2>
        <p class="page-subtitle">当前未完成任务</p>
      </div>
      <div class="card rise" style="animation-delay: 0.12s">
        <div class="badge">今日到期</div>
        <h2>{{ summary?.tasks_due_today_count || 0 }}</h2>
        <p class="page-subtitle">需要今日完成</p>
      </div>
      <div class="card rise" style="animation-delay: 0.18s">
        <div class="badge">习惯完成</div>
        <h2>{{ summary?.habits_completed || 0 }} / {{ summary?.habits_total || 0 }}</h2>
        <p class="page-subtitle">今日打卡进度</p>
      </div>
    </div>

    <div class="section-grid two" style="margin-top: 16px;">
      <div class="card rise" style="animation-delay: 0.25s">
        <h3>今日任务</h3>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="task in summary?.tasks_due_today || []" :key="task.id">
            <div>
              <strong>{{ task.title }}</strong>
              <div class="page-subtitle">{{ task.due_time || '未设时间' }}</div>
            </div>
            <span class="badge">P{{ task.priority }}</span>
          </div>
          <div v-if="!summary || summary.tasks_due_today.length === 0" class="page-subtitle">暂无到期任务</div>
        </div>
      </div>
      <div class="card rise" style="animation-delay: 0.32s">
        <h3>逾期任务</h3>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="task in summary?.tasks_overdue || []" :key="task.id">
            <div>
              <strong>{{ task.title }}</strong>
              <div class="page-subtitle">{{ task.due_date || '无日期' }}</div>
            </div>
            <span class="badge">逾期</span>
          </div>
          <div v-if="!summary || summary.tasks_overdue.length === 0" class="page-subtitle">暂无逾期任务</div>
        </div>
      </div>
    </div>

    <div class="card rise" style="margin-top: 16px; animation-delay: 0.38s">
      <h3>最近 7 天</h3>
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
import { fetchWidgetSummary, type WidgetSummary } from "../api/widgets"
import { fetchDailyStats, type DailyStat } from "../api/statistics"

const summary = ref<WidgetSummary | null>(null)
const stats = ref<DailyStat[]>([])

const load = async () => {
  summary.value = await fetchWidgetSummary(5)
  const today = new Date()
  const start = new Date()
  start.setDate(today.getDate() - 6)
  const startDate = start.toISOString().slice(0, 10)
  const endDate = today.toISOString().slice(0, 10)
  stats.value = await fetchDailyStats({ start_date: startDate, end_date: endDate })
}

onMounted(() => {
  load()
})
</script>
