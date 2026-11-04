# Fresh Teacher homepage import

Homepage `/` was captured using the website-importer skill. Original styles were retained because automatic Tailwind conversion could not safely preserve them.

## Verified
- Desktop 1280×1800 and phone 390×844: entrance door opens with original two-second motion; all sixteen book covers and four shelves render with local images.
- All four shelf landmarks were reached with wheel input; bottom and return-to-top screenshots are in `/tmp/browser/fresh-preview/`.
- Nested Nursery Section → Baby Class → Lesson Notes reveals the original `/BabyAllLessonNotes.html` link.
- TV, radio, games and contact panels open; Escape closes them. Header controls remain accessible when the sidebar is open, repairing the original obstruction.
- Chat opens, accepts input, closes and produces the original WhatsApp destination with encoded text. No message was submitted.
- No broken rendered image elements or browser page errors were observed. Latest automatic build succeeded; app-routing test passed.

## Partial import limitations
- Only the homepage was requested and imported. Class/resource pages, `/movie.html` and `/games` retain their original paths on the preview origin but their page contents are not imported.
- `/Fresh App.apk` retains its original local path. The source file is available, but the package has not been copied into this project; the download does not work locally yet.
- Capture saved 48 of 88 asset URLs. Forty failed during capture; every image rendered by the imported homepage currently loads. Other source font/stylesheet/media variants were not individually restored or verified.
- Door audio was restored from the source; audible playback was not verified in the headless browser. No video player is present on the homepage.
- Source greeting timing and marquee stopping position were not matched exactly. No canvas/video static fallback or pinned-panel normal-flow conversion was added.

Source DOM/control evidence is saved in `source.json`; preview checks are in `preview.json`; preserved URL mappings are in `link-map.json`.