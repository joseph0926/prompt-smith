#!/bin/bash
set -e

VERSION=$(cat VERSION)
echo "Syncing version: $VERSION"

echo "  Updating .claude-plugin/plugin.json..."
jq ".version=\"$VERSION\"" .claude-plugin/plugin.json > tmp.json && mv tmp.json .claude-plugin/plugin.json

echo "  Updating .claude-plugin/marketplace.json..."
jq ".metadata.version=\"$VERSION\" | .plugins[0].version=\"$VERSION\"" .claude-plugin/marketplace.json > tmp.json && mv tmp.json .claude-plugin/marketplace.json

echo "  Updating skills/prompt-smith/marketplace.json..."
jq ".version=\"$VERSION\"" skills/prompt-smith/marketplace.json > tmp.json && mv tmp.json skills/prompt-smith/marketplace.json

echo "  Updating skills/prompt-smith/SKILL.md..."
sed -i '' "s/^version: \".*\"/version: \"$VERSION\"/" skills/prompt-smith/SKILL.md

echo ""
echo "✅ Version synced to $VERSION in all files"
echo ""
echo "Next steps:"
echo "  1. Update CHANGELOG.md"
echo "  2. git add . && git commit -m \"chore: bump version to $VERSION\""
