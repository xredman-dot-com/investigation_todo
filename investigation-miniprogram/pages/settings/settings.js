"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// pages/settings/settings.ts
const theme_1 = require("../../utils/theme");
Page({
    data: {
        userInfo: {
            name: '',
            email: ''
        },
        currentTheme: 'default',
        darkMode: false
    },
    onLoad() {
        const app = getApp();
        this.setData({
            currentTheme: app.globalData.theme.name,
            darkMode: app.globalData.theme.name === 'dark'
        });
        // Load user info
        this.loadUserInfo();
    },
    loadUserInfo() {
        // TODO: Load user info from backend
        const userInfo = wx.getStorageSync('userInfo') || { name: '', email: '' };
        this.setData({ userInfo });
    },
    onThemeChange(e) {
        const { theme } = e.currentTarget.dataset;
        const newTheme = theme;
        (0, theme_1.setTheme)(newTheme);
        const app = getApp();
        app.globalData.theme = (0, theme_1.getTheme)();
        this.setData({
            currentTheme: newTheme,
            darkMode: newTheme === 'dark'
        });
        wx.showToast({ title: '主题已切换', icon: 'success' });
    },
    onDarkModeChange(e) {
        const checked = e.detail.value;
        const theme = checked ? 'dark' : 'default';
        (0, theme_1.setTheme)(theme);
        const app = getApp();
        app.globalData.theme = (0, theme_1.getTheme)();
        this.setData({
            currentTheme: theme,
            darkMode: checked
        });
    },
    onSetting(e) {
        const { index } = e.currentTarget.dataset;
        const pages = [
            '/pages/settings/notification/notification',
            '/pages/settings/pomodoro/pomodoro',
            '/pages/settings/calendar/calendar'
        ];
        if (pages[index]) {
            wx.navigateTo({ url: pages[index] });
        }
    },
    onBackup() {
        wx.showToast({ title: '备份功能开发中', icon: 'none' });
    },
    onSync() {
        wx.showToast({ title: '同步功能开发中', icon: 'none' });
    },
    onClearCache() {
        wx.showModal({
            title: '清除缓存',
            content: '确定要清除所有缓存数据吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.clearStorage();
                    wx.showToast({ title: '缓存已清除', icon: 'success' });
                }
            }
        });
    },
    onAbout() {
        wx.showModal({
            title: '关于格物清单',
            content: '格物清单是一款简洁高效的任务管理应用\n版本：1.0.0',
            showCancel: false
        });
    },
    onFeedback() {
        wx.showToast({ title: '反馈功能开发中', icon: 'none' });
    }
});
