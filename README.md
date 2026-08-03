# Node Senior Challenges

Repositorio de práctica avanzada de Node.js para entrevistas técnicas senior y
escenarios cercanos al trabajo real. Cada ejercicio plantea una API pequeña, una
especificación ejecutable y problemas de diseño relacionados con asincronía,
concurrencia, resiliencia, rendimiento y mantenibilidad.

La solución de cada reto vive aislada. La configuración y las utilidades realmente
reutilizables permanecen en la raíz para que incorporar ejercicios no duplique
infraestructura.

## Requisitos

- Node.js 22 o posterior (una versión LTS moderna)
- npm 10 o posterior

## Instalación y comandos

```bash
npm install
npm test                    # todas las suites, una sola ejecución
npm run test:watch          # todas las suites en modo interactivo
npm run test:message-queue  # solamente Message Queue
npm run typecheck           # TypeScript estricto, sin emitir archivos
npm run lint                # análisis estático
npm run format              # formatea el repositorio
```

Las pruebas son la especificación de los retos. En una copia recién creada es
normal que las del ejercicio todavía no resuelto fallen con `NotImplementedError`.

## Organización

```text
.
├── exercises/
│   └── message-queue/
│       ├── README.md
│       ├── src/             # API pública, tipos y código del candidato
│       └── tests/           # especificación aislada del ejercicio
├── shared/
│   └── test-utils/          # helpers agnósticos de cualquier ejercicio
├── eslint.config.js
├── prettier.config.js
├── tsconfig.json
└── vitest.config.ts
```

## Agregar un ejercicio

1. Crea `exercises/<nombre>/src`, `tests` y un `README.md` propio.
2. Expón la API pública desde `src/index.ts`; no importes internals de otros retos.
3. Coloca las pruebas como `tests/**/*.spec.ts`. Vitest las descubrirá desde la raíz.
4. Reutiliza `shared/test-utils` solo para utilidades genéricas. La lógica particular
   debe permanecer dentro del ejercicio.
5. Agrega un script `test:<nombre>` que apunte al directorio de pruebas y documenta
   cualquier decisión observable antes de exigirla en una expectativa.

No se requieren npm workspaces mientras todos los retos compartan el mismo stack y
no se publiquen como paquetes. Esta estructura permite añadirlos sin mezclar código
o pruebas y evita configuración por paquete que todavía no aporta valor.
