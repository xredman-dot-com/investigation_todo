"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const views_1 = require("../../../utils/api/views");
Page({
    data: {
        view: null,
        loading: false
    },
    onShow() {
        this.fetchView();
    },
    async onPullDownRefresh() {
        await this.fetchView();
        wx.stopPullDownRefresh();
    },
    async fetchView() {
        this.setData({ loading: true });
        try {
            const view = await (0, views_1.eisenhowerView)();
            this.setData({ view });
        }
        finally {
            this.setData({ loading: false });
        }
    }
});
