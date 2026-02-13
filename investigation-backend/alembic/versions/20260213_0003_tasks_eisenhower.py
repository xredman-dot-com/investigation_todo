"""add eisenhower fields to tasks

Revision ID: 20260213_0003
Revises: 20260213_0002
Create Date: 2026-02-13 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260213_0003"
down_revision: Union[str, None] = "20260213_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column("is_important", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "tasks",
        sa.Column("eisenhower_quadrant", sa.String(length=4), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("tasks", "eisenhower_quadrant")
    op.drop_column("tasks", "is_important")
