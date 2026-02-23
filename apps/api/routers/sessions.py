from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid
from datetime import datetime

from models.session import (
    SessionDocument, SessionListItem, UploadResponse, ErrorResponse
)
from services.parser import AttendanceParser
from services.analyzer import AttendanceAnalyzer
from services.firebase import FirebaseService
from services.filename_parser import FilenameParser


router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("/upload", response_model=List[UploadResponse])
async def upload_sessions(files: List[UploadFile] = File(...)):
    """
    Upload one or more attendance files.
    Parse, analyze, and store in Firestore.
    """
    responses = []
    
    for file in files:
        try:
            # Validate file type
            if not file.filename:
                raise ValueError("File has no name")
            
            if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
                raise ValueError("File must be .csv, .xlsx, or .xls")
            
            # Parse filename to extract session name and date
            session_name, session_date, session_datetime = FilenameParser.parse_filename(file.filename)
            
            # Generate readable session ID
            session_id = FilenameParser.generate_session_id(session_name, session_date)
            
            # Read file content
            file_content = await file.read()
            
            # Parse file
            attendees = AttendanceParser.parse_file(file_content, file.filename)
            
            if not attendees:
                raise ValueError("No attendees found in file")
            
            # Infer session times
            start_time, end_time, session_duration = AttendanceParser.infer_session_times(attendees)
            
            # Analyze
            summary, analysis = AttendanceAnalyzer.analyze(attendees, session_duration)
            
            # Prepare session document
            upload_date = datetime.now()
            
            session_doc = {
                'session_id': session_id,
                'session_name': session_name,
                'filename': file.filename,
                'upload_date': upload_date,
                'session_date': session_date,
                'session_datetime': session_datetime,
                'status': 'processed',
                'summary': summary.model_dump(),
                'analysis': analysis.model_dump()
            }
            
            # Save to Firestore
            FirebaseService.save_session(session_id, session_doc)
            
            responses.append(UploadResponse(
                session_id=session_id,
                filename=file.filename,
                status="processed",
                message=None
            ))
            
        except Exception as e:
            # Log error and continue with other files
            error_msg = str(e)
            
            # Generate session ID for error case too
            try:
                session_name, session_date, session_datetime = FilenameParser.parse_filename(
                    file.filename if file.filename else 'unknown.csv'
                )
                session_id = FilenameParser.generate_session_id(session_name, session_date)
            except:
                session_id = str(uuid.uuid4())
            
            # Save error to Firestore
            try:
                error_doc = {
                    'session_id': session_id,
                    'session_name': session_name if 'session_name' in locals() else 'Unknown',
                    'filename': file.filename if file.filename else 'unknown',
                    'upload_date': datetime.now(),
                    'session_date': session_date if 'session_date' in locals() else '',
                    'session_datetime': session_datetime if 'session_datetime' in locals() else datetime.now(),
                    'status': 'error',
                    'summary': {
                        'total_attendees': 0,
                        'avg_duration_minutes': 0,
                        'session_duration_minutes': 0,
                        'drop_off_rate': 0,
                        'full_session_count': 0
                    },
                    'analysis': {
                        'timeline': [],
                        'exit_distribution': [],
                        'join_distribution': [],
                        'duration_buckets': [],
                        'attendees': []
                    }
                }
                FirebaseService.save_session(session_id, error_doc)
            except:
                pass
            
            responses.append(UploadResponse(
                session_id=session_id,
                filename=file.filename if file.filename else 'unknown',
                status="error",
                message=error_msg
            ))
    
    return responses


@router.get("", response_model=List[SessionListItem])
async def list_sessions():
    """List all sessions with summary data only."""
    try:
        sessions = FirebaseService.list_sessions()
        
        result = []
        for s in sessions:
            result.append(SessionListItem(
                session_id=s['session_id'],
                filename=s['filename'],
                upload_date=s['upload_date'],
                session_date=s['session_date'],
                status=s['status'],
                summary=s['summary']
            ))
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{session_id}", response_model=SessionDocument)
async def get_session(session_id: str):
    """Get full analysis for a specific session."""
    try:
        session = FirebaseService.get_session(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return SessionDocument(**session)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """Delete a session from Firestore and Storage."""
    try:
        success = FirebaseService.delete_session(session_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"success": True, "session_id": session_id}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
