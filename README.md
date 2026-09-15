# Senior TypeScript Challenges

An advanced TypeScript, Node.js, and React practice repository for senior technical
interviews and real-world scenarios. Each exercise presents a focused API, an executable
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
npm run dev                 # open the visual playground at http://localhost:5173
npm run build               # validate the production bundle
npm test                    # run every suite once
npm run test:watch          # run every suite in watch mode
npm run test:message-queue  # run only Message Queue tests
npm run test:react          # run only Async Combobox tests
npm run test:react:watch    # solve the React challenge with fast feedback
npm run test:algorithms:maps # practice Map and frequency-map problems
npm run test:algorithms:two-pointers # practice two-pointer problems
npm run test:algorithms:sliding-window # practice sliding-window problems
npm run test:algorithms:stack-and-queue # practice stack and queue problems
npm run test:algorithms:interview-sprint # run the mixed interview warm-up
npm run typecheck           # strict TypeScript checking without emitting files
npm run lint                # run static analysis
npm run format              # format the repository
```

Tests are the executable specification for each challenge. In a fresh checkout, an
unsolved exercise is expected to fail its behavioral assertions.

## Layout

```text
.
├── exercises/
│   ├── algorithms/          # progressive algorithm and data-structure practice
│   ├── async-combobox/      # advanced React 19 challenge
│   │   ├── README.md
│   │   ├── src/             # public API, types, and candidate code
│   │   └── tests/           # jsdom + Testing Library specification
│   └── message-queue/
│       ├── README.md
│       ├── src/
│       └── tests/
├── shared/
│   └── test-utils/          # exercise-agnostic helpers
├── playground/              # local visual app for the React challenge
├── index.html
├── vite.config.ts
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
