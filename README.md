# TimeShift — Deployment Guide
**Version:** v5.6 · June 2026

---

## Files to Upload to GitHub

| File | Purpose |
|------|---------|
| `index.html` | The entire application |
| `manifest.json` | PWA metadata — name, icons, theme colour |
| `sw.js` | Service worker — caching and PWA install |
| `icon-192.png` | Android home screen icon |
| `icon-512.png` | Android splash screen icon |
| `apple-touch-icon.png` | iOS home screen icon (180×180) |

> **Logo:** Replace the three PNG files with your real logo when ready — same filenames, nothing else changes.

---

## Part 1 — GitHub Pages Setup

### Step 1 — Create a repository
1. Go to [github.com](https://github.com) and sign in
2. Click **+** → **New repository**
3. Name it (e.g. `TimeShift`), set to **Public**
4. Click **Create repository**

### Step 2 — Upload files
**Via GitHub website (easiest):**
1. On the repo page click **uploading an existing file**
2. Drag and drop all 6 files
3. Click **Commit changes**

**Via Git on your computer:**
```bash
git init
git add .
git commit -m "Deploy TimeShift v5.6"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TimeShift.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to repo → **Settings** → **Pages**
2. Under **Source** select **Deploy from a branch**
3. Set branch to `main`, folder to `/ (root)`
4. Click **Save**
5. Live at: `https://YOUR_USERNAME.github.io/TimeShift/` within ~60 seconds

### Step 4 — Install on mobile
- **Android (Chrome):** tap ⋮ → Add to Home Screen → Install
- **iOS (Safari only):** tap Share (□↑) → Add to Home Screen → Add

---

## Part 2 — Firebase Setup

### Step 1 — Create a Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Name it (e.g. `timeshift`) — disable Google Analytics if prompted
4. Click **Create project**

### Step 2 — Create a Firestore database
1. From the project overview tap the **☰ hamburger menu** (top left)
2. Find and tap **Firestore Database** → tap **Create database**

**Step 1 of 3 — Select edition**
- Leave **Standard edition** selected → tap **Next**

**Step 2 of 3 — Database ID and location**
- Leave **Database ID** as `(default)`
- Change **Location** to `eur3 (Europe)` for UK-based storage
- Tap **Next**

**Step 3 of 3 — Configure**
- Select **Start in test mode** → tap **Create**

### Step 3 — Update Firestore security rules
Replace test mode rules immediately with permanent rules:

1. Firebase Console → **Firestore Database** → **Rules** tab
2. Replace all content with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
    match /entries/{entryId} {
      allow read, write: if true;
    }
    match /audit/{auditId} {
      allow read, write: if true;
    }
    match /freezePeriods/{fpId} {
      allow read, write: if true;
    }
    match /settings/{settingId} {
      allow read, write: if true;
    }
  }
}
```

3. Tap **Publish**

> These rules keep the database open to anyone with the Firebase config keys — acceptable for an internal PIN-protected app.

### Step 4 — Add your first Admin user
The database starts empty. Create the first admin directly in Firestore:

1. Firebase Console → **Firestore Database** → **Data** tab
2. Tap **+ Start collection**
3. **Collection ID:** `users` → tap **Next**
4. **Document ID:** tap **Auto-ID**
5. Add these fields using **+ Add field**:

| Field | Type | Value |
|-------|------|-------|
| id | string | (copy the auto-generated Document ID exactly) |
| name | string | Your full name |
| pin | string | `0000` (change after first login) |
| role | string | `admin` |
| active | boolean | `true` |
| initials | string | Your initials e.g. `MG` |
| color | string | `#7C5CBF` |
| phone | string | Your phone number |
| email | string | Your email address |
| address | string | Your address |
| postcode | string | Your postcode |

6. Tap **Save**
7. Open TimeShift — it will connect automatically and show the PIN screen
8. Log in with PIN `0000`, go to **Profile** and change your PIN immediately
9. Go to **Config → Users** to add remaining staff

> **Important:** The `id` field value must be an exact copy of the Document ID shown at the top of the document panel. If they don't match, login will fail.

### Step 5 — Update Firebase credentials in the app (if using a different project)
The app has the timeshift-94a91 project credentials hardcoded and will work without any configuration. If you need to connect to a **different** Firebase project:

1. Open TimeShift → **Config** → **Firebase Connection**
2. Enter your **API Key**, **Project ID**, and **App ID** in the Override section
3. Tap **Save Override**

These override values survive app updates but not browser data clears. The hardcoded defaults are always the fallback.

---

## Part 3 — Data Import (Chan's historical entries)

A one-time import tool is available at `fix_chan_entries.html`. Open it directly in a browser (does not need to be uploaded to GitHub), fill in the Firebase credentials and Chan's Firestore user document ID, then tap **Fix All Entries**.

This imports 68 entries dated January–May 2026 with exact shift times from the original spreadsheet.

---

## Features at v5.6

### All Users
- Log shifts (up to 3 per day, 5-minute rounding, overnight support)
- View and edit own entries by month
- Reports: week → day totals, month → week totals, year → month totals
- Drill down through any level for detail
- View & Export Report — on-screen preview then Print/Save as PDF
- Earnings shown where hourly rates are set
- **Profile screen:** edit own contact info, change PIN, manage own hourly rates

### Admin Only
- Staff Hours report with checkbox selection, drill-down per user, PDF export
- Config hub: Users, Year End & Freeze, Backup & Restore, Audit Trail, Firebase Connection
- Add/edit/deactivate users, reset PINs
- Set hourly rates for any user
- Financial year-end freeze — locks earnings calculations with snapshot
- Full audit trail with PDF export and clear to date
- Backup and restore to/from JSON file

### Hourly Rates
- Up to 3 current/past rates + 1 future rate per user
- Dates are inclusive — adjacent rates must start the day after the previous ends
- Overlap blocked; gap warned but allowed
- Future rates shown with FUTURE badge
- Auto end date: start date + 2 years

### PDF Export
- All filenames timestamped to prevent overwrites
- Android/desktop: print overlay + browser Print/Save as PDF
- iOS: jsPDF direct export (browser print not supported on iOS)

---

## Updating the App
Upload changed `index.html` and `sw.js` to GitHub and commit. Pages redeploys within seconds. The service worker cache busts automatically when the version number changes.

---

## Troubleshooting

**App stuck on "Starting…" or "Connecting…"**
- Check your internet connection
- Wait for the 20-second timeout then tap **Try Again**
- If it consistently fails, check Firebase Console to confirm the project is active

**Entries or users missing after browser data clear**
- This is normal — the app reloads everything from Firebase on startup
- Firebase credentials are hardcoded so no re-entry needed
- Data in Firebase is unaffected by browser data clears

**PDF export does nothing on iPhone**
- This is expected — iOS Safari does not support `window.print()`
- The app automatically uses jsPDF on iOS — a PDF file will download directly

**"Invalid PIN" on login after restore**
- The restored PIN may differ from what you remember
- Use Config → Users → Reset PIN to set a new one

---

## Version History

| Version | Notes |
|---------|-------|
| v1.0 | Initial release — Supabase backend |
| v1.1 | Migrated to Firebase Firestore, renamed ShiftLog → TimeShift |
| v2.x | Audit trail, backup/restore, admin reports, 5-minute rounding |
| v3.x | Hardcoded Firebase credentials, Road Eagles startup sequence, FAB navigation |
| v4.x | Hourly rates, earnings reports, year-end freeze, Firebase compat SDK |
| v5.0 | Report grouping (year→month→week→day), on-screen preview before PDF |
| v5.1 | PDF timestamps, freeze reminder snooze |
| v5.2–v5.3 | Report overlay fixes, navigation stack for back button |
| v5.4 | Rate gap warning, iOS PDF fallback |
| v5.5 | Fixed missing entries (inline script parser bug) |
| v5.6 | Profile screen — all users can edit contact info, PIN and own rates |
