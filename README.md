# Node Senior Challenges

An advanced Node.js practice repository for senior technical interviews and
real-world scenarios. Each exercise presents a focused API, an executable
specification, and design problems involving asynchrony, concurrency, resilience,
performance, and maintainability.

Each challenge implementation remains isolated. Shared configuration and genuinely
reusable utilities stay at the root, so adding challenges does not duplicate
infrastructure.

## Requirements

- Node.js 22 or later (a modern LTS release)
- npm 10 or later

## Installation and commands

```bash
npm install
npm test                    # run every suite once
npm run test:watch          # run every suite in watch mode
npm run test:message-queue  # run only Message Queue tests
npm run typecheck           # strict TypeScript checking without emitting files
npm run lint                # run static analysis
npm run format              # format the repository
```

Tests are the executable specification for each challenge. In a fresh checkout, it
is expected that tests for an unsolved exercise fail with `NotImplementedError`.

## Layout

```text
.
├── exercises/
│   └── message-queue/
│       ├── README.md
│       ├── src/             # public API, types, and candidate code
│       └── tests/           # isolated exercise specification
├── shared/
│   └── test-utils/          # exercise-agnostic helpers
├── eslint.config.js
├── prettier.config.js
├── tsconfig.json
└── vitest.config.ts
```

## Adding an exercise

1. Create `exercises/<name>/src`, `tests`, and its own `README.md`.
2. Export the public API from `src/index.ts`; do not import internals from another challenge.
3. Place tests under `tests/**/*.spec.ts`. Vitest discovers them from the root.
4. Reuse `shared/test-utils` only for generic utilities. Exercise-specific logic must stay in its exercise.
5. Add a `test:<name>` script that targets its test directory and document every observable decision before asserting it.

npm workspaces are unnecessary while challenges share one stack and are not published
as packages. This layout supports adding challenges without mixing code or tests and
avoids per-package configuration that does not yet add value.
