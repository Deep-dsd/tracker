# Quick Start Guide

## Prerequisites

- Python 3.10+ (3.9 works but is deprecated)
- Node.js 20+
- pnpm
- Firebase project with Firestore and Storage enabled

## Setup (5 minutes)

### 1. Install Dependencies

**Backend:**
```bash
cd apps/api
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd apps/web
pnpm install
```

### 2. Configure Environment Variables

**Backend** - Create `apps/api/.env`:
```bash
FIREBASE_PROJECT_ID=tracker-31f55
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@tracker-31f55.iam.gserviceaccount.com
```

**Frontend** - Create `apps/web/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tracker-31f55.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tracker-31f55
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=858...
NEXT_PUBLIC_FIREBASE_APP_ID=1:858...
```

Get Firebase credentials from:
- Backend: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
- Frontend: Firebase Console → Project Settings → General → Your apps → Web app config

### 3. Deploy Firestore Rules and Indexes

**Important**: Deploy the security rules so Firestore is accessible:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login
firebase login

# Initialize (select your project: tracker-31f55)
firebase init firestore
# When prompted:
# - "What file should be used for Firestore Rules?" → firebase/firestore.rules
# - "What file should be used for Firestore indexes?" → firebase/firestore.indexes.json

# Deploy rules and indexes
firebase deploy --only firestore
```

**Note**: The `sessions` collection will be created automatically when you upload your first file. You don't need to create it manually.

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd apps/api
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```

Open http://localhost:3000 (or the port shown in terminal)

## First Use

1. **Upload Files**: Drag and drop or click to select Google Meet attendance exports (.csv, .xlsx)
2. **View Sessions**: Uploaded sessions appear in the left sidebar
3. **Analyze**: Click a session to see detailed analytics
4. **Compare**: Select multiple sessions to see comparison view

## API Endpoints

- `GET /health` - Health check
- `POST /api/sessions/upload` - Upload attendance files
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/{id}` - Get session details
- `DELETE /api/sessions/{id}` - Delete session

## Troubleshooting

**Backend won't start:**
- Check Python version: `python3 --version` (need 3.10+)
- Verify Firebase credentials in `.env`
- Check if port 8000 is available

**Frontend won't start:**
- Check Node version: `node --version` (need 20+)
- Run `pnpm install` again if modules are missing
- Check if port 3000 is available

**Upload fails:**
- Verify file format matches Google Meet export structure
- Check backend logs for parsing errors
- Ensure Firebase Storage is enabled

**CORS errors:**
- Backend CORS is configured for ports 3000 and 3001
- If using different port, update `main.py` allow_origins

## File Format

Google Meet exports must have these columns:
- First name
- Last name (optional)
- Email
- Duration (e.g., "1 hr 25 mins")
- Time joined (HH:MM 24hr)
- Time exited (HH:MM 24hr)
