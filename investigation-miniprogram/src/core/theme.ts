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
