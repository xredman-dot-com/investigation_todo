"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// pages/search/search.ts
const tasks_1 = require("../services");
const lists_1 = require("../services");
const search_1 = require("../../../stores/search");
Page({
    data: {
        searchText: '',
        filterType: 'all',
        searchHistory: [],
        taskResults: [],
        listResults: [],
        tagResults: [],
        isLoading: false,
        errorMessage: ''
    },
    onLoad() {
        this.loadSearchHistory();
    },
    loadSearchHistory() {
        const cached = search_1.searchStore.getState();
        if (cached.history.length) {
            this.setData({ searchHistory: cached.history.slice(0, 10) });
            return;
        }
        const history = wx.getStorageSync('searchHistory') || [];
        search_1.searchStore.setState({ history });
        this.setData({ searchHistory: history.slice(0, 10) }); // 最多显示10条
    },
    onSearchInput(e) {
        this.setData({ searchText: e.detail.value });
        search_1.searchStore.setState({ query: e.detail.value });
        if (e.detail.value.trim()) {
            this.performSearch(e.detail.value);
        }
        else {
            this.clearResults();
        }
    },
    async performSearch(query) {
        const searchText = query.toLowerCase().trim();
        search_1.searchStore.setState({ loading: true, error: null });
        this.setData({ isLoading: true, errorMessage: '' });
        try {
            // TODO: 从后端搜索任务
            const allTasks = await (0, tasks_1.listTasks)();
            const taskResults = allTasks.filter((task) => task.title && task.title.toLowerCase().includes(searchText));
            // TODO: 从后端搜索清单
            const allLists = await (0, lists_1.listLists)();
            const listResults = allLists.filter((list) => list.name && list.name.toLowerCase().includes(searchText));
            // TODO: 从后端搜索标签
            const tagResults = ['工作', '个人', '学习', '健康'].filter(tag => tag.toLowerCase().includes(searchText));
            this.setData({
                taskResults,
                listResults,
                tagResults,
                isLoading: false,
                errorMessage: ''
            });
            search_1.searchStore.setState({
                taskResults,
                listResults,
                loading: false,
                error: null,
            });
        }
        catch (error) {
            console.error('Search failed:', error);
            search_1.searchStore.setState({
                loading: false,
                error: error instanceof Error ? error.message : '搜索失败'
            });
            this.setData({
                isLoading: false,
                errorMessage: error instanceof Error ? error.message : '搜索失败'
            });
        }
    },
    onSearch() {
        if (!this.data.searchText.trim())
            return;
        // 添加到搜索历史
        let history = wx.getStorageSync('searchHistory') || [];
        history = history.filter((h) => h !== this.data.searchText);
        history.unshift(this.data.searchText);
        history = history.slice(0, 20); // 最多保存20条
        wx.setStorageSync('searchHistory', history);
        search_1.searchStore.setState({ history });
        this.setData({ searchHistory: history.slice(0, 10) });
    },
    onRetrySearch() {
        if (!this.data.searchText.trim())
            return;
        this.performSearch(this.data.searchText);
    },
    onFilterChange(e) {
        const { type } = e.currentTarget.dataset;
        this.setData({ filterType: type });
    },
    onClear() {
        this.setData({
            searchText: '',
            filterType: 'all'
        });
        this.clearResults();
    },
    clearResults() {
        this.setData({
            taskResults: [],
            listResults: [],
            tagResults: [],
            isLoading: false,
            errorMessage: ''
        });
        search_1.searchStore.setState({
            taskResults: [],
            listResults: [],
            loading: false,
            error: null,
        });
    },
    onTaskToggle(e) {
        console.log('Toggle task:', e.detail);
        // TODO: Toggle task status
    },
    onTaskDetail(e) {
        const { task } = e.detail;
        wx.navigateTo({
            url: `/features/tasks/pages/detail/detail?id=${task.id}`
        });
    },
    onSelectList(e) {
        const { list } = e.currentTarget.dataset;
        wx.switchTab({
            url: '/features/tasks/pages/list/list'
        });
        // TODO: 切换到该清单
    },
    onSelectTag(e) {
        const { tag } = e.currentTarget.dataset;
        this.setData({
            searchText: '#' + tag,
            filterType: 'tags'
        });
        this.performSearch(tag);
    },
    onHistoryClick(e) {
        const { query } = e.currentTarget.dataset;
        this.setData({ searchText: query });
        this.performSearch(query);
    },
    onClearHistory() {
        wx.showModal({
            title: '清除搜索历史',
            content: '确定要清除所有搜索历史吗？',
            success: (res) => {
            if (res.confirm) {
                wx.removeStorageSync('searchHistory');
                search_1.searchStore.setState({ history: [] });
                this.setData({ searchHistory: [] });
                wx.showToast({ title: '已清除', icon: 'success' });
            }
        }
    });
    }
});
