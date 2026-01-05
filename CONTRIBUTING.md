# Contributing to prompt-smith

Thank you for your interest in contributing to prompt-smith!

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

### Suggesting Features

1. Open an issue with `[Feature]` prefix
2. Describe the use case
3. Explain proposed solution

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test your changes
5. Commit with clear message
6. Push to your fork
7. Open a Pull Request

## Code Style

- Korean for all code and documentation (Primary)
- English translations go in `i18n/en/`
- Follow existing file structure
- No comments in code

## SKILL.md Format

All skill files must include:

```yaml
---
name: skill-name
description: "Clear description of the skill"
---
```

## Quality Checklist

Before submitting:

- [ ] SKILL.md has valid frontmatter
- [ ] Level 1 Quick Start works standalone
- [ ] At least one example included
- [ ] MIT license header if applicable

## i18n Guidelines

1. Primary language: Korean (root level)
2. English translations: `i18n/en/`
3. Keep structure identical across languages
4. Maintain `default: "ko"` in marketplace.json

## Questions?

Open an issue with `[Question]` prefix.
