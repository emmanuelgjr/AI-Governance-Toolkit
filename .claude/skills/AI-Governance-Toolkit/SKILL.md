```markdown
# AI-Governance-Toolkit Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the development conventions and patterns used in the **AI-Governance-Toolkit** repository, a TypeScript project built with the Astro framework. You'll learn how to structure files, write imports/exports, follow commit message standards, and organize tests in this codebase.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `dataFetcher.ts`

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```typescript
    import { fetchData } from './dataFetcher';
    ```

### Export Style
- Use **named exports**.
  - Example:
    ```typescript
    // In userProfile.ts
    export function getUserProfile(id: string) { ... }
    ```

### Commit Messages
- Follow the **Conventional Commits** format.
- Use the `feat` prefix for new features.
- Keep commit messages concise (average ~24 characters).
  - Example:
    ```
    feat: add user profile page
    ```

## Workflows

_No explicit workflows detected in the repository._

## Testing Patterns

- **Test File Pattern:** Test files use the `*.test.*` naming convention.
  - Example: `userProfile.test.ts`
- **Testing Framework:** Not explicitly detected; check project dependencies for specifics.
- **Test Example:**
  ```typescript
  // userProfile.test.ts
  import { getUserProfile } from './userProfile';

  test('returns correct profile', () => {
    expect(getUserProfile('123')).toEqual({ id: '123', name: 'Alice' });
  });
  ```

## Commands

| Command     | Purpose                                  |
|-------------|------------------------------------------|
| /commit     | Create a commit following conventions    |
| /test       | Run all test files (*.test.*)            |
| /import     | Add a relative import to a file          |
| /export     | Add a named export to a module           |
```
