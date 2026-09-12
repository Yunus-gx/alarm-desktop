# Alarm Desktop

This repository contains a cross-platform desktop alarm app scaffold built with Tauri + React + Tailwind and Lottie animations.

What's included:
- React + Vite frontend with Tailwind CSS
- Lottie animation (placeholder) in the hero area
- Simple alarm scheduling UI (add/edit/delete, snooze, repeat)
- Local persistence using localStorage
- Notification and sound support in the browser runtime

Run locally (development):

1. Install dependencies

   npm install

2. Start the dev server

   npm run dev

3. Open http://localhost:5173

Troubleshooting white screen in dev:

1. Open browser DevTools Console and check the first runtime error.
2. In terminal, restart Vite with `npm run dev` and confirm no import/runtime errors are logged.
3. Verify `src/assets/hero-lottie.json` exists and `src/App.jsx` imports it from `./assets/hero-lottie.json`.
4. If alarms were previously saved with bad data, clear the app storage in DevTools and reload.

To build with Tauri (requires Tauri prerequisites):

   npm run tauri:build

Next steps I will take:
- Wire Tauri native notifications and tray/background behavior
- Add bundled ringtones and custom file selection
- Improve alarm scheduling accuracy and add OS-level startup/run behavior if requested
