## GitFlow Workflow

### Branching Strategy

**Main Branches:**

- `main` - Production-ready code only
- `develop` - Integration branch for features

**Supporting Branches:**

- `feature/*` - New features and enhancements (branch from `develop`)
- `bugfix/*` - Bug fixes (branch from `develop`)
- `hotfix/*` - Critical production fixes (branch from `main`)
- `release/*` - Release preparation (branch from `develop`)

### Agent Branching Rules

**✅ ALLOWED:**

- Create feature branches from `develop` (format: `feature/issue-{number}-{short-description}`)
- Create bugfix branches from `develop` (format: `bugfix/issue-{number}-{short-description}`)
- Commit code ONLY to feature/bugfix branches you created
- Push changes to your feature/bugfix branches

**❌ FORBIDDEN:**

- Direct commits to `main` branch
- Direct commits to `develop` branch
- Direct commits to `release/*` branches
- Direct commits to `hotfix/*` branches (unless specifically assigned)
- Commits to any branch you did not create for the current issue

### Pull Request Requirements

**After completing work, you MUST:**

1. **Auto-create Pull Request** with:

   - **Title Format:** `{Jira_Issue_Key} - {Jira_Issue_Title}` (example: `AAD-9 - Überschrift anpassen`)
   - **Base Branch:** `develop` (for features/bugfixes) or `main` (for hotfixes)
   - **Description:** Include:
     - Link to the original issue
     - Summary of changes
     - Testing performed
     - Screenshots/recordings if UI changes
     - Breaking changes (if any)
     - Migration steps (if needed)

2. **PR Checklist:**
   - [ ] All tests pass (`nx affected -t test`)
   - [ ] Test coverage meets 80% minimum threshold
   - [ ] Code follows Angular/TypeScript best practices
   - [ ] Bundle size within budgets (500kB warning, 1MB error)
   - [ ] No linting errors (`nx affected -t lint`)
   - [ ] Accessibility compliance verified
   - [ ] Documentation updated if needed

## Commit Message Convention

### Format

```
{gitmoji} [#{issue-number}] {Issue Title}

- {brief description of change 1}
- {brief description of change 2}
- {brief description of change 3}
```

### Gitmoji Reference

Use appropriate gitmoji to categorize your work:

| Gitmoji | Code                     | Description          | When to Use                                  |
| ------- | ------------------------ | -------------------- | -------------------------------------------- |
| ✨      | `:sparkles:`             | New feature          | Adding new functionality                     |
| 🐛      | `:bug:`                  | Bug fix              | Fixing a bug or issue                        |
| ♻️      | `:recycle:`              | Refactor             | Code restructuring without changing behavior |
| ⚡      | `:zap:`                  | Performance          | Performance improvements                     |
| 🎨      | `:art:`                  | Code style           | Formatting, structure improvements           |
| ✅      | `:white_check_mark:`     | Tests                | Adding or updating tests                     |
| 📝      | `:memo:`                 | Documentation        | Documentation changes                        |
| 🔧      | `:wrench:`               | Configuration        | Config file changes                          |
| 🚀      | `:rocket:`               | Deployment           | Deployment-related changes                   |
| 🔒      | `:lock:`                 | Security             | Security improvements                        |
| ♿      | `:wheelchair:`           | Accessibility        | Accessibility improvements                   |
| 🌐      | `:globe_with_meridians:` | Internationalization | i18n/l10n changes                            |
| 🚨      | `:rotating_light:`       | Linting              | Fixing linter warnings                       |
| 🔥      | `:fire:`                 | Removal              | Removing code or files                       |
| 🚧      | `:construction:`         | Work in progress     | Incomplete work (avoid in main commits)      |
| 💚      | `:green_heart:`          | CI/CD                | CI/CD fixes                                  |
| ⬆️      | `:arrow_up:`             | Dependencies         | Dependency upgrades                          |
| ⬇️      | `:arrow_down:`           | Dependencies         | Dependency downgrades                        |
| 📦      | `:package:`              | Build                | Build system changes                         |
| 👷      | `:construction_worker:`  | Build system         | CI build system updates                      |

### Commit Examples

**Feature:**

```
✨ [#42] Add user profile management feature

- Create UserProfileComponent with signal-based state management
- Implement profile editing form with reactive forms
- Add profile avatar upload with NgOptimizedImage
- Create ProfileService with inject() pattern
- Add comprehensive unit tests (87% coverage)
```

**Bug Fix:**

```
🐛 [#38] Fix counter not resetting on navigation

- Update CounterPageComponent to use OnDestroy lifecycle hook
- Reset counter signal when component is destroyed
- Add test for reset behavior
- Fix memory leak in subscription handling
```

**Refactor:**

```
♻️ [#51] Refactor authentication to use signals

- Convert AuthService from BehaviorSubject to signals
- Update components to use computed() for derived auth state
- Replace @Input/@Output with input()/output() functions
- Remove unnecessary ngOnInit methods
- Update tests to reflect signal-based implementation
```
