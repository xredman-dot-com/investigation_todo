# Phase 1: 项目基础设施搭建实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 搭建三个独立工程的基础架构，配置开发环境，建立CI/CD流程

**Architecture:**
- 微信小程序端（TypeScript + 原生框架）
- 后台管理PC端（Vue 3 + Element Plus + Vite）
- 后端服务（FastAPI + PostgreSQL + Redis）

**Tech Stack:**
- 小程序：微信开发者工具、TypeScript
- 后台：Vue 3、Vite、Element Plus、Pinia、Vue Router
- 后端：Python 3.11+、FastAPI、SQLAlchemy、Alembic、PostgreSQL、Redis
- 基础设施：Git、Docker、腾讯云COS

---

## Task 1: 初始化Git仓库和Monorepo结构

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Modify: 根目录结构

**Step 1: 创建根目录.gitignore**

```bash
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
.venv/
*.egg-info/
dist/
build/

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# 小程序
miniprogram_npm/
.miniprogram-cache/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# 环境
.env
.env.local
.env.*.local

# 日志
*.log
logs/

# 测试
.pytest_cache/
.coverage
htmlcov/

# macOS
.DS_Store

# 临时文件
*.tmp
*.bak
EOF
```

**Step 2: 创建README.md**

```bash
cat > README.md << 'EOF'
# 格物清单（Investigation）

面向"自我提升者"的任务管理工具，体现"格物致知"理念。

## 项目结构

```
investigation-todo/
├── investigation-miniprogram/    # 微信小程序端
├── investigation-admin/          # 后台管理PC端（Vue 3）
├── investigation-backend/        # 后端服务（FastAPI）
├── docs/                         # 设计文档
└── README.md
```

## 技术栈

- **小程序端**：微信小程序原生框架 + TypeScript
- **后台管理**：Vue 3 + Element Plus + Vite
- **后端服务**：FastAPI + PostgreSQL + Redis + Celery
- **部署**：腾讯云（CVM + COS + TKE）

## 快速开始

详见各子项目README。

## 开发规范

- 遵循 TDD 开发流程
- 每个功能单元测试覆盖率 > 80%
- 提交前运行 lint 和 test
- Commit message 遵循 Conventional Commits

## 文档

- [产品设计文档](docs/plans/2025-02-13-investigation-design.md)
- [实施计划](docs/plans/)
EOF
```

**Step 3: 创建目录结构**

```bash
mkdir -p investigation-miniprogram
mkdir -p investigation-admin
mkdir -p investigation-backend
mkdir -p docs/plans
```

**Step 4: 验证目录结构**

```bash
ls -la
tree -L 1 -d
```

Expected: 四个目录可见

**Step 5: Commit**

```bash
git add .gitignore README.md
git add investigation-miniprogram/ investigation-admin/ investigation-backend/
git commit -m "chore: initialize monorepo structure and basic config"
```

---

## Task 2: 后端服务 - 初始化FastAPI项目

**Files:**
- Create: `investigation-backend/pyproject.toml`
- Create: `investigation-backend/README.md`
- Create: `investigation-backend/.gitignore`
- Create: `investigation-backend/.env.example`
- Create: `investigation-backend/src/__init__.py`
- Create: `investigation-backend/tests/__init__.py`

**Step 1: 创建pyproject.toml**

```bash
cd investigation-backend

cat > pyproject.toml << 'EOF'
[project]
name = "investigation-backend"
version = "0.1.0"
description = "格物清单后端服务"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "sqlalchemy>=2.0.25",
    "alembic>=1.13.0",
    "psycopg2-binary>=2.9.9",
    "redis>=5.0.1",
    "pydantic>=2.5.3",
    "pydantic-settings>=2.1.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.6",
    "celery>=5.3.6",
    "cos-python5>=1.9.30",
    "pytest>=7.4.4",
    "pytest-asyncio>=0.23.3",
    "pytest-cov>=4.1.0",
    "httpx>=0.26.0",
    "black>=24.1.0",
    "ruff>=0.1.9",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.black]
line-length = 100
target-version = ['py311']

[tool.ruff]
line-length = 100
select = ["E", "F", "I", "N", "W"]
target-version = "py311"

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
EOF
```

**Step 2: 创建.env.example**

```bash
cat > .env.example << 'EOF'
# 应用配置
APP_NAME=格物清单
APP_VERSION=0.1.0
DEBUG=true
SECRET_KEY=your-secret-key-here-change-in-production

# 数据库配置
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/investigation
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis配置
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=3600

# 微信小程序配置
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
WECHAT_TOKEN=your-wechat-token
WECHAT_ENCODING_AES_KEY=your-wechat-aes-key

# 腾讯云COS配置
COS_SECRET_ID=your-cos-secret-id
COS_SECRET_KEY=your-cos-secret-key
COS_REGION=ap-guangzhou
COS_BUCKET=your-bucket-name

# Celery配置
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
EOF
```

**Step 3: 创建README.md**

```bash
cat > README.md << 'EOF'
# 格物清单后端服务

FastAPI + PostgreSQL + Redis + Celery

## 技术栈

- **Web框架**: FastAPI 0.109+
- **ORM**: SQLAlchemy 2.0
- **数据库**: PostgreSQL 15+
- **缓存**: Redis 7+
- **任务队列**: Celery 5+
- **对象存储**: 腾讯云COS

## 快速开始

\`\`\`bash
# 安装依赖
pip install -e .

# 复制环境配置
cp .env.example .env

# 编辑.env，填入真实配置

# 运行数据库迁移
alembic upgrade head

# 启动开发服务器
uvicorn src.main:app --reload --port 8000
\`\`\`

## 测试

\`\`\`bash
# 运行所有测试
pytest

# 运行测试并查看覆盖率
pytest --cov=src --cov-report=html
\`\`\`

## 代码规范

\`\`\`bash
# 代码格式化
black src/ tests/

# 代码检查
ruff check src/ tests/
\`\`\`
EOF
```

**Step 4: 创建基础目录结构**

```bash
mkdir -p src/api
mkdir -p src/core
mkdir -p src/models
mkdir -p src/schemas
mkdir -p src/services
mkdir -p src/utils
mkdir -p tests/api
mkdir -p tests/services
mkdir -p alembic/versions
mkdir -p logs
```

**Step 5: 创建__init__.py文件**

```bash
touch src/__init__.py
touch src/api/__init__.py
touch src/core/__init__.py
touch src/models/__init__.py
touch src/schemas/__init__.py
touch src/services/__init__.py
touch src/utils/__init__.py
touch tests/__init__.py
touch tests/api/__init__.py
touch tests/services/__init__.py
```

**Step 6: Commit**

```bash
cd ..
git add investigation-backend/
git commit -m "feat(backend): initialize FastAPI project structure with dependencies"
```

---

## Task 3: 后端服务 - 配置管理模块

**Files:**
- Create: `investigation-backend/src/core/config.py`
- Create: `investigation-backend/src/core/security.py`
- Create: `investigation-backend/tests/test_config.py`

**Step 1: 编写配置测试**

```bash
cd investigation-backend

cat > tests/test_config.py << 'EOF'
import os
from pathlib import Path
from pydantic import ValidationError

import pytest


def test_config_loads_from_env(monkeypatch):
    """测试配置从环境变量加载"""
    monkeypatch.setenv("DATABASE_URL", "postgresql://test:test@localhost/test")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key")
    monkeypatch.setenv("WECHAT_APP_ID", "test-app-id")

    from src.core.config import settings

    assert settings.DATABASE_URL == "postgresql://test:test@localhost/test"
    assert settings.SECRET_KEY == "test-secret-key"
    assert settings.WECHAT_APP_ID == "test-app-id"


def test_config_missing_required_field(monkeypatch):
    """测试缺少必需字段时抛出异常"""
    monkeypatch.delenv("SECRET_KEY", raising=False)

    with pytest.raises(ValidationError):
        from src.core.config import settings


def test_config_debug_mode(monkeypatch):
    """测试DEBUG模式配置"""
    monkeypatch.setenv("DEBUG", "true")
    monkeypatch.setenv("SECRET_KEY", "test-key")

    from src.core.config import settings

    assert settings.DEBUG is True


def test_cos_config(monkeypatch):
    """测试腾讯云COS配置"""
    monkeypatch.setenv("COS_SECRET_ID", "test-secret-id")
    monkeypatch.setenv("COS_SECRET_KEY", "test-secret-key")
    monkeypatch.setenv("COS_REGION", "ap-guangzhou")
    monkeypatch.setenv("COS_BUCKET", "test-bucket")
    monkeypatch.setenv("SECRET_KEY", "test-key")

    from src.core.config import settings

    assert settings.COS_SECRET_ID == "test-secret-id"
    assert settings.COS_REGION == "ap-guangzhou"
    assert settings.COS_BUCKET == "test-bucket"
EOF
```

**Step 2: 运行测试验证失败**

```bash
pytest tests/test_config.py -v
```

Expected: FAIL - "src.core.config模块不存在"

**Step 3: 实现配置模块**

```bash
cat > src/core/config.py << 'EOF'
from functools import lru_cache
from typing import Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # 应用配置
    APP_NAME: str = "格物清单"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    SECRET_KEY: str = Field(..., min_length=32)

    # 数据库配置
    DATABASE_URL: str = Field(..., description="PostgreSQL连接字符串")
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis配置
    REDIS_URL: str = Field(..., description="Redis连接字符串")
    REDIS_CACHE_TTL: int = 3600

    # 微信小程序配置
    WECHAT_APP_ID: str = Field(..., description="微信小程序AppID")
    WECHAT_APP_SECRET: str = Field(..., description="微信小程序AppSecret")
    WECHAT_TOKEN: Optional[str] = None
    WECHAT_ENCODING_AES_KEY: Optional[str] = None

    # 腾讯云COS配置
    COS_SECRET_ID: str = Field(..., description="腾讯云SecretId")
    COS_SECRET_KEY: str = Field(..., description="腾讯云SecretKey")
    COS_REGION: str = Field(default="ap-guangzhou", description="COS区域")
    COS_BUCKET: str = Field(..., description="COS存储桶名称")

    # Celery配置
    CELERY_BROKER_URL: str = Field(..., description="Celery broker URL")
    CELERY_RESULT_BACKEND: str = Field(..., description="Celery result backend")

    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters")
        return v


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
EOF
```

**Step 4: 运行测试验证通过**

```bash
pytest tests/test_config.py -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add tests/test_config.py src/core/config.py
git commit -m "feat(backend): add configuration management with validation"
```

---

## Task 4: 后端服务 - 数据库连接和ORM配置

**Files:**
- Create: `investigation-backend/src/core/database.py`
- Create: `investigation-backend/tests/test_database.py`

**Step 1: 编写数据库连接测试**

```bash
cat > tests/test_database.py << 'EOF'
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.core.config import settings
from src.core.database import get_db, engine


@pytest.mark.asyncio
async def test_database_engine_creates():
    """测试数据库引擎创建"""
    assert engine is not None
    assert engine.url == settings.DATABASE_URL


@pytest.mark.asyncio
async def test_get_db_session():
    """测试获取数据库会话"""
    async for session in get_db():
        assert isinstance(session, AsyncSession)
        break  # 只测试第一个session


@pytest.mark.asyncio
async def test_database_pool_size():
    """测试数据库连接池配置"""
    assert engine.pool.size() == 0  # 初始为0

    # 创建连接
    async with engine.connect() as conn:
        assert engine.pool.size() >= 1
EOF
```

**Step 2: 运行测试验证失败**

```bash
pytest tests/test_database.py -v
```

Expected: FAIL - "src.core.database模块不存在"

**Step 3: 实现数据库连接模块**

```bash
cat > src/core/database.py << 'EOF'
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from src.core.config import settings

# 创建异步引擎
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,
)

# 创建异步会话工厂
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base类用于模型继承
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """获取数据库会话依赖注入"""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """初始化数据库表"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
EOF
```

**Step 4: 运行测试验证通过**

```bash
pytest tests/test_database.py -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add tests/test_database.py src/core/database.py
git commit -m "feat(backend): add database connection and ORM configuration"
```

---

## Task 5: 后端服务 - 用户模型设计

**Files:**
- Create: `investigation-backend/src/models/user.py`
- Create: `investigation-backend/tests/models/test_user.py`

**Step 1: 编写用户模型测试**

```bash
cat > tests/models/test_user.py << 'EOF'
import pytest
from sqlalchemy import select
from datetime import datetime

from src.models.user import User
from src.core.database import async_session_maker


@pytest.mark.asyncio
async def test_create_user():
    """测试创建用户"""
    user = User(
        openid="test_openid_123",
        nickname="测试用户",
        avatar_url="https://example.com/avatar.jpg",
        role="user",
        status="active",
    )

    async with async_session_maker() as session:
        session.add(user)
        await session.commit()
        await session.refresh(user)

        assert user.id is not None
        assert user.openid == "test_openid_123"
        assert user.nickname == "测试用户"
        assert user.role == "user"
        assert user.status == "active"


@pytest.mark.asyncio
async def test_user_with_admin_role():
    """测试管理员角色用户"""
    user = User(
        openid="admin_openid",
        nickname="管理员",
        role="admin",
        status="active",
    )

    assert user.role == "admin"
    assert user.is_admin is True


@pytest.mark.asyncio
async def test_user_banned_status():
    """测试封禁状态"""
    user = User(
        openid="banned_user",
        status="banned",
    )

    assert user.is_banned is True
    assert user.is_active is False


@pytest.mark.asyncio
async def test_user_settings_jsonb():
    """测试用户设置JSONB字段"""
    settings_data = {
        "theme": "dark",
        "language": "zh-CN",
        "notifications_enabled": True,
    }

    user = User(
        openid="user_with_settings",
        settings=settings_data,
    )

    assert user.settings == settings_data
    assert user.settings["theme"] == "dark"
EOF
```

**Step 2: 运行测试验证失败**

```bash
pytest tests/models/test_user.py -v
```

Expected: FAIL - "src.models.user模块不存在"

**Step 3: 实现用户模型**

```bash
cat > src/models/user.py << 'EOF'
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, Boolean, JSON, Column, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class User(Base):
    """用户模型"""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    openid: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
        comment="微信用户唯一标识",
    )
    unionid: Mapped[Optional[str]] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=True,
        comment="微信开放平台唯一标识",
    )
    nickname: Mapped[Optional[str]] = mapped_column(
        String(100),
        comment="昵称",
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        comment="头像URL",
    )
    role: Mapped[str] = mapped_column(
        String(20),
        default="user",
        nullable=False,
        comment="角色: user, admin, super_admin",
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        nullable=False,
        comment="状态: active, banned, deleted",
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        comment="最后登录时间",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
    settings: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
        comment="用户偏好设置",
    )
    admin_remark: Mapped[Optional[str]] = mapped_column(
        Text,
        comment="管理员备注",
    )

    @property
    def is_admin(self) -> bool:
        """是否为管理员"""
        return self.role in ("admin", "super_admin")

    @property
    def is_super_admin(self) -> bool:
        """是否为超级管理员"""
        return self.role == "super_admin"

    @property
    def is_active(self) -> bool:
        """是否激活状态"""
        return self.status == "active"

    @property
    def is_banned(self) -> bool:
        """是否封禁"""
        return self.status == "banned"

    def __repr__(self) -> str:
        return f"<User(id={self.id}, nickname={self.nickname}, role={self.role})>"
EOF
```

**Step 4: 运行测试验证通过**

```bash
pytest tests/models/test_user.py -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add tests/models/test_user.py src/models/user.py
git commit -m "feat(backend): add User model with role and status properties"
```

---

## Task 6: 后端服务 - Alembic数据库迁移配置

**Files:**
- Create: `investigation-backend/alembic.ini`
- Create: `investigation-backend/alembic/env.py`
- Create: `investigation-backend/alembic/script.py.mako`

**Step 1: 创建alembic.ini**

```bash
cat > alembic.ini << 'EOF'
[alembic]
script_location = alembic
file_template = %%(year)d%%(month).2d%%(day).2d_%%(hour).2d%%(minute).2d-%%(rev)s_%%(slug)s
sqlalchemy.url = postgresql+psycopg2://user:password@localhost:5432/investigation

[log]
path = logs/
level = INFO
format = %(asctime)s - %(name)s - %(levelname)s - %(message)s
EOF
```

**Step 2: 创建alembic/env.py**

```bash
cat > alembic/env.py << 'EOF'
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from src.core.config import settings
from src.core.database import Base
from src.models import user  # 导入所有模型

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """离线运行迁移"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """异步运行迁移"""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """在线运行迁移"""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
EOF
```

**Step 3: 创建script.py.mako模板**

```bash
cat > alembic/script.py.mako << 'EOF'
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
EOF
```

**Step 4: 验证Alembic配置**

```bash
alembic check
```

Expected: 无错误输出

**Step 5: 创建初始迁移**

```bash
alembic revision --autogenerate -m "Initial migration: create users table"
```

Expected: 生成迁移文件在 `alembic/versions/`

**Step 6: Commit**

```bash
git add alembic.ini alembic/env.py alembic/script.py.mako alembic/versions/
git commit -m "feat(backend): configure Alembic database migrations"
```

---

## Task 7: 后台管理PC端 - 初始化Vue 3项目

**Files:**
- Create: `investigation-admin/package.json`
- Create: `investigation-admin/vite.config.ts`
- Create: `investigation-admin/tsconfig.json`
- Create: `investigation-admin/.env`
- Create: `investigation-admin/index.html`
- Create: `investigation-admin/README.md`

**Step 1: 创建package.json**

```bash
cd investigation-admin

cat > package.json << 'EOF'
{
  "name": "investigation-admin",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "vue": "^3.4.15",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "element-plus": "^2.5.2",
    "@element-plus/icons-vue": "^2.3.1",
    "axios": "^1.6.5",
    "dayjs": "^1.11.10"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.3",
    "@vue/tsconfig": "^0.5.1",
    "typescript": "~5.3.3",
    "vite": "^5.0.11",
    "vue-tsc": "^1.8.27",
    "eslint": "^8.56.0",
    "prettier": "^3.2.4"
  }
}
EOF
```

**Step 2: 创建vite.config.ts**

```bash
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
EOF
```

**Step 3: 创建tsconfig.json**

```bash
cat > tsconfig.json << 'EOF'
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["dist", "node_modules"]
}
EOF
```

**Step 4: 创建index.html**

```bash
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>格物清单 - 后台管理</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
EOF
```

**Step 5: 创建.env**

```bash
cat > .env << 'EOF'
VITE_APP_TITLE=格物清单后台管理
VITE_API_BASE_URL=/api
EOF
```

**Step 6: 创建README.md**

```bash
cat > README.md << 'EOF'
# 格物清单后台管理系统

Vue 3 + Element Plus + Vite

## 技术栈

- **框架**: Vue 3 (Composition API)
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite
- **语言**: TypeScript

## 快速开始

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
\`\`\`

## 开发规范

\`\`\`bash
# 代码检查
npm run lint

# 代码格式化
npm run format
\`\`\`
EOF
```

**Step 7: 创建基础目录结构**

```bash
mkdir -p src/api
mkdir -p src/assets
mkdir -p src/components
mkdir -p src/layouts
mkdir -p src/router
mkdir -p src/stores
mkdir -p src/styles
mkdir -p src/utils
mkdir -p src/views
```

**Step 8: Commit**

```bash
cd ..
git add investigation-admin/
git commit -m "feat(admin): initialize Vue 3 + Element Plus project structure"
```

---

## Task 8: 后台管理PC端 - Vue应用入口配置

**Files:**
- Create: `investigation-admin/src/main.ts`
- Create: `investigation-admin/src/App.vue`
- Create: `investigation-admin/src/router/index.ts`
- Create: `investigation-admin/src/stores/user.ts`

**Step 1: 创建main.ts**

```bash
cd investigation-admin

cat > src/main.ts << 'EOF'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
EOF
```

**Step 2: 创建App.vue**

```bash
cat > src/App.vue << 'EOF'
<template>
  <router-view />
</template>

<script setup lang="ts">
// App根组件
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
EOF
```

**Step 3: 创建路由配置**

```bash
cat > src/router/index.ts << 'EOF'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { title: '仪表盘', requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: () => import('@/views/Dashboard.vue'),
      },
    ],
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { title: '用户管理', requiresAuth: true },
    children: [
      {
        path: '',
        name: 'UserList',
        component: () => import('@/views/users/List.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '格物清单'} - 后台管理`

  const token = localStorage.getItem('admin_token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
EOF
```

**Step 4: 创建用户状态管理**

```bash
cat > src/stores/user.ts << 'EOF'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: string
  username: string
  role: 'admin' | 'super_admin'
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('admin_token') || '')
  const userInfo = ref<User | null>(null)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('admin_token', newToken)
  }

  function setUserInfo(user: User) {
    userInfo.value = user
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('admin_token')
  }

  function isAdmin(): boolean {
    return userInfo.value?.role === 'admin' || userInfo.value?.role === 'super_admin'
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout,
    isAdmin,
  }
})
EOF
```

**Step 5: Commit**

```bash
cd ..
git add investigation-admin/src/
git commit -m "feat(admin): add Vue app entry, router and user store"
```

---

## Task 9: 微信小程序端 - 初始化项目结构

**Files:**
- Create: `investigation-miniprogram/project.config.json`
- Create: `investigation-miniprogram/app.json`
- Create: `investigation-miniprogram/app.ts`
- Create: `investigation-miniprogram/README.md`

**Step 1: 创建project.config.json**

```bash
cd investigation-miniprogram

cat > project.config.json << 'EOF'
{
  "description": "格物清单小程序项目配置文件",
  "packOptions": {
    "ignore": [],
    "include": []
  },
  "setting": {
    "bundle": false,
    "userConfirmedBundleSwitch": false,
    "urlCheck": true,
    "scopeDataCheck": false,
    "coverView": true,
    "es6": true,
    "postcss": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "preloadBackgroundData": false,
    "minified": true,
    "autoAudits": false,
    "newFeature": false,
    "uglifyFileName": false,
    "uploadWithSourceMap": true,
    "useIsolateContext": true,
    "nodeModules": false,
    "enhance": true,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "showShadowRootInWxmlPanel": true,
    "packNpmManually": false,
    "enableEngineNative": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "showES6CompileOption": false,
    "minifyWXML": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "condition": false
  },
  "compileType": "miniprogram",
  "libVersion": "3.5.5",
  "appid": "your-appid-here",
  "projectname": "investigation-miniprogram",
  "condition": {},
  "editorSetting": {
    "tabIndent": "insertSpaces",
    "tabSize": 2
  }
}
EOF
```

**Step 2: 创建app.json**

```bash
cat > app.json << 'EOF'
{
  "pages": [
    "pages/index/index",
    "pages/tasks/list",
    "pages/tasks/detail",
    "pages/pomodoro/index",
    "pages/habits/index",
    "pages/countdown/index",
    "pages/statistics/index",
    "pages/settings/index"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "格物清单",
    "navigationBarTextStyle": "black"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "images/icon_home.png",
        "selectedIconPath": "images/icon_home_active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/tasks/list",
        "iconPath": "images/icon_task.png",
        "selectedIconPath": "images/icon_task_active.png",
        "text": "任务"
      },
      {
        "pagePath": "pages/pomodoro/index",
        "iconPath": "images/icon_pomodoro.png",
        "selectedIconPath": "images/icon_pomodoro_active.png",
        "text": "专注"
      },
      {
        "pagePath": "pages/statistics/index",
        "iconPath": "images/icon_stats.png",
        "selectedIconPath": "images/icon_stats_active.png",
        "text": "统计"
      }
    ]
  },
  "usingComponents": {},
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序位置接口的效果展示"
    }
  },
  "sitemapLocation": "sitemap.json",
  "style": "v2"
}
EOF
```

**Step 3: 创建app.ts**

```bash
cat > app.ts << 'EOF'
App<IAppOption>({
  globalData: {
    userInfo: null,
    apiBaseUrl: 'https://api.investigation.com',
  },

  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: (res) => {
        console.log('登录成功', res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
})
EOF
```

**Step 4: 创建app.wxss**

```bash
cat > app.wxss << 'EOF'
/**app.wxss**/
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Helvetica Neue', sans-serif;
}

.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 200rpx 0;
  box-sizing: border-box;
}
EOF
```

**Step 5: 创建sitemap.json**

```bash
cat > sitemap.json << 'EOF'
{
  "desc": "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/framework/sitemap.html",
  "rules": [{
    "action": "allow",
    "page": "*"
  }]
}
EOF
```

**Step 6: 创建README.md**

```bash
cat > README.md << 'EOF'
# 格物清单微信小程序

面向"自我提升者"的任务管理工具

## 技术栈

- 微信小程序原生框架
- TypeScript
- 微信云开发（可选）

## 项目结构

\`\`\`
pages/          # 页面
components/     # 组件
utils/          # 工具函数
api/            # API接口
images/         # 图片资源
styles/         # 全局样式
\`\`\`

## 开发

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目
3. 在 `project.config.json` 中填入你的 appid
4. 点击编译运行

## 提交代码前

1. 真机调试
2. 性能分析
3. 代码规范检查
EOF
```

**Step 7: 创建基础目录结构**

```bash
mkdir -p pages/index
mkdir -p pages/tasks
mkdir -p pages/pomodoro
mkdir -p pages/habits
mkdir -p pages/countdown
mkdir -p pages/statistics
mkdir -p pages/settings
mkdir -p components
mkdir -p utils
mkdir -p api
mkdir -p images
mkdir -p styles
```

**Step 8: Commit**

```bash
cd ..
git add investigation-miniprogram/
git commit -m "feat(miniprogram): initialize WeChat miniprogram project structure"
```

---

## Task 10: Docker开发环境配置

**Files:**
- Create: `docker-compose.yml`
- Create: `.dockerignore`

**Step 1: 创建docker-compose.yml**

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    container_name: investigation-postgres
    environment:
      POSTGRES_USER: investigation
      POSTGRES_PASSWORD: investigation123
      POSTGRES_DB: investigation
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U investigation"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: investigation-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
EOF
```

**Step 2: 创建.dockerignore**

```bash
cat > .dockerignore << 'EOF'
# Git
.git/
.gitignore

# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
venv/
env/
.venv/
*.egg-info/
dist/
build/

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 小程序
miniprogram_npm/

# IDE
.vscode/
.idea/
*.swp
*.swo

# 日志
*.log
logs/

# 测试
.pytest_cache/
.coverage
htmlcov/

# 环境
.env
.env.local

# 文档
docs/
*.md
EOF
```

**Step 3: 验证Docker Compose配置**

```bash
docker-compose config
```

Expected: 无错误输出

**Step 4: 测试启动服务**

```bash
docker-compose up -d
docker-compose ps
```

Expected: postgres和redis容器运行中

**Step 5: Commit**

```bash
git add docker-compose.yml .dockerignore
git commit -m "chore: add Docker Compose development environment"
```

---

## 验收标准

完成本阶段所有任务后，应该能够：

1. ✅ 三个独立工程的基础结构已创建
2. ✅ 后端服务可以启动，配置管理正常工作
3. ✅ 数据库连接正常，用户模型已创建
4. ✅ Alembic迁移已配置
5. ✅ 前端Vue项目结构完整
6. ✅ 小程序项目结构完整
7. ✅ Docker开发环境可正常启动PostgreSQL和Redis

## 下一步

完成Phase 1后，继续Phase 2：后端核心API开发

---

**Plan Version**: 1.0
**Last Updated**: 2025-02-13
