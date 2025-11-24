import { DrillingEvent, CategoryStyle } from './types';

// Palette for Industrial Look
export const COLORS = {
  primary: '#0f172a', // Slate 900
  secondary: '#334155', // Slate 700
  accent: '#0369a1', // Sky 700
  background: '#f8fafc', // Slate 50
  border: '#e2e8f0', // Slate 200
};

// Expanded Palette for Dynamic Assignment
export const DYNAMIC_PALETTE = [
  { color: '#ef4444', iconClass: 'fa-triangle-exclamation' }, // Red
  { color: '#f59e0b', iconClass: 'fa-wrench' },               // Amber
  { color: '#10b981', iconClass: 'fa-arrow-right' },           // Emerald
  { color: '#3b82f6', iconClass: 'fa-flask' },                 // Blue
  { color: '#8b5cf6', iconClass: 'fa-file-waveform' },         // Violet
  { color: '#ec4899', iconClass: 'fa-bullseye' },              // Pink
  { color: '#06b6d4', iconClass: 'fa-droplet' },               // Cyan
  { color: '#84cc16', iconClass: 'fa-check' },                 // Lime
  { color: '#f97316', iconClass: 'fa-gear' },                  // Orange
  { color: '#64748b', iconClass: 'fa-circle-info' },           // Slate
  { color: '#14b8a6', iconClass: 'fa-ruler-horizontal' },      // Teal
  { color: '#d946ef', iconClass: 'fa-bolt' },                  // Fuchsia
];

export const MOCK_DATA: DrillingEvent[] = [
  { id: '1', pozo: 'CGC-101', prof_desde: 50, subcategoria_npt: 'PERFORACION', comentario: 'Inicio de perforación fase 12 1/4"' },
  { id: '2', pozo: 'CGC-101', prof_desde: 850, subcategoria_npt: 'FALLA_EQUIPO', comentario: 'Falla en top drive, reparación necesaria' },
  { id: '3', pozo: 'CGC-101', prof_desde: 1500, subcategoria_npt: 'CEMENTACION', comentario: 'Cementación de cañería guía' },
  { id: '4', pozo: 'CGC-101', prof_desde: 2200, subcategoria_npt: 'PERFORACION', comentario: 'Perforando formación objetivo' },
  { id: '5', pozo: 'CGC-101', prof_desde: 2800, subcategoria_npt: 'REGISTROS', comentario: 'Perfilaje a pozo abierto' },
  
  { id: '6', pozo: 'CGC-205', prof_desde: 0, subcategoria_npt: 'MANTENIMIENTO', comentario: 'Inspección previa al spud' },
  { id: '7', pozo: 'CGC-205', prof_desde: 600, subcategoria_npt: 'PERFORACION', comentario: 'Avance normal ROP 25m/h' },
  { id: '8', pozo: 'CGC-205', prof_desde: 1200, subcategoria_npt: 'CLIMA', comentario: 'Espera por clima severo' },
  { id: '9', pozo: 'CGC-205', prof_desde: 1800, subcategoria_npt: 'FALLA_EQUIPO', comentario: 'Pérdida de circulación' },

  { id: '10', pozo: 'CGC-330', prof_desde: 300, subcategoria_npt: 'PERFORACION', comentario: 'Perforación direccional' },
  { id: '11', pozo: 'CGC-330', prof_desde: 1500, subcategoria_npt: 'CEMENTACION', comentario: 'Fraguado de cemento' },
  { id: '12', pozo: 'CGC-330', prof_desde: 2500, subcategoria_npt: 'MANTENIMIENTO', comentario: 'Cambio de trépano' },
  { id: '13', pozo: 'CGC-330', prof_desde: 2950, subcategoria_npt: 'DEMOVILIZACION', comentario: 'Fin de pozo' },
];