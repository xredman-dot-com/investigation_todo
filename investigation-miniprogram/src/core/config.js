"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REMINDER_OFFSETS = exports.USE_DEV_LOGIN = exports.API_BASE_URL = void 0;
exports.API_BASE_URL = "http://127.0.0.1:8000/api/v1";
exports.USE_DEV_LOGIN = exports.API_BASE_URL.includes("127.0.0.1") || exports.API_BASE_URL.includes("localhost");
exports.REMINDER_OFFSETS = [5, 15, 60, 1440];
