import asyncio
import getpass

from sqlalchemy import select

from src.core.database import async_session_maker
from src.core.security import hash_password
from src.models.user import User


async def main() -> None:
    username = input("Admin username: ").strip()
    password = getpass.getpass("Admin password: ").strip()
    if not username or not password:
        raise SystemExit("Username and password are required.")

    async with async_session_maker() as session:
        result = await session.execute(select(User).where(User.username == username))
        existing = result.scalar_one_or_none()
        if existing:
            raise SystemExit("User already exists.")

        user = User(
            username=username,
            password_hash=hash_password(password),
            role="admin",
            status="active",
        )
        session.add(user)
        await session.commit()
        print(f"Created admin user {user.id}")


if __name__ == "__main__":
    asyncio.run(main())
