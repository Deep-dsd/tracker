# Project Structure

## Backend (apps/api)

```
apps/api/
├── main.py                    # FastAPI app initialization, CORS, router registration
├── requirements.txt           # Python dependencies
├── .env                       # Firebase credentials (gitignored)
├── models/
│   └── session.py            # Pydantic models for API request/response
├── services/
│   ├── parser.py             # Parse CSV/XLSX attendance files
│   ├── analyzer.py           # Compute metrics and analytics
│   └── firebase.py           # Firestore and Storage interactions
└── routers/
    └── sessions.py           # API endpoints: upload, list, get, delete
```

### Key Backend Files

**models/session.py**: All Pydantic schemas
- `AttendeeData` - Individual attendee record with status
- `SessionSummary` - High-level session metrics
- `SessionAnalysis` - Detailed analytics (timeline, distributions, etc.)
- `SessionDocument` - Complete session record
- `UploadResponse` - Upload result per file

**services/parser.py**: File parsing logic
- Parse duration strings → minutes
- Parse time strings → HH:MM format
- Extract attendee records from CSV/XLSX
- Infer session start/end times

**services/analyzer.py**: Analysis computations
- Compute attendance timeline (per-minute count)
- Group exits into 5-minute windows
- Categorize joins (on time, late, very late)
- Bucket durations (<15, 15-30, 30-60, 60+)
- Assign attendee status (completed, left_early, briefly_joined)

**services/firebase.py**: Firebase interactions
- Initialize Firebase Admin SDK
- Upload files to Storage
- Save/get/list/delete Firestore documents

**routers/sessions.py**: API endpoints
- `POST /api/sessions/upload` - Multi-file upload with parsing
- `GET /api/sessions` - List all sessions (summary only)
- `GET /api/sessions/{id}` - Full session analysis
- `DELETE /api/sessions/{id}` - Remove from Firestore and Storage

## Frontend (apps/web)

```
apps/web/
├── app/
│   ├── layout.tsx                 # Root layout with metadata
│   ├── page.tsx                   # Redirects to /dashboard/attendance
│   ├── globals.css                # Tailwind imports and base styles
│   └── dashboard/
│       ├── layout.tsx             # Dashboard layout (sidebar + content)
│       └── attendance/
│           └── page.tsx           # Main attendance analysis page
├── components/
│   ├── ui/
│   │   ├── Badge.tsx             # Status badges (success, warning, error)
│   │   ├── Button.tsx            # Primary, secondary, danger variants
│   │   ├── Card.tsx              # Container with border and shadow
│   │   └── Skeleton.tsx          # Loading state placeholder
│   ├── layout/
│   │   ├── Sidebar.tsx           # Navigation with active/disabled states
│   │   └── TopBar.tsx            # Header with date display
│   ├── upload/
│   │   ├── FileUploadZone.tsx    # Drag-and-drop file picker
│   │   └── UploadProgress.tsx    # Per-file upload status
│   ├── sessions/
│   │   ├── SessionCard.tsx       # Session summary card
│   │   └── SessionList.tsx       # List with multi-select
│   └── analytics/
│       ├── SummaryCards.tsx      # 5 metric cards
│       ├── AttendanceTimeline.tsx # Line chart with peak annotation
│       ├── DropOffChart.tsx      # Bar chart highlighting biggest drop
│       ├── JoinDistributionChart.tsx # Bar chart for join timing
│       ├── DurationPieChart.tsx  # Donut chart with percentages
│       ├── AttendeeTable.tsx     # Sortable, searchable table
│       └── MultiSessionComparison.tsx # Comparison view
├── hooks/
│   ├── useSessions.ts            # Fetch and manage session list
│   └── useSessionAnalysis.ts     # Fetch single session details
├── lib/
│   ├── api.ts                    # Typed API client functions
│   └── firebase.ts               # Firebase client initialization
├── types/
│   └── session.ts                # TypeScript interfaces
└── package.json
```

### Key Frontend Files

**app/dashboard/attendance/page.tsx**: Main page
- File upload with progress tracking
- Session list with multi-select
- Single session detailed analytics
- Multi-session comparison view

**components/analytics/**: Visualization components
- All use Recharts for consistent styling
- Responsive containers
- Tooltips with custom styling
- Colors follow design system (indigo-600 primary)

**hooks/**: Data fetching
- `useSessions` - List, delete, refresh sessions
- `useSessionAnalysis` - Fetch single session with loading states

**lib/api.ts**: API client
- Typed wrappers for all endpoints
- FormData handling for file uploads
- Error handling with ApiError class

## Design System

### Colors
- Background: `bg-gray-50`
- Cards: `bg-white` with `border-gray-100`
- Primary accent: `bg-indigo-600`
- Text: `text-gray-900` (headings), `text-gray-600` (body), `text-gray-500` (muted)

### Components
- Cards: `rounded-xl` with `shadow-sm`
- Buttons: `rounded-lg` with subtle hover
- Badges: `rounded-full` with tinted backgrounds
- Spacing: Generous padding (p-6, p-8)

### Status Colors
- Success: green-600 / green-50 bg
- Warning: yellow-600 / yellow-50 bg
- Error: red-600 / red-50 bg
- Neutral: gray-600 / gray-50 bg

## Data Flow

1. **Upload**: User drops files → Frontend sends to API → Backend parses → Saves to Firebase
2. **List**: Frontend fetches from API → API queries Firestore → Returns summaries
3. **View**: User selects session → Frontend fetches full doc → Renders charts
4. **Delete**: User confirms → Frontend calls API → API removes from Firestore + Storage
5. **Compare**: Multiple sessions selected → Frontend fetches all → Renders comparison

## Firebase Structure

### Firestore
Collection: `sessions`
Document ID: UUID
Fields: session_id, filename, upload_date, session_date, status, storage_path, summary, analysis

### Storage
Path: `sessions/{session_id}/{filename}`
Contains original uploaded file

## Testing Locally

1. Start backend: `cd apps/api && source venv/bin/activate && uvicorn main:app --reload`
2. Start frontend: `cd apps/web && pnpm dev`
3. Upload sample Google Meet export
4. Click session to view analytics
5. Select multiple sessions for comparison

## Future Enhancements (Not in V1)

- Student Management tab
- Schedule tab
- Settings tab
- Authentication
- Export analytics as PDF/CSV
- Email notifications
- Recurring session patterns
