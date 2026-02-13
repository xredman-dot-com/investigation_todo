"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.fetchCurrentUser = fetchCurrentUser;
exports.ensureAuth = ensureAuth;
const config_1 = require("./config");
const request_1 = require("./request");
const storage_1 = require("./storage");
async function wxLogin() {
    return new Promise((resolve, reject) => {
        wx.login({
            success: (res) => {
                if (res.code) {
                    resolve(res.code);
                }
                else {
                    reject(new Error("login code missing"));
                }
            },
            fail: reject,
        });
    });
}
async function login() {
    let code = "";
    // In development mode, always use dev code
    if (config_1.USE_DEV_LOGIN) {
        code = `dev-${Date.now()}`;
    }
    else {
        try {
            code = await wxLogin();
        }
        catch (error) {
            throw error;
        }
    }
    const data = await (0, request_1.request)({
        url: "/auth/wechat",
        method: "POST",
        data: { code },
    });
    (0, storage_1.setToken)(data.access_token);
    return data.access_token;
}
async function fetchCurrentUser() {
    return (0, request_1.request)({ url: "/users/me" });
}
async function ensureAuth() {
    const token = (0, storage_1.getToken)();
    if (token) {
        try {
            const user = await fetchCurrentUser();
            const app = getApp();
            app.globalData.user = user;
            app.globalData.token = token;
            return;
        }
        catch (error) {
            (0, storage_1.clearToken)();
        }
    }
    const newToken = await login();
    const user = await fetchCurrentUser();
    const app = getApp();
    app.globalData.user = user;
    app.globalData.token = newToken;
}
