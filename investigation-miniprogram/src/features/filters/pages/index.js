"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filters_1 = require("../services");
const filters_2 = require("../../../stores/filters");
const statusOptions = [
    { label: "待办", value: "todo" },
    { label: "已完成", value: "done" },
    { label: "不限", value: "" }
];
Page({
    data: {
        filters: [],
        selectedTasks: [],
        isLoading: false,
        errorMessage: "",
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
        await this.fetchFilters(true);
        wx.stopPullDownRefresh();
    },
    async fetchFilters(forceRefresh = false) {
        const cached = filters_2.filtersStore.getState();
        if (!forceRefresh && cached.filters.length) {
            this.setData({ filters: cached.filters });
        }
        filters_2.filtersStore.setState({ loading: true, error: null });
        this.setData({ isLoading: true, errorMessage: "" });
        try {
            const filters = await (0, filters_1.listFilters)();
            filters_2.filtersStore.setState({ filters, loading: false, error: null });
            this.setData({ isLoading: false, errorMessage: "" });
            this.setData({ filters });
        }
        catch (error) {
            filters_2.filtersStore.setState({
                loading: false,
                error: error instanceof Error ? error.message : "加载失败",
            });
            this.setData({
                isLoading: false,
                errorMessage: error instanceof Error ? error.message : "加载失败",
            });
        }
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
        await this.fetchFilters(true);
    },
    async removeFilter(event) {
        const filterId = event.currentTarget.dataset.id;
        await (0, filters_1.deleteFilter)(filterId);
        await this.fetchFilters(true);
    },
    async applyFilter(event) {
        const filterId = event.currentTarget.dataset.id;
        const tasks = await (0, filters_1.filterTasks)(filterId);
        filters_2.filtersStore.setState({ previewTasks: tasks });
        this.setData({ selectedTasks: tasks });
    }
});
