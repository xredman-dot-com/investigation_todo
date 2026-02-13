"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPomodoroSessions = listPomodoroSessions;
exports.createPomodoroSession = createPomodoroSession;
exports.updatePomodoroSession = updatePomodoroSession;
exports.deletePomodoroSession = deletePomodoroSession;
const request_1 = require("../request");
function listPomodoroSessions(params) {
    return (0, request_1.request)({ url: "/pomodoro/sessions/", params });
}
function createPomodoroSession(data) {
    return (0, request_1.request)({ url: "/pomodoro/sessions/", method: "POST", data });
}
function updatePomodoroSession(sessionId, data) {
    return (0, request_1.request)({ url: `/pomodoro/sessions/${sessionId}`, method: "PUT", data });
}
function deletePomodoroSession(sessionId) {
    return (0, request_1.request)({ url: `/pomodoro/sessions/${sessionId}`, method: "DELETE" });
}
