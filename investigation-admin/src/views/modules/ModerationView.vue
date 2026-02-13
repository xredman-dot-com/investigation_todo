<template>
  <div>
    <h1 class="page-title">内容审核</h1>
    <p class="page-subtitle">管理待审核内容并记录处理意见。</p>

    <div class="section-grid two">
      <div class="card rise" style="animation-delay: 0.05s">
        <h3>审核队列</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="filters.q" class="input" placeholder="搜索内容/ID" />
          <select v-model="filters.status" class="input">
            <option value="">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
          <input v-model="filters.content_type" class="input" placeholder="类型" />
          <button class="btn-secondary" @click="loadItems">刷新</button>
        </div>

        <div class="list" style="margin-top: 12px;">
          <div
            class="list-item"
            v-for="item in items"
            :key="item.id"
            @click="selectItem(item)"
            style="cursor: pointer;"
          >
            <div>
              <strong>{{ item.content_type }}</strong>
              <div class="page-subtitle">{{ item.content_id || "无内容 ID" }}</div>
            </div>
            <span class="badge">{{ statusLabel(item.status) }}</span>
          </div>
        </div>
      </div>

      <div class="card rise" style="animation-delay: 0.12s">
        <h3>新建审核项</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="createForm.content_type" class="input" placeholder="内容类型" />
          <input v-model="createForm.content_id" class="input" placeholder="内容 ID (可选)" />
        </div>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="createForm.reason" class="input" placeholder="原因 (可选)" />
        </div>
        <div style="margin-top: 12px;">
          <textarea
            v-model="createForm.content_text"
            class="input"
            placeholder="内容摘要/描述"
            style="width: 100%; min-height: 80px;"
          ></textarea>
        </div>
        <div style="margin-top: 12px;">
          <textarea
            v-model="createForm.content_json"
            class="input"
            placeholder="内容 JSON (可选)"
            style="width: 100%; min-height: 100px;"
          ></textarea>
        </div>
        <div class="control-row" style="margin-top: 12px;">
          <button class="btn-primary" @click="createItem">提交审核</button>
        </div>
      </div>
    </div>

    <div class="card rise" style="margin-top: 16px; animation-delay: 0.18s">
      <h3>审核详情</h3>
      <div v-if="activeItem">
        <div class="page-subtitle">ID：{{ activeItem.id }}</div>
        <div class="page-subtitle">类型：{{ activeItem.content_type }}</div>
        <div class="page-subtitle">内容 ID：{{ activeItem.content_id || "无" }}</div>
        <div class="page-subtitle">状态：{{ statusLabel(activeItem.status) }}</div>
        <div style="margin-top: 12px;">
          <textarea
            v-model="reviewForm.review_note"
            class="input"
            placeholder="审核备注"
            style="width: 100%; min-height: 80px;"
          ></textarea>
        </div>
        <div class="control-row" style="margin-top: 12px;">
          <select v-model="reviewForm.status" class="input">
            <option value="pending">待审核</option>
            <option value="approved">通过</option>
            <option value="rejected">拒绝</option>
          </select>
          <button class="btn-primary" @click="saveReview">保存</button>
          <button class="btn-secondary" @click="approve">通过</button>
          <button class="btn-secondary" @click="reject">拒绝</button>
        </div>
        <div style="margin-top: 12px;">
          <h4>内容预览</h4>
          <pre style="white-space: pre-wrap;">{{ formatContent(activeItem) }}</pre>
        </div>
      </div>
      <div v-else class="page-subtitle">选择左侧审核项查看详情。</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import {
  createModerationItem,
  fetchModerationItems,
  updateModerationItem,
  type ModerationItem
} from "../../api/moderation"

const items = ref<ModerationItem[]>([])
const activeItem = ref<ModerationItem | null>(null)
const filters = ref({ q: "", status: "", content_type: "" })
const createForm = ref({
  content_type: "",
  content_id: "",
  reason: "",
  content_text: "",
  content_json: ""
})
const reviewForm = ref({ status: "pending", review_note: "" })

const loadItems = async () => {
  items.value = await fetchModerationItems(filters.value)
}

const selectItem = (item: ModerationItem) => {
  activeItem.value = item
  reviewForm.value = {
    status: item.status,
    review_note: item.review_note || ""
  }
}

const parseJson = (text: string) => {
  if (!text.trim()) return undefined
  try {
    return JSON.parse(text)
  } catch (error) {
    return undefined
  }
}

const createItem = async () => {
  if (!createForm.value.content_type) return
  const payload = {
    content_type: createForm.value.content_type,
    content_id: createForm.value.content_id || undefined,
    reason: createForm.value.reason || undefined,
    content_text: createForm.value.content_text || undefined,
    content: parseJson(createForm.value.content_json)
  }
  await createModerationItem(payload)
  createForm.value = { content_type: "", content_id: "", reason: "", content_text: "", content_json: "" }
  await loadItems()
}

const saveReview = async () => {
  if (!activeItem.value) return
  const updated = await updateModerationItem(activeItem.value.id, reviewForm.value)
  activeItem.value = updated
  await loadItems()
}

const approve = async () => {
  reviewForm.value.status = "approved"
  await saveReview()
}

const reject = async () => {
  reviewForm.value.status = "rejected"
  await saveReview()
}

const statusLabel = (status: string) => {
  if (status === "approved") return "已通过"
  if (status === "rejected") return "已拒绝"
  return "待审核"
}

const formatContent = (item: ModerationItem) => {
  const parts: string[] = []
  if (item.content_text) {
    parts.push(item.content_text)
  }
  if (item.content) {
    parts.push(JSON.stringify(item.content, null, 2))
  }
  return parts.length ? parts.join("\n\n") : "无内容"
}

onMounted(loadItems)
</script>
