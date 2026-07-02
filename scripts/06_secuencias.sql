-- #####################################################################
-- #  SCRIPT 06: SECUENCIAS                                           #
-- #  Generan las claves primarias numericas de cada tabla.          #
-- #####################################################################
--
-- ORDEN DE EJECUCION:
--   PARTE A -> CONN_NEGOCIO    (8 secuencias)
--   PARTE B -> CONN_SEGURIDAD  (6 secuencias)
--   PARTE C -> CONN_REPORTES   (1 secuencia)
--
-- Se usa NOCACHE para que los IDs salgan consecutivos (util en un
-- proyecto academico donde se revisan los datos generados).
-- =====================================================================


-- #####################################################################
-- PARTE A : SECUENCIAS DE NEGOCIO (ejecutar en CONN_NEGOCIO)
-- #####################################################################
CREATE SEQUENCE seq_cliente        START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_tipo_prestamo  START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_solicitud      START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_prestamo       START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_cuota          START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_pago           START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_parametro      START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_lista_negra    START WITH 1 INCREMENT BY 1 NOCACHE;


-- #####################################################################
-- PARTE B : SECUENCIAS DE SEGURIDAD (ejecutar en CONN_SEGURIDAD)
-- #####################################################################
CREATE SEQUENCE seq_rol            START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_operacion      START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_usuario        START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_rol_permiso    START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_auditoria      START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_intento_login  START WITH 1 INCREMENT BY 1 NOCACHE;


-- #####################################################################
-- PARTE C : SECUENCIA DE REPORTES (ejecutar en CONN_REPORTES)
-- #####################################################################
CREATE SEQUENCE seq_log_reporte    START WITH 1 INCREMENT BY 1 NOCACHE;
