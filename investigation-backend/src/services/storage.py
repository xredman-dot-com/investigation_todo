from __future__ import annotations

import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Final
from uuid import UUID, uuid4

from fastapi import UploadFile

from src.core.config import settings


@dataclass(frozen=True)
class StoredFile:
    key: str
    url: str
    size: int
    content_type: str
    file_name: str


class StorageError(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.status_code = status_code


class StorageBackend:
    async def save_upload(self, file: UploadFile, user_id: UUID, task_id: UUID) -> StoredFile:
        raise NotImplementedError


class LocalStorage(StorageBackend):
    _chunk_size: Final[int] = 1024 * 1024

    def __init__(self, base_path: str, base_url: str, max_size_mb: int) -> None:
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.base_url = base_url.rstrip("/")
        self.max_size = max_size_mb * 1024 * 1024

    async def save_upload(self, file: UploadFile, user_id: UUID, task_id: UUID) -> StoredFile:
        original_name = file.filename or "upload.bin"
        safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", original_name)
        file_id = uuid4().hex
        key = f"{user_id}/{task_id}/{file_id}_{safe_name}"
        target_path = self.base_path / key
        target_path.parent.mkdir(parents=True, exist_ok=True)

        size = 0
        with target_path.open("wb") as handle:
            while True:
                chunk = await file.read(self._chunk_size)
                if not chunk:
                    break
                size += len(chunk)
                if size > self.max_size:
                    handle.close()
                    target_path.unlink(missing_ok=True)
                    raise StorageError("File too large", status_code=413)
                handle.write(chunk)

        content_type = file.content_type or "application/octet-stream"
        url = f"{self.base_url}/{key}"
        return StoredFile(key=key, url=url, size=size, content_type=content_type, file_name=original_name)


class CosStorage(StorageBackend):
    async def save_upload(self, file: UploadFile, user_id: UUID, task_id: UUID) -> StoredFile:
        raise StorageError("COS storage is not implemented", status_code=501)


@lru_cache()
def get_storage() -> StorageBackend:
    provider = (settings.STORAGE_PROVIDER or "local").lower()
    if provider == "local":
        return LocalStorage(
            base_path=settings.LOCAL_STORAGE_PATH,
            base_url=settings.LOCAL_STORAGE_BASE_URL,
            max_size_mb=settings.MAX_UPLOAD_SIZE_MB,
        )
    if provider == "cos":
        return CosStorage()
    raise StorageError(f"Unsupported storage provider: {provider}", status_code=400)
