# Code archaeology: vista previa de pedidos

## Contexto del negocio

ShopFlow tiene un servicio de Node.js que construye la vista previa de un pedido antes de mostrarla en el checkout. Cada petición combina datos del cliente, productos, precios y una evaluación de riesgo. También registra un pequeño evento de auditoría para observabilidad y soporte.

La aplicación corre como un proceso de larga duración y recibe tráfico continuo desde varias instancias del frontend. Para este ejercicio, el tráfico se simula mediante una carga local repetida sobre el mismo proceso.

## Síntoma reportado

La aplicación funciona correctamente al principio, pero después de procesar muchas peticiones el consumo de memoria aumenta de forma gradual. En ejecuciones largas, el tiempo de respuesta también empeora y el proceso termina necesitando reiniciarse con más frecuencia de la esperada.

## Cómo instalar y ejecutar

Requiere Node.js 22 o superior.

```bash
cd exercises/02-memory-archaeology
npm install
npm start
```

Para elegir el número de peticiones de la carga:

```bash
npm run load -- 5000
```

## Cómo ejecutar los tests

```bash
npm test
```
