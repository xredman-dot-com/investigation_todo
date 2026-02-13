"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exports_1 = require("../services");
const lists_1 = require("../services");
const reminderJobs_1 = require("../services");
const users_1 = require("../services");
const settings_1 = require("../../../stores/settings");
Page({
    data: {
        user: null,
        lists: [],
        newListName: "",
        editNames: {},
        exportText: "",
        reminderLogs: []
    },
    onShow() {
        this.bootstrap();
    },
    async onPullDownRefresh() {
        await this.bootstrap(true);
        wx.stopPullDownRefresh();
    },
    applyStoreState(user, lists, logs) {
        const editNames = {};
        lists.forEach((item) => {
            editNames[item.id] = item.name;
        });
        this.setData({ user, lists, reminderLogs: logs, editNames });
    },
    async bootstrap(forceRefresh = false) {
        const cached = settings_1.settingsStore.getState();
        if (!forceRefresh && (cached.user || cached.lists.length || cached.subscriptions.length)) {
            this.applyStoreState(cached.user, cached.lists, cached.subscriptions);
        }
        settings_1.settingsStore.setState({ loading: true, error: null });
        try {
            const [user, lists, logs] = await Promise.all([
                (0, users_1.getMe)(),
                (0, lists_1.listLists)(),
                (0, reminderJobs_1.listReminderLogs)()
            ]);
            settings_1.settingsStore.setState({
                user,
                lists,
                subscriptions: logs,
                loading: false,
                error: null,
            });
            this.applyStoreState(user, lists, logs);
        }
        catch (error) {
            settings_1.settingsStore.setState({
                loading: false,
                error: error instanceof Error ? error.message : "加载失败",
            });
        }
    },
    onNewListInput(event) {
        this.setData({ newListName: event.detail.value });
    },
    onEditNameInput(event) {
        const listId = event.currentTarget.dataset.id;
        this.setData({ [`editNames.${listId}`]: event.detail.value });
    },
    async addList() {
        if (!this.data.newListName) {
            wx.showToast({ title: "请输入清单名称", icon: "none" });
            return;
        }
        await (0, lists_1.createList)({ name: this.data.newListName });
        this.setData({ newListName: "" });
        await this.bootstrap(true);
    },
    async saveList(event) {
        const listId = event.currentTarget.dataset.id;
        const name = this.data.editNames[listId];
        await (0, lists_1.updateList)(listId, { name });
        await this.bootstrap(true);
    },
    async removeList(event) {
        const listId = event.currentTarget.dataset.id;
        await (0, lists_1.deleteList)(listId);
        await this.bootstrap(true);
    },
    async runExport() {
        const payload = await (0, exports_1.exportFull)();
        const text = JSON.stringify(payload, null, 2);
        this.setData({ exportText: text });
        wx.setClipboardData({ data: text });
    },
    async runDispatch() {
        await (0, reminderJobs_1.dispatchReminders)();
        const logs = await (0, reminderJobs_1.listReminderLogs)();
        settings_1.settingsStore.setState({ subscriptions: logs });
        this.setData({ reminderLogs: logs });
    }
});
