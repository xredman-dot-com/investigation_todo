"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const views_1 = require("../../services");
const views_2 = require("../../../../stores/views");
Page({
    data: {
        view: null,
        isLoading: false,
        errorMessage: ""
    },
    onShow() {
        this.fetchView();
    },
    async onPullDownRefresh() {
        await this.fetchView(true);
        wx.stopPullDownRefresh();
    },
    async fetchView(forceRefresh = false) {
        const cached = views_2.viewsStore.getState();
        if (!forceRefresh && cached.eisenhower) {
            this.setData({ view: cached.eisenhower });
        }
        views_2.viewsStore.setState({ loading: true, error: null });
        this.setData({ isLoading: true, errorMessage: "" });
        try {
            const view = await (0, views_1.eisenhowerView)();
            views_2.viewsStore.setState({ eisenhower: view, loading: false, error: null });
            this.setData({ view, isLoading: false, errorMessage: "" });
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
