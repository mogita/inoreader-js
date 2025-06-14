#!/bin/bash

# Release script for inoreader-js
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Default to patch if no argument provided
VERSION_TYPE=${1:-patch}

echo "🚀 Starting release process..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: Must be on main branch to release. Currently on: $CURRENT_BRANCH"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean. Please commit or stash changes."
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Run tests
echo "🧪 Running tests..."
bun test

# Run linting
echo "🔍 Running linter..."
bun run lint

# Build project
echo "🔨 Building project..."
bun run build

# Bump version
echo "📈 Bumping version ($VERSION_TYPE)..."
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "📋 New version: $NEW_VERSION"

# Commit version bump
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create and push tag
echo "🏷️  Creating tag v$NEW_VERSION..."
git tag "v$NEW_VERSION"

# Push changes and tag
echo "📤 Pushing changes and tag..."
git push origin main
git push origin "v$NEW_VERSION"

echo "✅ Release process completed!"
echo "🎉 Version $NEW_VERSION has been tagged and pushed."
echo "📦 GitHub Actions will now build and publish to npm."
echo "🔗 Check the progress at: https://github.com/mogita/inoreader-js/actions"
