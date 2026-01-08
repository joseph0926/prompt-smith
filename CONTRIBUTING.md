# Contributing to prompt-smith

## Quick Start

1. Fork the repository
2. Clone your fork
3. Make changes
4. Test locally
5. Submit a PR

## Project Structure

```
prompt-smith/
├── commands/           # Slash command definitions
├── skills/prompt-smith/
│   ├── SKILL.md       # Main skill definition
│   ├── playbooks/     # Mode-specific workflows
│   ├── references/    # Reference documentation
│   ├── templates/     # Output templates
│   └── i18n/en/       # English translations
├── .github/           # GitHub configuration
└── scripts/           # Build and utility scripts
```

## Development Workflow

### Branch Strategy

- `main` - stable release
- `feature/*` - new features
- `fix/*` - bug fixes
- `docs/*` - documentation updates

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types: feat, fix, docs, chore, refactor, test
Scope: skill, commands, ci, i18n
```

Examples:
- `feat(skill): add new quality check rule`
- `fix(commands): correct lint output format`
- `docs(i18n): update English translations`

### Pull Request Process

1. Create a branch from `main`
2. Make your changes
3. Run lint checks locally
4. Update documentation if needed
5. Sync i18n files if content changed
6. Submit PR with clear description

## Code Guidelines

### Language

- Primary: Korean (root level)
- Translations: `i18n/en/`

### SKILL.md Requirements

Must include valid frontmatter:

```yaml
---
name: skill-name
description: "Clear description"
---
```

### File Naming

- Use kebab-case: `feature-name.md`
- Match structure in i18n directories

## i18n Guidelines

1. Primary language files at root level (Korean)
2. English translations in `i18n/en/`
3. Keep directory structure identical
4. Update both when changing content

When adding a new file:
```bash
# Create Korean version
skills/prompt-smith/playbooks/new-feature.md

# Create English version
skills/prompt-smith/i18n/en/playbooks/new-feature.md
```

## Testing

### Local Testing

1. Install as Claude Code skill
2. Run each mode: `/ps:r`, `/ps:a`, `/ps:lint`, `/ps:build`
3. Verify output matches expected format

### CI Checks

The following checks run automatically:
- SKILL.md existence and size
- Frontmatter validation
- i18n structure consistency
- Markdown lint

## Reporting Issues

### Bug Reports

Use the bug report template. Include:
- Version number
- Command used
- Steps to reproduce
- Expected vs actual behavior

### Feature Requests

Use the feature request template. Include:
- Problem description
- Proposed solution
- Affected area

## Questions

Open an issue with the question template.
