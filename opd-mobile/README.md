# OPD Kiosk — Patient Self Check-in

A touch-friendly kiosk app that lets patients check in for the OPD (Outpatient
Department) on their own — pick a language, log in, tell the assistant their
symptoms, scan documents, and get a token. Built to feel simple for first-time
users, with voice guidance and support for multiple Indian languages.

## Features

- **Multi-language** — English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, and Urdu.
- **Voice guidance** — screens can be read aloud for users who prefer listening.
- **Accessibility** — large-text mode and big, tappable buttons.
- **Guided flow** — one clear step at a time, from welcome to done.
- **Session privacy** — patient data is kept only for the current session and cleared automatically.

## How it works (the flow)

1. **Idle** — welcome screen, tap to begin.
2. **Language** — choose your preferred language.
3. **Login** — sign in with ABHA ID / Aadhaar, or register as a new patient.
4. **Home** — pick what you want to do.
5. **Assistant** — describe your symptoms (type or speak).
6. **Scan Docs** — add any documents you're carrying.
7. **Review** — check everything before submitting.
8. **Done** — confirmation and your details.

There's also a **History** screen to look back at past visits.

## Tech stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/) — dev server and build tool
- [React Router](https://reactrouter.com/) — screen navigation
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [lucide-react](https://lucide.dev/) — icons

## Getting started

You'll need [Node.js](https://nodejs.org/) (version 18 or newer) installed.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open the URL Vite prints in your terminal (usually http://localhost:5173).

## Available scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the local development server            |
| `npm run build`   | Build the app for production into `dist/`     |
| `npm run preview` | Preview the production build locally          |

## Project structure

```
opd-mobile/
├─ index.html            # App entry HTML
├─ src/
│  ├─ main.jsx           # React entry point
│  ├─ App.jsx            # Routes / screen map
│  ├─ screens/           # Each step of the flow (Idle, Login, Home, ...)
│  ├─ components/        # Reusable UI (Layout, Sheet, ProgressBar, ...)
│  ├─ store/             # Session state (language, patient, symptoms, docs)
│  ├─ data/i18n.js       # Languages and translated text
│  ├─ utils/             # Helpers (e.g. text-to-speech)
│  └─ index.css          # Global styles
├─ tailwind.config.js
└─ vite.config.js
```

## Notes

This is a front-end prototype — screens and flow are fully interactive, but it
doesn't yet connect to a real hospital backend. Session data lives only in the
browser and is cleared when the session ends.
