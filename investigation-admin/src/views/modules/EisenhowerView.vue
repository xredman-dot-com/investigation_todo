<template>
  <div>
    <h1 class="page-title">四象限</h1>
    <p class="page-subtitle">按重要/紧急矩阵分布任务。</p>

    <div class="section-grid two">
      <div class="card rise" style="animation-delay: 0.05s">
        <h3>Q1 重要且紧急</h3>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="task in view?.q1 || []" :key="task.id">
            <strong>{{ task.title }}</strong>
          </div>
        </div>
      </div>
      <div class="card rise" style="animation-delay: 0.1s">
        <h3>Q2 重要不紧急</h3>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="task in view?.q2 || []" :key="task.id">
            <strong>{{ task.title }}</strong>
          </div>
        </div>
      </div>
      <div class="card rise" style="animation-delay: 0.15s">
        <h3>Q3 紧急不重要</h3>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="task in view?.q3 || []" :key="task.id">
            <strong>{{ task.title }}</strong>
          </div>
        </div>
      </div>
      <div class="card rise" style="animation-delay: 0.2s">
        <h3>Q4 不紧急不重要</h3>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="task in view?.q4 || []" :key="task.id">
            <strong>{{ task.title }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { fetchEisenhower, type EisenhowerView } from "../../api/views"

const view = ref<EisenhowerView | null>(null)

const load = async () => {
  view.value = await fetchEisenhower()
}

onMounted(load)
</script>
