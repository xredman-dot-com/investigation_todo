"""add pomodoro, habits, statistics tables

Revision ID: 20260213_0005
Revises: 20260213_0004
Create Date: 2026-02-13 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260213_0005"
down_revision: Union[str, None] = "20260213_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "pomodoro_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "task_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tasks.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("duration", sa.Integer(), nullable=False),
        sa.Column("break_duration", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("type", sa.String(length=20), nullable=False, server_default="focus"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="running"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("actual_duration", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_pomodoro_sessions_user_id", "pomodoro_sessions", ["user_id"], unique=False)
    op.create_index("ix_pomodoro_sessions_task_id", "pomodoro_sessions", ["task_id"], unique=False)

    op.create_table(
        "habits",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("icon", sa.String(length=50), nullable=True),
        sa.Column("color", sa.String(length=20), nullable=True),
        sa.Column("frequency", sa.String(length=20), nullable=False, server_default="daily"),
        sa.Column("target_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("current_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("longest_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_completed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reminder_enabled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("reminder_time", sa.Time(), nullable=True),
        sa.Column("is_positive", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_habits_user_id", "habits", ["user_id"], unique=False)

    op.create_table(
        "habit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "habit_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("habits.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("completed_at", sa.Date(), nullable=False),
        sa.Column("count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_habit_logs_habit_id", "habit_logs", ["habit_id"], unique=False)
    op.create_index("ix_habit_logs_user_id", "habit_logs", ["user_id"], unique=False)

    op.create_table(
        "statistics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stat_date", sa.Date(), nullable=False),
        sa.Column("tasks_created", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tasks_completed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tasks_overdue", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("pomodoro_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("focus_minutes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("habits_completed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("active_tasks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_statistics_user_id", "statistics", ["user_id"], unique=False)
    op.create_index("ix_statistics_stat_date", "statistics", ["stat_date"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_statistics_stat_date", table_name="statistics")
    op.drop_index("ix_statistics_user_id", table_name="statistics")
    op.drop_table("statistics")

    op.drop_index("ix_habit_logs_user_id", table_name="habit_logs")
    op.drop_index("ix_habit_logs_habit_id", table_name="habit_logs")
    op.drop_table("habit_logs")

    op.drop_index("ix_habits_user_id", table_name="habits")
    op.drop_table("habits")

    op.drop_index("ix_pomodoro_sessions_task_id", table_name="pomodoro_sessions")
    op.drop_index("ix_pomodoro_sessions_user_id", table_name="pomodoro_sessions")
    op.drop_table("pomodoro_sessions")
