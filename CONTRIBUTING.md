# Contributing to PromptShield

## Quick Start

1. Fork the repository
2. Clone your fork
3. Make changes
4. Test locally
5. Submit a PR

## Project Structure

```
prompt-shield/
├── commands/           # Slash command definitions
├── skills/prompt-shield/
│   ├── SKILL.md       # Main skill definition
│   ├── playbooks/     # Mode-specific workflows
│   ├── references/    # Reference documentation
│   ├── templates/     # Output templates
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
Scope: skill, commands, ci, docs
```

Examples:
- `feat(skill): add new quality check rule`
- `fix(commands): correct lint output format`
- `docs: update English README`

### Pull Request Process

1. Create a branch from `main`
2. Make your changes
3. Run lint checks locally
4. Update documentation if needed
5. Keep bilingual docs (README.md / README.ko.md) in sync if content changed
6. Submit PR with clear description

## Code Guidelines

### Language

- Primary: Korean for skill content under `skills/prompt-shield/`
- English docs are maintained only as parallel files (e.g., `README.md` + `README.ko.md`)
- Do not create `i18n/` directories unless an official spec requires it

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
- For bilingual docs, keep filenames aligned (e.g., `README.md` + `README.ko.md`)

## i18n Policy

1. This repo does not use `skills/**/i18n/` directories
2. Bilingual docs live side-by-side at the same level (e.g., `README.md` + `README.ko.md`)
3. Update both files together when shared content changes

## Testing

### Local Testing

1. Install as Claude Code skill
2. Run each mode: `/ps:r`, `/ps:a`, `/ps:lint`, `/ps:build`
3. Verify output matches expected format

### CI Checks

The following checks run automatically:
- SKILL.md existence and size
- Frontmatter validation
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
