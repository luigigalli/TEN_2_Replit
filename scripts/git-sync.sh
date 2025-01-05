#!/bin/bash

# Exit on any error and print each command
set -e
set -x

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
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Function to check if branch exists
branch_exists() {
    git show-ref --verify --quiet "refs/heads/$1"
    return $?
}

# Function to safely delete branch
delete_branch() {
    local branch=$1
    if branch_exists "$branch"; then
        log "Deleting branch: $branch"
        git branch -D "$branch"
    fi
}

# Initialize git repository if needed
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log "Initializing git repository..."
    git init
fi

# Save current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
log "Current branch: $CURRENT_BRANCH"

# Create initial commit if needed
if ! git rev-parse --quiet --verify HEAD > /dev/null 2>&1; then
    log "Creating initial commit..."
    git checkout --orphan main
    echo "# Travel Experience Network" > README.md
    echo "Digital travel planning platform enabling travelers to discover and coordinate trip experiences." >> README.md
    git add README.md
    git config --global user.email "temp@example.com"
    git config --global user.name "Temporary User"
    git commit -m "Initial commit"
fi

# Ensure we're on main branch
if ! branch_exists "main"; then
    log "Creating main branch..."
    git checkout -b main
fi

# Create develop branch from main if it doesn't exist
if ! branch_exists "develop"; then
    log "Creating develop branch from main..."
    git checkout main
    git checkout -b develop
    echo "# Travel Experience Network - Development Branch" > README.md
    echo "Development branch for the digital travel planning platform." >> README.md
    git add README.md
    git commit -m "Initial develop branch setup"
fi

# Remove old organizational branches
log "Cleaning up old organizational branches..."
delete_branch "features"
delete_branch "features-old"
delete_branch "bugfixes"
delete_branch "bugfixes-old"
delete_branch "environment"
delete_branch "environment-old"

# Create example feature branch structure
log "Creating example feature branch..."
git checkout develop
git checkout -b feat/validation-messages
echo "# Validation Messages Feature" > validation-messages.md
echo "Implementation of enhanced validation messages across environments." >> validation-messages.md
git add validation-messages.md
git commit -m "feat: add validation messages feature template"

# Return to develop branch
log "Returning to develop branch..."
git checkout develop

# Remove temporary feature branch
delete_branch "feat/validation-messages"

log "Git branch restructuring completed successfully"

# Print current structure
log "Current branch structure:"
git branch -a