#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Verify environment before proceeding
log "Verifying environment..."
if ! ./scripts/verify-env; then
    error "Environment verification failed. Please check your configuration."
fi

# Exit on any error
set -e

# Verify we are on develop branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || error "Failed to get current branch"
if [ "$CURRENT_BRANCH" != "develop" ]; then
    log "Switching to develop branch..."
    git checkout develop || error "Failed to switch to develop branch"
fi

# Update all branches
log "Updating branches..."
git fetch origin || error "Failed to fetch from origin"

# Sync develop branch
log "Syncing develop branch..."
git pull origin develop || error "Failed to pull develop branch"

# Sync environment branch if it exists
if git show-ref --verify --quiet refs/heads/environment; then
    log "Syncing environment branch..."
    git checkout environment || error "Failed to switch to environment branch"
    git pull origin environment || error "Failed to pull environment branch"
fi

# Return to develop branch
log "Returning to develop branch..."
git checkout develop || error "Failed to return to develop branch"

# Verify environment after sync
log "Verifying environment after sync..."
if ! ./scripts/verify-env; then
    error "Post-sync environment verification failed. Please check your configuration."
fi

log "Branch synchronization completed successfully"