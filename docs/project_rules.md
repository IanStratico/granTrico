# Project Rules – MVP Fantasy Rugby

Este documento define las reglas de implementación del proyecto.

El objetivo principal es **construir un MVP funcional lo más rápido posible**, evitando sobreingeniería.

Todas las decisiones técnicas deben priorizar:

1. simplicidad
2. velocidad de desarrollo
3. facilidad de deploy

---

# Regla principal

Este proyecto es un **MVP experimental**, no un sistema productivo.

Por lo tanto:

- preferir soluciones simples
- evitar complejidad innecesaria
- evitar arquitecturas avanzadas

Si hay múltiples opciones posibles, elegir **la más simple**.

---

# Stack esperado

El proyecto debe utilizar tecnologías simples y compatibles con Vercel.

Preferencias:

- Next.js
- React
- TypeScript
- Prisma ORM
- Base de datos simple compatible con Vercel
- Tailwind para estilos básicos

No introducir frameworks adicionales innecesarios.

---

# Arquitectura

El proyecto debe mantenerse **monolítico**.

No usar:

- microservicios
- arquitectura distribuida
- colas de mensajes
- event sourcing
- CQRS

Todo debe vivir dentro de la aplicación Next.js.

---

# Base de datos

La base de datos debe:

- tener un esquema simple
- usar Prisma
- tener seeds de ejemplo

No implementar:

- replicación
- caching complejo
- optimizaciones prematuras

---

# Autenticación

Autenticación simple.

Requisitos:

- login con email + password
- password almacenada con hash
- flag `is_admin` para distinguir admins

No implementar:

- email verification
- recuperación de contraseña
- OAuth
- proveedores externos

---

# UI

La interfaz debe ser:

- simple
- funcional
- clara

No dedicar tiempo a:

- diseño complejo
- animaciones
- optimizaciones visuales avanzadas

El objetivo es validar el producto, no el diseño.

---

# Datos de prueba

El proyecto debe incluir **seed data** para poder probar fácilmente:

- jugadores
- temporada
- fechas
- usuarios
- convocados

Esto permite probar el flujo completo sin cargar datos manualmente.

---

# Desarrollo

El proyecto debe mantenerse siempre en estado **ejecutable**.

Implementar en etapas pequeñas:

1. setup proyecto
2. base de datos
3. seeds
4. auth
5. admin
6. armado de equipo
7. scoring
8. rankings

No implementar múltiples features al mismo tiempo.

---

# Validaciones

Las reglas del juego deben validarse en backend:

- 15 jugadores exactos
- máximo 8 forwards
- máximo 7 backs
- máximo 4 por plantel
- 1 capitán

Si las reglas no se cumplen, el equipo no debe poder confirmarse.

---

# Qué hacer si algo no está definido

Si una decisión **no está definida en el spec**:

- elegir la opción más simple
- documentarla brevemente
- continuar implementación

No bloquear el desarrollo por detalles menores.

---

# Qué evitar

No agregar:

- features no solicitadas
- optimizaciones prematuras
- configuraciones complejas
- infraestructura innecesaria

El objetivo es **validar el juego**, no construir el sistema final.

---

# Criterio de éxito

El proyecto es exitoso si:

- se puede deployar en Vercel
- admin puede cargar datos
- usuarios pueden armar equipos
- se calculan puntajes
- se muestran rankings
