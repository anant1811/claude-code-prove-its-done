#!/usr/bin/env bash
# Stop hook: runs every time Claude tries to finish.
# If the tests or the browser check fail, block "done"
# and hand the failure back to Claude (exit 2 = "not done, keep working").

cd "$CLAUDE_PROJECT_DIR" || exit 0
input=$(cat)
counter=".claude/hooks/.attempts"

# Safety valve: don't loop forever. Reset the count on a fresh stop.
if ! echo "$input" | grep -q '"stop_hook_active": *true'; then echo 0 > "$counter"; fi
attempts=$(cat "$counter" 2>/dev/null || echo 0)
if [ "$attempts" -ge 3 ]; then
  echo "Verification still failing after 3 tries. Stopping so a human can look." >&2
  exit 0
fi

report=$( { npm test --silent && npm run verify --silent; } 2>&1 )
if [ $? -eq 0 ]; then exit 0; fi

echo $((attempts + 1)) > "$counter"
cat >&2 <<EOF
You said you're done, but the app is not verified.

$(echo "$report" | tail -25)

Open the screenshots above with the Read tool and look at them. Find the root cause,
fix it, run \`npm run verify\` yourself, and only finish when it passes.
EOF
exit 2
