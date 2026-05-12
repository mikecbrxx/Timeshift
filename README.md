# TimeShift — Deployment Guide

## Files to upload to GitHub

| File | Purpose |
|------|---------|
| `index.html` | The entire application |
| `manifest.json` | PWA metadata — name, icons, theme colour |
| `sw.js` | Service worker — PWA install, online-only |
| `icon-192.png` | Android home screen icon |
| `icon-512.png` | Android splash screen icon |
| `apple-touch-icon.png` | iOS home screen icon (180×180) |

> **Logo:** Replace the three PNG files with your real logo when ready — same filenames, nothing else changes.

---

## Part 1 — GitHub Pages Setup

### Step 1 — Create a repository
1. Go to [github.com](https://github.com) and sign in
2. Click **+** → **New repository**
3. Name it (e.g. `timeshift`), set to **Public**
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
git commit -m "Initial TimeShift deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/timeshift.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to repo → **Settings** → **Pages**
2. Under **Source** select **Deploy from a branch**
3. Set branch to `main`, folder to `/ (root)`
4. Click **Save**
5. Live at: `https://YOUR_USERNAME.github.io/timeshift/` within ~60 seconds

### Step 4 — Install on mobile
- **Android (Chrome):** tap ⋮ → Add to Home screen → Install
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
2. Find and tap **Firestore Database** — you'll see a **Cloud Firestore** page with a **Create database** button
3. Tap **Create database** — a 3-step wizard opens:

**Step 1 of 3 — Select edition**
- Leave **Standard edition** selected
- Tap **Next**

**Step 2 of 3 — Database ID and location**
- Leave **Database ID** as `(default)`
- Change **Location** from `nam5 (United States)` to `eur3 (Europe)` for UK-based storage
- Note: location cannot be changed later
- Tap **Next**

**Step 3 of 3 — Configure**
- Select **Start in test mode**
- You'll see the default rules and a warning that access is open for 30 days — that's fine, we update the rules in Step 5
- Tap **Create**

4. After a short wait you'll land on the **Database** screen showing:
   - Tabs across the top: **Data · Rules · Indexes · Disaster recovery**
   - A panel view with `(default)` and **+ Start collection**
   - This means the database is ready ✓

### Step 3 — Register a web app and get your config keys
1. Tap the **☰ menu** and tap the **project name** at the top to go back to the project overview
2. On the project overview page look for the icons row — tap the **Web icon** (`</>`)
3. Give the app a nickname (e.g. `TimeShift Web`) — no need to tick Firebase Hosting
4. Tap **Register app**
5. You'll see a `firebaseConfig` block like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "timeshift-xxxxx.firebaseapp.com",
  projectId: "timeshift-xxxxx",
  storageBucket: "timeshift-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

6. **Copy these three values** — you'll need them in Step 4:
   - `apiKey`
   - `projectId`
   - `appId`

7. Tap **Continue to console**

### Step 4 — Connect TimeShift to Firebase
1. Open TimeShift in your browser and log in as Admin (PIN: `0000` in demo mode)
2. Tap the **Config** tab in the bottom nav (gear icon)
3. Paste in your three values: **API Key**, **Project ID**, **App ID**
4. Tap **Connect to Firebase**
5. The app connects, loads live data, and shows a green **Live** badge ✓

### Step 5 — Update Firestore security rules
The test mode rules expire after 30 days. Replace them now with permanent open rules suitable for a PIN-protected internal app:

1. In Firebase Console → **Firestore Database** → tap the **Rules** tab
2. Replace the entire contents with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
    match /entries/{entryId} {
      allow read, write: if true;
    }
  }
}
```

3. Tap **Publish**

> This keeps the database open to anyone who has your Firebase config — acceptable for an internal PIN-protected app. Firebase Authentication can be added later for stronger security.

### Step 6 — Add your first Admin user
The database starts empty so you need to create the first admin directly in Firestore:

1. Firebase Console → **Firestore Database** → **Data** tab
2. Tap **+ Start collection**
3. **Collection ID:** `users` → tap **Next**
4. **Document ID:** tap **Auto-ID**
5. Add these fields one by one using **+ Add field**:

| Field | Type | Value |
|-------|------|-------|
| id | string | (copy the auto-generated Document ID) |
| name | string | Your full name |
| pin | string | `0000` |
| role | string | `admin` |
| active | boolean | `true` |
| initials | string | Your initials e.g. `MJ` |
| color | string | `#7C5CBF` |
| phone | string | Your phone number |
| email | string | Your email |
| address | string | Your address |
| city | string | Your city |
| postcode | string | Your postcode |
| hourly_rate | null | (leave as null) |

6. Tap **Save**
7. Log in to TimeShift with PIN `0000`, go to **Users** and add remaining staff from there

---

## Demo Credentials (before Firebase is connected)
| User | PIN | Role |
|------|-----|------|
| Admin User | 0000 | Admin |
| Sarah Johnson | 1234 | Staff |
| Emma Clarke | 5678 | Staff |

---

## Updating the App
Upload changed files to GitHub and commit — Pages redeploys in seconds.

---

## Future: Hourly Rate / Payroll
`hourly_rate` is already in the user schema (stored as `null`).
When ready: unhide the field in the user edit form and add a pay column
to reports using `total_mins / 60 * hourly_rate`. No database changes needed.

---

## Version History
| Version | Date | Notes |
|---------|------|-------|
| v1.0 | May 2026 | Initial release — Supabase |
| v1.1 | May 2026 | Migrated to Firebase Firestore, renamed to TimeShift |
