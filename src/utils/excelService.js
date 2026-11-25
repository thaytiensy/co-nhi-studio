/**
 * Cọ Nhí Studio - Dịch vụ đọc/ghi bảng tính Excel (.xlsx, .csv) dựa trên ExcelJS
 * Thay thế hoàn toàn thư viện SheetJS (xlsx) để loại bỏ lỗ hổng bảo mật
 * và tối ưu tải động (lazy-load) cho trình duyệt.
 */

let excelJsPromise = null;

export async function loadExcelJS() {
  if (!excelJsPromise) {
    excelJsPromise = import('exceljs').then((mod) => mod.default || mod);
  }
  return excelJsPromise;
}

export function extractCellValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'object') {
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part?.text || '').join('');
    }
    if (value.text !== undefined) {
      return String(value.text);
    }
    if (value.result !== undefined) {
      return extractCellValue(value.result);
    }
    if (value.hyperlink && value.text === undefined) {
      return String(value.hyperlink);
    }
  }
  return String(value);
}

export function parseCsvText(rawText = '') {
  const text = String(rawText || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',' || ch === ';') {
      row.push(cell);
      cell = '';
    } else if (ch === '\r' && next === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}

export function sanitizeSheetName(name, fallback = 'Sheet1') {
  const cleaned = String(name || fallback)
    .replace(/[:\\/?*[\]]/g, '_')
    .trim()
    .slice(0, 31);
  return cleaned || fallback;
}

export function workbookToNormalizedSheets(workbook) {
  const SheetNames = [];
  const Sheets = {};

  const worksheets = Array.isArray(workbook?.worksheets) ? workbook.worksheets : [];
  for (const ws of worksheets) {
    const name = ws.name || `Sheet${SheetNames.length + 1}`;
    SheetNames.push(name);

    const rows = [];
    const maxCols = Math.max(ws.columnCount || 0, ws.actualColumnCount || 0);
    ws.eachRow({ includeEmpty: false }, (row) => {
      const rowValues = [];
      const colLimit = Math.max(maxCols, row.cellCount || 0);
      for (let c = 1; c <= colLimit; c++) {
        rowValues.push(extractCellValue(row.getCell(c).value));
      }
      rows.push(rowValues);
    });

    Sheets[name] = rows;
  }

  return { SheetNames, Sheets };
}

export async function readExcelToSheets(input, fileName = '') {
  const lowerName = String(fileName || '').toLowerCase();
  const uint8 = input instanceof Uint8Array
    ? input
    : input instanceof ArrayBuffer
      ? new Uint8Array(input)
      : new Uint8Array(input.buffer, input.byteOffset, input.byteLength);

  if (lowerName.endsWith('.csv')) {
    const text = new TextDecoder('utf-8').decode(uint8);
    const rows = parseCsvText(text);
    const sheetName = sanitizeSheetName(fileName.replace(/\.csv$/i, '') || 'CSV', 'CSV');
    return {
      SheetNames: [sheetName],
      Sheets: { [sheetName]: rows },
    };
  }

  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength);
  await workbook.xlsx.load(arrayBuffer);
  return workbookToNormalizedSheets(workbook);
}

export async function createWorkbookFromSheets(sheetsConfig = []) {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Cọ Nhí Studio';
  workbook.created = new Date();

  const usedNames = new Set();

  for (let idx = 0; idx < sheetsConfig.length; idx++) {
    const cfg = sheetsConfig[idx];
    let baseName = sanitizeSheetName(cfg.name, `Sheet${idx + 1}`);
    let sheetName = baseName;
    let suffix = 2;
    while (usedNames.has(sheetName)) {
      const tail = `_${suffix++}`;
      sheetName = baseName.slice(0, 31 - tail.length) + tail;
    }
    usedNames.add(sheetName);

    const ws = workbook.addWorksheet(sheetName);
    const rows = Array.isArray(cfg.rows) ? cfg.rows : [];

    if (cfg.isAoa) {
      for (const arrRow of rows) {
        ws.addRow(Array.isArray(arrRow) ? arrRow : [arrRow]);
      }
      if (Array.isArray(cfg.colWidths)) {
        cfg.colWidths.forEach((w, colIdx) => {
          ws.getColumn(colIdx + 1).width = w;
        });
      }
    } else if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      ws.columns = headers.map((header, colIdx) => ({
        header,
        key: header,
        width: Array.isArray(cfg.colWidths) && cfg.colWidths[colIdx] ? cfg.colWidths[colIdx] : 18,
      }));
      for (const objRow of rows) {
        ws.addRow(objRow);
      }
    } else if (Array.isArray(cfg.headers) && cfg.headers.length > 0) {
      ws.columns = cfg.headers.map((header, colIdx) => ({
        header,
        key: header,
        width: Array.isArray(cfg.colWidths) && cfg.colWidths[colIdx] ? cfg.colWidths[colIdx] : 18,
      }));
    }

    if (ws.rowCount >= 1) {
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, name: 'Times New Roman', size: 11 };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
  }

  return workbook;
}

export async function writeWorkbookToUint8Array(workbook) {
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
}

export async function saveWorkbook(workbook, fileName) {
  const bytes = await writeWorkbookToUint8Array(workbook);

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return fileName;
  }

  // Node.js environment (tests / scripts)
  const nodeFs = 'node:' + 'fs';
  const fs = await import(/* @vite-ignore */ nodeFs);
  fs.writeFileSync(fileName, Buffer.from(bytes));
  return fileName;
}
