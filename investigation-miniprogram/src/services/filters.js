"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFilters = listFilters;
exports.createFilter = createFilter;
exports.updateFilter = updateFilter;
exports.deleteFilter = deleteFilter;
exports.filterTasks = filterTasks;
const request_1 = require("../core/request");
function listFilters() {
    return (0, request_1.request)({ url: "/filters/" });
}
function createFilter(data) {
    return (0, request_1.request)({ url: "/filters/", method: "POST", data });
}
function updateFilter(filterId, data) {
    return (0, request_1.request)({ url: `/filters/${filterId}`, method: "PUT", data });
}
function deleteFilter(filterId) {
    return (0, request_1.request)({ url: `/filters/${filterId}`, method: "DELETE" });
}
function filterTasks(filterId) {
    return (0, request_1.request)({ url: `/filters/${filterId}/tasks` });
}
