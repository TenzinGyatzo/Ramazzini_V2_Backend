# Phase 2 — UAT mínimo: "Listo para regulatorio"

**Objetivo:** Verificación manual mínima de que el flujo end-to-end deja los archivos GIIS listos para carga regulatoria (SINBA), alineado con CONTEXT.md y los planes 02-01, 02-02, 02-03.

---

## Escenario UAT 1: Pre-validación sin generar TXT

1. Usuario Principal o Administrador selecciona periodo (ej. 2025-01) y guías (CDT, CEX, LES).
2. Ejecuta **pre-validación** (endpoint o botón "Validar sin generar").
3. **Esperado:** Lista de errores/advertencias por renglón (guía, campo, causa, severidad); **no** se genera ningún archivo TXT en disco.
4. Si hay bloqueantes, el sistema no debe ofrecer "Generar entregable" sin corregir o aceptar skip row.

---

## Escenario UAT 2: Generación con skip row y Reporte de Excluidos

1. Con datos que incluyan al menos un registro inválido (obligatorio faltante o fuera de catálogo), usuario genera batch para periodo y guía(s).
2. **Esperado:** Se genera TXT con solo filas válidas; existe "Reporte de Excluidos" (grid o descarga CSV) con guía, renglón, campo, causa.
3. Estado del batch: `validationStatus` = has_blockers o has_warnings o validated según corresponda.
4. Si hay solo warnings, el sistema debe permitir continuar a "Generar entregable" con confirmación explícita.

---

## Escenario UAT 3: Naming oficial y entregable ZIP

1. Usuario con CLUES válida (ej. 11 caracteres) genera batch y luego "Generar entregable" (cifrar + ZIP).
2. **Esperado:** Archivo descargado con nombre `[TIPO]-[ENTIDAD][INST]-[AA][MM].ZIP` (ej. LES-DFSSA-2501.ZIP). Dentro del ZIP, archivo .CIF con **mismo nombre base** (solo extensión .CIF).
3. Usuario con CLUES 9998 genera entregable.
4. **Esperado:** Nombre con 99SMP (ej. CDT-99SMP-2501.ZIP). En pantalla o respuesta, **advertencia** visible: reporte de información requiere CLUES válida (Anexo 3); archivo podría ser rechazado por DGIS.

---

## Escenario UAT 4: Auditoría y reintentos

1. Usuario genera batch para 2025-01 y completa entregable. Anota batchId.
2. Usuario "regenera" (crea otro batch para 2025-01, misma guía).
3. **Esperado:** Segundo batch con _id distinto; segundo registro de auditoría. Nombre del archivo al descargar sigue siendo el mismo (nombre oficial). No se sobrescribe el primer evento.
4. En registro de auditoría: usuario, fecha/hora, periodo, CLUES, cluesEs9998 (true/false), nombre archivo, hash SHA-256 del archivo, resumen validación (ej. "N procesados, M excluidos").

---

## Criterio de éxito "Listo para regulatorio"

- Pre-validación disponible y no genera TXT.
- Generación con skip row produce TXT válido y Reporte de Excluidos.
- Cifrado solo si sin bloqueantes; con warnings, solo con confirmación.
- Naming exacto y mismo basename TXT/CIF/ZIP; 9998 → 99SMP; advertencia 9998 en entrega.
- Cada generación queda registrada en auditoría con hash y datos requeridos; reintento = nuevo evento.
- (Opcional) Validación con herramienta DGIS cuando esté disponible (checkpoint 3DES).
