from fastapi import APIRouter

from src.api.routes import (
    admin,
    attachments,
    auth,
    exports,
    filters,
    habits,
    lists,
    pomodoro,
    reminder_jobs,
    reminders,
    statistics,
    subtasks,
    tasks,
    users,
    views,
    widgets,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(lists.router, prefix="/lists", tags=["lists"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(subtasks.router, tags=["subtasks"])
api_router.include_router(attachments.router, tags=["attachments"])
api_router.include_router(filters.router, tags=["filters"])
api_router.include_router(reminders.router, tags=["reminders"])
api_router.include_router(reminder_jobs.router, tags=["reminders"])
api_router.include_router(views.router, tags=["views"])
api_router.include_router(pomodoro.router, tags=["pomodoro"])
api_router.include_router(habits.router, tags=["habits"])
api_router.include_router(statistics.router, tags=["statistics"])
api_router.include_router(widgets.router, tags=["widgets"])
api_router.include_router(exports.router, tags=["exports"])
