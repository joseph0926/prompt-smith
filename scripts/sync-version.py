#!/usr/bin/env python3
"""
Sync VERSION file to all version references across the project.

Cross-platform compatible (macOS, Linux, Windows).
Replaces sync-version.sh for broader compatibility.
"""

import json
import re
import sys
from pathlib import Path


def get_project_root() -> Path:
    """Get project root directory (where VERSION file exists)."""
    script_dir = Path(__file__).parent
    return script_dir.parent


def read_version(root: Path) -> str:
    """Read version from VERSION file."""
    version_file = root / "VERSION"
    if not version_file.exists():
        print(f"Error: VERSION file not found at {version_file}")
        sys.exit(1)
    return version_file.read_text().strip()


def update_json_file(path: Path, keys: list[str], version: str) -> None:
    """Update version in JSON file at specified keys."""
    if not path.exists():
        print(f"  Warning: {path} not found, skipping")
        return

    data = json.loads(path.read_text())

    for key in keys:
        parts = key.replace("[", ".").replace("]", "").split(".")
        target = data
        for part in parts[:-1]:
            if part.isdigit():
                target = target[int(part)]
            else:
                target = target[part]
        final_key = parts[-1]
        if final_key.isdigit():
            target[int(final_key)] = version
        else:
            target[final_key] = version

    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"  Updated {path}")


def update_markdown_frontmatter(path: Path, version: str) -> None:
    """Update version in markdown frontmatter and title."""
    if not path.exists():
        print(f"  Warning: {path} not found, skipping")
        return

    content = path.read_text()
    original = content

    content = re.sub(
        r'^(\s+)version:\s*["\']?[\d.]+["\']?',
        rf'\1version: "{version}"',
        content,
        flags=re.MULTILINE,
    )

    content = re.sub(
        r'^version:\s*["\']?[\d.]+["\']?',
        f'version: "{version}"',
        content,
        flags=re.MULTILINE,
    )

    content = re.sub(
        r'^(# Prompt Smith v)[\d.]+',
        rf'\g<1>{version}',
        content,
        flags=re.MULTILINE,
    )

    if content != original:
        path.write_text(content)
        print(f"  Updated {path}")
    else:
        print(f"  No change needed in {path}")


def main() -> None:
    root = get_project_root()
    version = read_version(root)

    print(f"Syncing version: {version}")
    print()

    print("JSON files:")
    update_json_file(
        root / ".claude-plugin/plugin.json",
        ["version"],
        version,
    )
    update_json_file(
        root / ".claude-plugin/marketplace.json",
        ["metadata.version", "plugins.0.version"],
        version,
    )
    update_json_file(
        root / "skills/prompt-smith/marketplace.json",
        ["version"],
        version,
    )

    print()
    print("Markdown files:")
    update_markdown_frontmatter(
        root / "skills/prompt-smith/SKILL.md",
        version,
    )
    update_markdown_frontmatter(
        root / "skills/prompt-smith/i18n/en/SKILL.md",
        version,
    )

    print()
    print(f"✅ Version synced to {version} in all files")
    print()
    print("Next steps:")
    print("  1. Update CHANGELOG.md")
    print('  2. git add . && git commit -m "chore: bump version to {}"'.format(version))


if __name__ == "__main__":
    main()
