import axios from 'axios';
import { API_URL } from '../config/api';

// ==================== INTERFACES ====================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegistroEstudianteDto {
  email: string;
  password: string;
  confirmarPassword: string;
  nombreCompleto: string;
  grado: number; // 4, 5 o 6
  edad: number;
}

export interface RegistroDocenteDto {
  email: string;
  password: string;
  confirmarPassword: string;
  nombreCompleto: string;
}

export interface AuthResponseDto {
  token: string;
  tipoUsuario: 'Estudiante' | 'Docente' | 'Administrador';
  nombreCompleto: string;
  email: string;
  expiracion: string;
}

export interface LoginRequiere2FADto {
  requiereVerificacion: boolean;
  mensaje: string;
  email: string;
  tiempoExpiracionMinutos: number;
}

export interface GradoOption {
  value: number;
  label: string;
}

// ==================== SERVICIO DE AUTENTICACIÓN ====================

class AuthService {
  // ===== REGISTRO =====
  
  async registrarEstudiante(datos: RegistroEstudianteDto): Promise<{ mensaje: string; email: string }> {
    const response = await axios.post(`${API_URL}/api/auth/registro/estudiante`, datos);
    return response.data;
  }

  async registrarDocente(datos: RegistroDocenteDto): Promise<{ mensaje: string; email: string }> {
    const response = await axios.post(`${API_URL}/api/auth/registro/docente`, datos);
    return response.data;
  }

  // ===== LOGIN =====
  
  async login(datos: LoginDto): Promise<AuthResponseDto | LoginRequiere2FADto> {
    const response = await axios.post(`${API_URL}/api/auth/login`, datos);
    
    // Si retorna requiereVerificacion, es un docente que necesita 2FA
    if (response.data.requiereVerificacion) {
      return response.data as LoginRequiere2FADto;
    }
    
    // Si no, es login exitoso directo (estudiante o después de 2FA)
    return response.data.data as AuthResponseDto;
  }

  // ===== VERIFICACIÓN EMAIL =====
  
  async verificarEmail(token: string): Promise<{ mensaje: string }> {
    const response = await axios.post(`${API_URL}/api/auth/verificar-email`, { token });
    return response.data;
  }

  async reenviarVerificacion(email: string): Promise<{ mensaje: string }> {
    const response = await axios.post(`${API_URL}/api/auth/reenviar-verificacion`, { email });
    return response.data;
  }

  // ===== RECUPERACIÓN PASSWORD =====
  
  async solicitarRecuperacion(email: string): Promise<{ mensaje: string }> {
    const response = await axios.post(`${API_URL}/api/auth/solicitar-recuperacion`, { email });
    return response.data;
  }

  async restablecerPassword(token: string, nuevaPassword: string, confirmarPassword: string): Promise<{ mensaje: string }> {
    const response = await axios.post(`${API_URL}/api/auth/restablecer-password`, {
      token,
      nuevaPassword,
      confirmarPassword
    });
    return response.data;
  }

  // ===== DOBLE AUTENTICACIÓN (2FA) =====
  
  async verificarCodigoLogin(email: string, codigo: string): Promise<AuthResponseDto> {
    const response = await axios.post(`${API_URL}/api/auth/verificar-codigo-login`, {
      email,
      codigo
    });
    return response.data.data;
  }

  async reenviarCodigoLogin(email: string): Promise<{ mensaje: string }> {
    const response = await axios.post(`${API_URL}/api/auth/reenviar-codigo-login`, { email });
    return response.data;
  }

  // ===== GRADOS DISPONIBLES =====
  
  async obtenerGrados(): Promise<GradoOption[]> {
    const response = await axios.get(`${API_URL}/api/grados`);
    return response.data;
  }

  // ===== UTILIDADES =====
  
  guardarSesion(authData: AuthResponseDto) {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('userData', JSON.stringify(authData));
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }

  obtenerUsuario(): AuthResponseDto | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService();
