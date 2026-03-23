# MVP Fantasy Rugby – Especificación

## Objetivo

Construir un **MVP web simple** de un fantasy rugby interno para un club.

El objetivo del MVP es validar si el juego es divertido y si los usuarios del club lo usan.  
No es un producto final, por lo que se prioriza **simplicidad, velocidad de desarrollo y facilidad de despliegue**.

La aplicación permitirá:

- Crear equipos de fantasy.
- Elegir jugadores del club que juegan cada fecha.
- Calcular puntajes en base a estadísticas del partido.
- Ver ranking por fecha y ranking acumulado.

La app debe poder desplegarse rápidamente en **Vercel**.

---

# Principios del MVP

Este proyecto debe seguir estas reglas:

- Mantener la implementación **lo más simple posible**.
- No agregar features que no estén especificadas.
- No implementar infraestructura innecesaria.
- Priorizar un **MVP funcional end-to-end**.
- La interfaz puede ser simple y utilitaria.

No implementar:

- Email verification
- Recuperación de contraseña
- Notificaciones
- Tiempo real
- Mercado de pases
- Draft
- Banco de suplentes
- Ligas privadas
- Features sociales
- Seguridad avanzada

---

# Usuarios

Existen dos tipos de usuarios.

## Usuario normal

Puede:

- Armar su equipo para una fecha
- Elegir capitán
- Ver ranking de la fecha
- Ver ranking de la temporada

## Admin

Puede:

- Crear temporada
- Crear fechas
- Cargar jugadores
- Cargar convocados por fecha
- Cargar estadísticas
- Cambiar estado de la fecha

---

# Flujo del juego

### Setup inicial

1. Admin crea temporada activa.
2. Admin carga jugadores.
3. Admin crea las fechas del torneo.

---

### Antes de cada fecha (jueves o viernes)

Admin carga **convocados por fecha**:

- qué jugadores juegan
- en qué plantel

Esto se guarda en `jugador_fecha`.

Las estadísticas empiezan en 0.

---

### Antes del partido

Los usuarios pueden armar su equipo.

Cada equipo debe cumplir reglas:

- exactamente **15 jugadores**
- máximo **8 forwards**
- máximo **7 backs**
- máximo **4 jugadores del mismo plantel**
- elegir **1 capitán**

El capitán duplica su puntaje.

---

### Cierre de edición

El sábado a la mañana se cierra la edición.

Esto se representa con:

```
fecha.estado = CERRADA
```

Cuando una fecha está cerrada:

- no se pueden modificar equipos

---

### Después del partido

Admin carga estadísticas manualmente:

- tries
- tackles
- knock ons
- penales
- amarillas
- rojas

El sistema calcula automáticamente:

- puntaje de jugadores
- puntaje de equipos
- ranking

Luego la fecha pasa a estado:

```
PUNTUADA
```

---

# Scoring

Puntaje por jugador:

```
try = +10
tackle = +1
knock_on = -2
penal = -2
amarilla = -5
roja = -10
```

Fórmula:

```
puntaje =
tries * 10 +
tackles * 1 -
knock_ons * 2 -
penales * 2 -
amarillas * 5 -
rojas * 10
```

Si existe `puntaje_override`, ese valor reemplaza el calculado.

---

# Capitán

Cada equipo debe elegir **1 capitán**.

El capitán duplica su puntaje.

Implementación simple:

```
puntaje_equipo += puntaje_capitan
```

(es decir, se suma una vez extra).

---

# Entidades

## Usuario

Campos:

- id
- nombre
- email
- password_hash
- is_admin
- created_at

Reglas:

- email debe ser único.

---

## Temporada

Campos:

- id
- nombre
- activa
- fecha_inicio
- fecha_fin
- created_at

Solo una temporada puede estar activa.

---

## Jugador

Campos:

- id
- nombre
- apellido
- apodo
- camada
- posicion

Posiciones posibles:

```
FORWARD
BACK
```

También tiene:

- activo (boolean)

---

## Fecha

Campos:

- id
- temporada_id
- nro
- rival
- estado
- cierra_edicion_at
- created_at

Estados posibles:

```
PREVIA
CERRADA
PUNTUADA
```

Restricción:

```
UNIQUE(temporada_id, nro)
```

---

## jugador_fecha

Representa un jugador convocado en una fecha.

Campos:

- id
- jugador_id
- fecha_id
- plantel
- tries
- tackles
- knock_ons
- penales
- amarillas
- rojas
- puntaje_calculado
- puntaje_override
- updated_at

Planteles posibles:

```
PRIMERA
INTER
PRE_A
PRE_B
PRE_C
PRE_D
```

Restricción:

```
UNIQUE(fecha_id, jugador_id)
```

---

## equipo

Representa el equipo fantasy de un usuario.

Campos:

- id
- usuario_id
- temporada_id
- nombre
- created_at

Restricción:

```
UNIQUE(temporada_id, usuario_id)
```

Un usuario tiene **1 equipo por temporada**.

---

## equipo_fecha

Representa la participación de un equipo en una fecha.

Campos:

- id
- equipo_id
- fecha_id
- puntaje_total
- capitan_jugador_id
- created_at

Restricción:

```
UNIQUE(equipo_id, fecha_id)
```

---

## equipo_fecha_jugador

Snapshot de jugadores elegidos para una fecha.

Campos:

- id
- equipo_fecha_id
- jugador_id

Restricción:

```
UNIQUE(equipo_fecha_id, jugador_id)
```

---

# Cálculo de puntajes

## Puntaje jugador

```
puntaje_calculado =
tries * 10 +
tackles -
knock_ons * 2 -
penales * 2 -
amarillas * 5 -
rojas * 10
```

Puntaje final:

```
puntaje_override ?? puntaje_calculado
```

---

## Puntaje equipo

Pasos:

1. Obtener los 15 jugadores elegidos.
2. Buscar su puntaje en `jugador_fecha`.
3. Sumar todos.
4. Identificar capitán.
5. Duplicar puntaje del capitán.
6. Guardar resultado en `equipo_fecha.puntaje_total`.

---

## Ranking de fecha

Ordenar equipos por:

```
equipo_fecha.puntaje_total
```

---

## Ranking de temporada

Sumar:

```
SUM(equipo_fecha.puntaje_total)
```

por equipo.

---

# Pantallas mínimas

## Usuario

### Login

Email + contraseña.

---

### Mi equipo

Permite:

- elegir 15 jugadores
- elegir capitán
- validar reglas
- confirmar equipo

---

### Ranking de la fecha

Lista de equipos ordenados por puntaje.

---

### Tabla general

Ranking acumulado de temporada.

---

# Pantallas Admin

### Gestión de fechas

Permite:

- crear fecha
- cambiar estado

---

### Convocados por fecha

Permite cargar:

- jugador
- plantel

---

### Estadísticas

Permite cargar:

- tries
- tackles
- knock ons
- penales
- amarillas
- rojas

---

# Reglas técnicas para implementación

Prioridades:

1. simplicidad
2. claridad
3. rapidez de desarrollo

La app debe:

- ser React / Next.js
- poder deployarse en Vercel
- tener seeds de datos para probar rápido
- mantener el proyecto siempre ejecutable

No agregar:

- features no pedidas
- infraestructura compleja
- microservicios
- arquitectura innecesaria

---

# Criterio de éxito del MVP

El MVP se considera exitoso si:

- Admin puede cargar jugadores, fechas, convocados y estadísticas
- Usuario puede armar equipo válido
- Usuario puede elegir capitán
- La fecha puede cerrarse
- Se calculan puntajes correctamente
- Se muestran rankings
- La app puede desplegarse en Vercel
