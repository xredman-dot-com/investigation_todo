"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.widgetSummary = widgetSummary;
const request_1 = require("../request");
function widgetSummary(limit) {
    return (0, request_1.request)({ url: "/widgets/summary", params: { limit } });
}
