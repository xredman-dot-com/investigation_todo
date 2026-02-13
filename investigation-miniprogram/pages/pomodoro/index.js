"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pomodoro_1 = require("../../utils/api/pomodoro");
Page({
    data: {
        sessions: [],
        duration: "25",
        breakDuration: "5",
        currentSessionId: ""
    },
    onShow() {
        this.fetchSessions();
    },
    async onPullDownRefresh() {
        await this.fetchSessions();
        wx.stopPullDownRefresh();
    },
    async fetchSessions() {
        const sessions = await (0, pomodoro_1.listPomodoroSessions)();
        this.setData({ sessions });
    },
    onInputChange(event) {
        const field = event.currentTarget.dataset.field;
        this.setData({ [field]: event.detail.value });
    },
    async startSession() {
        const duration = Number(this.data.duration || 25);
        const breakDuration = Number(this.data.breakDuration || 5);
        const session = await (0, pomodoro_1.createPomodoroSession)({ duration, break_duration: breakDuration, type: "focus", status: "running" });
        this.setData({ currentSessionId: session.id });
        await this.fetchSessions();
    },
    async completeSession() {
        if (!this.data.currentSessionId) {
            wx.showToast({ title: "无进行中的番茄", icon: "none" });
            return;
        }
        await (0, pomodoro_1.updatePomodoroSession)(this.data.currentSessionId, { status: "completed", completed_at: new Date().toISOString() });
        this.setData({ currentSessionId: "" });
        await this.fetchSessions();
    }
});
