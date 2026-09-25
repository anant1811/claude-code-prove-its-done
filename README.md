# Prove It's Done

A Claude Code hook that won't let the agent say "done" until the app actually works in a browser.

Video: [Your AI Agent Is Lying When It Says "Done"](https://youtu.be/wRdAVLnn58w)

## Why

My agent told me all tests passed. The app showed ₹NaN for every balance. The tests used clean numbers; the real data had amounts like `"2,835.50"` stored as text. Nobody looked at the screen.

Telling the agent "please verify your work" doesn't fix this. It's a suggestion, and it gets skipped. A Stop hook can't be skipped.

## How it works

When Claude tries to finish, the hook runs your tests and then opens the app in headless Chrome (desktop and mobile). It fails if it finds JS errors, failed requests, `NaN`/`undefined`/`null` on screen, or a layout that overflows on a phone. If anything fails, the hook exits with code 2, which sends Claude back to work with the errors and screenshots. After 3 failed tries it gives up and lets you look.

Three files:

- `kit/verify/verify.mjs`: the browser check
- `kit/.claude/hooks/verify-before-done.sh`: the Stop hook
- `kit/.claude/settings.json`: registers the hook

## Install

You need Node 18+, bash, and a project with a `package.json`.

```bash
git clone https://github.com/anant1811/claude-code-prove-its-done.git
cd claude-code-prove-its-done
VERIFY_URL=http://localhost:5173 VERIFY_START="npm run dev" ./install-kit.sh ~/code/my-app
```

`VERIFY_URL` is the page to check. `VERIFY_START` is optional; if set, verify starts your app when it isn't already running.

Then restart Claude Code in your project and check `/hooks` shows a Stop hook. If you already have a `.claude/settings.json`, the installer won't touch it, so copy the `hooks` block in yourself.

## Try the demo

`example/` is the app from the video.

```bash
cd example
npm start
claude --model haiku
```

Ask it:

```
Add a 'Settle up' panel at the top that shows each person's balance: how much they owe or are owed. Put the math in logic.js and add tests. Make sure the tests pass.
```

Haiku gets this wrong about half the time and says it's done anyway. Then add the kit and ask it to finish again:

```bash
../install-kit.sh .
claude --continue --model haiku
```

## Notes

- The hook runs on every stop, not only when code changed. Agents often commit their work, and a "did anything change?" check misses that.
- Not using npm? Edit the one line in `verify-before-done.sh` that runs the tests.
- It checks what it checks. In the video the agent fixed the NaN and also quietly rewrote some of my data. Still read the diff.

MIT license. Made by [Ash](https://www.youtube.com/@ashishanant_ai).
