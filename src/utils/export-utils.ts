/**
 * Utilidad para exportar datos a CSV
 */

/**
 * Convierte un array de objetos a formato CSV y descarga el archivo
 * @param data Array de objetos a exportar
 * @param filename Nombre del archivo sin extensión
 * @param options Opciones adicionales
 */
export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  options: {
    delimiter?: string;
    headers?: string[];
    headerMap?: Record<string, string>;
  } = {}
) {
  if (!data || !data.length) {
    console.warn('No hay datos para exportar');
    return;
  }

  const { delimiter = ',', headers, headerMap = {} } = options;

  // Determinar las cabeceras
  const keys = headers || Object.keys(data[0]);

  // Crear la línea de cabeceras
  const headerRow = keys
    .map(key => {
      const header = headerMap[key] || key;
      // Escapar comillas dobles y envolver en comillas si contiene delimitador o salto de línea
      const escaped = `"${header.replace(/"/g, '""')}"`;
      return escaped;
    })
    .join(delimiter);

  // Crear las filas de datos
  const rows = data.map(item => {
    return keys
      .map(key => {
        const value = item[key] === null || item[key] === undefined ? '' : String(item[key]);
        // Escapar comillas dobles y envolver en comillas si contiene delimitador o salto de línea
        const escaped = `"${value.replace(/"/g, '""')}"`;
        return escaped;
      })
      .join(delimiter);
  });

  // Combinar cabeceras y filas
  const csv = [headerRow, ...rows].join('\n');

  // Crear el blob y descargarlo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
