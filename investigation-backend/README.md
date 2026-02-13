# Investigation Backend

FastAPI + SQLAlchemy + Alembic (async) backend service.

## Quick Start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
cp .env.example .env
uvicorn src.main:app --reload --port 8000
```

## Migrations

```bash
alembic upgrade head
```
