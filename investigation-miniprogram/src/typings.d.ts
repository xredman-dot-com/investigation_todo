declare const App: <T = any>(options: T) => void
declare const Page: (options: any) => void
declare const getApp: <T = any>() => T
declare const wx: any

type ThemeName = 'default' | 'warm' | 'dark' | 'green' | 'purple'

interface ThemeColors {
  primary: string
  background: string
  surface: string
  surfaceStrong: string
  text: string
  textSecondary: string
  border: string
  accent: string
  accentStrong: string
  success: string
  warning: string
  danger: string
  priority1: string
  priority2: string
  priority3: string
  priority4: string
}

interface Theme {
  name: ThemeName
  label: string
  isDark: boolean
  colors: ThemeColors
}

interface IAppOption {
  globalData: {
    token: string
    user: any
    theme: Theme
  }
  [key: string]: any
}

declare namespace WechatMiniprogram {
  type TouchEvent = any
  type PickerChange = any
  type Input = any
  type SwitchChange = any
  type CheckboxChange = any
  type CustomEvent = any
  type SwiperChange = any
}
