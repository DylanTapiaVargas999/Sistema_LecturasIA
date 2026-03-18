using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LecturaIA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AyudaController : ControllerBase
{
    private readonly AyudaService _ayudaService;

    public AyudaController(AyudaService ayudaService)
    {
        _ayudaService = ayudaService;
    }

    [HttpGet("estado-tutorial")]
    public async Task<ActionResult<EstadoTutorialDto>> ObtenerEstadoTutorial()
    {
        try
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var estado = await _ayudaService.ObtenerEstadoTutorial(usuarioId);
            return Ok(estado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpPost("marcar-tutorial-visto")]
    public async Task<ActionResult> MarcarTutorialVisto()
    {
        try
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _ayudaService.MarcarTutorialVisto(usuarioId);
            return Ok(new { mensaje = "Tutorial marcado como visto" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }
}
