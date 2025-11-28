export interface DrillingEvent {
  id: string;
  pozo: string;
  prof_desde: number;
  subcategoria_npt: string;
  comentario: string;
}

export interface ExcelRow {
  pozo?: string;
  prof_desde?: number;
  subcategoria_npt?: string;
  comentario?: string;
  [key: string]: any;
}

export type ViewMode = 'chart' | 'table';

export interface CategoryStyle {
  color: string;
  iconClass: string;
  label: string;
}