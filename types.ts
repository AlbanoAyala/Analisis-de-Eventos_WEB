export interface DrillingEvent {
  id: string;
  pozo: string;
  prof_desde: number; // Depth in meters
  subcategoria_npt: string;
  comentario: string;
  fecha?: string;
  // Optional properties that might be in the excel
  prof_hasta?: number;
  categoria?: string;
}

export interface WellData {
  name: string;
  maxDepth: number;
  events: DrillingEvent[];
}

export type ViewMode = 'visualizer' | 'table';

export enum NPTCategory {
  PEGADURA = 'Pegadura',
  FALLA_EQUIPO = 'Falla de Equipo',
  PERDIDA_CIRCULACION = 'Pérdida de Circulación',
  CONTROL_POZO = 'Control de Pozo',
  LOGISTICA = 'Logística',
  OTROS = 'Otros'
}

export interface GeminiAnalysisResult {
  summary: string;
  recommendations: string[];
}