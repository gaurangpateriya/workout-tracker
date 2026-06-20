# Workout Tracker

A cross-platform workout log built with Expo and React Native. Create training plans, record sets as you train, review completed workouts, and explore progress over time.

## Features

- Create, edit, reorder, and delete workout plans and exercises.
- Start a workout from a plan and log weight, reps, set duration, and rest time.
- Keep completed workout history even when a plan is deleted.
- Track workout time, body weight, and exercise progress with charts.
- Automatically seed a catalog of common exercises on first launch.
- Use the app on Android, iOS, or the web, with light and dark themes.

## Tech stack

- [Expo](https://expo.dev/) SDK 54 and React Native
- Expo Router for file-based navigation
- Expo SQLite for on-device data storage
- Zustand for active-workout state
- React Native Gifted Charts for analytics
- TypeScript

## Prerequisites

- Node.js (LTS recommended)
- npm
- For native development: an Android emulator/device or an iOS simulator/device (macOS required for iOS simulator)
- Expo Go for running the app on a physical device, or the Android/iOS native toolchains for `run:android` / `run:ios`

## Getting started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm run start
```

From the Expo terminal, scan the QR code with Expo Go or press:

- `a` to open Android
- `i` to open iOS
- `w` to open the web app

To expose the development server through a tunnel:

```bash
npm run start:tunnel
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run start` | Start the Expo development server. |
| `npm run start:tunnel` | Start Expo with a tunnel for remote devices. |
| `npm run android` | Build and run the native Android app. |
| `npm run ios` | Build and run the native iOS app. |
| `npm run web` | Start the app in a web browser. |
| `npm run build:web` | Export a production-ready static web build. |
| `npm run verify` | Run project checks and TypeScript validation. |

## Project structure

```text
app/                 Expo Router screens and navigation layouts
src/analytics/       Analytics graph definitions, queries, and chart components
src/components/      Reusable workout and UI components
src/data/            Seed data, including the exercise catalog
src/db/              SQLite initialization, schema, migrations, and queries
src/stores/          Zustand state for the active workout
src/types/           Shared TypeScript types
assets/              App icons, splash assets, and fonts
public/              Progressive-web-app assets and web headers
scripts/             Verification scripts
```

## Data storage

Workout plans, sessions, exercises, and logged sets are stored locally in the `workout_tracker.db` SQLite database. The app initializes the schema and applies lightweight migrations when it starts. There is no backend service or account system in this repository.

## Web deployment

Create a static web export with:

```bash
npm run build:web
```

The repository includes `vercel.json` with a single-page-app rewrite, making it ready to deploy as a static Expo web application on Vercel.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
