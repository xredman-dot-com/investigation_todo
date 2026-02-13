from datetime import date, time
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class WidgetTask(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    list_id: UUID
    title: str
    due_date: date | None = None
    due_time: time | None = None
    priority: int
    status: str


class WidgetSummary(BaseModel):
    date: date
    tasks_due_today: list[WidgetTask]
    tasks_overdue: list[WidgetTask]
    tasks_due_today_count: int
    tasks_overdue_count: int
    active_tasks_count: int
    habits_total: int
    habits_completed: int
    pomodoro_count: int
    focus_minutes: int
