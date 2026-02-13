from typing import Any

import httpx
from pydantic import BaseModel

from src.core.config import settings


class WeChatSession(BaseModel):
    openid: str
    session_key: str
    unionid: str | None = None


class WeChatAPIError(Exception):
    def __init__(self, message: str, code: int | None = None) -> None:
        super().__init__(message)
        self.code = code


async def exchange_code_for_session(code: str) -> WeChatSession:
    if settings.DEBUG and code.startswith("dev-"):
        return WeChatSession(openid=code, session_key="dev-session")

    if not settings.WECHAT_APP_ID or not settings.WECHAT_APP_SECRET:
        raise WeChatAPIError("WeChat credentials are not configured")

    params = {
        "appid": settings.WECHAT_APP_ID,
        "secret": settings.WECHAT_APP_SECRET,
        "js_code": code,
        "grant_type": "authorization_code",
    }

    url = f"{settings.WECHAT_API_BASE}/sns/jscode2session"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data: dict[str, Any] = response.json()

    if "errcode" in data and data.get("errcode") != 0:
        raise WeChatAPIError(data.get("errmsg", "WeChat API error"), code=data.get("errcode"))

    return WeChatSession(
        openid=data["openid"],
        session_key=data["session_key"],
        unionid=data.get("unionid"),
    )
