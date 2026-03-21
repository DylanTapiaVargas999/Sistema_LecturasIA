import api from '../config/api';
import type { CambiarPasswordDto, ValidacionPasswordDto } from '../types/auth.types';

export const passwordService = {
  async cambiarPassword(data: CambiarPasswordDto): Promise<{ mensaje: string }> {
    const response = await api.post('/password/cambiar', data);
    return response.data;
  },

  async validarFortaleza(password: string): Promise<ValidacionPasswordDto> {
    const response = await api.post('/password/validar', { password });
    return response.data;
  },
};
