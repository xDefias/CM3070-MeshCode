#!/bin/bash

WATCH_DIR="/project"
DEBOUNCE_DELAY=5  # Time in seconds to wait before triggering a sync

# Ensure inotify-tools and curl are installed in the container
# ...

# Function to notify the server about file changes
notify_server() {
  curl -X POST -H "Content-Type: application/json" -d '{
    "project_id": "'$PROJECT_ID'",
    "action": "sync"
  }' "http://host.docker.internal:3000/api/projects/${PROJECT_ID}/notify-file-change"
}

# Function to check if a relevant process is running based on its PID
is_relevant_process_running() {
  pgrep -f "npm|yarn|pip" > /dev/null 2>&1
}

# Function to trigger a sync after relevant processes finish
sync_after_processes() {
  echo "Waiting for relevant processes to finish..."
  while is_relevant_process_running; do
    sleep 2
  done

  echo "All relevant processes have finished. Now sending sync notification..."
  notify_server
}

# Debounce function to prevent multiple quick syncs
debounce_sync() {
  if [ -n "$debounce_timer" ]; then
    # If a debounce timer exists, clear it
    kill "$debounce_timer" 2>/dev/null
  fi

  # Set a new timer to sync after the debounce delay
  (sleep $DEBOUNCE_DELAY && sync_after_processes) &
  debounce_timer=$!
}

# Initial sync (if needed)
notify_server

# Watch for file changes
inotifywait -m -r -e modify,create,delete --format '%w%f %e' "${WATCH_DIR}" | while read FILE EVENT; do
  FILE_PATH=${FILE#"${WATCH_DIR}"}

  # Debounce the sync process to avoid spamming the server
  debounce_sync
done
