default:
  @just --list

backend port="8000":
  cd investigation-backend && if [ ! -x .venv/bin/uvicorn ]; then uv sync; fi
  cd investigation-backend && uv run -m uvicorn src.main:app --reload --port {{port}}

backend-install:
  cd investigation-backend && uv sync

backend-migrate:
  cd investigation-backend && uv run -m alembic upgrade head

admin:
  cd investigation-admin && if [ ! -d node_modules ]; then npm install; fi
  cd investigation-admin && npm run dev

admin-install:
  cd investigation-admin && npm install

admin-build:
  cd investigation-admin && npm run build

miniprogram tool="/Applications/wechatwebdevtools.app":
  open -a "{{tool}}" investigation-miniprogram || open -a "WeChat DevTools" investigation-miniprogram || open -a "Wechat Devtools" investigation-miniprogram || open -a "/Applications/wechatwebdevtools.app" investigation-miniprogram

miniprogram-install:
  cd investigation-miniprogram && pnpm install

miniprogram-compile:
  cd investigation-miniprogram && pnpm run compile

miniprogram-watch:
  cd investigation-miniprogram && pnpm run watch
