import api from '../config/api';
import type { UsuarioAdmin, CodigoDocente } from '../types/user.types';
import type { EstadisticasGenerales } from '../types/metrics.types';

export type { UsuarioAdmin, CodigoDocente, EstadisticasGenerales };

class AdminService {
  // Obtener estadísticas generales
  async obtenerEstadisticas(): Promise<EstadisticasGenerales> {
    const response = await api.get<EstadisticasGenerales>('/Admin/estadisticas');
    return response.data;
  }

  // Obtener códigos de registro para docentes
  async obtenerCodigosDocentes(): Promise<CodigoDocente[]> {
    const response = await api.get<CodigoDocente[]>('/Admin/codigos-docentes');
    return response.data;
  }

  // Generar nuevo código para docente
  async generarCodigoDocente(administradorId: number): Promise<{ codigo: string; mensaje: string; exito: boolean }> {
    const response = await api.post<{ codigo: string; mensaje: string; exito: boolean }>('/Admin/codigos-docentes/generar', { administradorId });
    return response.data;
  }

  // Obtener todos los usuarios (con filtro opcional por email)
  async obtenerUsuarios(email?: string): Promise<UsuarioAdmin[]> {
    const params = email ? { email } : {};
    const response = await api.get<UsuarioAdmin[]>('/Admin/usuarios', {
      params
    });
    return response.data;
  }

  // Suspender usuario
  async suspenderUsuario(usuarioId: number, motivo: string): Promise<void> {
    await api.post('/Admin/usuarios/suspender', { usuarioId, motivo });
  }

  // Reactivar usuario
  async reactivarUsuario(usuarioId: number): Promise<void> {
    await api.post('/Admin/usuarios/reactivar', { usuarioId });
  }

  // Reiniciar contraseña
  async reiniciarPassword(usuarioId: number, motivo: string): Promise<{ passwordTemporal: string; mensaje: string }> {
    const response = await api.post<{ passwordTemporal: string; mensaje: string }>('/Admin/usuarios/reiniciar-password', { usuarioId, motivo });
    return response.data;
  }
}

export const adminService = new AdminService();
