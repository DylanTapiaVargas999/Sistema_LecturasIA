import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5267';
const API_URL = `${BASE_URL}/api`;

export interface CambiarPasswordDto {
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
}

export interface ValidacionPasswordDto {
  esFuerte: boolean;
  mensajes: string[];
  nivel: string;
}

export const passwordService = {
  async cambiarPassword(data: CambiarPasswordDto): Promise<{ mensaje: string }> {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/password/cambiar`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  async validarFortaleza(password: string): Promise<ValidacionPasswordDto> {
    const response = await axios.post(
      `${API_URL}/password/validar`,
      { password },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },
};
