<template>
  <div>
    <h1 class="page-title">任务管理</h1>
    <p class="page-subtitle">查看、创建任务并管理子任务/提醒/附件。</p>

    <div class="section-grid two">
      <div class="card rise" style="animation-delay: 0.05s">
        <h3>任务列表</h3>
        <div class="control-row" style="margin-top: 12px;">
          <select v-model="filters.list_id" class="input">
            <option value="">全部清单</option>
            <option v-for="item in lists" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
          <select v-model="filters.smart" class="input">
            <option v-for="item in smartOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <select v-model="filters.status" class="input">
            <option value="">全部状态</option>
            <option value="todo">待办</option>
            <option value="done">已完成</option>
          </select>
          <input v-model="filters.query" class="input" placeholder="搜索标题" />
          <button class="btn-secondary" @click="loadTasks">刷新</button>
        </div>

        <div class="list" style="margin-top: 12px;">
          <div
            class="list-item"
            v-for="task in tasks"
            :key="task.id"
            @click="selectTask(task)"
            style="cursor: pointer;"
          >
            <div>
              <strong>{{ task.title }}</strong>
              <div class="page-subtitle">{{ task.due_date || '无日期' }} {{ task.due_time || '' }}</div>
            </div>
            <span class="badge">P{{ task.priority }}</span>
          </div>
        </div>
      </div>

      <div class="card rise" style="animation-delay: 0.12s">
        <h3>创建任务</h3>
        <div class="control-row" style="margin-top: 12px;">
          <select v-model="createForm.list_id" class="input">
            <option v-for="item in lists" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
          <input v-model="createForm.title" class="input" placeholder="标题" />
        </div>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="createForm.due_date" type="date" class="input" />
          <input v-model="createForm.due_time" type="time" class="input" />
          <input v-model="createForm.priority" type="number" class="input" min="0" max="4" />
        </div>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="createForm.tags" class="input" placeholder="标签（逗号分隔）" />
          <button class="btn-primary" @click="handleCreate">保存</button>
        </div>
      </div>
    </div>

    <div v-if="activeTask" class="section-grid two" style="margin-top: 16px;">
      <div class="card rise" style="animation-delay: 0.16s">
        <h3>任务详情</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="editForm.title" class="input" placeholder="标题" />
          <input v-model="editForm.priority" type="number" min="0" max="4" class="input" placeholder="优先级" />
        </div>
        <div style="margin-top: 12px;">
          <textarea v-model="editForm.description" class="input" placeholder="描述" style="width: 100%; min-height: 80px;"></textarea>
        </div>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="editForm.due_date" type="date" class="input" />
          <input v-model="editForm.due_time" type="time" class="input" />
        </div>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="editForm.tags" class="input" placeholder="标签（逗号分隔）" />
          <select v-model="editForm.status" class="input">
            <option value="todo">待办</option>
            <option value="done">已完成</option>
          </select>
          <select v-model="editForm.eisenhower_quadrant" class="input">
            <option value="">自动</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
        </div>
        <div class="control-row" style="margin-top: 12px;">
          <label class="control-row">
            <input type="checkbox" v-model="editForm.is_important" />
            重要
          </label>
          <button class="btn-primary" @click="saveTask">保存修改</button>
          <button class="btn-secondary" @click="removeTask">删除任务</button>
        </div>
      </div>
      <div class="card rise" style="animation-delay: 0.2s">
        <h3>子任务</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="subtaskTitle" class="input" placeholder="子任务标题" />
          <button class="btn-primary" @click="addSubtask">添加</button>
        </div>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="subtask in subtasks" :key="subtask.id">
            <div>{{ subtask.title }}</div>
            <div class="control-row">
              <select v-model="subtask.is_completed" class="input" @change="toggleSubtask(subtask)">
                <option :value="false">待办</option>
                <option :value="true">完成</option>
              </select>
              <button class="btn-secondary" @click="removeSubtask(subtask.id)">删除</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card rise" style="animation-delay: 0.28s">
        <h3>提醒与附件</h3>
        <div class="control-row" style="margin-top: 12px;">
          <label v-for="offset in offsets" :key="offset" class="badge">
            <input type="checkbox" :value="offset" v-model="selectedOffsets" />
            {{ offset }} 分钟
          </label>
          <button class="btn-primary" @click="createOffsets">创建提醒</button>
        </div>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="manualRemindAt" type="datetime-local" class="input" />
          <button class="btn-secondary" @click="createManual">指定时间提醒</button>
        </div>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="reminder in reminders" :key="reminder.id">
            <div>{{ reminder.remind_at }}</div>
            <div class="control-row">
              <span class="badge">{{ reminder.is_sent ? '已发' : '待发' }}</span>
              <button class="btn-secondary" @click="snooze(reminder.id)">延后10分</button>
              <button class="btn-secondary" @click="removeReminder(reminder.id)">删除</button>
            </div>
          </div>
        </div>

        <div style="margin-top: 16px;">
          <input type="file" @change="uploadFile" />
          <div class="list" style="margin-top: 12px;">
            <div class="list-item" v-for="attachment in attachments" :key="attachment.id">
              <div>{{ attachment.file_name }}</div>
              <div class="control-row">
                <a class="btn-secondary" :href="attachment.cos_url" target="_blank">预览</a>
                <button class="btn-secondary" @click="removeAttachment(attachment.id)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { fetchLists, type ListItem } from "../../api/lists"
import { fetchTasks, createTask, updateTask, deleteTask, type TaskItem } from "../../api/tasks"
import { fetchSmartList } from "../../api/views"
import { fetchSubtasks, createSubtask, updateSubtask, deleteSubtask, type SubtaskItem } from "../../api/subtasks"
import { fetchAttachments, uploadAttachment, deleteAttachment, type AttachmentItem } from "../../api/attachments"
import { fetchReminders, createReminders, createRemindersFromOffsets, deleteReminder } from "../../api/reminders"
import { snoozeReminder, type ReminderItem } from "../../api/reminderJobs"

const lists = ref<ListItem[]>([])
const tasks = ref<TaskItem[]>([])
const activeTask = ref<TaskItem | null>(null)

const smartOptions = [
  { label: "全部", value: "all" },
  { label: "今天", value: "today" },
  { label: "明天", value: "tomorrow" },
  { label: "未来7天", value: "next7" },
  { label: "逾期", value: "overdue" },
  { label: "无日期", value: "nodate" },
  { label: "收件箱", value: "inbox" }
]

const filters = ref({ list_id: "", status: "", query: "", smart: "all" })
const createForm = ref({ list_id: "", title: "", due_date: "", due_time: "", priority: 0, tags: "" })
const editForm = ref({
  title: "",
  description: "",
  due_date: "",
  due_time: "",
  priority: 0,
  tags: "",
  status: "todo",
  is_important: false,
  eisenhower_quadrant: ""
})

const subtasks = ref<SubtaskItem[]>([])
const subtaskTitle = ref("")
const attachments = ref<AttachmentItem[]>([])
const reminders = ref<ReminderItem[]>([])

const offsets = [5, 15, 60, 1440]
const selectedOffsets = ref<number[]>([])
const manualRemindAt = ref("")

const loadLists = async () => {
  lists.value = await fetchLists()
  if (!createForm.value.list_id && lists.value.length) {
    createForm.value.list_id = lists.value[0].id
  }
}

const loadTasks = async () => {
  if (filters.value.smart && filters.value.smart !== "all") {
    tasks.value = await fetchSmartList(filters.value.smart, {
      list_id: filters.value.list_id || undefined,
      status: filters.value.status || undefined
    })
    return
  }
  tasks.value = await fetchTasks({
    list_id: filters.value.list_id || undefined,
    status: filters.value.status || undefined,
    query: filters.value.query || undefined
  })
}

const handleCreate = async () => {
  if (!createForm.value.title || !createForm.value.list_id) return
  const payload: Record<string, any> = {
    list_id: createForm.value.list_id,
    title: createForm.value.title,
    due_date: createForm.value.due_date || null,
    due_time: createForm.value.due_time || null,
    priority: Number(createForm.value.priority || 0),
    tags: createForm.value.tags
      ? createForm.value.tags.split(",").map((value) => value.trim()).filter(Boolean)
      : []
  }
  await createTask(payload)
  createForm.value.title = ""
  await loadTasks()
}

const selectTask = async (task: TaskItem) => {
  activeTask.value = task
  editForm.value = {
    title: task.title,
    description: task.description || "",
    due_date: task.due_date || "",
    due_time: task.due_time || "",
    priority: task.priority || 0,
    tags: task.tags ? task.tags.join(",") : "",
    status: task.status || "todo",
    is_important: Boolean(task.is_important),
    eisenhower_quadrant: task.eisenhower_quadrant || ""
  }
  await loadDetail(task.id)
}

const loadDetail = async (taskId: string) => {
  subtasks.value = await fetchSubtasks(taskId)
  attachments.value = await fetchAttachments(taskId)
  reminders.value = await fetchReminders(taskId)
}

const addSubtask = async () => {
  if (!activeTask.value || !subtaskTitle.value) return
  await createSubtask(activeTask.value.id, { title: subtaskTitle.value })
  subtaskTitle.value = ""
  await loadDetail(activeTask.value.id)
}

const toggleSubtask = async (subtask: SubtaskItem) => {
  if (!activeTask.value) return
  await updateSubtask(activeTask.value.id, subtask.id, { is_completed: subtask.is_completed })
}

const removeSubtask = async (id: string) => {
  if (!activeTask.value) return
  await deleteSubtask(activeTask.value.id, id)
  await loadDetail(activeTask.value.id)
}

const createOffsets = async () => {
  if (!activeTask.value || selectedOffsets.value.length === 0) return
  await createRemindersFromOffsets(activeTask.value.id, selectedOffsets.value)
  await loadDetail(activeTask.value.id)
}

const createManual = async () => {
  if (!activeTask.value || !manualRemindAt.value) return
  await createReminders(activeTask.value.id, [manualRemindAt.value])
  manualRemindAt.value = ""
  await loadDetail(activeTask.value.id)
}

const removeReminder = async (id: string) => {
  if (!activeTask.value) return
  await deleteReminder(activeTask.value.id, id)
  await loadDetail(activeTask.value.id)
}

const snooze = async (id: string) => {
  await snoozeReminder(id, 10)
  if (activeTask.value) {
    await loadDetail(activeTask.value.id)
  }
}

const uploadFile = async (event: Event) => {
  if (!activeTask.value) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await uploadAttachment(activeTask.value.id, file)
  input.value = ""
  await loadDetail(activeTask.value.id)
}

const removeAttachment = async (id: string) => {
  if (!activeTask.value) return
  await deleteAttachment(activeTask.value.id, id)
  await loadDetail(activeTask.value.id)
}

const saveTask = async () => {
  if (!activeTask.value) return
  await updateTask(activeTask.value.id, {
    title: editForm.value.title,
    description: editForm.value.description || null,
    due_date: editForm.value.due_date || null,
    due_time: editForm.value.due_time || null,
    priority: Number(editForm.value.priority || 0),
    tags: editForm.value.tags
      ? editForm.value.tags.split(",").map((value) => value.trim()).filter(Boolean)
      : [],
    status: editForm.value.status || "todo",
    is_important: editForm.value.is_important,
    eisenhower_quadrant: editForm.value.eisenhower_quadrant || null
  })
  await loadTasks()
}

const removeTask = async () => {
  if (!activeTask.value) return
  await deleteTask(activeTask.value.id)
  activeTask.value = null
  subtasks.value = []
  attachments.value = []
  reminders.value = []
  await loadTasks()
}

onMounted(async () => {
  await loadLists()
  await loadTasks()
})
</script>
