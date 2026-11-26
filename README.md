# CampusFix — Tefi AI prototype

This is the first static frontend milestone for the CampusFix hackathon project.

## Files
- `index.html` — page structure
- `styles.css` — responsive design
- `app.js` — interactive prototype

## Run it
Open `index.html` in a browser, or enable GitHub Pages:
1. Open repository Settings.
2. Select Pages.
3. Under Build and deployment, choose Deploy from a branch.
4. Select `main` and `/ (root)`, then Save.

## Important prototype limitations
- The current Tefi inspection is a transparent local demo ruleset, not a live Gemini AI agent.
- Reports are stored in the current browser's localStorage only.
- The Admin view is a demo and is NOT protected by authentication.
- Do not enter real student personal or sensitive information.
- Do not use this prototype for actual campus operations.

## Next milestone
Connect a server-side API (Vercel Functions or another backend), Gemini API using a current supported model, and Firestore. Keep all API keys on the server. Validate every AI response before taking action. Escalate potential emergencies and never permanently discard uncertain reports.
