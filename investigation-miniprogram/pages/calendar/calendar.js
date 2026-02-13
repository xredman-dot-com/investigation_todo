"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// pages/calendar/calendar.ts
const tasks_1 = require("../../utils/api/tasks");
Page({
    data: {
        viewMode: 'month',
        currentMonth: new Date(),
        selectedDate: new Date(),
        weekDays: ['日', '一', '二', '三', '四', '五', '六'],
        monthDays: [],
        todayTasks: []
    },
    onLoad() {
        this.generateCalendar();
    },
    onMonthView() {
        this.setData({ viewMode: 'month' });
        this.generateCalendar();
    },
    onWeekView() {
        this.setData({ viewMode: 'week' });
        this.generateCalendar();
    },
    onDayView() {
        this.setData({ viewMode: 'day' });
        this.generateCalendar();
    },
    onPrevMonth() {
        const date = new Date(this.data.currentMonth);
        date.setMonth(date.getMonth() - 1);
        this.setData({ currentMonth: date });
        this.generateCalendar();
        this.loadTasksForDate();
    },
    onNextMonth() {
        const date = new Date(this.data.currentMonth);
        date.setMonth(date.getMonth() + 1);
        this.setData({ currentMonth: date });
        this.generateCalendar();
        this.loadTasksForDate();
    },
    generateCalendar() {
        const year = this.data.currentMonth.getFullYear();
        const month = this.data.currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startWeekday = firstDay.getDay();
        const monthDays = [];
        const weekDays = [];
        // Week headers
        for (let i = 0; i < 7; i++) {
            weekDays.push(this.data.weekDays[i]);
        }
        // Empty cells for first week
        for (let i = 0; i < startWeekday; i++) {
            monthDays.push({ date: '', isEmpty: true });
        }
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = this.isSameDay(new Date(year, month, day));
            monthDays.push({
                date: day,
                isToday,
                isEmpty: false,
                tasks: [] // Will load tasks for each day
            });
        }
        this.setData({ monthDays, weekDays });
    },
    isSameDay(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    },
    async loadTasksForDate() {
        const dateStr = this.formatDate(this.data.selectedDate);
        try {
            const tasks = await (0, tasks_1.listTasks)({ due_date_from: dateStr, due_date_to: dateStr });
            // Group tasks by date
            const tasksByDate = {};
            tasks.forEach(task => {
                if (task.due_date) {
                    if (!tasksByDate[task.due_date]) {
                        tasksByDate[task.due_date] = [];
                    }
                    tasksByDate[task.due_date].push(task);
                }
            });
            this.setData({ todayTasks: tasks });
        }
        catch (error) {
            console.error('Failed to load tasks:', error);
        }
    },
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
});
