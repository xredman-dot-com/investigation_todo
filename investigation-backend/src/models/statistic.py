import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class Statistic(Base):
    __tablename__ = "statistics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    stat_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    tasks_created: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    tasks_completed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    tasks_overdue: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    pomodoro_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    focus_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    countup_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    countup_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    habits_completed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    active_tasks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
