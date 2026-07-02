-- #####################################################################
-- #  SCRIPT 07: INDICES                                              #
-- #  Indices justificados para consultas y reportes frecuentes.     #
-- #####################################################################
--
-- EJECUTAR EN: CONN_NEGOCIO (C##G01_NEGOCIO)
--
-- NOTA: Oracle crea automaticamente indices para las PRIMARY KEY y
-- las restricciones UNIQUE. Por eso aqui solo se crean los indices
-- ADICIONALES sobre columnas que se filtran u ordenan con frecuencia
-- en las consultas (CON) y reportes (REP), pero que no son PK/UK.
-- =====================================================================

-- Busqueda de clientes por apellido (CON04)
CREATE INDEX ix_cliente_apellidos ON t_cliente (apellidos);

-- Filtro de solicitudes por estado y por cliente
CREATE INDEX ix_solicitud_estado  ON t_solicitud (estado);
CREATE INDEX ix_solicitud_cliente ON t_solicitud (id_cliente);

-- Filtro de prestamos por estado (cartera, REP01)
CREATE INDEX ix_prestamo_estado   ON t_prestamo (estado);

-- Deteccion de morosidad: cuotas por estado y por vencimiento (CON05, REP02)
CREATE INDEX ix_cuota_estado      ON t_cuota (estado);
CREATE INDEX ix_cuota_vencimiento ON t_cuota (fecha_vencimiento);

-- Recaudacion por fecha de pago (REP04)
CREATE INDEX ix_pago_fecha        ON t_pago (fecha_pago);
