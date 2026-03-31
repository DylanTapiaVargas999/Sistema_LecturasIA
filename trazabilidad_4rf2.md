# Trazabilidad de Requerimientos Funcionales
## Documento de Construcción de Software I — LecturaIA

---

# RF-001 | CU-0001: Gestionar Autenticación y Autorización

---

## ENTREGABLE DE ANÁLISIS — SRS (Fd03.md)

### Paquete
El caso de uso CU-0001 pertenece al paquete **"Gestión de Autenticación y Acceso"**, identificado en el Diagrama de Paquetes del sistema (Figura 4 del SRS). Este paquete agrupa los módulos responsables del registro de usuarios, el inicio de sesión diferenciado por rol (Estudiante, Docente, Administrador) y la recuperación de credenciales. Se relaciona directamente con el paquete de Gestión de Usuarios y sirve como punto de entrada obligatorio para el resto de los módulos del sistema.

> **[Insertar Figura 4 — Diagrama de Paquetes (detalle paquete Autenticación)]**

---

### Diagrama de Caso de Uso
El Diagrama de Casos de Uso (Figura 5 del SRS) muestra la interacción entre los actores **Estudiante** y **Docente** con el caso de uso CU-0001. Los flujos identificados son: Registrarse, Iniciar Sesión, Activar Cuenta mediante correo, Recuperar Contraseña y Cerrar Sesión. El Docente tiene adicionalmente el flujo de verificación de dos factores (2FA).

> **[Insertar Figura 5 — Diagrama de Casos de Uso (resaltar CU-0001)]**

---

### Diagrama de Secuencia
El Análisis de Objetos del CU-0001 (Figura 6 del SRS) representa la interacción entre el usuario, la interfaz del sistema y la lógica de autenticación. Muestra cómo el usuario puede registrarse, activar su cuenta o iniciar sesión según su rol. El sistema valida los datos ingresados, envía correos de confirmación o recuperación, y garantiza que solo los usuarios con cuentas activas accedan a sus dashboards respectivos.

> **[Insertar Figura 6 — Análisis de Objetos CU-0001]**

---

### Diagrama de Clases
El Diagrama de Clases del Modelo Lógico del SRS identifica las siguientes clases principales para este CU: `Usuario` (atributos: id, email, passwordHash, rol, activo), `Estudiante` (atributos: grado, edad, nivelDificultad), `Docente` y la clase de soporte `TokenRecuperacion` (token, expiracion). Las relaciones de herencia y asociación entre estas clases definen la estructura base del sistema de acceso.

> **[Insertar Diagrama de Clases SRS — clases Usuario, Estudiante, Docente]**

---

### Diagrama de Proceso
El Diagrama de Actividades con Objetos CU-0001 (Figura 19 del SRS) representa el flujo completo del proceso de autenticación: desde que el usuario accede a la página principal, selecciona su tipo de acceso, completa el formulario de registro o login, el sistema valida sus credenciales, y finalmente es redirigido a su área de trabajo correspondiente según su rol.

> **[Insertar Figura 19 — Diagrama de Actividades con Objetos CU-0001]**

---

## → RELACIONA CON →

---

## ENTREGABLE DE DISEÑO — SAD (fd04.md)

### Paquete
En el Diagrama de Paquetes del sistema, CU-0001 toca los siguientes paquetes y archivos:

**Paquete API (backend):**
- **Controllers/** → `AuthController.cs`
- **Services/** → `AuthService.cs`, `IAuthService.cs`, `EmailService.cs`, `IEmailService.cs`
- **Models/DTOs/** → `LoginDto.cs`, `AuthResponseDto.cs`, `RegistroEstudianteDto.cs`, `RegistroDocenteDto.cs`, `VerificacionEmailDto.cs`, `RecuperacionPasswordDto.cs`, `VerificarCodigoLoginDto.cs`
- **Models/Entities/** → `Usuario.cs`, `Estudiante.cs`, `Docente.cs`, `CodigoVerificacionLogin.cs`, `GradoEscolar.cs`
- **Data/** → `ApplicationDbContext.cs`
- **Configuration/** → `EmailSettings.cs`

**Paquete FRONTEND:**
- **Pages/** → `DocenteAuth.tsx`, `EstudianteAuth.tsx`, `VerificarEmail.tsx`, `RecuperarPassword.tsx`
- **Services/** → `authService.ts`
- **config/** → `api.ts` (instancia Axios base)

> **[Insertar Figura 2 — Diagrama de Subsistemas]**
> **[Insertar Figura 107 — Vista de Desarrollo: Diagrama de Paquetes CU-0001]**

---

### Diagrama de Caso de Uso
El Diagrama de Casos de Uso del SAD (Figura 1) muestra CU-0001 en el contexto arquitectónico del sistema completo. Se observa que el CU-0001 es el punto de entrada obligatorio para Estudiante, Docente y Administrador, y tiene relación de extensión con todos los demás casos de uso del sistema, ya que requieren sesión activa para ejecutarse.

> **[Insertar Figura 1 SAD — Diagrama de Casos de Uso del Sistema]**

---

### Diagrama de Secuencia
El SAD contiene seis diagramas de secuencia para este CU que detallan el flujo técnico completo:
- **Figura 3:** Registro del estudiante (validación en frontend, hash BCrypt, creación en BD, envío correo)
- **Figura 4:** Verificación de correo electrónico (validación token de activación)
- **Figura 5:** Login del estudiante (validación credenciales, generación JWT)
- **Figura 6:** Recuperar contraseña (token temporal con expiración, hash nueva contraseña)
- **Figura 7:** Registro del Docente (mismo flujo con flag de 2FA)
- **Figura 8:** Login del Docente con 2FA (envío código 6 dígitos, validación en 10 minutos)

> **[Insertar Figura 3 — Secuencia: Registro Estudiante]**
> **[Insertar Figura 5 — Secuencia: Login Estudiante]**
> **[Insertar Figura 8 — Secuencia: Login Docente 2FA]**

---

### Diagrama de Clases
El Diagrama de Clases General del sistema (Figura 105 del SAD) muestra con detalle las clases `Usuario`, `Estudiante` y `Docente` con sus atributos completos, métodos, y las relaciones de composición entre ellos. Se puede observar cómo el sistema de identidad implementa herencia desde `Usuario` hacia `Estudiante` y `Docente`, manteniendo separados los atributos específicos de cada rol.

> **[Insertar Figura 105 — Diagrama de Clases General (resaltar Usuario, Estudiante, Docente)]**

---

### Diagrama de Proceso
La Vista de Procesos del SAD (Figura 111 — Flujo Administrador: Gestión de usuarios) muestra cómo el proceso de autenticación interactúa con el servidor de aplicación: el proceso principal del servidor valida las credenciales, genera el token JWT y redirige según el rol, mientras que el gestor de procesos del sistema operativo (systemd) garantiza la disponibilidad del servicio de autenticación.

> **[Insertar Figura 111 — Vista de Procesos: Flujo Administrador]**

---

## → RELACIONA CON →

## ENTREGABLE DE IMPLEMENTACIÓN — Objetos de Programación

### Frontend
| Objeto | Descripción |
|---|---|
| `LoginPage.tsx` | Pantalla de inicio de sesión para Estudiante y Docente |
| `RegisterPage.tsx` | Formulario de registro diferenciado por rol |
| `VerificacionCorreo.tsx` | Pantalla de activación de cuenta via enlace |
| `RecuperarPassword.tsx` | Solicitar restablecimiento por correo |
| `ResetPassword.tsx` | Formulario nueva contraseña con token |
| `authService.ts` | Servicio de llamadas: `/registro`, `/login`, `/verificar-email`, `/recuperar-password` |
| `EstudianteDashboard.tsx` | Dashboard cargado tras login exitoso del Estudiante |
| `DocenteDashboard.tsx` | Dashboard cargado tras login exitoso del Docente |

### Backend
| Objeto | Descripción |
|---|---|
| `AuthController.cs` | Controlador REST con endpoints de autenticación |
| `AuthService.cs` / `IAuthService.cs` | Servicio con lógica de negocio de autenticación |
| `EmailService.cs` | Envío de correos de verificación y recuperación |
| `RegisterDto.cs` / `LoginDto.cs` | DTOs de entrada de datos |
| `JWT (JsonWebToken)` | Generación y validación de tokens de sesión |
| `BCrypt.Net` | Hashing seguro de contraseñas |

### Base de Datos
| Tabla | Campos relevantes |
|---|---|
| `Usuarios` | id, email, passwordHash, rol, activo, primeraSesion, fechaRegistro |
| `Estudiantes` | estudianteId, grado, edad, nivelDificultad |
| `Docentes` | docenteId |
| `TokensRecuperacion` | token, expiracion, usuarioId |

---
---

# RF-002 | CU-0002: Gestionar Biblioteca Personal de Lecturas

---

## ENTREGABLE DE ANÁLISIS — SRS (Fd03.md)

### Paquete
El CU-0002 pertenece al paquete **"Gestión de Lecturas"** del Diagrama de Paquetes (Figura 4 del SRS). Este paquete agrupa las funcionalidades relacionadas con la visualización, organización y acceso a las lecturas personales del estudiante. Se conecta con el paquete de Generación con IA (que provee las lecturas) y con el paquete de Evaluaciones (que gestiona los cuestionarios asociados).

> **[Insertar Figura 4 — Diagrama de Paquetes (detalle paquete Gestión de Lecturas)]**

---

### Diagrama de Caso de Uso
El Diagrama de Casos de Uso (Figura 5 del SRS) muestra al actor **Estudiante** interactuando con CU-0002. Los flujos representados son: Visualizar lista de lecturas, Buscar lecturas por título, Filtrar por tipo y longitud, Marcar/Desmarcar lectura como favorita, Ver historial de resultados y Eliminar lectura.

> **[Insertar Figura 5 — Diagrama de Casos de Uso (resaltar CU-0002)]**

---

### Diagrama de Secuencia
El Análisis de Objetos del CU-0002 (Figura 7 del SRS) ilustra las interacciones entre el Estudiante, la interfaz de la Biblioteca Personal y la lógica central del sistema. Muestra cómo el estudiante visualiza sus lecturas generadas, realiza búsquedas y aplica filtros en tiempo real, el proceso de marcar/desmarcar favoritas, las acciones sobre lecturas (leer, ver historial, eliminar) y cómo el sistema actualiza dinámicamente las listas.

> **[Insertar Figura 7 — Análisis de Objetos CU-0002]**

---

### Diagrama de Clases
El Modelo Lógico del SRS identifica las clases: `Lectura` (título, tipo, longitud, contenido, estado), `SesionLectura` (progreso, fechaInicio, fechaFin, estado) y `Favorito` (asociación entre Lectura y Estudiante). La clase `Lectura` está asociada a `Estudiante` por una relación de composición, y `SesionLectura` registra el historial de lecturas por cada intento.

> **[Insertar Diagrama de Clases SRS — clases Lectura, SesionLectura, Favorito]**

---

### Diagrama de Proceso
El Diagrama de Actividades con Objetos CU-0002 (Figura 20 del SRS) muestra el flujo de actividades del estudiante al gestionar su biblioteca: el sistema carga las lecturas al iniciar sesión, el estudiante aplica filtros o busca, selecciona una lectura para leer o ver historial, y el sistema actualiza el estado según las acciones realizadas.

> **[Insertar Figura 20 — Diagrama de Actividades con Objetos CU-0002]**

---

## → RELACIONA CON →

---

## ENTREGABLE DE DISEÑO — SAD (fd04.md)

### Paquete
En el Diagrama de Paquetes del sistema, CU-0002 toca los siguientes paquetes y archivos:

**Paquete API (backend):**
- **Controllers/** → `LecturasController.cs`, `SesionesLecturaController.cs`
- **Services/** → `LecturaIAService.cs`
- **Models/DTOs/** → `LecturaDto.cs`, `ComprencionLectoraDto.cs`
- **Models/Entities/** → `Lectura.cs`, `SesionLectura.cs`
- **Data/** → `ApplicationDbContext.cs`

**Paquete FRONTEND:**
- **Pages/** → `EstudianteDashboard.tsx`, `LecturaDetalle.tsx`, `LecturaVistaLectura.tsx`, `HistorialResultados.tsx`
- **components/dashboard/** → `LecturasFilter.tsx`, `LecturasList.tsx`
- **components/** → `AyudaContextual.tsx`
- **Services/** → `lecturaService.ts`, `sesionLecturaService.ts`
- **config/** → `api.ts`

> **[Insertar Figura 2 — Diagrama de Subsistemas]**
> **[Insertar Figura 107 — Vista de Desarrollo: Diagrama de Paquetes CU-0002]**

---

### Diagrama de Caso de Uso
La Figura 1 del SAD muestra CU-0002 como una de las acciones principales del actor **Estudiante**. Se puede observar que CU-0002 tiene relación de inclusión con CU-0001 (sesión activa requerida) y sirve como punto de acceso hacia CU-0005 (leer), CU-0006 (cuestionario) y CU-0007 (retroalimentación).

> **[Insertar Figura 1 SAD — Diagrama de Casos de Uso del Sistema (resaltar CU-0002)]**

---

### Diagrama de Secuencia
El SAD contiene siete diagramas de secuencia para CU-0002:
- **Figura 9:** Cargar Biblioteca Personal (carga automática al iniciar sesión)
- **Figura 9b:** Búsqueda y Filtrado en tiempo real (useEffect, filtrado local)
- **Figura 10:** Gestión de Favoritos (marcar/desmarcar estrella, persistencia en BD)
- **Figura 11:** Leer Lectura (abrir lector, actualizar sesión, botón Terminar)
- **Figura 12:** Historial de resultados / intentos previos
- **Figura 13:** Mostrar Resultados y Retroalimentación desde biblioteca
- **Figura 13b:** Eliminar lectura (confirmación modal, eliminación en BD)

> **[Insertar Figura 9 — Secuencia: Cargar Biblioteca Personal]**
> **[Insertar Figura 10 — Secuencia: Gestión de Favoritos]**

---

### Diagrama de Clases
El Diagrama de Clases General (Figura 105 del SAD) presenta las clases `Lectura`, `SesionLectura` y `Favorito` con sus atributos completos y relaciones. `Lectura` tiene relación de composición con `Estudiante` (1 estudiante → N lecturas). `SesionLectura` registra cada intento de lectura con estado, tiempo y progreso.

> **[Insertar Figura 105 — Diagrama de Clases General (resaltar Lectura, SesionLectura, Favorito)]**

---

### Diagrama de Proceso
La Figura 109 del SAD (Vista de Procesos — Flujo Estudiante: Lectura con Quiz) muestra el proceso completo desde que el estudiante selecciona una lectura de su biblioteca hasta que completa el cuestionario. El proceso principal del servidor gestiona las solicitudes síncronamente: obtiene datos de BD, renderiza la interfaz y actualiza estados.

> **[Insertar Figura 109 — Vista de Procesos: Flujo Estudiante Lectura con Quiz]**

---

## → RELACIONA CON →

## ENTREGABLE DE IMPLEMENTACIÓN — Objetos de Programación

### Frontend
| Objeto | Descripción |
|---|---|
| `BibliotecaPersonal.tsx` | Componente principal con pestañas Todas / Favoritas |
| `LecturaCard.tsx` | Tarjeta por lectura: título, tipo, longitud, progreso, acciones |
| `FiltrosBiblioteca.tsx` | Filtros desplegables por tipo y longitud |
| `FavoritosTab.tsx` | Vista de lecturas marcadas como favoritas |
| `HistorialResultados.tsx` | Listado de intentos anteriores del cuestionario |
| `lecturaService.ts` | GET `/api/lecturas`, DELETE `/api/lecturas/{id}`, POST/DELETE `/api/favoritos` |

### Backend
| Objeto | Descripción |
|---|---|
| `LecturasController.cs` | GET lista lecturas del estudiante, DELETE eliminar lectura |
| `FavoritosController.cs` | POST marcar favorito, DELETE desmarcar |
| `SesionesLecturaController.cs` | PATCH actualizar tiempo/estado de sesión |
| `LecturaService.cs` / `ILecturaService.cs` | Lógica de filtrado, búsqueda,  estado |
| `LecturaDto.cs` / `SesionLecturaDto.cs` | Objetos de transferencia de datos |
| `ApplicationDbContext.cs` | Contexto Entity Framework Core |

### Base de Datos
| Tabla | Campos relevantes |
|---|---|
| `Lecturas` | id, titulo, tipo, longitud, contenido, imagenUrl, estudianteId, fechaGeneracion |
| `SesionesLectura` | id, lecturaId, estudianteId, estado, progreso, fechaInicio, fechaFin, completada |
| `Favoritos` | id, lecturaId, estudianteId |

---
---

# RF-003 | CU-0003: Gestionar Preferencias de Contenido del Estudiante

---

## ENTREGABLE DE ANÁLISIS — SRS (Fd03.md)

### Paquete
El CU-0003 corresponde al paquete **"Preferencias y Personalización"** del Diagrama de Paquetes (Figura 4 del SRS). Este paquete se activa cuando el estudiante solicita generar una nueva lectura. Recoge seis categorías de datos de preferencias (temas, personajes, escenario, longitud, emoción y propósito) que alimentan directamente al Motor de Generación con IA (paquete CU-0004).

> **[Insertar Figura 4 — Diagrama de Paquetes (detalle paquete Preferencias)]**

---

### Diagrama de Caso de Uso
El Diagrama de Casos de Uso (Figura 5 del SRS) muestra al actor **Estudiante** activando CU-0003 al hacer clic en "Generar Nueva Lectura". Los flujos son: Activar encuesta guiada, Navegar entre los 6 pasos, Seleccionar preferencias, Ver resumen previo y Confirmar para Generar. Incluye flujos alternativos: Retroceder paso, No seleccionar opción (error) y Cancelar.

> **[Insertar Figura 5 — Diagrama de Casos de Uso (resaltar CU-0003)]**

---

### Diagrama de Secuencia
El Análisis de Objetos del CU-0003 (Figura 8 del SRS) representa la activación automática de la encuesta guiada a través de un modal, la presentación secuencial de 6 preguntas con sus opciones, el registro de respuestas por paso, la validación de que al menos una opción esté seleccionada y la vista previa final con todas las preferencias antes de confirmar la generación.

> **[Insertar Figura 8 — Análisis de Objetos CU-0003]**

---

### Diagrama de Clases
Las clases del Modelo Lógico del SRS para este CU son: `Preferencia` (temas, personajes, escenario, longitud, emocion, proposito, estudianteId), `EncuestaGuiada` (pasoActual, respuestasSeleccionadas) y `OpcionEncuesta` (texto, categoria). La clase `Preferencia` tiene relación de asociación con `Estudiante` (1 estudiante → N preferencias históricas).

> **[Insertar Diagrama de Clases SRS — clases Preferencia, EncuestaGuiada]**

---

### Diagrama de Proceso
El Diagrama de Actividades con Objetos CU-0003 (Figura 21 del SRS) muestra el proceso de la encuesta de 6 pasos: el estudiante avanza paso a paso seleccionando opciones, el sistema valida cada paso, guarda las respuestas en memoria temporal y al finalizar presenta el resumen para confirmación antes de lanzar la generación.

> **[Insertar Figura 21 — Diagrama de Actividades con Objetos CU-0003]**

---

## → RELACIONA CON →

---

## ENTREGABLE DE DISEÑO — SAD (fd04.md)

### Paquete
En el Diagrama de Paquetes del SAD, CU-0003 involucra los siguientes paquetes y archivos del proyecto:

**Paquete API:**
- **Controllers/** → `LecturasController.cs` (endpoint POST Generar recibe las preferencias)
- **Services/** → `LecturaIAService.cs` (método ConstruirPromptLectura(preferencias))
- **Models/Entities/** → `Lectura.cs` (campos embebidos: Temas, Personajes, Escenario, Longitud, Emocion, Proposito)
- **Data/** → `ApplicationDbContext.cs`

**Paquete FRONTEND:**
- **components/** → `EncuestaGuiadaModal.tsx`, `VistaPreviaPreferenciasModal.tsx`
- **Services/** → `lecturaService.ts` (método POST `/api/lecturas/generar`)
- **data/** → `contenidoAyuda.ts` (textos de instrucciones por paso)

> **[Insertar Figura 2 — Diagrama de Subsistemas]**
> **[Insertar Figura 107 — Vista de Desarrollo: Diagrama de Paquetes CU-0003]**

---

### Diagrama de Caso de Uso
La Figura 1 del SAD muestra CU-0003 como el paso previo obligatorio a CU-0004. El Estudiante activa CU-0003 desde su dashboard; al completarlo, el sistema dispone de los parámetros necesarios para iniciar CU-0004 (Generar Lectura con IA).

> **[Insertar Figura 1 SAD — Diagrama de Casos de Uso (resaltar CU-0003→CU-0004)]**

---

### Diagrama de Secuencia
La **Figura 14** del SAD detalla el flujo exclusivo de frontend para la encuesta guiada: el modal se abre al pulsar "Generar Nueva Lectura", el componente gestiona el estado del paso actual con `useState`, registra las selecciones localmente en el navegador, avanza paso a paso con validación, y al confirmar en el resumen final envía todas las preferencias al backend en una sola petición POST.

> **[Insertar Figura 14 — Secuencia: Encuesta Guiada CU-0003]**

---

### Diagrama de Clases
El Diagrama de Clases General (Figura 105 del SAD) muestra la clase `Preferencia` con sus seis atributos de configuración, su clave foránea a `Estudiante`, y su relación de dependencia hacia `Lectura` (las preferencias determinan los atributos de la lectura generada).

> **[Insertar Figura 105 — Diagrama de Clases General (resaltar Preferencia)]**

---

### Diagrama de Proceso
La **Figura 112** del SAD (Vista de Procesos — Flujo Sistema: Generación de Lectura con IA) muestra el inicio del proceso desde que el estudiante completa la encuesta: el frontend inicia un mecanismo de polling asíncrono, mientras el backend orquesta la generación. La encuesta es el disparador del proceso completo.

> **[Insertar Figura 112 — Vista de Procesos: Generación de Lectura con IA]**

---

## → RELACIONA CON →

## ENTREGABLE DE IMPLEMENTACIÓN — Objetos de Programación

### Frontend
| Objeto | Descripción |
|---|---|
| `EncuestaGuiada.tsx` / `EncuestaModal.tsx` | Modal de 6 pasos con barra de progreso |
| `PasoEncuesta.tsx` | Componente reutilizable por cada pregunta |
| `ResumenPreferencias.tsx` | Vista previa con todas las selecciones antes de confirmar |
| `preferenciaService.ts` | POST `/api/preferencias` — envía las 6 preferencias al backend |
| `useState` / `useEffect` | Gestión del paso actual y respuestas seleccionadas (React) |

### Backend
| Objeto | Descripción |
|---|---|
| `PreferenciasController.cs` | POST `/api/preferencias` — recibe y guarda preferencias |
| `PreferenciasService.cs` / `IPreferenciasService.cs` | Lógica de almacenamiento y recuperación |
| `PreferenciasDto.cs` | DTO: temas, personajes, escenario, longitud, emocion, proposito |
| `ApplicationDbContext.cs` | Contexto Entity Framework Core |

### Base de Datos
| Tabla | Campos relevantes |
|---|---|
| `Preferencias` | id, estudianteId, temas, personajes, escenario, longitud, emocion, proposito, fechaRegistro |

---
---

# RF-004 | CU-0004: Generar Textos Adaptados con IA

---

## ENTREGABLE DE ANÁLISIS — SRS (Fd03.md)

### Paquete
El CU-0004 pertenece al paquete **"Generación de Contenido con IA"** del Diagrama de Paquetes (Figura 4 del SRS). Este paquete recibe las preferencias almacenadas de CU-0003, construye un prompt estructurado y se comunica con el Motor de Inteligencia Artificial externo. Es el núcleo del sistema: genera el texto personalizado y la imagen de portada, y deposita el resultado en la Biblioteca del estudiante (paquete CU-0002).

> **[Insertar Figura 4 — Diagrama de Paquetes (detalle paquete Generación con IA)]**

---

### Diagrama de Caso de Uso
El Diagrama de Casos de Uso (Figura 5 del SRS) muestra al actor **Estudiante** activando CU-0004 al confirmar el resumen de preferencias. El sistema es co-actor en este CU, ya que actúa como intermediario entre las preferencias del estudiante y el Motor de IA externo. Los flujos son: Solicitar generación, Recibir texto generado, Recibir imagen generada, Almacenar lectura en biblioteca y Mostrar vista previa. Incluye FA01 para fallo de conexión con IA.

> **[Insertar Figura 5 — Diagrama de Casos de Uso (resaltar CU-0004)]**

---

### Diagrama de Secuencia
El Análisis de Objetos del CU-0004 (Figura 9 del SRS) muestra el proceso de construcción del prompt: el sistema recupera las 6 preferencias del estudiante, las combina con parámetros de formato (extensión exacta en palabras, tipo de texto, restricciones de seguridad para menores), envía el prompt al Motor de IA, recibe texto e imagen, valida la integridad de ambos y los almacena en la biblioteca del estudiante.

> **[Insertar Figura 9 — Análisis de Objetos CU-0004]**

---

### Diagrama de Clases
El Modelo Lógico del SRS define las clases: `MotorIA` (metodo: generarTexto, generarImagen), `Prompt` (instruccionesFormato, parametrosContenido, restriccionesSeguidad) y `LecturaGenerada` (titulo, texto, imagenUrl, tipo, longitud). El `Prompt` es construido por el sistema a partir de `Preferencia` y los parámetros del perfil del `Estudiante`.

> **[Insertar Diagrama de Clases SRS — clases MotorIA, Prompt, LecturaGenerada]**

---

### Diagrama de Proceso
El Diagrama de Actividades con Objetos CU-0004 (Figura 22 del SRS) muestra el proceso asíncrono de generación: el estudiante hace clic en "Generar Lectura", el sistema muestra una pantalla de carga, en paralelo el motor de IA procesa el prompt de texto y el prompt de imagen, el sistema valida los resultados recibidos, los almacena en la base de datos y notifica al estudiante que la lectura está disponible.

> **[Insertar Figura 22 — Diagrama de Actividades con Objetos CU-0004]**

---

## → RELACIONA CON →

---

## ENTREGABLE DE DISEÑO — SAD (fd04.md)

### Paquete
En el Diagrama de Paquetes del sistema, CU-0004 toca los siguientes paquetes y archivos:

**Paquete API (backend):**
- **Controllers/** → `LecturasController.cs` (endpoint POST Generar)
- **Services/** → `LecturaIAService.cs` (llama Google Gemini para texto y Hugging Face para imagen)
- **Configuration/** → `IASettings.cs` (claves API Gemini y HuggingFace)
- **Models/DTOs/** → `LecturaDto.cs`, `CompresionLectoraDto.cs`
- **Models/Entities/** → `Lectura.cs`
- **wwwroot/images/lecturas/** → imágenes .png generadas y guardadas en servidor
- **Data/** → `ApplicationDbContext.cs`

**Paquete FRONTEND:**
- **Pages/** → `CuestionarioGeneracion.tsx` (pantalla de carga + polling)
- **Services/** → `lecturaService.ts` (POST `/api/lecturas/generar`)
- **config/** → `api.ts` (instancia Axios con base URL del backend)

> **[Insertar Figura 2 — Diagrama de Subsistemas]**
> **[Insertar Figura 107 — Vista de Desarrollo: Diagrama de Paquetes CU-0004]**

---

### Diagrama de Caso de Uso
La Figura 1 del SAD muestra CU-0004 como la acción de mayor complejidad técnica del sistema. Depende de CU-0003 (incluye) y produce la lectura que alimenta CU-0005 (lectura) y CU-0006 (evaluación). El sistema incluye un actor secundario implícito: el **Motor de IA externo** (Google Gemini / Hugging Face).

> **[Insertar Figura 1 SAD — Diagrama de Casos de Uso (resaltar CU-0004)]**

---

### Diagrama de Secuencia
La **Figura 15** del SAD detalla el proceso técnico completo de generación:
1. El frontend envía las preferencias al backend vía POST
2. El backend construye el prompt con `PromptBuilder`
3. Llamada a la **API de Google Gemini** → recibe texto de la historia
4. Llamada a la **API de Hugging Face (Stable Diffusion)** → recibe imagen de portada
5. El sistema consolida texto e imagen, crea el registro `Lectura` en BD
6. Devuelve respuesta al frontend con la lectura lista
7. El frontend redirige al estudiante a ver su nueva lectura

> **[Insertar Figura 15 — Secuencia: Generación de Lectura con IA]**

---

### Diagrama de Clases
El Diagrama de Clases General (Figura 105 del SAD) muestra la clase `Lectura` con atributos completos: id, titulo, contenido, tipo (enum: Narrativa/Descriptiva/Argumentativa/Expositiva/Informativa), longitud (enum: Corta/Media/Larga), imagenUrl, estudianteId, estadoGeneracion y fechaGeneracion. Se observa su relación con `Preferencia` (origen) y `SesionLectura` (uso posterior).

> **[Insertar Figura 105 — Diagrama de Clases General (resaltar clase Lectura)]**

---

### Diagrama de Proceso
La **Figura 112** del SAD (Vista de Procesos — Flujo Sistema: Generación de Lectura con IA) muestra el mecanismo de polling asíncrono: cuando el estudiante confirma las preferencias, el proceso de petición web principal registra la solicitud en BD con estado "generando" y responde inmediatamente al frontend. Un proceso de background ejecuta la comunicación con las APIs de IA. El frontend consulta periódicamente el estado hasta que cambia a "listo" y automaticamente redirige al estudiante.

> **[Insertar Figura 112 — Vista de Procesos: Generación de Lectura con IA]**

---

## → RELACIONA CON →

## ENTREGABLE DE IMPLEMENTACIÓN — Objetos de Programación

### Frontend
| Objeto | Descripción |
|---|---|
| `GenerarLecturaLoader.tsx` | Pantalla de carga con animación y polling al backend |
| `LecturaGeneradaVista.tsx` | Vista previa de la lectura: título, tipo, texto, imagen |
| `lecturaService.ts` | POST `/api/lecturas/generar` · GET `/api/lecturas/estado/{id}` (polling) |

### Backend
| Objeto | Descripción |
|---|---|
| `LecturasController.cs` | POST `/api/lecturas/generar` — recibe preferencias, lanza generación |
| `LecturaService.cs` / `ILecturaService.cs` | Orquesta el proceso completo |
| `PromptBuilder.cs` | Construye el prompt con parámetros de contenido, formato y restricciones de seguridad para menores |
| `GeminiService.cs` | Llama a la API de Google Gemini y recibe el texto generado |
| `HuggingFaceService.cs` | Llama a la API de Stable Diffusion y recibe la imagen de portada |
| `BackgroundTask` (IHostedService) | Proceso en segundo plano para no bloquear el servidor durante la generación |
| `LecturaGeneradaDto.cs` | DTO de respuesta: titulo, texto, imagenUrl, tipo, longitud |
| `ApplicationDbContext.cs` | Contexto Entity Framework Core |

### Base de Datos
| Tabla | Campos relevantes |
|---|---|
| `Lecturas` | id, titulo, contenido, tipo, longitud, imagenUrl, estudianteId, nivelDificultad, estadoGeneracion, fechaGeneracion |
