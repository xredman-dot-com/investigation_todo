from typing import AsyncGenerator

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from src.core.config import settings

engine_kwargs = {
    "echo": settings.DEBUG,
    "pool_pre_ping": True,
}
if settings.TESTING:
    engine_kwargs["poolclass"] = pool.NullPool

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs,
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
