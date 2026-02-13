<template>
  <div>
    <h1 class="page-title">筛选器</h1>
    <p class="page-subtitle">保存高级筛选条件并查看结果。</p>

    <div class="section-grid two">
      <div class="card rise" style="animation-delay: 0.05s">
        <h3>新建筛选器</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="form.name" class="input" placeholder="名称" />
          <input v-model="form.tag" class="input" placeholder="标签" />
          <input v-model="form.priority" type="number" class="input" placeholder="优先级" />
        </div>
        <div class="control-row" style="margin-top: 12px;">
          <select v-model="form.status" class="input">
            <option value="">全部状态</option>
            <option value="todo">待办</option>
            <option value="done">已完成</option>
          </select>
          <label class="control-row">
            <input type="checkbox" v-model="form.has_due_date" />
            仅有日期
          </label>
          <button class="btn-primary" @click="create">{{ editingId ? '更新' : '保存' }}</button>
        </div>
      </div>
      <div class="card rise" style="animation-delay: 0.12s">
        <h3>筛选器列表</h3>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="item in filters" :key="item.id">
            <div>
              <strong>{{ item.name }}</strong>
              <div class="page-subtitle">{{ item.criteria.tag || '不限' }} · {{ item.criteria.priority || '-' }}</div>
            </div>
            <div class="control-row">
              <button class="btn-secondary" @click="apply(item.id)">应用</button>
              <button class="btn-secondary" @click="edit(item)">编辑</button>
              <button class="btn-secondary" @click="remove(item.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card rise" style="margin-top: 16px; animation-delay: 0.18s">
      <h3>筛选结果</h3>
      <div class="list" style="margin-top: 12px;">
        <div class="list-item" v-for="task in tasks" :key="task.id">
          <div>
            <strong>{{ task.title }}</strong>
            <div class="page-subtitle">{{ task.due_date || '无日期' }}</div>
          </div>
          <span class="badge">P{{ task.priority }}</span>
        </div>
        <div v-if="tasks.length === 0" class="page-subtitle">暂无结果</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { createFilter, deleteFilter, fetchFilters, fetchFilterTasks, updateFilter, type FilterItem } from "../../api/filters"
import type { TaskItem } from "../../api/tasks"

const filters = ref<FilterItem[]>([])
const tasks = ref<TaskItem[]>([])
const form = ref({ name: "", tag: "", priority: "", status: "", has_due_date: false })
const editingId = ref("")

const load = async () => {
  filters.value = await fetchFilters()
}

const create = async () => {
  if (!form.value.name) return
  const payload = {
    name: form.value.name,
    criteria: {
      tag: form.value.tag || undefined,
      priority: form.value.priority ? Number(form.value.priority) : undefined,
      status: form.value.status || undefined,
      has_due_date: form.value.has_due_date
    }
  }
  if (editingId.value) {
    await updateFilter(editingId.value, payload)
  } else {
    await createFilter(payload)
  }
  form.value = { name: "", tag: "", priority: "", status: "", has_due_date: false }
  editingId.value = ""
  await load()
}

const apply = async (id: string) => {
  tasks.value = await fetchFilterTasks(id)
}

const remove = async (id: string) => {
  await deleteFilter(id)
  await load()
}

const edit = (item: FilterItem) => {
  form.value = {
    name: item.name,
    tag: item.criteria.tag || "",
    priority: item.criteria.priority ? String(item.criteria.priority) : "",
    status: item.criteria.status || "",
    has_due_date: Boolean(item.criteria.has_due_date)
  }
  editingId.value = item.id
}

onMounted(load)
</script>
