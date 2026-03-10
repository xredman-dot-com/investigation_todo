import pytest


@pytest.mark.asyncio
async def test_admin_summary(async_client, admin_user):
    login = await async_client.post(
        "/api/v1/auth/admin",
        json={"username": admin_user["username"], "password": admin_user["password"]},
    )
    token = login.json()["access_token"]

    response = await async_client.get(
        "/api/v1/admin/summary",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert set(
        [
            "users_total",
            "users_active",
            "users_banned",
            "tasks_total",
            "tasks_completed",
            "moderation_pending",
            "settings_count",
        ]
    ).issubset(payload.keys())
