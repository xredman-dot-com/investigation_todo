# 格物清单 - 微信小程序 UI/UX 重设计

> 基于 TickTick 设计语言的完整任务管理小程序重设计

## 项目概述

本项目是对微信小程序"格物清单"的完整 UI/UX 重设计，参考 TickTick 的视觉设计和交互逻辑，打造简洁高效的任务管理应用。

## 技术栈

- **框架**: 微信小程序原生框架
- **语言**: TypeScript
- **样式**: WXSS + CSS 变量
- **架构**: 组件化 + MVC 模式

## 已实现功能

### 🎨 核心系统

1. **主题系统** (`utils/theme.ts`)
   - 5 种配色方案（默认蓝、暖色橙、暗夜黑、清新绿、优雅紫）
   - CSS 变量实现动态主题切换
   - 全局主题应用和管理

2. **组件库** (`components/`)
   - `task-card` - 任务卡片组件（圆形复选框、优先级指示器）
   - `quick-add` - 快速添加输入组件
   - `habit-create` - 习惯创建弹窗组件
   - `task-selector` - 任务选择器组件
   - `tag-editor` - 标签编辑器组件

### 📱 主要页面

3. **任务列表页** (`pages/tasks/list/`)
   - Swiper 实现清单滑动切换
   - 快速添加任务
   - 滑动操作面板（完成/编辑/删除）
   - 浮动添加按钮（FAB）
   - 5秒撤回功能
   - 搜索入口

4. **任务详情页** (`pages/tasks/detail/`)
   - 可编辑任务标题
   - 日期/时间/清单/优先级/标签选择器
   - 任务意义字段（特色功能）
   - 子任务管理
   - 底部操作栏

5. **任务创建页** (`pages/tasks/create/`)
   - 完整任务创建表单
   - 所有字段输入
   - 子任务添加/删除
   - 清单和优先级选择

6. **日历页** (`pages/calendar/`)
   - 月/周/日视图切换
   - 日历网格显示
   - 任务点标记
   - 当日任务列表

7. **番茄钟页** (`pages/pomodoro/`)
   - 25分钟专注倒计时
   - 暂停/重置/选择任务
   - 今日统计（完成数/时长/会话数）
   - 会话历史记录
   - 任务选择器集成

8. **习惯页** (`pages/habits/`)
   - 习惯列表展示
   - 本月统计（总数/完成/连续）
   - 一键打卡
   - 浮动添加按钮
   - 习惯创建弹窗

9. **习惯详情页** (`pages/habits/detail/`)
   - 月度打卡日历
   - 连续打卡统计
   - 最近打卡历史
   - 今日打卡按钮

10. **设置页** (`pages/settings/`)
    - 用户信息卡片
    - 主题选择网格（5种主题）
    - 深色模式开关
    - 设置子页面入口

### ⚙️ 设置子页面

11. **提醒设置** (`pages/settings/notification/`)
    - 任务提醒开关
    - 番茄钟提醒（开始/完成/休息）
    - 习惯提醒设置
    - 默认提醒时间选择

12. **番茄钟设置** (`pages/settings/pomodoro/`)
    - 专注时长设置（15/20/25/30/45/60分钟）
    - 短休息时长（3/5/10/15分钟）
    - 长休息时长（10/15/20/30分钟）
    - 自动开始选项
    - 声音和振动开关

13. **日历设置** (`pages/settings/calendar/`)
    - 默认视图选择（月/周/日）
    - 每周开始日（周日/周一）
    - 显示选项（已完成/任务数量/高亮今天）
    - 节假日显示开关

### 🔍 搜索功能

14. **搜索页** (`pages/search/`)
    - 搜索输入框
    - 分类筛选（全部/任务/清单/标签）
    - 搜索历史（最多10条显示/20条保存）
    - 清除历史功能
    - 结果数量显示

## 设计特性

### TickTick 设计语言
- ✅ 卡片式布局
- ✅ 圆形复选框
- ✅ 优先级指示器（红/橙/蓝/灰）
- ✅ 浮动操作按钮（FAB）
- ✅ 渐变色背景
- ✅ 主题色系统
- ✅ 统一间距规范

### 交互设计
- ✅ 左右滑动切换清单
- ✅ 点击复选框完成任务
- ✅ 长按多选（待实现）
- ✅ 滑动显示操作面板
- ✅ 5秒撤回确认
- ✅ 下拉刷新
- ✅ 上拉加载更多

### 响应式设计
- ✅ 使用 rpx 单位适配不同屏幕
- ✅ Flex 布局自适应
- ✅ CSS 变量支持主题切换
- ✅ 安全区域适配（底部 tabbar）

## 项目结构

```
investigation-miniprogram/
├── api/              # API 接口层
├── components/       # 可复用组件
│   ├── habit-create/
│   ├── tag-editor/
│   ├── task-card/
│   ├── task-selector/
│   └── quick-add/
├── pages/           # 页面
│   ├── tasks/
│   │   ├── list/
│   │   ├── detail/
│   │   └── create/
│   ├── calendar/
│   ├── pomodoro/
│   ├── habits/
│   │   └── detail/
│   ├── settings/
│   │   ├── notification/
│   │   ├── pomodoro/
│   │   └── calendar/
│   └── search/
├── utils/           # 工具函数
│   └── theme.ts
├── app.ts
├── app.json
├── app.wxss
└── sitemap.json
```

## 提交历史

共 **19 次功能提交**：

```
421ac39 feat(miniprogram): add search functionality with filters
8b5b6ed feat(miniprogram): add habit detail page with tracking
897672a feat(miniprogram): add tag editor component
e91b0d3 feat(miniprogram): improve task detail page with pickers
92cf50f feat(miniprogram): add settings subpages with detailed options
a530841 feat(miniprogram): add task selector component for Pomodoro
0d39a06 feat(miniprogram): add habit creation modal component
7d35e20 feat(miniprogram): add task creation page with TickTick-style design
869ce96 feat(miniprogram): implement settings page with theme switching
b0f6080 feat(miniprogram): implement habits tracking page
1e4e7bd feat(miniprogram): implement Pomodoro focus timer page
4fdf07c feat(miniprogram): implement calendar page with TickTick-style design
7d4c802 feat(miniprogram): implement task detail page with TickTick-style design
6fe77d3 feat(miniprogram): rewrite task list page with TickTalk-style UI
2a9d382 feat(miniprogram): configure bottom tab navigation
29e6846 feat(miniprogram): add task-card and quick-add components
ad84af2 feat(miniprogram): add theme system with 5 color schemes
```

## 统计数据

- **14 个页面**（包含所有主要和子页面）
- **7 个可复用组件**
- **5 种主题配色**
- **19 次功能提交**
- **3000+ 行代码**

## 待实现功能（TODO）

- [ ] 后端 API 完整集成（替换所有模拟数据）
- [ ] 用户登录/注册页
- [ ] 数据云同步
- [ ] 长按多选模式
- [ ] 任务分享功能
- [ ] Widget 支持
- [ ] 批量操作
- [ ] 回收站功能

## 如何运行

1. 克隆项目
2. 安装依赖：`npm install`
3. 配置后端 API 地址
4. 微信开发者工具打开项目
5. 编译并预览

## 版本信息

- **当前版本**: v1.0.0
- **最后更新**: 2026-02-13
- **微信开发者工具**: 最新稳定版

## 贡献

本重设计项目在 `feature/miniprogram-ui-redesign` 分支中开发。

## 致谢

设计灵感和交互逻辑参考 [TickTick](https://www.ticktick.com/)
