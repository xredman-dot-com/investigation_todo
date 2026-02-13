<template>
  <div class="login-wrap">
    <div class="login-card rise">
      <div class="brand">格物清单 · 后台</div>
      <div class="subtitle">输入调试 code 以获取登录态</div>
      <input v-model="code" class="input" placeholder="dev-admin" />
      <button class="btn-primary" @click="handleLogin">登录</button>
      <div class="hint">本地调试可用 dev- 开头的 code</div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../stores/auth"

const code = ref("dev-admin")
const error = ref("")
const router = useRouter()
const auth = useAuthStore()

const handleLogin = async () => {
  error.value = ""
  try {
    await auth.login(code.value.trim())
    router.push("/")
  } catch (err: any) {
    error.value = err?.message || "登录失败"
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #fff6e8 0%, #f5ecdf 50%, #efe2d0 100%);
}

.login-card {
  width: min(420px, 90vw);
  padding: 32px;
  border-radius: 20px;
  background: #fffaf3;
  border: 1px solid #e6d9c7;
  box-shadow: 0 20px 40px rgba(40, 26, 10, 0.18);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brand {
  font-size: 22px;
  font-weight: 700;
}

.subtitle {
  color: #6e6358;
}

.hint {
  font-size: 12px;
  color: #6e6358;
}

.error {
  font-size: 12px;
  color: #c9491a;
}
</style>
