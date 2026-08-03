# Message Queue en memoria

Implementa `MessageQueue`, una cola de mensajes en memoria con topics, consumidores
competitivos, prioridades, concurrencia limitada, reintentos y Dead Letter Queue
(DLQ). El objetivo no es imitar un producto concreto, sino razonar sobre estado
asíncrono, ownership de mensajes, carreras y cierre ordenado sin servicios externos.

Los archivos de `src` contienen el contrato compilable, pero sus métodos son stubs.
Las pruebas son la especificación ejecutable y deben pasar sin modificarlas.

## API pública

```ts
interface Message<T = unknown> {
  readonly id: string;
  readonly topic: string;
  readonly payload: T;
  readonly priority: number;
  readonly attempts: number;
  readonly createdAt: Date;
}

interface PublishOptions {
  priority?: number;
}

interface SubscribeOptions {
  concurrency?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

type MessageHandler<T = unknown> = (
  message: Message<T>,
  context: { ack(): void; nack(error?: Error): void },
) => void | Promise<void>;

class MessageQueue {
  createTopic(topic: string): void;
  deleteTopic(topic: string): void;
  publish<T>(topic: string, payload: T, options?: PublishOptions): string;
  subscribe<T>(
    topic: string,
    handler: MessageHandler<T>,
    options?: SubscribeOptions,
  ): () => void;
  getQueueSize(topic: string): number;
  getDeadLetterMessages(topic: string): ReadonlyArray<Message>;
  shutdown(): Promise<void>;
}
```

Los tipos y errores exportados por `src/index.ts` forman parte de la API pública.

## Reglas funcionales

### Topics y publicación

- Un nombre tiene entre 1 y 64 caracteres y cumple
  `^[a-z0-9]+(?:[._-][a-z0-9]+)*$`. Es decir: minúsculas ASCII, números y
  separadores simples (`.`, `_`, `-`) no consecutivos ni en los extremos.
- Crear un topic repetido lanza `TopicAlreadyExistsError`. Toda operación que exige
  un topic existente lanza `TopicNotFoundError` cuando no existe.
- Solo se puede eliminar un topic sin mensajes pendientes ni en vuelo. En otro caso
  se lanza `TopicNotEmptyError` y el topic permanece intacto. Al eliminarlo se
  cancelan sus suscripciones; volver a usar el mismo nombre crea un topic nuevo.
- `priority` es un entero entre 0 y 10, ambos incluidos; su valor predeterminado es 0. Una opción inválida lanza `InvalidPublishOptionsError`.
- Cada publicación retorna un ID no vacío y único dentro de esa instancia.
  `createdAt` representa el momento de publicación y el payload conserva identidad.
- Los mensajes elegibles con mayor prioridad se entregan primero. Entre mensajes de
  igual prioridad se conserva FIFO. El despacho debe comenzar en una tarea asíncrona,
  por lo que una ráfaga síncrona puede ordenarse antes de empezar a consumirse.

### Suscripciones y concurrencia

- `concurrency` es un entero mayor o igual a 1 (predeterminado: 1), `maxRetries` es
  un entero mayor o igual a 0 (predeterminado: 3) y `retryDelayMs` es un número finito
  mayor o igual a 0 (predeterminado: 0). Valores inválidos lanzan
  `InvalidSubscribeOptionsError`.
- Las suscripciones de un topic son consumidores competitivos, no pub/sub: cada
  mensaje se asigna a exactamente una suscripción y nunca a dos al mismo tiempo.
- El límite de concurrencia es por suscripción. Una suscripción saturada no impide
  que otra con capacidad reciba trabajo. No se exige un algoritmo concreto de
  reparto ni garantías contra starvation.
- La función retornada por `subscribe` cancela esa suscripción de forma idempotente.
  Sus handlers activos pueden finalizar, pero no recibe nuevas entregas.

### ACK, NACK y reintentos

- Un mensaje está en vuelo hasta resolverse mediante `ack()` o `nack()`.
- `ack()` confirma y elimina el mensaje. `nack(error)` marca el intento como fallido.
- Si el handler lanza o retorna una promesa rechazada, equivale a `nack(error)`.
- Si el handler termina correctamente sin invocar ninguno, equivale a `nack()`; el
  ACK es deliberadamente explícito.
- La primera señal terminal gana. Llamadas posteriores a `ack`/`nack`, o una
  excepción posterior a un ACK, no cambian el resultado ni lanzan.
- `attempts` empieza en 0 y aumenta una vez por cada entrega fallida. `maxRetries`
  indica reintentos **adicionales**: con valor 2 hay como máximo tres entregas y el
  mensaje entra a DLQ con `attempts === 3` si todas fallan.
- Cada reintento solo vuelve a ser elegible tras `retryDelayMs`. Mientras espera,
  conserva ID, topic, payload, prioridad y `createdAt`, cuenta como pendiente para
  `getQueueSize` y no bloquea otros mensajes.

### DLQ, estado y shutdown

- La DLQ es independiente por topic, conserva el orden de entrada y no se consume
  automáticamente. `getDeadLetterMessages` entrega una instantánea: alterar el array
  retornado no puede modificar el estado de la cola.
- `getQueueSize` cuenta mensajes listos o esperando retry; excluye mensajes en vuelo
  y en DLQ.
- `shutdown()` impide inmediatamente nuevas publicaciones, suscripciones y entregas,
  y espera los handlers que ya están activos. Las publicaciones posteriores lanzan
  `QueueShutdownError`.
- Los timers de retry se cancelan al cerrar; esos mensajes siguen contabilizados como
  pendientes y ya no se entregan. Consultas de tamaño y DLQ siguen disponibles.
- Llamar `shutdown()` varias veces es seguro y espera el mismo proceso de cierre. No
  deben quedar timers, listeners ni rechazos de promesas sin manejar.

## Casos límite importantes

- Publicaciones previas a una suscripción se conservan.
- Un NACK no permite entregar simultáneamente dos copias del mismo mensaje.
- El retraso de un retry no bloquea mensajes posteriores.
- ACK y NACK consecutivos, cancelación durante un handler y cierre durante trabajo
  activo deben ser seguros.
- Una carga rápida de mensajes y varios consumidores no puede perder ni duplicar IDs.

## Ejemplo mínimo

```ts
import { MessageQueue } from './src/index.js';

const queue = new MessageQueue();
queue.createTopic('email.transactional');

const unsubscribe = queue.subscribe<{ to: string }>(
  'email.transactional',
  async (message, { ack, nack }) => {
    try {
      await sendEmail(message.payload.to);
      ack();
    } catch (error) {
      nack(error instanceof Error ? error : new Error('Unknown error'));
    }
  },
  { concurrency: 4, maxRetries: 2, retryDelayMs: 100 },
);

queue.publish('email.transactional', { to: 'dev@example.com' }, { priority: 5 });

unsubscribe();
await queue.shutdown();
```

## Restricciones y criterios de evaluación

- Todo ocurre en memoria y en un único proceso de Node.js.
- No agregues brokers, bases de datos, frameworks web ni dependencias de runtime.
- Puedes crear módulos internos, pero mantén intacta la API pública y no modifiques
  las pruebas para acomodar la solución.
- Se evalúan corrección observable, ausencia de pérdidas o entregas duplicadas,
  control de concurrencia, tratamiento de carreras, timers liberados, manejo de
  errores, legibilidad y separación de responsabilidades.
- No se exige persistencia, entrega entre procesos, orden global entre topics,
  cancelación forzosa de handlers ni garantías distribuidas de exactly-once.
