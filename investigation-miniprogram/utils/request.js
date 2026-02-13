"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = request;
const config_1 = require("./config");
const storage_1 = require("./storage");
function buildUrl(url, params) {
    if (!params)
        return url;
    const query = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join("&");
    return query ? `${url}?${query}` : url;
}
function request(options) {
    const token = (0, storage_1.getToken)();
    const url = buildUrl(`${config_1.API_BASE_URL}${options.url}`, options.params);
    return new Promise((resolve, reject) => {
        wx.request({
            url,
            method: options.method || "GET",
            data: options.data || {},
            header: Object.assign(Object.assign({ "Content-Type": "application/json" }, (token ? { Authorization: `Bearer ${token}` } : {})), (options.header || {})),
            success: (res) => {
                var _a;
                const status = res.statusCode || 0;
                if (status >= 200 && status < 300) {
                    resolve(res.data);
                    return;
                }
                const message = ((_a = res.data) === null || _a === void 0 ? void 0 : _a.detail) || `Request failed (${status})`;
                wx.showToast({ title: message, icon: "none" });
                reject(new Error(message));
            },
            fail: (err) => {
                wx.showToast({ title: "Network error", icon: "none" });
                reject(err);
            },
        });
    });
}
