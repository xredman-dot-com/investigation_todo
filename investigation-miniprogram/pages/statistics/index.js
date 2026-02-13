"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const statistics_1 = require("../../utils/api/statistics");
function formatDate(value) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
Page({
    data: {
        startDate: "",
        endDate: "",
        stats: []
    },
    onLoad() {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        this.setData({ startDate: formatDate(start), endDate: formatDate(today) });
        this.fetchStats();
    },
    async onPullDownRefresh() {
        await this.fetchStats();
        wx.stopPullDownRefresh();
    },
    onStartDateChange(event) {
        this.setData({ startDate: event.detail.value });
    },
    onEndDateChange(event) {
        this.setData({ endDate: event.detail.value });
    },
    async fetchStats() {
        const stats = await (0, statistics_1.dailyStats)(this.data.startDate, this.data.endDate);
        this.setData({ stats });
    }
});
