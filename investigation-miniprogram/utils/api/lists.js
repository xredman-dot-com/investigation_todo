"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLists = listLists;
exports.createList = createList;
exports.updateList = updateList;
exports.deleteList = deleteList;
const request_1 = require("../request");
function listLists() {
    return (0, request_1.request)({ url: "/lists/" });
}
function createList(data) {
    return (0, request_1.request)({ url: "/lists/", method: "POST", data });
}
function updateList(listId, data) {
    return (0, request_1.request)({ url: `/lists/${listId}`, method: "PUT", data });
}
function deleteList(listId) {
    return (0, request_1.request)({ url: `/lists/${listId}`, method: "DELETE" });
}
