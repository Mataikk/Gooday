# Gooday

A personal journal for iOS: write one note per day and rate your day out of 5 stars.

Built with [Expo](https://expo.dev) (SDK 57) and tested with **Expo Go** on iPhone. The app's UI is in French.

## Getting started (Windows)

Requirements: [Node.js LTS](https://nodejs.org) (≥ 20.19.4) and the **Expo Go** app on your iPhone.

```bash
npm install
npx expo start
```

Scan the QR code with the iPhone camera. Your PC and iPhone must be on the same Wi-Fi network; otherwise run `npx expo start --tunnel`.

Use PowerShell or the VS Code terminal: Git Bash doesn't render Expo's QR code and interactive menu properly.

## Features

- **Today**: 5-star rating + free text, saved automatically.
- **History**: days grouped by month, with the number of days written and the average rating.
- **Day detail**: read, edit or delete a past day.

## Project structure

```
src/
  app/                 Screens (Expo Router: one file = one screen)
    _layout.tsx        Database provider + navigation
    (tabs)/index.tsx   "Today" tab
    (tabs)/history.tsx "History" tab
    day/[date].tsx     Past day detail
  components/          Day editor, star rating, themed text/views
  db/entries.ts        SQLite database (`entries` table, one row per day)
  hooks/               Entry loading + autosave, today's date
  utils/dates.ts       'YYYY-MM-DD' date keys and French date formatting
```

## Conventions

- Code, comments, commit messages and docs are in **English**.
- Everything the user sees in the app is in **French**.
- The app must keep working in **Expo Go** (no custom native code for now).

## Useful commands

```bash
npx expo install <package>  # add a dependency compatible with the SDK
npx tsc --noEmit            # type-check
npx expo lint               # lint
npx rimraf node_modules     # delete node_modules (handles Windows long paths)
```

> Notes written while testing in Expo Go live inside Expo Go's sandbox: treat them as test data.
