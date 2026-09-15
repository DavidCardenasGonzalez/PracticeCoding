# Code archaeology: exportación de auditoría

## Contexto del negocio

ShopFlow ofrece a los equipos de soporte y cumplimiento una exportación de eventos de auditoría. El proceso recibe una gran cantidad de eventos, los convierte a CSV y entrega un archivo comprimido para que pueda descargarse o enviarse a almacenamiento externo.

La exportación se ejecuta dentro de un worker de Node.js que comparte recursos con otras tareas del proceso. Los eventos pueden llegar de forma continua y el destino puede ser más lento que la fuente.

## Síntoma reportado

Las exportaciones pequeñas terminan correctamente, pero las grandes consumen demasiada memoria y el throughput se degrada. Durante ventanas de alta demanda, algunos workers se vuelven inestables o terminan reiniciándose antes de completar el archivo.

## Cómo instalar y ejecutar

Requiere Node.js 22 o superior.

```bash
cd exercises/03-streams-archaeology
npm install
npm start
```

Para cambiar el número de eventos:

```bash
npm run load -- 250000
```

El proceso muestra el uso de memoria y genera `audit-export.csv.gz` dentro de la carpeta del ejercicio.

## Cómo ejecutar los tests

```bash
npm test
```
