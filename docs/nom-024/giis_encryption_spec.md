# Especificación de cifrado GIIS (.CIF)

**Fecha:** 2026-02  
**Estado:** Pendiente de validación con herramienta DGIS.

## Algoritmo

- **Cifrado:** 3DES en modo CBC.
- **Identificador Node.js:** `des-ede3-cbc`.
- **IV:** 8 bytes. (Origen: aleatorio por cifrado o fijo según especificación DGIS; pendiente de validación.)
- **Clave:** 24 bytes (192 bits). **Solo desde configuración segura** (variable de entorno o secret); nunca hardcodeada en código de producción.
- **Padding:** PKCS7 (comportamiento por defecto de `crypto.createCipheriv`).

## Formato .CIF

El archivo `.CIF` contiene el ciphertext binario (salida del cifrado 3DES del contenido TXT en encoding Windows-1252).

## Validación pendiente DGIS

Hasta que los parámetros (IV, derivación de clave, formato .CIF) se validen con la herramienta oficial DGIS:

- La variable de entorno `GIIS_ENCRYPTION_VALIDATED` debe permanecer en `false` en entornos que no hayan realizado dicha validación.
- Con `GIIS_ENCRYPTION_VALIDATED=false`, el endpoint de generación de entregable responde **409 Conflict** y no se generan archivos .CIF ni .ZIP.
- Con `GIIS_ENCRYPTION_VALIDATED=true` se permite generar .CIF y .ZIP; la implementación no garantiza compatibilidad con DGIS hasta completar la validación.
