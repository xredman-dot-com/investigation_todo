"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// components/task-selector/task-selector.ts
const tasks_1 = require("../../services");
Component({
    properties: {
        visible: {
            type: Boolean,
            value: false
        },
        selectedTaskId: {
            type: String,
            value: ''
        }
    },
    data: {
        tasks: [],
        filteredTasks: [],
        searchText: ''
    },
    observers: {
        'visible': function (visible) {
            if (visible) {
                this.loadTasks();
            }
        }
    },
    methods: {
        async loadTasks() {
            wx.showLoading({ title: '加载中...' });
            try {
                const tasks = await (0, tasks_1.listTasks)({ status: 'todo' });
                this.setData({
                    tasks,
                    filteredTasks: tasks
                });
            }
            catch (error) {
                console.error('Failed to load tasks:', error);
                wx.showToast({ title: '加载失败', icon: 'none' });
            }
            finally {
                wx.hideLoading();
            }
        },
        onSearchInput(e) {
            const searchText = e.detail.value.toLowerCase();
            const filteredTasks = this.data.tasks.filter((task) => task.title.toLowerCase().includes(searchText));
            this.setData({
                searchText,
                filteredTasks
            });
        },
        onSelectTask(e) {
            const { task } = e.currentTarget.dataset;
            this.setData({ selectedTaskId: task.id });
        },
        onCancel() {
            this.setData({
                searchText: '',
                filteredTasks: this.data.tasks
            });
            this.triggerEvent('cancel');
        },
        onConfirm() {
            const selectedTask = this.data.tasks.find((t) => t.id === this.data.selectedTaskId);
            this.triggerEvent('confirm', { task: selectedTask });
            this.setData({
                searchText: '',
                filteredTasks: this.data.tasks
            });
        },
        onStopPropagation() {
            // Prevent event bubbling
        }
    }
});
