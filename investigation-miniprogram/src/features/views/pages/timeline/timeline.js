"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const views_1 = require("../../services");
const views_2 = require("../../../../stores/views");
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
        buckets: [],
        isLoading: false,
        errorMessage: ""
    },
    onLoad() {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        this.setData({ startDate: formatDate(start), endDate: formatDate(today) });
        this.fetchTimeline();
    },
    async onPullDownRefresh() {
        await this.fetchTimeline(true);
        wx.stopPullDownRefresh();
    },
    onStartDateChange(event) {
        this.setData({ startDate: event.detail.value });
    },
    onEndDateChange(event) {
        this.setData({ endDate: event.detail.value });
    },
    async fetchTimeline(forceRefresh = false) {
        const cached = views_2.viewsStore.getState();
        if (!forceRefresh && cached.timeline.length) {
            this.setData({ buckets: cached.timeline });
        }
        views_2.viewsStore.setState({ loading: true, error: null });
        this.setData({ isLoading: true, errorMessage: "" });
        try {
            const buckets = await (0, views_1.timelineView)({
                start_date: this.data.startDate || undefined,
                end_date: this.data.endDate || undefined
            });
            views_2.viewsStore.setState({ timeline: buckets, loading: false, error: null });
            this.setData({ buckets, isLoading: false, errorMessage: "" });
        }
        catch (error) {
            views_2.viewsStore.setState({
                loading: false,
                error: error instanceof Error ? error.message : "加载失败"
            });
            this.setData({
                isLoading: false,
                errorMessage: error instanceof Error ? error.message : "加载失败"
            });
        }
        finally {
            this.setData({ isLoading: false });
        }
    }
});
