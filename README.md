# Attendance Tracker

Analyze Google Meet attendance exports with detailed metrics, visualizations, and multi-session comparisons.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Recharts
- **Backend**: Python FastAPI, Pandas
- **Database**: Firebase Firestore

## Project Structure

```
tracker/
├── apps/
│   ├── web/                  # Next.js frontend
│   └── api/                  # FastAPI backend
│       ├── main.py
│       ├── routers/          # API endpoints
│       ├── services/         # Business logic
│       └── models/           # Pydantic schemas
├── firebase/                 # Firestore rules & indexes
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.10+ (3.9 works but deprecated)
- pnpm
- Firebase project with Firestore enabled

### Environment Setup

1. **Backend Environment** (`apps/api/.env`):
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
```

2. **Frontend Environment** (`apps/web/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Installation & Running

**Backend**:
```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**:
```bash
cd apps/web
pnpm install
pnpm dev
```

The app will be available at `http://localhost:3000`

## Features

### Session Management

- **Smart Filename Parsing**: Automatically extracts session name and date from Google Meet exports
  - Example: `SkillCaptain _ Cursor AI Masterclass – 2026_02_07 21_22` → Session Name + Date
- **Dropdown Selector**: Clean multi-select interface with checkboxes
- **Session Identifier**: Uses `session-name-YYYY-MM-DD` for readable IDs

### Single Session Analysis

- **Upload**: Toggle upload zone, drag-and-drop or file picker for `.csv` / `.xlsx` / `.xls` files
- **Summary Metrics**: Total attendees, avg duration, completion rate, drop-off rate, session length
- **Timeline**: Per-minute attendance visualization with peak annotation
- **Exit Distribution**: When people left (5-minute windows), highlights biggest drop
- **Join Distribution**: On time / Late / Very late breakdown
- **Duration Breakdown**: Pie chart showing session length categories
- **Attendee Table**: Sortable, searchable, with status badges

### Multi-Session Comparison

- Attendance trends across sessions
- Average duration comparison
- Completion vs drop-off rates
- Retention breakdown (completed / left early / brief)
- Summary table with all key metrics

## File Format

Google Meet exports must follow this structure:

| Column | Description | Example |
|--------|-------------|---------|
| First name | First name | Kesavardhini |
| Last name | Last name | Agarwal |
| Email | Masked email | surb****@***.com |
| Duration | Time in session | 1 hr 25 mins |
| Time joined | HH:MM 24hr | 21:31 |
| Time exited | HH:MM 24hr | 22:55 |

## API Endpoints

- `POST /api/sessions/upload` - Upload and process attendance files
- `GET /api/sessions` - List all sessions (summary only)
- `GET /api/sessions/{session_id}` - Get full analysis for one session
- `DELETE /api/sessions/{session_id}` - Delete session from Firestore and Storage
- `GET /health` - Health check

## Design System

- **Colors**: Gray-50 background, Indigo-600 accent
- **Components**: Border-based cards with subtle shadows
- **Interactions**: Minimal hover effects, no animations
- **Typography**: System fonts for fast loading
- **Loading**: Skeletons for better perceived performance

## Firebase Schema

### Firestore Collection: `sessions`

Document ID uses format: `session-name-YYYY-MM-DD` (parsed from filename)

```typescript
{
  session_id: string           // e.g., "skillcaptain-cursor-ai-masterc-2026-02-07"
  session_name: string         // e.g., "SkillCaptain _ Cursor AI Masterclass"
  filename: string             // original filename
  upload_date: timestamp
  session_date: string         // YYYY-MM-DD
  session_datetime: timestamp  // parsed from filename
  status: "processed" | "error"
  summary: {
    total_attendees: number
    avg_duration_minutes: number
    session_duration_minutes: number
    drop_off_rate: number
    full_session_count: number
  }
  analysis: {
    timeline: [{ minute, count }]
    exit_distribution: [{ window, count }]
    join_distribution: [{ label, count }]
    duration_buckets: [{ label, count }]
    attendees: [{
      name, email, duration_minutes,
      joined, exited, status
    }]
  }
}
```

**Note**: Files are extracted and stored only in Firestore. The original files are not stored in Firebase Storage.

## Development Notes

- TypeScript strict mode enabled
- Python type hints throughout
- Modular structure - no god components or monolithic files
- Error handling with user-friendly messages
- No authentication (single-user V1)
