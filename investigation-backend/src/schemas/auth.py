from pydantic import BaseModel, Field


class WeChatLoginRequest(BaseModel):
    code: str = Field(..., min_length=1)
    nickname: str | None = None
    avatar_url: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    exp: int
