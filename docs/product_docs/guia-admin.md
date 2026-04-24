# Guía del administrador — GranTrico Fantasy

Basada en explicación de Ian y Marzullo. Para uso interno del admin del club.

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

## Flujo completo de una fecha nueva

```
1. Crear fecha en /admin/fechas
2. Procesar la planilla de Marcelo → importar convocados
3. Revisar y asignar posiciones faltantes ("sin pos.")
4. Estado: PREVIA  →  usuarios arman su equipo (capitán + pateador)
5. Estado: CERRADA  →  arranca el partido
6. Exportar puntajes → completar estadísticas → importar puntajes
7. Verificar puntajes en /admin/estadísticas/[fechaId]
8. Estado: PUNTUADA  →  se publican resultados y ranking
```

---

## Convocados

### Cómo armar la lista desde la planilla de Marcelo

La planilla de Marcelo tiene **6 columnas en paralelo**, una por plantel:

```
| #  | Primera          | #  | Intermedia        | #  | Pre-A   | ...
|----|------------------|----|-------------------|----|---------|
| 1  | Roman Osella     | 1  | Yago Mosquera     | 1  | ...     |
| 2  | Franco Cammaratta| 2  | Ignacio Marino    | 2  | ...     |
| ...                                                            |
| 15 | Juan Almandoz    | 15 | Juan Pollet       | 15 | ...     |
|    |                  |    |                   |    |         |   ← fila vacía
| 16 | Yago Mosquera    | 16 | Lisandro Galliano | 16 | ...     |   ← duplicados
```

A partir de la fila 16, cada columna repite jugadores de planteles de menor categoría como suplentes potenciales. Son duplicados — no contarlos dos veces.

### Proceso con el script (recomendado)

El script `docs/convocados/procesar_CAR.py` automatiza el proceso:

1. Leer el `.xlsx` de Marcelo
2. Extraer los titulares (filas 1–15 de cada plantel) y asignarles posición según el número de camiseta
3. Identificar los suplentes-only (aparecen en fila 16+ pero no son titulares en ningún plantel)
4. Matchear con los jugadores existentes en la DB
5. Generar:
   - `*_nuevos.sql` — jugadores nuevos a crear
   - `*_posiciones.sql` — actualizar posición de jugadores existentes
   - `*_convocados.csv` — archivo listo para importar

Ejecutar en terminal:
```bash
python3 docs/convocados/procesar_CAR.py
psql <DB_URL> < docs/convocados/CAR_nuevos.sql
psql <DB_URL> < docs/convocados/CAR_posiciones.sql
```
Luego importar el CSV desde el botón **Importar convocados** en la pantalla de la fecha.

### Posición por número de camiseta

| Camiseta | Posición |
|----------|----------|
| 1, 3 | Pilar |
| 2 | Hooker |
| 4, 5 | Segunda línea |
| 6, 7, 8 | Tercera línea |
| 9 | Medio scrum |
| 10 | Apertura |
| 11, 14 | Wing |
| 12, 13 | Centro |
| 15 | Fullback |

### Revisar posiciones faltantes ("sin pos.")

Después de importar, ir a la pantalla de la fecha → sección **Jugadores convocados**. Los jugadores sin posición específica tienen un badge rojo **"sin pos."**.

Usar el botón **"sin pos. (N)"** para filtrar solo esos jugadores → click en **Editar** → asignar posición → Guardar.

> Las posiciones quedan guardadas en el perfil del jugador y se usan en todas las fechas futuras. Solo hay que asignarlas una vez.

### Proceso manual (sin script)

1. Tocar **Exportar convocados** → descarga un CSV con todos los jugadores del sistema.
2. Completar la columna `plantel` para cada jugador convocado:
   - `PRIMERA`, `INTER`, `PRE_A`, `PRE_B`, `PRE_C`, `PRE_D`
3. Tocar **Importar convocados** y subir el CSV.

Solo van los jugadores convocados para esa fecha. Los que no estén en el archivo no aparecen disponibles para los usuarios.

#### Ojo con los suplentes

Un jugador de Intermedia que aparece en la columna de Primera (fila 16+) es el mismo jugador que ya está en la fila 1 de la columna Intermedia. En el Fantasy va con el plantel de origen (`INTER`), no como `PRIMERA`.

---

## Puntajes

1. Tocar **Exportar puntajes** → descarga un CSV con una fila por jugador convocado.
2. Completar las columnas:
   - `tries`, `tackles`, `knock_ons`, `penales`, `amarillas`, `rojas`
   - `conversiones_metidas`, `conversiones_erradas`
   - `penales_metidos`, `penales_errados`
3. Tocar **Importar puntajes** y subir el CSV.
4. El sistema recalcula los puntajes automáticamente.
5. Verificar en `/admin/estadísticas/[fechaId]`.
6. Una vez verificados, cambiar estado a **PUNTUADA**.

> Las columnas de patadas (`conversiones_*`, `penales_*`) solo afectan el puntaje de los equipos que designaron a ese jugador como **pateador**. Para el resto no cambia nada.

---

## Gestión de jugadores

Para incorporar un jugador nuevo al sistema manualmente:

1. Exportar la base actual de jugadores.
2. Agregar la fila con los datos del jugador nuevo.
3. Importar el CSV actualizado.

---

## Gestión de temporadas

Permite crear temporadas para usar el sistema año a año.

> **No crear temporadas de prueba** — el flujo tiene bugs. Solo crear cuando sea necesario para una temporada real.

---

## Gestión de usuarios

Desde acá se puede dar o sacar rol de admin a cualquier usuario registrado.
