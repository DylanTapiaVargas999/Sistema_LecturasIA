# Plan de Corrección SonarCloud — RF-001 a RF-004

## Descripción

Se corregirán todos los issues reportados por SonarCloud que pertenecen a los primeros 4 requerimientos funcionales:

- **RF-001:** Autenticación y Autorización
- **RF-002:** Biblioteca Personal de Lecturas
- **RF-003:** Preferencias de Contenido
- **RF-004:** Generar Textos con IA

> [!WARNING]
> El issue **BLOCKER** ([AuthService.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Services/AuthService.cs) línea 344) corresponde a una clave JWT en código con un fallback hardcodeado. Se comenta por qué el JWT debe venir siempre de configuración y se elimina el fallback inseguro.

> [!IMPORTANT]
> El issue en [appsettings.json](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/appsettings.json) (password hardcoded línea 24) reportado por SonarCloud se resuelve reemplazando el valor real por un placeholder ya que los secretos reales deben ir en variables de entorno o en `appsettings.Development.json` ignorado por git.

---

## Archivos a Modificar — RF-001: Autenticación y Autorización

---

### [MODIFY] [AuthService.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Services/AuthService.cs)

| # Sonar | Línea | Mensaje Sonar | Cambio |
|---|---|---|---|
| BLOCKER #1 (Vuln) | 344–345 | JWT secret keys should not be disclosed in code | Eliminar fallback literal `"DefaultSecretKeyForDevelopment123456"`, requerir configuración obligatoria con `ArgumentNullException` o `throw InvalidOperationException` |

**Línea antigua (344–345):**
```csharp
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
    _configuration["JwtSettings:SecretKey"] ?? "DefaultSecretKeyForDevelopment123456"));
```
**Línea nueva (344–345):**
```csharp
var secretKey = _configuration["JwtSettings:SecretKey"]
    ?? throw new InvalidOperationException("JwtSettings:SecretKey no está configurada. Use variables de entorno o appsettings.");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
```

---

### [MODIFY] [appsettings.json](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/appsettings.json)

| # Sonar | Línea | Mensaje Sonar | Cambio |
|---|---|---|---|
| MEDIUM #1 (Vuln) | 24 | "password" detected here, make sure this is not a hard-coded credential | Reemplazar valor real por placeholder genérico |

**Línea antigua (24):**
```json
"Password": "tu_contraseña_de_aplicacion",
```
**Línea nueva (24):**
```json
"Password": "${EMAIL_SMTP_PASSWORD}",
```

---

### [MODIFY] [AuthController.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Controllers/AuthController.cs)

| # Sonar | Línea | Mensaje Sonar | Cambio |
|---|---|---|---|
| LOW #3 (CS) | 23 | Define constant instead of using literal 'Datos inválidos' 5 times | Extraer a constante privada de clase |
| LOW #4 (CS) | 186 | Remove unused local variable 'resultado' | Eliminar variable `resultado` innecesaria |

**Cambio 1 — Agregar constante y reemplazar literales:**
```csharp
// Línea nueva al inicio de la clase:
private const string DatosInvalidosMensaje = "Datos inválidos";
```
Y reemplazar las 5 ocurrencias de `"Datos inválidos"` por `DatosInvalidosMensaje`.

**Cambio 2 — SolicitarRecuperacion línea 186:**
```csharp
// ANTES:
var resultado = await _authService.SolicitarRecuperacionPassword(dto.Email);
// Por seguridad, siempre devolvemos éxito aunque el email no exista
return Ok(...);

// DESPUÉS:
await _authService.SolicitarRecuperacionPassword(dto.Email);
// Por seguridad, siempre devolvemos éxito aunque el email no exista
return Ok(...);
```

---

### [MODIFY] [GradosController.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Controllers/GradosController.cs)

| # Sonar | Línea | Mensaje Sonar | Cambio |
|---|---|---|---|
| MEDIUM #12 (CS) | 22 | Annotate this method with ProducesResponseType | Agregar `[ProducesResponseType(typeof(IEnumerable<object>), 200)]` |
| LOW #14 (CS) | 43 | Make 'ObtenerEtiquetaGrado' a static method | Agregar `static` al método privado |

---

### [MODIFY] [RegistroEstudianteDto.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Models/DTOs/RegistroEstudianteDto.cs)

| # Sonar | Línea | Mensaje Sonar | Cambio |
|---|---|---|---|
| MEDIUM #38 (CS) | 26 | Value type property should be nullable or required | Cambiar `int Edad` → `int? Edad` o agregar `[Required]` |

---

## Archivos a Modificar — RF-002: Biblioteca Personal de Lecturas

---

### [MODIFY] [LecturasController.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Controllers/LecturasController.cs)

| # Sonar | Línea | Mensaje Sonar | Cambio |
|---|---|---|---|
| MEDIUM #13–21 (CS) | 64, 97, 171, 178, 182, 189, 195, 297, 303 | Don't use string interpolation in logging message templates | Reemplazar `$"..."` por plantillas estructuradas `"... {Param}", valor` |
| LOW #15 (CS) | 45 | Define constant 'Estudiante no encontrado' 6 times | Extraer a constante |
| LOW #16 (CS) | 264 | Loop should be simplified by calling Select | Simplificar foreach con `.Select()` |

**Ejemplos de cambio (interpolación → structured logging):**
```csharp
// ANTES línea 64:
_logger.LogInformation($"Generando lectura de tipo {tipoLectura} para estudiante {estudiante.Id}");
// DESPUÉS:
_logger.LogInformation("Generando lectura de tipo {TipoLectura} para estudiante {EstudianteId}", tipoLectura, estudiante.Id);

// ANTES línea 97:
_logger.LogInformation($"Lectura generada exitosamente con ID {lectura.Id}");
// DESPUÉS:
_logger.LogInformation("Lectura generada exitosamente con ID {LecturaId}", lectura.Id);
```

**Constante para mensaje repetido:**
```csharp
private const string EstudianteNoEncontrado = "Estudiante no encontrado";
```

**Loop simplificado (línea 264):**
```csharp
// ANTES:
var cuestionariosIds = new List<Guid>();
foreach (var cuestionario in cuestionarios)
    cuestionariosIds.Add(cuestionario.Id);
// DESPUÉS:
var cuestionariosIds = cuestionarios.Select(c => c.Id).ToList();
```

---

### [MODIFY] [ApplicationDbContext.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Data/ApplicationDbContext.cs)

| # Sonar | Línea | Mensaje Sonar | Cambio |
|---|---|---|---|
| MEDIUM #23 (CS) | 35 | Remove this commented out code | Eliminar bloque de código comentado en línea 35 |

---

## Archivos a Modificar — RF-003: Preferencias de Contenido

---

### [MODIFY] [ComprencionLectoraDto.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Models/DTOs/ComprencionLectoraDto.cs)

| # Sonar | Línea | Mensaje Sonar | Cambio |
|---|---|---|---|
| MEDIUM #28–36 (CS) | 12, 31, 32, 40, 64, 115, 117, 244, 245 | Value type property should be nullable or required | Agregar `?` o `[Required]` a propiedades `int`, `bool`, `double` no opcionales |

---

## Archivos a Modificar — RF-004: Generar Textos con IA

---

### [MODIFY] [LecturaIAService.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Services/LecturaIAService.cs)

| # Sonar | Línea | Mensaje Sonar | Cambio |
|---|---|---|---|
| MEDIUM #55 (CS) | 54 | Either log this exception and handle it, or rethrow it with some contextual information | Agregar contexto al rethrow |
| MEDIUM #56–58 (CS) | 146, 177, 186 | 'System.Exception' should not be thrown | Lanzar excepciones más específicas como `InvalidOperationException` o `HttpRequestException` |
| MEDIUM #59 (CS) | 189 | Remove unused method parameter 'titulo' | Eliminar parámetro `titulo` del método [GenerarImagenConHuggingFaceAsync](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Services/LecturaIAService.cs#189-244) |

---

### [MODIFY] [Program.cs](file:///c:/Users/desci2/Documents/Constru/Sistema_LecturasIA/LecturaIA.API/Program.cs)

| # Sonar | Línea | Mensaje Sonar | Cambio |
|---|---|---|---|
| MEDIUM #39 (CS) | 143 | Remove this commented out code | Eliminar bloque comentado |
| MEDIUM #40 (CS) | 155 | Await RunAsync instead | Cambiar `.Wait()` por `await RunAsync()` |

---

## Verificación Plan

### Verificación de build

Después de cada cambio:
```powershell
cd c:\Users\desci2\Documents\Constru\Sistema_LecturasIA\LecturaIA.API
dotnet build
```
El build debe terminar sin errores de compilación.

### Verificación manual de puntos clave

1. **AuthService.cs BLOCKER** — Si `JwtSettings:SecretKey` no está en config, la app debe tirar `InvalidOperationException` al arrancar, no iniciar silenciosamente con un fallback inseguro.
2. **LecturasController.cs logging** — En los logs de la aplicación no deben aparecer mensajes con `$"..."` interpolados; en su lugar deben aparecer con valores separados (plantillas estructuradas).
3. **Program.cs RunAsync** — Si se usa `await`, el proceso debe terminar correctamente sin warnings de compilador.

> [!NOTE]
> No existen tests automatizados en el proyecto. La verificación es mediante `dotnet build` y revisión manual de los cambios.
