-- DropForeignKey
ALTER TABLE "Equipo" DROP CONSTRAINT "Equipo_temporada_id_fkey";

-- DropForeignKey
ALTER TABLE "Equipo" DROP CONSTRAINT "Equipo_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "EquipoFecha" DROP CONSTRAINT "EquipoFecha_capitan_jugador_id_fkey";

-- DropForeignKey
ALTER TABLE "EquipoFecha" DROP CONSTRAINT "EquipoFecha_equipo_id_fkey";

-- DropForeignKey
ALTER TABLE "EquipoFecha" DROP CONSTRAINT "EquipoFecha_fecha_id_fkey";

-- DropForeignKey
ALTER TABLE "EquipoFechaJugador" DROP CONSTRAINT "EquipoFechaJugador_equipo_fecha_id_fkey";

-- DropForeignKey
ALTER TABLE "EquipoFechaJugador" DROP CONSTRAINT "EquipoFechaJugador_jugador_id_fkey";

-- DropForeignKey
ALTER TABLE "Fecha" DROP CONSTRAINT "Fecha_temporada_id_fkey";

-- DropForeignKey
ALTER TABLE "JugadorFecha" DROP CONSTRAINT "JugadorFecha_fecha_id_fkey";

-- DropForeignKey
ALTER TABLE "JugadorFecha" DROP CONSTRAINT "JugadorFecha_jugador_id_fkey";

-- AlterTable
ALTER TABLE "JugadorFecha" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Fecha" ADD CONSTRAINT "Fecha_temporada_id_fkey" FOREIGN KEY ("temporada_id") REFERENCES "Temporada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JugadorFecha" ADD CONSTRAINT "JugadorFecha_jugador_id_fkey" FOREIGN KEY ("jugador_id") REFERENCES "Jugador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JugadorFecha" ADD CONSTRAINT "JugadorFecha_fecha_id_fkey" FOREIGN KEY ("fecha_id") REFERENCES "Fecha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_temporada_id_fkey" FOREIGN KEY ("temporada_id") REFERENCES "Temporada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipoFecha" ADD CONSTRAINT "EquipoFecha_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipoFecha" ADD CONSTRAINT "EquipoFecha_fecha_id_fkey" FOREIGN KEY ("fecha_id") REFERENCES "Fecha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipoFechaJugador" ADD CONSTRAINT "EquipoFechaJugador_equipo_fecha_id_fkey" FOREIGN KEY ("equipo_fecha_id") REFERENCES "EquipoFecha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipoFechaJugador" ADD CONSTRAINT "EquipoFechaJugador_jugador_id_fkey" FOREIGN KEY ("jugador_id") REFERENCES "Jugador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
