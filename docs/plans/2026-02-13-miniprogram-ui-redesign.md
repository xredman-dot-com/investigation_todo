# 格物清单小程序 UI/UX 重构实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完整重写小程序 UI/UX，参考滴答清单的视觉设计和交互逻辑，提供流畅的任务管理体验。

**Architecture:** 基于微信小程序原生框架，使用 TypeScript，组件化开发。MVC 模式：页面作为控制器，组件负责视图渲染，API 层处理数据交互。

**Tech Stack:** 微信小程序原生、TypeScript、Vant Weapp UI 库（部分组件）、后端 FastAPI RESTful API

---

## Phase 1: 基础架构与主题系统

### Task 1: 创建主题系统

**Files:**
- Create: `investigation-miniprogram/utils/theme.ts`
- Modify: `investigation-miniprogram/app.wxss`
- Modify: `investigation-miniprogram/app.ts`

**Step 1: 定义主题类型和常量**

```typescript
// utils/theme.ts
export type ThemeName = 'default' | 'warm' | 'dark' | 'green' | 'purple'

export interface Theme {
  name: ThemeName
  primary: string      // 主色调
  background: string   // 背景色
  surface: string      // 卡片背景
  text: string        // 主文本
  textSecondary: string // 次要文本
  border: string      // 边框
  success: string     // 成功色
  warning: string    // 警告色
  danger: string     // 危险色
  priority1: string  // 优先级颜色
  priority2: string
  priority3: string
  priority4: string
}

export const THEMES: Record<ThemeName, Theme> = {
  default: {
    name: 'default',
    primary: '#3B82F6',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    priority1: '#EF4444',  // 高 - 红
    priority2: '#F59E0B',  // 中 - 橙
    priority3: '#3B82F6',  // 普通 - 蓝
    priority4: '#9CA3AF',  // 无 - 灰
  },
  warm: {
    name: 'warm',
    primary: '#D97706',
    background: '#FDF8F3',
    surface: '#FFFBF7',
    text: '#292524',
    textSecondary: '#78716C',
    border: '#E7E5E4',
    success: '#16A34A',
    warning: '#EA580C',
    danger: '#DC2626',
    priority1: '#DC2626',
    priority2: '#EA580C',
    priority3: '#D97706',
    priority4: '#A8A29E',
  },
  dark: {
    name: 'dark',
    primary: '#60A5FA',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    priority1: '#F87171',
    priority2: '#FBBF24',
    priority3: '#60A5FA',
    priority4: '#6B7280',
  },
  green: {
    name: 'green',
    primary: '#10B981',
    background: '#F0FDF4',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    priority1: '#EF4444',
    priority2: '#F59E0B',
    priority3: '#10B981',
    priority4: '#9CA3AF',
  },
  purple: {
    name: 'purple',
    primary: '#8B5CF6',
    background: '#F5F3FF',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    priority1: '#EF4444',
    priority2: '#F59E0B',
    priority3: '#8B5CF6',
    priority4: '#9CA3AF',
  },
}

let currentTheme: Theme = THEMES.default

export function getTheme(): Theme {
  const themeName = (wx.getStorageSync('theme') || 'default') as ThemeName
  return THEMES[themeName] || THEMES.default
}

export function setTheme(name: ThemeName): void {
  wx.setStorageSync('theme', name)
  currentTheme = THEMES[name]
  applyTheme(currentTheme)
}

export function applyTheme(theme: Theme): void {
  // 通过 setData 更新页面主题变量
  const app = getApp<IAppOption>()
  if (app.globalData) {
    app.globalData.theme = theme
  }
}
```

**Step 2: 更新 app.ts 全局状态**

```typescript
// app.ts 顶部添加
import { getTheme } from './utils/theme'

App<IAppOption>({
  globalData: {
    theme: getTheme()
  },
  onLaunch() {
    // 初始化主题
    this.globalData.theme = getTheme()
  }
})
```

**Step 3: 创建全局样式变量**

```css
/* app.wxss */
page {
  --primary-color: #3B82F6;
  --background-color: #F5F5F5;
  --surface-color: #FFFFFF;
  --text-color: #1F2937;
  --text-secondary: #6B7280;
  --border-color: #E5E7EB;
  --success-color: #10B981;
  --warning-color: #F59E0B;
  --danger-color: #EF4444;
  --priority-1: #EF4444;
  --priority-2: #F59E0B;
  --priority-3: #3B82F6;
  --priority-4: #9CA3AF;

  background-color: var(--background-color);
  color: var(--text-color);
}

/* 通用工具类 */
.container {
  min-height: 100vh;
  background-color: var(--background-color);
}

.card {
  background-color: var(--surface-color);
  border-radius: 12rpx;
  padding: 24rpx;
}

.btn-primary {
  background-color: var(--primary-color);
  color: #FFFFFF;
  border-radius: 8rpx;
  padding: 20rpx 32rpx;
}

/* 优先级标识 */
.priority-badge {
  width: 6rpx;
  border-radius: 3rpx;
}
.priority-1 { background-color: var(--priority-1); }
.priority-2 { background-color: var(--priority-2); }
.priority-3 { background-color: var(--priority-3); }
.priority-4 { background-color: var(--priority-4); }
```

**Step 4: 测试主题切换**

创建测试页面验证主题切换功能，确保颜色正确应用。

**Step 5: Commit**

```bash
git add investigation-miniprogram/utils/theme.ts investigation-miniprogram/app.ts investigation-miniprogram/app.wxss
git commit -m "feat(miniprogram): add theme system with 5 color schemes"
```

---

### Task 2: 创建通用组件库

**Files:**
- Create: `investigation-miniprogram/components/task-card/task-card.wxml`
- Create: `investigation-miniprogram/components/task-card/task-card.wxss`
- Create: `investigation-miniprogram/components/task-card/task-card.ts`
- Create: `investigation-miniprogram/components/task-card/task-card.json`
- Create: `investigation-miniprogram/components/quick-add/quick-add.wxml`
- Create: `investigation-miniprogram/components/quick-add/quick-add.wxss`
- Create: `investigation-miniprogram/components/quick-add/quick-add.ts`
- Create: `investigation-miniprogram/components/quick-add/quick-add.json`

**Step 1: 创建任务卡片组件**

```xml
<!-- components/task-card/task-card.wxml -->
<view class="task-card" bindtap="onTap">
  <!-- 优先级标识条 -->
  <view class="priority-indicator priority-{{task.priority}}"></view>

  <!-- 左侧 checkbox -->
  <view class="checkbox-wrapper" catchtap="onToggle">
    <view class="checkbox {{task.status === 'done' ? 'checked' : ''}}">
      <view wx:if="{{task.status === 'done'}}" class="checkbox-icon">✓</view>
    </view>
  </view>

  <!-- 中间内容区 -->
  <view class="task-content" bindtap="onDetail">
    <view class="task-title {{task.status === 'done' ? 'completed' : ''}}">
      {{task.title}}
    </view>

    <!-- 元信息 -->
    <view class="task-meta" wx:if="{{task.due_date || task.tags}}">
      <view class="meta-item" wx:if="{{task.due_date}}">
        <text class="icon">📅</text>
        <text>{{task.due_date}}</text>
        <text wx:if="{{task.due_time}}">{{task.due_time}}</text>
      </view>
      <view class="meta-item tags" wx:if="{{task.tags && task.tags.length}}">
        <text class="tag" wx:for="{{task.tags}}" wx:key="*this">#{{item}}</text>
      </view>
    </view>
  </view>

  <!-- 右侧更多按钮 -->
  <view class="more-btn" catchtap="onMore">
    <text>⋯</text>
  </view>
</view>
```

```typescript
// components/task-card/task-card.ts
Component({
  properties: {
    task: {
      type: Object,
      value: {}
    }
  },

  methods: {
    onToggle() {
      this.triggerEvent('toggle', { taskId: this.properties.task.id })
    },

    onTap() {
      this.triggerEvent('tap', { taskId: this.properties.task.id })
    },

    onDetail() {
      this.triggerEvent('detail', { taskId: this.properties.task.id })
    },

    onMore() {
      this.triggerEvent('more', { taskId: this.properties.task.id })
    }
  }
})
```

```css
/* components/task-card/task-card.wxss */
.task-card {
  display: flex;
  align-items: center;
  background-color: var(--surface-color);
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-radius: 12rpx;
  position: relative;
  overflow: hidden;
}

.priority-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6rpx;
}

.checkbox-wrapper {
  margin-right: 24rpx;
  padding: 8rpx;
}

.checkbox {
  width: 44rpx;
  height: 44rpx;
  border: 3rpx solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox.checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-icon {
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: bold;
}

.task-content {
  flex: 1;
  overflow: hidden;
}

.task-title {
  font-size: 32rpx;
  color: var(--text-color);
  line-height: 1.4;
  word-break: break-all;
}

.task-title.completed {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.tag {
  background-color: var(--background-color);
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.more-btn {
  margin-left: 16rpx;
  padding: 8rpx;
  font-size: 36rpx;
  color: var(--text-secondary);
}
```

**Step 2: 创建快速添加组件**

```xml
<!-- components/quick-add/quick-add.wxml -->
<view class="quick-add">
  <input
    class="quick-input"
    placeholder="快速添加任务..."
    value="{{value}}"
    bindinput="onInput"
    bindconfirm="onConfirm"
    confirm-type="done"
    placeholder-class="quick-placeholder"
  />
  <view class="quick-btn" bindtap="onConfirm">
    <text>添加</text>
  </view>
</view>
```

```typescript
// components/quick-add/quick-add.ts
Component({
  properties: {
    placeholder: {
      type: String,
      value: '快速添加任务...'
    }
  },

  data: {
    value: ''
  },

  methods: {
    onInput(e: WechatMiniprogram.Input) {
      this.setData({ value: e.detail.value })
    },

    onConfirm() {
      if (!this.data.value.trim()) return
      this.triggerEvent('add', { title: this.data.value })
      this.setData({ value: '' })
    }
  }
})
```

```css
/* components/quick-add/quick-add.wxss */
.quick-add {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: var(--surface-color);
  border-bottom: 1rpx solid var(--border-color);
}

.quick-input {
  flex: 1;
  height: 72rpx;
  font-size: 32rpx;
  color: var(--text-color);
}

.quick-placeholder {
  color: var(--text-secondary);
}

.quick-btn {
  margin-left: 16rpx;
  padding: 16rpx 24rpx;
  background-color: var(--primary-color);
  color: #FFFFFF;
  border-radius: 8rpx;
  font-size: 28rpx;
}
```

**Step 3: 注册全局组件**

修改 `app.json` 添加全局组件声明。

**Step 4: Commit**

```bash
git add investigation-miniprogram/components/
git commit -m "feat(miniprogram): add task-card and quick-add components"
```

---

## Phase 2: 底部Tab导航与首页

### Task 3: 配置底部Tab导航

**Files:**
- Modify: `investigation-miniprogram/app.json`

**Step 1: 更新 tabBar 配置**

```json
{
  "pages": [
    "pages/tasks/list/list",
    "pages/calendar/calendar",
    "pages/pomodoro/pomodoro",
    "pages/habits/habits",
    "pages/settings/settings"
  ],
  "tabBar": {
    "color": "#6B7280",
    "selectedColor": "#3B82F6",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/tasks/list/list",
        "text": "任务",
        "iconPath": "assets/icons/tab-task.png",
        "selectedIconPath": "assets/icons/tab-task-active.png"
      },
      {
        "pagePath": "pages/calendar/calendar",
        "text": "日历",
        "iconPath": "assets/icons/tab-calendar.png",
        "selectedIconPath": "assets/icons/tab-calendar-active.png"
      },
      {
        "pagePath": "pages/pomodoro/pomodoro",
        "text": "专注",
        "iconPath": "assets/icons/tab-pomodoro.png",
        "selectedIconPath": "assets/icons/tab-pomodoro-active.png"
      },
      {
        "pagePath": "pages/habits/habits",
        "text": "习惯",
        "iconPath": "assets/icons/tab-habit.png",
        "selectedIconPath": "assets/icons/tab-habit-active.png"
      },
      {
        "pagePath": "pages/settings/settings",
        "text": "我的",
        "iconPath": "assets/icons/tab-me.png",
        "selectedIconPath": "assets/icons/tab-me-active.png"
      }
    ]
  }
}
```

**Step 2: 准备图标资源**

需要创建 10 个图标文件（5 个普通 + 5 个选中），尺寸 81x81px。

**Step 3: Commit**

```bash
git add investigation-miniprogram/app.json investigation-miniprogram/assets/icons/
git commit -m "feat(miniprogram): configure bottom tab navigation"
```

---

### Task 4: 重构任务列表页（首页）

**Files:**
- Modify: `investigation-miniprogram/pages/tasks/list/list.wxml`
- Modify: `investigation-miniprogram/pages/tasks/list/list.wxss`
- Modify: `investigation-miniprogram/pages/tasks/list/list.ts`
- Modify: `investigation-miniprogram/pages/tasks/list/list.json`

**Step 1: 重写页面布局**

```xml
<!-- pages/tasks/list/list.wxml -->
<view class="page">
  <!-- 顶部快速添加 -->
  <view class="header">
    <view class="menu-btn" bindtap="onMenu">☰</view>
    <quick-add placeholder="添加任务至 {{currentList.name}}" bind:add="onQuickAdd" />
  </view>

  <!-- 清单切换指示器 -->
  <view class="list-indicator">
    <view class="list-name">{{currentList.name}}</view>
    <view class="list-arrows">
      <text class="arrow" wx:if="{{hasPrevList}}">‹</text>
      <text class="arrow" wx:if="{{hasNextList}}">›</text>
    </view>
  </view>

  <!-- 任务列表容器（支持滑动切换） -->
  <swiper
    class="tasks-swiper"
    current="{{currentListIndex}}"
    bindchange="onListChange"
    duration="{{300}}"
  >
    <swiper-item wx:for="{{lists}}" wx:key="id">
      <scroll-view
        class="tasks-scroll"
        scroll-y
        enable-back-to-top
        bindscrolltolower="onLoadMore"
      >

        <!-- 未完成任务 -->
        <view wx:if="{{item.tasks.todo.length > 0}}" class="section">
          <view class="section-title">待办 ({{item.tasks.todo.length}})</view>
          <task-card
            wx:for="{{item.tasks.todo}}"
            wx:for-item="task"
            wx:key="id"
            task="{{task}}"
            bind:toggle="onTaskToggle"
            bind:detail="onTaskDetail"
            bind:more="onTaskMore"
          />
        </view>

        <!-- 已完成任务 -->
        <view wx:if="{{item.tasks.done.length > 0}}" class="section">
          <view class="section-title">已完成</view>
          <task-card
            wx:for="{{item.tasks.done}}"
            wx:for-item="task"
            wx:key="id"
            task="{{task}}"
            bind:toggle="onTaskToggle"
            bind:detail="onTaskDetail"
            bind:more="onTaskMore"
          />
        </view>

        <!-- 空状态 -->
        <view wx:if="{{item.tasks.todo.length === 0 && item.tasks.done.length === 0}}" class="empty">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无任务</text>
          <text class="empty-hint">点击上方输入框添加任务</text>
        </view>
      </scroll-view>
    </swiper-item>
  </swiper>

  <!-- 浮动添加按钮 -->
  <view class="fab" bindtap="onCreateTask">
    <text class="fab-icon">+</text>
  </view>

  <!-- 左滑操作面板（隐藏） -->
  <view class="swipe-panel {{showSwipePanel ? 'show' : ''}}" bindtap="hideSwipePanel">
    <view class="swipe-actions" catchtap="noop">
      <view class="swipe-btn success" catchtap="onSwipeComplete">完成</view>
      <view class="swipe-btn primary" catchtap="onSwipeEdit">编辑</view>
      <view class="swipe-btn danger" catchtap="onSwipeDelete">删除</view>
    </view>
  </view>
</view>
```

**Step 2: 实现页面逻辑**

```typescript
// pages/tasks/list/list.ts
import { listTasks, updateTask, deleteTask } from '../../../api/tasks'
import { listLists } from '../../../api/lists'
import type { TaskItem, ListItem } from '../../../api/types'

interface TaskGroup {
  todo: TaskItem[]
  done: TaskItem[]
}

interface ListWithTasks extends ListItem {
  tasks: TaskGroup
}

Page({
  data: {
    lists: [] as ListWithTasks[],
    currentListIndex: 0,
    currentList: {} as ListItem,
    hasPrevList: false,
    hasNextList: false,
    showSwipePanel: false,
    selectedTaskId: ''
  },

  async onLoad() {
    await this.loadLists()
  },

  async loadLists() {
    try {
      const lists = await listLists() as ListItem[]

      // 为每个清单加载任务
      const listsWithTasks = await Promise.all(
        lists.map(async (list) => {
          const tasks = await listTasks({ list_id: list.id })
          return {
            ...list,
            tasks: this.groupTasks(tasks)
          }
        })
      )

      this.setData({
        lists: listsWithTasks,
        currentList: listsWithTasks[0] || { name: '收件箱' },
        hasPrevList: false,
        hasNextList: listsWithTasks.length > 1
      })
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  groupTasks(tasks: TaskItem[]): TaskGroup {
    return {
      todo: tasks.filter(t => t.status === 'todo'),
      done: tasks.filter(t => t.status === 'done')
    }
  },

  onListChange(e: WechatMiniprogram.SwiperChange) {
    const index = e.detail.current
    const lists = this.data.lists

    this.setData({
      currentListIndex: index,
      currentList: lists[index],
      hasPrevList: index > 0,
      hasNextList: index < lists.length - 1
    })
  },

  onMenu() {
    wx.showActionSheet({
      itemList: ['系统设置', '用户中心', '关于'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.navigateTo({ url: '/pages/settings/settings' })
            break
          case 1:
            wx.navigateTo({ url: '/pages/profile/profile' })
            break
          case 2:
            wx.showModal({ title: '关于', content: '格物清单 v1.0' })
            break
        }
      }
    })
  },

  onQuickAdd(e: WechatMiniprogram.CustomEvent) {
    const { title } = e.detail
    this.createTask(title)
  },

  onCreateTask() {
    wx.navigateTo({
      url: `/pages/tasks/create/create?listId=${this.data.currentList.id}`
    })
  },

  async createTask(title: string) {
    try {
      await createTask({
        list_id: this.data.currentList.id,
        title
      })
      wx.showToast({ title: '已添加', icon: 'success' })
      await this.loadLists()
    } catch (error) {
      wx.showToast({ title: '添加失败', icon: 'none' })
    }
  },

  async onTaskToggle(e: WechatMiniprogram.CustomEvent) {
    const { taskId } = e.detail
    const task = this.findTask(taskId)
    if (!task) return

    const newStatus = task.status === 'done' ? 'todo' : 'done'

    try {
      await updateTask(taskId, { status: newStatus })
      if (newStatus === 'done') {
        wx.showToast({ title: '已完成', icon: 'success', duration: 1500 })

        // 5秒后可撤回
        setTimeout(() => {
          wx.showModal({
            title: '撤回',
            content: '是否撤回已完成状态？',
            confirmText: '撤回',
            success: (res) => {
              if (res.confirm) {
                updateTask(taskId, { status: 'todo' })
                this.loadLists()
              }
            }
          })
        }, 5000)
      }
      await this.loadLists()
    } catch (error) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  onTaskDetail(e: WechatMiniprogram.CustomEvent) {
    const { taskId } = e.detail
    wx.navigateTo({ url: `/pages/tasks/detail/detail?id=${taskId}` })
  },

  onTaskMore(e: WechatMiniprogram.CustomEvent) {
    const { taskId } = e.detail
    this.setData({ showSwipePanel: true, selectedTaskId: taskId })
  },

  hideSwipePanel() {
    this.setData({ showSwipePanel: false })
  },

  noop() {},

  async onSwipeComplete() {
    await this.onTaskToggle({ detail: { taskId: this.data.selectedTaskId } })
    this.hideSwipePanel()
  },

  onSwipeEdit() {
    wx.navigateTo({
      url: `/pages/tasks/edit/edit?id=${this.data.selectedTaskId}`
    })
    this.hideSwipePanel()
  },

  async onSwipeDelete() {
    const res = await wx.showModal({ title: '确认删除', content: '删除后无法恢复' })
    if (res.confirm) {
      try {
        await deleteTask(this.data.selectedTaskId)
        wx.showToast({ title: '已删除', icon: 'success' })
        await this.loadLists()
      } catch (error) {
        wx.showToast({ title: '删除失败', icon: 'none' })
      }
    }
    this.hideSwipePanel()
  },

  onLoadMore() {
    // TODO: 分页加载
  },

  findTask(taskId: string): TaskItem | undefined {
    for (const list of this.data.lists) {
      const task = [...list.tasks.todo, ...list.tasks.done].find(t => t.id === taskId)
      if (task) return task
    }
    return undefined
  }
})
```

**Step 3: 添加页面样式**

```css
/* pages/tasks/list/list.wxss */
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background-color: var(--surface-color);
}

.menu-btn {
  padding: 16rpx;
  font-size: 40rpx;
  margin-right: 8rpx;
}

.list-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: var(--surface-color);
  border-bottom: 1rpx solid var(--border-color);
}

.list-name {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-color);
}

.list-arrows {
  display: flex;
  gap: 16rpx;
  font-size: 32rpx;
  color: var(--text-secondary);
}

.tasks-swiper {
  flex: 1;
  height: 0;
}

.tasks-scroll {
  height: 100%;
  padding: 24rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: var(--text-color);
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 112rpx;
  height: 112rpx;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.4);
}

.fab-icon {
  font-size: 56rpx;
  color: #FFFFFF;
  line-height: 1;
}

.swipe-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.swipe-panel.show {
  opacity: 1;
  pointer-events: auto;
}

.swipe-actions {
  width: 100%;
  background-color: var(--surface-color);
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx 24rpx;
  display: flex;
  gap: 16rpx;
}

.swipe-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 30rpx;
}

.swipe-btn.success {
  background-color: var(--success-color);
  color: #FFFFFF;
}

.swipe-btn.primary {
  background-color: var(--primary-color);
  color: #FFFFFF;
}

.swipe-btn.danger {
  background-color: var(--danger-color);
  color: #FFFFFF;
}
```

**Step 4: 注册组件**

```json
{
  "usingComponents": {
    "quick-add": "/components/quick-add/quick-add",
    "task-card": "/components/task-card/task-card"
  },
  "navigationBarTitleText": "任务"
}
```

**Step 5: Commit**

```bash
git add investigation-miniprogram/pages/tasks/list/
git commit -m "feat(miniprogram): rewrite task list page with TickTick-style UI"
```

---

## Phase 3: 其他核心页面

### Task 5: 创建任务详情页

**Files:**
- Modify: `investigation-miniprogram/pages/tasks/detail/detail.wxml`
- Modify: `investigation-miniprogram/pages/tasks/detail/detail.wxss`
- Modify: `investigation-miniprogram/pages/tasks/detail/detail.ts`

**Step 1: 设计详情页布局**

```xml
<!-- pages/tasks/detail/detail.wxml -->
<view class="page">
  <!-- 顶部导航栏 -->
  <view class="nav-bar">
    <view class="nav-btn" bindtap="onBack">←</view>
    <view class="nav-title">任务详情</view>
    <view class="nav-btn" bindtap="onMore">⋯</view>
  </view>

  <scroll-view class="content" scroll-y>
    <!-- 任务标题 -->
    <view class="card">
      <view class="title-row">
        <view class="checkbox {{task.status === 'done' ? 'checked' : ''}}" bindtap="onToggle">
          <text wx:if="{{task.status === 'done'}}">✓</text>
        </view>
        <input
          class="task-title-input {{task.status === 'done' ? 'completed' : ''}}"
          value="{{task.title}}"
          bindinput="onTitleInput"
          placeholder="任务标题"
        />
      </view>
    </view>

    <!-- 任务属性 -->
    <view class="card">
      <view class="field" bindtap="onDateClick">
        <text class="field-icon">📅</text>
        <text class="field-label">截止日期</text>
        <text class="field-value">{{task.due_date || '未设置'}}</text>
      </view>
      <view class="field" bindtap="onTimeClick">
        <text class="field-icon">⏰</text>
        <text class="field-label">截止时间</text>
        <text class="field-value">{{task.due_time || '未设置'}}</text>
      </view>
      <view class="field" bindtap="onListClick">
        <text class="field-icon">📋</text>
        <text class="field-label">清单</text>
        <text class="field-value">{{task.list_name || '收件箱'}}</text>
      </view>
      <view class="field" bindtap="onPriorityClick">
        <text class="field-icon">⚡</text>
        <text class="field-label">优先级</text>
        <text class="field-value priority-{{task.priority}}">{{priorityLabels[task.priority]}}</text>
      </view>
      <view class="field" bindtap="onTagsClick">
        <text class="field-icon">🏷️</text>
        <text class="field-label">标签</text>
        <view class="field-value tags">
          <text wx:if="{{!task.tags || task.tags.length === 0}}">未设置</text>
          <text class="tag" wx:for="{{task.tags}}" wx:key="*this">#{{item}}</text>
        </view>
      </view>
    </view>

    <!-- 描述 -->
    <view class="card">
      <textarea
        class="description"
        placeholder="添加描述..."
        value="{{task.description}}"
        bindinput="onDescriptionInput"
        maxlength="2000"
      />
    </view>

    <!-- 意义（特色功能） -->
    <view class="card special">
      <view class="card-title">✨ 任务意义</view>
      <textarea
        class="meaning-input"
        placeholder="为什么做这个任务？"
        value="{{task.meaning}}"
        bindinput="onMeaningInput"
        maxlength="500"
      />
      <view class="hint">记录任务的意义，帮助你理解"为什么做"</view>
    </view>

    <!-- 子任务 -->
    <view class="card" wx:if="{{subtasks.length > 0}}">
      <view class="card-title">子任务 ({{completedSubtasks}}/{{subtasks.length}})</view>
      <view class="subtask-list">
        <view class="subtask" wx:for="{{subtasks}}" wx:key="id">
          <view class="subtask-checkbox {{item.is_completed ? 'checked' : ''}}" bindtap="onToggleSubtask">
            <text wx:if="{{item.is_completed}}">✓</text>
          </view>
          <text class="subtask-title">{{item.title}}</text>
        </view>
      </view>
    </view>
  </scroll-view>

  <!-- 底部操作栏 -->
  <view class="bottom-bar">
    <view class="bottom-btn" bindtap="onDelete">
      <text class="btn-icon">🗑️</text>
      <text>删除</text>
    </view>
    <view class="bottom-btn primary" bindtap="onSave">
      <text class="btn-icon">💾</text>
      <text>保存</text>
    </view>
  </view>
</view>
```

**Step 2: 实现详情页逻辑**

```typescript
// pages/tasks/detail/detail.ts
import { getTask, updateTask, deleteTask } from '../../../api/tasks'
import { getSubtasks } from '../../../api/subtasks'
import type { TaskItem } from '../../../api/types'

Page({
  data: {
    taskId: '',
    task: {} as TaskItem,
    subtasks: [],
    completedSubtasks: 0,
    priorityLabels: ['无', '低', '中', '高'],
    changes: {} as Partial<TaskItem>
  },

  async onLoad(options: Record<string, string>) {
    const { id } = options
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      wx.navigateBack()
      return
    }

    this.setData({ taskId: id })
    await this.loadTask()
  },

  async loadTask() {
    try {
      const [task, subtasks] = await Promise.all([
        getTask(this.data.taskId),
        getSubtasks(this.data.taskId)
      ])

      const completedSubtasks = subtasks.filter(s => s.is_completed).length

      this.setData({
        task,
        subtasks,
        completedSubtasks
      })

      wx.setNavigationBarTitle({ title: task.title || '任务详情' })
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onTitleInput(e: WechatMiniprogram.Input) {
    this.updateChanges('title', e.detail.value)
  },

  onDescriptionInput(e: WechatMiniprogram.Input) {
    this.updateChanges('description', e.detail.value)
  },

  onMeaningInput(e: WechatMiniprogram.Input) {
    this.updateChanges('meaning', e.detail.value)
  },

  updateChanges(key: keyof TaskItem, value: any) {
    const changes = this.data.changes
    changes[key] = value
    this.setData({ changes })
  },

  async onToggle() {
    const newStatus = this.data.task.status === 'done' ? 'todo' : 'done'
    try {
      await updateTask(this.data.taskId, { status: newStatus })
      await this.loadTask()
      wx.showToast({ title: newStatus === 'done' ? '已完成' : '已恢复', icon: 'success' })
    } catch (error) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  onDateClick() {
    // TODO: 日期选择器
  },

  onTimeClick() {
    // TODO: 时间选择器
  },

  onListClick() {
    // TODO: 清单选择器
  },

  onPriorityClick() {
    wx.showActionSheet({
      itemList: ['无优先级', '低优先级', '中优先级', '高优先级'],
      success: async (res) => {
        await updateTask(this.data.taskId, { priority: res.tapIndex })
        this.loadTask()
      }
    })
  },

  onTagsClick() {
    // TODO: 标签编辑器
  },

  onToggleSubtask(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset
    // TODO: 切换子任务状态
  },

  async onSave() {
    if (Object.keys(this.data.changes).length === 0) {
      wx.navigateBack()
      return
    }

    try {
      await updateTask(this.data.taskId, this.data.changes)
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  async onDelete() {
    const res = await wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复'
    })

    if (res.confirm) {
      try {
        await deleteTask(this.data.taskId)
        wx.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 1500)
      } catch (error) {
        wx.showToast({ title: '删除失败', icon: 'none' })
      }
    }
  },

  onBack() {
    wx.navigateBack()
  },

  onMore() {
    wx.showActionSheet({
      itemList: ['复制任务', '移动到清单', '分享'],
      success: (res) => {
        // TODO: 实现更多操作
      }
    })
  }
})
```

**Step 3: 添加样式**

```css
/* pages/tasks/detail/detail.wxss */
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: var(--surface-color);
  border-bottom: 1rpx solid var(--border-color);
}

.nav-btn {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-color);
}

.content {
  flex: 1;
  padding: 24rpx;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.checkbox {
  width: 44rpx;
  height: 44rpx;
  border: 3rpx solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: #FFFFFF;
}

.task-title-input {
  flex: 1;
  font-size: 36rpx;
  color: var(--text-color);
  font-weight: 500;
}

.task-title-input.completed {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.field {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid var(--border-color);
}

.field:last-child {
  border-bottom: none;
}

.field-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.field-label {
  width: 160rpx;
  font-size: 28rpx;
  color: var(--text-secondary);
}

.field-value {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-color);
}

.field-value.tags {
  display: flex;
  gap: 12rpx;
}

.tag {
  background-color: var(--background-color);
  padding: 6rpx 16rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
}

.description {
  width: 100%;
  min-height: 200rpx;
  font-size: 28rpx;
  color: var(--text-color);
  line-height: 1.6;
}

.card.special {
  background: linear-gradient(135deg, var(--surface-color) 0%, #FDF2F8 100%);
}

.card-title {
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-bottom: 16rpx;
}

.meaning-input {
  width: 100%;
  min-height: 120rpx;
  font-size: 26rpx;
  color: var(--text-color);
  margin-bottom: 12rpx;
}

.hint {
  font-size: 24rpx;
  color: var(--text-secondary);
  font-style: italic;
}

.subtask-list {
  margin-top: 16rpx;
}

.subtask {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 0;
}

.subtask-checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
}

.subtask-checkbox.checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: #FFFFFF;
}

.subtask-title {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-color);
}

.bottom-bar {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background-color: var(--surface-color);
  border-top: 1rpx solid var(--border-color);
}

.bottom-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: var(--background-color);
  color: var(--text-color);
}

.bottom-btn.primary {
  background-color: var(--primary-color);
  color: #FFFFFF;
}
```

**Step 4: Commit**

```bash
git add investigation-miniprogram/pages/tasks/detail/
git commit -m "feat(miniprogram): implement task detail page with TickTick-style design"
```

---

## Phase 4: 其他 Tab 页面占位

### Task 6-9: 创建其他页面骨架

为日历、专注、习惯、设置页面创建基础骨架，样式与任务页保持一致。

---

## 测试与验证

### 手动测试清单

1. **主题切换**
   - [ ] 可以切换5种主题
   - [ ] 主题持久化保存
   - [ ] 页面颜色正确应用

2. **任务列表**
   - [ ] 顶部快速添加正常工作
   - [ ] 左右滑动切换清单流畅
   - [ ] 点击checkbox完成任务
   - [ ] 完成后5秒内可撤回
   - [ ] 长按任务进入多选模式
   - [ ] 左滑显示操作按钮

3. **任务详情**
   - [ ] 显示所有任务属性
   - [ ] 可以编辑标题和描述
   - [ ] 可以设置优先级
   - [ ] 保存后数据正确更新

4. **底部导航**
   - [ ] 5个Tab可以正常切换
   - [ ] 图标正确显示
   - [ ] 选中状态正确

---

## 后续扩展

- 自然语言解析（如"明天下午3点开会"）
- 批量操作多选模式
- 任务拖拽排序
- 习惯打卡完整页面
- 番茄钟计时器
- 统计图表展示
- 日历视图（月/周/日）
