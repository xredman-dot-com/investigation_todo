"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filters_1 = require("../../utils/api/filters");
const statusOptions = [
    { label: "待办", value: "todo" },
    { label: "已完成", value: "done" },
    { label: "不限", value: "" }
];
Page({
    data: {
        filters: [],
        selectedTasks: [],
        form: {
            name: "",
            tag: "",
            priority: "",
            statusIndex: 0,
            hasDueDate: false
        },
        statusOptions
    },
    onShow() {
        this.fetchFilters();
    },
    async onPullDownRefresh() {
        await this.fetchFilters();
        wx.stopPullDownRefresh();
    },
    async fetchFilters() {
        const filters = await (0, filters_1.listFilters)();
        this.setData({ filters });
    },
    onInputChange(event) {
        const field = event.currentTarget.dataset.field;
        this.setData({ [`form.${field}`]: event.detail.value });
    },
    onStatusChange(event) {
        this.setData({ "form.statusIndex": Number(event.detail.value) });
    },
    onDueSwitch(event) {
        this.setData({ "form.hasDueDate": event.detail.value });
    },
    async createFilter() {
        if (!this.data.form.name) {
            wx.showToast({ title: "请输入名称", icon: "none" });
            return;
        }
        const statusValue = statusOptions[this.data.form.statusIndex].value;
        const priorityValue = this.data.form.priority ? Number(this.data.form.priority) : undefined;
        await (0, filters_1.createFilter)({
            name: this.data.form.name,
            criteria: {
                tag: this.data.form.tag || undefined,
                priority: priorityValue,
                status: statusValue || undefined,
                has_due_date: this.data.form.hasDueDate
            }
        });
        this.setData({ form: { name: "", tag: "", priority: "", statusIndex: 0, hasDueDate: false } });
        await this.fetchFilters();
    },
    async removeFilter(event) {
        const filterId = event.currentTarget.dataset.id;
        await (0, filters_1.deleteFilter)(filterId);
        await this.fetchFilters();
    },
    async applyFilter(event) {
        const filterId = event.currentTarget.dataset.id;
        const tasks = await (0, filters_1.filterTasks)(filterId);
        this.setData({ selectedTasks: tasks });
    }
});
