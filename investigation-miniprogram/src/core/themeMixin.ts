import { getTheme, Theme, ThemeName } from './theme'

/**
 * 主题混入对象
 * 供页面使用，简化主题集成
 * 
 * 使用方法：
 * 1. 在页面的 .ts 文件中导入：import { themeMixin } from '../../../core/themeMixin'
 * 2. 在 Page 配置中使用 behaviors: [themeMixin]
 * 3. 在页面的 .wxml 根元素上添加：style="{{themeStyle}}"
 */
export const themeMixin = Behavior({
  data: {
    themeStyle: '',
    currentTheme: 'default' as ThemeName,
    isDarkMode: false
  },

  attached() {
    this.updateTheme()
  },

  methods: {
    /**
     * 更新主题样式
     */
    updateTheme() {
      const theme = getTheme()
      const cssVars = this.generateCSSVars(theme)
      
      this.setData({
        themeStyle: cssVars,
        currentTheme: theme.name,
        isDarkMode: theme.isDark
      })
    },

    /**
     * 生成 CSS 变量字符串
     */
    generateCSSVars(theme: Theme): string {
      const c = theme.colors
      return [
        `--color-bg: ${c.background}`,
        `--color-surface: ${c.surface}`,
        `--color-surface-strong: ${c.surfaceStrong}`,
        `--color-text: ${c.text}`,
        `--color-text-muted: ${c.textSecondary}`,
        `--color-border: ${c.border}`,
        `--color-accent: ${c.accent}`,
        `--color-accent-strong: ${c.accentStrong}`,
        `--color-success: ${c.success}`,
        `--color-warning: ${c.warning}`,
        `--color-danger: ${c.danger}`,
        `--color-primary: ${c.primary}`,
        `--primary-color: ${c.primary}`,
        `--background-color: ${c.background}`,
        `--surface-color: ${c.surface}`,
        `--text-color: ${c.text}`,
        `--text-secondary: ${c.textSecondary}`,
        `--border-color: ${c.border}`,
        `--success-color: ${c.success}`,
        `--warning-color: ${c.warning}`,
        `--danger-color: ${c.danger}`,
        `--priority-1: ${c.priority1}`,
        `--priority-2: ${c.priority2}`,
        `--priority-3: ${c.priority3}`,
        `--priority-4: ${c.priority4}`,
        `--shadow-soft: 0 20rpx 40rpx ${theme.isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.08)'}`,
        `--shadow-fab: 0 18rpx 40rpx ${theme.isDark ? 'rgba(255,157,43,0.35)' : 'rgba(59,130,246,0.3)'}`,
      ].join('; ')
    },

    /**
     * 主题变更回调（可被页面覆盖）
     * 当全局主题变化时会被调用
     */
    onThemeChanged(theme: Theme) {
      this.updateTheme()
    }
  }
})

/**
 * 简化的主题初始化函数
 * 对于不想使用 behavior 的页面，可以直接调用这个函数
 * 
 * 使用方法：
 * onLoad() {
 *   initPageTheme(this)
 * }
 * 
 * WXML: style="{{themeStyle}}"
 */
export function initPageTheme(page: any) {
  const theme = getTheme()
  const c = theme.colors
  
  const cssVars = [
    `--color-bg: ${c.background}`,
    `--color-surface: ${c.surface}`,
    `--color-surface-strong: ${c.surfaceStrong}`,
    `--color-text: ${c.text}`,
    `--color-text-muted: ${c.textSecondary}`,
    `--color-border: ${c.border}`,
    `--color-accent: ${c.accent}`,
    `--color-accent-strong: ${c.accentStrong}`,
    `--color-success: ${c.success}`,
    `--color-warning: ${c.warning}`,
    `--color-danger: ${c.danger}`,
    `--color-primary: ${c.primary}`,
    `--primary-color: ${c.primary}`,
    `--background-color: ${c.background}`,
    `--surface-color: ${c.surface}`,
    `--text-color: ${c.text}`,
    `--text-secondary: ${c.textSecondary}`,
    `--border-color: ${c.border}`,
    `--success-color: ${c.success}`,
    `--warning-color: ${c.warning}`,
    `--danger-color: ${c.danger}`,
    `--priority-1: ${c.priority1}`,
    `--priority-2: ${c.priority2}`,
    `--priority-3: ${c.priority3}`,
    `--priority-4: ${c.priority4}`,
    `--shadow-soft: 0 20rpx 40rpx ${theme.isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.08)'}`,
    `--shadow-fab: 0 18rpx 40rpx ${theme.isDark ? 'rgba(255,157,43,0.35)' : 'rgba(59,130,246,0.3)'}`,
  ].join('; ')
  
  page.setData({
    themeStyle: cssVars,
    currentTheme: theme.name,
    isDarkMode: theme.isDark
  })
}
