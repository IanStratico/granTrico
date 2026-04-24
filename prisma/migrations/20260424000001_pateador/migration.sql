ALTER TABLE "JugadorFecha"
  ADD COLUMN "conversiones_metidas" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "conversiones_erradas" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "penales_metidos"      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "penales_errados"      INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "EquipoFecha"
  ADD COLUMN "pateador_jugador_id" INTEGER;
