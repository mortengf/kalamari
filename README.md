# 🦑 Kalamari

Calendar event template manager. Create reusable multi-part event templates and instantly populate your Google Calendar.

## Concept

Many real-world appointments consist of several related calendar events, e.g.:

- **Squash / haircut**: "Book!", "The appointment", "Book next"
- **Tickets**: "Buy", "Print", "The event"
- **Birthdays**: "Buy gift", "Send message", "The day"
- **Travel**: "Check in online", "Departure", "Return"
- **Meetings**: "Read material", "The meeting", "Write follow-up"

Kalamari lets you define these as reusable templates and create all related events in one click.

## Tech Stack

- [Next.js 14](https://nextjs.org/) (Pages Router)
- [NextAuth.js](https://next-auth.js.org/) with Google OAuth
- [Google Calendar API](https://developers.google.com/calendar)
- [Firebase Firestore](https://firebase.google.com/docs/firestore) (template + event group storage)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/mortengf/kalamari.git
cd kalamari
npm install
```

### 2. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the **Google Calendar API**
4. Create **OAuth 2.0 credentials** (Web application)
5. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI

### 3. Set up Firebase

1. Create a project in [Firebase Console](https://console.firebase.google.com/)
2. Enable **Firestore** in Native mode
3. Go to Project Settings → Service Accounts → Generate new private key
4. Base64-encode the JSON: `base64 -i serviceAccount.json`

### 4. Configure environment

```bash
cp .env.example .env.local
# Fill in all values
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Model

### `templates` collection

```ts
{
  id: string
  userId: string          // Google email
  name: string
  color: string           // hex
  defaultCalendarId?: string
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
  calendarId: string
  eventIds: string[]      // Google Calendar event IDs
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
| GET | `/api/event-groups` | List event groups |
| POST | `/api/event-groups` | Instantiate template → create Calendar events |
| GET | `/api/calendars` | List user's Google Calendars |
