"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const views_1 = require("../../../utils/api/views");
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
        loading: false
    },
    onLoad() {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        this.setData({ startDate: formatDate(start), endDate: formatDate(today) });
        this.fetchTimeline();
    },
    async onPullDownRefresh() {
        await this.fetchTimeline();
        wx.stopPullDownRefresh();
    },
    onStartDateChange(event) {
        this.setData({ startDate: event.detail.value });
    },
    onEndDateChange(event) {
        this.setData({ endDate: event.detail.value });
    },
    async fetchTimeline() {
        this.setData({ loading: true });
        try {
            const buckets = await (0, views_1.timelineView)({
                start_date: this.data.startDate || undefined,
                end_date: this.data.endDate || undefined
            });
            this.setData({ buckets });
        }
        finally {
            this.setData({ loading: false });
        }
    }
});
