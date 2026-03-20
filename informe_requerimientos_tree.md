# 📋 Informe de Trazabilidad — Archivo por Archivo
**Proyecto:** Sistema LecturaIA | **Fecha:** 2026-03-20

## Leyenda de Requerimientos
| ID | Nombre corto |
|---|---|
| RF-001 | Autenticación y Autorización |
| RF-002 | Biblioteca Personal de Lecturas |
| RF-003 | Preferencias de Contenido |
| RF-004 | Generar Textos con IA |
| RF-005 | Interfaz de Lectura |
| RF-006 | Evaluaciones Inteligentes |
| RF-007 | Retroalimentación Automatizada |
| RF-008 | Configuración de Cuenta |
| RF-009 | Aulas y Vínculo de Estudiantes |
| RF-010 | Analytics Educativos |
| RF-011 | Administrar Plataforma |
| RF-012 | Ayuda y Tutoriales |
| RF-013 | Gestionar Evaluaciones (Examen Grupal) |

---

# 🗂️ LecturaIA.API

## `/LecturaIA.API` _(raíz)_

| Archivo | RF(s) | Líneas clave | Notas |
|---|---|---|---|
| `Program.cs` | **RF-001, RF-004, RF-006, RF-008, RF-009, RF-011, RF-012** | L1–200 | Configura JWT, DI de todos los servicios, CORS, roles |
| `appsettings.json` | **RF-001, RF-004, RF-008** | L1–35 | JWT secret, API key de IA, SMTP email |
| `LecturaIA.API.csproj` | _(Infraestructura)_ | — | Paquetes NuGet: BCrypt, JWT, EF Core, IA SDK |
| `Dockerfile` | _(Infraestructura)_ | — | Contenerización del API |
| `docker-compose.yml` | _(Infraestructura)_ | — | Orquestación API + Frontend + BD |
| `.dockerignore` | _(Infraestructura)_ | — | — |
| `LecturaIA.API.http` | _(Desarrollo)_ | — | Colección de pruebas de endpoints |

---

## `/Configuration`

| Archivo | RF(s) | Líneas clave | Notas |
|---|---|---|---|
| `IASettings.cs` | **RF-004** | L1–10 | `BaseUrl` y `ApiKey` para la API de IA (Gemini) |
| `EmailSettings.cs` | **RF-001, RF-008** | L1–16 | SMTP Host/Port para verificación (RF-001) y recuperación de contraseña (RF-008) |

---

## `/Controllers`

| Archivo | RF(s) | Líneas clave | Notas |
|---|---|---|---|
| `AuthController.cs` | **RF-001** | L18–266 (268 líneas) | Registro estudiante/docente, login, 2FA, verificación email, recuperación password |
| `AdminController.cs` | **RF-011** | L21–70 (72 líneas) | Listar/suspender/reactivar usuarios, reiniciar password, estadísticas |
| `AulasController.cs` | **RF-009** (90%) · **RF-013** (10%) | L48–556 (558 líneas) | Crear aula, unirse con código, mis-aulas, estudiantes del aula, remover estudiante |
| `LecturasController.cs` | **RF-002** (55%) · **RF-003** (22%) · **RF-004** (23%) | L33–381 (384 líneas) | Generar lectura con preferencias (RF-003/004), listar/eliminar/favoritas (RF-002) |
| `CuestionariosController.cs` | **RF-006** (51%) · **RF-007** (49%) | L56–733 (736 líneas) | Generar cuestionario, enviar respuestas, evaluar, retroalimentación, adaptación de nivel |
| `ExamenGrupalController.cs` | **RF-013** (94%) · **RF-004** (6%) | L37–660 (669 líneas) | Crear/listar/iniciar/completar/reasignar exámenes grupales |
| `MetricasController.cs` | **RF-010** | L27–350 (351 líneas) | Métricas individuales de estudiante y métricas de aula para docente |
| `SesionesLecturaController.cs` | **RF-005** (90%) · **RF-013** (10%) | L34–270 (273 líneas) | Iniciar/finalizar sesión de lectura, obtener sesión activa, actualizar tiempo |
| `PasswordController.cs` | **RF-008** | L26–69 (71 líneas) | Cambiar contraseña, validar fortaleza en tiempo real |
| `PerfilController.cs` | **RF-008** (70%) · **RF-003** (30%) | L28–94 (96 líneas) | Perfil del usuario con datos de nivel, intereses y clase actual |
| `AyudaController.cs` | **RF-012** | L21–49 (51 líneas) | Estado del tutorial, marcar tutorial como visto |
| `GradosController.cs` | **RF-001** | L21–41 (54 líneas) | Lista grados escolares para formulario de registro |
| `SeedController.cs` | **RF-011** (60%) · **RF-001** (40%) | L19–128 (137 líneas) | Crear admin inicial, reparar docentes, diagnóstico de BD |

---

## `/Services`

| Archivo | RF(s) | Notas |
|---|---|---|
| `AuthService.cs` | **RF-001** (80%) · **RF-008** (10%) · **RF-011** (10%) | Registro, login JWT, BCrypt, 2FA, verificación email, recuperación de contraseña, detección de cuentas suspendidas |
| `IAuthService.cs` | **RF-001** | Interfaz con contratos de autenticación |
| `LecturaIAService.cs` | **RF-004** (75%) · **RF-003** (25%) | `GenerarLecturaAsync()` — construye prompt con preferencias y llama a la API de IA |
| `CuestionarioIAService.cs` | **RF-006** (50%) · **RF-007** (40%) · **RF-004** (10%) | Genera 10 preguntas, evalúa preguntas abiertas con IA, genera retroalimentación personalizada en JSON |
| `AdminService.cs` | **RF-011** | Listar usuarios, suspender, reactivar, reiniciar password, estadísticas de plataforma |
| `ExamenGrupalService.cs` | **RF-013** (85%) · **RF-004** (15%) | Crear examen con IA, gestionar asignaciones, resultados consolidados |
| `EmailService.cs` | **RF-001** (70%) · **RF-008** (30%) | Envío de email de verificación, código 2FA (RF-001) y recuperación de contraseña (RF-008) |
| `IEmailService.cs` | **RF-001** (70%) · **RF-008** (30%) | Interfaz de `EmailService` |
| `PasswordService.cs` | **RF-008** | `CambiarPassword` con validación de password actual, `ValidarFortalezaPassword` |
| `IPasswordService.cs` | **RF-008** | Interfaz de `PasswordService` |
| `AyudaService.cs` | **RF-012** | `ObtenerEstadoTutorial`, `MarcarTutorialVisto` — persiste en BD |

---

## `/Data`

| Archivo | RF(s) | Líneas clave | Notas |
|---|---|---|---|
| `ApplicationDbContext.cs` | **RF-001, RF-002, RF-005, RF-006, RF-007, RF-009, RF-010, RF-011, RF-013** | L1–440 | DbSets de todas las entidades. Cada grupo de DbSets corresponde a un módulo: Usuarios/RF-001, Lecturas/RF-002, Sesiones/RF-005, Cuestionarios/RF-006–007, Aulas/RF-009, Exámenes/RF-013 |

---

## `/Models/Entities`

| Archivo | RF(s) | Notas |
|---|---|---|
| `Usuario.cs` | **RF-001** (70%) · **RF-011** (20%) · **RF-008** (10%) | `Email`, `PasswordHash`, `TipoUsuario`, `Activo` (suspensión), `TokenVerificacion`, `TokenRecuperacion` |
| `Estudiante.cs` | **RF-003** (40%) · **RF-007** (30%) · **RF-001** (20%) · **RF-006** (10%) | `Intereses`, `NivelEducativo`, `NivelDificultad` (auto-adaptado), `Edad`, `Grado` |
| `Docente.cs` | **RF-009** (70%) · **RF-001** (30%) | FK `UsuarioId`, colección de `Aulas` |
| `Aula.cs` | **RF-009** | `Nombre`, `Descripcion`, `CodigoVinculacion`, `Activa`, FK `DocenteId` |
| `Lectura.cs` | **RF-002** (40%) · **RF-003** (30%) · **RF-004** (20%) · **RF-005** (10%) | `Titulo`, `Contenido`, `UrlImagen`, `TipoLectura`, `Estado`, `Progreso`, `EsFavorita`, campos de preferencias |
| `Cuestionario.cs` | **RF-006** (60%) · **RF-007** (30%) · **RF-013** (10%) | `Estado`, `NivelDificultad`, `TipoTexto`, `FechaEnvio`, `EstudianteId` nullable |
| `Pregunta.cs` | **RF-006** (70%) · **RF-007** (30%) | `TextoPregunta`, `Tipo` (Literal/Analítica/Crítica), `Formato` (OpcionMultiple/Abierta), `Opciones`, `RespuestaCorrecta`, `Explicacion` |
| `RespuestaEstudiante.cs` | **RF-006** (40%) · **RF-007** (60%) | `TextoRespuesta`, `EsCorrecta`, `PuntajeIA`, `RetroalimentacionIA` |
| `ResultadoCuestionario.cs` | **RF-007** (70%) · **RF-010** (30%) | `PuntajeTotal`, `Porcentaje`, `CorrectasLiterales/Analiticas`, `RetroalimentacionPersonalizada`, `NivelAnterior/Nuevo`, `MensajeAdaptacion` |
| `SesionLectura.cs` | **RF-005** (60%) · **RF-010** (30%) · **RF-013** (10%) | `FechaInicio/Finalizacion`, `TiempoLecturaMinutos`, `Completada` |
| `ExamenGrupal.cs` | **RF-013** (90%) · **RF-004** (10%) | `Titulo`, `FechaLimite`, `AulaId`, `LecturaId`, colección de `Asignaciones` |
| `GradoEscolar.cs` | **RF-001** | Enum: `Cuarto`, `Quinto`, `Sexto` — usado en registro |
| `CodigoVerificacionLogin.cs` | **RF-001** | Entidad 2FA: `Codigo`, `Email`, `FechaExpiracion`, `Usado` |

---

## `/Models/DTOs`

| Archivo | RF(s) | Notas |
|---|---|---|
| `LoginDto.cs` | **RF-001** | `Email`, `Password` |
| `AuthResponseDto.cs` | **RF-001** | Token JWT, tipo de usuario, nombre |
| `RegistroEstudianteDto.cs` | **RF-001** (70%) · **RF-003** (30%) | Nombre, email, contraseña, grado, edad, intereses |
| `RegistroDocenteDto.cs` | **RF-001** | Nombre, email, contraseña, código institución |
| `VerificacionEmailDto.cs` | **RF-001** | Token de verificación y reenvío |
| `VerificarCodigoLoginDto.cs` | **RF-001** | DTOs 2FA: `LoginRequiere2FADto`, `LoginCuentaSuspendidaDto`, `ReenviarCodigoLoginDto` |
| `RecuperacionPasswordDto.cs` | **RF-001** (60%) · **RF-008** (40%) | `SolicitarRecuperacionDto`, `RestablecerPasswordDto` |
| `LecturaDto.cs` | **RF-002** (50%) · **RF-003** (25%) · **RF-004** (25%) | `GenerarLecturaRequestDto`, `LecturaGeneradaDto`, `LecturaListaDto`, `PreferenciasLecturaDto`, `MarcarFavoritaDto` |
| `ComprencionLectoraDto.cs` | **RF-006** (45%) · **RF-007** (45%) · **RF-005** (10%) | DTOs de cuestionario, preguntas, resultado, retroalimentación, análisis por tipo |
| `ExamenGrupalDto.cs` | **RF-013** (90%) · **RF-004** (10%) | `CrearExamenGrupalDto`, `ExamenGrupalDto`, `AsignacionExamenDto`, `ResultadosExamenGrupalDto` |
| `MetricasDto.cs` | **RF-010** | `MetricasEstudianteDto`, `MetricasAulaDto`, `EvolucionTemporalDto`, `AnalisisHabilidadDto`, `DistribucionTiposTextoDto` |
| `AdminDTOs.cs` | **RF-011** | `UsuarioAdminDto`, `SuspenderUsuarioDto`, `ReactivarUsuarioDto`, `EstadisticasAdminDto` |
| `PasswordDTOs.cs` | **RF-008** | `CambiarPasswordDto`, `ValidarPasswordRequest` |
| `PerfilUsuarioDto.cs` | **RF-008** (60%) · **RF-003** (30%) · **RF-009** (10%) | Perfil con nivel, intereses e info de clase actual |
| `AyudaDTOs.cs` | **RF-012** | `EstadoTutorialDto` |

---

## `/Migrations`
> 43 archivos (`.cs` + `.Designer.cs` + Snapshot). Son infraestructura de BD — no ejecutan lógica de negocio. Cada migración activa un RF:

| Archivo (migración) | RF activado |
|---|---|
| `20251005_InitialCreate` | **RF-001** (Usuarios, Docentes, Estudiantes) |
| `20251006_AddAdminFeatures` | **RF-011** (campo `Activo` para suspensión) |
| `20251012_VerificacionEmailYEliminarCodigos` | **RF-001** (email verificado) |
| `20251012_AgregarSistema2FA` | **RF-001** (tabla 2FA) |
| `20251012_AgregarTablaLecturas` | **RF-002, RF-004** |
| `20251015_AgregarSistemaComprensionLectora` | **RF-006, RF-007** |
| `20251019_AgregarSistemaAulas` | **RF-009** |
| `20251029_AgregarTiempoCuestionario` | **RF-010** |
| `20251116_AddExamenGrupal` | **RF-013** |
| `ApplicationDbContextModelSnapshot.cs` | Snapshot actual — refleja todos los RF |

---

## `/Properties`

| Archivo | RF(s) | Notas |
|---|---|---|
| `launchSettings.json` | _(Infraestructura)_ | Puertos de desarrollo local |

---
---

# 🗂️ LecturaIA.Frontend

## `/LecturaIA.Frontend` _(raíz)_

| Archivo | RF(s) | Notas |
|---|---|---|
| `index.html` | _(Infraestructura)_ | HTML de entrada de la SPA |
| `package.json` / `package-lock.json` | _(Infraestructura)_ | Dependencias npm |
| `vite.config.ts` | _(Infraestructura)_ | Bundler |
| `tsconfig.json` | _(Infraestructura)_ | Configuración TypeScript |
| `tailwind.config.js` / `postcss.config.js` | _(Infraestructura)_ | Estilos |
| `Dockerfile` / `.dockerignore` | _(Infraestructura)_ | Contenerización |

---

## `/src` _(raíz)_

| Archivo | RF(s) | Notas |
|---|---|---|
| `main.tsx` | _(Infraestructura)_ | Punto de entrada React |
| `App.tsx` | **RF-001** (60%) · **RF-012** (40%) | Enrutamiento principal, rutas protegidas por rol, redirección según tipo de usuario, integra `TutorialInicial` |
| `style.css` | _(Infraestructura)_ | Estilos globales base |
| `counter.ts` / `typescript.svg` | _(Infraestructura)_ | Utilidades de ejemplo |

---

## `/src/config`

| Archivo | RF(s) | Notas |
|---|---|---|
| `api.ts` | _(Infraestructura global)_ | Define `API_BASE_URL` — usado por todos los servicios |

---

## `/src/data`

| Archivo | RF(s) | Notas |
|---|---|---|
| `contenidoAyuda.ts` | **RF-012** | Objeto con textos de ayuda contextual y tooltips para cada sección y rol |

---

## `/src/services`

| Archivo | RF(s) | Notas |
|---|---|---|
| `authService.ts` | **RF-001** | `loginEstudiante/Docente/Admin`, `registrarEstudiante/Docente`, `verificarEmail`, `verificarCodigoLogin`, `solicitarRecuperacion`, `restablecerPassword` |
| `lecturaService.ts` | **RF-002** (50%) · **RF-003** (25%) · **RF-004** (25%) | `generarLectura`, `obtenerLecturas`, `obtenerLectura`, `eliminarLectura`, `marcarFavorita`, `obtenerFavoritas` |
| `cuestionarioService.ts` | **RF-006** (50%) · **RF-007** (50%) | `generarCuestionario`, `obtenerCuestionario`, `enviarRespuestas`, `obtenerResultado`, `verRespuestasDetalladas`, `obtenerHistorialLectura` |
| `sesionLecturaService.ts` | **RF-005** | `iniciarLectura`, `finalizarLectura`, `obtenerSesionActiva` |
| `aulasService.ts` | **RF-009** | `crearAula`, `unirseAClase`, `obtenerMiClase`, `obtenerMisAulas`, `obtenerEstudiantesDelAula`, `eliminarAula`, `salirDeClase`, `removerEstudiante` |
| `metricasService.ts` | **RF-010** | `obtenerMetricasEstudiante(id)`, `obtenerMetricasAula(id)` |
| `adminService.ts` | **RF-011** | `obtenerUsuarios`, `suspenderUsuario`, `reactivarUsuario`, `reiniciarPassword`, `obtenerEstadisticas` |
| `examenGrupalService.ts` | **RF-013** | `crearExamen`, `listarExamenesAula`, `obtenerAsignados`, `obtenerAsignacion`, `iniciarExamen`, `completarExamen`, `obtenerResultados`, `eliminarExamen`, `reasignarExamen` |
| `passwordService.ts` | **RF-008** | `cambiarPassword`, `validarFortaleza` |
| `perfilService.ts` | **RF-008** (60%) · **RF-003** (40%) | `obtenerPerfil` — retorna nivel, intereses, clase actual |
| `ayudaService.ts` | **RF-012** | `obtenerEstadoTutorial`, `marcarTutorialVisto` |

---

## `/src/pages`

| Archivo | RF(s) | Líneas | Notas |
|---|---|---|---|
| `Home.tsx` | **RF-001** (80%) · **RF-012** (20%) | 133 | Selector de rol (Estudiante/Docente/Admin) para acceder al login/registro |
| `EstudianteAuth.tsx` | **RF-001** | 342 | Login + registro Estudiante, verificación email, 2FA, recuperación password |
| `EstudianteAuth.tsx.old` | _(Legacy, descartado)_ | — | — |
| `DocenteAuth.tsx` | **RF-001** | 325 | Login + registro Docente, verificación email, 2FA, recuperación password |
| `VerificarEmail.tsx` | **RF-001** | 155 | Confirmación de email mediante token en URL |
| `RecuperarPassword.tsx` | **RF-001** (80%) · **RF-008** (20%) | 267 | Flujo completo de recuperación: solicitud → validación → restablecimiento |
| `EstudianteDashboard.tsx` | **RF-002, RF-003, RF-004, RF-005, RF-008, RF-009, RF-012, RF-013** | 1 320 | **Archivo más grande.** Dashboard del estudiante: biblioteca, encuesta, generar lectura, mi clase, exámenes, cuenta |
| `LecturaVistaLectura.tsx` | **RF-005** (80%) · **RF-006** (20%) | 325 | Interfaz de lectura limpia con temporizador y botón "Finalizar lectura" |
| `LecturaDetalle.tsx` | **RF-002** (50%) · **RF-005** (30%) · **RF-006** (20%) | 342 | Detalle de lectura de la biblioteca: portada, historial de cuestionarios, acceso a nueva sesión |
| `CuestionarioGeneracion.tsx` | **RF-006** | 322 | Pantalla de espera con polling mientras la IA genera el cuestionario |
| `CuestionarioRespuesta.tsx` | **RF-006** | 549 | Interfaz de respuesta: opción múltiple + preguntas abiertas + temporizador |
| `CuestionarioResultados.tsx` | **RF-007** (70%) · **RF-010** (30%) | 769 | Puntaje, retroalimentación IA, análisis por tipo de pregunta, adaptación de nivel |
| `CuestionarioRevision.tsx` | **RF-007** | 541 | Revisión pregunta por pregunta: respuesta correcta, explicación, feedback IA |
| `HistorialResultados.tsx` | **RF-007** (60%) · **RF-010** (40%) | 419 | Historial de cuestionarios del estudiante con gráficas de evolución |
| `DocenteDashboard.tsx` | **RF-009** (35%) · **RF-010** (30%) · **RF-013** (20%) · **RF-012** (10%) · **RF-008** (5%) | 740 | Dashboard docente: aulas, métricas, exámenes grupales |
| `DocenteAulasPage.tsx` | **RF-009** | 375 | Lista de aulas del docente con acceso a detalle |
| `AulaDetalleDocente.tsx` | **RF-009** (40%) · **RF-013** (35%) · **RF-010** (25%) | 714 | Gestión de estudiantes del aula, exámenes, métricas |
| `AdminDashboard.tsx` | **RF-011** | 643 | _(Legacy)_ Dashboard admin — gestión usuarios y estadísticas |
| `DashboardAdmin.tsx` | **RF-011** | 599 | Dashboard admin activo: gestión usuarios, suspender/reactivar, estadísticas |
| `PoliticasPrivacidad.tsx` | _(Informativo)_ | 163 | Políticas de privacidad. Sin RF funcional. |

---

## `/src/components`

| Archivo | RF(s) | Líneas | Notas |
|---|---|---|---|
| `EncuestaGuiadaModal.tsx` | **RF-003** | 601 | Encuesta multi-paso: temas (máx 2), personajes, escenario, longitud, emoción, propósito |
| `VistaPreviaPreferenciasModal.tsx` | **RF-003** (70%) · **RF-004** (30%) | 289 | Vista previa de preferencias + botón "Generar con IA" |
| `TutorialInicial.tsx` | **RF-012** | 266 | Tutorial interactivo por pasos diferenciado por rol (Estudiante/Docente) |
| `AyudaContextual.tsx` | **RF-012** | 106 | Botón `?` con popover de ayuda contextual, consume `contenidoAyuda.ts` |
| `VerificacionCodigo.tsx` | **RF-001** | 257 | Modal de verificación de código 2FA durante el login |
| `CambiarPasswordModal.tsx` | **RF-008** | 401 | Modal "Mi Cuenta": cambiar contraseña con medidor de fortaleza en tiempo real |
| `MiPerfilModal.tsx` | **RF-008** (60%) · **RF-003** (40%) | 361 | Modal de perfil: datos, nivel de dificultad, intereses, clase actual |
| `MetricasEstudianteModal.tsx` | **RF-010** | 357 | Gráfico de evolución, análisis de habilidades, nivel y tipo de texto favorito |
| `MetricasSalonModal.tsx` | **RF-010** | 466 | Métricas del salón: promedio de clase, distribución por tipo de texto, progreso semanal |
| `MiClaseModal.tsx` | **RF-009** | 423 | Modal estudiante: unirse con código, ver info del aula, salir de clase |

---

## `/src/components/Estudiante`

| Archivo | RF(s) | Líneas | Notas |
|---|---|---|---|
| `ListaExamenesAsignados.tsx` | **RF-013** | 346 | Lista de exámenes asignados con estado (Pendiente/En Progreso/Completado/Vencido) |
| `ListaExamenesAsignados.css` | _(Estilo)_ | 209 | CSS del componente anterior |
| `RealizarExamenGrupal.tsx` | **RF-013** | 320 | Flujo completo: leer texto del examen + responder cuestionario clonado |

---

## `/src/components/admin`

| Archivo | RF(s) | Líneas | Notas |
|---|---|---|---|
| `GestionUsuarios.tsx` | **RF-011** | 461 | Tabla de usuarios: búsqueda, suspender/reactivar, reiniciar contraseña |
| `EstadisticasAdmin.tsx` | **RF-011** | 100 | Tarjetas: total estudiantes, docentes, lecturas, cuestionarios |
| `CodigosDocentes.tsx` | **RF-011** (70%) · **RF-001** (30%) | 219 | Admin gestiona códigos de validación para registro de Docentes |

---

## `/src/components/docente`

| Archivo | RF(s) | Líneas | Notas |
|---|---|---|---|
| `CrearAulaModal.tsx` | **RF-009** | 258 | Modal: nombre, descripción del aula, código generado automáticamente |
| `CodigosEstudiantes.tsx` | **RF-009** | 227 | Muestra código de vinculación del aula para compartir |
| `CrearExamenGrupal.tsx` | **RF-013** (80%) · **RF-004** (20%) | 334 | Formulario: parámetros del texto, fecha límite, genera lectura+cuestionario con IA |
| `CrearExamenGrupal.css` | _(Estilo)_ | 130 | CSS del componente anterior |
| `ListaExamenesAula.tsx` | **RF-013** | 375 | Lista de exámenes del aula: estado, acceso a resultados y reasignación |
| `ResultadosExamenGrupal.tsx` | **RF-013** (70%) · **RF-010** (30%) | 382 | Tabla: calificación por estudiante, promedio clase, estado de entrega |
| `ResultadosExamenGrupal.css` | _(Estilo)_ | 215 | CSS del componente anterior |

---

## `/public`

| Archivo | RF(s) | Notas |
|---|---|---|
| `estudiante.png` | _(Visual)_ | Imagen usada en pantalla de login |
| `docente.png` | _(Visual)_ | Imagen usada en pantalla de login |
| `vite.svg` / `vite - copia.svg` | _(Visual)_ | Iconos |

---

# 📊 Índice rápido: ¿Qué archivos cubre cada RF?

| RF | Archivos clave (API) | Archivos clave (Frontend) |
|---|---|---|
| **RF-001** | `AuthController`, `AuthService`, `IAuthService`, `EmailService`, `GradosController`, `RegistroEstudianteDto`, `LoginDto`, `AuthResponseDto`, `VerificacionEmailDto`, `VerificarCodigoLoginDto`, `CodigoVerificacionLogin.cs` | `EstudianteAuth`, `DocenteAuth`, `VerificarEmail`, `RecuperarPassword`, `VerificacionCodigo`, `authService.ts`, `Home.tsx`, `App.tsx` |
| **RF-002** | `LecturasController`, `Lectura.cs`, `LecturaDto.cs` | `EstudianteDashboard`, `LecturaDetalle`, `lecturaService.ts` |
| **RF-003** | `LecturasController` (POST generar), `LecturaIAService`, `Estudiante.cs`, `RegistroEstudianteDto`, `LecturaDto.cs` | `EncuestaGuiadaModal`, `VistaPreviaPreferenciasModal`, `MiPerfilModal`, `lecturaService.ts`, `perfilService.ts` |
| **RF-004** | `LecturasController` (POST generar), `LecturaIAService`, `IASettings.cs`, `ExamenGrupalService` | `VistaPreviaPreferenciasModal`, `CrearExamenGrupal`, `lecturaService.ts` |
| **RF-005** | `SesionesLecturaController`, `SesionLectura.cs` | `LecturaVistaLectura`, `LecturaDetalle`, `sesionLecturaService.ts` |
| **RF-006** | `CuestionariosController`, `CuestionarioIAService`, `Cuestionario.cs`, `Pregunta.cs`, `ComprencionLectoraDto.cs` | `CuestionarioGeneracion`, `CuestionarioRespuesta`, `cuestionarioService.ts` |
| **RF-007** | `CuestionariosController`, `CuestionarioIAService`, `ResultadoCuestionario.cs`, `RespuestaEstudiante.cs` | `CuestionarioResultados`, `CuestionarioRevision`, `HistorialResultados`, `cuestionarioService.ts` |
| **RF-008** | `PasswordController`, `PasswordService`, `PerfilController`, `AuthService`, `EmailService`, `PasswordDTOs.cs` | `CambiarPasswordModal`, `MiPerfilModal`, `RecuperarPassword`, `passwordService.ts`, `perfilService.ts` |
| **RF-009** | `AulasController`, `Aula.cs`, `Docente.cs` | `DocenteAulasPage`, `AulaDetalleDocente`, `MiClaseModal`, `CrearAulaModal`, `CodigosEstudiantes`, `aulasService.ts` |
| **RF-010** | `MetricasController`, `ResultadoCuestionario.cs`, `SesionLectura.cs` | `MetricasEstudianteModal`, `MetricasSalonModal`, `ResultadosExamenGrupal`, `CuestionarioResultados`, `metricasService.ts` |
| **RF-011** | `AdminController`, `AdminService`, `SeedController`, `AdminDTOs.cs` | `DashboardAdmin`, `GestionUsuarios`, `EstadisticasAdmin`, `CodigosDocentes`, `adminService.ts` |
| **RF-012** | `AyudaController`, `AyudaService`, `AyudaDTOs.cs` | `AyudaContextual`, `TutorialInicial`, `contenidoAyuda.ts`, `ayudaService.ts`, `App.tsx` |
| **RF-013** | `ExamenGrupalController`, `ExamenGrupalService`, `ExamenGrupal.cs`, `ExamenGrupalDto.cs` | `CrearExamenGrupal`, `ListaExamenesAula`, `ListaExamenesAsignados`, `RealizarExamenGrupal`, `ResultadosExamenGrupal`, `examenGrupalService.ts` |
