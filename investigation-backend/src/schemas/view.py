from datetime import date

from pydantic import BaseModel

from src.schemas.task import TaskOut


class TimelineBucket(BaseModel):
    date: date
    tasks: list[TaskOut]


class EisenhowerView(BaseModel):
    q1: list[TaskOut]
    q2: list[TaskOut]
    q3: list[TaskOut]
    q4: list[TaskOut]
