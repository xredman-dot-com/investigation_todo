<template>
  <div>
    <h1 class="page-title">番茄钟</h1>
    <p class="page-subtitle">记录专注区间与状态。</p>

    <div class="section-grid two">
      <div class="card rise" style="animation-delay: 0.05s">
        <h3>创建专注</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="form.duration" type="number" class="input" placeholder="专注分钟" />
          <input v-model="form.break_duration" type="number" class="input" placeholder="休息分钟" />
          <button class="btn-primary" @click="create">开始</button>
        </div>
      </div>
      <div class="card rise" style="animation-delay: 0.12s">
        <h3>会话列表</h3>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="session in sessions" :key="session.id">
            <div>
              <strong>{{ session.type }}</strong>
              <div class="page-subtitle">{{ session.duration }} 分钟 · {{ session.status }}</div>
            </div>
            <div class="control-row">
              <button class="btn-secondary" @click="complete(session.id)">完成</button>
              <button class="btn-secondary" @click="remove(session.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { createPomodoroSession, fetchPomodoroSessions, updatePomodoroSession, deletePomodoroSession, type PomodoroSession } from "../../api/pomodoro"

const sessions = ref<PomodoroSession[]>([])
const form = ref({ duration: "25", break_duration: "5" })

const load = async () => {
  sessions.value = await fetchPomodoroSessions()
}

const create = async () => {
  await createPomodoroSession({
    duration: Number(form.value.duration || 25),
    break_duration: Number(form.value.break_duration || 5),
    type: "focus",
    status: "running"
  })
  await load()
}

const complete = async (id: string) => {
  await updatePomodoroSession(id, {
    status: "completed",
    completed_at: new Date().toISOString()
  })
  await load()
}

const remove = async (id: string) => {
  await deletePomodoroSession(id)
  await load()
}

onMounted(load)
</script>
