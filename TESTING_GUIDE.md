# Testing Guide

## Verify Your Setup

### 1. Check Firebase Firestore Rules

Go to Firebase Console → Firestore Database → Rules

Should see:
```javascript
match /sessions/{sessionId} {
  allow read, write: if true;
}
```

If you see `allow read, write: if false;`, deploy the updated rules:
```bash
firebase deploy --only firestore
```

### 2. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd apps/api
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```

You should see:
```
✓ Ready in XXXms
- Local:   http://localhost:3000
```

### 3. Test with Your Sample File

1. Open http://localhost:3000 (redirects to `/dashboard/attendance`)
2. Click **"Upload Files"** button (top right)
3. Drop your file: `SkillCaptain _ Cursor AI Masterclass – 2026_02_07 21_22 GMT+05_30 – Attendance.xlsx`
4. Wait for upload progress (should show green checkmark)
5. Click **"Select Sessions"** dropdown
6. Check the session: "SkillCaptain _ Cursor AI Masterclass" with date "Feb 7, 2026"
7. Analytics should load below

### 4. Verify Firestore Data

Go to Firebase Console → Firestore Database → sessions collection

You should see a document with ID: `skillcaptain-cursor-ai-masterc-2026-02-07`

Click on it and verify these fields exist:
- ✓ `session_id` (string)
- ✓ `session_name` (string) = "SkillCaptain _ Cursor AI Masterclass"
- ✓ `filename` (string)
- ✓ `upload_date` (timestamp)
- ✓ `session_date` (string) = "2026-02-07"
- ✓ `session_datetime` (timestamp)
- ✓ `status` (string) = "processed"
- ✓ `summary` (map) with 5 fields
- ✓ `analysis` (map) with 5 arrays

**If columns are empty**, check:
- Are you looking at the right document?
- Does the Firebase console show "No fields" or are fields there but empty?
- Check backend terminal for errors during upload

### 5. Test Analytics

With your file loaded:

**Summary Cards** should show:
- Total Attendees: 34
- Avg Duration: ~60 min
- Completion Rate: ~21% (7 out of 34)
- Drop-off Rate: ~100% (since session was 94 mins, few stayed entire time)
- Session Length: 94 min

**Timeline Chart** should show:
- X-axis: 0 to 94 minutes
- Peak attendance somewhere in middle
- Line showing attendance fluctuation

**Exit Distribution** should show:
- Multiple bars for different time windows
- Biggest drop highlighted in red

**Join Distribution** should show:
- Most attendees "On time (≤5 min)"
- Some "Late (5-15 min)"
- Some "Very late (15+ min)"

**Duration Breakdown** should show:
- Distribution across: <15, 15-30, 30-60, 60+ mins

**Attendee Table** should show:
- All 34 attendees
- Names clean (no "nan")
- Status badges (completed/left_early/briefly_joined)
- Sortable by clicking column headers
- Searchable by name or email

### 6. Test Multi-Session Comparison

1. Upload another attendance file (or same file with different name)
2. Click "Select Sessions" dropdown
3. Check **both sessions**
4. Should see comparison view with:
   - Attendance trend line chart
   - Completion vs drop-off bar chart
   - Retention breakdown
   - Summary table

## Troubleshooting

### Issue: No data in Firestore columns

**Check these**:
1. Backend terminal - any errors during upload?
2. Network tab in browser - is POST to `/api/sessions/upload` returning 200?
3. Response body - does it show `"status": "processed"`?
4. Firebase rules - are they deployed and allow write?

**Debug commands**:
```bash
# Check what's in Firestore via API
curl http://localhost:8000/api/sessions | jq

# Check specific session
curl http://localhost:8000/api/sessions/skillcaptain-cursor-ai-masterc-2026-02-07 | jq
```

### Issue: Names still showing "nan"

**Verify parser fix**:
```bash
cd apps/api
source venv/bin/activate
python -c "
from services.parser import AttendanceParser
with open('../SkillCaptain...xlsx', 'rb') as f:
    attendees = AttendanceParser.parse_file(f.read(), 'test.xlsx')
    print(attendees[0]['name'])
"
```

Should print clean name like "Kesavardhini" not "Kesavardhini nan"

### Issue: Upload fails

**Check**:
1. File format - must have columns: First name, Email, Duration, Time joined, Time exited
2. Backend logs for parsing errors
3. Firebase credentials in `apps/api/.env`

### Issue: Frontend can't connect to backend

**Verify**:
1. Backend is running on port 8000
2. `apps/web/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. CORS is configured (already done in main.py)

## Expected Behavior

**Upload** → 3 seconds → Green checkmark → Session appears in dropdown
**Select** → Instant → Analytics load below
**Delete** → Confirm → Session removed from dropdown and Firestore
**Multi-select** → Instant → Comparison view loads

## Success Indicators

- ✓ Backend shows 200 OK responses in terminal
- ✓ Frontend console has no errors
- ✓ Firestore document has all fields populated
- ✓ Charts render with data
- ✓ Attendee table shows all names cleanly
- ✓ Session name displays correctly in dropdown and header

If all checks pass, your system is working perfectly!
