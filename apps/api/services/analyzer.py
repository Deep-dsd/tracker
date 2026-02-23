from typing import List, Dict, Any
from models.session import (
    SessionAnalysis, SessionSummary, AttendeeData,
    TimelinePoint, ExitWindow, JoinCategory, DurationBucket
)


class AttendanceAnalyzer:
    """Analyze parsed attendance data and compute metrics."""
    
    @staticmethod
    def analyze(attendees: List[Dict[str, Any]], session_duration_minutes: int) -> tuple[SessionSummary, SessionAnalysis]:
        """
        Compute full analysis from parsed attendees.
        Returns: (summary, analysis)
        """
        if not attendees:
            return (
                SessionSummary(
                    total_attendees=0,
                    avg_duration_minutes=0,
                    session_duration_minutes=session_duration_minutes,
                    drop_off_rate=0,
                    full_session_count=0
                ),
                SessionAnalysis(
                    timeline=[],
                    exit_distribution=[],
                    join_distribution=[],
                    duration_buckets=[],
                    attendees=[]
                )
            )
        
        # Basic metrics
        total_attendees = len(attendees)
        total_duration = sum(a['duration_minutes'] for a in attendees)
        avg_duration = total_duration / total_attendees if total_attendees > 0 else 0
        
        # Full session threshold (90% of session)
        full_session_threshold = session_duration_minutes * 0.9
        full_session_count = sum(1 for a in attendees if a['duration_minutes'] >= full_session_threshold)
        
        # Drop-off rate (those who left before session ended)
        drop_off_count = sum(1 for a in attendees if a['duration_minutes'] < session_duration_minutes)
        drop_off_rate = (drop_off_count / total_attendees * 100) if total_attendees > 0 else 0
        
        # Classify attendees
        attendee_models = []
        for a in attendees:
            if a['duration_minutes'] < 10:
                status = "briefly_joined"
            elif a['duration_minutes'] >= full_session_threshold:
                status = "completed"
            else:
                status = "left_early"
            
            attendee_models.append(AttendeeData(
                name=a['name'],
                email=a['email'],
                duration_minutes=round(a['duration_minutes'], 1),
                joined=a['time_joined'],
                exited=a['time_exited'],
                status=status
            ))
        
        # Compute timeline (per-minute attendance count)
        timeline = AttendanceAnalyzer._compute_timeline(attendees, session_duration_minutes)
        
        # Exit distribution (5-minute windows)
        exit_distribution = AttendanceAnalyzer._compute_exit_distribution(attendees, session_duration_minutes)
        
        # Join distribution (on time, late, very late)
        join_distribution = AttendanceAnalyzer._compute_join_distribution(attendees)
        
        # Duration buckets
        duration_buckets = AttendanceAnalyzer._compute_duration_buckets(attendees)
        
        summary = SessionSummary(
            total_attendees=total_attendees,
            avg_duration_minutes=round(avg_duration, 1),
            session_duration_minutes=session_duration_minutes,
            drop_off_rate=round(drop_off_rate, 1),
            full_session_count=full_session_count
        )
        
        analysis = SessionAnalysis(
            timeline=timeline,
            exit_distribution=exit_distribution,
            join_distribution=join_distribution,
            duration_buckets=duration_buckets,
            attendees=attendee_models
        )
        
        return (summary, analysis)
    
    @staticmethod
    def _compute_timeline(attendees: List[Dict[str, Any]], session_duration: int) -> List[TimelinePoint]:
        """Compute per-minute attendance count."""
        
        def time_to_minutes(time_str: str) -> int:
            try:
                parts = time_str.split(':')
                return int(parts[0]) * 60 + int(parts[1])
            except:
                return 0
        
        if not attendees or session_duration <= 0:
            return []
        
        # Find session start time (earliest join)
        session_start = min(time_to_minutes(a['time_joined']) for a in attendees if a['time_joined'])
        
        # Count attendees present at each minute
        timeline_data = []
        for minute in range(session_duration + 1):
            current_time = session_start + minute
            count = 0
            
            for a in attendees:
                join_mins = time_to_minutes(a['time_joined'])
                exit_mins = time_to_minutes(a['time_exited'])
                
                # Check if attendee was present at this minute
                if join_mins <= current_time <= exit_mins:
                    count += 1
            
            timeline_data.append(TimelinePoint(minute=minute, count=count))
        
        return timeline_data
    
    @staticmethod
    def _compute_exit_distribution(attendees: List[Dict[str, Any]], session_duration: int) -> List[ExitWindow]:
        """Group exits into 5-minute windows."""
        
        def time_to_minutes(time_str: str) -> int:
            try:
                parts = time_str.split(':')
                return int(parts[0]) * 60 + int(parts[1])
            except:
                return 0
        
        if not attendees or session_duration <= 0:
            return []
        
        session_start = min(time_to_minutes(a['time_joined']) for a in attendees if a['time_joined'])
        
        # Create 5-minute buckets
        num_buckets = (session_duration // 5) + 2
        buckets = {i: 0 for i in range(num_buckets)}
        
        for a in attendees:
            exit_mins = time_to_minutes(a['time_exited'])
            minutes_since_start = exit_mins - session_start
            bucket_idx = minutes_since_start // 5
            
            if bucket_idx < 0:
                bucket_idx = 0
            elif bucket_idx >= num_buckets:
                bucket_idx = num_buckets - 1
            
            buckets[bucket_idx] += 1
        
        # Format output
        windows = []
        for idx, count in sorted(buckets.items()):
            start_min = idx * 5
            end_min = start_min + 5
            window_label = f"{start_min}-{end_min} min"
            if count > 0:
                windows.append(ExitWindow(window=window_label, count=count))
        
        return windows
    
    @staticmethod
    def _compute_join_distribution(attendees: List[Dict[str, Any]]) -> List[JoinCategory]:
        """Categorize joins: on time (≤5 mins), late (5-15 mins), very late (15+ mins)."""
        
        def time_to_minutes(time_str: str) -> int:
            try:
                parts = time_str.split(':')
                return int(parts[0]) * 60 + int(parts[1])
            except:
                return 0
        
        if not attendees:
            return []
        
        session_start = min(time_to_minutes(a['time_joined']) for a in attendees if a['time_joined'])
        
        on_time = 0
        late = 0
        very_late = 0
        
        for a in attendees:
            join_mins = time_to_minutes(a['time_joined'])
            delay = join_mins - session_start
            
            if delay <= 5:
                on_time += 1
            elif delay <= 15:
                late += 1
            else:
                very_late += 1
        
        return [
            JoinCategory(label="On time (≤5 min)", count=on_time),
            JoinCategory(label="Late (5-15 min)", count=late),
            JoinCategory(label="Very late (15+ min)", count=very_late)
        ]
    
    @staticmethod
    def _compute_duration_buckets(attendees: List[Dict[str, Any]]) -> List[DurationBucket]:
        """Group attendees by duration: <15, 15-30, 30-60, 60+ mins."""
        
        buckets = {
            "<15 min": 0,
            "15-30 min": 0,
            "30-60 min": 0,
            "60+ min": 0
        }
        
        for a in attendees:
            duration = a['duration_minutes']
            if duration < 15:
                buckets["<15 min"] += 1
            elif duration < 30:
                buckets["15-30 min"] += 1
            elif duration < 60:
                buckets["30-60 min"] += 1
            else:
                buckets["60+ min"] += 1
        
        return [DurationBucket(label=label, count=count) for label, count in buckets.items()]
