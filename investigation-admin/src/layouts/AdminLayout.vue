<template>
  <div class="page-shell fade-in">
    <aside class="sidebar">
      <div class="brand">格物清单 · 后台</div>
      <nav class="nav-group">
        <RouterLink class="nav-item" to="/" exact-active-class="active">仪表盘</RouterLink>
        <RouterLink class="nav-item" to="/tasks" exact-active-class="active">任务</RouterLink>
        <RouterLink class="nav-item" to="/lists" exact-active-class="active">清单</RouterLink>
        <RouterLink class="nav-item" to="/filters" exact-active-class="active">筛选器</RouterLink>
        <RouterLink class="nav-item" to="/views/timeline" exact-active-class="active">时间线</RouterLink>
        <RouterLink class="nav-item" to="/views/eisenhower" exact-active-class="active">四象限</RouterLink>
        <RouterLink class="nav-item" to="/habits" exact-active-class="active">习惯</RouterLink>
        <RouterLink class="nav-item" to="/pomodoro" exact-active-class="active">番茄钟</RouterLink>
        <RouterLink class="nav-item" to="/statistics" exact-active-class="active">统计</RouterLink>
        <RouterLink class="nav-item" to="/reminders" exact-active-class="active">提醒</RouterLink>
        <RouterLink class="nav-item" to="/exports" exact-active-class="active">导出</RouterLink>
        <RouterLink class="nav-item" to="/users" exact-active-class="active">用户管理</RouterLink>
        <RouterLink class="nav-item" to="/moderation" exact-active-class="active">内容审核</RouterLink>
        <RouterLink class="nav-item" to="/system-settings" exact-active-class="active">系统配置</RouterLink>
      </nav>
      <div style="margin-top: 24px;">
        <button class="btn-secondary" @click="logout">退出登录</button>
      </div>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth"
import { useRouter } from "vue-router"

const auth = useAuthStore()
const router = useRouter()

const logout = () => {
  auth.logout()
  router.push("/login")
}
</script>
