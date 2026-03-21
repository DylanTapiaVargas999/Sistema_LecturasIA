# Informe de Estructura y Arquitectura del Proyecto LecturaIA

## 1. Visión General de la Arquitectura

El proyecto está construido como una **Single Page Application (SPA)** utilizando las siguientes tecnologías clave:
- **Framework Principal**: React (v18) con TypeScript.
- **Build Tool**: Vite.
- **Enrutamiento**: React Router v6.
- **Estilos**: Una combinación de Tailwind CSS y Material UI.
- **Comunicación con Backend**: Axios para peticiones HTTP a una API REST (.NET Core probablemente, dado el puerto 5267).
- **Gestión de Paquetes**: npm.

### Patrón de Diseño Principal
La aplicación sigue una arquitectura basada en **Componentes** y **Servicios**:
- **Capa de UI (Componentes/Páginas)**: Responsable de la renderización y la lógica de presentación.
- **Capa de Servicios (`src/services`)**: Abstracción de la lógica de negocio y comunicación con la API. Los componentes llaman a estos servicios en lugar de hacer peticiones HTTP directamente.
- **Capa de Configuración (`src/config`)**: Centralización de configuraciones transversales (como la instancia de Axios).

## 2. Análisis de la Estructura de Carpetas

La estructura actual en `src/` es clara y funcional para el tamaño actual del proyecto:

```
src/
├── components/       # Componentes reutilizables y específicos de funcionalidad
│   ├── admin/        # Componentes exclusivos para administradores
│   ├── docente/      # Componentes exclusivos para docentes
│   ├── estudiante/   # Componentes exclusivos para estudiantes
│   └── ...           # Componentes compartidos (Modales, Ayuda, etc.)
├── config/           # Configuraciones globales (Axios, constantes)
├── data/             # Datos estáticos (contenido de ayuda, menús)
├── pages/            # Vistas principales correspondientes a rutas
├── services/         # Lógica de comunicación con la API
└── types/            # (Sugerido) Definiciones de tipos TypeScript compartidos
```

### Puntos Fuertes
- **Segregación por Roles**: Las carpetas `admin`, `docente` y `estudiante` dentro de `components` ayudan a organizar el código por dominio de usuario.
- **Separación de Servicios**: Mantener la lógica de llamadas a la API separada de los componentes facilita el mantenimiento y las pruebas unitarias.

## 3. Áreas de Mejora y Deuda Técnica Detectada

### A. Redundancia en Configuración de API (Crítico)
Actualmente, múltiples archivos de servicio (`adminService.ts`, `lecturaService.ts`, etc.) definen su propia constante `BASE_URL` o `API_URL`.
- **Problema**: Si cambia la URL del backend, hay que editar múltiples archivos. Viola el principio DRY (Don't Repeat Yourself).
- **Solución**: Todos los servicios deben importar la instancia centralizada desde `src/config/api.ts`.

### B. Manejo de Estado
El estado se maneja principalmente de forma local (`useState`) o mediante "prop drilling" (pasar props a través de múltiples niveles).
- **Observación**: No se observa un gestor de estado global robusto (como Context API extensivo, Redux o Zustand) para datos compartidos como la sesión del usuario o preferencias. `AyudaContextual` parece ser un componente aislado.
- **Riesgo**: A medida que la aplicación crezca, compartir datos entre componentes no relacionados será complejo.

### C. Mezcla de Estrategias de Estilos
Se observa el uso conjunto de **Tailwind CSS** (clases utilitarias) y **Material UI** (componentes estilizados).
- **Riesgo**: Incrementa el tamaño del bundle final y puede generar inconsistencias visuales si no se tiene un sistema de diseño estricto que unifique ambos.

### D. Tipado (TypeScript)
Se ha detectado el uso de `any` en bloques `catch` y algunos estados.
- **Mejora**: Definir interfaces para las respuestas de error de la API y tipos estrictos para todos los estados y props.

## 4. Plan de Refactorización Recomendado

Para mejorar la mantenibilidad y escalabilidad del proyecto, sugiero las siguientes acciones en orden de prioridad:

### Fase 1: Estandarización de la Capa de Servicios (Inmediato)
1.  **Centralizar Axios**: Migrar `adminService.ts`, `lecturaService.ts`, `aulasService.ts` y cualquier otro servicio para que use **exclusivamente** la instancia exportada de `src/config/api.ts`.
2.  **Eliminar URLs Harcodeadas**: Borrar las definiciones de `BASE_URL` en los archivos individuales.

### Fase 2: Gestión de Tipos
1.  **Centralizar Interfaces**: Mover las interfaces compartidas (como `Usuario`, `AuthResponse`) a una carpeta `src/types` o un archivo `src/types/index.ts` para evitar importaciones circulares y duplicidad.
2.  **Strict Mode**: Asegurar que no existan `any` implícitos.

### Fase 3: Optimización de Componentes
1.  **Contexto de Autenticación**: Implementar un `AuthProvider` (React Context) que envuelva la aplicación para manejar el estado de la sesión (`user`, `token`, `isAuthenticated`) y evitar leer `localStorage` repetidamente en cada componente.
2.  **Lazy Loading**: Implementar `React.lazy` y `Suspense` para cargar las páginas de `admin`, `docente` y `estudiante` bajo demanda, reduciendo el tiempo de carga inicial.

## 5. Conclusión
La arquitectura base es sólida para un MVP o una aplicación mediana. El uso de TypeScript y la separación de servicios son grandes aciertos. La prioridad inmediata debe ser corregir la **redundancia en la configuración de la API** para evitar errores de conexión y facilitar el cambio entre entornos (desarrollo/producción).
