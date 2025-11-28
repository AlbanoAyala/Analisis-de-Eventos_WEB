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
        
        // Convert sheet to JSON (raw)
        const rawData = window.XLSX.utils.sheet_to_json(sheet);

        // Normalize keys to lowercase to be case-insensitive
        const jsonData = rawData.map((row: any) => {
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().trim()] = row[key];
            });
            return normalizedRow;
        });

        // Map and validate using normalized keys
        const events: DrillingEvent[] = jsonData.map((row: any, index: number) => {
          // Robust depth parsing
          let profDesde = 0;
          const rawDepth = row['prof_desde'];
          
          if (typeof rawDepth === 'number') {
            profDesde = rawDepth;
          } else if (typeof rawDepth === 'string') {
            // Handle cases like "1500,5" (decimal comma) -> 1500.5
            // Standard parseFloat might stop at comma or return NaN
            const cleanDepth = rawDepth.trim().replace(',', '.');
            const parsed = parseFloat(cleanDepth);
            if (!isNaN(parsed)) {
                profDesde = parsed;
            }
          }

          return {
            id: `row-${index}`,
            pozo: row['pozo'] ? String(row['pozo']).trim() : 'Desconocido',
            prof_desde: profDesde,
            subcategoria_npt: row['subcategoria_npt'] ? String(row['subcategoria_npt']).trim() : 'DEFAULT',
            comentario: row['comentario'] || 'Sin comentarios'
          };
        }).filter((e: DrillingEvent) => e.pozo !== 'Desconocido');

        if (events.length === 0) {
            console.warn("No se encontraron eventos válidos. Revise nombres de columnas (pozo, prof_desde, subcategoria_npt).");
        }

        resolve(events);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};