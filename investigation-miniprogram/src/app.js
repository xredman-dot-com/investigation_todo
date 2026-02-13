"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./core/auth");
const theme_1 = require("./core/theme");
App({
    globalData: {
        token: "",
        user: null,
        theme: (0, theme_1.getTheme)()
    },
    onLaunch() {
        // 初始化主题
        this.globalData.theme = (0, theme_1.getTheme)();
        (0, auth_1.ensureAuth)().catch((error) => {
            console.warn("auth failed", error);
        });
    },
});
