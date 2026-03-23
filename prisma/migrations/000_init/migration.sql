-- Create Enums
CREATE TYPE "Posicion" AS ENUM ('FORWARD', 'BACK');
CREATE TYPE "Plantel" AS ENUM ('PRIMERA', 'INTER', 'PRE_A', 'PRE_B', 'PRE_C', 'PRE_D');
CREATE TYPE "EstadoFecha" AS ENUM ('PREVIA', 'CERRADA', 'PUNTUADA');

-- Tables
CREATE TABLE "Usuario" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Temporada" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT FALSE,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Jugador" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "apodo" TEXT,
    "camada" INTEGER,
    "posicion" "Posicion" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Fecha" (
    "id" SERIAL PRIMARY KEY,
    "temporada_id" INTEGER NOT NULL REFERENCES "Temporada"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "nro" INTEGER NOT NULL,
    "rival" TEXT NOT NULL,
    "estado" "EstadoFecha" NOT NULL DEFAULT 'PREVIA',
    "cierra_edicion_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("temporada_id", "nro")
);

CREATE TABLE "JugadorFecha" (
    "id" SERIAL PRIMARY KEY,
    "jugador_id" INTEGER NOT NULL REFERENCES "Jugador"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "fecha_id" INTEGER NOT NULL REFERENCES "Fecha"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "plantel" "Plantel" NOT NULL,
    "tries" INTEGER NOT NULL DEFAULT 0,
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "knock_ons" INTEGER NOT NULL DEFAULT 0,
    "penales" INTEGER NOT NULL DEFAULT 0,
    "amarillas" INTEGER NOT NULL DEFAULT 0,
    "rojas" INTEGER NOT NULL DEFAULT 0,
    "puntaje_calculado" INTEGER NOT NULL DEFAULT 0,
    "puntaje_override" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("fecha_id", "jugador_id")
);

CREATE TABLE "Equipo" (
    "id" SERIAL PRIMARY KEY,
    "usuario_id" INTEGER NOT NULL REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "temporada_id" INTEGER NOT NULL REFERENCES "Temporada"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "nombre" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("temporada_id", "usuario_id")
);

CREATE TABLE "EquipoFecha" (
    "id" SERIAL PRIMARY KEY,
    "equipo_id" INTEGER NOT NULL REFERENCES "Equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "fecha_id" INTEGER NOT NULL REFERENCES "Fecha"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "puntaje_total" INTEGER NOT NULL DEFAULT 0,
    "capitan_jugador_id" INTEGER REFERENCES "Jugador"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("equipo_id", "fecha_id")
);

CREATE TABLE "EquipoFechaJugador" (
    "id" SERIAL PRIMARY KEY,
    "equipo_fecha_id" INTEGER NOT NULL REFERENCES "EquipoFecha"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "jugador_id" INTEGER NOT NULL REFERENCES "Jugador"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("equipo_fecha_id", "jugador_id")
);
