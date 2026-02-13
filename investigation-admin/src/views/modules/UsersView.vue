<template>
  <div>
    <h1 class="page-title">用户管理</h1>
    <p class="page-subtitle">查看用户信息并进行封禁、角色与备注管理。</p>

    <div class="section-grid two">
      <div class="card rise" style="animation-delay: 0.05s">
        <h3>用户列表</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="filters.q" class="input" placeholder="搜索 openid / 昵称" />
          <select v-model="filters.status" class="input">
            <option value="">全部状态</option>
            <option value="active">正常</option>
            <option value="banned">封禁</option>
          </select>
          <select v-model="filters.role" class="input">
            <option value="">全部角色</option>
            <option value="user">用户</option>
            <option value="admin">管理员</option>
            <option value="owner">Owner</option>
          </select>
          <button class="btn-secondary" @click="loadUsers">刷新</button>
        </div>

        <div class="list" style="margin-top: 12px;">
          <div
            class="list-item"
            v-for="user in users"
            :key="user.id"
            @click="selectUser(user)"
            style="cursor: pointer;"
          >
            <div>
              <strong>{{ user.nickname || user.openid }}</strong>
              <div class="page-subtitle">{{ user.role }} · {{ user.status }}</div>
            </div>
            <span class="badge">{{ user.last_login_at ? "最近登录" : "未登录" }}</span>
          </div>
        </div>
      </div>

      <div class="card rise" style="animation-delay: 0.12s">
        <h3>用户详情</h3>
        <div v-if="activeUser">
          <div class="page-subtitle">ID：{{ activeUser.id }}</div>
          <div class="page-subtitle">OpenID：{{ activeUser.openid }}</div>
          <div class="page-subtitle">最后登录：{{ activeUser.last_login_at || "无" }}</div>
          <div class="control-row" style="margin-top: 12px;">
            <select v-model="editForm.status" class="input">
              <option value="active">正常</option>
              <option value="banned">封禁</option>
            </select>
            <select v-model="editForm.role" class="input">
              <option value="user">用户</option>
              <option value="admin">管理员</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <div style="margin-top: 12px;">
            <textarea
              v-model="editForm.admin_remark"
              class="input"
              placeholder="管理员备注"
              style="width: 100%; min-height: 80px;"
            ></textarea>
          </div>
          <div class="control-row" style="margin-top: 12px;">
            <button class="btn-primary" @click="saveUser">保存</button>
            <button class="btn-secondary" @click="toggleBan">
              {{ editForm.status === "banned" ? "解除封禁" : "封禁" }}
            </button>
          </div>
        </div>
        <div v-else class="page-subtitle">选择左侧用户查看详情。</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { fetchAdminUsers, updateAdminUser, type UserAdminItem } from "../../api/adminUsers"

const users = ref<UserAdminItem[]>([])
const activeUser = ref<UserAdminItem | null>(null)
const filters = ref({ q: "", status: "", role: "" })
const editForm = ref({ status: "active", role: "user", admin_remark: "" })

const loadUsers = async () => {
  users.value = await fetchAdminUsers(filters.value)
}

const selectUser = (user: UserAdminItem) => {
  activeUser.value = user
  editForm.value = {
    status: user.status,
    role: user.role,
    admin_remark: user.admin_remark || ""
  }
}

const saveUser = async () => {
  if (!activeUser.value) return
  const updated = await updateAdminUser(activeUser.value.id, editForm.value)
  activeUser.value = updated
  await loadUsers()
}

const toggleBan = async () => {
  if (!activeUser.value) return
  editForm.value.status = editForm.value.status === "banned" ? "active" : "banned"
  await saveUser()
}

onMounted(loadUsers)
</script>
