import re
from datetime import datetime


class FilenameParser:
    """Extract session name and date from Google Meet export filenames."""
    
    @staticmethod
    def parse_filename(filename: str) -> tuple[str, str]:
        """
        Parse filename to extract session name and date.
        
        Expected format examples:
        - "SkillCaptain _ Cursor AI Masterclass – 2026_02_07 21_22 GMT+05_30 – Attendance.xlsx"
        - "Python Workshop – 2026_01_15 14_30 GMT+05_30 – Attendance.csv"
        
        Returns: (session_name, session_date_iso)
        """
        try:
            # Remove file extension
            name_without_ext = filename.rsplit('.', 1)[0]
            
            # Remove " – Attendance" suffix if present
            name_without_ext = re.sub(r'\s*[–-]\s*Attendance\s*$', '', name_without_ext, flags=re.IGNORECASE)
            
            # Try to find date pattern: YYYY_MM_DD HH_MM
            date_pattern = r'(\d{4})_(\d{2})_(\d{2})\s+(\d{2})_(\d{2})'
            date_match = re.search(date_pattern, name_without_ext)
            
            if date_match:
                year, month, day, hour, minute = date_match.groups()
                
                # Extract session name (everything before the date)
                session_name = name_without_ext[:date_match.start()].strip()
                # Remove trailing separators
                session_name = re.sub(r'\s*[–-]\s*$', '', session_name).strip()
                
                # Format date as ISO
                session_date = f"{year}-{month}-{day}"
                session_datetime = datetime(int(year), int(month), int(day), int(hour), int(minute))
                
                return (session_name, session_date, session_datetime)
            
            # Fallback: use filename without extension as session name
            return (name_without_ext.strip(), datetime.now().strftime('%Y-%m-%d'), datetime.now())
            
        except Exception as e:
            # If parsing fails, use filename as-is
            return (filename, datetime.now().strftime('%Y-%m-%d'), datetime.now())
    
    @staticmethod
    def generate_session_id(session_name: str, session_date: str) -> str:
        """
        Generate a unique but readable session ID.
        Format: sessionname-YYYY-MM-DD-UUID
        """
        # Clean session name for ID
        clean_name = re.sub(r'[^a-zA-Z0-9]+', '-', session_name.lower())
        clean_name = clean_name.strip('-')[:30]  # Max 30 chars
        
        return f"{clean_name}-{session_date}"
