# Auditoría UX — GranTrico Fantasy Rugby

**Fecha:** 2026-04-22
**Autor:** Agustín Arone + Claude

**Superficie:** Flujos de usuario autenticado — login, constructor de equipo (`/equipo`), ranking de fecha (`/ranking-fecha/[id]`), ranking de temporada (`/tabla-general`).

**Usuario:** Jugador del club, mobile-first, español rioplatense, conoce las reglas del rugby y del fantasy.

**Tarea:** Armar el equipo de la fecha y ver cómo quedó en el ranking.

---

## Hallazgos

---

### F-01 — El modal de selección de jugador rompe el diseño del producto

**Observado:** Al tocar un slot vacío en el campo para elegir un jugador, se abre un modal con fondo blanco, texto gris y bordes de sistema operativo.

**Esperado:** Un modal que siga el mismo sistema de diseño que el resto de la app (fondo `#0d1f35`, bordes dorados `#c8a951`, texto crema).

**Real:** `PlayerSelectModal.tsx` usa `bg-white`, `text-gray-600`, `hover:bg-gray-100`. El cambio visual es abrupto — parece que se rompió algo.

**Reproducción:** `components/PlayerSelectModal.tsx`, líneas 48-99.

**Por qué importa:** El jugador pierde confianza en la continuidad del producto. En un flujo ya cargado (15 decisiones de selección), cada fricción inesperada incrementa el abandono.

**Severidad:** High | **Superficie:** Screen

**Ticket:** Aplicar el design system al `PlayerSelectModal` — fondo `#0d1f35`, borde `1px solid #c8a951`, texto `#f5f0e0`, hover sobre item `background: #1a3a6b`.

---

### F-02 — El login es de otra app

**Observado:** La pantalla de login tiene fondo blanco, botón azul `bg-blue-600` y sin logo.

**Esperado:** Consistencia con el diseño del resto — colores del club, mismo lenguaje visual que la landing.

**Real:** `app/(public)/login/page.tsx` usa clases Tailwind genéricas sin ninguna referencia al sistema de diseño.

**Reproducción:** `app/(public)/login/page.tsx`, líneas 28-78.

**Por qué importa:** El login es el primer punto de contacto post-landing. La landing tiene imagen de fondo, logo, overlay oscuro y botones con personalidad. El login borra todo eso de un plumazo.

**Severidad:** Medium | **Superficie:** Screen

**Ticket:** Rediseñar la pantalla de login usando los colores del club. Al menos: fondo `#0d1f35` o gradiente verde-azul, input con borde dorado, botón verde `#1a6b3a`.

---

### F-03 — Bug: el modal de ranking muestra jugadores en el slot equivocado

**Observado:** Al tocar un equipo en el ranking de la fecha, el campo que se despliega tiene jugadores en posiciones incorrectas.

**Esperado:** El jugador asignado al slot 1 aparece en la posición del hooker, el del slot 9 en la del scrum-half, etc.

**Real:** En `RankingFechaClient.tsx` línea 196, el modal mapea `formationOrder[idx]` → `modalTeam.jugadores[idx]`. Pero `modalTeam.jugadores` viene ordenado por `id` de BD (línea 68 de la page), no por posición en la formación. El índice del array no tiene ninguna relación con el slot de la camiseta.

**Reproducción:** `app/(user)/ranking-fecha/RankingFechaClient.tsx`, líneas 196-218. Comparar con `app/(user)/ranking-fecha/[fechaId]/page.tsx` líneas 67-69 donde se hace `.sort((a, b) => a.id - b.id)`.

**Por qué importa:** Ver el campo de un rival es la interacción más entretenida del ranking. Si los jugadores aparecen en los slots equivocados, la información no tiene sentido y la funcionalidad se vuelve ruido.

**Severidad:** High | **Superficie:** Screen

**Ticket:** En el server (`page.tsx`), guardar el índice de formación de cada jugador junto con su data, o en el client mapear `modalTeam.jugadores` por `jugadorId` usando `EquipoFechaJugador.id` como orden de inserción real. La solución más limpia: que el servidor devuelva los jugadores ya ordenados por su posición en `formationOrder`.

---

### F-04 — El ranking de fecha no muestra el nombre del usuario

**Observado:** En la lista del ranking de fecha, cada fila muestra solo el nombre del equipo (`equipoNombre`). No se ve quién lo armó.

**Esperado:** Ver el nombre del usuario debajo del nombre del equipo, como ocurre en la tabla general.

**Real:** `RankingFechaClient.tsx` muestra `team.equipoNombre` pero no `team.usuarioNombre` en la lista. El nombre del usuario solo aparece una vez que abrís el modal. En `TablaGeneralClient.tsx` sí se muestra `row.usuarioNombre` en la misma lista.

**Reproducción:** `app/(user)/ranking-fecha/RankingFechaClient.tsx` líneas 105-112 (top3) y 140-148 (rest). Comparar con `app/(user)/tabla-general/TablaGeneralClient.tsx` líneas 53-56.

**Por qué importa:** En un grupo chico de amigos del club, el nombre del dueño del equipo es el dato más relevante del ranking. Ocultarlo requiere un tap extra por fila.

**Severidad:** Medium | **Superficie:** Screen

**Ticket:** Agregar `usuarioNombre` como subtexto en cada fila del ranking de fecha, replicando el patrón ya implementado en `TablaGeneralClient.tsx`.

---

### F-05 — El switcher de fecha no indica el estado de cada fecha

**Observado:** El switcher de flechas (`FechaSwitcher`) muestra "Fecha 3 — Rival X" sin indicar si esa fecha está PREVIA, CERRADA o PUNTUADA.

**Esperado:** Poder saber antes de navegar qué fechas tienen puntajes cargados y cuáles no.

**Real:** El componente solo recibe `prevHref`, `nextHref` y `label`. El estado de la fecha no se transmite ni se muestra.

**Reproducción:** `components/FechaSwitcher.tsx` (props). Ver uso en `RankingFechaClient.tsx` línea 71-75.

**Por qué importa:** Un jugador que navega hacia una fecha PREVIA ve el ranking vacío y no entiende por qué. Genera confusión innecesaria.

**Severidad:** Medium | **Superficie:** Component

**Ticket:** Pasar el estado de la fecha al switcher y mostrar un badge (`PREVIA` / `CERRADA` / `PUNTUADA`) al lado del label.

---

### F-06 — Placeholder "Foto" visible en el modal de detalle del jugador

**Observado:** En el modal de detalle del jugador dentro del constructor de equipo, hay un círculo con el texto "Foto" en gris semitransparente.

**Esperado:** O una foto real, o un avatar con iniciales consistente con las PlayerCards del campo.

**Real:** `TeamBuilder.tsx` líneas 312-321 renderizan un `<div>` con texto "Foto" hardcodeado. Las `PlayerCard` ya tienen un avatar con iniciales implementado.

**Reproducción:** `components/TeamBuilder.tsx`, líneas 310-322.

**Por qué importa:** Un placeholder visible en producción comunica que el producto está incompleto. Las iniciales ya existen en `PlayerCard` y cubren el caso perfectamente.

**Severidad:** Low | **Superficie:** Component

**Ticket:** Reemplazar el placeholder "Foto" con el mismo avatar de iniciales de `PlayerCard`. Cuando haya fotos reales, se swapea este componente.

---

### F-07 — Feedback de "Equipo guardado" no sigue el design system

**Observado:** Después de guardar el equipo, aparece el texto "Equipo guardado" en verde claro (`text-green-700`) sobre el fondo oscuro. Los errores usan `text-red-700`.

**Esperado:** Un banner o badge styled consistente con el resto del producto (mismo estilo que los banners de estado "Fecha cerrada" / "Fecha puntuada" que están bien resueltos).

**Real:** `TeamBuilder.tsx` líneas 432-433. Los banners de estado en líneas 182-218 del mismo archivo ya tienen el patrón correcto.

**Reproducción:** `components/TeamBuilder.tsx`, líneas 432-433.

**Por qué importa:** El feedback de confirmación es el momento de mayor satisfacción del flujo. Debería reforzar el sistema visual, no romperlo.

**Severidad:** Low | **Superficie:** Component

**Ticket:** Reemplazar `text-green-700` / `text-red-700` por banners styled con `background: #1a6b3a` / borde dorado para éxito, y un rojo con borde para error, replicando el patrón de los banners de estado de fecha.

---

### F-08 — El emoji 💩 puede aparecer en el top 3

**Observado:** Si hay 3 o menos equipos en el ranking, el último lugar puede aparecer en la sección de medallas con el 💩 al lado del podio.

**Esperado:** El 💩 solo tiene sentido fuera del podio, como marca de vergüenza amistosa.

**Real:** `lastPlaceId` se asigna siempre al último equipo del array, sin importar cuántos equipos hay. Si hay 2 equipos, el 🥈 y el 💩 son el mismo.

**Reproducción:** `app/(user)/ranking-fecha/RankingFechaClient.tsx`, líneas 52-54.

**Por qué importa:** Con pocos participantes en las primeras fechas esto va a pasar. Es un edge case divertido pero que rompe la lógica del feature.

**Severidad:** Low | **Superficie:** Component

**Ticket:** Agregar condición: solo asignar `lastPlaceId` si `teams.length > 3`.

---

## Resumen

### Top 3 patrones

1. **Design system fragmentado.** Login y `PlayerSelectModal` fueron construidos con Tailwind genérico sin referencia al sistema de diseño del producto. Cualquier pantalla que se agregue sin un componente base compartido va a reproducir este problema.

2. **Datos servidos al cliente en el orden equivocado.** El bug del ranking y la ausencia del nombre de usuario responden al mismo patrón: el server devuelve datos que el client asume ordenados de una manera pero no lo están. Falta un contrato claro entre lo que el server ordena y lo que el client espera.

3. **Ausencia de contexto en navegación entre fechas.** El switcher de fechas no comunica estado. El usuario navega a ciegas y descubre el estado de la fecha solo cuando llega a ella.

---

### Top 3 quick wins

1. **F-04** — Mostrar `usuarioNombre` en el ranking de fecha. Dos líneas de JSX, dato ya disponible en el componente.
2. **F-06** — Reemplazar placeholder "Foto" con el avatar de iniciales ya implementado en `PlayerCard`.
3. **F-08** — Proteger el 💩 con `teams.length > 3`. Una línea.

---

### Top 3 apuestas estructurales

1. **F-01 + F-02** — Crear un set de componentes base styled (modal, input, botón, banner) que apliquen el design system por defecto. Actualmente cada pantalla reimplementa los estilos a mano con `style={{}}` inline, lo que hace que cada dev pueda salirse del sistema sin darse cuenta.

2. **F-03** — Definir un tipo explícito `FormationSlot` y asegurarse de que el server siempre devuelva jugadores mapeados a su slot de formación, no a su posición en el array de la DB. Esto también afectaría el constructor de equipo si en el futuro se cambia el orden de carga.

3. **F-05** — El switcher de fecha es el centro de navegación del producto. Extenderlo para mostrar estado y eventualmente una pill de "tu puntaje en esta fecha" lo convertiría en el punto de entrada real al contenido, no solo un botón de paginación.

---

### Supuesto que el audit refutó

El TODO asume que el bug del ranking es cosmético ("jugadores desordenados"). En realidad es semántico: un jugador aparece en el slot de otro, con su puntaje asignado a la posición equivocada. En una fecha PUNTUADA, el campo que ves en el modal de ranking no representa el equipo que armó el usuario.
