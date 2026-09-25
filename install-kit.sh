#!/usr/bin/env bash
# Install the "prove it's done" kit into a project.
#   ./install-kit.sh [project-dir]        (default: ./example)
#   VERIFY_URL=http://localhost:5173 VERIFY_START="npm run dev" ./install-kit.sh ~/code/my-app
set -e
kit="$(cd "$(dirname "$0")/kit" && pwd)"
target="$(cd "${1:-$(dirname "$0")/example}" && pwd)"
cd "$target"

mkdir -p verify .claude/hooks
cp "$kit/verify/verify.mjs" verify/
cp "$kit/.claude/hooks/verify-before-done.sh" .claude/hooks/
chmod +x .claude/hooks/verify-before-done.sh

if [ -f .claude/settings.json ]; then
  echo "⚠️  .claude/settings.json already exists: merge the \"hooks\" block from kit/.claude/settings.json into it by hand."
else
  cp "$kit/.claude/settings.json" .claude/
fi

if [ -f package.json ]; then
  if [ -z "$(npm pkg get scripts.verify | tr -d '{}"')" ]; then
    url="${VERIFY_URL:-http://localhost:3000}"
    start="${VERIFY_START:+ VERIFY_START='$VERIFY_START'}"
    npm pkg set "scripts.verify=VERIFY_URL=$url$start node verify/verify.mjs"
  fi
  [ -d node_modules/playwright ] || npm i -D playwright
  npx playwright install chromium
fi

for line in verify/screenshots/ .claude/hooks/.attempts; do
  grep -qxF "$line" .gitignore 2>/dev/null || echo "$line" >> .gitignore
done
echo "✅ Kit installed in $target. Restart Claude Code (or run /hooks) so it picks up the Stop hook."
