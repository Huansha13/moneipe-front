export const SNACKBAR_DURATION = 3000;

export const API_PATHS = {
  GASTOS: '/api/gastos',
  USUARIOS: '/api/usuarios',
  INVERSIONES: '/api/inversiones',
  NOTIFICACIONES: '/api/notificaciones',
} as const;

export const ESTADO_CONTROL = {
  CREADO: 'CREADO',
  CALCULADO: 'CALCULADO',
  COMPLETADO: 'COMPLETADO',
} as const;

export const ROL_GRUPO = {
  ADMIN: 'ADMIN',
  MIEMBRO: 'MIEMBRO',
} as const;
