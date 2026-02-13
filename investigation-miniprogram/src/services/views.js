"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timelineView = timelineView;
exports.smartList = smartList;
exports.eisenhowerView = eisenhowerView;
const request_1 = require("../core/request");
function timelineView(params) {
    return (0, request_1.request)({ url: "/views/timeline", params });
}
function smartList(name, params) {
    return (0, request_1.request)({ url: `/views/smart/${name}`, params });
}
function eisenhowerView(params) {
    return (0, request_1.request)({ url: "/views/eisenhower", params });
}
