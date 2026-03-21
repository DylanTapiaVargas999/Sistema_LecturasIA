import api from '../config/api';
import type { 
  LoginDto, 
  RegistroEstudianteDto, 
  RegistroDocenteDto, 
  AuthResponseDto, 
  LoginRequiere2FADto, 
  GradoOption 
} from '../types/auth.types';

export type { 
  LoginDto, 
  RegistroEstudianteDto, 
  RegistroDocenteDto, 
  AuthResponseDto, 
  LoginRequiere2FADto, 
  GradoOption 
};

// ==================== SERVICIO DE AUTENTICACIÓN ====================

class AuthService {
  // ===== REGISTRO =====
  
  async registrarEstudiante(datos: RegistroEstudianteDto): Promise<{ mensaje: string; email: string }> {
    const response = await api.post('/auth/registro/estudiante', datos);
    return response.data;
  }

  async registrarDocente(datos: RegistroDocenteDto): Promise<{ mensaje: string; email: string }> {
    const response = await api.post('/auth/registro/docente', datos);
    return response.data;
  }

  // ===== LOGIN =====
  
  async login(datos: LoginDto): Promise<AuthResponseDto | LoginRequiere2FADto> {
    const response = await api.post('/auth/login', datos);
    
    // Si retorna requiereVerificacion, es un docente que necesita 2FA
    if (response.data.requiereVerificacion) {
      return response.data as LoginRequiere2FADto;
    }
    
    // Si no, es login exitoso directo (estudiante o después de 2FA)
    // Verificamos si la respuesta viene envuelta en 'data' o es directa
    const responseData = response.data;
    // @ts-ignore - Verificación dinámica en runtime
    const authData = responseData.data || responseData;
    
    return authData as AuthResponseDto;
  }

  // ===== VERIFICACIÓN EMAIL =====
  
  async verificarEmail(token: string): Promise<{ mensaje: string }> {
    const response = await api.post('/auth/verificar-email', { token });
    return response.data;
  }

  async reenviarVerificacion(email: string): Promise<{ mensaje: string }> {
    const response = await api.post('/auth/reenviar-verificacion', { email });
    return response.data;
  }

  // ===== RECUPERACIÓN PASSWORD =====
  
  async solicitarRecuperacion(email: string): Promise<{ mensaje: string }> {
    const response = await api.post('/auth/solicitar-recuperacion', { email });
    return response.data;
  }

  async restablecerPassword(token: string, nuevaPassword: string, confirmarPassword: string): Promise<{ mensaje: string }> {
    const response = await api.post('/auth/restablecer-password', {
      token,
      nuevaPassword,
      confirmarPassword
    });
    return response.data;
  }

  // ===== DOBLE AUTENTICACIÓN (2FA) =====
  
  async verificarCodigoLogin(email: string, codigo: string): Promise<AuthResponseDto> {
    const response = await api.post('/auth/verificar-codigo-login', {
      email,
      codigo
    });
    return response.data.data;
  }

  async reenviarCodigoLogin(email: string): Promise<{ mensaje: string }> {
    const response = await api.post('/auth/reenviar-codigo-login', { email });
    return response.data;
  }

  // ===== GRADOS DISPONIBLES =====
  
  async obtenerGrados(): Promise<GradoOption[]> {
    const response = await api.get('/grados');
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
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error('Error parsing user data from localStorage', e);
      // Data corrupta, limpiamos
      this.cerrarSesion();
      return null;
    }
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService();
