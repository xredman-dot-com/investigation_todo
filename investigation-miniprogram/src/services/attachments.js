"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAttachments = listAttachments;
exports.uploadAttachment = uploadAttachment;
exports.deleteAttachment = deleteAttachment;
const config_1 = require("../config");
const storage_1 = require("../storage");
const request_1 = require("../core/request");
function listAttachments(taskId) {
    return (0, request_1.request)({ url: `/tasks/${taskId}/attachments/` });
}
function uploadAttachment(taskId, filePath) {
    const token = (0, storage_1.getToken)();
    const url = `${config_1.API_BASE_URL}/tasks/${taskId}/attachments/upload`;
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url,
            filePath,
            name: "file",
            header: token ? { Authorization: `Bearer ${token}` } : {},
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const data = JSON.parse(res.data);
                        resolve(data);
                        return;
                    }
                    catch (error) {
                        reject(error);
                        return;
                    }
                }
                reject(new Error(`Upload failed (${res.statusCode})`));
            },
            fail: reject,
        });
    });
}
function deleteAttachment(taskId, attachmentId) {
    return (0, request_1.request)({ url: `/tasks/${taskId}/attachments/${attachmentId}`, method: "DELETE" });
}
