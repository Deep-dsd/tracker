import firebase_admin
from firebase_admin import credentials, firestore
from typing import Dict, Any, List, Optional
import os
from datetime import datetime
import json


class FirebaseService:
    """Service for interacting with Firestore."""
    
    _initialized = False
    _db = None
    
    @classmethod
    def initialize(cls):
        """Initialize Firebase Admin SDK."""
        if cls._initialized:
            return
        
        project_id = os.getenv("FIREBASE_PROJECT_ID")
        private_key = os.getenv("FIREBASE_PRIVATE_KEY")
        client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
        
        if not all([project_id, private_key, client_email]):
            raise ValueError("Missing Firebase credentials in environment variables")
        
        # Parse private key (handle newlines)
        private_key = private_key.replace('\\n', '\n')
        
        cred_dict = {
            "type": "service_account",
            "project_id": project_id,
            "private_key": private_key,
            "client_email": client_email,
            "token_uri": "https://oauth2.googleapis.com/token"
        }
        
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        
        cls._db = firestore.client()
        cls._initialized = True
    
    @classmethod
    def get_db(cls):
        """Get Firestore client."""
        if not cls._initialized:
            cls.initialize()
        return cls._db
    
    @classmethod
    def save_session(cls, session_id: str, data: Dict[str, Any]) -> None:
        """Save session document to Firestore."""
        db = cls.get_db()
        
        # Firestore handles datetime objects automatically, just save as-is
        db.collection('sessions').document(session_id).set(data)
    
    @classmethod
    def get_session(cls, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session document from Firestore."""
        db = cls.get_db()
        doc = db.collection('sessions').document(session_id).get()
        
        if doc.exists:
            return doc.to_dict()
        return None
    
    @classmethod
    def list_sessions(cls) -> List[Dict[str, Any]]:
        """List all sessions, ordered by upload date desc."""
        db = cls.get_db()
        docs = db.collection('sessions').order_by('upload_date', direction=firestore.Query.DESCENDING).stream()
        
        sessions = []
        for doc in docs:
            data = doc.to_dict()
            data['session_id'] = doc.id
            sessions.append(data)
        
        return sessions
    
    @classmethod
    def delete_session(cls, session_id: str) -> bool:
        """Delete session from Firestore."""
        db = cls.get_db()
        
        doc = db.collection('sessions').document(session_id).get()
        if not doc.exists:
            return False
        
        db.collection('sessions').document(session_id).delete()
        return True
