from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from src.schemas.attachment import AttachmentOut
from src.schemas.habit import HabitOut
from src.schemas.habit_log import HabitLogOut
from src.schemas.list import ListOut
from src.schemas.pomodoro import PomodoroOut
from src.schemas.reminder import ReminderOut
from src.schemas.subtask import SubtaskOut
from src.schemas.task import TaskOut


class ExportPayload(BaseModel):
    generated_at: datetime
    user_id: UUID
    lists: list[ListOut]
    tasks: list[TaskOut]
    subtasks: list[SubtaskOut]
    attachments: list[AttachmentOut]
    reminders: list[ReminderOut]
    habits: list[HabitOut]
    habit_logs: list[HabitLogOut]
    pomodoro_sessions: list[PomodoroOut]
