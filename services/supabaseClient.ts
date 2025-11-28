import { createClient } from '@supabase/supabase-js';
import { DrillingEvent } from '../types';

// Credenciales proporcionadas
const SUPABASE_URL = 'https://npycwnrvafbvgrslrued.supabase.co';
const SUPABASE_KEY = 'sb_publishable_D2cJ76f_IgAgr2pvyj0e0g_3S1pf9dK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Nombre de la tabla en base de datos
const TABLE_NAME = 'drilling_events';

// Servicio para obtener eventos con paginación completa y desduplicación
export const fetchDrillingEvents = async (): Promise<DrillingEvent[]> => {
  let allRows: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  // 1. Descargar TODOS los datos mediante paginación
  try {
    while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('prof_desde', { ascending: true })
            .range(from, to);

        if (error) {
            console.error('Error fetching data page:', page, error);
            throw error;
        }

        if (data && data.length > 0) {
            allRows = allRows.concat(data);
            
            // Si trajimos menos que el tamaño de página, llegamos al final
            if (data.length < pageSize) {
                hasMore = false;
            } else {
                page++;
            }
        } else {
            hasMore = false;
        }

        // Failsafe para evitar loops infinitos si la BD es monstruosa (>100k)
        if (allRows.length > 100000) {
            console.warn("Límite de seguridad alcanzado (100k eventos). Deteniendo descarga.");
            hasMore = false;
        }
    }
  } catch (err) {
      console.error("Error crítico descargando datos:", err);
      throw err;
  }

  // 2. Desduplicación en Memoria (Client-side Deduplication)
  // Esto soluciona el problema de los miles de duplicados sin borrar la BD
  const uniqueMap = new Map();
  
  allRows.forEach(row => {
      // Creamos una clave única compuesta
      // Normalizamos pozo y categoria para evitar duplicados por espacios o mayúsculas sutiles
      const key = `${row.pozo.trim()}_${Number(row.prof_desde).toFixed(2)}_${row.subcategoria_npt.trim()}`;
      
      if (!uniqueMap.has(key)) {
          uniqueMap.set(key, row);
      }
  });

  const uniqueRows = Array.from(uniqueMap.values());
  console.log(`Descargados: ${allRows.length} filas. Únicos: ${uniqueRows.length} filas.`);

  // 3. Mapear a tipos de la aplicación
  return uniqueRows.map((row: any) => ({
    id: row.id,
    pozo: row.pozo,
    prof_desde: Number(row.prof_desde),
    subcategoria_npt: row.subcategoria_npt,
    comentario: row.comentario || ''
  }));
};

// Servicio para guardar eventos masivamente (Excel)
export const uploadDrillingEvents = async (events: DrillingEvent[]): Promise<void> => {
  // Preparamos los datos eliminando el ID temporal (row-x) para que Supabase genere UUIDs
  const payload = events.map(e => ({
    pozo: e.pozo,
    prof_desde: e.prof_desde,
    subcategoria_npt: e.subcategoria_npt,
    comentario: e.comentario
  }));

  if (payload.length === 0) return;

  try {
    // INTENTO 1: UPSERT (Ideal)
    // Esto intenta actualizar si existe la clave única en la BD
    const { error: upsertError } = await supabase
        .from(TABLE_NAME)
        .upsert(payload, { 
            onConflict: 'pozo,prof_desde,subcategoria_npt',
            ignoreDuplicates: true // Ignorar si ya existe para no duplicar
        });

    if (upsertError) {
        console.warn("El intento de UPSERT falló (probablemente falte restricción UNIQUE en BD). Usando INSERT fallback...", upsertError.message);
        
        // INTENTO 2: INSERT (Fallback)
        // Si no hay restricción unique, simplemente insertamos todo.
        // La función fetchDrillingEvents se encarga de limpiar duplicados al leer.
        const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert(payload);
        
        if (insertError) {
            throw insertError;
        }
    }

  } catch (err) {
    console.error('Error fatal uploading data to Supabase:', err);
    throw err;
  }
};

// Servicio para crear un solo evento manualmente
export const createDrillingEvent = async (event: Omit<DrillingEvent, 'id'>): Promise<DrillingEvent | null> => {
  const payload = {
    pozo: event.pozo,
    prof_desde: event.prof_desde,
    subcategoria_npt: event.subcategoria_npt,
    comentario: event.comentario
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating single event:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    pozo: data.pozo,
    prof_desde: Number(data.prof_desde),
    subcategoria_npt: data.subcategoria_npt,
    comentario: data.comentario
  };
};