from __future__ import annotations

from datetime import date, timedelta
from typing import Any

import calendar


def _add_months(value: date, months: int) -> date:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    last_day = calendar.monthrange(year, month)[1]
    day = min(value.day, last_day)
    return date(year, month, day)


def _add_years(value: date, years: int) -> date:
    try:
        return value.replace(year=value.year + years)
    except ValueError:
        return value.replace(month=2, day=28, year=value.year + years)


def next_due_date(rule: dict[str, Any], base_date: date) -> date | None:
    freq = str(rule.get("freq", "")).lower()
    interval = int(rule.get("interval", 1) or 1)
    if interval <= 0:
        interval = 1

    if freq == "daily":
        return base_date + timedelta(days=interval)
    if freq == "weekly":
        byweekday = rule.get("byweekday") or []
        if byweekday:
            candidates = sorted({int(day) % 7 for day in byweekday})
            for offset in range(1, 7 * interval + 1):
                candidate = base_date + timedelta(days=offset)
                if candidate.weekday() in candidates:
                    return candidate
            return base_date + timedelta(days=7 * interval)
        return base_date + timedelta(days=7 * interval)
    if freq == "monthly":
        return _add_months(base_date, interval)
    if freq == "yearly":
        return _add_years(base_date, interval)

    return None
