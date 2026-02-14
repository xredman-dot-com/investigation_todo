"""add countdowns table

Revision ID: 20260213_0011
Revises: 20260213_0010
Create Date: 2026-02-13 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260213_0011"
down_revision: Union[str, None] = "20260213_0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "countdowns",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("target_date", sa.Date(), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False, server_default="countdown"),
        sa.Column("calendar_type", sa.String(length=20), nullable=False, server_default="solar"),
        sa.Column("lunar_month", sa.Integer(), nullable=True),
        sa.Column("lunar_day", sa.Integer(), nullable=True),
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
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_countdowns_user_id", "countdowns", ["user_id"], unique=False)
    op.create_index("ix_countdowns_target_date", "countdowns", ["target_date"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_countdowns_target_date", table_name="countdowns")
    op.drop_index("ix_countdowns_user_id", table_name="countdowns")
    op.drop_table("countdowns")
