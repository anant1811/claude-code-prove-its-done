# Flat Splitter

Small static app that splits shared flat expenses between flatmates.

- `public/` is the app (plain ES modules, no build step). `npm start` serves it at http://localhost:4173.
- `public/logic.js` holds pure functions; keep math there and cover it in `test/`.
- `npm test` runs the unit tests.
