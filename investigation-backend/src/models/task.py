import uuid
from datetime import datetime, date, time
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, Time
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    list_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lists.id", ondelete="CASCADE"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meaning: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    insights: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    completion_quality: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    reflection_time: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    priority: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tags: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String(50)), nullable=True)
    repeat_rule: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    is_important: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    eisenhower_quadrant: Mapped[Optional[str]] = mapped_column(String(4), nullable=True)

    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    due_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    title_updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    schedule_updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), default="todo", nullable=False)
    position: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
