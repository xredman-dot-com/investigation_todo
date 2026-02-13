"""add subscription message logs

Revision ID: 20260213_0008
Revises: 20260213_0007
Create Date: 2026-02-13 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260213_0008"
down_revision: Union[str, None] = "20260213_0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "subscription_messages",
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
        sa.Column(
            "reminder_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("reminders.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("template_id", sa.String(length=100), nullable=True),
        sa.Column("payload", postgresql.JSONB(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="sent"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_subscription_messages_user_id", "subscription_messages", ["user_id"], unique=False)
    op.create_index("ix_subscription_messages_task_id", "subscription_messages", ["task_id"], unique=False)
    op.create_index("ix_subscription_messages_reminder_id", "subscription_messages", ["reminder_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_subscription_messages_reminder_id", table_name="subscription_messages")
    op.drop_index("ix_subscription_messages_task_id", table_name="subscription_messages")
    op.drop_index("ix_subscription_messages_user_id", table_name="subscription_messages")
    op.drop_table("subscription_messages")
