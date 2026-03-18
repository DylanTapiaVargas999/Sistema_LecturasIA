using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LecturaIA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")] // Solo administradores
public class AdminController : ControllerBase
{
    private readonly AdminService _adminService;

    public AdminController(AdminService adminService)
    {
        _adminService = adminService;
    }

    // GET: api/admin/usuarios?email=texto
    [HttpGet("usuarios")]
    public async Task<ActionResult<List<UsuarioAdminDto>>> ObtenerUsuarios([FromQuery] string? email = null)
    {
        var usuarios = await _adminService.ObtenerTodosLosUsuarios(email);
        return Ok(usuarios);
    }

    // POST: api/admin/usuarios/suspender
    [HttpPost("usuarios/suspender")]
    public async Task<ActionResult> SuspenderUsuario([FromBody] SuspenderUsuarioDto dto)
    {
        var resultado = await _adminService.SuspenderUsuario(dto);

        if (!resultado)
            return BadRequest(new { mensaje = "No se pudo suspender el usuario" });

        return Ok(new { mensaje = "Usuario suspendido correctamente" });
    }

    // POST: api/admin/usuarios/reactivar
    [HttpPost("usuarios/reactivar")]
    public async Task<ActionResult> ReactivarUsuario([FromBody] ReactivarUsuarioDto dto)
    {
        var resultado = await _adminService.ReactivarUsuario(dto);

        if (!resultado)
            return BadRequest(new { mensaje = "No se pudo reactivar el usuario" });

        return Ok(new { mensaje = "Usuario reactivado correctamente" });
    }

    // POST: api/admin/usuarios/reiniciar-password
    [HttpPost("usuarios/reiniciar-password")]
    public async Task<ActionResult<ReiniciarPasswordResponseDto>> ReiniciarPassword([FromBody] ReiniciarPasswordDto dto)
    {
        var resultado = await _adminService.ReiniciarPassword(dto);

        if (!resultado.Exito)
            return BadRequest(resultado);

        return Ok(resultado);
    }

    // GET: api/admin/estadisticas
    [HttpGet("estadisticas")]
    public async Task<ActionResult<EstadisticasAdminDto>> ObtenerEstadisticas()
    {
        var estadisticas = await _adminService.ObtenerEstadisticas();
        return Ok(estadisticas);
    }
}
