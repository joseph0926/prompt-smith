# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.x.x   | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by opening a GitHub issue with the label `security`.

### Private Disclosure (Sensitive Issues)

For sensitive issues, use a **private disclosure channel** (e.g., GitHub Security Advisories) if available.
If a private channel is not available, contact the maintainer directly.

**Do not** include secrets, tokens, or PII in public issues.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- Initial response: within 48 hours
- Status update: within 7 days
- Resolution target: within 30 days (depends on severity)

## Security Best Practices

This project follows these security practices:

1. **No secrets in code** - All sensitive data should be handled via environment variables
2. **Input validation** - All user inputs are treated as untrusted data
3. **Dependency updates** - Dependencies are regularly reviewed and updated

## Scope

This security policy applies to the PromptShield project and its official distributions.
