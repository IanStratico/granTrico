# PRD + Plan de implementación — Selección de jugadores por posición específica

**Owner:** Agustín Arone (jugador / colaborador de producto)
**Estado:** Shaping
**Última actualización:** 2026-04-23

---

## Problema

Los jugadores del fantasy del club arman su equipo durante la etapa PREVIA de cada fecha. Hoy el sistema solo distingue entre FORWARD y BACK, sin importar qué posición específica juega cada convocado.

- **Quién lo siente.** Todos los participantes del fantasy, incluyendo el que lo administra.
- **Cuándo lo siente.** Al armar el equipo: durante la selección de los 15 jugadores para una fecha.
- **Qué hace hoy.** Eligen los jugadores que más puntúan independientemente de su posición real: todos ponen terceras líneas en los 8 slots de forwards porque suman más por tackles, y todos ponen wines en los backs porque suman más por tries. El sistema no lo impide.
- **Qué cuesta.** El juego pierde competitividad real — todos los equipos son estructuralmente idénticos. El factor estratégico (elegir bien cada posición) desaparece. La gracia del fantasy es justamente esa decisión.

---

## Hipótesis

Si permitimos que cada slot del campo solo acepte jugadores de la posición específica que corresponde a ese número de camiseta, esperamos que los equipos de los participantes sean más diversos entre sí y que el factor estratégico de la selección aumente, porque elimina el exploit del meta actual donde todos eligen los mismos perfiles de jugador.

---

## Evidencia

- Observación directa: todos los participantes tienen el mismo patrón de selección (terceras líneas en todos los slots de forward, wings en todos los de back). Inferencia, no dato cuantificado.
- El sistema de scoring ya diferencia por estadísticas según posición real (tries, tackles) — el exploit es una consecuencia directa de no tener restricción de posición.

---

## Alcance

### Incluido

- Nuevo enum de posiciones específicas en el modelo `Jugador`:
  - Forwards: `PILAR`, `HOOKER`, `SEGUNDA_LINEA`, `TERCERA_LINEA`
  - Backs: `MEDIO_SCRUM`, `APERTURA`, `CENTRO`, `WING`, `FULLBACK`
- Mapeo fijo de slot → posición esperada (ver tabla abajo).
- Pilar izquierdo y derecho (slots 1 y 3) tratados como `PILAR` sin distinción.
- Segundas líneas (slots 4 y 5) tratadas como `SEGUNDA_LINEA` sin distinción.
- Terceras líneas, incluyendo el número 8 (slots 6, 7 y 8) tratadas como `TERCERA_LINEA` sin distinción.
- Centros (slots 12 y 13) tratados como `CENTRO` sin distinción.
- Wings (slots 11 y 14) tratados como `WING` sin distinción.
- El modal de selección (`PlayerSelectModal`) filtra automáticamente por la posición del slot activo — el usuario ve solo los jugadores elegibles para ese puesto.
- Validación también en el backend (`lib/validation.ts`) para que no se pueda saltear la restricción por cliente.
- Actualización del CSV de importación de jugadores para aceptar las nuevas posiciones.

### Excluido

- Overrides por fecha (un pilar que juegue de hooker en una fecha puntual). Se puede agregar más adelante sobre el modelo de `JugadorFecha`, pero complejiza la UI de administración y está fuera del MVP de esta mejora.
- Posición visible en las `PlayerCard` del campo como etiqueta diferente a `FWD/BCK` — los badges actuales se mantienen.
- Rediseño del campo visual (FieldView) por posición.

### Nunca

- Distinción entre pilar derecho e izquierdo (decisión explícita del club: todos son pilares).
- Restricciones de posición en el ranking o en la visualización de equipos ajenos.

---

## Mapeo slot → posición esperada

| Slot | Posición esperada | Observación |
|------|------------------|-------------|
| 1    | PILAR            | Pilar izquierdo, tratado igual que el derecho |
| 2    | HOOKER           | |
| 3    | PILAR            | Pilar derecho, tratado igual que el izquierdo |
| 4    | SEGUNDA_LINEA    | Sin distinción de lado |
| 5    | SEGUNDA_LINEA    | Sin distinción de lado |
| 6    | TERCERA_LINEA    | Flanco, sin distinción de lado |
| 7    | TERCERA_LINEA    | Flanco, sin distinción de lado |
| 8    | TERCERA_LINEA    | Número 8, agrupado con el backrow |
| 9    | MEDIO_SCRUM      | |
| 10   | APERTURA         | |
| 11   | WING             | Sin distinción de lado |
| 12   | CENTRO           | Sin distinción de primero/segundo |
| 13   | CENTRO           | Sin distinción de primero/segundo |
| 14   | WING             | Sin distinción de lado |
| 15   | FULLBACK         | |

---

## Señal de éxito

En la primera fecha con la restricción activa, ningún equipo puede tener más de 3 terceras líneas ni más de 2 wings — porque el sistema lo impide. Como no hay métricas instrumentadas, la señal es operacional: cero equipos con el mismo patrón de selección que en fechas anteriores.

---

## Preguntas abiertas

- **P-01 — Slot 8 (número 8):** Resuelto. El número 8 se agrupa como `TERCERA_LINEA` junto con los flancos (slots 6 y 7).
- **P-02 — Migración de jugadores en producción:** Los jugadores existentes tienen `posicion: FORWARD` o `BACK`. ¿El admin los re-importa manualmente con las nuevas posiciones via CSV, o hacemos una migración asistida? **Responsable: Agustín + Ian.** Resolver antes de deploy a producción.

---

## Próximo paso

Resolver P-02 (estrategia de migración de jugadores en producción), luego implementar los cambios de schema y UI descritos abajo.

---

---

## Plan de implementación técnica

### Contexto

El problema es que `Posicion` es un enum binario (FORWARD/BACK) tanto en el modelo `Jugador` como en la validación del roster. Cada slot del campo tiene un número de camiseta (1-15) pero no está asociado a una posición específica de rugby. El modal de selección muestra todos los convocados sin filtrar por posición del slot activo.

La solución requiere: (1) expandir el enum, (2) mapear slots a posiciones, (3) filtrar el modal, (4) validar en backend.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `prisma/schema.prisma` | Reemplazar enum `Posicion` |
| `prisma/seed.ts` | Actualizar posiciones de jugadores de prueba |
| `lib/validation.ts` | Reemplazar lógica FORWARD/BACK por validación por slot |
| `lib/constants.ts` | Agregar `SLOT_POSITION_MAP`, `FORWARD_POSITIONS`, `BACK_POSITIONS` |
| `components/TeamBuilder.tsx` | Pasar `expectedPosition` al modal |
| `components/PlayerSelectModal.tsx` | Aceptar y aplicar filtro por posición |
| `app/api/admin/jugadores/import/route.ts` | Aceptar nuevos valores de posición en CSV |

---

### Paso 1 — Schema: reemplazar enum `Posicion`

En `prisma/schema.prisma`, reemplazar:

```prisma
enum Posicion {
  FORWARD
  BACK
}
```

por:

```prisma
enum Posicion {
  PILAR
  HOOKER
  SEGUNDA_LINEA
  TERCERA_LINEA
  MEDIO_SCRUM
  APERTURA
  CENTRO
  WING
  FULLBACK
}
```

Crear migración con `npx prisma migrate dev --name posicion-especifica`.

**Nota:** Los datos existentes de producción quedan inválidos. La migración debe incluir un UPDATE que asigne una posición por defecto, o el admin re-importa todos los jugadores. Para dev, el seed se actualiza directamente.

---

### Paso 2 — Constantes: mapeo slot → posición

En `lib/constants.ts`, agregar:

```typescript
export const SLOT_POSITION_MAP: Record<number, Posicion> = {
  1: 'PILAR',
  2: 'HOOKER',
  3: 'PILAR',
  4: 'SEGUNDA_LINEA',
  5: 'SEGUNDA_LINEA',
  6: 'TERCERA_LINEA',
  7: 'TERCERA_LINEA',
  8: 'TERCERA_LINEA',
  9: 'MEDIO_SCRUM',
  10: 'APERTURA',
  11: 'WING',
  12: 'CENTRO',
  13: 'CENTRO',
  14: 'WING',
  15: 'FULLBACK',
};

export const FORWARD_POSITIONS: Posicion[] = [
  'PILAR', 'HOOKER', 'SEGUNDA_LINEA', 'TERCERA_LINEA'
];

export const BACK_POSITIONS: Posicion[] = [
  'MEDIO_SCRUM', 'APERTURA', 'CENTRO', 'WING', 'FULLBACK'
];
```

---

### Paso 3 — Validación backend: `lib/validation.ts`

Reemplazar la lógica de conteo `FORWARD/BACK` por validación slot → posición. La función recibe jugadores con su slot asignado. El body del POST en `api/user/team/route.ts` ya tiene `jugadorIds` en orden de `formationOrder`, así que el slot se puede derivar de esa posición en el array.

```typescript
export function validateRoster(
  asignaciones: { jugadorId: number; slot: number; posicion: Posicion; plantel: Plantel }[],
  capitanId: number | null
): RosterValidationResult {
  // 1. Total = 15
  // 2. Posición del jugador coincide con SLOT_POSITION_MAP[slot]
  // 3. Máx 4 por plantel
  // 4. Capitán requerido
}
```

---

### Paso 4 — TeamBuilder: pasar posición esperada al modal

En `components/TeamBuilder.tsx`:

```typescript
import { SLOT_POSITION_MAP } from '@/lib/constants';

<PlayerSelectModal
  // ...props existentes...
  expectedPosition={activeSlot ? SLOT_POSITION_MAP[activeSlot] : undefined}
/>
```

---

### Paso 5 — PlayerSelectModal: filtrar por posición

En `components/PlayerSelectModal.tsx`, agregar prop `expectedPosition` y aplicarla en el filtro:

```typescript
const correctPosition = !expectedPosition || j.posicion === expectedPosition;
```

Mostrar la posición esperada en el header del modal para que el usuario entienda por qué ve un subconjunto de jugadores.

---

### Paso 6 — Import CSV: aceptar nuevas posiciones

En `app/api/admin/jugadores/import/route.ts`, actualizar la validación del campo `posicion` para aceptar los nuevos valores del enum en lugar de solo `FORWARD | BACK`.

---

### Paso 7 — Seed: actualizar jugadores de prueba

En `prisma/seed.ts`, asignar posiciones específicas distribuidas entre los 20 jugadores de prueba para que el flujo de selección sea testeable (mínimo 2 jugadores por cada posición).

---

### Verificación

1. Correr `npm run prisma:seed` — no debe fallar.
2. Abrir `/equipo` con una fecha en PREVIA.
3. Tocar el slot 1 (pilar) — el modal debe mostrar solo jugadores con `posicion: PILAR`.
4. Tocar el slot 9 (medio scrum) — el modal debe mostrar solo jugadores con `posicion: MEDIO_SCRUM`.
5. Intentar guardar un equipo con jugadores en posiciones incorrectas vía API directa — el backend debe rechazarlo.
6. Verificar que el header del modal indique la posición esperada (ej: "Pilar — Slot #1").
