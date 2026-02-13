"""add task m2 fields, subtasks, attachments

Revision ID: 20260213_0002
Revises: 20260213_0001
Create Date: 2026-02-13 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260213_0002"
down_revision: Union[str, None] = "20260213_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column("priority", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "tasks",
        sa.Column("tags", postgresql.ARRAY(sa.String(length=50)), nullable=True),
    )
    op.add_column(
        "tasks",
        sa.Column("repeat_rule", postgresql.JSONB(), nullable=True),
    )

    op.create_table(
        "subtasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "task_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tasks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("is_completed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
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
    op.create_index("ix_subtasks_task_id", "subtasks", ["task_id"], unique=False)

    op.create_table(
        "attachments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "task_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tasks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("file_type", sa.String(length=100), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("cos_url", sa.String(length=500), nullable=False),
        sa.Column("cos_key", sa.String(length=500), nullable=False),
        sa.Column("thumbnail_url", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_attachments_task_id", "attachments", ["task_id"], unique=False)
    op.create_index("ix_attachments_user_id", "attachments", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_attachments_user_id", table_name="attachments")
    op.drop_index("ix_attachments_task_id", table_name="attachments")
    op.drop_table("attachments")

    op.drop_index("ix_subtasks_task_id", table_name="subtasks")
    op.drop_table("subtasks")

    op.drop_column("tasks", "repeat_rule")
    op.drop_column("tasks", "tags")
    op.drop_column("tasks", "priority")
