"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTasks = listTasks;
exports.getTask = getTask;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const request_1 = require("../core/request");
function listTasks(params) {
    return (0, request_1.request)({ url: "/tasks/", params });
}
function getTask(taskId) {
    return (0, request_1.request)({ url: `/tasks/${taskId}` });
}
function createTask(data) {
    return (0, request_1.request)({ url: "/tasks/", method: "POST", data });
}
function updateTask(taskId, data) {
    return (0, request_1.request)({ url: `/tasks/${taskId}`, method: "PUT", data });
}
function deleteTask(taskId) {
    return (0, request_1.request)({ url: `/tasks/${taskId}`, method: "DELETE" });
}
