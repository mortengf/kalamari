# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint checks
```

No test framework is configured.

## Architecture

**Kalamari** is a Next.js 14 (Pages Router) app for managing reusable Google Calendar event templates. Users define templates composed of multiple `TemplatePart` entries (each with a time offset), then instantiate a template against an anchor date to create a batch of Google Calendar events in one click.

### Tech Stack
- **Framework:** Next.js 14 / React 18 / TypeScript
- **Auth:** NextAuth.js with Google OAuth (offline access for refresh tokens)
- **Database:** Firestore via Firebase Admin SDK (collections: `templates`, `eventGroups`)
- **Calendar:** Google Calendar API v3 via `googleapis`
- **Styling:** Tailwind CSS + `@tailwindcss/forms`
- **Date math:** `dayjs`

### Key Data Model

```typescript
// src/types/index.ts
TemplatePart { id, title, offsetMinutes, durationMinutes, description? }
Template      { id, userId, name, color, defaultCalendarId?, parts[], createdAt, updatedAt }
EventGroup    { id, userId, templateId, anchorDate, calendarId, eventIds[], createdAt }
```

`userId` is the user's Google email address throughout.

### Request Flow

1. User authenticates via Google OAuth → NextAuth stores access + refresh tokens in JWT session
2. Client pages call `/api/*` routes, which read the session server-side via `getServerSession`
3. Template CRUD hits Firestore; event creation calls Google Calendar API using the session's access token
4. Created event IDs are persisted in an `EventGroup` document

### Directory Layout

```
src/
  lib/
    auth.ts             # NextAuth config (Google provider, JWT callbacks, token refresh)
    firestore.ts        # Firebase Admin SDK init
    googleCalendar.ts   # Google Calendar API helpers
  types/
    index.ts            # Domain types
    next-auth.d.ts      # Session/JWT type extensions
  pages/
    _app.tsx            # SessionProvider wrapper
    index.tsx           # Home / auth entry point
    schedule.tsx        # Pick template + anchor date → create events
    templates/
      index.tsx         # List/manage templates
      new.tsx           # Create/edit template form
    api/
      auth/[...nextauth].ts
      templates/index.ts, [id].ts
      event-groups/index.ts
      calendars.ts
  components/
    Layout.tsx          # Nav + auth gate (redirects unauthenticated users)
```

### Environment Variables

See `.env.example`. Required locally:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
- `NEXTAUTH_URL` — `http://localhost:3000` in dev
- `NEXTAUTH_SECRET` — required; generate with `openssl rand -base64 32`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — used server-side by Admin SDK

Authentication uses Application Default Credentials server-side (`gcloud auth application-default login`). No `FIREBASE_ADMIN_CREDENTIALS` env var is needed.

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).
