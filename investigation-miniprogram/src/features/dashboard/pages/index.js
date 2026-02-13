"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("../services");
const dashboard_1 = require("../../../stores/dashboard");
Page({
    data: {
        summary: null,
        loading: false,
        errorMessage: "",
        quickActions: [
            { label: "任务清单", url: "/features/tasks/pages/list/list" },
            { label: "时间线", url: "/features/views/pages/timeline/timeline" },
            { label: "四象限", url: "/features/views/pages/eisenhower/eisenhower" },
            { label: "筛选器", url: "/features/filters/pages/index" },
            { label: "习惯", url: "/features/habits/pages/index" },
            { label: "番茄钟", url: "/features/pomodoro/pages/index" },
            { label: "统计", url: "/features/statistics/pages/index" },
            { label: "设置", url: "/features/settings/pages/index" }
        ]
    },
    onShow() {
        this.fetchSummary();
    },
    async onPullDownRefresh() {
        await this.fetchSummary(true);
        wx.stopPullDownRefresh();
    },
    async fetchSummary(forceRefresh = false) {
        const cached = dashboard_1.dashboardStore.getState();
        if (!forceRefresh && cached.summary) {
            this.setData({ summary: cached.summary });
        }
        dashboard_1.dashboardStore.setState({ loading: true, error: null });
        this.setData({ loading: true, errorMessage: "" });
        try {
            const summary = await (0, widgets_1.widgetSummary)(5);
            this.setData({ summary });
            dashboard_1.dashboardStore.setState({ summary, loading: false, error: null });
        }
        catch (error) {
            dashboard_1.dashboardStore.setState({
                loading: false,
                error: error instanceof Error ? error.message : "加载失败"
            });
            this.setData({
                errorMessage: error instanceof Error ? error.message : "加载失败"
            });
        }
        finally {
            this.setData({ loading: false });
        }
    },
    onRetryLoad() {
        this.fetchSummary(true);
    },
    goTo(event) {
        const url = event.currentTarget.dataset.url;
        if (url) {
            wx.navigateTo({ url });
        }
    }
});
