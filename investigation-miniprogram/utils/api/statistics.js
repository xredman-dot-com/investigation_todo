"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyStats = dailyStats;
const request_1 = require("../request");
function dailyStats(startDate, endDate) {
    return (0, request_1.request)({
        url: "/statistics/daily",
        params: { start_date: startDate, end_date: endDate },
    });
}
