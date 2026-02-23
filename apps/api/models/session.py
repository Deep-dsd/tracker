from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime


class AttendeeData(BaseModel):
    name: str
    email: str
    duration_minutes: float
    joined: str
    exited: str
    status: Literal["completed", "left_early", "briefly_joined"]


class TimelinePoint(BaseModel):
    minute: int
    count: int


class ExitWindow(BaseModel):
    window: str
    count: int


class JoinCategory(BaseModel):
    label: str
    count: int


class DurationBucket(BaseModel):
    label: str
    count: int


class SessionAnalysis(BaseModel):
    timeline: List[TimelinePoint]
    exit_distribution: List[ExitWindow]
    join_distribution: List[JoinCategory]
    duration_buckets: List[DurationBucket]
    attendees: List[AttendeeData]


class SessionSummary(BaseModel):
    total_attendees: int
    avg_duration_minutes: float
    session_duration_minutes: int
    drop_off_rate: float
    full_session_count: int


class SessionDocument(BaseModel):
    session_id: str
    session_name: Optional[str] = None
    filename: str
    upload_date: datetime
    session_date: str
    session_datetime: Optional[datetime] = None
    status: Literal["processed", "error"]
    summary: SessionSummary
    analysis: SessionAnalysis


class SessionListItem(BaseModel):
    session_id: str
    session_name: Optional[str] = None
    filename: str
    upload_date: datetime
    session_date: str
    session_datetime: Optional[datetime] = None
    status: Literal["processed", "error"]
    summary: SessionSummary


class UploadResponse(BaseModel):
    session_id: str
    filename: str
    status: Literal["processed", "error"]
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    detail: str
