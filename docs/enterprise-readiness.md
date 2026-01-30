# Enterprise Readiness Checklist

> Purpose: document the security, governance, and operational requirements needed
> to run PromptShield in a team or enterprise environment.
> The default setup is local-first, so the items below are additional requirements.

---

## 1) Security and Vulnerability Disclosure

- [ ] Supported versions policy (e.g., 3.x.x only)
- [ ] Private disclosure channel (GitHub Security Advisories or security email)
- [ ] Severity definition (Sev1~Sev4) and response SLA
- [ ] Public vs private issue routing rules
- [ ] Dependency update and patch policy

---

## 2) Data Governance (Registry / Eval / Logs)

- [ ] Data classification (prompt content, metadata, eval results)
- [ ] Retention and deletion policy (TTL, purge)
- [ ] Backup and restore procedure
- [ ] Encryption requirements (at-rest / in-transit)
- [ ] Access control (RBAC/ACL) for multi-user environments
- [ ] PII redaction rules for logs and metadata

---

## 3) Observability and Audit

- [ ] run_id / call_id definitions and correlation
- [ ] Structured log schema (tool_name, status, duration, error.code)
- [ ] Audit log retention and access policy
- [ ] Incident record and postmortem template

---

## 4) MCP Registry Contract (API)

- [ ] Tool naming stability and versioning policy
- [ ] Input/output JSON schema docs per tool
- [ ] Standard error codes (VALIDATION_ERROR, NOT_FOUND, etc.)
- [ ] Version history and rollback semantics
- [ ] Migration and backward-compatibility strategy
- [ ] Limits (size, count, rate)

---

## 5) CI Governance

- [ ] Branch protection and required checks
- [ ] Minimal GitHub Actions permissions
- [ ] Action pinning policy (tag vs SHA)
- [ ] Untrusted PR policy (avoid/limit pull_request_target secrets)
- [ ] Artifact retention for failures

---

## 6) Ops and Ownership

- [ ] Owner/backup owner process
- [ ] Drift check cadence and responsibility
- [ ] Regression test policy (PR / periodic / model updates)
- [ ] Incident response and rollback policy

---

## 7) Deployment and Configuration

- [ ] Supported deployment model (local, CI, on-prem)
- [ ] Environment variable and config reference
- [ ] Upgrade / downgrade procedure
- [ ] Configuration change history (changelog / release notes)

---

## Related Documents

- `SECURITY.md` - security policy and disclosure
- `ARCHITECTURE.md` - security boundaries and data flow
- `docs/ci-gate-guide.md` - CI Gate operations
- `skills/prompt-shield/playbooks/team/owner-guide.md` - ownership model
- `skills/prompt-shield/playbooks/team/prompt-pr.md` - PR rules
- `skills/prompt-shield/playbooks/team/regression-testing.md` - regression tests
