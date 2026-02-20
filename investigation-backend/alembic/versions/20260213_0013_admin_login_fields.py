"""add admin login fields

Revision ID: 20260213_0013
Revises: 20260213_0012
Create Date: 2026-02-13 00:13:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260213_0013"
down_revision: Union[str, None] = "20260213_0012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("users", "openid", existing_type=sa.String(length=100), nullable=True)
    op.add_column("users", sa.Column("username", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=True))
    op.create_index("ix_users_username", "users", ["username"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_username", table_name="users")
    op.drop_column("users", "password_hash")
    op.drop_column("users", "username")
    op.alter_column("users", "openid", existing_type=sa.String(length=100), nullable=False)
