"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const habits_1 = require("../../utils/api/habits");
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
        form: {
            name: "",
            target_count: ""
        }
    },
    onShow() {
        this.fetchHabits();
    },
    async onPullDownRefresh() {
        await this.fetchHabits();
        wx.stopPullDownRefresh();
    },
    async fetchHabits() {
        const habits = await (0, habits_1.listHabits)();
        this.setData({ habits });
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
        await this.fetchHabits();
    },
    async removeHabit(event) {
        const habitId = event.currentTarget.dataset.id;
        await (0, habits_1.deleteHabit)(habitId);
        await this.fetchHabits();
    },
    async checkInHabit(event) {
        const habitId = event.currentTarget.dataset.id;
        const today = formatDate(new Date());
        await (0, habits_1.createHabitLog)(habitId, { completed_at: today, count: 1 });
        await this.fetchHabits();
    },
    async showLogs(event) {
        const habitId = event.currentTarget.dataset.id;
        const logs = await (0, habits_1.listHabitLogs)(habitId);
        this.setData({ logs, activeHabitId: habitId });
    }
});
