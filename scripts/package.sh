#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VERSION=$(cat "$PROJECT_ROOT/VERSION")
DIST_DIR="$PROJECT_ROOT/dist"
PACKAGE_NAME="prompt-shield-${VERSION}"

echo "Packaging prompt-shield v${VERSION}..."
echo ""

rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}/${PACKAGE_NAME}"

rsync -av --progress "$PROJECT_ROOT/" "${DIST_DIR}/${PACKAGE_NAME}/" \
  --exclude='.git' \
  --exclude='.git/' \
  --exclude='.github' \
  --exclude='.github/' \
  --exclude='dist' \
  --exclude='dist/' \
  --exclude='.DS_Store' \
  --exclude='__MACOSX' \
  --exclude='*.bak' \
  --exclude='node_modules' \
  --exclude='node_modules/' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.log' \
  --exclude='tmp.*' \
  --exclude='.claude/plans/' \
  --quiet

cd "${DIST_DIR}"

echo "Creating archives..."
tar -czvf "${PACKAGE_NAME}.tar.gz" "${PACKAGE_NAME}" --quiet 2>/dev/null || tar -czvf "${PACKAGE_NAME}.tar.gz" "${PACKAGE_NAME}"
zip -rq "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}"

rm -rf "${PACKAGE_NAME}"

echo ""
echo "✅ Package created:"
echo "  - ${DIST_DIR}/${PACKAGE_NAME}.tar.gz"
echo "  - ${DIST_DIR}/${PACKAGE_NAME}.zip"
echo ""
echo "Contents verification:"
echo "  tar.gz: $(tar -tzf "${PACKAGE_NAME}.tar.gz" | wc -l | tr -d ' ') files"
echo "  zip:    $(unzip -l "${PACKAGE_NAME}.zip" | tail -1 | awk '{print $2}') files"
