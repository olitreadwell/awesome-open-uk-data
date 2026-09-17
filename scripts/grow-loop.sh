#!/bin/bash
# Runs one awesome-open-uk-data grow-loop iteration daily via launchd.
# Spawns a headless codex session following grow-loop-prompt.txt, with a
# lock, a time cap, and a heal on three consecutive skips.
set -euo pipefail

export PATH="$HOME/.local/share/mise/installs/node/lts/bin:$HOME/Library/pnpm:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROMPT="$REPO/scripts/grow-loop-prompt.txt"
HEAL_PROMPT="$REPO/scripts/heal-grow-loop-prompt.txt"
LOG="$HOME/Library/Logs/awesome-open-uk-data-loop.log"
STATE="$HOME/Library/Logs/awesome-open-uk-data-loop-state.json"
LOCK="$HOME/Library/Logs/awesome-open-uk-data-loop.lock"
CODEX_BIN="$HOME/.local/share/mise/installs/node/lts/bin/codex"
MAX_CONSECUTIVE_SKIPS=3
LOCK_MAX_MINUTES=150
RUN_TIME_MAX_MINUTES=90

mkdir -p "$(dirname "$LOG")"
log() { echo "$(date '+%F %T') $*" >> "$LOG"; }

skip() {
  local reason="$1"
  log "skipped: $reason"
  python3 -c "
import json, os, sys
path = os.path.expanduser('~/Library/Logs/awesome-open-uk-data-loop-state.json')
state = {}
if os.path.exists(path):
    try: state = json.load(open(path))
    except Exception: state = {}
state['consecutiveSkips'] = state.get('consecutiveSkips', 0) + 1
state['lastSkipReason'] = sys.argv[1]
state['lastSkipAt'] = __import__('datetime').datetime.now().isoformat()
json.dump(state, open(path, 'w'), indent=2)
" "$reason"
}

reset_state() {
  python3 -c "
import json, os
path = os.path.expanduser('~/Library/Logs/awesome-open-uk-data-loop-state.json')
json.dump({'consecutiveSkips': 0, 'lastSkipReason': None, 'lastSkipAt': None}, open(path, 'w'), indent=2)
"
}

consecutive_skips() {
  python3 -c "
import json, os
path = os.path.expanduser('~/Library/Logs/awesome-open-uk-data-loop-state.json')
try: state = json.load(open(path)); print(state.get('consecutiveSkips', 0))
except Exception: print(0)
"
}

maybe_heal() {
  if [ "$(consecutive_skips)" -ge "$MAX_CONSECUTIVE_SKIPS" ]; then
    if ps -axo command= | grep "[h]eal the grow loop itself" >/dev/null; then
      log "healing: heal session already running; skipping spawn"
      return 0
    fi
    log "healing: spawning fix session for repeated blocker"
    "$CODEX_BIN" exec --cd "$REPO" -c 'approval_policy="never"' -c 'sandbox_mode="danger-full-access"' "$(cat "$HEAL_PROMPT")" >> "$LOG" 2>&1 || true
    reset_state
  fi
}

acquire_lock() {
  if [ -f "$LOCK" ]; then
    local pid age
    pid=$(cat "$LOCK" 2>/dev/null || echo '')
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      age=$(( $(date +%s) - $(stat -f %m "$LOCK" 2>/dev/null || echo 0) ))
      if [ "$age" -lt "$((LOCK_MAX_MINUTES * 60))" ]; then
        log "skipped: previous iteration still running (pid $pid)"
        return 1
      fi
      log "clearing stale lock: pid $pid alive but older than ${LOCK_MAX_MINUTES}m"
      rm -f "$LOCK"
    else
      log "clearing stale lock: pid $pid not running"
      rm -f "$LOCK"
    fi
  fi
  echo "$$" > "$LOCK"
  return 0
}

if ! acquire_lock; then exit 0; fi
trap 'rm -f "$LOCK"' EXIT
log "===== grow loop iteration start ====="

cd "$REPO"
if [ "$(git branch --show-current)" != "main" ]; then
  skip "not on main"; exit 0
fi
git fetch origin main --quiet || true
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  skip "main is behind origin/main (pull first)"; maybe_heal; exit 0
fi
if ! git diff --quiet -- . ':(exclude)LOOP-NOTES.md'; then
  skip "main has uncommitted changes"; maybe_heal; exit 0
fi

"$CODEX_BIN" exec --cd "$REPO" -c 'approval_policy="never"' -c 'sandbox_mode="danger-full-access"' "$(cat "$PROMPT")" >> "$LOG" 2>&1 &
agent_pid=$!

waited=0
killed=0
while kill -0 "$agent_pid" 2>/dev/null; do
  sleep 30
  waited=$((waited + 30))
  if [ "$waited" -ge "$((RUN_TIME_MAX_MINUTES * 60))" ]; then
    stat=$(ps -o stat= -p "$agent_pid" 2>/dev/null || true)
    case "$stat" in
      ""|Z*) break ;;
    esac
    log "killing stalled agent after ${RUN_TIME_MAX_MINUTES}min"
    kill "$agent_pid" 2>/dev/null || true
    killed=1
    break
  fi
done

if wait "$agent_pid"; then status=0; else status=$?; fi

if [ "$killed" -eq 1 ]; then
  log "loop iteration STALLED: agent killed at the ${RUN_TIME_MAX_MINUTES}min cap"
  skip "agent stalled at the time cap"; maybe_heal; exit 1
fi
if [ "$status" -eq 0 ]; then
  log "loop iteration finished ok"; reset_state; exit 0
fi
log "loop iteration FAILED (exit $status)"
exit "$status"
