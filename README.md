# ShiftLog — Deployment Guide

## Files to upload to GitHub

| File | Purpose |
|------|---------|
| `index.html` | The entire application |
| `manifest.json` | PWA metadata — name, icons, theme colour |
| `sw.js` | Service worker — PWA install only, online-only app |
| `icon-192.png` | Android home screen / app icon |
| `icon-512.png` | Android splash screen icon |
| `apple-touch-icon.png` | iOS home screen icon (180×180) |

> **Note:** ShiftLog requires an active internet connection. If the device goes offline, a full-screen blocker is shown and the app is unusable until connectivity is restored.

> **Logo:** When you have your real logo, replace the three PNG files with the same filenames and push — nothing else needs to change.

---

## GitHub Pages — First Time Setup

### Step 1 — Create a repository
1. Go to [github.com](https://github.com) and sign in
2. Click **+** (top right) → **New repository**
3. Name it (e.g. `shiftlog`), set to **Public**
4. Leave all other options as default and click **Create repository**

### Step 2 — Upload the files
**Option A — via the GitHub website (easiest):**
1. On your new repo page, click **uploading an existing file**
2. Drag and drop all 6 files into the upload area
3. Scroll down and click **Commit changes**

**Option B — via Git on your computer:**
```bash
git init
git add .
git commit -m "Initial ShiftLog deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shiftlog.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. In your repo, go to **Settings** (top tab)
2. Scroll down to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Set branch to `main`, folder to `/ (root)`
5. Click **Save**
6. Wait about 60 seconds, then your app is live at:
   `https://YOUR_USERNAME.github.io/shiftlog/`

> GitHub will show a blue banner with your live URL once it's ready. You can also check the **Actions** tab to see the deploy progress.

### Step 4 — Test the install
- **Android:** Open the URL in Chrome → tap ⋮ menu → **Add to Home screen** → **Install**
- **iOS:** Open the URL in Safari → tap Share (□↑) → **Add to Home Screen** → **Add**

---

## Updating the App
When new versions are provided, just upload the changed files to the repo and commit. GitHub Pages redeploys automatically within seconds. Users will get the update on their next visit.

---

## Custom Domain (Optional)
1. In Settings → Pages → **Custom domain**, enter your domain (e.g. `shiftlog.yourdomain.com`)
2. Add a `CNAME` DNS record at your domain registrar pointing to `YOUR_USERNAME.github.io`
3. Tick **Enforce HTTPS** once the domain validates

---

## Supabase Setup (when ready to go live)

### 1. Create a project at [supabase.com](https://supabase.com)

### 2. Run this SQL in the Supabase SQL editor:

```sql
-- USERS TABLE
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin text not null,
  role text not null default 'user',
  phone text,
  email text,
  address text,
  city text,
  postcode text,
  color text default '#FF6B8A',
  initials text,
  hourly_rate decimal(10,2),
  active boolean default true,
  created_at timestamptz default now()
);

-- ENTRIES TABLE
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  date date not null,
  shifts jsonb not null default '[]',
  total_mins integer not null,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table users enable row level security;
alter table entries enable row level security;

create policy "Users see own entries" on entries
  for select using (user_id = auth.uid());

create policy "Users insert own entries" on entries
  for insert with check (user_id = auth.uid());

create policy "Users update own entries" on entries
  for update using (user_id = auth.uid());

create policy "Users delete own entries" on entries
  for delete using (user_id = auth.uid());

create policy "Admins manage all entries" on entries
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
```

### 3. Update index.html (top of the script section):
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-public-key';
const DEMO_MODE = false;
```
Then commit and push the updated `index.html`.

---

## Demo Credentials
| User | PIN | Role |
|------|-----|------|
| Admin User | 0000 | Admin |
| Sarah Johnson | 1234 | Staff |
| Emma Clarke | 5678 | Staff |

---

## Replacing the Logo
1. Provide your logo image
2. Replacement PNG files will be generated at the correct sizes
3. Replace `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` in the repo
4. Commit and push — done, no other files need changing

---

## Future: Hourly Rate / Payroll
The `hourly_rate` column is already in the schema and hidden in the UI. When ready to activate:
- Unhide the rate field in the user edit form
- Add a pay column to reports using `total_mins / 60 * hourly_rate`
- No schema changes needed

---

## Version History
| Version | Date | Notes |
|---------|------|-------|
| v1.0 | May 2026 | Initial release |

### v1.0 Features
- PIN login with change-PIN and admin reset
- Up to 3 shifts per day, overnight shifts, 15-minute rounding per shift
- Dashboard: today / last day worked / week / month / year totals
- Log screen with live duration preview
- Entries screen — browse by month, edit or delete any entry
- Reports — week, month, year with PDF export
- Admin: user management with UK address format
- Admin: consolidated reports by user or all staff with PDF export
- Traffic light connectivity indicator
- Refresh and exit buttons
- Back arrow navigation
- Online-only — full offline blocker
- PWA installable on Android and iOS
