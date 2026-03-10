import pytest


@pytest.mark.asyncio
async def test_admin_login_success(async_client, admin_user):
    response = await async_client.post(
        "/api/v1/auth/admin",
        json={"username": admin_user["username"], "password": admin_user["password"]},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "access_token" in payload
    assert payload.get("token_type") == "bearer"


@pytest.mark.asyncio
async def test_admin_login_wrong_password(async_client, admin_user):
    response = await async_client.post(
        "/api/v1/auth/admin",
        json={"username": admin_user["username"], "password": "wrong-pass"},
    )
    assert response.status_code == 401
