"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const statistics_1 = require("../services");
const statistics_2 = require("../../../stores/statistics");
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
        stats: [],
        isLoading: false,
        errorMessage: ""
    },
    onLoad() {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        this.setData({ startDate: formatDate(start), endDate: formatDate(today) });
        this.fetchStats();
    },
    async onPullDownRefresh() {
        await this.fetchStats(true);
        wx.stopPullDownRefresh();
    },
    onStartDateChange(event) {
        this.setData({ startDate: event.detail.value });
    },
    onEndDateChange(event) {
        this.setData({ endDate: event.detail.value });
    },
    async fetchStats(forceRefresh = false) {
        const cached = statistics_2.statisticsStore.getState();
        if (!forceRefresh && cached.stats.length) {
            this.setData({ stats: cached.stats });
        }
        statistics_2.statisticsStore.setState({ loading: true, error: null });
        this.setData({ isLoading: true, errorMessage: "" });
        try {
            const stats = await (0, statistics_1.dailyStats)(this.data.startDate, this.data.endDate);
            statistics_2.statisticsStore.setState({ stats, loading: false, error: null });
            this.setData({ stats, isLoading: false, errorMessage: "" });
        }
        catch (error) {
            statistics_2.statisticsStore.setState({
                loading: false,
                error: error instanceof Error ? error.message : "加载失败"
            });
            this.setData({
                isLoading: false,
                errorMessage: error instanceof Error ? error.message : "加载失败"
            });
        }
    }
});
