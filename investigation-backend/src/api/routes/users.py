from fastapi import APIRouter, Depends

from src.api.deps import get_current_user
from src.models.user import User
from src.schemas.user import UserPublic

router = APIRouter()


@router.get("/me", response_model=UserPublic)
async def read_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
