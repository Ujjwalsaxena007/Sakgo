# SAKGO — AI Travel Planner (Frontend Starter)

A responsive frontend prototype built with plain HTML, CSS and JavaScript for VS Code.

## Run locally
1. Extract this folder.
2. Open it in VS Code.
3. Open `index.html` in your browser, or use the **Live Server** extension.
4. Internet is needed for the Google Fonts and remote Unsplash demo images. The core UI and local demo itinerary logic are local.

## Included
- Responsive landing page and travel inspiration cards
- Trip builder with destination, duration, budget and travel-style inputs
- Starter itinerary generation (rule-based demo, not a live AI model)
- Save, reopen, remove and copy trips using browser `localStorage`
- English/Hindi UI toggle
- Sign-in modal UI preview
- Mobile navigation

## Important before production
- The current itinerary generator is a local demo. For genuinely AI-generated itineraries, create a backend endpoint and call an AI API from the server. **Do not put API keys in `script.js` or browser code.**
- The sign-in form is a UI preview only; it does not authenticate users. Add secure authentication, server-side sessions, validation and account recovery before launch.
- Saved trips are stored only in the current browser on this device; they are not synced to an account.
- Destination ideas, costs and activities are illustrative. Verify live prices, routes, opening hours, weather, access and safety before travel.
- Replace remote demo photography with licensed assets for production and add appropriate attribution where required.

## Suggested next development steps
1. Build a backend/API for AI itinerary generation.
2. Add secure sign-up/sign-in and user profiles.
3. Add live map, route and weather integrations.
4. Add saved-trip sync, date picker, collaborators and export to PDF.
5. Run accessibility, browser and mobile tests before public launch.
