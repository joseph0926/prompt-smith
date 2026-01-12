# Changelog

All notable changes to the Prompt Smith skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.2.1] - 2026-01-12

### Summary
Fix for `/ps:build` skill being skipped when input content appears unrelated to prompt design. Claude was pre-judging input content and simulating skill output instead of invoking the Skill tool.

### Fixed

#### Skill Invocation Enforcement
- **Root cause**: Claude analyzed input content (e.g., "AI orchestrator for node-based web app") and decided it wasn't "prompt design", skipping skill invocation
- **Solution**: Added explicit rules requiring immediate skill invocation regardless of input content

### Changed

#### SKILL.md
- **description**: Added `**CRITICAL: /ps:로 시작하는 모든 명령은 입력 내용과 무관하게 반드시 이 스킬을 호출**`
- **New section**: Command Execution Rules - explicit requirements for Claude to invoke skill tool immediately
- **Files**: skills/prompt-smith/SKILL.md

#### commands/build.md
- **New section**: MANDATORY EXECUTION RULE - prohibits simulation without proper skill invocation
- **New step**: Step 0.5 Scope Clarification - ASK instead of REFUSE for ambiguous inputs
- **Interpretation guide**: Examples like "AI orchestrator" → "prompt for AI orchestration" design

#### input-handling-rules.md
- **New section**: Skill Invocation Rule - cross-reference to Command Execution Rules
- **Files**: skills/prompt-smith/references/input-handling-rules.md

### Technical Details

| Issue | Before | After |
|-------|--------|-------|
| Input: `/ps:build AI orchestrator...` | Claude says "이건 프롬프트 설계가 아닙니다" | Skill tool invoked → GATHER or Step 0.5 question |
| Skill simulation | Claude outputs GATHER/CLASSIFY without tool call | Forbidden - must use Skill tool |
| Pre-filtering | Claude judges input relevance before skill call | Forbidden - skill handles scope validation |

### Compatibility
- Backward compatible with all existing workflows
- No changes to 8-Point Quality Check scoring
- No changes to LINT/Review/Intercept modes

---

## [3.0.0] - 2026-01-10

### Summary
Prompt Smith v3.0.0 is a major release featuring Progressive Skill Loading architecture, advanced prompt engineering guides (Extended Thinking, Prefill Response, Token Efficiency), and new modes directory structure.

### Added

#### Progressive Skill Loading
- **New directory**: `modes/` for Level 2 progressive loading
- **Mode files**: build.md, intercept.md, lint.md
- **Benefit**: Reduced initial token load, on-demand loading

#### Hooks & Subagent Support
- **Hooks integration**: Automatic LINT for hook outputs
- **Subagent separation**: Dedicated agent workflows

#### Empirical Evaluation
- **New command**: `/ps:eval` for prompt evaluation
- **Playbook**: playbooks/eval/eval-mode.md

---

## [2.8.0] - 2026-01-10

### Summary
Prompt Smith v2.8.0 adds advanced prompt engineering guides based on official Anthropic documentation: Extended Thinking, Prefill Response, and Token Efficiency optimization.

### Added

#### Extended Thinking Guide
- **New section** in quality-checklist.md: Extended Thinking usage guide
- **When to use**: Complex STEM problems, constraint optimization, strategic frameworks
- **Token budget guide**: Minimum 1,024 tokens, recommended 16K-32K
- **Best practices**: General instructions first, then troubleshoot with specifics
- **Source**: Anthropic official docs - prompt-technique-thinking.md

#### Prefill Response Guide
- **New section** in quality-checklist.md: Prefill technique for format enforcement
- **Use cases**: JSON output (`{`), XML output (`<`), specific patterns
- **Limitations**: Cannot use with Extended Thinking enabled
- **Alternative**: Format enforcement through explicit instructions (for Claude Code)

#### Token Efficiency Guide
- **New section** in quality-checklist.md: Cost optimization tips
- **Token estimation**: ~4 chars = 1 token (English), ~2 chars = 1 token (Korean)
- **Optimization checklist**: Example limits, redundancy removal, 4-Block caching
- **Cost awareness**: Average $6/developer/day, Claude Code commands (/cost, /compact)
- **Source**: Anthropic official docs - cc-costs-tokens.md

#### Extended Thinking Template
- **New template** in prompt-template.md: Complex problem-solving structure
- **Structure**: Role → Context → Thinking block → Solution → Verification
- **Usage tips**: When to use general vs specific instructions

### Changed

#### Documentation Updates
- **quality-checklist.md**: Added 3 new guide sections (Extended Thinking, Prefill, Token)
- **prompt-template.md**: Added Extended Thinking template
- **SKILL.md**: Version 2.7.0 → 2.8.0
- **VERSION**: Updated to 2.8.0

### Compatibility

#### Backward Compatible
- All existing workflows remain functional
- New guides are additive, not replacing existing content
- 8-Point Quality Check unchanged

---

## [2.7.0] - 2026-01-10

### Summary
Prompt Smith v2.7.0 upgrades to **8-Point Quality Check** by adding SUCCESS_CRITERIA as a core evaluation dimension. Introduces 2026 prompt engineering concepts including Context Engineering, Cache-Aware Structure, Tree of Thought, and "Above and Beyond" explicit request pattern for Claude 4.x.

### Added

#### SUCCESS_CRITERIA (6th Core Dimension)
- **New dimension**: SUCCESS_CRITERIA added to base 6 items (previously 5)
- **Scoring criteria**: 0=none, 1=vague conditions, 2=measurable specific conditions
- **Checklist**: Completion conditions, measurable criteria, verification methods, failure conditions
- **SMART-based elements**: Specific, Measurable, Achievable, Relevant
- **Files**: quality-checklist.md, full-lint.md, build-mode.md, SKILL.md, diagnostic-report.md

#### Context Engineering (2026 Concept)
- **New section** in technique-priority.md: Context Engineering paradigm
- **5 context layers**: Static, Retrieved, Memory, Tool Definitions, User Input
- **Cache-Aware Structure**: Static content at top, dynamic at bottom for caching efficiency
- **Benefits**: 50% cost reduction for cached tokens, up to 80% latency reduction

#### Tree of Thought (ToT)
- **New section** in technique-priority.md: Advanced reasoning technique
- **Multi-hypothesis exploration**: Generate hypotheses → Evaluate each → Select optimal
- **Use cases**: Complex problems with uncertainty, creative problem-solving, optimal path selection

#### "Above and Beyond" Pattern
- **New section** (#10) in claude-4x-best-practices.md
- **Claude 4.x behavior**: Only does what's explicitly requested (no proactive suggestions)
- **Pattern comparison**: Implicit vs Explicit request examples
- **Domain templates**: Code review, feature implementation, documentation

#### 4-Block Pattern Template
- **New template** in prompt-template.md: Cache-Aware prompt structure
- **Blocks**: INSTRUCTIONS (static) → CONTEXT (semi-static) → TASK (dynamic) → OUTPUT FORMAT (static)
- **Benefits**: Cache efficiency, maintainability, consistency, easier debugging

#### Anti-Pattern #12
- **New pattern**: "Success Criteria 누락" (Missing Success Criteria)
- **Severity**: Medium (🟡)
- **Improvement**: Add measurable success criteria section

### Changed

#### 7-Point → 8-Point Quality Check
- **Base items**: 5 → 6 (added SUCCESS_CRITERIA)
- **Extended items**: 2 (STATE_TRACKING, TOOL_USAGE) - unchanged
- **Score calculation**: (raw_score / applicable_items × 2) × 10 = 10 points max
- **Files updated**: 9 files across references, playbooks, templates

#### Documentation Updates
- **quality-checklist.md**: Complete rewrite with SUCCESS_CRITERIA section
- **technique-priority.md**: Added Context Engineering (#10) and ToT (#11) sections
- **claude-4x-best-practices.md**: Added "Above and Beyond" section (#10)
- **anti-patterns.md**: Added #12 pattern, updated checklist
- **SKILL.md**: Version 2.6.1 → 2.7.0, all 7-Point → 8-Point references
- **full-lint.md**: Updated check table, improvement patterns
- **build-mode.md**: Updated design checklist with SUCCESS_CRITERIA
- **prompt-template.md**: Added 4-Block Pattern template
- **diagnostic-report.md**: Added Success Criteria row to score tables

#### Technique Selection Guide
- **Updated table** in technique-priority.md with 2026 techniques
- **New columns**: ToT for complex reasoning, Context Eng. for large systems

### Compatibility

#### Backward Compatible
- Existing 7-Point prompts remain valid (SUCCESS_CRITERIA scored as additional item)
- Legacy mode available: prompts without SUCCESS_CRITERIA calculated on 5 base items
- No breaking changes to existing workflows

---

## [2.6.0] - 2026-01-09

### Summary
Prompt Smith v2.6.0 aligns all prompt engineering content with Anthropic official documentation (19 reference documents). Adds 3 new reference guides, updates example count from 2+ to 3-5, adds Prefill section, and introduces hallucination reduction strategies.

### Added

#### New Reference Guides (3 files)
- **technique-priority.md**: 9-step prompt technique priority guide (Anthropic recommended order)
  - Prompt Generator → Clear & Direct → Examples → CoT → XML Tags → Role → Prefill → Chaining → Long Context
- **hallucination-reduction.md**: 4 basic + 3 advanced strategies for reducing hallucinations
  - "I don't know" permission, citation-based, external knowledge restriction, CoT verification
- **latency-optimization.md**: 5 optimization strategies for reducing latency
  - Model selection, token optimization, max_tokens, temperature, streaming

#### Prefill Section (claude-4x-best-practices.md)
- **New Section 8**: Prefill (Response Pre-filling) - Anthropic recommended
- Key rules: No trailing spaces, Extended Thinking incompatible, JSON forcing with `{`
- Patterns: JSON forcing, role maintenance (`[Character]`), list start, XML structure

#### Hallucination Pattern (#11)
- **anti-patterns.md**: Added #11 Hallucination-Prone pattern
- Types: Factual errors, non-existent citations, overconfident claims, context drift
- Defense techniques: "I don't know" permission, citation-based response, CoT verification, Best-of-N

### Changed

#### Example Count Update (Anthropic alignment)
- **quality-checklist.md**: 2+ examples → **3-5 examples** (Relevant/Diverse/Clear criteria)
- **full-lint.md**: Updated scoring: 0=none, 1=1-2, 2=3-5 (Relevant/Diverse/Clear)
- **quick-start.md**: Updated 7-Point table with new example criteria
- **technique-priority.md**: 3-5 examples with quality criteria

#### Chain of Thought Enhancement
- **quality-checklist.md**: Added CoT 3-stage guide (Basic → Guided → Structured)
- **technique-priority.md**: CoT patterns with `<thinking>` + `<answer>` XML tags

#### Extended Thinking Update
- **claude-4x-best-practices.md**: Enhanced with technical considerations
  - Minimum budget: 1024 tokens, Large tasks: 32K+ batch, Language: English optimal
  - High-level instructions preferred, thinking output reuse prohibited

#### Self-Correction Chain Pattern
- **prompt-chaining.md**: Added Generate → Review → Refine loop pattern
- XML handoff patterns: Basic, multi-output, metadata inclusion

#### Evaluation Methods
- **full-lint.md**: Added Anthropic-recommended evaluation methods
  - Code-based (exact match, JSON validation), LLM-based (Likert scale), Human-based

#### Documentation Links
- **SKILL.md**: Added 3 new reference links
- **full-lint.md**: Added 3 new reference links
- **prompt-chaining.md**: Added technique-priority, hallucination-reduction links
- **README.md**: Added 3 new documentation links

### Fixed
- Consistency update: "2개 이상" → "3-5개" across all files

---

## [2.5.4] - 2026-01-09

### Summary
Prompt Smith v2.5.4 normalizes plugin structure to Claude Code official spec. Adds component paths to plugin.json, simplifies SKILL.md frontmatter, and removes i18n directory.

### Changed

#### plugin.json Normalization
- **Added** `homepage` field
- **Added** `keywords` array (migrated from SKILL.md metadata.tags)
- **Added** `commands` path (`./commands/`)
- **Added** `skills` path (`./skills/`)

#### SKILL.md Frontmatter Simplification
- **Removed** `license`, `compatibility`, `metadata`, `i18n` non-standard fields
- **Kept** only spec-required fields: `name`, `description`

### Removed

#### i18n Directory
- **Deleted** `skills/prompt-smith/i18n/` directory
- **Reason**: No i18n spec in Claude Code plugin system, management complexity

---

## [2.5.3] - 2026-01-08

### Summary
Prompt Smith v2.5.3 addresses 16 improvement items from code review. Adds WebFetch to forbidden tools, localizes Intercept playbooks to Korean, unifies terminology, and strengthens CI validation.

### Added

#### WebFetch Forbidden Tool
- **Added** `Web* (WebFetch/WebSearch)` to FORBIDDEN tools in all commands
- **Added** URL triggers (`http://`, `https://`, `URL`, `링크 열어`, `fetch`) to ignore list
- **Files**: `input-handling-rules.md`, `lint.md`, `a.md`, `build.md`, `r.md`

#### /ps:help Topic Sections
- **Added** `Topic: review` section with workflow, output format, approval options
- **Added** `Topic: intercept` section with workflow, output format, usage guidance

#### CI commands/ Validation
- **Added** `Check commands/ directory` step to `.github/workflows/lint.yml`
- **Validates** required commands exist (help.md, lint.md, build.md, r.md, a.md)
- **Validates** internal links in commands/ directory

#### Score Calculation Formula
- **Added** explicit formula to `r.md` and `a.md`:
  ```
  score = (sum(applicable) / (applicable_items × 2)) × 10
  ```
- **Added** N/A handling rule for extended items

#### Phase-based Behavior (/ps:a)
- **Added** explicit phase separation in `a.md`:
  - LINT/Improve Phase (Steps 1-3): DO NOT call tools
  - Execute Phase (Step 4): Execute normally

#### Language Policy (build.md)
- **Added** "Respond in same language as user" rule
- **Added** bilingual empty input response templates (Korean/English)

### Changed

#### Intercept Playbook Localization
- **Translated** `review-mode.md` to Korean (루트 레벨)
- **Translated** `intercept-mode.md` to Korean (루트 레벨)
- **Preserved** English originals in `i18n/en/`
- **Added** `[DEBUG] 최종 제출 프롬프트` section to review-mode.md

#### Terminology Unification
- **Changed** "Auto Mode" → "Intercept Mode" in README.md
- **Consistent** naming across all documentation

#### 5-Point Expression Cleanup
- **Changed** "5-Point" → "기본 5항목" or "Base 5 dimensions" in:
  - `build-mode.md`
  - `build-report.md`
  - `SKILL.md` Roadmap

#### Version String Fix
- **Fixed** "v2.5.0 활성화" → "v2.5.2 활성화" in SKILL.md mode selection

#### Template Improvements
- **Simplified** "진단자: Prompt Smith v1.0.0" → "진단자: Prompt Smith" in `diagnostic-report.md`
- **Clarified** JSON constraint in `prompt-template.md`: "(in actual output; code blocks here are for documentation purposes only)"

### Removed

#### Deprecated Script
- **Deleted** `scripts/sync-version.sh` (Python script provides cross-platform compatibility)

### Fixed

#### .gitignore Extension
- **Added** `dist/`, `node_modules/`, `.env*`, `__MACOSX/`, `*.log`, `.temp*/` entries

---

## [2.5.2] - 2026-01-08

### Summary
Prompt Smith v2.5.2 is a documentation cleanup patch. Removes duplicate lint-mode.md, updates broken links, simplifies FORBIDDEN Tools sections, and removes hardcoded version strings.

### Removed

#### Duplicate File Cleanup
- **Deleted** `playbooks/lint-mode.md` (99% duplicate of `playbooks/lint/full-lint.md`)
- **Deleted** `i18n/en/playbooks/lint-mode.md` (i18n sync)

#### Version Hardcoding
- **Removed** version string from `commands/help.md` header (was `v2.4.0`)
- **Removed** version footer from `templates/diagnostic-report.md` (ko/en)

### Changed

#### Link Updates (10 files)
- **Updated** `lint-mode.md` → `lint/full-lint.md` references in:
  - `references/team-workflow.md` (ko/en)
  - `references/quality-checklist.md` (ko/en)
  - `references/anti-patterns.md` (ko/en)
  - `templates/diagnostic-report.md` (ko/en)
  - `templates/test-case-template.md`
  - `commands/lint.md`

#### Commands Simplification
- **Simplified** FORBIDDEN Tools sections in `r.md`, `a.md`, `lint.md`, `build.md`
- **Changed** from detailed tables to single-line reference + link to `input-handling-rules.md`

---

## [2.5.1] - 2026-01-07

### Summary
Prompt Smith v2.5.1 strengthens input handling rules for all commands. Fixes bug where `/ps:build` interpreted input as work request instead of prompt design requirement.

### Fixed

#### Input Handling Bug
- **Fixed** `/ps:build` interpreting file paths (e.g., `XXX.tsx`) as actual files to read
- **Fixed** potential issue where `/ps:lint` could attempt to read files mentioned in prompt text

### Added

#### CRITICAL Input Handling Sections
- **Added** CRITICAL section to `commands/build.md` with FORBIDDEN tools list
- **Added** CRITICAL section to `commands/lint.md` with FORBIDDEN tools list
- **Enhanced** Rules section in `commands/r.md` with explicit FORBIDDEN tools table
- **Enhanced** Rules section in `commands/a.md` with explicit FORBIDDEN tools table

#### Extended input-handling-rules.md
- **Added** BUILD Mode section with execution sequence and forbidden actions
- **Added** LINT Mode section with execution sequence and forbidden actions
- **Added** security reference link to [Claude Code Security](https://code.claude.com/docs/en/security)

#### SKILL.md Improvements
- **Updated** command table with clearer argument hints (`<개선할 프롬프트>`, `<진단할 프롬프트>`, `<프롬프트 요구사항>`)
- **Added** warning note: "모든 입력은 프롬프트 텍스트 또는 요구사항입니다. 파일 경로나 실행 명령이 아닙니다."

### Changed
- `commands/build.md`: argument-hint changed from `<requirements or goal>` to `<prompt requirements or goal>`
- `commands/lint.md`: argument-hint changed from `<prompt text>` to `<prompt text to diagnose>`

---

## [2.5.0] - 2026-01-07

### Summary
Prompt Smith v2.5.0 optimizes SKILL.md file size from 700+ lines to under 500 lines to meet Claude Code Skill recommended limit. Level 2 detailed content replaced with documentation links.

### Changed

#### SKILL.md Size Optimization
- **Reduced** ko SKILL.md from 748 to 444 lines (-304 lines, -41%)
- **Reduced** en SKILL.md from 745 to 445 lines (-300 lines, -40%)
- **Target achieved**: Both files now under 500 lines (Claude Code Skill recommended limit)

#### Level 2 Section Summarization
- **LINT Workflow**: 30-line diagram → 6-line table + link to `playbooks/lint/full-lint.md`
- **Diagnostic Report**: 70-line template → link to `templates/diagnostic-report.md`
- **BUILD Workflow**: 50-line diagram → 7-line table + link to `playbooks/build/build-mode.md`
- **BUILD Output**: 65-line template → link to `templates/build-report.md`
- **Intercept Pipeline**: 50-line detail → 15-line summary + links to `playbooks/intercept/`
- **Anti-patterns**: 9 items → 6 core items + link to `references/anti-patterns.md`

### Preserved
- **Level 1**: All trigger keywords and quick start content unchanged (~265 lines)
- **Level 3**: Reference links unchanged
- **Functionality**: All workflows accessible via documentation links
- **i18n parity**: ko/en files maintain structural consistency

### Validation
- All 7 documentation links verified to exist
- Trigger activation preserved in Level 1
- Rollback available via git

---

## [2.4.2] - 2026-01-07

### Summary
Prompt Smith v2.4.2 is a documentation quality patch. Version synchronization, `/ps:help` command table addition, English trigger table restructuring, frontmatter trigger enhancement, and security guide promotion.

### Fixed

#### Version Synchronization
- **Updated** SKILL.md (ko/en) frontmatter version from 2.4.0 to 2.4.2
- **Fixed** mode selection example version from v2.1 to v2.4.2
- **Synced** all version files (VERSION, plugin.json, marketplace.json)

#### English Trigger Table
- **Changed** table structure from `| Korean | English | Workflow |` to `| Intent/Keywords | Workflow |`
- **Fixed** column label mismatch (Korean column had English content)
- **Added** "prompt" prefix guidance for false activation prevention

### Added

#### `/ps:help` Command Documentation
- **Added** `/ps:help` row to slash command table (ko/en)
- **Added** `/ps:help` to frontmatter description for activation hints

#### Security Note in Level 1
- **Added** Security Note section after Activation Rules (ko/en)
- **Added** link to `references/input-handling-rules.md`

#### Frontmatter Improvements
- **Enhanced** description field with BUILD/INTERCEPT triggers
- **Changed** tags from string to YAML array format

---

## [2.4.1] - 2026-01-06

### Summary
Prompt Smith v2.4.1 is a documentation quality patch. Fixes template code fence nesting for better copy-paste UX, removes inconsistent version footers, and adds `/ps:help` to README command table.

### Fixed

#### Template Code Fence Nesting
- **Changed** outer wrapper code fences from 3 backticks to 4 backticks in all template files
- **Affected files** (KO + EN):
  - `templates/diagnostic-report.md`
  - `templates/build-report.md`
  - `templates/prompt-template.md`
  - `templates/state-checkpoint.md`
  - `templates/test-case-template.md`
- **Benefit**: Templates now render correctly and can be copy-pasted as single blocks

#### Version Footer Inconsistency
- **Removed** `*Prompt Smith vX.X.X*` footers from 12 files (were showing v2.3.0/v2.0.0)
- **Reasoning**: Footers caused version drift; SKILL.md frontmatter is now the single source of truth

### Added

#### README.md `/ps:help` Entry
- **Added** `/ps:help [topic]` row to "Commands at a Glance" table
- **Improves** discoverability for new users

#### BUILD Mode Empty Input Handling
- **Added** Step 0 to `commands/build.md` for empty input case
- **Provides** guided questions and examples when user runs `/ps:build` without arguments

---

## [2.4.0] - 2026-01-05

### Summary
Prompt Smith v2.4.0 focuses on release quality and developer experience. Fixes broken links, adds cross-platform tooling, strengthens CI, and introduces the `/ps:help` command for discoverability.

### Added

#### New Command: `/ps:help`
- **Help topics**: commands, lint, build, review, 7point
- **Quick reference**: Version, command list, recommended workflow
- **Scannable output**: Box-drawing headers, concise sections

#### Cross-Platform Scripts
- **`scripts/sync-version.py`**: Python-based version sync (replaces shell script)
  - Platform independent (macOS, Linux, Windows)
  - Syncs VERSION → plugin.json, marketplace.json, SKILL.md, i18n/en/SKILL.md
- **`scripts/package.sh`**: Clean packaging for releases
  - Excludes .git, __MACOSX, .DS_Store, .env files
  - Outputs tar.gz and zip archives

#### CI Enhancements
- **Forbidden artifacts check**: Blocks .DS_Store, __MACOSX, .env files
- **Internal link validation**: Detects broken markdown links in skills/
- **Extended version consistency**: Checks i18n/*/SKILL.md versions

#### Output Levels (LINT Mode)
- **Default**: Score + Top 3 issues + improved prompt (~800 tokens)
- **Express**: Score + one-line suggestion (~100 tokens)
- **Detail**: Full 7-Point + all changes + 5 test cases (~2000 tokens)

### Changed

#### i18n Policy Clarification
- **CONTRIBUTING.md**: Updated to "Korean Primary" policy
- **Triggers**: "프롬프트" prefix required (e.g., "프롬프트 만들어줘" instead of "만들어줘")
- **README.md**: Fixed Korean docs link → `skills/prompt-smith/SKILL.md`

#### Documentation Improvements
- **README.md**: Added "Commands at a Glance" table at top
- **quick-start.md**: Added allowlist configuration guide
- **commands/lint.md**: Fixed relative path for diagnostic-report template

### Fixed
- Broken link in README.md (i18n/ko/SKILL.md → SKILL.md)
- Broken link in commands/lint.md (templates/ → skills/prompt-smith/templates/)

---

## [2.3.0] - 2026-01-05

### Summary
Prompt Smith v2.3.0 is a major documentation cleanup release. All `/prompt-smith` command references are replaced with `/ps:r` and `/ps:a`. Removed undocumented options (`--verbose`, `--threshold`), added CI checks, and created shared input handling rules.

### Changed

#### Command Standardization
- **Replaced** all `/prompt-smith` → `/ps:r`, `/ps:a` across documentation
- **Updated** natural language trigger notes: Slash commands now recommended
- **Removed** undocumented options `--verbose`, `--threshold` from all files

#### Token Optimization
- **Simplified** DEBUG section in r.md: No longer duplicates improved prompt
- **Created** `references/input-handling-rules.md`: Shared rules for r.md and a.md

#### CI Automation
- **Added** `/prompt-smith` remnant check to `.github/workflows/lint.yml`
- **Added** SKILL.md size limit check (30KB max)

### Added

#### i18n English Documentation
- **New directory**: `i18n/en/` with full English translations
- Complete playbooks, references, templates mirrored from Korean primary
- Enables English-first users to access all documentation natively

### Fixed
- `quick-start.md`: Version v2.1.0 → v2.3.0
- Playbook examples now use `/ps:r` and `/ps:a` consistently

---

## [2.2.3] - 2026-01-03

### Summary
Prompt Smith v2.2.3 improves documentation consistency, adds API parameter optimization guide, and introduces Prompt Chaining playbook for complex multi-step workflows.

### Added

#### API Parameters Optimization Guide
- **New section in claude-4x-best-practices.md**: Temperature, max_tokens, stop_sequences recommendations
- Situation-specific settings: code generation (0.1-0.3), analysis (0.3-0.5), creative (0.8-1.0)
- Claude Code note: "CLAUDE.md rules provide bigger leverage than API parameters"

#### Prompt Chaining Playbook
- **New file**: `playbooks/prompt-chaining.md`
- Three chaining patterns: Sequential, Branching, Parallel
- State management with JSON checkpoint structure
- Error handling strategies: Retry, Fallback, Skip, Rollback, Abort
- Example: Document migration chain with 5 steps

### Fixed

#### Documentation Consistency
- Fixed "5-Point" → "7-Point" references in 6 locations across 5 files:
  - `references/anti-patterns.md`
  - `references/team-workflow.md`
  - `templates/prompt-template.md`
  - `templates/diagnostic-report.md`
  - `playbooks/lint-mode.md` (2 locations)

### Changed
- `references/claude-4x-best-practices.md`: Added Section 8 (API_PARAMETERS)
- Version bumped to 2.2.3 across all metadata files

---

## [2.2.2] - 2026-01-03

### Summary
Prompt Smith v2.2.2 simplifies input format for `/ps:r` and `/ps:a`. Backticks are now **optional** - plain text input is accepted directly.

### Changed

#### Input Format Simplification
- **Backticks optional**: `/ps:r Write a function` now works (no need for triple backticks)
- **Multiline support**: Plain multiline text accepted without code block wrapper
- **Documentation sync**: SKILL.md examples updated to show simpler format
- **Version metadata**: Synced with CHANGELOG

#### Updated Documentation
- `SKILL.md`: Removed backtick requirements from all examples
- `i18n/ko/SKILL.md`: Korean version synced with same changes

### Fixed
- Version mismatch between SKILL.md (2.2.0) and CHANGELOG.md (2.2.1)

---

## [2.2.1] - 2026-01-03

### Summary
Prompt Smith v2.2.1 adds strict tool call prevention for Review/Intercept modes. When `/ps:r` or `/ps:a` is invoked, Claude will now **always** perform Express LINT first, even if the input contains keywords like "웹검색", "파일 읽기", "search", "read file".

### Added

#### Strict Tool Call Prevention
- **FORBIDDEN tool list**: WebSearch, Read, Bash, Edit are blocked until LINT completes
- **Trigger keywords to ignore**: "검색", "파일", "최신", "search", "read", "execute", etc.
- **Execution Sequence enforcement**: No tools may be called between steps 1-5

#### Enhanced Anti-Patterns Documentation
- `review-mode.md`: Added "Bad Example 3: Tool calls before LINT"
- `intercept-mode.md`: Added new Anti-Patterns section with 2 examples

### Changed
- `commands/r.md`: CRITICAL section expanded (~60 lines) with explicit forbidden tools table
- `commands/a.md`: CRITICAL section expanded (~55 lines) with explicit forbidden tools table
- Step 1 in both commands now includes WARNING about semantic interpretation

### Fixed
- Issue where `/ps:r 최신 웹검색을 통해...` would trigger WebSearch before LINT
- Issue where `/ps:a 이 파일을 읽고...` would trigger Read before LINT

---

## [2.1.1] - 2026-01-03

### Summary
Prompt Smith v2.1.1 improves input parsing for Review/Intercept modes.

### Fixed

#### Multiline Prompt Support
- `/ps:r` and `/ps:a` now accept multiline prompts without requiring triple backticks
- Both formats now work:
  - `/ps:r Write a function` (single line)
  - `/ps:r Write a function\nthat parses JSON` (multiline)
  - `/ps:r ```prompt```` (code block - legacy)

#### Strict Prompt Treatment
- Added CRITICAL rule: Input to `/ps:r` and `/ps:a` is ALWAYS treated as a prompt to improve
- Prevents semantic interpretation (e.g., "fix this bug" → improves the prompt, doesn't fix bugs)
- Ensures consistent LINT → Improve → Execute workflow

### Changed
- `commands/r.md`: Updated parsing logic + added CRITICAL rule
- `commands/a.md`: Updated parsing logic + added CRITICAL rule
- `argument-hint` changed from ` ```<prompt>``` ` to `<prompt text>`

---

## [2.1.0] - 2026-01-02

### Summary
Prompt Smith v2.1.0 adds Intercept Pipeline for real-time prompt improvement and transitions to English Primary with i18n support.

### Added

#### Intercept Pipeline (New)
- **Review Mode**: `/prompt-smith <prompt>` - Show improvements, await user approval, then execute
- **Intercept Mode**: `/prompt-smith --auto <prompt>` - Auto-improve and execute immediately
- Options: `--threshold N` (minimum score improvement), `--verbose` (detailed analysis)

#### i18n Support
- English Primary documentation
- Korean translations in `i18n/ko/`
- Frontmatter i18n metadata

#### New Playbooks
- `playbooks/intercept/review-mode.md`: Review Mode detailed guide
- `playbooks/intercept/intercept-mode.md`: Intercept Mode detailed guide

### Changed
- All documentation translated to English Primary
- Korean versions moved to `i18n/ko/`
- README.md updated with bilingual sections
- SKILL.md frontmatter includes i18n metadata

### Repository Structure
- Migrated from `refs/prompt-smith/` to root
- Added `.github/workflows/lint.yml` for CI validation
- Added `CONTRIBUTING.md`
- Repository renamed to `prompt-smith`

---

## [2.0.0] - 2026-01-01

### Summary
Prompt Smith v2.0.0 메이저 업데이트. 7-Point Quality Check로 확장하고 BUILD Mode 추가.

### Breaking Changes
- 5-Point → 7-Point Quality Check 확장
  - 기존 5개 항목 유지
  - STATE_TRACKING, TOOL_USAGE 2개 항목 추가 (해당 시에만 평가)
- 점수 계산 방식 변경: `(원점수/적용항목×2) × 10`

### Added

#### 7-Point Quality Check
- **STATE_TRACKING**: 장기 태스크 상태 관리 평가
  - 적용 조건: 멀티스텝, 장기 작업, 다수 파일 처리
  - 체크포인트, 재개 방법, 진행률 표시 검증
- **TOOL_USAGE**: 도구 사용 지시 명확성 평가
  - 적용 조건: 파일/명령/API 사용 필요 시
  - 병렬/순차 전략, 에러 처리 검증

#### BUILD Mode (New)
- **7단계 워크플로우**: GATHER → CLASSIFY → DESIGN → DRAFT → SELF-LINT → TEST → DELIVER
- 요구사항 수집부터 프롬프트 설계까지 가이드
- 자체 LINT 검증으로 8점 이상 보장
- 테스트 케이스 5개 자동 생성

#### References
- `claude-4x-best-practices.md`: Claude 4.x 모델 최적화 가이드
  - 명시적 지시, 동기 제공, 예시 일치
  - 상태 관리, 병렬/순차 실행, 구조화된 출력
- `state-tracking-guide.md`: 상태 관리 상세 가이드 (Phase 4)
- `tool-usage-guide.md`: 도구 사용 상세 가이드 (Phase 4)

#### Onboarding (Phase 4)
- `quick-start.md`: 5분 시작 가이드
- `first-lint.md`: 첫 LINT 튜토리얼
- `first-build.md`: 첫 BUILD 튜토리얼

#### Playbooks 구조 개편 (Phase 3)
- `playbooks/lint/`: LINT 관련 파일 분리
- `playbooks/build/`: BUILD 관련 파일
- `playbooks/team/`: 팀 협업 관련 파일

### Changed
- `quality-checklist.md`: 5-Point → 7-Point 확장
- `prompt-template.md`: State Tracking, Tool Usage 섹션 추가
- `diagnostic-report.md`: 7-Point 점수표 반영
- `SKILL.md`: 7-Point + BUILD Mode 전체 업데이트

### Migration Notes
#### From v1.0.0 to v2.0.0
1. **점수 해석**: 기존 5-Point 프롬프트는 동일하게 평가됨 (N/A 항목 제외)
2. **새 항목 적용**: 멀티스텝/도구 사용 프롬프트만 STATE_TRACKING, TOOL_USAGE 평가
3. **BUILD Mode**: 새 프롬프트 작성 시 BUILD 트리거 사용 가능

---

## [1.0.0] - 2026-01-01

### Summary
Prompt Smith v1.0.0 출시. 프롬프트 품질관리를 위한 LINT 모드 제공.

### Added

#### LINT Mode (Core Feature)
- **5-Point Quality Check**: Role/Context/Instruction/Example/Format 기반 프롬프트 평가
- **진단 리포트**: 점수 + Top 3 이슈 + 개선안 + 테스트 케이스 포함
- **안티패턴 탐지**: 10가지 주요 안티패턴 자동 탐지
- **Express Mode**: 빠른 피드백을 위한 간소화된 진단

#### Playbooks
- `lint-mode.md`: LINT 워크플로우 상세 가이드

#### References
- `quality-checklist.md`: 5-Point Quality Check 상세 기준
- `anti-patterns.md`: 10가지 프롬프트 안티패턴 및 개선 방법
- `team-workflow.md`: Prompt PR 룰, 오너 제도, 버전 관리 가이드

#### Templates
- `prompt-template.md`: 5가지 유형별 프롬프트 작성 템플릿
- `test-case-template.md`: 테스트 케이스 작성 템플릿
- `diagnostic-report.md`: 진단 리포트 출력 템플릿

### Security
- 프롬프트 인젝션 방어 패턴 포함
- 인젝션 방어 테스트 케이스 필수화

### Documentation
- Level 1/2/3 Progressive Disclosure 구조
- Trigger Keywords 테이블
- 상세 예시 포함

---

## Roadmap

### [3.0.0] - Planned
- **DEBUG Mode**: Failure analysis + prevention rules
  - Failure classification system
  - Automatic defense rule generation
  - Regression test set enhancement

### [4.0.0] - Planned
- **Multi-platform Support**: Extended platform versions
- **Team Features**: Enhanced team collaboration
- **Prompt Registry**: Centralized prompt asset management

---

## Version Numbering

- **MAJOR**: 새로운 모드 추가 또는 호환성 변경
- **MINOR**: 기능 개선, 템플릿 추가
- **PATCH**: 버그 수정, 문구 개선

---

## Migration Notes

### From v0.x to v1.0.0
해당 없음 (초기 릴리즈)

---

## Contributors
- joseph0926 (maintainer)
