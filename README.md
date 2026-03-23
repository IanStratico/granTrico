# Fantasy Rugby – MVP

Este repositorio contiene un **MVP de un fantasy rugby interno para un club**.

La aplicación permite:

- crear equipos de fantasy
- elegir jugadores convocados en cada fecha
- asignar capitán
- calcular puntajes según estadísticas
- mostrar ranking por fecha y ranking acumulado

El objetivo del proyecto es **validar la idea rápidamente**, por lo que se prioriza simplicidad y velocidad de desarrollo.

---

# Documentación

Las especificaciones del proyecto están en:

docs/mvp-spec.md

Las reglas técnicas de implementación están en:

docs/project_rules.md

---

# Stack

Este proyecto utiliza:

- Next.js
- React
- TypeScript
- Prisma
- Base de datos simple compatible con Vercel

---

# Setup local

Instalar dependencias:

```
npm install
```

Iniciar servidor de desarrollo:

```
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:3000
```

---

# Base de datos

Generar cliente Prisma:

```
npx prisma generate
```

Aplicar migraciones:

```
npx prisma migrate dev
```

---

# Seeds

Para cargar datos de ejemplo:

```
npx prisma db seed
```

Los seeds incluyen:

- usuarios
- jugadores
- temporada
- fechas
- convocados

Esto permite probar el flujo completo del juego.

---

# Deploy en Vercel

1. Conectar el repositorio a Vercel.
2. Configurar variables de entorno si fueran necesarias.
3. Deploy automático desde la rama principal.

---

# Estado del proyecto

Este proyecto es un **MVP experimental**.

No incluye:

- recuperación de contraseña
- notificaciones
- features sociales
- optimizaciones avanzadas

El objetivo es validar el juego antes de construir una versión más compleja.
