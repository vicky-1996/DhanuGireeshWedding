# Editing The Invitation

The invitation is a self-contained static website. The main editable content is in `config.js`.

- Couple names, wedding date, time, venue, map URL, story text, family names, schedule, dress colors, WhatsApp/call details, gallery images, music, and blessings defaults are all editable there.
- Replace images in `assets/` and update the matching paths in `config.js`.
- Replace `assets/wedding-romantic.mp3` to change the background music.
- RSVP responses and blessings are saved in each visitor's browser through local storage. For a public shared guestbook, connect the form handlers in `app.js` to a backend or form service.
- Offline caching works when the site is served from a web server, including localhost, because service workers do not run from a plain `file://` URL.

To preview locally:

```powershell
cd C:\Users\anusr\Documents\Codex\2026-06-05\files-mentioned-by-the-user-leberch\outputs\dhanusree-girish-wedding
python -m http.server 5173
```

Then open `http://localhost:5173`.
