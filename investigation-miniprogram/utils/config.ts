export const API_BASE_URL = "http://127.0.0.1:8000/api/v1"
export const USE_DEV_LOGIN = API_BASE_URL.includes("127.0.0.1") || API_BASE_URL.includes("localhost")
export const REMINDER_OFFSETS = [5, 15, 60, 1440]
