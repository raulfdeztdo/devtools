---
name: worktree-parallel-agents
description: >
  Git worktree management and parallel subagent orchestration for the devtools project.
  Use this skill when tasks can be parallelized across multiple files or features,
  when setting up git worktrees for isolated work, or when orchestrating subagents
  to work concurrently on independent units of work. Covers: worktree lifecycle,
  branch strategy, subagent delegation patterns, conflict resolution, and merge workflow.
---

# worktree-parallel-agents: Git Worktrees & Parallel Subagent Orchestration

Workflow for leveraging git worktrees and OpenCode subagents to parallelize development tasks in the devtools project. This enables multiple independent changes to be developed, tested, and merged concurrently without file conflicts.

## When to Use This Skill

- Adding **multiple tools** to the suite at the same time
- Performing **bulk i18n migration** across many views simultaneously
- Applying **cross-cutting changes** (e.g., accessibility audit fixes across all views)
- Any task that involves **3+ independent file changes** that don't conflict with each other
- When the user explicitly requests **parallel execution** or **worktree-based development**

## When NOT to Use This Skill

- Single-file changes or trivial edits
- Changes that have tight dependencies between files (e.g., shared state refactoring)
- When the project is NOT a git repository (worktrees require git)

---

## Prerequisites

### Git Repository Required

Worktrees require an initialized git repository with at least one commit.

```bash
# Initialize if needed
git init
git add -A
git commit -m "Initial commit"
```

### Verify Git Status

Before creating worktrees, ensure the working tree is clean:

```bash
git status
# Should show: nothing to commit, working tree clean
```

---

## Part 1: Git Worktree Lifecycle

### Concept

A git worktree is an additional working directory linked to the same repository. Each worktree has its own branch, index, and working files, but shares the git history. This allows:

- **Isolated development**: Each worktree has its own file state
- **No stashing needed**: Switch context without losing work
- **Parallel builds**: Run `npm run build` in each worktree independently
- **Safe experimentation**: Discard a worktree without affecting the main branch

### Create a Worktree

```bash
# Pattern: git worktree add <path> -b <branch-name>
git worktree add ../devtools-wt-feature-name -b feature/feature-name

# Examples for this project:
git worktree add ../devtools-wt-hash-tool -b feature/add-hash-tool
git worktree add ../devtools-wt-regex-tool -b feature/add-regex-tool
git worktree add ../devtools-wt-i18n-batch -b feature/i18n-batch-migration
```

**Naming conventions:**
- Worktree directory: `../devtools-wt-<short-name>`
- Branch name: `feature/<descriptive-name>`
- Keep the worktree directory **adjacent** to the main project (not nested inside it)

### Install Dependencies in Worktree

Each worktree needs its own `node_modules`:

```bash
cd ../devtools-wt-feature-name
npm install
```

### List Active Worktrees

```bash
git worktree list
# /Users/user/Desktop/devtools                   abc1234 [main]
# /Users/user/Desktop/devtools-wt-hash-tool      def5678 [feature/add-hash-tool]
# /Users/user/Desktop/devtools-wt-regex-tool     ghi9012 [feature/add-regex-tool]
```

### Verify Build in Worktree

```bash
cd ../devtools-wt-feature-name
npm run build
```

### Merge Worktree Back

```bash
# From the main working directory
cd /path/to/devtools
git merge feature/feature-name

# If there are conflicts, resolve them manually
# then: git add . && git commit
```

### Remove a Worktree

```bash
# After merging
git worktree remove ../devtools-wt-feature-name

# Force remove if not merged (discards work)
git worktree remove --force ../devtools-wt-feature-name

# Clean up stale worktree references
git worktree prune
```

---

## Part 2: Parallel Subagent Orchestration

### Architecture

OpenCode supports two types of subagents:

| Agent Type | Name | Purpose | Tools |
|-----------|------|---------|-------|
| Subagent | `general` | Full-access agent for multi-step tasks | All tools (read, write, edit, bash, etc.) |
| Subagent | `explore` | Read-only agent for codebase research | Read-only tools (read, grep, glob) |

The primary agent (Build) orchestrates subagents via the **Task tool**, which launches independent agent sessions that can run in parallel.

### Delegation Patterns

#### Pattern 1: Research Phase (Parallel Explore)

Before making changes, gather context from multiple locations simultaneously:

```
Launch 3 explore subagents in parallel:
1. "Find all route definitions in main.js and navigation in App.vue"
2. "Analyze the Home.vue bento grid structure and card patterns"
3. "Check i18n key structure in es.json and en.json for existing tools"
```

**Key rule:** Use `explore` for research, `general` for changes.

#### Pattern 2: Independent Feature Development (Parallel General)

When adding multiple tools that don't share files:

```
Launch 2 general subagents in parallel:
1. "Create src/views/HashGenerator.vue following the add-tool skill template.
    Include: MD5, SHA-1, SHA-256, SHA-512 hashing using Web Crypto API.
    Use the text-processor pattern (input left, output right).
    Use useI18n() with t() for all strings.
    Do NOT modify main.js, App.vue, or Home.vue."

2. "Create src/views/RegexTester.vue following the add-tool skill template.
    Include: regex input, test string, match highlighting, flags.
    Use the validator pattern (input + results).
    Use useI18n() with t() for all strings.
    Do NOT modify main.js, App.vue, or Home.vue."
```

**Critical rule:** Subagents working in parallel MUST NOT modify the same files. Shared files (main.js, App.vue, Home.vue, locale JSONs) are updated by the primary agent AFTER subagent tasks complete.

#### Pattern 3: Bulk i18n Migration (Parallel General)

Migrate multiple views simultaneously:

```
Launch 4 general subagents in parallel:
1. "Migrate all hardcoded strings in src/views/ToolA.vue to use t() calls.
    Add keys under 'tools.toolA' namespace. Return the list of new keys added."
2. "Migrate all hardcoded strings in src/views/ToolB.vue to use t() calls.
    Add keys under 'tools.toolB' namespace. Return the list of new keys added."
3. "Migrate all hardcoded strings in src/views/ToolC.vue to use t() calls.
    Add keys under 'tools.toolC' namespace. Return the list of new keys added."
4. "Migrate all hardcoded strings in src/views/ToolD.vue to use t() calls.
    Add keys under 'tools.toolD' namespace. Return the list of new keys added."
```

**Then the primary agent** collects all new keys and updates `es.json` and `en.json` in a single pass.

#### Pattern 4: Cross-Cutting Audit (Parallel Explore + Sequential General)

1. **Phase 1 (parallel explore):** Audit all views for accessibility issues
2. **Phase 2 (sequential general):** Fix issues one view at a time (since fixes may follow patterns established by earlier fixes)

### Subagent Communication Rules

1. **Subagents cannot see each other's output** — they operate independently
2. **The primary agent is the orchestrator** — it collects results and coordinates
3. **Each subagent prompt must be self-contained** — include ALL context needed
4. **Specify exact files** — tell subagents which files to read/modify
5. **Specify what NOT to touch** — prevent conflicts explicitly
6. **Request structured output** — ask subagents to return lists, key-value pairs, or summaries

### Conflict Prevention

| Scenario | Risk | Mitigation |
|----------|------|------------|
| Two agents editing same `.vue` file | HIGH | Never assign same file to multiple agents |
| Two agents adding i18n keys to same JSON | HIGH | Agents return keys; primary agent merges |
| Two agents editing `main.js` | HIGH | Only primary agent edits shared files |
| Two agents reading same files | NONE | Read-only operations are always safe |
| Agent A depends on Agent B's output | MEDIUM | Run sequentially, not in parallel |

---

## Part 3: Worktrees + Subagents Combined

For maximum isolation, combine git worktrees with subagent delegation:

### Workflow

1. **Primary agent** creates worktrees for each feature branch
2. **Primary agent** launches subagents with `workdir` pointing to each worktree
3. Each **subagent** works in its own worktree (complete file isolation)
4. **Primary agent** merges branches back to main
5. **Primary agent** resolves any merge conflicts
6. **Primary agent** removes worktrees

### Example: Adding 3 Tools in Parallel

```bash
# Step 1: Primary agent creates worktrees
git worktree add ../devtools-wt-hash -b feature/hash-generator
git worktree add ../devtools-wt-regex -b feature/regex-tester
git worktree add ../devtools-wt-jwt -b feature/jwt-decoder

# Step 2: Install deps in each (can be parallelized)
(cd ../devtools-wt-hash && npm install) &
(cd ../devtools-wt-regex && npm install) &
(cd ../devtools-wt-jwt && npm install) &
wait
```

```
# Step 3: Launch 3 general subagents in parallel
# Each subagent works in its own worktree directory and can modify ALL files
# (including main.js, App.vue, Home.vue) because there are no conflicts

Subagent 1 (workdir: ../devtools-wt-hash):
  "Follow the add-tool skill to add a Hash Generator tool.
   Create the view, update main.js, App.vue, Home.vue, and i18n files.
   Run npm run build to verify."

Subagent 2 (workdir: ../devtools-wt-regex):
  "Follow the add-tool skill to add a Regex Tester tool.
   Create the view, update main.js, App.vue, Home.vue, and i18n files.
   Run npm run build to verify."

Subagent 3 (workdir: ../devtools-wt-jwt):
  "Follow the add-tool skill to add a JWT Decoder tool.
   Create the view, update main.js, App.vue, Home.vue, and i18n files.
   Run npm run build to verify."
```

```bash
# Step 4: Primary agent merges back (sequentially)
git merge feature/hash-generator
git merge feature/regex-tester      # May need conflict resolution
git merge feature/jwt-decoder       # May need conflict resolution

# Step 5: Resolve conflicts in shared files (main.js, App.vue, Home.vue, i18n)
# This is expected and normal — the primary agent handles it

# Step 6: Final build verification
npm run build

# Step 7: Clean up worktrees
git worktree remove ../devtools-wt-hash
git worktree remove ../devtools-wt-regex
git worktree remove ../devtools-wt-jwt
git worktree prune
```

---

## Part 4: Context7 MCP Integration

This project has Context7 configured as a remote MCP server. When subagents need to look up library documentation:

### Usage in Subagent Prompts

```
"Create src/views/HashGenerator.vue using the Web Crypto API.
 If you need to look up vue-i18n usage patterns, use context7 tools.
 If you need to verify Tailwind CSS class names, use context7 tools."
```

### When to Use Context7

- Looking up **vue-i18n** API (useI18n, t(), pluralization, interpolation)
- Looking up **Vue 3** Composition API patterns (ref, computed, watch, lifecycle)
- Looking up **Tailwind CSS** utility classes and responsive design patterns
- Looking up **Vite** configuration options
- Looking up **AJV** schema validation API
- Looking up **lucide-vue-next** icon names and usage

### When NOT to Use Context7

- For project-specific patterns — read the actual source files instead
- For information already in AGENTS.md, non-negotiable.md, or architecture.md
- For simple questions that don't need documentation lookup

---

## Quick Reference

### Worktree Commands

| Command | Purpose |
|---------|---------|
| `git worktree add <path> -b <branch>` | Create new worktree with branch |
| `git worktree list` | List all worktrees |
| `git worktree remove <path>` | Remove a worktree |
| `git worktree remove --force <path>` | Force remove (discards changes) |
| `git worktree prune` | Clean up stale references |

### Subagent Task Tool Parameters

| Parameter | Purpose |
|-----------|---------|
| `description` | Short (3-5 word) task label |
| `prompt` | Detailed instructions for the subagent |
| `subagent_type` | `"general"` (read-write) or `"explore"` (read-only) |
| `task_id` | Resume a previous subagent session |

### Parallelization Decision Tree

```
Is the task a single file change?
  YES → Do it directly. No parallelization needed.
  NO  → Are the changes in independent files?
    YES → Can the files be grouped into non-overlapping sets?
      YES → Launch parallel subagents (one per group)
      NO  → Use worktrees for full isolation
    NO  → Execute sequentially
```

### Maximum Parallel Subagents

- **Recommended:** 2-4 parallel subagents for optimal throughput
- **Maximum:** 6 subagents (diminishing returns beyond this)
- **With worktrees:** Limited by disk space and `npm install` time

---

## Troubleshooting

### "fatal: not a git repository"
Initialize git first: `git init && git add -A && git commit -m "Initial commit"`

### Worktree branch already exists
Use an existing branch: `git worktree add <path> <existing-branch>` (no `-b` flag)

### Merge conflicts in shared files
This is expected when merging parallel worktrees. Resolve manually by combining the additions from each branch in:
- `main.js`: Merge import statements and route entries
- `App.vue`: Merge `tools` array entries
- `Home.vue`: Merge bento grid cards and tools array
- `es.json` / `en.json`: Merge i18n key blocks

### Subagent times out
Break the task into smaller units. If a subagent is doing too much, split it into 2 smaller tasks.

### Subagent modifies wrong files
Always specify in the prompt: "Only modify files X, Y, Z. Do NOT touch A, B, C."
