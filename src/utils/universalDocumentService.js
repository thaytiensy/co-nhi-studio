import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { parsePPTXFile } from './pptxImportService.js';

/**
 * Trích xuất nội dung văn bản từ tệp Word định dạng cũ (.doc 97-2003)
 */
export async function parseLegacyWordDoc(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const strings = [];
    let curUtf16 = '';

    // Quét chuỗi UTF-16LE
    for (let i = 0; i < bytes.length - 1; i += 2) {
      const code = bytes[i] | (bytes[i + 1] << 8);
      const isPrintable = (code >= 32 && code <= 126) || (code >= 0x00c0 && code <= 0x1ef9);
      if (isPrintable) {
        curUtf16 += String.fromCharCode(code);
      } else {
        if (curUtf16.trim().length >= 3) {
          const trimmed = curUtf16.trim();
          const isSystemMeta = /^(Root Entry|WordDocument|1Table|0Table|Data|SummaryInformation|DocumentSummaryInformation|CompObj|ObjectPool|Normal|Default Paragraph Font)/i.test(trimmed);
          if (!isSystemMeta && !strings.includes(trimmed)) {
            strings.push(trimmed);
          }
        }
        curUtf16 = '';
      }
    }

    // Quét ASCII dự phòng
    if (strings.length < 5) {
      let curAscii = '';
      for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if ((b >= 32 && b <= 126) || b === 10 || b === 13) {
          curAscii += String.fromCharCode(b);
        } else {
          if (curAscii.trim().length >= 4) {
            const trimmed = curAscii.trim();
            const isSystemMeta = /^(Root Entry|WordDocument|SummaryInformation)/i.test(trimmed);
            if (!isSystemMeta && !strings.includes(trimmed)) {
              strings.push(trimmed);
            }
          }
          curAscii = '';
        }
      }
    }

    const cleanTitle = file.name.replace(/\.doc$/i, '').replace(/_/g, ' ');
    const items = strings.map((str) => {
      const isHeading = str.length < 90 && (/^(BÀI|CHỦ ĐỀ|HOẠT ĐỘNG|I\.|II\.|III\.|IV\.|GIÁO ÁN)/i.test(str) || str.toUpperCase() === str);
      return {
        type: isHeading ? 'heading' : 'paragraph',
        text: str,
        isBold: isHeading
      };
    });

    return {
      success: true,
      type: 'docx',
      fileName: file.name,
      fileSize: file.size,
      title: items.find(it => it.type === 'heading')?.text || cleanTitle,
      items: items.length > 0 ? items : [{ type: 'paragraph', text: 'Tệp Word cũ (.doc). Thầy/Cô vui lòng mở trên máy và bấm F12 -> Lưu dạng .docx để xem đầy đủ bảng biểu.' }],
      fullText: strings.join('\n\n'),
      isLegacyDoc: true
    };
  } catch (err) {
    return {
      success: false,
      error: `Không thể đọc tệp Word cũ (.doc): ${err.message || err}`
    };
  }
}

/**
 * Phân tích tệp Word (.docx) trực tiếp trên trình duyệt
 * Trích xuất: Tiêu đề, các đoạn văn, bảng biểu, danh sách mục
 */
export async function parseWordDocx(file) {
  try {
    const lowerName = (file.name || '').toLowerCase();
    if (lowerName.endsWith('.doc')) {
      return await parseLegacyWordDoc(file);
    }

    const arrayBuffer = await file.arrayBuffer();
    let zip;
    try {
      zip = await JSZip.loadAsync(arrayBuffer);
    } catch (_) {
      // Fallback sang parse legacy nếu tệp có đuôi .docx nhưng nội dung thực tế là .doc cũ
      return await parseLegacyWordDoc(file);
    }

    const docXmlFile = zip.file('word/document.xml');
    
    if (!docXmlFile) {
      // Fallback sang parse legacy
      return await parseLegacyWordDoc(file);
    }

    const xmlText = await docXmlFile.async('text');
    let doc;
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new window.DOMParser();
      doc = parser.parseFromString(xmlText, 'text/xml');
    } else {
      const { DOMParser } = await import('@xmldom/xmldom');
      const parser = new DOMParser();
      doc = parser.parseFromString(xmlText, 'text/xml');
    }

    const body = doc.getElementsByTagName('w:body')[0] || doc.getElementsByTagName('body')[0];
    if (!body) {
      return { success: false, error: 'Không tìm thấy nội dung trong tệp Word.' };
    }

    const items = [];
    let fullText = '';
    const children = body.childNodes;

    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      const nodeName = node.nodeName || '';

      // 1. Đoạn văn (Paragraph)
      if (nodeName.endsWith(':p') || nodeName === 'p') {
        const textNodes = node.getElementsByTagName('w:t');
        let pText = '';
        for (let j = 0; j < textNodes.length; j++) {
          pText += textNodes[j].textContent || '';
        }

        const trimmed = pText.trim();
        if (trimmed) {
          // Kiểm tra xem có phải tiêu đề hay in đậm không
          const bNode = node.getElementsByTagName('w:b')[0];
          const isBold = Boolean(bNode);
          const isHeading = isBold && trimmed.length < 120 && (
            trimmed.toUpperCase() === trimmed || 
            trimmed.startsWith('HOẠT ĐỘNG') || 
            trimmed.startsWith('BÀI') ||
            trimmed.startsWith('CHỦ ĐỀ') ||
            trimmed.startsWith('I.') ||
            trimmed.startsWith('II.') ||
            trimmed.startsWith('III.') ||
            trimmed.startsWith('IV.')
          );

          items.push({
            type: isHeading ? 'heading' : 'paragraph',
            text: trimmed,
            isBold
          });
          fullText += trimmed + '\n\n';
        }
      } 
      // 2. Bảng biểu (Table)
      else if (nodeName.endsWith(':tbl') || nodeName === 'tbl') {
        const rows = [];
        const trNodes = node.getElementsByTagName('w:tr');
        for (let r = 0; r < trNodes.length; r++) {
          const row = [];
          const tcNodes = trNodes[r].getElementsByTagName('w:tc');
          for (let c = 0; c < tcNodes.length; c++) {
            const cellTextNodes = tcNodes[c].getElementsByTagName('w:t');
            let cellText = '';
            for (let t = 0; t < cellTextNodes.length; t++) {
              cellText += cellTextNodes[t].textContent || '';
            }
            row.push(cellText.trim());
          }
          if (row.length > 0) rows.push(row);
        }

        if (rows.length > 0) {
          items.push({
            type: 'table',
            rows
          });
          fullText += '[Bảng biểu: ' + rows.length + ' hàng]\n\n';
        }
      }
    }

    const title = items.find(it => it.type === 'heading')?.text || file.name.replace(/\.[^/.]+$/, '');

    return {
      success: true,
      type: 'docx',
      fileName: file.name,
      fileSize: file.size,
      title,
      items,
      fullText
    };
  } catch (err) {
    return {
      success: false,
      error: `Lỗi đọc tệp Word: ${err.message || err}`
    };
  }
}

/**
 * Phân tích tệp Excel (.xlsx, .xls, .csv) trực tiếp trên trình duyệt
 */
export async function parseExcelSpreadsheet(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetNames = workbook.SheetNames || [];
    
    if (sheetNames.length === 0) {
      return { success: false, error: 'Tệp Excel không chứa sheet dữ liệu nào.' };
    }

    const sheets = {};
    for (const name of sheetNames) {
      const worksheet = workbook.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      sheets[name] = rows;
    }

    return {
      success: true,
      type: 'xlsx',
      fileName: file.name,
      fileSize: file.size,
      sheetNames,
      sheets
    };
  } catch (err) {
    return {
      success: false,
      error: `Lỗi đọc tệp Excel: ${err.message || err}`
    };
  }
}

/**
 * Bộ nạp & phân tích tài liệu đa năng tự động nhận diện định dạng
 * Hỗ trợ: .pptx, .docx, .xlsx, .xls, .csv, .pdf, .txt
 */
export async function parseUniversalDocument(file) {
  if (!file) return { success: false, error: 'Chưa chọn tệp' };

  const ext = file.name.split('.').pop().toLowerCase();

  // 1. Tệp PowerPoint
  if (ext === 'pptx' || ext === 'ppt') {
    const res = await parsePPTXFile(file);
    return {
      success: res.success,
      type: 'pptx',
      fileName: file.name,
      fileSize: file.size,
      data: res,
      error: res.error
    };
  }

  // 2. Tệp Word
  if (ext === 'docx' || ext === 'doc') {
    return await parseWordDocx(file);
  }

  // 3. Tệp Excel
  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
    return await parseExcelSpreadsheet(file);
  }

  // 4. Tệp PDF
  if (ext === 'pdf') {
    const url = URL.createObjectURL(file);
    let base64 = '';
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
      }
      base64 = typeof btoa !== 'undefined' ? btoa(binary) : '';
    } catch (_) {}

    return {
      success: true,
      type: 'pdf',
      fileName: file.name,
      fileSize: file.size,
      url,
      base64
    };
  }

  // 5. Tệp Văn bản thuần
  if (ext === 'txt' || ext === 'md' || ext === 'json') {
    try {
      const text = await file.text();
      return {
        success: true,
        type: 'txt',
        fileName: file.name,
        fileSize: file.size,
        text
      };
    } catch (e) {
      return { success: false, error: 'Không thể đọc tệp văn bản' };
    }
  }

  return {
    success: false,
    error: `Định dạng .${ext} chưa được hỗ trợ. Vui lòng chọn tệp .pptx, .docx, .xlsx, .pdf hoặc .txt.`
  };
}
