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

# Create release branch
RELEASE_BRANCH="release/v$NEW_VERSION"
echo "🌿 Creating release branch: $RELEASE_BRANCH"
git checkout -b "$RELEASE_BRANCH"

# Commit version bump
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"

# Push release branch
echo "📤 Pushing release branch..."
git push origin "$RELEASE_BRANCH"

# Create pull request (requires gh CLI)
if command -v gh &> /dev/null; then
    echo "📋 Creating pull request..."
    gh pr create \
        --title "Release v$NEW_VERSION" \
        --body "Automated release for version $NEW_VERSION

## Changes
- Bump version to $NEW_VERSION
- Ready for release workflow

This PR will trigger the release workflow once merged." \
        --base main \
        --head "$RELEASE_BRANCH"

    echo "✅ Pull request created!"
    echo "🔗 Please review and merge the PR to complete the release."
    echo "🏷️  The tag will be created after merge."
else
    echo "⚠️  GitHub CLI not found. Please:"
    echo "   1. Create a PR manually from branch: $RELEASE_BRANCH"
    echo "   2. Merge the PR"
    echo "   3. Create tag manually: git tag v$NEW_VERSION && git push origin v$NEW_VERSION"
fi

echo "✅ Release branch created!"
echo "🎉 Version $NEW_VERSION is ready for release."
echo "📦 Merge the PR to trigger the release workflow."
