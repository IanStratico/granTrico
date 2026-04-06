# CLAUDE.md — GranTrico Fantasy Rugby

## Qué es este proyecto

GranTrico es un MVP de Fantasy Rugby para un club interno. Los usuarios arman equipos semanales eligiendo 15 jugadores del plantel convocado, designan un capitán y acumulan puntos según las estadísticas reales del partido. Está diseñado para deployar en Vercel con PostgreSQL.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js | 14.1.0 |
| UI | React | 18.2.0 |
| Lenguaje | TypeScript | 5.3.3 |
| Estilos | Tailwind CSS | 3.4.1 |
| Auth | NextAuth (beta) | 5.0.0-beta.19 |
| ORM | Prisma | 5.10.2 |
| Base de datos | PostgreSQL | — |
| Hashing | bcrypt | 5.1.1 |

---

## Estructura de carpetas

```
/
├── app/
│   ├── (admin)/admin/          # Páginas de administración (requieren isAdmin)
│   │   ├── fecha/[fechaId]/    # Gestión de una fecha específica
│   │   ├── fechas/             # Listado y creación de fechas
│   │   ├── jugadores/          # Importar/exportar jugadores (CSV)
│   │   ├── temporadas/         # Crear y activar temporadas
│   │   ├── usuarios/           # Gestión de roles de usuarios
│   │   └── estadisticas/[fechaId]/ # Carga manual de estadísticas
│   ├── (user)/                 # Páginas para usuarios autenticados
│   │   ├── equipo/             # Constructor de equipo
│   │   ├── ranking-fecha/      # Ranking semanal (listado)
│   │   ├── ranking-fecha/[fechaId]/ # Ranking de una fecha
│   │   └── tabla-general/      # Tabla de posiciones de la temporada
│   ├── (public)/login/         # Login público
│   ├── register/               # Registro público
│   ├── post-login/             # Redirección post-auth (admin→/admin, user→/equipo)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/       # POST: Registro de usuario
│   │   │   └── [...nextauth]/  # Handlers de NextAuth
│   │   ├── admin/
│   │   │   ├── temporadas/     # POST: Crear temporada
│   │   │   ├── temporadas/activar/ # POST: Activar temporada
│   │   │   ├── fechas/         # POST: Crear fecha
│   │   │   ├── fechas/update-estado/ # POST: Cambiar estado (PREVIA→CERRADA→PUNTUADA)
│   │   │   ├── jugadores/import/ # POST: CSV jugadores
│   │   │   ├── jugadores/export/ # GET: Descargar jugadores como CSV
│   │   │   ├── convocados/import/ # POST: CSV convocados de una fecha
│   │   │   ├── convocados/export/ # GET: Descargar convocados
│   │   │   ├── puntajes/import/ # POST: CSV estadísticas
│   │   │   ├── puntajes/export/ # GET: Descargar estadísticas
│   │   │   ├── stats/          # POST: Guardar stats con override
│   │   │   └── usuarios/update-role/ # POST: Toggle isAdmin
│   │   └── user/
│   │       └── team/           # POST: Guardar selección de equipo
│   ├── layout.tsx              # Root layout con SessionProvider
│   └── page.tsx                # Landing page
├── components/
│   ├── AppShell.tsx            # Layout wrapper: sidebar + topbar + drawer mobile
│   ├── Sidebar.tsx             # Navegación lateral
│   ├── LogoutButton.tsx        # Botón de logout
│   ├── FechaSwitcher.tsx       # Flechas para navegar entre fechas
│   ├── TeamBuilder.tsx         # Constructor de equipo (campo + selección)
│   ├── FieldView.tsx           # Visualización del campo con posiciones
│   ├── PlayerCard.tsx          # Tarjeta individual de jugador
│   ├── PlayerSelectModal.tsx   # Modal de selección de jugador (con búsqueda)
│   ├── StatsTableClient.tsx    # Tabla de carga de estadísticas (admin)
│   ├── RankingLayout.tsx       # Layout compartido de rankings
│   ├── ActivateTemporadaButton.tsx
│   ├── CreateTemporadaForm.tsx
│   ├── CreateFechaForm.tsx
│   ├── ImportButton.tsx
│   ├── ImportJugadoresForm.tsx
│   └── RoleButton.tsx
├── lib/
│   ├── auth.ts                 # Configuración de NextAuth (JWT, Credentials)
│   ├── prisma.ts               # Singleton de PrismaClient
│   ├── validation.ts           # Validación de plantel + cálculo de puntaje
│   ├── scoring.ts              # Recálculo de puntajes tras importar stats
│   ├── temporada.ts            # Obtener temporada activa
│   └── csv.ts                  # Parser CSV simple (split por líneas)
├── prisma/
│   ├── schema.prisma           # Esquema de BD
│   ├── seed.ts                 # Datos de prueba (usuarios, jugadores, fechas)
│   └── migrations/             # Migraciones de Prisma
├── types/
│   └── next-auth.d.ts          # Extensión de tipos de NextAuth (agrega id, isAdmin)
└── docs/
    ├── mvp-spec.md             # Especificación completa del MVP
    └── project_rules.md        # Reglas de desarrollo del proyecto
```

---

## Esquema de base de datos

### Modelos principales

**Usuario** — `id, nombre, email, passwordHash, isAdmin, createdAt`

**Temporada** — `id, nombre, activa, fechaInicio, fechaFin, createdAt`
- Solo una puede estar activa a la vez.

**Jugador** — `id, nombre, apellido, apodo, camada, posicion (FORWARD|BACK), activo, createdAt`

**Fecha** — `id, temporadaId, nro, rival, estado, cierraEdicionAt, createdAt`
- Estado: `PREVIA | CERRADA | PUNTUADA`
- Unique: `(temporadaId, nro)`

**JugadorFecha** — `id, jugadorId, fechaId, plantel, tries, tackles, knockOns, penales, amarillas, rojas, puntajeCalculado, puntajeOverride, updatedAt`
- Plantel: `PRIMERA | INTER | PRE_A | PRE_B | PRE_C | PRE_D`
- Unique: `(fechaId, jugadorId)`

**Equipo** — `id, usuarioId, temporadaId, nombre, createdAt`
- Unique: `(temporadaId, usuarioId)` — un equipo por usuario por temporada.

**EquipoFecha** — `id, equipoId, fechaId, puntajeTotal, capitanJugadorId, createdAt`
- Unique: `(equipoId, fechaId)`

**EquipoFechaJugador** — `id, equipoFechaId, jugadorId`
- Unique: `(equipoFechaId, jugadorId)`

---

## Algoritmo de puntuación

### Puntaje de jugador

```
puntaje = tries*10 + tackles - knockOns*2 - penales*2 - amarillas*5 - rojas*10
```

Si existe `puntajeOverride`, reemplaza al calculado.

### Puntaje de equipo

```
puntajeTotal = suma(puntaje de cada jugador) + puntaje del capitán
```

El capitán suma doble (su puntaje aparece dos veces: una en la suma general y otra adicional).

---

## Reglas de validación del equipo

- Exactamente **15 jugadores**
- Máximo **8 forwards**
- Máximo **7 backs**
- Máximo **4 jugadores del mismo plantel** (PRIMERA, INTER, PRE_A, etc.)
- Exactamente **1 capitán** elegido entre los 15 seleccionados

Implementado en `lib/validation.ts`.

---

## Flujo del juego

```
Admin crea Temporada → activa Temporada
→ Admin crea Fecha (estado: PREVIA)
→ Admin importa convocados (CSV: jugadorId, plantel)
→ Usuarios arman equipo (FieldView, 15 jugadores + capitán)
→ Admin cierra edición (estado: CERRADA)
→ Admin carga estadísticas (CSV o manual vía StatsTableClient)
→ Sistema recalcula puntajes (lib/scoring.ts)
→ Admin puntúa fecha (estado: PUNTUADA)
→ Rankings disponibles para todos
```

---

## Autenticación y autorización

- **Provider**: Credentials (email + password con bcrypt)
- **Estrategia**: JWT
- El JWT y la sesión incluyen `id` e `isAdmin` del usuario (extendidos en `types/next-auth.d.ts`)
- Las rutas `/api/admin/*` y `/(admin)/*` verifican `session.user.isAdmin === true`
- Las rutas `/(user)/*` verifican que exista `session.user`
- Post-login: `/post-login` redirige según rol

---

## Convenciones de código

- **Naming**: Modelos en español (Jugador, Fecha, Equipo), código en inglés/español mezclado
- **API routes**: Todas en `/app/api/`, patrón `route.ts` con funciones `GET`/`POST`
- **Componentes cliente**: Marcados con `"use client"` cuando usan hooks o estado
- **Componentes servidor**: Las páginas son Server Components por defecto (usan `await auth()` directamente)
- **Imports**: Alias `@/` configurado en tsconfig apuntando a la raíz
- **DB**: Singleton de Prisma en `lib/prisma.ts` para evitar múltiples conexiones en desarrollo
- **CSV**: Parsing manual simple (`lib/csv.ts`), sin librerías externas, no maneja escape de comas
- **Formación en campo**: Posiciones fijas hardcodeadas en `TeamBuilder.tsx`: `[[1,2,3],[4,5],[6,8,7],[9,10],[12,13],[11,15,14]]`

---

## Estado actual del desarrollo

El MVP está funcional y deployado. El flujo completo está implementado.

### Pendiente (según TODO.txt y docs)

- Pantalla explicativa de reglas/algoritmo
- Bug: modal de equipo en ranking muestra jugadores desordenados
- Mejoras de UI en tarjetas de equipo
- Fotos de jugadores
- Estadísticas visibles en modal de ranking
- Remover nombres placeholder grises en rankings
- Agregar estadísticas de patadas (metidas/erradas) al scoring
- Emoji 💩 para el último lugar
- Sub-capitán (multiplicador 1.5x)
- Power-ups (tackles x2, fichar jugador, bloquear tarjetas, sustituciones)
- Sistema de premios (mejor equipo, mejor jugador, premios de temporada)
- Integración de sponsors

### No implementado por scope de MVP

- Recuperación de contraseña
- Verificación de email
- Notificaciones en tiempo real
- Ligas/grupos privados
- Transferencias de jugadores

---

## Variables de entorno requeridas

```
DATABASE_URL=       # PostgreSQL connection string
NEXTAUTH_SECRET=    # Secret para JWT
NEXTAUTH_URL=       # URL base del app
```

---

## Comandos útiles

```bash
npx prisma migrate dev    # Aplicar migraciones en desarrollo
npx prisma db seed        # Cargar datos de prueba
npx prisma studio         # UI para explorar la BD
npm run dev               # Servidor de desarrollo
npm run build             # Build de producción
```

Los datos de seed crean: 1 temporada activa, 2 fechas (PREVIA y PUNTUADA), 20 jugadores de prueba, 1 usuario admin (`admin@test.com`) y 1 usuario normal (`user@test.com`).
