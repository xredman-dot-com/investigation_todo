"""seed admin user

Revision ID: 20260213_0014
Revises: 20260213_0013
Create Date: 2026-02-13 00:14:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260213_0014"
down_revision: Union[str, None] = "20260213_0013"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ADMIN_ID = "2b8a15cf-3e28-4277-8684-d98e1fd65137"
ADMIN_USERNAME = "admin"
ADMIN_HASH = "$2b$12$YJc6KTSoZao9oXd7E9iBSekrYKgbalcnvcXhIWo3aEJ61LVgfc36S"


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            """
            INSERT INTO users (id, username, password_hash, role, status, created_at, updated_at)
            VALUES (:id, :username, :password_hash, 'admin', 'active', now(), now())
            ON CONFLICT (username) DO NOTHING
            """
        ),
        {
            "id": ADMIN_ID,
            "username": ADMIN_USERNAME,
            "password_hash": ADMIN_HASH,
        },
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text("DELETE FROM users WHERE username = :username"),
        {"username": ADMIN_USERNAME},
    )
