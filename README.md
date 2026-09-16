# FlashcardMe

FlashcardMe is a local-first flashcard and spaced-repetition application for desktop and mobile browsers. It supports English vocabulary study, ISC2 Certified in Cybersecurity preparation, custom decks, audio playback, mobile swipe review, and offline-friendly PWA installation.

## What It Provides

- Separate General English and personal/certification study modes.
- Create, edit, delete, favorite, search, and filter cards.
- Create deck names while editing cards and rename decks from the Library.
- Review with Hard, Good, and Easy spaced-repetition ratings.
- Swipe left/right after revealing a card on touch devices.
- Keyboard study controls: `Space` reveals, `1` rates Hard, `2` rates Good, `3` rates Easy, and `Escape` leaves Study.
- Resume unfinished study sessions from LocalStorage.
- Daily goals, streaks, accuracy, difficult-card insights, and deck/domain progress summaries.
- JSON and CSV export/import with validation, mojibake repair, duplicate detection, and a per-card import decision preview.
- Safety backups before import and reset operations.
- Browser speech synthesis for vocabulary pronunciation.
- PWA installation support where the browser provides it.

The repository also includes `data/isc2-cc-study-vocabulary.json`, a focused 55-card ISC2 CC vocabulary deck covering risk, governance, physical security, incident response, and security operations terminology. Import this file from the Backup screen and select the `ISC2 CC Study Vocabulary` deck in the Library.

## Privacy and Storage

This application is intentionally local-first. It does not require an account and does not include Google/GitHub login, cloud sync, Supabase, or a remote database.

Cards, study statistics, unfinished sessions, and safety backups are stored in the browser's LocalStorage for this origin. LocalStorage is scoped to a browser, device, and origin. To move data to another device, export a JSON or CSV backup and import it there.

Keep private backup files outside this repository. Never place personal exports in `public/` or commit them to Git.

## Import Rules

Before import, FlashcardMe validates the root array, required fields, dates, intervals, text limits, categories, and duplicate IDs/vocabulary. Existing IDs default to **Update**, duplicate vocabulary defaults to **Skip**, and new cards default to **Add**. Every imported card can be changed to Add, Update, or Skip in the preview before confirmation.

The starter dataset can be checked or repaired with:

```bash
npm run validate:flashcards
npm run fix:flashcards
```

`fix:flashcards` repairs known UTF-8 mojibake in the default dataset and then validates it.

## Development

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

## Verification Commands

Run the checks used before a release or push:

```bash
npm run typecheck
npm run lint
npm test
npm run validate:flashcards
npm run build
```

`lint` currently runs the TypeScript compiler because the project uses Next.js 16, where the removed `next lint` command is no longer available.

## Production

```bash
npm run build
npm run start
```

The application can be deployed to a standard Next.js host such as Vercel. The app itself remains local-first after deployment because user data is stored in each browser.

## Technology

- Next.js App Router 16
- React and TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Web Speech API
- LocalStorage and Service Worker APIs
