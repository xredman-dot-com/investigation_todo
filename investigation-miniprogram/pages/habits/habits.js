// pages/habits/habits.ts
Page({
    data: {
        habits: [],
        monthlyStats: {
            total: 0,
            completed: 0,
            streak: 0
        },
        showHabitCreate: false
    },
    onLoad() {
        this.loadHabits();
    },
    async loadHabits() {
        // TODO: Load habits from backend
        const habits = [
            { id: 1, name: '早起', icon: '🌅', streak: 7, completed: false },
            { id: 2, name: '运动', icon: '💪', streak: 3, completed: true },
            { id: 3, name: '阅读', icon: '📚', streak: 14, completed: false },
            { id: 4, name: '冥想', icon: '🧘', streak: 5, completed: false }
        ];
        const completedCount = habits.filter((h) => h.completed).length;
        const maxStreak = Math.max(...habits.map((h) => h.streak));
        this.setData({
            habits,
            monthlyStats: {
                total: habits.length,
                completed: completedCount,
                streak: maxStreak
            }
        });
    },
    onCheckIn(e) {
        const { id } = e.currentTarget.dataset;
        const habits = this.data.habits.map((h) => {
            if (h.id === id) {
                return Object.assign(Object.assign({}, h), { completed: !h.completed, streak: h.completed ? h.streak - 1 : h.streak + 1 });
            }
            return h;
        });
        const completedCount = habits.filter((h) => h.completed).length;
        const maxStreak = Math.max(...habits.map((h) => h.streak));
        this.setData({
            habits,
            monthlyStats: {
                total: habits.length,
                completed: completedCount,
                streak: maxStreak
            }
        });
        // TODO: Save to backend
        wx.showToast({ title: '打卡成功！', icon: 'success' });
    },
    onCreateHabit() {
        this.setData({ showHabitCreate: true });
    },
    onHabitConfirm(e) {
        const { habit } = e.detail;
        const newHabit = {
            id: Date.now(),
            name: habit.name,
            icon: habit.icon,
            streak: 0,
            completed: false
        };
        const habits = [...this.data.habits, newHabit];
        const completedCount = habits.filter((h) => h.completed).length;
        const maxStreak = Math.max(...habits.map((h) => h.streak), 0);
        this.setData({
            habits,
            monthlyStats: {
                total: habits.length,
                completed: completedCount,
                streak: maxStreak
            },
            showHabitCreate: false
        });
        // TODO: Save to backend
        wx.showToast({ title: '创建成功！', icon: 'success' });
    },
    onHabitCancel() {
        this.setData({ showHabitCreate: false });
    },
    onHabitDetail(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/habits/detail/detail?id=${id}`
        });
    }
});
