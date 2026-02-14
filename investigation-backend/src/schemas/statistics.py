from datetime import date, datetime

from pydantic import BaseModel


class DailyStat(BaseModel):
    stat_date: date
    tasks_created: int
    tasks_completed: int
    tasks_overdue: int
    pomodoro_count: int
    focus_minutes: int
    countup_count: int
    countup_minutes: int
    habits_completed: int
    active_tasks: int
    generated_at: datetime
