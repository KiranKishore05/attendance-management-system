# Attendance Management System

A simple, beginner-friendly **Automated Attendance Management System** built for a
final-year college project.

**Tech stack:** React + Vite + Tailwind CSS (frontend) · Supabase (PostgreSQL database + API).

No QR codes, no face recognition, no AI, no login — just clean CRUD and reports.

## Features

- **Dashboard** — Total students, present today, absent today, marked today.
- **Students** — Add, view, edit, delete, and search students (by name or roll number).
- **Attendance** — Mark Present/Absent per student, "All Present / All Absent" shortcuts,
  and save with the selected date.
- **Reports** — Daily attendance report, full attendance history, search, and CSV export.

## Project structure

```
.
├── index.html
├── vite.config.js
├── src
│   ├── main.jsx            # App entry + router
│   ├── App.jsx             # Routes + Toast provider
│   ├── index.css           # Tailwind v4 + theme tokens
│   ├── lib
│   │   ├── supabase.js     # Supabase client
│   │   └── api.js          # All CRUD / query helpers
│   ├── components
│   │   ├── Layout.jsx      # Sidebar navigation shell
│   │   ├── Toast.jsx       # Success/error notifications
│   │   └── ui.jsx          # Spinner, Modal, Badge, ConfirmDialog, EmptyState
│   └── pages
│       ├── Dashboard.jsx
│       ├── Students.jsx
│       ├── Attendance.jsx
│       └── Reports.jsx
└── supabase
    └── schema.sql          # Database schema (reference)
```

## Connecting Supabase

The Supabase integration is already connected in v0, so these environment variables
are provided automatically:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`vite.config.js` is configured to expose the `NEXT_PUBLIC_` prefix to the client.

### Running locally (outside v0)

1. Create a `.env` file in the project root:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Run the SQL in `supabase/schema.sql` in the Supabase **SQL Editor** to create the tables.

3. Install and start:

   ```bash
   pnpm install
   pnpm dev
   ```

## Database schema

Two tables: `students` and `attendance`. See `supabase/schema.sql` for the full DDL.
Row Level Security is enabled with permissive policies because this demo app has no
authentication.
