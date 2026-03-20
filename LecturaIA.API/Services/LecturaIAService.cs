using System.Text;
using System.Text.Json;
using LecturaIA.API.Configuration;
using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using Microsoft.Extensions.Options;

namespace LecturaIA.API.Services
{
    public interface ILecturaIAService
    {
        Task<(string titulo, string contenido, string urlImagen)> GenerarLecturaAsync(PreferenciasLecturaDto preferencias, string tipoLectura, int edad, string grado);
        Task<Models.Entities.Lectura?> GenerarLecturaParaExamenGrupalAsync(string temaConcepto, string tipoTexto, string longitudTexto, string gradoEscolar, string complejidad, int docenteId);
    }

    public class LecturaIAService : ILecturaIAService
    {
        private readonly HttpClient _httpClient;
        private readonly IASettings _iaSettings;
        private readonly ILogger<LecturaIAService> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly ApplicationDbContext _context;

        public LecturaIAService(
            HttpClient httpClient, 
            IOptions<IASettings> iaSettings, 
            ILogger<LecturaIAService> logger,
            IWebHostEnvironment environment,
            ApplicationDbContext context)
        {
            _httpClient = httpClient;
            _iaSettings = iaSettings.Value;
            _logger = logger;
            _environment = environment;
            _context = context;
        }

        public async Task<(string titulo, string contenido, string urlImagen)> GenerarLecturaAsync(
            PreferenciasLecturaDto preferencias, 
            string tipoLectura, 
            int edad, 
            string grado)
        {
            try
            {
                // PASO 1: Generar título y contenido con OpenAI
                var (titulo, contenido) = await GenerarTextoConOpenAIAsync(preferencias, tipoLectura, edad, grado);

                // PASO 2: Generar imagen con Hugging Face
                var urlImagen = await GenerarImagenConHuggingFaceAsync(preferencias);

                return (titulo, contenido, urlImagen);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar lectura con IA para tipo {TipoLectura}", tipoLectura);
                throw;
            }
        }

        private async Task<(string titulo, string contenido)> GenerarTextoConOpenAIAsync(
            PreferenciasLecturaDto preferencias,
            string tipoLectura,
            int edad,
            string grado)
        {
            _logger.LogInformation("📚 Iniciando generación de lectura con OpenAI");
            
            var longitud = preferencias.Longitud.ToLower() switch
            {
                "corta" => "200",
                "mediana" => "400",
                "larga" => "700",
                _ => "400"
            };

            var temas = string.Join(", ", preferencias.Temas);
            var personajes = string.Join(", ", preferencias.Personajes);
            
            _logger.LogInformation("📝 Parámetros: Longitud={Longitud}, Temas={Temas}, Edad={Edad}", 
                longitud, temas, edad);

            var prompt = $@"Crea una historia de tipo {tipoLectura} para un niño de {edad} años ({grado} grado de primaria).

PREFERENCIAS DEL NIÑO:
- Temas favoritos: {temas}
- Personajes preferidos: {personajes}
- Escenario: {preferencias.Escenario}
- Emoción deseada: {preferencias.Emocion}
- Propósito: {preferencias.Proposito}

INSTRUCCIONES IMPORTANTES:
1. La historia debe tener aproximadamente {longitud} palabras
2. Usa un lenguaje apropiado para su edad ({edad} años)
3. Incluye valores educativos sutiles
4. Debe ser {preferencias.Emocion.ToLower()}
5. El tipo de texto es {tipoLectura}

FORMATO DE RESPUESTA (JSON):
{{
  ""titulo"": ""Título creativo y atractivo para niños"",
  ""contenido"": ""Texto completo de la historia (aproximadamente {longitud} palabras)""
}}

Responde SOLO con el JSON, sin texto adicional.";

            var requestBody = new
            {
                model = "gpt-4o-mini",
                messages = new object[]
                {
                    new { role = "system", content = "Eres un escritor experto en literatura infantil. Respondes SOLO con JSON válido, sin texto adicional." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.7,
                max_tokens = 2000
            };

            var apiUrl = "https://api.openai.com/v1/chat/completions";
            var jsonContent = JsonSerializer.Serialize(requestBody);
            
            // Sistema de reintentos
            for (int intento = 0; intento < 3; intento++)
            {
                try
                {
                    _logger.LogInformation("🔄 Intento {Intento}/3 de llamada a OpenAI para lectura", intento + 1);
                    
                    var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
                    request.Headers.Add("Authorization", $"Bearer {_iaSettings.OpenAIApiKey}");
                    request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                    
                    var response = await _httpClient.SendAsync(request);

                    if (!response.IsSuccessStatusCode)
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        _logger.LogWarning("❌ Error en OpenAI API (Status {Status}): {Error}", 
                            response.StatusCode, errorContent);
                        
                        if (intento < 2)
                        {
                            await Task.Delay((int)Math.Pow(2, intento) * 1000);
                            continue;
                        }
                        throw new HttpRequestException($"Error en API de OpenAI: {response.StatusCode} - {errorContent}");
                    }

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseJson = JsonDocument.Parse(responseContent);
                    
                    _logger.LogInformation("✅ Respuesta de OpenAI recibida exitosamente");

                    // Extraer el texto de la respuesta de OpenAI
                    var textoRespuesta = responseJson.RootElement
                        .GetProperty("choices")[0]
                        .GetProperty("message")
                        .GetProperty("content")
                        .GetString() ?? "";

                    // Extraer JSON de la respuesta
                    var startIdx = textoRespuesta.IndexOf('{');
                    var endIdx = textoRespuesta.LastIndexOf('}') + 1;
                    
                    if (startIdx >= 0 && endIdx > startIdx)
                    {
                        var jsonText = textoRespuesta.Substring(startIdx, endIdx - startIdx);
                        var lecturaJson = JsonDocument.Parse(jsonText);
                        
                        var titulo = lecturaJson.RootElement.GetProperty("titulo").GetString() ?? "Historia Mágica";
                        var contenido = lecturaJson.RootElement.GetProperty("contenido").GetString() ?? "";

                        _logger.LogInformation("📖 Lectura generada: {Titulo} ({Length} chars)", titulo, contenido.Length);
                        return (titulo, contenido);
                    }

                    throw new InvalidOperationException("No se pudo extraer el JSON de la respuesta de OpenAI");
                }
                catch (Exception ex) when (intento < 2)
                {
                    _logger.LogWarning(ex, "⚠️ Error en intento {Intento}, reintentando...", intento + 1);
                    await Task.Delay((int)Math.Pow(2, intento) * 1000);
                }
            }
            
            throw new InvalidOperationException("No se pudo generar la lectura después de 3 intentos");
        }

        private async Task<string> GenerarImagenConHuggingFaceAsync(PreferenciasLecturaDto preferencias)
        {
            try
            {
                _logger.LogInformation("🎨 Iniciando generación de imagen con Hugging Face");
                
                var temas = string.Join(", ", preferencias.Temas);
                var personajes = string.Join(", ", preferencias.Personajes);

                var promptImagen = $"Children's book illustration, {preferencias.Escenario}, {personajes}, {temas}, colorful, friendly style, detailed, high quality, watercolor art";

                _logger.LogInformation("📝 Prompt de imagen: {Prompt}", promptImagen);

                var apiUrl = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_iaSettings.HuggingFaceApiKey}");

                var requestBody = new { inputs = promptImagen };
                var jsonContent = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                _logger.LogInformation("📤 Enviando petición a Hugging Face API");
                var response = await _httpClient.PostAsync(apiUrl, content);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("❌ Error al generar imagen con Hugging Face - StatusCode: {StatusCode}, Response: {Response}", 
                        response.StatusCode, errorContent);
                    return "";
                }

                var imageBytes = await response.Content.ReadAsByteArrayAsync();
                _logger.LogInformation("✅ Imagen recibida de Hugging Face, tamaño: {Size} bytes", imageBytes.Length);
                
                // Guardar imagen en wwwroot usando la ruta correcta
                var fileName = $"lectura_{Guid.NewGuid()}.png";
                var imagesFolder = Path.Combine(_environment.WebRootPath, "images", "lecturas");
                
                // Crear directorio si no existe
                Directory.CreateDirectory(imagesFolder);
                
                var imagePath = Path.Combine(imagesFolder, fileName);
                await File.WriteAllBytesAsync(imagePath, imageBytes);

                _logger.LogInformation("💾 Imagen guardada en: {ImagePath}", imagePath);
                return $"/images/lecturas/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Excepción al generar imagen - Mensaje: {Message}", ex.Message);
                return "";
            }
        }

        /// <summary>
        /// Genera una lectura específica para un examen grupal con parámetros personalizados
        /// </summary>
        public async Task<Models.Entities.Lectura?> GenerarLecturaParaExamenGrupalAsync(
            string temaConcepto,
            string tipoTexto,
            string longitudTexto,
            string gradoEscolar,
            string complejidad,
            int docenteId)
        {
            try
            {
                _logger.LogInformation("📚 Generando lectura para examen grupal - Tema: {Tema}, Grado: {Grado}", 
                    temaConcepto, gradoEscolar);

                // Mapear parámetros
                var edad = gradoEscolar switch
                {
                    "4to" => 9,
                    "5to" => 10,
                    "6to" => 11,
                    _ => 10
                };

                var cantidadPalabras = longitudTexto switch
                {
                    "Corto" => "300",
                    "Medio" => "500",
                    "Largo" => "700",
                    _ => "500"
                };

                var nivelVocabulario = complejidad switch
                {
                    "Basica" => "vocabulario simple y oraciones cortas (8-12 palabras)",
                    "Intermedia" => "vocabulario moderado y oraciones medianas (10-15 palabras)",
                    "Avanzada" => "vocabulario rico y oraciones largas (12-18 palabras)",
                    _ => "vocabulario moderado"
                };

                // Prompt específico para examen grupal
                var prompt = $@"Crea un texto de tipo {tipoTexto} sobre el tema: ""{temaConcepto}"" para estudiantes de {gradoEscolar} grado de primaria ({edad} años).

PARÁMETROS ESPECÍFICOS:
- Longitud: {cantidadPalabras} palabras (±20 palabras)
- Complejidad: {complejidad} - Usar {nivelVocabulario}
- Tipo de texto: {tipoTexto}
- Propósito: Evaluación académica grupal

INSTRUCCIONES IMPORTANTES:
1. El texto debe ser apropiado para {gradoEscolar} grado
2. Debe tener exactamente {cantidadPalabras} palabras aproximadamente
3. Debe incluir información que permita formular preguntas literales, inferenciales y críticas
4. El contenido debe ser educativo y preciso
5. Usar {nivelVocabulario}

FORMATO DE RESPUESTA (JSON):
{{
  ""titulo"": ""Título claro y descriptivo del tema"",
  ""contenido"": ""Texto completo de {cantidadPalabras} palabras aproximadamente""
}}

Responde SOLO con el JSON, sin texto adicional.";

                var requestBody = new
                {
                    model = "gpt-4o-mini",
                    messages = new object[]
                    {
                        new { role = "system", content = "Eres un experto en crear textos educativos para evaluación escolar. Respondes SOLO con JSON válido." },
                        new { role = "user", content = prompt }
                    },
                    temperature = 0.6, // Menos creatividad para evaluación
                    max_tokens = 2500
                };

                var apiUrl = "https://api.openai.com/v1/chat/completions";
                var jsonContent = JsonSerializer.Serialize(requestBody);
                
                var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
                request.Headers.Add("Authorization", $"Bearer {_iaSettings.OpenAIApiKey}");
                request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Error al generar lectura con OpenAI: {Error}", errorContent);
                    return null;
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseJson = JsonDocument.Parse(responseContent);
                
                var textoRespuesta = responseJson.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? "";

                // Extraer JSON
                var startIdx = textoRespuesta.IndexOf('{');
                var endIdx = textoRespuesta.LastIndexOf('}') + 1;
                
                if (startIdx < 0 || endIdx <= startIdx)
                {
                    _logger.LogError("No se pudo extraer JSON de la respuesta");
                    return null;
                }

                var jsonText = textoRespuesta.Substring(startIdx, endIdx - startIdx);
                var lecturaJson = JsonDocument.Parse(jsonText);
                
                var titulo = lecturaJson.RootElement.GetProperty("titulo").GetString() ?? temaConcepto;
                var contenido = lecturaJson.RootElement.GetProperty("contenido").GetString() ?? "";

                // Generar imagen
                var urlImagen = await GenerarImagenExamenGrupalAsync(temaConcepto);

                // Crear entidad Lectura
                var lectura = new Models.Entities.Lectura
                {
                    EstudianteId = null, // Exámenes grupales no tienen estudiante específico
                    Titulo = titulo,
                    Contenido = contenido,
                    TipoLectura = tipoTexto,
                    Temas = temaConcepto,
                    Personajes = "Variados", // Para exámenes grupales
                    Escenario = "Educativo",
                    Longitud = longitudTexto,
                    Emocion = "Educativa",
                    Proposito = "Evaluación",
                    Estado = "generada",
                    FechaCreacion = DateTime.UtcNow,
                    UrlImagen = urlImagen
                };

                // Guardar la lectura en la base de datos para obtener el Id
                _context.Lecturas.Add(lectura);
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Lectura generada para examen grupal: {Titulo}", titulo);
                return lectura;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar lectura para examen grupal");
                return null;
            }
        }

        private async Task<string> GenerarImagenExamenGrupalAsync(string temaConcepto)
        {
            try
            {
                var promptImagen = $"Educational illustration for children, {temaConcepto}, colorful, clear, detailed, high quality, professional";

                var apiUrl = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_iaSettings.HuggingFaceApiKey}");

                var requestBody = new { inputs = promptImagen };
                var jsonContent = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(apiUrl, content);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("No se pudo generar imagen para examen grupal");
                    return "";
                }

                var imageBytes = await response.Content.ReadAsByteArrayAsync();
                
                var fileName = $"examen_{Guid.NewGuid()}.png";
                var imagesFolder = Path.Combine(_environment.WebRootPath, "images", "examenes");
                Directory.CreateDirectory(imagesFolder);
                
                var imagePath = Path.Combine(imagesFolder, fileName);
                await File.WriteAllBytesAsync(imagePath, imageBytes);

                return $"/images/examenes/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al generar imagen para examen grupal");
                return "";
            }
        }
    }
}
