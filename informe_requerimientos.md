# 📋 Informe de Trazabilidad: Archivos ↔ Requerimientos Funcionales
**Proyecto:** Sistema LecturaIA  
**Fecha:** 2026-03-20  
**Cobertura:** LecturaIA.API + LecturaIA.Frontend  

---

## Tabla de Requerimientos

| ID | Nombre | Prioridad |
|---|---|---|
| RF-001 | Autenticación y Autorización | Alta |
| RF-002 | Biblioteca Personal de Lecturas | Alta |
| RF-003 | Preferencias de Contenido | Altísima |
| RF-004 | Generar Textos con IA | Altísima |
| RF-005 | Interfaz de Lectura | Alta |
| RF-006 | Evaluaciones Inteligentes | Alta |
| RF-007 | Retroalimentación Automatizada | Alta |
| RF-008 | Configuración de Cuenta | Baja |
| RF-009 | Aulas y Vínculo de Estudiantes | Alta |
| RF-010 | Analytics Educativos | Alta |
| RF-011 | Administrar Plataforma | Alta |
| RF-012 | Ayuda y Tutoriales | Baja |
| RF-013 | Gestionar Evaluaciones (Examen Grupal) | Alta |

---

# PARTE 1 — LecturaIA.API

## 📁 `/LecturaIA.API` (Raíz)

---

### `Program.cs` — 200 líneas
**Propósito:** Punto de entrada, configura servicios, autenticación JWT, CORS, base de datos y DI.

| RF | Líneas | % | Rol |
|---|---|---|---|
| RF-001 | L1–200 | 40% | Configura JWT Bearer, roles (Estudiante/Docente/Administrador), política CORS |
| RF-009 | L1–200 | 15% | Registra `AulasController`, autorización por roles |
| RF-004 | L1–200 | 15% | Registra `LecturaIAService`, `ICuestionarioIAService` (IASettings) |
| RF-011 | L1–200 | 10% | Registra `AdminService` |
| RF-006 | L1–200 | 10% | Registra `CuestionarioIAService` |
| RF-012 | L1–200 | 5% | Registra `AyudaService` |
| RF-008 | L1–200 | 5% | Registra `PasswordService` |

---

### `appsettings.json` — ~35 líneas
**Propósito:** Configuración de cadenas de conexión, JWT, email (SMTP) y API de IA.

| RF | Líneas | % | Rol |
|---|---|---|---|
| RF-001 | L1–35 | 40% | Configuración JWT: `SecretKey`, `Issuer`, `Audience` |
| RF-004 | L1–35 | 30% | Configuración IA: URL y ApiKey de Gemini/OpenAI |
| RF-001 | L1–35 | 20% | Configuración email para verificación y 2FA |
| RF-008 | L1–35 | 10% | Email SMTP para recuperación de contraseña |

---

### `LecturaIA.API.csproj` — ~25 líneas
**Propósito:** Definición del proyecto, paquetes NuGet.

| RF | % | Rol |
|---|---|---|
| Infraestructura | 100% | Habilita BCrypt, JWT, EF Core, IA SDK — soporte a todos los RFs |

---

### `docker-compose.yml` / `Dockerfile` / `.dockerignore`
**Propósito:** Contenerización del API y frontend.

| RF | % | Rol |
|---|---|---|
| Infraestructura | 100% | Despliegue de toda la plataforma. Soporte indirecto a todos los RFs. |

---

## 📁 `/LecturaIA.API/Controllers`

---

### `AuthController.cs` — 268 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-001 | L18–51 | 20% | `POST registro/estudiante` — Registro de Estudiante |
| RF-001 | L53–86 | 20% | `POST registro/docente` — Registro de Docente |
| RF-001 | L88–128 | 18% | `POST login` — Login con JWT + control cuentas suspendidas |
| RF-001 | L130–176 | 14% | `POST verificar-email` + `reenviar-verificacion` |
| RF-001 | L178–217 | 14% | `POST solicitar-recuperacion` + `restablecer-password` |
| RF-001 | L219–266 | 14% | `POST verificar-codigo-login` + `reenviar-codigo-login` (2FA) |

> **RF-001: 100%** — Archivo exclusivo de autenticación.

---

### `AdminController.cs` — 72 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-011 | L21–26 | 25% | `GET usuarios` — Listado y filtro por email |
| RF-011 | L29–38 | 20% | `POST usuarios/suspender` — Suspender cuenta |
| RF-011 | L41–50 | 20% | `POST usuarios/reactivar` — Reactivar cuenta |
| RF-011 | L53–62 | 20% | `POST usuarios/reiniciar-password` — Admin reinicia password |
| RF-011 | L65–70 | 15% | `GET estadisticas` — Estadísticas generales de la plataforma |

> **RF-011: 100%** — Exclusivo administración.

---

### `AulasController.cs` — 558 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-009 | L25–44 | 8% | `GenerarCodigoVinculacion()` — Genera código único de 6 caracteres |
| RF-009 | L48–104 | 18% | `POST crear` — Docente crea aula nueva con código |
| RF-009 | L109–195 | 19% | `POST unirse` — Estudiante se une con código |
| RF-009 | L197–254 | 11% | `GET mi-clase` — Estudiante consulta su aula activa |
| RF-009 | L259–295 | 9% | `GET {id}` — Detalle de aula |
| RF-009 | L300–341 | 8% | `POST salir` — Estudiante sale de clase |
| RF-009 | L346–389 | 9% | `GET mis-aulas` — Docente lista sus aulas |
| RF-009 | L394–446 | 9% | `DELETE {id}` — Docente elimina aula (soft delete) |
| RF-009 | L451–503 | 9% | `GET {id}/estudiantes` — Docente ve lista de estudiantes |
| RF-013 | L505–556 | 10% | `DELETE {aulaId}/estudiante/{id}` — Remover estudiante (soporte exámenes) |

> **RF-009: 90% | RF-013: 10%**

---

### `LecturasController.cs` — 384 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-003 | L33–115 | 30% | `POST generar` — Recibe preferencias y las pasa al servicio IA |
| RF-004 | L33–115 | 30% | `POST generar` — `LecturaIAService.GenerarLecturaAsync()` genera texto |
| RF-002 | L117–162 | 20% | `GET /` — Lista todas las lecturas del estudiante (biblioteca) |
| RF-002 | L164–226 | 15% | `GET {id}` — Obtiene detalle de una lectura |
| RF-002 | L228–306 | 25% | `DELETE {id}` — Elimina lectura + sesiones + cuestionarios |
| RF-002 | L308–381 | 20% | `PUT {id}/favorita` + `GET favoritas` — Gestión de favoritas |

> **RF-002: 55% | RF-003: 22% | RF-004: 23%**

---

### `CuestionariosController.cs` — 736 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-006 | L56–191 | 26% | `POST generar` — Genera cuestionario de 10 preguntas con IA según nivel |
| RF-006 | L193–247 | 7% | `GET {id}` — Obtiene cuestionario con preguntas (sin respuestas) |
| RF-006 | L249–328 | 11% | `POST {id}/enviar` — Estudiante envía respuestas |
| RF-007 | L368–480 | 15% | `EvaluarCuestionarioAsync()` — Calcula puntaje, evalúa abiertas con IA |
| RF-007 | L482–537 | 7% | `AdaptarNivelEstudiante()` — Sube/baja nivel automáticamente |
| RF-007 | L439–475 | 8% | Genera retroalimentación personalizada con IA |
| RF-007 | L645–698 | 7% | `GET {id}/resultado` — Obtiene resultado evaluado |
| RF-007 | L700–733 | 7% | `GET lectura/{id}/historial` — Historial de evaluaciones |
| RF-007 | L330–362 | 5% | `GET {id}/respuestas` — Detalle de respuestas |
| RF-006 | L552–643 | 7% | `MapearResultadoADto()` — Estructura el resultado con análisis por tipo |

> **RF-006: 51% | RF-007: 49%**

---

### `ExamenGrupalController.cs` — 669 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-013 | L37–90 | 14% | `GET docente/aula/{id}` — Lista exámenes del aula |
| RF-013 | L95–228 | 20% | `POST {id}/reasignar` — Reasignar examen (resetea intentos) |
| RF-013 | L233–266 | 6% | `POST crear` — Docente crea examen grupal con IA |
| RF-013 | L271–291 | 4% | `GET salon/{aulaId}` — Exámenes de un salón |
| RF-013 | L296–316 | 4% | `GET asignados` — Estudiante ve sus exámenes asignados |
| RF-013 | L321–347 | 5% | `GET {id}/resultados` — Resultados consolidados para docente |
| RF-013 | L352–381 | 5% | `POST {id}/completar` — Estudiante completa examen |
| RF-013 | L386–412 | 5% | `DELETE {id}` — Eliminar examen |
| RF-013 | L417–506 | 13% | `GET asignacion/{id}` — Datos para realizar el examen |
| RF-013 | L511–633 | 18% | `POST iniciar/{id}` — Inicia el examen, clona cuestionario y preguntas |
| RF-004 | L233–266 | 6% | Usa IA para generar lectura y cuestionario del examen grupal |

> **RF-013: 94% | RF-004: 6%**

---

### `MetricasController.cs` — 351 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-010 | L27–188 | 55% | `GET estudiante/{id}` — Métricas individuales: lecturas, promedio, nivel, evolución temporal, análisis por tipo de pregunta |
| RF-010 | L193–350 | 45% | `GET aula/{id}` — Métricas de clase: promedio, distribución por tipo de texto, progreso semanal (8 semanas) |

> **RF-010: 100%** — Exclusivo analytics educativos.

---

### `SesionesLecturaController.cs` — 273 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-005 | L34–99 | 36% | `POST iniciar` — Inicia sesión de lectura, cambia estado a "en_progreso" |
| RF-005 | L105–166 | 36% | `POST finalizar` — Finaliza sesión, registra tiempo, progreso=100% |
| RF-005 | L172–216 | 18% | `GET activa/{id}` — Obtiene sesión activa de una lectura |
| RF-013 | L222–270 | 10% | `PATCH {id}/tiempo` — Actualiza tiempo para exámenes grupales |

> **RF-005: 90% | RF-013: 10%**

---

### `PasswordController.cs` — 71 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-008 | L26–50 | 70% | `POST cambiar` — Estudiante/Docente cambia su contraseña |
| RF-008 | L55–69 | 30% | `POST validar` — Valida fortaleza de contraseña en tiempo real |

> **RF-008: 100%** — Exclusivo gestión de cuenta.

---

### `PerfilController.cs` — 96 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-008 | L28–94 | 70% | `GET /` — Perfil del usuario con datos de nivel, intereses, clase actual |
| RF-003 | L57–84 | 30% | Expone datos de preferencias e intereses del estudiante |

> **RF-008: 70% | RF-003: 30%**

---

### `AyudaController.cs` — 51 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-012 | L21–34 | 50% | `GET estado-tutorial` — Verifica si el tutorial fue visto |
| RF-012 | L36–49 | 50% | `POST marcar-tutorial-visto` — Marca el tutorial como completado |

> **RF-012: 100%** — Exclusivo ayuda y tutoriales.

---

### `GradosController.cs` — 54 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-001 | L21–41 | 100% | `GET /` — Lista grados escolares para el formulario de registro |

> **RF-001: 100%** — Soporte a registro de Estudiantes.

---

### `SeedController.cs` — 137 líneas

| RF | Líneas | % | Descripción |
|---|---|---|---|
| RF-011 | L19–51 | 40% | `POST admin` — Crea el usuario Administrador inicial |
| RF-001 | L53–99 | 40% | `POST reparar-docentes` — Repara perfiles de Docente sin registro |
| RF-011 | L101–128 | 20% | `GET diagnostico` — Diagnóstico del estado de usuarios en BD |

> **RF-011: 60% | RF-001: 40%**

---

## 📁 `/LecturaIA.API/Services`

---

### `AuthService.cs` — ~580 líneas (21 KB)

| RF | % | Descripción |
|---|---|---|
| RF-001 | 80% | `RegistrarEstudiante`, `RegistrarDocente`, `Login`, `VerificarEmail`, `ReenviarVerificacion`, generación y validación JWT, BCrypt hash, 2FA por email |
| RF-008 | 10% | `SolicitarRecuperacionPassword`, `RestablecerPassword` |
| RF-011 | 10% | Detección de cuentas suspendidas en el login (`LoginCuentaSuspendidaDto`) |

---

### `IAuthService.cs` — ~25 líneas

| RF | % | Descripción |
|---|---|---|
| RF-001 | 100% | Interfaz: define contratos de `RegistrarEstudiante`, `Login`, `VerificarEmail`, `VerificarCodigoLogin`, etc. |

---

### `LecturaIAService.cs` — ~530 líneas (19 KB)

| RF | % | Descripción |
|---|---|---|
| RF-004 | 75% | `GenerarLecturaAsync()` — Construye prompt con preferencias, llama a API de IA (Gemini), parsea respuesta con título, contenido e imagen |
| RF-003 | 25% | Transforma las preferencias (temas, personajes, escenario, emoción, propósito) en prompt contextualizado |

---

### `CuestionarioIAService.cs` — ~820 líneas (30 KB)

| RF | % | Descripción |
|---|---|---|
| RF-006 | 50% | `GenerarCuestionarioAsync()` — Genera 10 preguntas adaptadas al nivel (Fácil/Medio/Difícil): 4 literales, 4 analíticas, 2 críticas |
| RF-007 | 40% | `EvaluarRespuestaAbiertaAsync()`, `GenerarRetroalimentacionPersonalizadaAsync()` — Evalúa respuestas abiertas con IA y genera feedback personalizado en JSON estructurado |
| RF-004 | 10% | Genera cuestionarios para lecturas de exámenes grupales |

---

### `AdminService.cs` — ~145 líneas (5 KB)

| RF | % | Descripción |
|---|---|---|
| RF-011 | 100% | `ObtenerTodosLosUsuarios`, `SuspenderUsuario`, `ReactivarUsuario`, `ReiniciarPassword`, `ObtenerEstadisticas` |

---

### `ExamenGrupalService.cs` — ~460 líneas (17 KB)

| RF | % | Descripción |
|---|---|---|
| RF-013 | 85% | `CrearExamenConIAAsync`, `ObtenerExamenesDelSalonAsync`, `ObtenerExamenesAsignadosAsync`, `ObtenerResultadosConsolidadosAsync`, `MarcarComoCompletadoAsync`, `EliminarExamenAsync` |
| RF-004 | 15% | Genera lecturas y cuestionarios con IA para el examen grupal |

---

### `EmailService.cs` — ~340 líneas (12 KB)

| RF | % | Descripción |
|---|---|---|
| RF-001 | 70% | Envía emails de verificación de cuenta y códigos 2FA para login |
| RF-008 | 30% | Envía email de recuperación de contraseña |

---

### `IEmailService.cs` — ~12 líneas

| RF | % | Descripción |
|---|---|---|
| RF-001 | 70% | Interfaz: `EnviarEmailVerificacion`, `EnviarCodigoLogin` |
| RF-008 | 30% | Interfaz: `EnviarEmailRecuperacion` |

---

### `PasswordService.cs` — ~108 líneas (4 KB)

| RF | % | Descripción |
|---|---|---|
| RF-008 | 100% | `CambiarPassword` (con verificación de contraseña actual), `ValidarFortalezaPassword` (criterios: longitud, mayúsculas, números, especiales) |

---

### `IPasswordService.cs` — ~8 líneas

| RF | % | Descripción |
|---|---|---|
| RF-008 | 100% | Interfaz: `CambiarPassword`, `ValidarFortalezaPassword` |

---

### `AyudaService.cs` — ~30 líneas (1 KB)

| RF | % | Descripción |
|---|---|---|
| RF-012 | 100% | `ObtenerEstadoTutorial`, `MarcarTutorialVisto` — Persiste estado del tutorial en BD |

---

## 📁 `/LecturaIA.API/Data`

---

### `ApplicationDbContext.cs` — ~440 líneas (16 KB)

| RF | Líneas aprox. | % | Descripción |
|---|---|---|---|
| RF-001 | L1–80 | 18% | `DbSet<Usuario>`, `DbSet<Docente>`, `DbSet<Estudiante>`, `DbSet<CodigoVerificacionLogin>` |
| RF-002 | L81–120 | 9% | `DbSet<Lectura>` + configuración de relaciones |
| RF-005 | L121–160 | 9% | `DbSet<SesionLectura>` |
| RF-006 | L161–260 | 23% | `DbSet<Cuestionario>`, `DbSet<Pregunta>`, `DbSet<RespuestaEstudiante>`, `DbSet<ResultadoCuestionario>` |
| RF-009 | L261–320 | 14% | `DbSet<Aula>`, `DbSet<EstudianteAula>` (relación M:N) |
| RF-013 | L321–380 | 14% | `DbSet<ExamenGrupal>`, `DbSet<AsignacionExamen>` |
| RF-010 | L1–440 | 7% | Toda la BD alimenta las métricas y analytics |
| RF-011 | L1–440 | 6% | Campo `Activo` en `Usuario` para suspensión |

---

## 📁 `/LecturaIA.API/Models/Entities`

---

### `Usuario.cs` — ~50 líneas

| RF | % | Descripción |
|---|---|---|
| RF-001 | 70% | Propiedades: `Email`, `PasswordHash`, `TipoUsuario`, `Activo`, `EmailVerificado`, `TokenVerificacion` |
| RF-011 | 20% | Campo `Activo` para suspensión/reactivación |
| RF-008 | 10% | `TokenRecuperacion`, `TokenRecuperacionExpira` |

---

### `Estudiante.cs` — ~18 líneas

| RF | % | Descripción |
|---|---|---|
| RF-003 | 40% | `Intereses`, `NivelEducativo` |
| RF-001 | 20% | Relación con `Usuario` |
| RF-007 | 30% | `NivelDificultad` (Fácil/Medio/Difícil) — cambia automáticamente |
| RF-006 | 10% | `Edad`, `Grado` — usados para adaptar dificultad |

---

### `Docente.cs` — ~7 líneas

| RF | % | Descripción |
|---|---|---|
| RF-009 | 70% | Relación con `Aula` |
| RF-001 | 30% | Relación con `Usuario` |

---

### `Aula.cs` — ~32 líneas

| RF | % | Descripción |
|---|---|---|
| RF-009 | 100% | `Nombre`, `Descripcion`, `CodigoVinculacion`, `Activa`, FK `DocenteId`, colección de `EstudiantesAulas` |

---

### `Lectura.cs` — ~42 líneas

| RF | % | Descripción |
|---|---|---|
| RF-002 | 40% | `Titulo`, `Contenido`, `TipoLectura`, `Estado`, `Progreso`, `EsFavorita` |
| RF-003 | 30% | `Temas`, `Personajes`, `Escenario`, `Longitud`, `Emocion`, `Proposito` (preferencias) |
| RF-004 | 20% | `UrlImagen`, `Contenido` — resultado de la generación con IA |
| RF-005 | 10% | `Estado`, `Progreso` — seguimiento de la sesión de lectura |

---

### `Cuestionario.cs` — ~62 líneas

| RF | % | Descripción |
|---|---|---|
| RF-006 | 60% | `Estado`, `NivelDificultad`, `TipoTexto`, colección de `Preguntas` |
| RF-007 | 30% | `FechaEnvio`, relación con `Resultado` |
| RF-013 | 10% | `EstudianteId` nullable (cuestionario template vs personal) |

---

### `Pregunta.cs` — ~60 líneas

| RF | % | Descripción |
|---|---|---|
| RF-006 | 70% | `TextoPregunta`, `Tipo` (Literal/Analítica/Crítica), `Formato` (OpcionMultiple/Abierta), `Opciones`, `RespuestaCorrecta` |
| RF-007 | 30% | `Explicacion`, relación con `RespuestaEstudiante` |

---

### `RespuestaEstudiante.cs` — ~47 líneas

| RF | % | Descripción |
|---|---|---|
| RF-006 | 40% | `TextoRespuesta`, relación con `Pregunta` |
| RF-007 | 60% | `EsCorrecta`, `PuntajeIA`, `RetroalimentacionIA` |

---

### `ResultadoCuestionario.cs` — ~97 líneas

| RF | % | Descripción |
|---|---|---|
| RF-007 | 70% | `PuntajeTotal`, `Porcentaje`, `CorrectasLiterales`, `CorrectasAnaliticas`, `PuntajeCriticas`, `RetroalimentacionPersonalizada`, `NivelAnterior`, `NivelNuevo`, `MensajeAdaptacion` |
| RF-010 | 30% | Fuente principal de datos para métricas del docente |

---

### `SesionLectura.cs` — ~46 líneas

| RF | % | Descripción |
|---|---|---|
| RF-005 | 60% | `FechaInicio`, `FechaFinalizacion`, `TiempoLecturaMinutos`, `Completada` |
| RF-010 | 30% | Tiempo de lectura para métricas del docente |
| RF-013 | 10% | Sesiones clonadas para exámenes grupales |

---

### `ExamenGrupal.cs` — ~80 líneas

| RF | % | Descripción |
|---|---|---|
| RF-013 | 90% | `Titulo`, `Descripcion`, `FechaLimite`, `AulaId`, `LecturaId`, colección de `Asignaciones` |
| RF-004 | 10% | `LecturaId` — lectura generada por IA para el examen |

---

### `GradoEscolar.cs` — ~4 líneas

| RF | % | Descripción |
|---|---|---|
| RF-001 | 100% | Enum: `Cuarto`, `Quinto`, `Sexto` — usado en registro de estudiante |

---

### `CodigoVerificacionLogin.cs` — ~39 líneas

| RF | % | Descripción |
|---|---|---|
| RF-001 | 100% | Entidad para el sistema 2FA: `Codigo`, `Email`, `FechaExpiracion`, `Usado` |

---

## 📁 `/LecturaIA.API/Models/DTOs`

---

### `LoginDto.cs` — ~14 líneas
> **RF-001: 100%** — `Email`, `Password` para autenticación.

### `AuthResponseDto.cs` — ~12 líneas
> **RF-001: 100%** — Token JWT, tipo de usuario, datos básicos del usuario.

### `RegistroEstudianteDto.cs` — ~58 líneas
> **RF-001: 70% | RF-003: 30%** — Nombre, email, contraseña, grado, edad, intereses.

### `RegistroDocenteDto.cs` — ~33 líneas
> **RF-001: 100%** — Nombre, email, contraseña, código de institución.

### `VerificacionEmailDto.cs` — ~16 líneas
> **RF-001: 100%** — Token de verificación de email y reenvío.

### `VerificarCodigoLoginDto.cs` — ~54 líneas
> **RF-001: 100%** — DTOs para 2FA: `LoginRequiere2FADto`, `LoginCuentaSuspendidaDto`, `VerificarCodigoLoginDto`, `ReenviarCodigoLoginDto`.

### `RecuperacionPasswordDto.cs` — ~30 líneas
> **RF-001: 60% | RF-008: 40%** — `SolicitarRecuperacionDto`, `RestablecerPasswordDto`.

### `LecturaDto.cs` — ~57 líneas
> **RF-002: 50% | RF-003: 25% | RF-004: 25%** — `GenerarLecturaRequestDto`, `LecturaGeneradaDto`, `LecturaListaDto`, `PreferenciasLecturaDto`, `MarcarFavoritaDto`.

### `ComprencionLectoraDto.cs` — ~283 líneas (8 KB)
> **RF-006: 45% | RF-007: 45% | RF-005: 10%** — DTOs de cuestionario, preguntas, respuestas, resultado, retroalimentación, análisis por tipo, evolución.

### `ExamenGrupalDto.cs` — ~161 líneas (5 KB)
> **RF-013: 90% | RF-004: 10%** — `CrearExamenGrupalDto`, `ExamenGrupalDto`, `AsignacionExamenDto`, `ResultadosExamenGrupalDto`.

### `MetricasDto.cs` — ~105 líneas (3 KB)
> **RF-010: 100%** — `MetricasEstudianteDto`, `MetricasAulaDto`, `EvolucionTemporalDto`, `AnalisisHabilidadDto`, `DistribucionTiposTextoDto`.

### `AdminDTOs.cs` — ~74 líneas (2 KB)
> **RF-011: 100%** — `UsuarioAdminDto`, `SuspenderUsuarioDto`, `ReactivarUsuarioDto`, `EstadisticasAdminDto`, `ReiniciarPasswordDto`.

### `PasswordDTOs.cs` — ~19 líneas
> **RF-008: 100%** — `CambiarPasswordDto`, `ValidarPasswordRequest`.

### `PerfilUsuarioDto.cs` — ~73 líneas (2 KB)
> **RF-008: 60% | RF-003: 30% | RF-009: 10%** — Perfil del usuario con nivel, intereses e info de clase actual.

### `AyudaDTOs.cs` — ~7 líneas
> **RF-012: 100%** — `EstadoTutorialDto`.

---

## 📁 `/LecturaIA.API/Configuration`

### `IASettings.cs` — ~10 líneas
> **RF-004: 100%** — `BaseUrl`, `ApiKey` para la API de Generación con IA.

### `EmailSettings.cs` — ~16 líneas
> **RF-001: 70% | RF-008: 30%** — SMTP Host, Port, usuario, contraseña para envío de emails.

---

## 📁 `/LecturaIA.API/Migrations`
> **43 archivos** (`.cs` + `.Designer.cs` + `Snapshot`)  
> **Propósito:** Historial de evolución del esquema de base de datos.  
> Son **infraestructura pura** — cada migración refleja la incorporación de un módulo:

| Migración clave | RF relacionado |
|---|---|
| `InitialCreate` (2025-10-05) | RF-001 (Usuarios, Docentes, Estudiantes) |
| `AddAdminFeatures` (2025-10-06) | RF-011 (campo `Activo` en Usuario) |
| `VerificacionEmailYEliminarCodigos` (2025-10-12) | RF-001 (Email verificado) |
| `AgregarSistema2FA` (2025-10-12) | RF-001 (2FA) |
| `AgregarTablaLecturas` (2025-10-12) | RF-002, RF-004 |
| `AgregarSistemaComprensionLectora` (2025-10-15) | RF-006, RF-007 |
| `AgregarSistemaAulas` (2025-10-19) | RF-009 |
| `AgregarTiempoCuestionario` (2025-10-29) | RF-010 |
| `AddExamenGrupal` (2025-11-16) | RF-013 |

---

## 📁 `/LecturaIA.API/Properties`

### `launchSettings.json`
> **Infraestructura** — Configuración de puertos para desarrollo local. Sin RF específico.

---

# PARTE 2 — LecturaIA.Frontend

## 📁 `/LecturaIA.Frontend` (Raíz)

### `index.html` — ~13 líneas
> **Infraestructura** — Punto de entrada HTML. Sin RF específico.

### `package.json` / `package-lock.json`
> **Infraestructura** — Dependencias npm (React, TypeScript, Vite, Tailwind). Sin RF específico.

### `vite.config.ts` / `tsconfig.json` / `postcss.config.js` / `tailwind.config.js`
> **Infraestructura** — Configuración del bundler y estilos. Sin RF específico.

### `Dockerfile` / `.dockerignore`
> **Infraestructura** — Contenerización del frontend. Sin RF específico.

---

## 📁 `/LecturaIA.Frontend/src`

### `main.tsx` — ~8 líneas
> **Infraestructura** — Punto de entrada React. Sin RF específico.

### `App.tsx` — ~110 líneas
> **RF-001: 60% | RF-012: 40%**  
> Enrutamiento principal (React Router): define rutas protegidas por rol, redirige según tipo de usuario (Estudiante/Docente/Administrador), integra `TutorialInicial`.

### `style.css` / `counter.ts` / `typescript.svg`
> **Infraestructura** — Estilos base y utilidades.

---

## 📁 `/LecturaIA.Frontend/src/config`

### `api.ts` — ~9 líneas
> **Infraestructura global** — Define `API_BASE_URL` usado por todos los servicios. Soporte indirecto a todos los RFs.

---

## 📁 `/LecturaIA.Frontend/src/data`

### `contenidoAyuda.ts` — ~244 líneas (7 KB)
> **RF-012: 100%** — Objeto con el contenido de ayuda contextual para cada sección y rol (textos de tooltips y modales de ayuda).

---

## 📁 `/LecturaIA.Frontend/src/services`

### `authService.ts` — ~142 líneas (4 KB)
> **RF-001: 100%** — `loginEstudiante`, `loginDocente`, `loginAdmin`, `registrarEstudiante`, `registrarDocente`, `verificarEmail`, `reenviarVerificacion`, `verificarCodigoLogin`, `solicitarRecuperacion`, `restablecerPassword`.

### `lecturaService.ts` — ~194 líneas (6 KB)

| RF | % | Descripción |
|---|---|---|
| RF-003 | 25% | `generarLectura(preferencias)` — envía preferencias al backend |
| RF-004 | 25% | Idem — trigger de generación con IA |
| RF-002 | 50% | `obtenerLecturas`, `obtenerLectura`, `eliminarLectura`, `marcarFavorita`, `obtenerFavoritas` |

### `cuestionarioService.ts` — ~213 líneas (6 KB)

| RF | % | Descripción |
|---|---|---|
| RF-006 | 50% | `generarCuestionario`, `obtenerCuestionario`, `enviarRespuestas` |
| RF-007 | 50% | `obtenerResultado`, `verRespuestasDetalladas`, `obtenerHistorialLectura` |

### `sesionLecturaService.ts` — ~92 líneas (2 KB)
> **RF-005: 100%** — `iniciarLectura`, `finalizarLectura`, `obtenerSesionActiva`.

### `aulasService.ts` — ~94 líneas (2 KB)
> **RF-009: 100%** — `crearAula`, `unirseAClase`, `obtenerMiClase`, `obtenerMisAulas`, `obtenerEstudiantesDelAula`, `eliminarAula`, `salirDeClase`, `removerEstudiante`.

### `metricasService.ts` — ~72 líneas (2 KB)
> **RF-010: 100%** — `obtenerMetricasEstudiante(id)`, `obtenerMetricasAula(id)`.

### `adminService.ts` — ~82 líneas (2 KB)
> **RF-011: 100%** — `obtenerUsuarios`, `suspenderUsuario`, `reactivarUsuario`, `reiniciarPassword`, `obtenerEstadisticas`.

### `examenGrupalService.ts` — ~229 líneas (7 KB)
> **RF-013: 100%** — `crearExamen`, `listarExamenesAula`, `obtenerAsignados`, `obtenerAsignacion`, `iniciarExamen`, `completarExamen`, `obtenerResultados`, `eliminarExamen`, `reasignarExamen`.

### `passwordService.ts` — ~37 líneas (1 KB)
> **RF-008: 100%** — `cambiarPassword`, `validarFortaleza`.

### `perfilService.ts` — ~106 líneas (3 KB)
> **RF-008: 60% | RF-003: 40%** — `obtenerPerfil`, datos de nivel e intereses del estudiante.

### `ayudaService.ts` — ~25 líneas
> **RF-012: 100%** — `obtenerEstadoTutorial`, `marcarTutorialVisto`.

---

## 📁 `/LecturaIA.Frontend/src/pages`

---

### `Home.tsx` — ~133 líneas (4 KB)
> **RF-001: 80% | RF-012: 20%** — Página de inicio con selector de rol (Estudiante/Docente/Admin) y acceso al login/registro.

### `EstudianteAuth.tsx` — ~342 líneas (10 KB)
> **RF-001: 100%** — Login y registro de Estudiante con validación, verificación de email, 2FA (`VerificacionCodigo`) y recuperación de contraseña.

### `DocenteAuth.tsx` — ~325 líneas (10 KB)
> **RF-001: 100%** — Login y registro de Docente con verificación de email, 2FA y recuperación de contraseña.

### `VerificarEmail.tsx` — ~155 líneas (4 KB)
> **RF-001: 100%** — Página de confirmación de email con token desde URL.

### `RecuperarPassword.tsx` — ~267 líneas (8 KB)
> **RF-001: 80% | RF-008: 20%** — Flujo de recuperación de contraseña: solicitud, validación de token y restablecimiento.

---

### `EstudianteDashboard.tsx` — ~1,320 líneas (48 KB)

| RF | Líneas aprox. | % | Descripción |
|---|---|---|---|
| RF-002 | L200–500 | 23% | Biblioteca personal: lista de lecturas, filtros, favoritas, eliminar |
| RF-003 | L1–100 | 7% | Lanza `EncuestaGuiadaModal` para capturar preferencias |
| RF-004 | L1–100 | 8% | Dispara generación de lectura con IA |
| RF-005 | L500–700 | 15% | Navegación a vista de lectura |
| RF-009 | L700–900 | 15% | Sección "Mi Clase": unirse con código, ver info del aula |
| RF-012 | L900–1000 | 8% | `AyudaContextual` integrado en secciones principales |
| RF-013 | L1000–1200 | 15% | Lista de exámenes asignados, estado y acceso |
| RF-008 | L1200–1320 | 9% | Sección "Mi Cuenta", acceso a `CambiarPasswordModal` |

> **Archivo más grande del frontend.** Contiene prácticamente todo el flujo del Estudiante.

---

### `LecturaVistaLectura.tsx` — ~325 líneas (10 KB)
> **RF-005: 80% | RF-006: 20%** — Interfaz limpia de lectura: muestra contenido, tiempo de lectura, botón "Finalizar y generar cuestionario".

### `LecturaDetalle.tsx` — ~342 líneas (10 KB)
> **RF-002: 50% | RF-005: 30% | RF-006: 20%** — Detalle de una lectura de la biblioteca: portada, historial de cuestionarios, acceso a nueva sesión.

### `CuestionarioGeneracion.tsx` — ~322 líneas (10 KB)
> **RF-006: 100%** — Pantalla de "generando cuestionario" con polling de estado, carga visual.

### `CuestionarioRespuesta.tsx` — ~549 líneas (17 KB)
> **RF-006: 100%** — Interfaz de respuesta al cuestionario: preguntas de opción múltiple y preguntas abiertas, temporizador, envío.

### `CuestionarioResultados.tsx` — ~769 líneas (23 KB)

| RF | % | Descripción |
|---|---|---|
| RF-007 | 70% | Muestra puntaje, porcentaje, retroalimentación IA estructurada, análisis por tipo de pregunta, adaptación de nivel |
| RF-010 | 30% | Gráficos de evolución personal del estudiante |

### `CuestionarioRevision.tsx` — ~541 líneas (16 KB)
> **RF-007: 100%** — Revisión detallada pregunta por pregunta: respuesta del estudiante, respuesta correcta, explicación, feedback IA de preguntas abiertas.

### `HistorialResultados.tsx` — ~419 líneas (13 KB)
> **RF-007: 60% | RF-010: 40%** — Historial de todos los cuestionarios del estudiante, gráficas de evolución.

---

### `DocenteDashboard.tsx` — ~740 líneas (23 KB)

| RF | % | Descripción |
|---|---|---|
| RF-009 | 35% | Lista de aulas, crear aula, código de vinculación |
| RF-010 | 30% | Dashboard de métricas: acceso a `MetricasSalonModal` y `MetricasEstudianteModal` |
| RF-013 | 20% | Acceso a gestión de exámenes grupales |
| RF-012 | 10% | `AyudaContextual` en secciones principales |
| RF-008 | 5% | Acceso a `CambiarPasswordModal` |

### `DocenteAulasPage.tsx` — ~375 líneas (11 KB)
> **RF-009: 100%** — Detalle de un aula: lista de estudiantes, código de vinculación, acceso a exámenes grupales y métricas.

### `AulaDetalleDocente.tsx` — ~714 líneas (22 KB)

| RF | % | Descripción |
|---|---|---|
| RF-009 | 40% | Gestión de estudiantes del aula, código de vinculación |
| RF-013 | 35% | Lista de exámenes del aula, crear examen, ver resultados |
| RF-010 | 25% | Métricas del aula: gráficas de progreso, distribución por tipo de texto |

---

### `AdminDashboard.tsx` — ~643 líneas (19 KB)
> Archivo duplicado de dashboard admin (legacy).  
> **RF-011: 100%** — Gestión de usuarios, estadísticas.

### `DashboardAdmin.tsx` — ~599 líneas (18 KB)
> **RF-011: 100%** — Versión activa del dashboard del administrador: gestión de usuarios, suspender/reactivar, estadísticas de plataforma, gestión de códigos de docentes.

---

### `PoliticasPrivacidad.tsx` — ~163 líneas (5 KB)
> **Informativo** — Políticas de privacidad. Sin RF funcional.

### `EstudianteAuth.tsx.old` — Archivo legacy descartado.

---

## 📁 `/LecturaIA.Frontend/src/components`

---

### `EncuestaGuiadaModal.tsx` — ~601 líneas (18 KB)
> **RF-003: 100%** — Modal de encuesta guiada multi-paso: selección de temas (máx 2), personajes (máx 2), escenario, longitud, emoción y propósito. Flujo paso a paso con animaciones.

### `VistaPreviaPreferenciasModal.tsx` — ~289 líneas (8 KB)
> **RF-003: 70% | RF-004: 30%** — Modal de vista previa de preferencias antes de generar lectura. Incluye botón "Generar con IA".

### `TutorialInicial.tsx` — ~266 líneas (8 KB)
> **RF-012: 100%** — Tutorial interactivo inicial por pasos para cada rol (Estudiante/Docente), con `AyudaService`.

### `AyudaContextual.tsx` — ~106 líneas (3 KB)
> **RF-012: 100%** — Componente de botón `?` con popover contextual, usa datos de `contenidoAyuda.ts`.

### `VerificacionCodigo.tsx` — ~257 líneas (7 KB)
> **RF-001: 100%** — Modal de verificación de código 2FA durante el login.

### `CambiarPasswordModal.tsx` — ~401 líneas (12 KB)
> **RF-008: 100%** — Modal "Mi Cuenta": cambiar contraseña con validación de fortaleza en tiempo real.

### `MiPerfilModal.tsx` — ~361 líneas (11 KB)
> **RF-008: 60% | RF-003: 40%** — Modal de perfil: datos del usuario, nivel actual, clase actual, intereses.

### `MetricasEstudianteModal.tsx` — ~357 líneas (11 KB)
> **RF-010: 100%** — Modal con métricas individuales del estudiante: gráfico de evolución, análisis de habilidades, nivel actual, tipo de texto favorito.

### `MetricasSalonModal.tsx` — ~466 líneas (14 KB)
> **RF-010: 100%** — Modal con métricas del salón: promedio de clase, distribución por tipo de texto (barras), progreso semanal (8 semanas).

### `MiClaseModal.tsx` — ~423 líneas (13 KB)
> **RF-009: 100%** — Modal del estudiante para unirse a clase con código, ver info del aula, salir de clase.

---

## 📁 `/LecturaIA.Frontend/src/components/Estudiante`

### `ListaExamenesAsignados.tsx` — ~346 líneas (10 KB)
> **RF-013: 100%** — Lista de exámenes grupales asignados al estudiante con estado (Pendiente/En Progreso/Completado/Vencido) y acceso a realizarlos.

### `ListaExamenesAsignados.css` — ~209 líneas (6 KB)
> **Estilo** — CSS específico del componente anterior. Sin RF funcional.

### `RealizarExamenGrupal.tsx` — ~320 líneas (9 KB)
> **RF-013: 100%** — Flujo completo de realización del examen grupal: lectura del texto + respuesta al cuestionario clonado.

---

## 📁 `/LecturaIA.Frontend/src/components/admin`

### `GestionUsuarios.tsx` — ~461 líneas (14 KB)
> **RF-011: 100%** — Tabla de usuarios con búsqueda por email, suspender/reactivar, reiniciar contraseña.

### `EstadisticasAdmin.tsx` — ~100 líneas (3 KB)
> **RF-011: 100%** — Tarjetas con estadísticas generales: total estudiantes, docentes, lecturas generadas, cuestionarios.

### `CodigosDocentes.tsx` — ~219 líneas (6 KB)
> **RF-011: 70% | RF-001: 30%** — Admin gestiona códigos de validación para registro de Docentes.

---

## 📁 `/LecturaIA.Frontend/src/components/docente`

### `CrearAulaModal.tsx` — ~258 líneas (8 KB)
> **RF-009: 100%** — Modal para crear un aula nueva: nombre, descripción, código generado automáticamente.

### `CodigosEstudiantes.tsx` — ~227 líneas (7 KB)
> **RF-009: 100%** — Vista del código de vinculación del aula para compartir con estudiantes.

### `CrearExamenGrupal.tsx` — ~334 líneas (10 KB)
> **RF-013: 80% | RF-004: 20%** — Formulario de creación de examen grupal: parámetros del texto, fecha límite, genera lectura y cuestionario con IA.

### `CrearExamenGrupal.css` — ~130 líneas (4 KB)
> **Estilo** — CSS del componente anterior.

### `ListaExamenesAula.tsx` — ~375 líneas (11 KB)
> **RF-013: 100%** — Lista de exámenes del aula con estado de completitud, acceso a resultados y reasignación.

### `ResultadosExamenGrupal.tsx` — ~382 líneas (11 KB)
> **RF-013: 70% | RF-010: 30%** — Tabla de resultados consolidados del examen: calificación por estudiante, promedio de clase, estado de entrega.

### `ResultadosExamenGrupal.css` — ~215 líneas (6 KB)
> **Estilo** — CSS del componente anterior.

---

## 📁 `/LecturaIA.Frontend/public`

### `estudiante.png` / `docente.png` / `vite.svg`
> **Recursos visuales** — Imágenes usadas en pantallas de login. Sin RF específico.

---

# 📊 Resumen de Trazabilidad por Requerimiento

| RF | Archivos Principales (API) | Archivos Principales (Frontend) | Cobertura |
|---|---|---|---|
| **RF-001** | `AuthController`, `AuthService`, `IAuthService`, `EmailService`, `Usuario.cs`, `CodigoVerificacion.cs`, `LoginDto`, `RegistroEstudianteDto`, `RegistroDocenteDto`, `VerificacionEmailDto` | `EstudianteAuth`, `DocenteAuth`, `VerificarEmail`, `RecuperarPassword`, `VerificacionCodigo`, `authService.ts`, `Home.tsx` | ✅ Completa |
| **RF-002** | `LecturasController` (GET, DELETE, favoritas) | `EstudianteDashboard`, `LecturaDetalle`, `lecturaService.ts` | ✅ Completa |
| **RF-003** | `LecturasController` (POST generar — preferencias), `Lectura.cs` (campos), `RegistroEstudianteDto` | `EncuestaGuiadaModal`, `VistaPreviaPreferenciasModal`, `MiPerfilModal` | ✅ Completa |
| **RF-004** | `LecturasController` (POST generar), `LecturaIAService`, `IASettings.cs`, `ExamenGrupalService` | `VistaPreviaPreferenciasModal`, `CrearExamenGrupal`, `lecturaService.ts` | ✅ Completa |
| **RF-005** | `SesionesLecturaController`, `SesionLectura.cs` | `LecturaVistaLectura`, `LecturaDetalle`, `sesionLecturaService.ts` | ✅ Completa |
| **RF-006** | `CuestionariosController` (POST generar, GET), `CuestionarioIAService`, `Cuestionario.cs`, `Pregunta.cs` | `CuestionarioGeneracion`, `CuestionarioRespuesta`, `cuestionarioService.ts` | ✅ Completa |
| **RF-007** | `CuestionariosController` (evaluar, resultado), `CuestionarioIAService` (retroalimentación), `ResultadoCuestionario.cs`, `RespuestaEstudiante.cs` | `CuestionarioResultados`, `CuestionarioRevision`, `HistorialResultados` | ✅ Completa |
| **RF-008** | `PasswordController`, `PasswordService`, `PerfilController`, `AuthService` (recuperación) | `CambiarPasswordModal`, `MiPerfilModal`, `RecuperarPassword`, `passwordService.ts`, `perfilService.ts` | ✅ Completa |
| **RF-009** | `AulasController`, `Aula.cs`, `Docente.cs` | `DocenteDashboard`, `DocenteAulasPage`, `AulaDetalleDocente`, `MiClaseModal`, `CrearAulaModal`, `CodigosEstudiantes`, `aulasService.ts` | ✅ Completa |
| **RF-010** | `MetricasController`, `ResultadoCuestionario.cs` (fuente de datos) | `MetricasEstudianteModal`, `MetricasSalonModal`, `ResultadosExamenGrupal`, `metricasService.ts` | ✅ Completa |
| **RF-011** | `AdminController`, `AdminService`, `SeedController` | `DashboardAdmin`, `GestionUsuarios`, `EstadisticasAdmin`, `CodigosDocentes`, `adminService.ts` | ✅ Completa |
| **RF-012** | `AyudaController`, `AyudaService`, `AyudaDTOs.cs` | `AyudaContextual`, `TutorialInicial`, `contenidoAyuda.ts`, `ayudaService.ts` | ✅ Completa |
| **RF-013** | `ExamenGrupalController`, `ExamenGrupalService`, `ExamenGrupal.cs`, `ExamenGrupalDto.cs` | `CrearExamenGrupal`, `ListaExamenesAula`, `ListaExamenesAsignados`, `RealizarExamenGrupal`, `ResultadosExamenGrupal`, `examenGrupalService.ts` | ✅ Completa |

---

> 📌 **Todos los 13 requerimientos (RF-001 a RF-013) tienen implementación completa** en ambos proyectos (API + Frontend).
