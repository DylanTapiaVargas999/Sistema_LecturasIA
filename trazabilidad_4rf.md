# Trazabilidad RF-001 → RF-004
## Flujo: SRS (Fd03) → SAD (fd04) → Objetos de Programación

> Sigue el formato de la imagen Excel:
> **Lo efectuado en el SRS** → *Relaciona con* → **Lo efectuado en el SAD** → *Relaciona con* → **Objetos de programación (Frontend / Backend / BD)**

---

## RF-001 | CU-0001 — Gestionar Autenticación y Autorización

### 📄 SRS — Fd03.md (Lo efectuado en el SRS)

| Entregable | Contenido |
|---|---|
| **Paquete** | Módulo de Autenticación / Gestión de Acceso |
| **Diagrama de Caso de Uso** | CU-0001: actores Estudiante y Docente; flujos Registro, Login, Recuperar Contraseña, Activar cuenta |
| **Diagrama de Secuencia** | Narrativa CU-0001 (Tabla 6): 8 pasos registro estudiante + 9 pasos login docente con 2FA + FA01–FA08 |
| **Diagrama de Clases** | Figura 6: Análisis de Objetos CU-0001 (Usuario, Rol, Sesión, CorreoVerificacion) |
| **Diagrama de Proceso** | Figura 19: Diagrama de Actividades con Objetos CU-0001 |

### ➡️ Relaciona con SAD — fd04.md (Lo efectuado en el SAD)

| Entregable | Contenido |
|---|---|
| **Paquete** | Subsistema: Gestión de Identidad y Acceso |
| **Diagrama de Caso de Uso** | Figura 1 (fd04): CU-0001 en vista de escenario del sistema |
| **Diagrama de Secuencia** | **Fig.3** Registro estudiante · **Fig.4** Verificación de correo · **Fig.5** Login estudiante · **Fig.6** Recuperar contraseña · **Fig.7** Registro Docente · **Fig.8** Login Docente con 2FA |
| **Diagrama de Clases** | Figura 105: Clase `Usuario`, `Estudiante`, `Docente` con atributos y relaciones |
| **Diagrama de Proceso** | Figura 111: Vista de Procesos — Flujo Administrador (gestión de usuarios) |

### ➡️ Relaciona con — Objetos de Programación creados

#### 🖥️ Frontend
| Archivo | Responsabilidad |
|---|---|
| `LoginPage.tsx` | Pantalla de inicio de sesión (Estudiante / Docente) |
| `RegisterPage.tsx` | Formulario registro con campos según rol |
| `VerificacionCorreo.tsx` | Pantalla de activación de cuenta |
| `RecuperarPassword.tsx` | Solicitar restablecimiento de contraseña |
| `ResetPassword.tsx` | Ingresar nueva contraseña con token |
| `authService.ts` | Llamadas API: POST `/registro`, POST `/login`, POST `/verificar-email`, POST `/recuperar-password` |
| `EstudianteDashboard.tsx` | Pantalla cargada tras login exitoso del estudiante |
| `DocenteDashboard.tsx` | Pantalla cargada tras login exitoso del docente |

#### ⚙️ Backend
| Archivo | Responsabilidad |
|---|---|
| `AuthController.cs` | Endpoints REST: `/registro`, `/login`, `/verificar-email`, `/recuperar-password` |
| `AuthService.cs` / `IAuthService.cs` | Lógica de negocio de autenticación |
| `EmailService.cs` | Envío de correos de verificación y recuperación |
| `RegisterDto.cs` / `LoginDto.cs` | DTO de entrada de datos del usuario |
| `JWT (JsonWebToken)` | Generación y validación de tokens de sesión |
| `BCrypt.Net` | Hashing seguro de contraseñas |

#### 🗄️ Base de Datos
| Tabla | Campos relevantes |
|---|---|
| `Usuarios` | `id`, `email`, `passwordHash`, `rol`, `activo`, `primeraSesion`, `fechaRegistro` |
| `Estudiantes` | `estudianteId`, `grado`, `edad`, `nivelDificultad` |
| `Docentes` | `docenteId` |
| `TokensRecuperacion` | `token`, `expiracion`, `usuarioId` |

---

## RF-002 | CU-0002 — Gestionar Biblioteca Personal de Lecturas

### 📄 SRS — Fd03.md (Lo efectuado en el SRS)

| Entregable | Contenido |
|---|---|
| **Paquete** | Módulo de Biblioteca / Gestión de Lecturas |
| **Diagrama de Caso de Uso** | CU-0002: actor Estudiante; flujos Visualizar, Buscar/Filtrar, Favoritos, Historial, Eliminar |
| **Diagrama de Secuencia** | Narrativa CU-0002 (Tabla 7): flujos Visualizar biblioteca, Búsqueda y Filtrado, Gestión de Favoritos, Historial, Resultados + FA01–FA02 |
| **Diagrama de Clases** | Figura 7: Análisis de Objetos CU-0002 (Lectura, SesionLectura, Favorito) |
| **Diagrama de Proceso** | Figura 20: Diagrama de Actividades con Objetos CU-0002 |

### ➡️ Relaciona con SAD — fd04.md (Lo efectuado en el SAD)

| Entregable | Contenido |
|---|---|
| **Paquete** | Subsistema: Gestión de Contenido Educativo |
| **Diagrama de Caso de Uso** | Figura 1 (fd04): CU-0002 como parte de las acciones del Estudiante |
| **Diagrama de Secuencia** | **Fig.9** Cargar Biblioteca Personal · **Fig.9b** Búsqueda y Filtrado · **Fig.10** Gestión de Favoritos · **Fig.11** Leer Lectura · **Fig.12** Historial de resultados · **Fig.13** Mostrar Resultados · **Fig.13b** Eliminar lectura |
| **Diagrama de Clases** | Figura 105: Clases `Lectura`, `SesionLectura`, `Favorito` con relaciones |
| **Diagrama de Proceso** | Figura 109: Vista de Procesos — Flujo Estudiante: Lectura con Quiz |

### ➡️ Relaciona con — Objetos de Programación creados

#### 🖥️ Frontend
| Archivo | Responsabilidad |
|---|---|
| `BibliotecaPersonal.tsx` / `EstudianteDashboard.tsx` | Lista principal con pestañas (Todas / Favoritas) |
| `LecturaCard.tsx` | Tarjeta por lectura: título, tipo, longitud, progreso, favorito, acciones |
| `FiltrosBiblioteca.tsx` | Filtros por tipo (Narrativa, Expositiva…) y longitud (Corta, Media, Larga) |
| `FavoritosTab.tsx` | Pestaña de lecturas marcadas como favoritas |
| `HistorialResultados.tsx` | Vista de intentos anteriores por lectura |
| `lecturaService.ts` | GET `/api/lecturas`, DELETE `/api/lecturas/{id}`, POST/DELETE `/api/favoritos` |

#### ⚙️ Backend
| Archivo | Responsabilidad |
|---|---|
| `LecturasController.cs` | GET `/api/lecturas` (lista del estudiante), DELETE eliminar |
| `FavoritosController.cs` | POST marcar favorito, DELETE desmarcar |
| `SesionesLecturaController.cs` | PATCH `/api/sesioneslectura/{id}/tiempo` |
| `LecturaService.cs` / `ILecturaService.cs` | Lógica de filtrado, búsqueda, estado |
| `LecturaDto.cs` / `SesionLecturaDto.cs` | Objetos de transferencia de datos |
| `ApplicationDbContext.cs` | Contexto EF Core |

#### 🗄️ Base de Datos
| Tabla | Campos relevantes |
|---|---|
| `Lecturas` | `id`, `titulo`, `tipo`, `longitud`, `contenido`, `imagenUrl`, `estudianteId`, `fechaGeneracion` |
| `SesionesLectura` | `id`, `lecturaId`, `estudianteId`, `estado`, `progreso`, `fechaInicio`, `fechaFin`, `completada` |
| `Favoritos` | `id`, `lecturaId`, `estudianteId` |

---

## RF-003 | CU-0003 — Gestionar Preferencias de Contenido del Estudiante

### 📄 SRS — Fd03.md (Lo efectuado en el SRS)

| Entregable | Contenido |
|---|---|
| **Paquete** | Módulo de Preferencias / Motor de Personalización |
| **Diagrama de Caso de Uso** | CU-0003: actor Estudiante; flujo Encuesta guiada 6 pasos → Vista previa → Generar |
| **Diagrama de Secuencia** | Narrativa CU-0003 (Tabla 8): 14 pasos de encuesta guiada (temas, personajes, escenario, longitud, emoción, propósito) + FA01–FA03 |
| **Diagrama de Clases** | Figura 8: Análisis de Objetos CU-0003 (Preferencia, EncuestaGuiada, RespuestaOpcion) |
| **Diagrama de Proceso** | Figura 21: Diagrama de Actividades con Objetos CU-0003 |

### ➡️ Relaciona con SAD — fd04.md (Lo efectuado en el SAD)

| Entregable | Contenido |
|---|---|
| **Paquete** | Subsistema: Motor de Personalización y Analíticas |
| **Diagrama de Caso de Uso** | Figura 1 (fd04): CU-0003 como acción del Estudiante |
| **Diagrama de Secuencia** | **Fig.14** Encuesta guiada — flujo exclusivo frontend: modal 6 pasos, validación por paso, resumen de selecciones antes de generar |
| **Diagrama de Clases** | Figura 105: Clase `Preferencia` con campos temas, personajes, escenario, longitud, emocion, proposito |
| **Diagrama de Proceso** | Figura 112: Vista de Procesos — Generación de Lectura con IA (inicia con las preferencias) |

### ➡️ Relaciona con — Objetos de Programación creados

#### 🖥️ Frontend
| Archivo | Responsabilidad |
|---|---|
| `EncuestaGuiada.tsx` / `EncuestaModal.tsx` | Modal con barra de progreso y 6 pasos de preguntas |
| `PasoEncuesta.tsx` | Componente reutilizable por cada paso (checkboxes, opciones) |
| `ResumenPreferencias.tsx` | Vista previa con todas las selecciones antes de confirmar |
| `preferenciaService.ts` | POST `/api/preferencias` para guardar selecciones |
| `useState` / `useEffect` (React) | Gestión del estado del paso actual y respuestas seleccionadas |

#### ⚙️ Backend
| Archivo | Responsabilidad |
|---|---|
| `PreferenciasController.cs` | POST `/api/preferencias` — recibe y guarda preferencias del estudiante |
| `PreferenciasService.cs` / `IPreferenciasService.cs` | Lógica de almacenamiento y recuperación de preferencias |
| `PreferenciasDto.cs` | DTO con campos: temas, personajes, escenario, longitud, emocion, proposito |
| `ApplicationDbContext.cs` | Contexto EF Core |

#### 🗄️ Base de Datos
| Tabla | Campos relevantes |
|---|---|
| `Preferencias` | `id`, `estudianteId`, `temas`, `personajes`, `escenario`, `longitud`, `emocion`, `proposito`, `fechaRegistro` |

---

## RF-004 | CU-0004 — Generar Textos Adaptados con IA

### 📄 SRS — Fd03.md (Lo efectuado en el SRS)

| Entregable | Contenido |
|---|---|
| **Paquete** | Módulo de Generación de Contenido con IA |
| **Diagrama de Caso de Uso** | CU-0004: actor Estudiante; flujo Solicitar generación → Construcción del prompt → Envío a IA → Recepción → Vista previa |
| **Diagrama de Secuencia** | Narrativa CU-0004 (Tabla 9): construcción del prompt con los parámetros de preferencias + envío al motor IA + recepción texto e imagen + guardado en biblioteca + FA01 error conexión |
| **Diagrama de Clases** | Figura 9: Análisis de Objetos CU-0004 (MotorIA, Prompt, LecturaGenerada, Imagen) |
| **Diagrama de Proceso** | Figura 22: Diagrama de Actividades con Objetos CU-0004 |

### ➡️ Relaciona con SAD — fd04.md (Lo efectuado en el SAD)

| Entregable | Contenido |
|---|---|
| **Paquete** | Subsistema: Motor de Personalización · Subsistema: Gestión de Contenido Educativo |
| **Diagrama de Caso de Uso** | Figura 1 (fd04): CU-0004 como acción central del Estudiante |
| **Diagrama de Secuencia** | **Fig.15** Generación de lectura con IA: preferencias del estudiante → backend construye prompt → API Google Gemini (texto) + API Hugging Face/Stable Diffusion (imagen) → guardar en BD → redirigir estudiante |
| **Diagrama de Clases** | Figura 105: Clase `Lectura` (generada), relaciones con `Preferencia` y `Estudiante` |
| **Diagrama de Proceso** | Figura 112: Vista de Procesos — Flujo Sistema: Generación de Lectura con IA (polling asíncrono, loader animado) |

### ➡️ Relaciona con — Objetos de Programación creados

#### 🖥️ Frontend
| Archivo | Responsabilidad |
|---|---|
| `GenerarLecturaLoader.tsx` | Pantalla de carga: "Generando tu historia..." (polling al backend) |
| `LecturaGeneradaVista.tsx` | Vista previa de la lectura generada (título, tipo, texto, imagen) |
| `lecturaService.ts` | POST `/api/lecturas/generar` · polling GET `/api/lecturas/estado/{id}` |

#### ⚙️ Backend
| Archivo | Responsabilidad |
|---|---|
| `LecturasController.cs` | POST `/api/lecturas/generar` — recibe preferencias y lanza generación |
| `LecturaService.cs` / `ILecturaService.cs` | Orquesta el proceso completo de generación |
| `PromptBuilder.cs` | Construye el prompt con parámetros de contenido, formato y restricciones de seguridad |
| `GeminiService.cs` | Llama a la **API de Google Gemini** para generar el texto de la lectura |
| `HuggingFaceService.cs` | Llama a la **API de Hugging Face (Stable Diffusion)** para generar la imagen de portada |
| `BackgroundTask (IHostedService)` | Ejecuta la generación de forma asíncrona para no bloquear el servidor |
| `LecturaGeneradaDto.cs` | DTO de respuesta con título, texto, imagenUrl, tipo, longitud |
| `ApplicationDbContext.cs` | Contexto EF Core para guardar la lectura generada |

#### 🗄️ Base de Datos
| Tabla | Campos relevantes |
|---|---|
| `Lecturas` | `id`, `titulo`, `contenido`, `tipo`, `longitud`, `imagenUrl`, `estudianteId`, `nivelDificultad`, `estadoGeneracion`, `fechaGeneracion` |

---

## 📊 Tabla Resumen de Trazabilidad (RF-001 → RF-004)

```
┌─────────────┬──────────────────────────────────────┬─────────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Requerimiento│ Lo efectuado en el SRS (Fd03)        │ Lo efectuado en el SAD (fd04)               │ Objetos de programación creados                        │
├─────────────┼──────────────────────────────────────┼─────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ RF-001      │ Paquete: Autenticación               │ Paquete: Gestión de Identidad               │ FRONT: LoginPage, RegisterPage, authService            │
│ CU-0001     │ DCU: CU-0001 (Estudiante, Docente)   │ DCU: Fig.1 (vista escenario)                │ BACK: AuthController, AuthService, EmailService, JWT   │
│             │ DS: Tabla 6 (narrativa RF-001)       │ DS: Fig.3,4,5,6,7,8                         │ BD: Usuarios, Estudiantes, Docentes, TokensRecuperacion│
│             │ DC: Fig.6 (análisis objetos)         │ DC: Fig.105 (Usuario, Estudiante, Docente)  │                                                        │
│             │ DP: Fig.19 (actividades c/objetos)   │ DP: Fig.111 (flujo Admin)                   │                                                        │
├─────────────┼──────────────────────────────────────┼─────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ RF-002      │ Paquete: Biblioteca de Lecturas      │ Paquete: Gestión Contenido Educativo        │ FRONT: BibliotecaPersonal, LecturaCard, lecturaService │
│ CU-0002     │ DCU: CU-0002 (Estudiante)            │ DCU: Fig.1 (vista escenario)                │ BACK: LecturasController, FavoritosController, SesLP   │
│             │ DS: Tabla 7 (narrativa RF-002)       │ DS: Fig.9,10,11,12,13                       │ BD: Lecturas, SesionesLectura, Favoritos               │
│             │ DC: Fig.7 (análisis objetos)         │ DC: Fig.105 (Lectura, SesionLectura)        │                                                        │
│             │ DP: Fig.20 (actividades c/objetos)   │ DP: Fig.109 (flujo Estudiante: Lectura+Quiz)│                                                        │
├─────────────┼──────────────────────────────────────┼─────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ RF-003      │ Paquete: Preferencias de Contenido  │ Paquete: Motor de Personalización           │ FRONT: EncuestaGuiada, ResumenPreferencias, prefService│
│ CU-0003     │ DCU: CU-0003 (Estudiante)            │ DCU: Fig.1 (vista escenario)                │ BACK: PreferenciasController, PreferenciasService      │
│             │ DS: Tabla 8 (narrativa RF-003)       │ DS: Fig.14 (encuesta guiada - frontend)     │ BD: Preferencias                                       │
│             │ DC: Fig.8 (análisis objetos)         │ DC: Fig.105 (Preferencia)                   │                                                        │
│             │ DP: Fig.21 (actividades c/objetos)   │ DP: Fig.112 (flujo Sistema: Gen. Lectura)   │                                                        │
├─────────────┼──────────────────────────────────────┼─────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ RF-004      │ Paquete: Generación con IA           │ Paquete: Motor IA + Gestión Contenido       │ FRONT: GenerarLecturaLoader, LecturaGeneradaVista      │
│ CU-0004     │ DCU: CU-0004 (Estudiante)            │ DCU: Fig.1 (vista escenario)                │ BACK: LecturasController, PromptBuilder, GeminiService │
│             │ DS: Tabla 9 (narrativa RF-004)       │ DS: Fig.15 (generación con IA: Gemini+HF)  │       HuggingFaceService, BackgroundTask               │
│             │ DC: Fig.9 (análisis objetos)         │ DC: Fig.105 (Lectura generada)              │ BD: Lecturas (con imagenUrl, estadoGeneracion)          │
│             │ DP: Fig.22 (actividades c/objetos)   │ DP: Fig.112 (flujo Sistema: Gen. Lectura)   │                                                        │
└─────────────┴──────────────────────────────────────┴─────────────────────────────────────────────┴────────────────────────────────────────────────────────┘

Leyenda: DCU=Diagrama Caso de Uso · DS=Diagrama de Secuencia · DC=Diagrama de Clases · DP=Diagrama de Proceso · SesLP=SesionesLecturaController
```
