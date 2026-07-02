-- #####################################################################
-- #  SCRIPT 01: CREACION DE ESQUEMAS (USUARIOS)                      #
-- #  EJECUTAR EN: MiOracle (SYS) en CDB$ROOT                         #
-- #####################################################################
--
-- Crea los 3 esquemas del proyecto. Por estar en un contenedor raiz
-- (CDB$ROOT) de Oracle 19c multitenant, los usuarios deben llevar el
-- prefijo obligatorio C## (usuarios comunes).
--
-- =====================================================================

-- ---------------------------------------------------------------------
-- ESQUEMA 1: NEGOCIO (operacion del prestamo)
-- ---------------------------------------------------------------------
CREATE USER c##g01_negocio IDENTIFIED BY negocio123
  DEFAULT TABLESPACE users
  TEMPORARY TABLESPACE temp
  QUOTA UNLIMITED ON users;

-- ---------------------------------------------------------------------
-- ESQUEMA 2: SEGURIDAD (control de acceso y auditoria)
-- ---------------------------------------------------------------------
CREATE USER c##g01_seguridad IDENTIFIED BY seguridad123
  DEFAULT TABLESPACE users
  TEMPORARY TABLESPACE temp
  QUOTA UNLIMITED ON users;

-- ---------------------------------------------------------------------
-- ESQUEMA 3: REPORTES (reporteria gerencial - solo lectura)
-- ---------------------------------------------------------------------
CREATE USER c##g01_reportes IDENTIFIED BY reportes123
  DEFAULT TABLESPACE users
  TEMPORARY TABLESPACE temp
  QUOTA UNLIMITED ON users;

-- ---------------------------------------------------------------------
-- PRIVILEGIOS BASICOS DE CONEXION Y CREACION DE OBJETOS
-- ---------------------------------------------------------------------
GRANT CONNECT, RESOURCE TO c##g01_negocio;
GRANT CONNECT, RESOURCE TO c##g01_seguridad;
GRANT CONNECT, RESOURCE TO c##g01_reportes;

GRANT CREATE TABLE, CREATE VIEW, CREATE SEQUENCE, CREATE PROCEDURE TO c##g01_negocio;
GRANT CREATE TABLE, CREATE VIEW, CREATE SEQUENCE, CREATE PROCEDURE TO c##g01_seguridad;
GRANT CREATE TABLE, CREATE VIEW, CREATE SEQUENCE, CREATE PROCEDURE TO c##g01_reportes;

-- ---------------------------------------------------------------------
-- PERMISO PARA ENCRIPTACION (DBMS_CRYPTO) - usado por SEG05
-- ---------------------------------------------------------------------
GRANT EXECUTE ON DBMS_CRYPTO TO c##g01_seguridad;
