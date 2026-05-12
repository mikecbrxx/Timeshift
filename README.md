# ShiftLog — Deployment Guide

## Files to upload to GitHub

| File | Purpose |
|------|---------|
| `index.html` | The entire application |
| `manifest.json` | PWA metadata — name, icons, theme colour |
| `sw.js` | Service worker — offline caching |
| `icon-192.png` | Android home screen / app icon |
| `icon-512.png` | Android splash screen icon |
| `apple-touch-icon.png` | iOS home screen icon (180×180) |

> When you have your real logo, replace the three PNG files with the same filenames and nothing else needs to change.

---

## GitHub Pages Deployment

### First time setup

1. Create a new repository on github.com (name it anything, e.g. `shiftlog`)
2. Upload all 6 files above to the `main` branch — either via the GitHub web interface (drag and drop) or:
```bash
git init
git add .
git commit -m "Initial ShiftLog deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shiftlog.git
git push -u origin main
```
3. Go to your repo → **Settings → Pages**
4. Under **Source**, select `Deploy from a branch`
5. Set branch to `main`, folder to `/ (root)`
6. Click **Save**
7. Your app will be live at `https://YOUR_USERNAME.github.io/shiftlog/` within a minute or two

### Updating the app
Just push updated files to `main` — GitHub Pages redeploys automatically within seconds.

### Custom domain (optional)
In Settings → Pages → Custom domain, enter your domain and add a CNAME record pointing to `YOUR_USERNAME.github.io`.

---

## Installing on Mobile

### Android (Chrome)
1. Open the URL in Chrome
2. Tap the menu (⋮) → **Add to Home screen**
3. Tap **Install**

### iOS (Safari — must use Safari, not Chrome)
1. Open the URL in Safari
2. Tap the **Share** button (□↑)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

---

## Supabase Setup (when ready to go live)

### 1. Create a project at supabase.com

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

### 3. Update index.html (top of script section):
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-public-key';
const DEMO_MODE = false;
```

---

## Demo Credentials
| User | PIN |
|------|-----|
| Admin | 0000 |
| Sarah Johnson | 1234 |
| Emma Clarke | 5678 |

---

## Replacing the Logo
When your real logo is ready:
1. Provide the logo image
2. New PNG files will be generated at the correct sizes: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
3. Replace the three files in the repo — push to main — done

---

## Future: Hourly Rate / Payroll
The `hourly_rate` column is already in the schema, hidden in the UI. When ready:
- Unhide the rate field in the user edit form
- Add a pay column to reports using `total_mins / 60 * hourly_rate`
- No schema changes needed

---

## Version
v1.0 — May 2026
