import pandas as pd
import re
from typing import List, Dict, Any
from datetime import datetime
import io


class AttendanceParser:
    """Parse attendance files from Google Meet exports."""
    
    @staticmethod
    def parse_duration(duration_str: str) -> float:
        """Parse duration string like '1 hr 26 mins' to total minutes."""
        if not duration_str or pd.isna(duration_str):
            return 0.0
        
        duration_str = str(duration_str).strip().lower()
        total_minutes = 0.0
        
        # Extract hours
        hr_match = re.search(r'(\d+)\s*hr', duration_str)
        if hr_match:
            total_minutes += int(hr_match.group(1)) * 60
        
        # Extract minutes
        min_match = re.search(r'(\d+)\s*min', duration_str)
        if min_match:
            total_minutes += int(min_match.group(1))
        
        return total_minutes
    
    @staticmethod
    def parse_time(time_str: str) -> str:
        """Parse time string in HH:MM format (24hr)."""
        if not time_str or pd.isna(time_str):
            return ""
        
        time_str = str(time_str).strip()
        # Handle potential different formats
        try:
            # Try parsing as HH:MM
            parts = time_str.split(':')
            if len(parts) == 2:
                return f"{int(parts[0]):02d}:{int(parts[1]):02d}"
        except:
            pass
        
        return time_str
    
    @staticmethod
    def parse_file(file_content: bytes, filename: str) -> List[Dict[str, Any]]:
        """
        Parse an attendance file (CSV or XLSX) and return list of attendee records.
        
        Expected columns:
        - First name
        - Last name
        - Email
        - Duration
        - Time joined
        - Time exited
        """
        try:
            # Determine file type and read
            if filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file_content))
            elif filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(file_content), engine='openpyxl')
            else:
                raise ValueError(f"Unsupported file format: {filename}")
            
            # Normalize column names (case insensitive, strip spaces)
            df.columns = df.columns.str.strip().str.lower()
            
            # Map expected columns
            column_mapping = {
                'first name': 'first_name',
                'last name': 'last_name',
                'email': 'email',
                'duration': 'duration',
                'time joined': 'time_joined',
                'time exited': 'time_exited'
            }
            
            # Verify required columns exist
            required_cols = ['first name', 'email', 'duration', 'time joined', 'time exited']
            missing_cols = [col for col in required_cols if col not in df.columns]
            if missing_cols:
                raise ValueError(f"Missing required columns: {missing_cols}")
            
            # Rename columns
            df = df.rename(columns=column_mapping)
            
            # Parse each row
            attendees = []
            for _, row in df.iterrows():
                first_name = str(row.get('first_name', '')).strip()
                last_name = str(row.get('last_name', '')).strip() if 'last_name' in df.columns else ''
                
                # Handle NaN values from pandas
                if first_name == 'nan':
                    first_name = ''
                if last_name == 'nan':
                    last_name = ''
                
                # Combine name
                name_parts = [first_name, last_name]
                name = ' '.join(part for part in name_parts if part and part.lower() != 'nan')
                
                attendee = {
                    'name': name,
                    'email': str(row['email']).strip(),
                    'duration_minutes': AttendanceParser.parse_duration(row['duration']),
                    'time_joined': AttendanceParser.parse_time(row['time_joined']),
                    'time_exited': AttendanceParser.parse_time(row['time_exited'])
                }
                attendees.append(attendee)
            
            return attendees
        
        except Exception as e:
            raise ValueError(f"Failed to parse file {filename}: {str(e)}")
    
    @staticmethod
    def infer_session_times(attendees: List[Dict[str, Any]]) -> tuple[str, str, int]:
        """
        Infer session start and end times from attendee join/exit times.
        Returns: (start_time, end_time, duration_minutes)
        """
        if not attendees:
            return ("00:00", "00:00", 0)
        
        def time_to_minutes(time_str: str) -> int:
            """Convert HH:MM to minutes since midnight."""
            try:
                parts = time_str.split(':')
                return int(parts[0]) * 60 + int(parts[1])
            except:
                return 0
        
        # Get all join and exit times
        join_times = [time_to_minutes(a['time_joined']) for a in attendees if a['time_joined']]
        exit_times = [time_to_minutes(a['time_exited']) for a in attendees if a['time_exited']]
        
        if not join_times or not exit_times:
            return ("00:00", "00:00", 0)
        
        session_start_mins = min(join_times)
        session_end_mins = max(exit_times)
        session_duration = session_end_mins - session_start_mins
        
        # Convert back to HH:MM
        start_time = f"{session_start_mins // 60:02d}:{session_start_mins % 60:02d}"
        end_time = f"{session_end_mins // 60:02d}:{session_end_mins % 60:02d}"
        
        return (start_time, end_time, session_duration)
