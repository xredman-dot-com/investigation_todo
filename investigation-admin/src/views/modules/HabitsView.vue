<template>
  <div>
    <h1 class="page-title">习惯</h1>
    <p class="page-subtitle">查看、创建习惯并追踪打卡。</p>

    <div class="section-grid two">
      <div class="card rise" style="animation-delay: 0.05s">
        <h3>新增习惯</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="form.name" class="input" placeholder="习惯名称" />
          <input v-model="form.target_count" type="number" class="input" placeholder="目标次数" />
          <button class="btn-primary" @click="create">{{ editingId ? '更新' : '添加' }}</button>
        </div>
      </div>
      <div class="card rise" style="animation-delay: 0.12s">
        <h3>习惯列表</h3>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="habit in habits" :key="habit.id">
            <div>
              <strong>{{ habit.name }}</strong>
              <div class="page-subtitle">连续 {{ habit.current_streak }} 天 · 累计 {{ habit.total_completed }}</div>
            </div>
            <div class="control-row">
              <button class="btn-secondary" @click="checkIn(habit.id)">打卡</button>
              <button class="btn-secondary" @click="showLogs(habit.id)">日志</button>
              <button class="btn-secondary" @click="edit(habit)">编辑</button>
              <button class="btn-secondary" @click="remove(habit.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card rise" style="margin-top: 16px; animation-delay: 0.18s">
      <h3>打卡记录</h3>
      <div class="list" style="margin-top: 12px;">
        <div class="list-item" v-for="log in logs" :key="log.id">
          <div>
            <strong>{{ log.completed_at }}</strong>
            <div class="page-subtitle">次数 {{ log.count }}</div>
          </div>
        </div>
        <div v-if="logs.length === 0" class="page-subtitle">暂无记录</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { createHabit, createHabitLog, deleteHabit, fetchHabitLogs, fetchHabits, updateHabit, type HabitItem, type HabitLogItem } from "../../api/habits"

const habits = ref<HabitItem[]>([])
const logs = ref<HabitLogItem[]>([])
const form = ref({ name: "", target_count: "" })
const editingId = ref("")

const load = async () => {
  habits.value = await fetchHabits()
}

const create = async () => {
  if (!form.value.name) return
  const payload = {
    name: form.value.name,
    target_count: form.value.target_count ? Number(form.value.target_count) : 1
  }
  if (editingId.value) {
    await updateHabit(editingId.value, payload)
  } else {
    await createHabit(payload)
  }
  form.value = { name: "", target_count: "" }
  editingId.value = ""
  await load()
}

const remove = async (id: string) => {
  await deleteHabit(id)
  await load()
}

const checkIn = async (id: string) => {
  const today = new Date().toISOString().slice(0, 10)
  await createHabitLog(id, { completed_at: today, count: 1 })
  await load()
}

const showLogs = async (id: string) => {
  logs.value = await fetchHabitLogs(id)
}

const edit = (habit: HabitItem) => {
  form.value = {
    name: habit.name,
    target_count: habit.target_count ? String(habit.target_count) : ""
  }
  editingId.value = habit.id
}

onMounted(load)
</script>
