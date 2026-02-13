"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchReminders = dispatchReminders;
exports.listReminderLogs = listReminderLogs;
exports.snoozeReminder = snoozeReminder;
const request_1 = require("../request");
function dispatchReminders(as_of) {
    return (0, request_1.request)({
        url: "/reminders/dispatch",
        method: "POST",
        params: { as_of },
    });
}
function listReminderLogs(reminderId) {
    return (0, request_1.request)({ url: "/reminders/logs", params: { reminder_id: reminderId } });
}
function snoozeReminder(reminderId, minutes, remindAt) {
    return (0, request_1.request)({
        url: `/reminders/${reminderId}/snooze`,
        method: "PATCH",
        data: { minutes, remind_at: remindAt },
    });
}
