export interface AttendeeData {
  name: string;
  email: string;
  duration_minutes: number;
  joined: string;
  exited: string;
  status: "completed" | "left_early" | "briefly_joined";
}

export interface TimelinePoint {
  minute: number;
  count: number;
}

export interface ExitWindow {
  window: string;
  count: number;
}

export interface JoinCategory {
  label: string;
  count: number;
}

export interface DurationBucket {
  label: string;
  count: number;
}

export interface SessionAnalysis {
  timeline: TimelinePoint[];
  exit_distribution: ExitWindow[];
  join_distribution: JoinCategory[];
  duration_buckets: DurationBucket[];
  attendees: AttendeeData[];
}

export interface SessionSummary {
  total_attendees: number;
  avg_duration_minutes: number;
  session_duration_minutes: number;
  drop_off_rate: number;
  full_session_count: number;
}

export interface SessionDocument {
  session_id: string;
  session_name?: string;
  filename: string;
  upload_date: string;
  session_date: string;
  session_datetime?: string;
  status: "processed" | "error";
  summary: SessionSummary;
  analysis: SessionAnalysis;
}

export interface SessionListItem {
  session_id: string;
  session_name?: string;
  filename: string;
  upload_date: string;
  session_date: string;
  session_datetime?: string;
  status: "processed" | "error";
  summary: SessionSummary;
}

export interface UploadResponse {
  session_id: string;
  filename: string;
  status: "processed" | "error";
  message?: string;
}
