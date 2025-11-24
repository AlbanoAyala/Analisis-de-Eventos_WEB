import * as XLSX from 'xlsx';
import { DrillingEvent } from '../types';

// Robust number cleaner for formats like "2,900.00" or "1.500,00"
const cleanNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  let str = String(val).trim();
  
  // Remove units
  str = str.replace(/\s*(m|ft|mts|pies|meters)$/i, '');

  // Heuristic for "2,900.00" (US/Standard) vs "2.900,00" (EU/LATAM)
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  if (hasComma && hasDot) {
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');

    if (lastComma > lastDot) {
      // 1.500,50 -> 1500.50
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,500.50 -> 1500.50
      str = str.replace(/,/g, '');
    }
  } else if (hasComma) {
    // If only comma, assume it might be decimal if looking like "1500,5" 
    // OR thousands if looking like "2,900" without decimals.
    // However, in this specific context (depths), "2,900" usually means 2900. 
    // Let's try standard JS replace first.
    str = str.replace(/,/g, ''); 
  }

  str = str.replace(/[^\d.-]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

const findKeyStrict = (row: any, candidates: string[]): string | undefined => {
  const keys = Object.keys(row);
  return keys.find(k => {
    const lowerK = k.toLowerCase().trim();
    return candidates.some(c => lowerK === c || lowerK.includes(c));
  });
};

export const parseExcelFile = async (file: File): Promise<DrillingEvent[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet) as any[];
        
        if (rawData.length === 0) {
          resolve([]);
          return;
        }

        const formattedData: DrillingEvent[] = rawData.map((row, index) => {
          // 1. POZO
          const pozoKey = findKeyStrict(row, ['pozo', 'well', 'nombre']);
          
          // 2. PROFUNDIDAD (prof_desde)
          const depthKey = findKeyStrict(row, ['prof_desde', 'depth', 'md', 'profundidad']);
          
          // 3. SUBCATEGORIA (subcategoria_npt) - Priority
          const subCatKey = findKeyStrict(row, ['subcategoria_npt', 'subcategoria', 'sub_categoria', 'detalle_npt']);
          
          // 4. COMENTARIO
          const commentKey = findKeyStrict(row, ['comentario', 'comment', 'observaciones', 'descripcion']);

          // Data Extraction
          const pozo = pozoKey ? String(row[pozoKey]).trim() : 'Desconocido';
          const depth = depthKey ? cleanNumber(row[depthKey]) : 0;
          
          // Critical: Use subcategoria if available, otherwise fallback to generic
          let subcat = 'Evento';
          if (subCatKey && row[subCatKey]) {
            subcat = String(row[subCatKey]).trim();
          }

          const comment = commentKey ? String(row[commentKey]).trim() : '';

          return {
            id: `evt-${index}-${Math.random().toString(36).substr(2,9)}`,
            pozo,
            prof_desde: depth,
            subcategoria_npt: subcat,
            comentario: comment,
          };
        }).filter(evt => evt.pozo !== 'Desconocido' && evt.prof_desde >= 0);

        resolve(formattedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
