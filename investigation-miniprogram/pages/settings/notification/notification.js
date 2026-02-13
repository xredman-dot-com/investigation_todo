// pages/settings/notification/notification.ts
Page({
    data: {
        taskReminderEnabled: true,
        defaultReminderTime: '09:00',
        pomodoroStartReminder: true,
        pomodoroCompleteReminder: true,
        breakReminder: true,
        habitReminderEnabled: true,
        habitReminderTime: '08:00'
    },
    onLoad() {
        this.loadSettings();
    },
    loadSettings() {
        // TODO: Load from backend or storage
        const settings = wx.getStorageSync('notificationSettings') || {};
        this.setData({
            taskReminderEnabled: settings.taskReminderEnabled !== false,
            defaultReminderTime: settings.defaultReminderTime || '09:00',
            pomodoroStartReminder: settings.pomodoroStartReminder !== false,
            pomodoroCompleteReminder: settings.pomodoroCompleteReminder !== false,
            breakReminder: settings.breakReminder !== false,
            habitReminderEnabled: settings.habitReminderEnabled !== false,
            habitReminderTime: settings.habitReminderTime || '08:00'
        });
    },
    onTaskReminderChange(e) {
        this.saveSetting('taskReminderEnabled', e.detail.value);
    },
    onDefaultTime() {
        const that = this;
        wx.showActionSheet({
            itemList: ['08:00', '09:00', '10:00', '12:00', '18:00', '20:00'],
            success: (res) => {
                const times = ['08:00', '09:00', '10:00', '12:00', '18:00', '20:00'];
                that.saveSetting('defaultReminderTime', times[res.tapIndex]);
            }
        });
    },
    onPomodoroStartChange(e) {
        this.saveSetting('pomodoroStartReminder', e.detail.value);
    },
    onPomodoroCompleteChange(e) {
        this.saveSetting('pomodoroCompleteReminder', e.detail.value);
    },
    onBreakReminderChange(e) {
        this.saveSetting('breakReminder', e.detail.value);
    },
    onHabitReminderChange(e) {
        this.saveSetting('habitReminderEnabled', e.detail.value);
    },
    onHabitTime() {
        const that = this;
        wx.showActionSheet({
            itemList: ['06:00', '07:00', '08:00', '09:00', '20:00', '21:00'],
            success: (res) => {
                const times = ['06:00', '07:00', '08:00', '09:00', '20:00', '21:00'];
                that.saveSetting('habitReminderTime', times[res.tapIndex]);
            }
        });
    },
    saveSetting(key, value) {
        const settings = wx.getStorageSync('notificationSettings') || {};
        settings[key] = value;
        // @ts-ignore
        this.setData({ [key]: value });
        wx.setStorageSync('notificationSettings', settings);
        // TODO: Sync to backend
        wx.showToast({ title: '设置已保存', icon: 'success' });
    },
    onBack() {
        wx.navigateBack();
    }
});
