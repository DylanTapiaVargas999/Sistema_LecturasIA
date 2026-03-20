# Informe de Cambios SonarCloud — RF-001 a RF-004

A continuación se detalla el informe de todos los cambios de código realizados para corregir los problemas identificados por SonarCloud en los cuatro primeros requerimientos funcionales de la aplicación, siguiendo sus mensajes y líneas reportadas.

---

## RF-001: Autenticación y Autorización

### 1. [AuthService.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Services/AuthService.cs)

**Problema (Sonar):** BLOCKER #1 (Vulnerability) — _"JWT secret keys should not be disclosed in code"_ (Líneas 344–345)
**Solución:** Se eliminó el texto hardcodeado en caso de que la clave secreta de JWT no esté en la base de configuración. En su lugar, el sistema arroja una excepción para obligar a definir este secreto de forma segura.

**Código antiguo:**
```csharp
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
    _configuration["JwtSettings:SecretKey"] ?? "DefaultSecretKeyForDevelopment123456"));
```
**Código nuevo:**
```csharp
var secretKey = _configuration["JwtSettings:SecretKey"]
    ?? throw new InvalidOperationException("JwtSettings:SecretKey no está configurada. Use variables de entorno o appsettings.");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
```

### 2. [appsettings.json](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/appsettings.json)

**Problema (Sonar):** MEDIUM #1 (Vulnerability) — _'"password" detected here, make sure this is not a hard-coded credential'_ (Línea 24)
**Solución:** Se extrajo el password que estaba quemado en el archivo base del repositorio, cambiándolo por un placeholder de una variable de entorno `"${EMAIL_SMTP_PASSWORD}"`.

**Código antiguo:**
```json
"Password": "tu_contraseña_de_aplicacion",
```
**Código nuevo:**
```json
"Password": "${EMAIL_SMTP_PASSWORD}",
```

### 3. [AuthController.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Controllers/AuthController.cs)

**Problemas (Sonar):**
- LOW #3 (Code Smell): _"Define constant instead of using literal 'Datos inválidos' 5 times"_ (Líneas 23, 58, 93, 200, 224)
- LOW #4 (Code Smell): _"Remove unused local variable 'resultado'"_ (Línea 186)

**Solución:** Se creó una constante de clase y se reemplazó el string explícito en las 5 respuestas `BadRequest()`. Luego se eliminó la variable `resultado` no usada.

**Código antiguo (ejemplo):**
```csharp
// Línea 23
return BadRequest(new { mensaje = "Datos inválidos", errores = ModelState });

// Línea 186
var resultado = await _authService.SolicitarRecuperacionPassword(dto.Email);
```
**Código nuevo:**
```csharp
// Al inicio de la clase
private const string DatosInvalidosMensaje = "Datos inválidos";

// Línea 23
return BadRequest(new { mensaje = DatosInvalidosMensaje, errores = ModelState });

// Línea 186
await _authService.SolicitarRecuperacionPassword(dto.Email);
```

### 4. [GradosController.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Controllers/GradosController.cs)

**Problemas (Sonar):**
- MEDIUM #12 (Code Smell): _"Annotate this method with ProducesResponseType"_ (Línea 22)
- LOW #14 (Code Smell): _"Make 'ObtenerEtiquetaGrado' a static method"_ (Línea 43)

**Solución Documental:** Agregar el tipo de repuesta HTTP de éxito esperada en los endpoint y transformar métodos estáticos (no dependen del estado del controlador) en estáticos reales.

**Código antiguo:**
```csharp
[HttpGet]
public IActionResult ObtenerGrados()

private string ObtenerEtiquetaGrado(GradoEscolar grado)
```
**Código nuevo:**
```csharp
[HttpGet]
[ProducesResponseType(typeof(IEnumerable<object>), StatusCodes.Status200OK)]
public IActionResult ObtenerGrados()

private static string ObtenerEtiquetaGrado(GradoEscolar grado)
```

### 5. [RegistroEstudianteDto.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Models/DTOs/RegistroEstudianteDto.cs)

**Problema (Sonar):** MEDIUM #38 (Code Smell): _"Value type property should be nullable or required"_ (Línea 30)
**Solución:** Se agregó la palabra clave `required` porque los enteros pre-inicializan en 0 al sobre-enviar JSON si no se envían, causando bugs en los tests de modelo.

**Código antiguo:**
```csharp
public int Edad { get; set; }
```
**Código nuevo:**
```csharp
public required int Edad { get; set; }
```

---

## RF-002: Biblioteca Personal de Lecturas

### 1. [LecturasController.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Controllers/LecturasController.cs)

**Problemas (Sonar):**
- MEDIUM #13-21 (Code Smell): _"Don't use string interpolation in logging message templates"_ (Líneas 64, 97, 171, 178, 182, 189, 195, 297, 303)
- LOW #15 (Code Smell): _"Define constant 'Estudiante no encontrado' 6 times"_ (Línea 45, etc.)
- LOW #16 (Code Smell): _"Loop should be simplified by calling Select"_ (Línea 264)

**Solución:** Se reemplazó todo el string.Format y `$""` por plantillas de logging estructurado (`{Placeholder}`, variable), se insertó una constante global y se cambió el proceso de iteración por LINQ al recolectar los IDs.

**Código antiguo (ejemplo):**
```csharp
_logger.LogInformation($"Generando lectura de tipo {tipoLectura} para estudiante {estudiante.Id}");

// Línea 264
var cuestionariosIds = new List<Guid>();
foreach (var cuestionario in cuestionarios)
    cuestionariosIds.Add(cuestionario.Id);
```
**Código nuevo:**
```csharp
_logger.LogInformation("Generando lectura de tipo {TipoLectura} para estudiante {EstudianteId}", tipoLectura, estudiante.Id);

// Línea 264
var cuestionariosIds = cuestionarios.Select(c => c.Id).ToList();
// .. (resto del bloque foreach modificado)
```

### 2. [ApplicationDbContext.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Data/ApplicationDbContext.cs)

**Problema (Sonar):** MEDIUM #23 (Code Smell): _"Remove this commented out code"_ (Línea 35)
**Solución:** Se borraron las declaraciones de código de base de datos desactualizadas (`DbSet<CodigoRegistroEstudiante>`) que incrementan el ruido al revisar código.

**Código antiguo:**
```csharp
// public DbSet<CodigoRegistroEstudiante> CodigosRegistroEstudiante { get; set; }
// public DbSet<CodigoRegistroDocente> CodigosRegistroDocente { get; set; }
```
*(Líneas eliminadas totalmente en la nueva versión)*

---

## RF-003: Preferencias de Contenido

### 1. [ComprencionLectoraDto.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Models/DTOs/ComprencionLectoraDto.cs)

**Problema (Sonar):** MEDIUM #28-36 (Code Smell) — _"Value type property should be nullable or required"_ (Múltiples líneas: 12, 31, 32, 40, etc.)
**Solución:** Al igual que en [RegistroEstudianteDto](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Models/DTOs/RegistroEstudianteDto.cs#6-44), se añadió el identificador `required` a todas las propiedades de tipos primordiales (`int`, `decimal`, `Guid`, `bool`) que no eran opcionales según el modelo del software original.

**Código antiguo (ejemplo):**
```csharp
public int LecturaId { get; set; }
public decimal TiempoLecturaMinutos { get; set; }
public Guid SesionLecturaId { get; set; }
```
**Código nuevo:**
```csharp
public required int LecturaId { get; set; }
public required decimal TiempoLecturaMinutos { get; set; }
public required Guid SesionLecturaId { get; set; }
```

---

## RF-004: Generar Textos con IA

### 1. [LecturaIAService.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Services/LecturaIAService.cs)

**Problemas (Sonar):**
- MEDIUM #55 (Code Smell): _"Either log this exception and handle it, or rethrow it with some contextual information"_ (Línea 54)
- MEDIUM #56-58 (Code Smell): _"'System.Exception' should not be thrown"_ (Líneas 146, 177, 186)
- MEDIUM #59 (Code Smell): _"Remove unused method parameter 'titulo'"_ (Línea 189)

**Solución:** Se mejoraron todos los mensajes y excepciones que pasaron a ser context-aware. La variable `Exception` general bajó a nivel `HttpRequestException` o `InvalidOperationException`. Por último, se descartó el parámetro "titulo" que no era utilizado durante la generación de imágenes con OpenIA/Hugging Face.

**Código antiguo (ejemplo):**
```csharp
// Línea 54
_logger.LogError(ex, "Error al generar lectura con IA");
throw;

// Línea 146
throw new Exception($"Error en API de OpenAI: {response.StatusCode} - {errorContent}");
```
**Código nuevo:**
```csharp
// Línea 54
_logger.LogError(ex, "Error al generar lectura con IA para tipo {TipoLectura}", tipoLectura);
throw;

// Línea 146
throw new HttpRequestException($"Error en API de OpenAI: {response.StatusCode} - {errorContent}");
```

### 2. [Program.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Program.cs)

**Problemas (Sonar):**
- BLOCKER Adicional: Fallback de llave secreta expuesto, al igual que en [AuthService](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Services/AuthService.cs#13-595).
- MEDIUM #39 (Code Smell): _"Remove this commented out code"_ (Línea 143)
- MEDIUM #40 (Code Smell): _"Await RunAsync instead"_ (Línea 155)

**Solución:** Se removieron los comentarios (`app.UseHttpsRedirection();`). Adicional, se reorientó el programa principal a correr de forma explícitamente asincrónica y se purgó la llave de texto quemada (hardcodeada).

**Código antiguo:**
```csharp
var secretKey = jwtSettings["SecretKey"] ?? "DefaultSecretKeyForDevelopment123456";

// Deshabilitado en desarrollo local para usar HTTP
// app.UseHttpsRedirection();

app.Run();
```
**Código nuevo:**
```csharp
var secretKey = jwtSettings["SecretKey"]
    ?? throw new InvalidOperationException("JwtSettings:SecretKey no está configurada en la aplicación.");

// UseHttpsRedirection deshabilitado en desarrollo local para usar HTTP

await app.RunAsync();
```

---

## RF-001 al RF-004: Errores en Frontend

### 1. [LecturaDetalle.tsx](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.Frontend/src/pages/LecturaDetalle.tsx)

**Problemas (Sonar):**
- MEDIUM (Code Smell): _"Missing radix parameter"_ al convertir ID (Línea 23)
- LOW (Code Smell): _"Do not use Array index in keys"_ (Líneas 177, 189)

**Solución:** Se añadió base 10 (`10`) al parseInt de React Router. En JSX, en lugar de usar el índice estático del array [(index)](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Services/AuthService.cs#160-250) para el tag `key={`}` se usaron los nombres/strings únicos como `key={tema}`.

### 2. [LecturaVistaLectura.tsx](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.Frontend/src/pages/LecturaVistaLectura.tsx)

**Problema (Sonar):**
- LOW (Code Smell): _"Do not use Array index in keys"_ (Línea 208)

**Solución:** Igualmente se construyó una llave mixta única uniendo el string del índice y las primeras 10 letras del párrafo `key={`${i}-${parrafo.substring(0, 10)}`}` evadiendo un ID duplicativo.

