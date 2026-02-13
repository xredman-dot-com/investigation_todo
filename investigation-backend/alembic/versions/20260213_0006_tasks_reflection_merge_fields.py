"""add task reflection fields and merge timestamps

Revision ID: 20260213_0006
Revises: 20260213_0005
Create Date: 2026-02-13 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260213_0006"
down_revision: Union[str, None] = "20260213_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("insights", sa.Text(), nullable=True))
    op.add_column("tasks", sa.Column("completion_quality", sa.Integer(), nullable=True))
    op.add_column("tasks", sa.Column("reflection_time", sa.Integer(), nullable=True))
    op.add_column(
        "tasks",
        sa.Column(
            "title_updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.add_column(
        "tasks",
        sa.Column(
            "schedule_updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )


def downgrade() -> None:
    op.drop_column("tasks", "schedule_updated_at")
    op.drop_column("tasks", "title_updated_at")
    op.drop_column("tasks", "reflection_time")
    op.drop_column("tasks", "completion_quality")
    op.drop_column("tasks", "insights")
