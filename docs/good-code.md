````md
# Clarity Over Abstraction

Write code for humans first.

Avoid creating unnecessary abstractions, helper functions, wrapper utilities, custom hooks, config layers, or variables when the logic is simple and only used once.

Prefer:

- straightforward code
- inline logic when readable
- descriptive naming
- fewer indirections
- local reasoning
- explicit flows

Do NOT:

- extract tiny one-line helpers prematurely
- create utils for single-use logic
- introduce generic abstractions “for future flexibility”
- split simple code across many files
- overuse constants for obvious literal values
- create layers that hide simple behavior
- optimize for theoretical reuse over present readability

Bad:

```ts
const createUserDisplayName = (user) => `${user.firstName} ${user.lastName}`;

const formattedName = createUserDisplayName(user);
```
````

Good:

```ts
const formattedName = `${user.firstName} ${user.lastName}`;
```

Bad:

```ts
const BUTTON_VARIANTS = {
  PRIMARY_BACKGROUND: "#2563eb",
};
```

Good:

```ts
backgroundColor: "#2563eb";
```

Extract code ONLY when it:

- meaningfully reduces duplication
- improves readability
- isolates complex business logic
- creates a genuinely reusable unit
- simplifies testing of important logic

A little duplication is better than harmful abstraction.

Prioritize:

1. Clarity
2. Readability
3. Maintainability
4. Simplicity
5. Abstraction (only when truly justified)

Code should feel easy to follow without jumping across multiple files or utilities.

```

```
