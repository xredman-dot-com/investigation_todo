"""add countup stats columns

Revision ID: 20260213_0010
Revises: 20260213_0009
Create Date: 2026-02-13 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260213_0010"
down_revision: Union[str, None] = "20260213_0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "statistics",
        sa.Column("countup_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "statistics",
        sa.Column("countup_minutes", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("statistics", "countup_minutes")
    op.drop_column("statistics", "countup_count")
