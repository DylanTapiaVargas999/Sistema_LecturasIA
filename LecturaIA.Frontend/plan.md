# Plan de Mejora de Código - Fases de Refactorización

Este documento define la hoja de ruta para resolver las violaciones de código y áreas de mejora identificadas en `ultimo_informe.md`. Se ha dividido en fases para asegurar una implementación ordenada y minimizar el riesgo de regresiones.

## 📅 Fase 1: Limpieza y "Quick Wins" (Prioridad Alta)
**Objetivo:** Eliminar deuda técnica obvia, código duplicado y números mágicos restantes.

### Tareas:
1.  **Eliminación de Archivos Duplicados**:
    *   Eliminar `src/pages/DashboardAdmin.tsx` (versión legada de `AdminDashboard.tsx`).
    *   Verificar que `App.tsx` apunte únicamente a `AdminDashboard.tsx`.

2.  **Centralización de Constantes faltantes**:
    *   En `src/config/constants.ts`, añadir:
        ```typescript
        export const UI_CONFIG = {
          MAX_SURVEY_SELECTIONS: 2,
          POLLING_INTERVAL_MS: 2000,
          DEBOUNCE_DELAY_MS: 500
        };
        ```
    *   Refactorizar `src/pages/CuestionarioGeneracion.tsx` (reemplazar `2000`).
    *   Refactorizar `src/components/EncuestaGuiadaModal.tsx` (reemplazar `2`).
    *   Refactorizar `src/components/CambiarPasswordModal.tsx` (reemplazar `500`).

3.  **Normalización de Logs**:
    *   En `src/components/MiPerfilModal.tsx`, eliminar el emoji `❌` del `console.error` para mantener un estándar profesional.

---

## 📅 Fase 2: Abstracción y DRY (Prioridad Media)
**Objetivo:** Reducir la duplicidad de código en manejo de errores y lógica de UI.

### Tareas:
1.  **Hook de Manejo de Errores (`useAsyncHandler`)**:
    *   Crear `src/hooks/useAsync.ts`:
        *   Debe abstractar el patrón `try { setLoading(true) ... } catch { setError() } finally { setLoading(false) }`.
    *   Implementar este hook en al menos un componente clave (ej. `EstudianteAuth.tsx`) como prueba de concepto.

2.  **Utilidad de Logging Centralizado**:
    *   Crear `src/utils/logger.ts`:
        *   Clase estática o servicio que envuelva `console.log/error`.
        *   Debe permitir desactivar logs en producción mediante variables de entorno (ej. `import.meta.env`).
    *   Reemplazar llamadas directas a `console` en servicios principales.

3.  **Refactorización de `EncuestaGuiadaModal.tsx`**:
    *   Unificar `handleToggleTema` y `handleTogglePersonaje` en una función genérica `handleToggleSelection<T>(item: T, list: T[], setter: (l: T[]) => void)`.

---

## 📅 Fase 3: Arquitectura y Documentación (Prioridad Baja) - ✅ COMPLETADO
**Objetivo:** Mejorar la estructura de componentes grandes y la documentación del código.

### Tareas:
1.  **Refactorización de `EstudianteDashboard.tsx`**: (✅ Hecho)
    *   Identificar secciones extraíbles.
    *   Crear sub-componentes en `src/components/dashboard/`:
        *   `LecturasList.tsx` (Manejo de la lista de lecturas).
        *   `LecturasFilter.tsx` (Manejo de filtros).
    *   Simplificar el componente padre.

2.  **Documentación JSDoc**: (✅ Hecho)
    *   Añadir comentarios descriptivos (JSDoc) a las interfaces públicas de los servicios clave:
        *   `src/services/authService.ts`
        *   `src/services/lecturaService.ts`
        *   `src/services/cuestionarioService.ts`
        *   (Y todos los demás servicios también).
    *   Describir parámetros y tipos de retorno para facilitar el mantenimiento futuro.

---

## ✅ Criterios de Éxito
*   `src/config/constants.ts` contiene todos los valores numéricos de configuración.
*   No existen archivos duplicados (`DashboardAdmin.tsx` eliminado).
*   El patrón de manejo de errores está centralizado en un Hook o utilidad.
*   Los servicios principales están documentados con JSDoc.
