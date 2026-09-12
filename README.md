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

To build with Tauri (requires Tauri prerequisites):

   npm run tauri:build

Next steps I will take:
- Wire Tauri native notifications and tray/background behavior
- Add bundled ringtones and custom file selection
- Improve alarm scheduling accuracy and add OS-level startup/run behavior if requested

