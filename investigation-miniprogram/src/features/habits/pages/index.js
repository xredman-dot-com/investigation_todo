"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const habits_1 = require("../services");
const habits_2 = require("../../../stores/habits");
function formatDate(value) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
Page({
    data: {
        habits: [],
        logs: [],
        activeHabitId: "",
        isLoading: false,
        errorMessage: "",
        form: {
            name: "",
            target_count: ""
        }
    },
    onShow() {
        this.fetchHabits();
    },
    async onPullDownRefresh() {
        await this.fetchHabits(true);
        wx.stopPullDownRefresh();
    },
    async fetchHabits(forceRefresh = false) {
        const cached = habits_2.habitsStore.getState();
        if (!forceRefresh && cached.habits.length) {
            this.setData({ habits: cached.habits, logs: cached.logs, activeHabitId: cached.activeHabitId || "" });
        }
        habits_2.habitsStore.setState({ loading: true, error: null });
        this.setData({ isLoading: true, errorMessage: "" });
        try {
            const habits = await (0, habits_1.listHabits)();
            habits_2.habitsStore.setState({ habits, loading: false, error: null });
            this.setData({ habits, isLoading: false, errorMessage: "" });
        }
        catch (error) {
            habits_2.habitsStore.setState({
                loading: false,
                error: error instanceof Error ? error.message : "加载失败",
            });
            this.setData({
                isLoading: false,
                errorMessage: error instanceof Error ? error.message : "加载失败"
            });
        }
    },
    onInputChange(event) {
        const field = event.currentTarget.dataset.field;
        this.setData({ [`form.${field}`]: event.detail.value });
    },
    async addHabit() {
        if (!this.data.form.name) {
            wx.showToast({ title: "请输入名称", icon: "none" });
            return;
        }
        await (0, habits_1.createHabit)({
            name: this.data.form.name,
            target_count: this.data.form.target_count ? Number(this.data.form.target_count) : 1
        });
        this.setData({ form: { name: "", target_count: "" } });
        await this.fetchHabits(true);
    },
    async removeHabit(event) {
        const habitId = event.currentTarget.dataset.id;
        await (0, habits_1.deleteHabit)(habitId);
        await this.fetchHabits(true);
    },
    async checkInHabit(event) {
        const habitId = event.currentTarget.dataset.id;
        const today = formatDate(new Date());
        await (0, habits_1.createHabitLog)(habitId, { completed_at: today, count: 1 });
        await this.fetchHabits(true);
    },
    async showLogs(event) {
        const habitId = event.currentTarget.dataset.id;
        const logs = await (0, habits_1.listHabitLogs)(habitId);
        this.setData({ logs, activeHabitId: habitId });
        habits_2.habitsStore.setState({ logs, activeHabitId: habitId });
    }
});
