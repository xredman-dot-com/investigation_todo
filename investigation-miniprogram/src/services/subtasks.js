"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSubtasks = listSubtasks;
exports.createSubtask = createSubtask;
exports.updateSubtask = updateSubtask;
exports.deleteSubtask = deleteSubtask;
const request_1 = require("../core/request");
function listSubtasks(taskId) {
    return (0, request_1.request)({ url: `/tasks/${taskId}/subtasks/` });
}
function createSubtask(taskId, data) {
    return (0, request_1.request)({ url: `/tasks/${taskId}/subtasks/`, method: "POST", data });
}
function updateSubtask(taskId, subtaskId, data) {
    return (0, request_1.request)({ url: `/tasks/${taskId}/subtasks/${subtaskId}`, method: "PUT", data });
}
function deleteSubtask(taskId, subtaskId) {
    return (0, request_1.request)({ url: `/tasks/${taskId}/subtasks/${subtaskId}`, method: "DELETE" });
}
