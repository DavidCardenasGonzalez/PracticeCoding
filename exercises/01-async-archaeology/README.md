# Code archaeology: revisión de carrito

## 1. Contexto del negocio

ShopFlow tiene un endpoint que prepara la pantalla de revisión del carrito antes de que una persona confirme su compra. Para construirla, el servicio combina información del carrito con datos de catálogo, precios, inventario, impuestos y recomendaciones provenientes de servicios internos independientes.

El equipo de producto quiere que esta pantalla siga siendo útil aunque una capacidad secundaria no esté disponible. El servicio se ejecuta en varias réplicas y recibe tráfico variable durante campañas y ventanas de alta demanda.

## 2. Síntoma reportado por usuarios o por el equipo

Se han recibido reportes de tiempos de respuesta altos en carritos con varios productos. 

También se observan respuestas inconsistentes durante picos de tráfico y casos en los que la pantalla completa no carga, aunque el carrito y sus datos principales parecen estar disponibles.

## 3. Cómo instalar y ejecutar el proyecto

Requiere Node.js 22 o superior.

```bash
cd exercises/01-async-archaeology
npm install
npm start
```

## 4. Cómo ejecutar los tests

Desde la carpeta del ejercicio:

```bash
npm test
```
