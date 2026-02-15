export type ThemeName = 'default' | 'warm' | 'dark' | 'green' | 'purple'

export interface ThemeColors {
  // 基础颜色
  primary: string      // 主色调
  background: string   // 背景色
  surface: string      // 卡片/表面背景
  surfaceStrong: string // 强调表面
  text: string         // 主文本
  textSecondary: string // 次要文本
  border: string       // 边框
  // 功能色
  accent: string       // 强调色（主按钮等）
  accentStrong: string // 强调色加强
  accentText: string   // 强调色上的文字
  success: string      // 成功色
  warning: string      // 警告色
  danger: string       // 危险色
  // 优先级颜色
  priority1: string    // 高优先级 - 红
  priority2: string    // 中优先级 - 橙
  priority3: string    // 普通优先级 - 蓝/主题色
  priority4: string    // 无优先级 - 灰
}

export interface Theme {
  name: ThemeName
  label: string
  colors: ThemeColors
  isDark: boolean
}

// 主题配置
export const THEMES: Record<ThemeName, Theme> = {
  default: {
    name: 'default',
    label: '默认蓝',
    isDark: false,
    colors: {
      primary: '#3B82F6',
      background: '#F5F5F5',
      surface: '#FFFFFF',
      surfaceStrong: '#F3F4F6',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      accent: '#3B82F6',
      accentStrong: '#2563EB',
      accentText: '#ffffff',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      priority1: '#EF4444',
      priority2: '#F59E0B',
      priority3: '#3B82F6',
      priority4: '#9CA3AF',
    }
  },
  warm: {
    name: 'warm',
    label: '暖色橙',
    isDark: false,
    colors: {
      primary: '#D97706',
      background: '#FDF8F3',
      surface: '#FFFBF7',
      surfaceStrong: '#F5F0EB',
      text: '#292524',
      textSecondary: '#78716C',
      border: '#E7E5E4',
      accent: '#D97706',
      accentStrong: '#B45309',
      accentText: '#1f1405',
      success: '#16A34A',
      warning: '#EA580C',
      danger: '#DC2626',
      priority1: '#DC2626',
      priority2: '#EA580C',
      priority3: '#D97706',
      priority4: '#A8A29E',
    }
  },
  dark: {
    name: 'dark',
    label: '暗夜黑',
    isDark: true,
    colors: {
      primary: '#60A5FA',
      background: '#0e0e0f',
      surface: '#1a1b1d',
      surfaceStrong: '#222326',
      text: '#f4f4f5',
      textSecondary: '#9ca3af',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#ff9d2b',
      accentStrong: '#ff7a18',
      accentText: '#1a1205',
      success: '#2cb67d',
      warning: '#f4b350',
      danger: '#ff5c5c',
      priority1: '#ff5c5c',
      priority2: '#f4b350',
      priority3: '#6aa3ff',
      priority4: '#8c93a3',
    }
  },
  green: {
    name: 'green',
    label: '清新绿',
    isDark: false,
    colors: {
      primary: '#10B981',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      surfaceStrong: '#ECFDF5',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      accent: '#10B981',
      accentStrong: '#059669',
      accentText: '#05281a',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      priority1: '#EF4444',
      priority2: '#F59E0B',
      priority3: '#10B981',
      priority4: '#9CA3AF',
    }
  },
  purple: {
    name: 'purple',
    label: '优雅紫',
    isDark: false,
    colors: {
      primary: '#8B5CF6',
      background: '#F5F3FF',
      surface: '#FFFFFF',
      surfaceStrong: '#EDE9FE',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      accent: '#8B5CF6',
      accentStrong: '#7C3AED',
      accentText: '#fdfbff',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      priority1: '#EF4444',
      priority2: '#F59E0B',
      priority3: '#8B5CF6',
      priority4: '#9CA3AF',
    }
  },
}

// 当前主题
let currentTheme: Theme = THEMES.default

// 存储键名
const THEME_STORAGE_KEY = 'theme_name'

/**
 * 初始化主题 - 在 app onLaunch 中调用
 */
export function initTheme(): Theme {
  const themeName = (wx.getStorageSync(THEME_STORAGE_KEY) as ThemeName) || 'default'
  currentTheme = THEMES[themeName] || THEMES.default
  applyThemeToCSS(currentTheme)
  applyTabBarTheme(currentTheme)
  return currentTheme
}

/**
 * 获取当前主题
 */
export function getTheme(): Theme {
  return currentTheme
}

/**
 * 获取当前主题名称
 */
export function getThemeName(): ThemeName {
  return currentTheme.name
}

/**
 * 设置主题
 */
export function setTheme(name: ThemeName): void {
  if (!THEMES[name]) {
    console.warn(`[Theme] Unknown theme: ${name}`)
    return
  }
  
  currentTheme = THEMES[name]
  wx.setStorageSync(THEME_STORAGE_KEY, name)
  applyThemeToCSS(currentTheme)
  applyTabBarTheme(currentTheme)
  
  // 更新全局数据
  const app = getApp<IAppOption>()
  if (app && app.globalData) {
    app.globalData.theme = currentTheme
  }
  
  // 通知所有页面主题已更新
  notifyThemeChange(currentTheme)
}

/**
 * 应用主题到 CSS 变量
 * 通过动态修改 page 的 style 来更新 CSS 变量
 */
function applyThemeToCSS(theme: Theme): void {
  const colors = theme.colors
  const cssVars = [
    // 新变量命名（统一使用 --color- 前缀）
    `--color-bg: ${colors.background}`,
    `--color-surface: ${colors.surface}`,
    `--color-surface-strong: ${colors.surfaceStrong}`,
    `--color-text: ${colors.text}`,
    `--color-text-muted: ${colors.textSecondary}`,
    `--color-border: ${colors.border}`,
    `--color-accent: ${colors.accent}`,
    `--color-accent-strong: ${colors.accentStrong}`,
    `--color-on-accent: ${colors.accentText}`,
    `--color-success: ${colors.success}`,
    `--color-warning: ${colors.warning}`,
    `--color-danger: ${colors.danger}`,
    `--color-primary: ${colors.primary}`,
    
    // 兼容旧变量命名
    `--primary-color: ${colors.primary}`,
    `--background-color: ${colors.background}`,
    `--surface-color: ${colors.surface}`,
    `--text-color: ${colors.text}`,
    `--text-secondary: ${colors.textSecondary}`,
    `--success-color: ${colors.success}`,
    `--warning-color: ${colors.warning}`,
    `--danger-color: ${colors.danger}`,
    
    // 优先级颜色
    `--priority-1: ${colors.priority1}`,
    `--priority-2: ${colors.priority2}`,
    `--priority-3: ${colors.priority3}`,
    `--priority-4: ${colors.priority4}`,
    
    // 暗色模式特殊变量
    `--shadow-soft: 0 20rpx 40rpx ${theme.isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.08)'}`,
    `--shadow-fab: 0 18rpx 40rpx ${theme.isDark ? 'rgba(255, 157, 43, 0.35)' : 'rgba(59, 130, 246, 0.3)'}`,
  ].join('; ')
  
  // 通过设置 page 的 CSS 变量来应用主题
  // 注意：微信小程序不支持直接操作 DOM，所以我们需要通过 wx.setPageStyle 或者全局样式来更新
  // 这里使用一个技巧：将所有 CSS 变量设置到 :root 等效的地方
  
  // 方法：通过设置当前所有页面的 style
  const pages = getCurrentPages()
  pages.forEach(page => {
    if (page && (page as any).setData) {
      (page as any).setData({
        _themeCSSVars: cssVars
      })
    }
  })
  
  console.log(`[Theme] Applied theme: ${theme.label}`)
}

function applyTabBarTheme(theme: Theme): void {
  try {
    wx.setTabBarStyle({
      backgroundColor: theme.colors.surface,
      color: theme.colors.textSecondary,
      selectedColor: theme.colors.accent,
      borderStyle: theme.isDark ? "black" : "white"
    })
  } catch (error) {
    console.warn("[Theme] Failed to apply tab bar theme", error)
  }
}

/**
 * 通知所有页面主题已更改
 * 会调用页面的 onThemeChanged 方法（如果存在）
 */
function notifyThemeChange(theme: Theme): void {
  const pages = getCurrentPages()
  pages.forEach(page => {
    if (page && (page as any).onThemeChanged) {
      (page as any).onThemeChanged(theme)
    }
  })
}

/**
 * 获取主题预览渐变色
 */
export function getThemePreviewGradient(name: ThemeName): string {
  const gradients: Record<ThemeName, string> = {
    default: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    warm: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    dark: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
    green: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    purple: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  }
  return gradients[name]
}
