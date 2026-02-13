<template>
  <div>
    <h1 class="page-title">清单管理</h1>
    <p class="page-subtitle">查看并维护清单分类。</p>

    <div class="section-grid two">
      <div class="card rise" style="animation-delay: 0.05s">
        <h3>新建清单</h3>
        <div class="control-row" style="margin-top: 12px;">
          <input v-model="form.name" class="input" placeholder="清单名称" />
          <input v-model="form.icon" class="input" placeholder="图标" />
          <input v-model="form.color" class="input" placeholder="颜色" />
          <button class="btn-primary" @click="handleCreate">创建</button>
        </div>
      </div>
      <div class="card rise" style="animation-delay: 0.12s">
        <h3>清单列表</h3>
        <div class="list" style="margin-top: 12px;">
          <div class="list-item" v-for="item in lists" :key="item.id">
            <div>
              <strong>{{ item.name }}</strong>
              <div class="page-subtitle">{{ item.icon || '无图标' }} · {{ item.color || '无颜色' }}</div>
            </div>
            <div class="control-row">
              <button class="btn-secondary" @click="edit(item)">编辑</button>
              <button class="btn-secondary" @click="remove(item.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editing" class="card rise" style="margin-top: 16px; animation-delay: 0.18s">
      <h3>编辑清单</h3>
      <div class="control-row" style="margin-top: 12px;">
        <input v-model="editing.name" class="input" placeholder="名称" />
        <input v-model="editing.icon" class="input" placeholder="图标" />
        <input v-model="editing.color" class="input" placeholder="颜色" />
        <button class="btn-primary" @click="update">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { createList, deleteList, fetchLists, updateList, type ListItem } from "../../api/lists"

const lists = ref<ListItem[]>([])
const form = ref({ name: "", icon: "", color: "" })
const editing = ref<ListItem | null>(null)

const load = async () => {
  lists.value = await fetchLists()
}

const handleCreate = async () => {
  if (!form.value.name) return
  await createList({
    name: form.value.name,
    icon: form.value.icon || null,
    color: form.value.color || null
  })
  form.value = { name: "", icon: "", color: "" }
  await load()
}

const edit = (item: ListItem) => {
  editing.value = { ...item }
}

const update = async () => {
  if (!editing.value) return
  await updateList(editing.value.id, {
    name: editing.value.name,
    icon: editing.value.icon,
    color: editing.value.color
  })
  editing.value = null
  await load()
}

const remove = async (id: string) => {
  await deleteList(id)
  await load()
}

onMounted(load)
</script>
