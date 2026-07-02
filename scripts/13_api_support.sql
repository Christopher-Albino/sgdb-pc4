-- #####################################################################
-- #  SCRIPT 13: SOPORTE PARA LA API (frontend + backend Node)         #
-- #####################################################################
--
-- Objetivo: el backend entra con el usuario de aplicacion C##G01_APP,
-- que SOLO tiene EXECUTE sobre los paquetes (no SELECT sobre tablas).
--
-- El login (SEG01 -> autenticar_usuario) devuelve el NOMBRE DEL ROL,
-- pero las demas operaciones necesitan el ID_USUARIO del operador
-- (p_id_analista, p_id_cajero, p_id_admin...). Como C##G01_APP no puede
-- consultar t_usuario directamente, se crea este procedimiento de apoyo
-- en el esquema de seguridad (definer rights) que autentica y ademas
-- devuelve el id_usuario. Es ADITIVO: no modifica ninguno de los 5
-- paquetes existentes.
--
-- EJECUTAR EN: CONN_SEGURIDAD  (usuario c##g01_seguridad)
-- =====================================================================

CREATE OR REPLACE PROCEDURE sp_login_api(
  p_username   IN  VARCHAR2,
  p_password   IN  VARCHAR2,
  p_id_usuario OUT NUMBER,
  p_rol        OUT VARCHAR2
) AS
BEGIN
  -- Reutiliza EXACTAMENTE la logica de SEG01 (hash SHA256, bloqueo, auditoria).
  p_rol := pkg_seguridad.autenticar_usuario(p_username, p_password);

  IF p_rol IN ('DENEGADO', 'BLOQUEADO') THEN
    p_id_usuario := NULL;   -- login fallido: no exponemos id
  ELSE
    SELECT id_usuario INTO p_id_usuario
      FROM t_usuario
     WHERE username = p_username;
  END IF;
END sp_login_api;
/

-- El backend (C##G01_APP) solo necesita EXECUTE sobre este procedimiento.
GRANT EXECUTE ON sp_login_api TO c##g01_app;

-- =====================================================================
-- FIN DEL SCRIPT 13
-- =====================================================================
