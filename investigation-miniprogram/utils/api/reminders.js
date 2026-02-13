"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReminders = listReminders;
exports.createReminders = createReminders;
exports.createRemindersFromOffsets = createRemindersFromOffsets;
exports.deleteReminder = deleteReminder;
const request_1 = require("../request");
function listReminders(taskId) {
    return (0, request_1.request)({ url: `/tasks/${taskId}/reminders/` });
}
function createReminders(taskId, remindAt, templateId) {
    return (0, request_1.request)({
        url: `/tasks/${taskId}/reminders/`,
        method: "POST",
        data: { remind_at: remindAt, template_id: templateId },
    });
}
function createRemindersFromOffsets(taskId, offsets, templateId) {
    return (0, request_1.request)({
        url: `/tasks/${taskId}/reminders/from-offsets`,
        method: "POST",
        data: { offset_minutes: offsets, template_id: templateId },
    });
}
function deleteReminder(taskId, reminderId) {
    return (0, request_1.request)({ url: `/tasks/${taskId}/reminders/${reminderId}`, method: "DELETE" });
}
