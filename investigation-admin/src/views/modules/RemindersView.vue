<template>
  <div>
    <h1 class="page-title">提醒调度</h1>
    <p class="page-subtitle">触发提醒投递并查看日志。</p>

    <div class="section-grid two">
      <div class="card rise" style="animation-delay: 0.05s">
        <h3>触发投递</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="asOf" type="datetime-local" class="input" />
          <button class="btn-primary" @click="dispatch">立即投递</button>
        </div>
      </div>
      <div class="card rise" style="animation-delay: 0.12s">
        <h3>延后提醒</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="snoozeId" class="input" placeholder="Reminder ID" />
          <input v-model="snoozeMinutes" class="input" type="number" placeholder="分钟" />
          <button class="btn-secondary" @click="snooze">延后</button>
        </div>
      </div>
    </div>

    <div class="card rise" style="margin-top: 16px; animation-delay: 0.18s">
      <h3>投递日志</h3>
      <div class="list" style="margin-top: 12px;">
        <div class="list-item" v-for="log in logs" :key="log.id">
          <div>
            <strong>{{ log.created_at }}</strong>
            <div class="page-subtitle">{{ log.status }}</div>
          </div>
          <div class="page-subtitle">{{ log.task_id || '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { dispatchReminders, listReminderLogs, snoozeReminder, type SubscriptionMessage } from "../../api/reminderJobs"

const logs = ref<SubscriptionMessage[]>([])
const asOf = ref("")
const snoozeId = ref("")
const snoozeMinutes = ref("10")

const loadLogs = async () => {
  logs.value = await listReminderLogs()
}

const dispatch = async () => {
  await dispatchReminders(asOf.value || undefined)
  await loadLogs()
}

const snooze = async () => {
  if (!snoozeId.value) return
  await snoozeReminder(snoozeId.value, Number(snoozeMinutes.value || 10))
}

onMounted(loadLogs)
</script>
