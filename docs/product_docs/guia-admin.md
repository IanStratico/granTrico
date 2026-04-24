# Guía del administrador — GranTrico Fantasy

Basada en explicación de Ian. Para uso interno del admin del club.

---

## Acceso

Al entrar al Fantasy con una cuenta admin aparece una solapa extra llamada **Admin** en la navegación. Desde ahí se maneja todo.

---

## Gestión de fechas (flujo principal)

### Ir a última fecha

El botón **"Ir a última fecha"** lleva directo a la fecha que está en juego en ese momento.

Desde esa pantalla se puede cambiar el estado de la fecha:

| Estado | Qué significa | Cuándo usarlo |
|--------|--------------|---------------|
| **PREVIA** | La fecha está abierta para que los usuarios armen su equipo | Antes del partido |
| **CERRADA** | Nadie puede editar su equipo | Cuando arranca el partido |
| **PUNTUADA** | Se calculan los puntos en base a los puntajes cargados | Solo cuando los puntajes ya están cargados |

> **Importante:** no tocar **PUNTUADA** hasta que todos los puntajes estén cargados. Al presionar ese botón se dispara el cálculo de puntos en base a lo que haya en ese momento.

---

### Convocados

1. Tocar **Exportar convocados** → descarga un CSV con todos los jugadores que alguna vez jugaron un partido cargado en el sistema.
2. En la última columna (`plantel`) completar el equipo en el que está cada jugador para esa fecha:
   - `PRIMERA` — Primera
   - `INTER` — Intermedia
   - `PRE_A` — Pre A
   - `PRE_B` — Pre B
   - `PRE_C` — Pre C
   - `PRE_D` — Pre D
3. Tocar **Importar convocados** y subir el CSV modificado.

Solo van los jugadores convocados para esa fecha. Los que no estén en el archivo no aparecen disponibles para los usuarios.

#### Cómo armar la lista de convocados desde la planilla de Marcelo

La planilla de Marcelo tiene **6 columnas en paralelo**, una por plantel:

```
| #  | Primera          | #  | Intermedia        | #  | Pre-A   | #  | Pre-B  | #  | Pre-C  | #  | Pre-D  |
|----|------------------|----|-------------------|----|---------|...
| 1  | Roman Osella     | 1  | Yago Mosquera     | 1  | ...     |
| 2  | Franco Cammaratta| 2  | Ignacio Marino    | 2  | ...     |
| ...                                                            |
| 15 | Juan Almandoz    | 15 | Juan Pollet       | 15 | ...     |
|    |                  |    |                   |    |         |   ← fila vacía separadora
| 16 | Yago Mosquera    | 16 | Lisandro Galliano | 16 | ...     |   ← acá empieza el problema
| 17 | Ignacio Marino   | 17 | ...               | 17 | ...     |
| ...repite TODOS los jugadores de los planteles siguientes...  |
```

**El patrón clave:** a partir de la fila 16 (después de la fila vacía), cada columna repite todos los jugadores de los planteles de menor categoría como suplentes potenciales. Son los mismos jugadores que ya aparecen en sus propias columnas — están duplicados.

Por ejemplo, en la columna de Primera, a partir de la fila 16 aparecen todos los jugadores de Intermedia, después todos los de Pre-A, Pre-B, etc. Un jugador como "Agustín Arone" aparece en la fila 10 de Pre-A, en la fila 25 de Intermedia y en la fila 35 de Primera — es la misma persona tres veces.

**Paso a paso para limpiar la planilla:**

1. Para cada columna (Primera, Intermedia, Pre-A, Pre-B, Pre-C, Pre-D), quedarse **solo con las filas 1 a 15** — los titulares del plantel. Si hay suplentes reales del propio plantel aparecen en las filas 16, 17 (por ejemplo, si Primera tiene 2 suplentes propios son los puestos 16 y 17 de esa columna).

2. Borrar todo lo que esté después de los suplentes reales del plantel. Si no hay suplentes, borrar desde la fila 16 en adelante en esa columna.

3. Resultado final: una lista de entre 15 y 17 jugadores por plantel, sin duplicados.

4. Cruzar esa lista con el CSV exportado del Fantasy por nombre y apellido, y completar la columna `plantel` con el valor correspondiente (`PRIMERA`, `INTER`, `PRE_A`, etc.).

> **Ojo con los suplentes:** un jugador de Intermedia que aparece como suplente de Primera (fila 16 de la columna Primera) es el mismo jugador que ya está en la fila 1 de la columna Intermedia. No contarlo dos veces — en el Fantasy va con el plantel de origen (`INTER`), no como Primera.

---

### Puntajes

1. Tocar **Exportar puntajes** → descarga un CSV con una fila por jugador convocado y columnas para cada estadística.
2. Completar las columnas con los valores del partido:
   - `tries`, `tackles`, `knock_ons`, `penales`, `amarillas`, `rojas`
   - `conversiones_metidas`, `conversiones_erradas` — patadas a los palos (conversiones)
   - `penales_metidos`, `penales_errados` — patadas a los palos (penales)
3. Tocar **Importar puntajes** y subir el CSV.
4. El sistema recalcula los puntajes automáticamente al importar.
5. Una vez verificados, cambiar el estado a **PUNTUADA**.

> Las columnas de patadas (`conversiones_*`, `penales_*`) solo afectan el puntaje de los equipos que designaron a ese jugador como **pateador**. Para el resto no cambia nada.

---

## Gestión de jugadores

Para incorporar un jugador nuevo al sistema:

1. Exportar la base actual de jugadores.
2. Agregar la fila del jugador nuevo con sus datos.
3. Importar el CSV actualizado.

---

## Gestión de temporadas

Permite crear temporadas para usar el sistema año a año.

> **No crear temporadas de prueba** — el flujo tiene bugs. Solo crear cuando sea necesario para una temporada real.

---

## Gestión de usuarios

Desde acá se puede dar o sacar rol de admin a cualquier usuario registrado.

---

## Flujo completo de una fecha

```
1. Crear fecha (si no existe)
2. Exportar convocados → completar plantel → importar convocados
3. Estado: PREVIA  →  usuarios arman su equipo
4. Estado: CERRADA  →  arranca el partido
5. Exportar puntajes → completar estadísticas → importar puntajes
6. Verificar puntajes en /admin/estadísticas/[fechaId]
7. Estado: PUNTUADA  →  se publican resultados y ranking
```
