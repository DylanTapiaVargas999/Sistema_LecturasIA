import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5267';
const API_URL = `${BASE_URL}/api`;

export interface UsuarioAdmin {
  id: number;
  nombreCompleto: string;
  email: string;
  tipo: string;
  estado: string;
  ultimoAcceso: string | null;
  suspendido: boolean;
  motivoSuspension: string | null;
  fechaSuspension: string | null;
}

export interface EstadisticasGenerales {
  totalUsuarios: number;
  totalDocentes: number;
  totalEstudiantes: number;
  usuariosActivos: number;
  usuariosSuspendidos: number;
  lecturasGeneradas: number;
  cuestionariosCompletados: number;
  aulasActivas: number;
}

class AdminService {
  // Obtener estadísticas generales
  async obtenerEstadisticas(): Promise<EstadisticasGenerales> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/Admin/estadisticas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Obtener todos los usuarios (con filtro opcional por email)
  async obtenerUsuarios(email?: string): Promise<UsuarioAdmin[]> {
    const token = localStorage.getItem('token');
    const params = email ? { email } : {};
    const response = await axios.get(`${API_URL}/Admin/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  }

  // Suspender usuario
  async suspenderUsuario(usuarioId: number, motivo: string): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.post(
      `${API_URL}/Admin/usuarios/suspender`,
      { usuarioId, motivo },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // Reactivar usuario
  async reactivarUsuario(usuarioId: number): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.post(
      `${API_URL}/Admin/usuarios/reactivar`,
      { usuarioId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // Reiniciar contraseña
  async reiniciarPassword(usuarioId: number, motivo: string): Promise<{ passwordTemporal: string; mensaje: string }> {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/Admin/usuarios/reiniciar-password`,
      { usuarioId, motivo },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}

export const adminService = new AdminService();
