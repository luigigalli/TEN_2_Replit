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

# Function to create a clean branch with specific folders
create_clean_branch() {
    local branch_name=$1
    local folders=("${@:2}")

    log "Creating clean branch: $branch_name"

    # Create new orphan branch (no history)
    git checkout --orphan "temp-$branch_name"

    # Remove everything from staging
    git rm -rf --cached . || true

    # Clean the working directory
    git clean -fdx

    # Create required folders if they don't exist
    for folder in "${folders[@]}"; do
        mkdir -p "$folder"
        touch "$folder/.gitkeep"
        # Create a README.md in each folder
        echo "# $folder" > "$folder/README.md"
        echo "This folder is part of the $branch_name branch." >> "$folder/README.md"
    done

    # Add and commit the folders
    git add .
    git config --global user.email "temp@example.com"
    git config --global user.name "Temporary User"

    if ! git commit -m "Initial commit for $branch_name with required folders"; then
        error "Failed to create commit for $branch_name"
        exit 1
    fi

    # If the target branch exists, rename it with -old suffix
    if branch_exists "$branch_name"; then
        warn "Branch $branch_name already exists, renaming to $branch_name-old"
        git branch -m "$branch_name" "$branch_name-old"
    fi

    # Rename temp branch to target branch
    git branch -m "temp-$branch_name" "$branch_name"

    log "Branch $branch_name created successfully"
}

# Initialize git repository if needed
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log "Initializing git repository..."
    git init
fi

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

# Create develop branch if it doesn't exist
if ! branch_exists "develop"; then
    log "Creating develop branch..."
    git checkout -b develop main || git checkout -b develop
    echo "# Travel Experience Network - Development Branch" > README.md
    echo "Development branch for the digital travel planning platform." >> README.md
    git add README.md
    git commit -m "Initial develop branch commit" || true
fi

# Save current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "Current branch: $CURRENT_BRANCH"

# Create bugfixes branch with frontend and backend folders
log "Setting up bugfixes branch..."
create_clean_branch "bugfixes" "bugfixes/frontend" "bugfixes/backend"

# Create features branch (empty for now)
log "Setting up features branch..."
create_clean_branch "features" "features"

# Handle environment branch
log "Setting up environment branch..."
if branch_exists "environment"; then
    log "Renaming current environment branch to environment-old"
    git checkout environment
    git branch -m environment-old
fi

create_clean_branch "environment" "environment"

# Return to original branch
log "Returning to $CURRENT_BRANCH branch..."
git checkout "$CURRENT_BRANCH"

log "Branch reorganization completed successfully"