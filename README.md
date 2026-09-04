# FlashcardMe

FlashcardMe is a client-side flashcard and spaced-repetition application for desktop and mobile browsers. It can also be installed as a Progressive Web App on supported devices.

## Features

- Create, edit, delete, and organise flashcards.
- Review cards using spaced-repetition intervals.
- Listen to vocabulary with the browser Web Speech API.
- Import and export complete decks as JSON backups.
- Install the application as a PWA on supported mobile browsers.
- Use the application without an account or a central database.

## Privacy Model

Flashcard data is stored in the browser's LocalStorage under `flashcardme_cards_v8`. The public application contains only a small set of general starter cards. Cards that users create or import remain in that user's browser and are not sent to the application server.

LocalStorage is scoped to a browser, device, and origin. To move a deck to another device, export it as JSON and import the backup there. Keep private backup files outside this repository and never place them in `public/`.

## Technology

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Web Speech API
- LocalStorage and Service Worker APIs

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser. Create a production build with:

```bash
npm run build
npm run start
```

## Deployment

Connect the repository to Vercel. Pushes to `main` trigger a production deployment when the Vercel Git integration is enabled.
