import { DrillingEvent, ExcelRow } from '../types';

// We access the global XLSX variable loaded via CDN
declare global {
  interface Window {
    XLSX: any;
  }
}

export const parseExcelFile = (file: File): Promise<DrillingEvent[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!window.XLSX) {
          reject(new Error("La librería XLSX no está cargada."));
          return;
        }

        const workbook = window.XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON
        const jsonData = window.XLSX.utils.sheet_to_json(sheet) as ExcelRow[];

        // Map and validate
        const events: DrillingEvent[] = jsonData.map((row, index) => ({
          id: `row-${index}`,
          pozo: row.pozo ? String(row.pozo).trim() : 'Desconocido',
          prof_desde: Number(row.prof_desde) || 0,
          subcategoria_npt: row.subcategoria_npt ? String(row.subcategoria_npt).trim() : 'DEFAULT',
          comentario: row.comentario || 'Sin comentarios'
        })).filter(e => e.pozo !== 'Desconocido');

        resolve(events);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};