"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportFull = exportFull;
const request_1 = require("../core/request");
function exportFull() {
    return (0, request_1.request)({ url: "/exports/full" });
}
