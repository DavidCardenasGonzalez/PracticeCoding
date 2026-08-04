import { useState } from 'react';

import {
  AsyncCombobox,
  type LoadOptions,
} from '../exercises/async-combobox/src/index.js';

interface Person {
  readonly id: string;
  readonly name: string;
  readonly team: string;
}

const people: ReadonlyArray<Person> = [
  { id: 'ada', name: 'Ada Lovelace', team: 'Platform' },
  { id: 'grace', name: 'Grace Hopper', team: 'Infrastructure' },
  { id: 'linus', name: 'Linus Torvalds', team: 'Kernel' },
  { id: 'margaret', name: 'Margaret Hamilton', team: 'Apollo' },
  { id: 'guido', name: 'Guido van Rossum', team: 'Developer Experience' },
  { id: 'katherine', name: 'Katherine Johnson', team: 'Navigation' },
];

const searchPeople: LoadOptions<Person> = async (query, { signal }) => {
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, 650);
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        reject(new DOMException('Request aborted', 'AbortError'));
      },
      { once: true },
    );
  });

  if (query.trim().toLowerCase() === 'error') {
    throw new Error('The demo service is unavailable');
  }

  const normalizedQuery = query.trim().toLowerCase();
  return people.filter((person) =>
    `${person.name} ${person.team}`.toLowerCase().includes(normalizedQuery),
  );
};

export function App() {
  const [assignee, setAssignee] = useState<Person | null>(null);

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">React senior challenge · playground</div>
        <h1>Async Combobox Lab</h1>
        <p>
          Experimenta con una búsqueda remota simulada: escribe, navega con el teclado y
          fuerza un error escribiendo <code>error</code>.
        </p>
      </section>

      <section className="lab-card" aria-labelledby="lab-title">
        <div className="card-heading">
          <div>
            <div className="eyebrow">Interactive surface</div>
            <h2 id="lab-title">Assign an owner</h2>
          </div>
          <span className="status-pill">650ms latency</span>
        </div>

        <AsyncCombobox<Person>
          label="Search people"
          placeholder="Try “Ada” or a team name"
          loadOptions={searchPeople}
          getOptionKey={(person) => person.id}
          getOptionLabel={(person) => person.name}
          value={assignee}
          onChange={setAssignee}
          minQueryLength={1}
          debounceMs={250}
          cacheTimeMs={10_000}
        />

        <div className="selection" aria-live="polite">
          <span className="selection-label">Current selection</span>
          <strong>
            {assignee ? `${assignee.name} · ${assignee.team}` : 'Nothing selected'}
          </strong>
        </div>
      </section>

      <section className="tips" aria-label="Keyboard tips">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> navigate
        </span>
        <span>
          <kbd>Enter</kbd> select
        </span>
        <span>
          <kbd>Esc</kbd> close
        </span>
      </section>
    </main>
  );
}
