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

### 2. Set up Google OAuth and enable APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project
2. Go to **APIs & Services → Library** and enable:
   - **Google Tasks API**
3. Go to **APIs & Services → Credentials → Create credentials → OAuth 2.0 Client ID**
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. Go to **APIs & Services → OAuth consent screen**
   - If the app is in Testing mode, add your Google account under **Test users**

### 3. Set up Firebase Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Go to **Build → Firestore Database → Create database**
   - Choose **Native mode** (not Datastore mode — Datastore mode will not work)
   - Choose a region, e.g. `europe-west1`
3. Go to **Project Settings** and note your **Project ID**

### 4. Set up local Google credentials

The app uses Application Default Credentials to authenticate with Firestore server-side.

```bash
gcloud auth login
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_FIREBASE_PROJECT_ID
```

> **Important:** If you use Google Cloud for other projects, you may have a `GOOGLE_APPLICATION_CREDENTIALS` environment variable set in your shell that points to a different service account. This will override Application Default Credentials and cause authentication errors. Unset it before running the app:
>
> ```bash
> unset GOOGLE_APPLICATION_CREDENTIALS
> ```
>
> You may want to add this to a local `.env` or shell alias for the project.

### 5. Set up IAM permissions

Your Google account needs permission to access Firestore. Go to [Google Cloud Console → IAM](https://console.cloud.google.com/iam-admin/iam), select your Firebase project, and ensure your account has the role:

- **Cloud Datastore User** (`roles/datastore.user`)

### 6. Configure environment

```bash
cp .env.example .env.local
```

Fill in the following values in `.env.local`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...   # your Firebase project ID

# Optional locally, required in production:
# NEXTAUTH_SECRET=...                 # generate with: openssl rand -base64 32
```

### 7. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

> **Note:** After signing in for the first time, sign out and sign back in if you encounter Tasks API errors. This ensures the session token includes the correct OAuth scopes.

## Known setup gotchas

**Firestore index required**
The first time you load the Templates page, Firestore may return an error saying a composite index is required. The error message contains a direct link to create the index in Firebase Console — click it and wait ~1 minute for the index to build.

**Wrong Google Cloud project**
If `gcloud config get-value project` shows a different project than your Firebase project, explicitly set the project ID in `.env.local` via `NEXT_PUBLIC_FIREBASE_PROJECT_ID`. The app uses this to connect to the correct Firestore database regardless of your local gcloud config.

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
