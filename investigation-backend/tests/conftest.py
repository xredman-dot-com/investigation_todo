import os
import uuid

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

os.environ["TESTING"] = "true"

from src.core.security import hash_password
from src.core.database import async_session_maker
from src.main import app
from src.models.user import User


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def admin_user():
    username = f"admin_{uuid.uuid4().hex[:8]}"
    password = "admin123"
    async with async_session_maker() as session:
        user = User(
            username=username,
            password_hash=hash_password(password),
            role="admin",
            status="active",
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
    try:
        yield {"username": username, "password": password, "id": str(user.id)}
    finally:
        async with async_session_maker() as session:
            await session.execute(
                User.__table__.delete().where(User.id == user.id)
            )
            await session.commit()
