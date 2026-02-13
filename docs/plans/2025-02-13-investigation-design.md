# 格物清单（Investigation）产品设计文档

**版本**: v1.1
**日期**: 2026-02-13
**设计者**: Claude + User

---

## 目录
1. [产品定位与核心理念](#产品定位与核心理念)
2. [竞品调研与结论](#竞品调研与结论)
3. [技术架构](#技术架构)
4. [核心功能模块](#核心功能模块)
5. [数据模型设计](#数据模型设计)
6. [后台管理系统](#后台管理系统)
7. [交互设计要点](#交互设计要点)
8. [第一版MVP范围](#第一版mvp范围)
9. [后续版本规划](#后续版本规划)

---

## 产品定位与核心理念

### 产品定位
**格物清单**是一款面向"自我提升者"的微信小程序任务管理工具。第一版核心目标是提供与滴答清单对等的个人任务管理功能，同时为后续的"格物致知"特色功能奠定基础。

### 核心理念体现
虽然第一版不直接推出回顾功能，且不采集反思数据，但交互设计上要埋下"格物"的种子：
- **任务创建引导**：除了常规的任务名、日期、优先级，增加"意义"字段（可选），引导用户思考"为什么做这个任务"
- **完成时刻的仪式感**：任务完成时显示简短祝贺语，体现"格物"的成就感
- **数据结构预留**：任务表包含 `insights`（感悟）、`completion_quality`（完成质量1-5分）、`reflection_time`（反思时长）等字段，第一版隐藏，后续开放

### 目标用户
- **自我提升者**：对个人成长有追求，愿意花时间回顾反思，记录心得，重视"格物致知"的哲学层面
- 不做用户细分，产品设计要兼顾效率控和深度用户，功能分层（基础功能简单，高级功能深入）

### 与滴答清单的差异点
1. **微信通知提醒**：第一版唯一差异点，使用微信小程序订阅消息能力
2. **哲学内核**：虽然是工具产品，但界面文案、交互反馈体现"成长"而非"效率"导向
3. **未来扩展性**：数据结构为"回顾"和"知识沉淀"预留空间

---

## 竞品调研与结论

> 详见 `docs/plans/2026-02-13-competitive-research.md`

### 竞品范围（个人任务管理）
- **国内**：TickTick（滴答清单）
- **海外**：Todoist、Microsoft To Do、Things 3、OmniFocus、Apple Reminders、Google Tasks、Habitica

### 关键共性与趋势
- **任务与清单为核心**：普遍支持标签/优先级/重复/子任务
- **计划视图**：列表 + 日历为标配，部分提供看板/时间线/Eisenhower
- **快速录入**：自然语言解析与快捷输入成为标准体验
- **提醒与同步**：多端同步 + 提醒是留存关键能力
- **统计偏效率**：多强调完成率/专注时长，缺少“反思/意义”闭环

### TickTick 对齐基线（V1）
- **日历视图、看板、时间线**
- **Eisenhower Matrix（四象限）**
- **Pomodoro/Focus + 统计**
- **Habit Tracker + Habit Review**
- **Filters/Tags/Smart Recognition**
- **Widgets**
- **Calendar Subscriptions/Integration**

### 差异化机会（格物）
- **任务意义与完成质量**：在创建/完成节点引导记录
- **周期回顾**：从完成率转向成长洞察（周/月总结）
- **反思沉淀**：形成可检索的“感悟/方法”知识库

---

## 技术架构

### 工程结构
本项目采用**三个独立工程**的架构：

```
investigation-todo/
├── investigation-miniprogram/    # 微信小程序端
├── investigation-admin/          # 后台管理PC端
└── investigation-backend/        # 后端服务（API）
```

### 1. 微信小程序端（investigation-miniprogram）
**技术栈**：
- 框架：微信小程序原生框架（WXML + WXSS + TypeScript）
- UI组件：WeUI / Vant Weapp
- 状态管理：小程序原生 globalData 或 MobX
- 网络请求：wx.request 封装

**核心职责**：
- C端用户任务管理
- 习惯打卡、倒数日、番茄钟
- 数据统计展示
- 微信订阅消息处理
- 小组件展示

**部署**：
- 微信小程序平台
- 无需服务器部署

### 2. 后台管理PC端（investigation-admin）
**技术栈**：
- 框架：Vue 3 + TypeScript
- UI组件：Element Plus / Ant Design Vue
- 状态管理：Pinia
- 路由：Vue Router
- 构建工具：Vite

**核心职责**：
- 用户管理（查看、封禁、解封）
- 数据统计看板
- 系统配置管理
- 内容审核
- 操作日志审计

**部署**：
- 腾讯云COS（静态托管）
- CDN加速

### 3. 后端服务（investigation-backend）
**技术栈**：
- 框架：FastAPI（Python 3.11+）
- ORM：SQLAlchemy 2.0
- 数据库迁移：Alembic
- 任务队列：Celery + Redis
- 缓存：Redis
- 验证：Pydantic v2

**核心职责**：
- RESTful API提供
- 微信小程序登录授权
- 业务逻辑处理
- 定时任务调度（提醒发送）
- 数据统计分析
- 文件上传（本地存储适配器，支持切换 COS）

**部署**：
- 腾讯云CVM / TKE（容器化部署）
- Nginx反向代理
- Gunicorn + Uvicorn workers

### 4. 共享基础设施
**数据库**：
- PostgreSQL 15+（关系型数据，JSON字段支持灵活扩展）
- 连接池：SQLAlchemy连接池

**缓存**：
- 腾讯云Redis（缓存/定时任务队列/会话存储）

**对象存储**：
- 本地文件存储（V1 默认，开发/小规模场景）
- 腾讯云COS（可通过 .env 切换，附件/图片等文件存储；后续接入 STS）

**消息推送**：
- 微信小程序订阅消息能力

### 5. 工程间通信
```
微信小程序 <---> 后端API (RESTful/HTTPS)
后台管理PC <---> 后端API (RESTful/HTTPS)
后端API <---> PostgreSQL/Redis/Storage（本地或COS）
```

### 6. 技术选型理由
**微信小程序原生框架**：
- 更好的性能和用户体验
- 完整的微信能力支持（订阅消息、语音识别等）
- 避免uni-app等跨平台框架的兼容性问题

**Vue 3 + Element Plus**：
- 现代化、易用的后台管理方案
- 丰富的组件库
- 优秀的TypeScript支持

**FastAPI**：
- 高性能异步框架
- 自动API文档（Swagger/ReDoc）
- 原生Pydantic数据验证
- 优秀的Python 3.11+异步特性支持

---

## 核心功能模块

> 模块覆盖完整路线图，V1 以 TickTick 对齐为主，未纳入 V1 的模块见后文分期说明。

### 1. 任务管理模块
- **CRUD操作**：创建、编辑、删除、归档任务
- **任务属性**：标题、描述、清单分类、截止日期/时间、优先级（4级）、标签、重复规则、子任务、附件（图片）、备注、意义（可选）
- **多级子任务**：支持多级任务拆解，父子任务关联
- **任务状态**：待办、已完成、已归档
- **批量操作**：批量删除、批量移动、批量修改日期
- **拖拽交互**：拖拽修改日期、手动排序

### 2. 清单管理模块
- **清单分类**：创建自定义清单（收件箱、工作、个人等）
- **清单排序**：手动排序、按名称、按创建时间
- **清单图标/颜色**：个性化定制
- **三栏列表视图**：多清单并排展示

### 3. 日历视图模块
- **多视图支持**：月视图/周视图/日视图/列表视图/时间线视图/网格视图
- **拖拽交互**：拖拽修改日期
- **日期筛选**：按日期查看任务
- **缩放操作**： pinch-to-zoom手势调整视图

### 4. 提醒通知模块
- **订阅消息管理**：引导用户订阅"任务提醒"模板消息
- **提醒规则**：提前5分钟、15分钟、1小时、1天等
- **智能提醒**：基于任务优先级和截止时间的智能提醒建议
- **特殊提醒**：生日提醒、约会提醒、还款提醒等

### 5. 番茄钟模块
- **与任务关联**：从任务卡片启动番茄钟，完成后记录到任务
- **独立使用**：不关联任务，独立计时
- **番茄钟设置**：自定义专注时长、短休息、长休息、长休息间隔
- **自动开始**：自动开始休息/专注（可选）
- **提示音/震动**：可配置的提醒方式
- **统计记录**：每日番茄数、累计专注时长

### 6. 计时器模块
- **正向计时**：记录任务实际耗时
- **倒计时**：任务截止倒计时、通用倒计时器
- **与任务联动**：任务开始时启动正向计时，完成后记录实际用时

### 7. 倒数日模块
- **首页卡片展示**：最近的重要倒数日
- **正数/负数**："还有X天"或"已过X天"
- **每年重复**：生日、纪念日等自动循环
- **微信通知**：提前提醒（30天、7天、1天、当天）
- **分类管理**：生活/工作/学习/纪念日

### 8. 习惯打卡模块
- **习惯库**：12种常见习惯模板，快速添加
- **打卡日历**：月度打卡表，可视化展示
- **统计反馈**：当前连续天数、最长连续天数、累计完成次数
- **部分打卡**：目标5页实际3页也可记录
- **提醒功能**：每日打卡提醒
- **养成/戒除**：支持正向习惯和负向习惯

### 9. 目标管理模块（OKR）
- **目标创建**：设定目标、描述、时间范围、目标值
- **关键结果**：分解可衡量的关键结果
- **进度跟踪**：进度条展示，实时更新
- **与任务关联**：任务可关联到目标/关键结果
- **目标分类**：按时间/类别管理

### 10. 自然语言处理模块
- **智能解析**：识别"明天下午3点开会 #工作 P1 重复每周"
- **识别内容**：日期、时间、优先级、标签、清单、重复规则
- **快速添加**：简化的快速添加界面
- **语音输入**：语音转文字后智能解析

### 11. 四象限视图模块
- **自动分类**：基于优先级和截止日期自动归类到四个象限
- **手动调整**：支持用户手动调整象限
- **筛选视图**：单独查看某个象限的任务
- **Eisenhower Matrix**：重要/紧急矩阵

### 12. 统计报表模块
- **时间统计**：日/周/月时间分布，时间线图表
- **任务统计**：创建数、完成数、完成率、逾期数
- **习惯统计**：打卡率、连续天数趋势
- **番茄钟统计**：每日番茄数、累计专注时长、专注时段分布
- **趋势分析**：按年/月/周查看趋势

### 13. 高级筛选模块
- **筛选维度**：按日期、时长、关联状态、标签、清单、优先级筛选
- **保存筛选**：保存常用筛选条件
- **组合筛选**：多维度组合筛选

### 14. 小组件模块
- **任务小组件**：显示今日任务，快速勾选完成
- **习惯小组件**：快速打卡
- **番茄钟小组件**：启动/暂停
- **倒数日小组件**：显示最近倒数日
- **日历小组件**：月视图
- **统计小组件**：今日完成情况
- **iOS 16支持**：锁屏小组件

### 15. 附件管理模块
- **图片上传**：支持JPG/PNG，最大10MB
- **本地存储**：V1 默认，预留 COS 适配与 STS 上传
- **缩略图生成**：自动生成缩略图
- **附件预览**：图片预览、全屏查看

### 16. 多端同步模块
- **实时同步**：任务变更实时同步到云端
- **离线支持**：离线创建任务，联网后自动同步
- **冲突处理**：多端编辑时的冲突解决策略

---

## 数据模型设计

### 用户表（users）
```python
id: UUID                    # 主键
openid: string              # 微信用户唯一标识
unionid: string             # 微信开放平台唯一标识（可选）
nickname: string            # 昵称
avatar_url: string          # 头像URL
role: string                # 'user', 'admin', 'super_admin'
status: string              # 'active', 'banned', 'deleted'
last_login_at: datetime     # 最后登录时间
created_at: datetime
updated_at: datetime
settings: JSONB             # 用户偏好设置
admin_remark: text          # 管理员备注
```

### 清单表（lists）
```python
id: UUID
user_id: UUID               # 外键
name: string                # 清单名称
icon: string                # 图标emoji或图标名
color: string               # 颜色代码
sort_order: integer         # 排序位置
created_at: datetime
updated_at: datetime
```

### 任务表（tasks）
```python
id: UUID
user_id: UUID               # 外键
list_id: UUID               # 外键
title: string               # 任务标题
description: text           # 任务描述
due_date: date              # 截止日期
due_time: time              # 截止时间
priority: integer           # 0-无, 1-低, 2-中, 3-高, 4-紧急
status: string              # 'todo', 'done', 'archived'
repeat_rule: JSONB          # 重复规则
tags: array<string>         # 标签数组
meaning: text               # 任务意义（可选，格物理念）
insights: text              # 感悟（第一版隐藏）
completion_quality: integer # 完成质量1-5分（第一版隐藏）
reflection_time: integer    # 反思时长秒数（第一版隐藏）

# 四象限相关
is_important: boolean       # 重要标记
eisenhower_quadrant: string # Q1/Q2/Q3/Q4

# 自然语言处理
natural_language_parsed: boolean  # 是否通过自然语言创建

# 时间相关
estimated_duration: integer # 预估时长（分钟）
actual_duration: integer    # 实际时长（秒）

# 子任务相关
parent_task_id: UUID        # 父任务ID
task_level: integer         # 任务层级
completion_rate: decimal    # 完成率（有子任务的父任务）

# 交互相关
position: integer           # 手动排序位置

completed_at: datetime
created_at: datetime
updated_at: datetime
```

### 子任务表（subtasks）
```python
id: UUID
task_id: UUID               # 外键
title: string
is_completed: boolean
sort_order: integer
created_at: datetime
```

### 附件表（attachments）
```python
id: UUID
task_id: UUID               # 外键
user_id: UUID               # 外键
file_name: string           # 原始文件名
file_type: string           # MIME类型
file_size: integer          # 文件大小（字节）
cos_url: string             # 存储地址（本地或COS）
cos_key: string             # 对象键（本地路径或COS key）
thumbnail_url: string       # 缩略图URL
created_at: datetime
```

### 提醒记录表（reminders）
```python
id: UUID
task_id: UUID               # 外键
remind_at: datetime         # 提醒时间
is_sent: boolean            # 是否已发送
template_id: string         # 微信模板消息ID
created_at: datetime
```

### 番茄钟记录表（pomodoro_sessions）
```python
id: UUID
user_id: UUID               # 外键
task_id: UUID               # 外键（可选）
duration: integer           # 番茄时长（分钟）
break_duration: integer     # 休息时长（分钟）
type: string                # 'focus', 'break', 'long_break'
status: string              # 'running', 'paused', 'completed', 'cancelled'
started_at: datetime
completed_at: datetime
actual_duration: integer    # 实际完成时长（秒）
created_at: datetime
```

### 计时器记录表（timer_sessions）
```python
id: UUID
user_id: UUID               # 外键
task_id: UUID               # 外键（可选）
type: string                # 'stopwatch', 'countdown'
target_duration: integer    # 目标时长（秒，倒计时）
actual_duration: integer    # 实际时长（秒）
status: string              # 'running', 'paused', 'completed', 'cancelled'
started_at: datetime
completed_at: datetime
created_at: datetime
```

### 倒数日表（countdown_days）
```python
id: UUID
user_id: UUID               # 外键
title: string               # 倒数日名称
target_date: date           # 目标日期
is_recurring: boolean       # 是否每年重复
category: string            # 'life', 'work', 'study', 'anniversary'
icon: string
color: string
reminder_enabled: boolean
reminder_days: array<integer>  # 提前几天提醒
created_at: datetime
updated_at: datetime
```

### 习惯表（habits）
```python
id: UUID
user_id: UUID               # 外键
name: string                # 习惯名称
icon: string
color: string
frequency: string           # 'daily', 'weekly', 'custom'
target_count: integer       # 每日/周目标次数
current_streak: integer     # 当前连续天数
longest_streak: integer     # 最长连续天数
total_completed: integer    # 累计完成次数
reminder_enabled: boolean
reminder_time: time
is_positive: boolean        # true=养成, false=戒除
created_at: datetime
updated_at: datetime
```

### 习惯打卡记录表（habit_logs）
```python
id: UUID
habit_id: UUID              # 外键
user_id: UUID               # 外键
completed_at: date          # 打卡日期
count: integer              # 完成次数
note: text                  # 打卡备注
created_at: datetime
```

### 目标表（goals）
```python
id: UUID
user_id: UUID               # 外键
title: string               # 目标名称
description: text
target_value: numeric       # 目标值
current_value: numeric      # 当前值
unit: string                # 单位
start_date: date
end_date: date
status: string              # 'active', 'completed', 'paused'
color: string
created_at: datetime
updated_at: datetime
```

### 关键结果表（key_results）
```python
id: UUID
goal_id: UUID               # 外键
title: string
target_value: numeric
current_value: numeric
unit: string
status: string
due_date: date
created_at: datetime
updated_at: datetime
```

### 统计记录表（statistics）
```python
id: UUID
user_id: UUID               # 外键
stat_date: date
tasks_created: integer
tasks_completed: integer
tasks_overdue: integer
pomodoro_count: integer
focus_minutes: integer
habits_completed: integer
active_tasks: integer
created_at: datetime
```

### 用户番茄钟设置表（pomodoro_settings）
```python
id: UUID
user_id: UUID               # 外键，唯一
focus_duration: integer     # 专注时长（默认25）
short_break: integer        # 短休息（默认5）
long_break: integer         # 长休息（默认15）
long_break_after: integer   # 几个番茄后长休息（默认4）
auto_start_break: boolean
auto_start_focus: boolean
sound_enabled: boolean
sound_type: string
vibration_enabled: boolean
phone_notification: boolean
created_at: datetime
updated_at: datetime
```

---

## 后台管理系统

### 核心功能模块

#### 1. 用户管理
- 查看用户列表（分页、搜索、筛选）
- 查看用户详情
- 封禁/解封用户
- 查看用户操作日志

#### 2. 内容审核
- 用户反馈处理
- 敏感内容过滤
- 用户举报处理

#### 3. 数据统计
- 用户增长统计
- 日活/月活统计
- 功能使用情况统计
- 留存率统计

#### 4. 系统配置
- 维护模式开关
- 公告发布
- 通知模板管理
- 系统参数配置

#### 5. 操作日志
- 管理员操作审计
- 用户操作记录
- 安全事件日志

---

## 交互设计要点

### 微信小程序特性利用
1. **订阅消息**：任务提醒使用微信模板消息
2. **小程序间跳转**：与其他小程序集成
3. **微信运动**：结合健康数据
4. **语音输入**：调用微信语音识别API
5. **分享功能**：分享任务、清单、成就

### 交互体验优化
1. **快速添加**：全局悬浮按钮，快速创建任务
2. **手势操作**：左滑删除/完成，右滑推迟
3. **下拉刷新**：同步最新数据
4. **上拉加载**：分页加载历史任务
5. **骨架屏**：加载时展示骨架屏，提升感知速度
6. **触觉反馈**：任务完成时震动反馈

### "格物"理念在交互中的体现
1. **任务创建引导**：可选填写"为什么做这个任务"
2. **完成时刻**：简短祝贺语 + 可选记录感悟
3. **日回顾**：每日结束时展示今日完成情况
4. **周回顾**：每周推送本周统计和成长总结

---

## 第一版MVP范围

### V1（TickTick 对齐，个人版）
✅ 任务管理（CRUD、子任务、标签、优先级、重复、附件、备注、意义字段）
✅ 清单管理（分组、排序、颜色/图标）
✅ 日历视图（月/周/日/列表）
✅ 时间线视图
✅ 提醒通知（微信订阅消息 + 多提醒 + 延后，提前 5/15/60/1440 分钟）
✅ 智能快速添加 / 自然语言识别
✅ 四象限视图（Eisenhower Matrix）
✅ 番茄钟/专注 + 统计
✅ 习惯打卡 + 习惯回顾
✅ 高级筛选/智能清单
✅ 统计报表（任务/专注/习惯）
✅ 小组件
✅ 多端同步/离线
✅ 语音输入（可作为快速添加入口）

### V1.1 可选增量（不阻塞首发）
- 看板视图（Kanban）
- 主题外观/个性化
- 日历订阅与第三方日历集成

### 不包含功能（V2+）
❌ 团队协作
❌ OKR/目标管理
❌ 倒数日
❌ "格物致知"回顾功能（数据结构预留，功能后续开放）
❌ 感悟沉淀（数据结构预留）

---

## 后续版本规划

### V2.0 - 格物致知特色
1. **智能回顾**
   - 每日回顾：今日完成情况、时间分配、习惯打卡
   - 每周回顾：本周统计、成长总结、下周计划建议
   - 每月回顾：月度报告、趋势分析、目标达成情况

2. **感悟沉淀**
   - 任务完成时记录感悟
   - 按主题/时间回顾感悟
   - 形成个人知识库
   - 关联任务与感悟

3. **AI智能助手**
   - 基于历史数据给出时间管理建议
   - 智能任务优先级推荐
   - 习惯养成建议

4. **可选扩展**
   - OKR/目标管理
   - 倒数日
   - 进阶计时器

### V3.0 - 社区与成长
1. **社区功能**：匿名分享感悟、成长路径
2. **成就系统**：徽章、等级、挑战
3. **学习资源**：时间管理课程、格物致知理念文章

---

## 附录

### 竞品分析来源
- [竞品调研文档](docs/plans/2026-02-13-competitive-research.md)

---

**文档版本**: v1.1
**最后更新**: 2026-02-13
