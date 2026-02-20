from pydantic import BaseModel, Field


class WeChatLoginRequest(BaseModel):
    code: str = Field(..., min_length=1)
    nickname: str | None = None
    avatar_url: str | None = None


class AdminLoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    exp: int
