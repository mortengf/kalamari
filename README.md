# 🦑 Kalamari – Tasks variant

> **Branch: `feature/tasks`**
> This branch uses **Google Tasks** instead of Google Calendar events.
> For the Calendar events version, see the [`main`](https://github.com/mortengf/kalamari/tree/main) branch.

Task template manager. Create reusable multi-part task templates and instantly populate your Google Tasks.

## Concept

Many real-world appointments consist of several related tasks, e.g.:

- **Squash / haircut**: "Book!", "The appointment", "Book next"
- **Tickets**: "Buy", "Print", "The event"
- **Birthdays**: "Buy gift", "Send message", "The day"
- **Travel**: "Check in online", "Departure", "Return"
- **Meetings**: "Read material", "The meeting", "Write follow-up"

Kalamari lets you define these as reusable templates and create all related tasks in one click, each with a due date calculated relative to an anchor date.

## Tech Stack

- [Next.js 14](https://nextjs.org/) (Pages Router)
- [NextAuth.js](https://next-auth.js.org/) with Google OAuth
- [Google Tasks API](https://developers.google.com/tasks)
- [Firebase Firestore](https://firebase.google.com/docs/firestore) (template + task group storage)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/mortengf/kalamari.git
cd kalamari
git checkout feature/tasks
npm install
```

### 2. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the **Google Tasks API**
4. Create **OAuth 2.0 credentials** (Web application)
5. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI

### 3. Set up Firebase

1. Create a project in [Firebase Console](https://console.firebase.google.com/)
2. Enable **Firestore** in Native mode
3. Authenticate locally via Google Cloud CLI:

```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
```

### 4. Configure environment

```bash
cp .env.example .env.local
# Fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXT_PUBLIC_FIREBASE_PROJECT_ID
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How tasks work

Each template part gets a **due date** calculated by adding its `offsetMinutes` to the anchor date. Since Google Tasks only support due dates (not times), the time component is ignored — only the date matters.

Example with anchor date 2026-03-15:
- Part with `offsetMinutes: -4320` (−3 days) → due 2026-03-12
- Part with `offsetMinutes: 0` (anchor) → due 2026-03-15
- Part with `offsetMinutes: 1440` (+1 day) → due 2026-03-16

## Data Model

### `templates` collection

```ts
{
  id: string
  userId: string          // Google email
  name: string
  color: string           // hex
  parts: [
    {
      id: string
      title: string
      offsetMinutes: number  // relative to anchor date (negative = before)
      durationMinutes: number
      description?: string
    }
  ]
  createdAt: string
  updatedAt: string
}
```

### `eventGroups` collection

```ts
{
  id: string
  userId: string
  templateId: string
  templateName: string
  anchorDate: string      // ISO 8601
  calendarId: string      // Google Tasks task list ID
  eventIds: string[]      // Google Tasks task IDs
  createdAt: string
}
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/templates` | List user's templates |
| POST | `/api/templates` | Create template |
| GET | `/api/templates/:id` | Get template |
| PUT | `/api/templates/:id` | Update template |
| DELETE | `/api/templates/:id` | Delete template |
| GET | `/api/event-groups` | List task groups |
| POST | `/api/event-groups` | Instantiate template → create Tasks |
| GET | `/api/calendars` | List user's Google Task lists |
