"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listHabits = listHabits;
exports.createHabit = createHabit;
exports.updateHabit = updateHabit;
exports.deleteHabit = deleteHabit;
exports.listHabitLogs = listHabitLogs;
exports.createHabitLog = createHabitLog;
const request_1 = require("../core/request");
function listHabits() {
    return (0, request_1.request)({ url: "/habits/" });
}
function createHabit(data) {
    return (0, request_1.request)({ url: "/habits/", method: "POST", data });
}
function updateHabit(habitId, data) {
    return (0, request_1.request)({ url: `/habits/${habitId}`, method: "PUT", data });
}
function deleteHabit(habitId) {
    return (0, request_1.request)({ url: `/habits/${habitId}`, method: "DELETE" });
}
function listHabitLogs(habitId, startDate, endDate) {
    return (0, request_1.request)({
        url: `/habits/${habitId}/logs`,
        params: { start_date: startDate, end_date: endDate },
    });
}
function createHabitLog(habitId, data) {
    return (0, request_1.request)({ url: `/habits/${habitId}/logs`, method: "POST", data });
}
