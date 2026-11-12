import * as XLSX from 'xlsx';

export const TT27_COMMENTS_BANK = {
  T: [
    'Có năng khiếu mĩ thuật nổi bật, phối màu hài hòa, đường nét giàu cảm xúc, sáng tạo độc đáo.', 'Nhận biết và sử dụng màu sắc rất tốt, ý tưởng vẽ tranh phong phú, tự tin chia sẻ trước lớp.', 'Kỹ thuật vẽ nét và xé dán rất khéo léo, thể hiện rõ chủ đề bài học, hoàn thành bài xuất sắc.',
    'Bố cục tranh cân đối, màu sắc sinh động, có nhiều ý tưởng sáng tạo vượt trội so với yêu cầu.', 'Tích cực tham gia các hoạt động mĩ thuật, thể hiện cảm xúc thẩm mỹ rất tốt qua từng bài vẽ.', 'Khả năng quan sát tinh tế, thể hiện hình khối và chi tiết rất sinh động, nét vẽ tự tin.', 'Sử dụng vật liệu đa dạng, tạo hình sáng tạo, sản phẩm mĩ thuật có tính thẩm mỹ rất cao.'
  ],
  H: [
    'Hoàn thành bài vẽ đúng yêu cầu chủ đề, đường nét rõ ràng, màu sắc tươi sáng.', 'Biết cách pha trộn và tô màu đều tay, bố cục tranh tương đối hợp lý.', 'Có ý thức chuẩn bị đồ dùng học tập đầy đủ, tích cực tham gia các hoạt động thực hành.',
    'Nắm được các bước vẽ cơ bản, vẽ hình cân đối, màu sắc hài hòa theo chủ đề.', 'Sản phẩm mĩ thuật rõ ràng, sạch sẽ, hoàn thành đúng tiến độ bài học trên lớp.', 'Biết lắng nghe và tiếp thu hướng dẫn của thầy cô, vẽ hình có tiến bộ rõ rệt.', 'Tự tin chia sẻ cảm xúc về bức tranh của mình và bạn bè sau giờ thực hành.'
  ],
  C: ['Em cần chú ý quan sát mẫu kĩ hơn, tô màu cẩn thận và hoàn thiện bài vẽ đúng hạn.', 'Cần tập trung hơn trong giờ thực hành mĩ thuật, chuẩn bị đủ sáp màu khi đến lớp.', 'Nét vẽ còn rụt rè, em hãy tự tin vẽ nét to rõ hơn và phối thêm màu sắc sinh động nhé.', 'Em cần hoàn thành phần tô màu nền để bức tranh thêm sinh động và hoàn chỉnh hơn.']
};

/**
 * Kiểm tra xem một chuỗi có phải là tiêu đề/lớp/trường/không phải tên học sinh hay không.
 * Hỗ trợ 100% cả NFC lẫn NFD, có dấu và không dấu.
 */
export function isNonStudentName(name) {
  if (!name || typeof name !== 'string') return true;
  const clean = name.trim().replace(/^\d+[.\s-]+/, '').trim();
  if (clean.length < 2) return true;
  if (/^(?:lớp|lop)?\s*[0-9]{1,2}\s*[A-Za-z0-9_-]+$/i.test(clean)) return true;

  const norm = clean.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

  const nonStudentKeywords = [
    'lop', 'khoi', 'truong', 'phong', 'so gd', 'so gd&dt', 'bang', 'nam hoc',
    'hoc ky', 'hoc ki', 'mon', 'giao vien', 'gv', 'danh sach', 'tong cong',
    'tong so', 'nguoi lap', 'chu ky', 'ngay sinh', 'stt', 'ma hs', 'ma dinh danh',
    'ho va ten', 'ho ten', 'studentid', 'student id', 'so thu tu', 'xep loai',
    'danh gia', 'nhan xet', 'ghi chu', 'muc dat', 'ket qua'
  ];

  return nonStudentKeywords.some(kw => norm.startsWith(kw) || norm === kw);
}

const NON_STUDENT_REGEX = /^(lớp|khối|trường|phòng|sở|bảng|năm học|học kỳ|học kì|môn|giáo viên|danh sách|tổng cộng|người lập|chữ ký|ngày sinh|stt|mã|họ và tên|studentid)/i;

/**
 * Chuẩn hóa tên lớp bỏ tiền tố "Lớp" dư thừa (ví dụ: "Lớp 1A" -> "1A", "  2B " -> "2B")
 */
export function normalizeClassLabel(cls) {
  if (!cls) return '';
  return String(cls).trim().replace(/^lớp\s*/i, '').trim();
}

export function parseLevel(value) {
  if (!value) return 'H';
  const raw = String(value).trim().toUpperCase();
  if (['T', 'H', 'C'].includes(raw)) return raw;
  if (raw === 'HTT' || raw === 'TOT') return 'T';
  if (raw === 'CHT' || raw === 'CD' || raw === 'CĐ') return 'C';
  if (raw === 'HT' || raw === 'D' || raw === 'Đ') return 'H';
  const norm = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/Đ/g, 'D');
  return (norm.includes('TOT') || norm.includes('XUAT SAC') || norm.includes('HOAN THANH TOT')) ? 'T' : (norm.includes('CHUA') || norm.includes('KHONG DAT') || norm.includes('CHUA DAT')) ? 'C' : 'H';
}

function parseSheetRows(rawRows, defaultClass = '', options = {}) {
  if (!rawRows || rawRows.length === 0) return [];
  let headerRowIdx = -1, nameColIdx = -1, hoDemColIdx = -1, tenColIdx = -1, idColIdx = -1, classColIdx = -1;
  let detectedClass = defaultClass.replace(/^(?:mĩ thuật|mỹ thuật|lop)[_\s]*/i, '').trim() || defaultClass;

  for (let r = 0; r < Math.min(rawRows.length, 30); r++) {
    const row = rawRows[r] || [];
    const classMatch = row.join(' ').match(/(?:lớp|khối)[:\s]*([0-9]{1,2}\s*[A-Za-z0-9_-]*)/i);
    if (classMatch) detectedClass = classMatch[1].trim();

    const rowLower = row.map(cell => (cell || '').toString().toLowerCase().trim());
    const hdIdx = rowLower.findIndex(s => s.includes('họ đệm') || s.includes('họ và đệm') || s.includes('họ và tên đệm') || s.includes('họ lót') || s === 'họ');
    const tIdx = rowLower.findIndex(s => s === 'tên' || s === 'tên hs' || s === 'tên học sinh' || s === 'tên gọi');
    const nIdx = rowLower.findIndex(s => (s.includes('họ và tên') || s.includes('họ tên') || s.includes('tên học sinh')) && !s.includes('đệm') && !s.includes('lót'));

    if (nIdx !== -1 || (hdIdx !== -1 && tIdx !== -1) || (hdIdx !== -1 && nIdx !== -1)) {
      headerRowIdx = r; nameColIdx = nIdx; hoDemColIdx = hdIdx; tenColIdx = tIdx;
      idColIdx = rowLower.findIndex(s => !s.includes('stt') && !s.includes('lớp') && (s.includes('mã hs') || s.includes('mã học sinh') || s.includes('mã định danh') || s.includes('số định danh') || s === 'mã' || s === 'id'));
      classColIdx = rowLower.findIndex(s => s.includes('lớp'));
      break;
    }
  }

  const startRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;
  const numCols = Math.max(...rawRows.slice(0, 30).map(r => (r && r.length) || 0), 10);
  const colHeaders = [], startH = Math.max(0, headerRowIdx - 1), endH = Math.min(rawRows.length - 1, headerRowIdx + 1);
  for (let c = 0; c < numCols; c++) {
    const parts = [];
    for (let hr = startH; hr <= endH; hr++) {
      const val = (rawRows[hr]?.[c] || '').toString().trim();
      if (val && !val.startsWith('{')) parts.push(val);
    }
    colHeaders[c] = parts.join(' ').toLowerCase();
  }

  const isComment = s => /(nhận xét|lời nhận xét|nội dung nhận xét|ý kiến|ghi chú|nx|nhanxet)/i.test(s);
  const isLevel = s => !isComment(s) && /(mức|đạt|kết quả|xếp loại|học kỳ|học kì|giữa kì|giữa kỳ|cuối kì|cuối kỳ|đgtx|đgđk|ghk|chk|^đg$|đánh giá|mĩ thuật|mỹ thuật)/i.test(s);
  const countValid = col => rawRows.slice(startRow).reduce((acc, r) => acc + (['T', 'H', 'C', 'HTT', 'HT', 'CHT', 'Đ', 'CĐ'].includes(String(r?.[col] || '').trim().toUpperCase()) ? 1 : 0), 0);
  const countTexts = col => rawRows.slice(startRow).reduce((acc, r) => acc + (String(r?.[col] || '').trim().length > 5 ? 1 : 0), 0);

  const weekColMap = {};
  colHeaders.forEach((h, c) => {
    const wm = h.match(/(?:tuần|t)\s*(\d{1,2})/i);
    if (wm) {
      const w = parseInt(wm[1], 10);
      if (w >= 1 && w <= 35) weekColMap[w] = c;
    }
  });

  const levelCandidates = [], commentCandidates = [];
  colHeaders.forEach((h, c) => {
    if ([nameColIdx, hoDemColIdx, tenColIdx, idColIdx, classColIdx].includes(c)) return;
    if (isComment(h)) commentCandidates.push(c);
    else if (isLevel(h)) levelCandidates.push(c);
  });

  const targetSem = (options.semester || '').toLowerCase();
  const semMatches = col => {
    const h = colHeaders[col] || '';
    if (targetSem.includes('giữa') || targetSem.includes('ghk')) return h.includes('giữa') || h.includes('ghk');
    if (targetSem.includes('cuối') || targetSem.includes('chk')) return h.includes('cuối') || h.includes('chk');
    return false;
  };

  levelCandidates.sort((a, b) => {
    const diff = (countValid(b) > 0 ? 1 : 0) - (countValid(a) > 0 ? 1 : 0);
    if (diff !== 0) return diff;
    if (targetSem) {
      const smDiff = (semMatches(b) ? 1 : 0) - (semMatches(a) ? 1 : 0);
      if (smDiff !== 0) return smDiff;
    }
    return countValid(b) - countValid(a);
  });

  let levelColIdx = levelCandidates[0] ?? -1;
  if (levelColIdx === -1 || countValid(levelColIdx) === 0) {
    let maxCnt = 1;
    for (let c = 0; c < numCols; c++) {
      if ([nameColIdx, hoDemColIdx, tenColIdx, idColIdx, classColIdx].includes(c)) continue;
      const cnt = countValid(c);
      if (cnt > maxCnt) { maxCnt = cnt; levelColIdx = c; }
    }
  }

  commentCandidates.sort((a, b) => countTexts(b) - countTexts(a));
  let commentColIdx = commentCandidates.find(c => countTexts(c) > 0) ?? commentCandidates.find(c => c > levelColIdx) ?? commentCandidates[0] ?? -1;
  if (commentColIdx === -1) {
    let maxTxt = 0;
    for (let c = 0; c < numCols; c++) {
      if ([nameColIdx, hoDemColIdx, tenColIdx, idColIdx, classColIdx, levelColIdx].includes(c)) continue;
      const txt = countTexts(c);
      if (txt > maxTxt) { maxTxt = txt; commentColIdx = c; }
    }
  }

  const result = [];
  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || !Array.isArray(row) || row.length === 0) continue;
    let fullName = '';
    if (hoDemColIdx !== -1 && tenColIdx !== -1) fullName = `${row[hoDemColIdx] || ''} ${row[tenColIdx] || ''}`.trim();
    else if (nameColIdx !== -1) {
      fullName = (row[nameColIdx] || '').toString().trim();
      if (tenColIdx !== -1 && row[tenColIdx] && !fullName.endsWith(row[tenColIdx].toString().trim())) fullName = `${fullName} ${row[tenColIdx]}`.trim();
    } else {
      const candidate = row.find(c => typeof c === 'string' && c.trim().split(/\s+/).length >= 2 && /[a-zA-ZÀ-ỹ]/.test(c));
      if (candidate) fullName = candidate.toString().trim();
    }
    if (!fullName || isNonStudentName(fullName) || fullName.length < 2) continue;
    fullName = fullName.replace(/^\d+[.\s-]+/, '').trim();
    if (isNonStudentName(fullName)) continue;

    const rawId = (idColIdx !== -1 && row[idColIdx]) ? row[idColIdx].toString().trim() : `HS${(result.length + 1).toString().padStart(3, '0')}`;
    const rawClass = normalizeClassLabel((classColIdx !== -1 && row[classColIdx]) ? row[classColIdx].toString().trim() : detectedClass);
    const rawLevel = (levelColIdx !== -1 && row[levelColIdx]) ? parseLevel(row[levelColIdx]) : 'H';
    let rawComment = (commentColIdx !== -1 && row[commentColIdx]) ? row[commentColIdx].toString().trim() : '';
    const hasComment = Boolean(rawComment);
    if (!rawComment) {
      const bank = TT27_COMMENTS_BANK[rawLevel] || TT27_COMMENTS_BANK.H;
      rawComment = bank[result.length % bank.length];
    }
    const weeklyLevels = {};
    for (const [w, c] of Object.entries(weekColMap)) {
      const val = row[c];
      if (val) {
        const parsed = parseLevel(val);
        if (parsed) weeklyLevels[w] = parsed;
      }
    }
    result.push({ id: rawId, name: fullName, className: rawClass, level: rawLevel, gkLevel: rawLevel, ckLevel: rawLevel, cnLevel: rawLevel, weeklyLevels, comment: rawComment, commentSource: hasComment ? 'provided' : 'generated' });
  }
  return result;
}

export function parseSmasWorkbook(workbook, options = {}) {
  if (!workbook || !Array.isArray(workbook.SheetNames) || workbook.SheetNames.length === 0) throw new Error('Tệp Excel rỗng hoặc không có trang tính.');
  const allStudents = [], detectedClasses = new Set();
  for (const sheetName of workbook.SheetNames) {
    if (/^(hướng dẫn|huong_dan|bìa|cover|info|thong_tin)/i.test(sheetName)) continue;
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const studentsInSheet = parseSheetRows(rawRows, sheetName, options);
    for (const st of studentsInSheet) {
      allStudents.push(st);
      if (st.className) detectedClasses.add(normalizeClassLabel(st.className));
    }
  }
  return { students: allStudents, detectedClasses: Array.from(detectedClasses) };
}

export function shuffleClassComments(students = [], targetClass = '') {
  const normTarget = normalizeClassLabel(targetClass);
  return students.map((st, idx) => {
    if (normTarget && normTarget !== 'all' && normalizeClassLabel(st.className) !== normTarget) return st;
    const bank = TT27_COMMENTS_BANK[st.level] || TT27_COMMENTS_BANK.H;
    const comment = bank[(idx + Math.floor(Math.random() * bank.length)) % bank.length];
    return { ...st, comment, commentSource: 'generated' };
  });
}

export function exportSmasExcel({ students = [], className = '1A', semester = 'Học kì I', multiSheet = false, exportMode = 'standard' }) {
  if (!Array.isArray(students) || students.length === 0) throw new Error('Danh sách học sinh rỗng.');
  const workbook = XLSX.utils.book_new(), safeSem = String(semester || 'HK1').replace(/\s+/g, '_');
  
  // Kiểm tra chế độ xuất: Đầy đủ (comprehensive), 35 Tuần thường xuyên (weekly), hoặc chuẩn kỳ hiện tại
  const isWeeklyMode = /weekly|thuong_xuyen|35tuan/i.test(exportMode);
  const isComprehensive = exportMode === 'comprehensive' || /toan_dien|tat_ca/i.test(exportMode);
  const isMidTermMode = /giua|gk|ghk/i.test(exportMode) || /giua|gk|ghk/i.test(semester);
  const isFinalTermMode = /cuoi|ck|chk/i.test(exportMode) || /cuoi|ck|chk/i.test(semester);

  const cols = isWeeklyMode
    ? [{ wch: 6 }, { wch: 14 }, { wch: 25 }, { wch: 10 }, ...Array.from({ length: 35 }, () => ({ wch: 6 }))]
    : isComprehensive 
    ? [{ wch: 6 }, { wch: 14 }, { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 45 }, { wch: 12 }, { wch: 45 }, { wch: 12 }, { wch: 55 }]
    : [{ wch: 6 }, { wch: 14 }, { wch: 25 }, { wch: 10 }, { wch: 14 }, { wch: 70 }];

  const toRow = (st, idx, cls) => {
    if (isWeeklyMode) {
      const row = {
        'STT': idx + 1,
        'Mã học sinh': st.id || `HS${String(idx + 1).padStart(3, '0')}`,
        'Họ và tên': st.name,
        'Lớp': cls,
      };
      for (let w = 1; w <= 35; w++) {
        row[`Tuần ${w}`] = st.weeklyLevels?.[w] || st.weeklyLevels?.[String(w)] || '';
      }
      return row;
    }

    if (isComprehensive) {
      return {
        'STT': idx + 1,
        'Mã học sinh': st.id || `HS${String(idx + 1).padStart(3, '0')}`,
        'Họ và tên': st.name,
        'Lớp': cls,
        'Mức giữa kì (GK)': parseLevel(st.gkLevel || st.level || 'H'),
        'Nhận xét giữa kì': st.gkComment || st.comment || '',
        'Mức cuối kì (CK)': parseLevel(st.ckLevel || st.level || 'H'),
        'Nhận xét cuối kì': st.ckComment || st.comment || '',
        'Mức cả năm': parseLevel(st.level || 'H'),
        'Nội dung nhận xét cả năm': st.comment || ''
      };
    }

    if (isMidTermMode) {
      const isGk2 = /gk2|giua.*2/i.test(exportMode) || /giua.*2/i.test(semester);
      return {
        'STT': idx + 1,
        'Mã học sinh': st.id || `HS${String(idx + 1).padStart(3, '0')}`,
        'Họ và tên': st.name,
        'Lớp': cls,
        'Mức đánh giá giữa kì': parseLevel(isGk2 ? (st.gk2Level || st.gkLevel || st.level || 'H') : (st.gk1Level || st.gkLevel || st.level || 'H')),
        'Nội dung nhận xét giữa kì': isGk2 ? (st.gk2Comment || st.gkComment || st.comment || '') : (st.gk1Comment || st.gkComment || st.comment || '')
      };
    }

    if (isFinalTermMode) {
      const isCk2 = /ck2|cuoi.*2/i.test(exportMode) || /cuoi.*2/i.test(semester);
      return {
        'STT': idx + 1,
        'Mã học sinh': st.id || `HS${String(idx + 1).padStart(3, '0')}`,
        'Họ và tên': st.name,
        'Lớp': cls,
        'Mức đánh giá cuối kì': parseLevel(isCk2 ? (st.ck2Level || st.ckLevel || st.level || 'H') : (st.ck1Level || st.ckLevel || st.level || 'H')),
        'Nội dung nhận xét cuối kì': isCk2 ? (st.ck2Comment || st.ckComment || st.comment || '') : (st.ck1Comment || st.ckComment || st.comment || '')
      };
    }

    return {
      'STT': idx + 1,
      'Mã học sinh': st.id || `HS${String(idx + 1).padStart(3, '0')}`,
      'Họ và tên': st.name,
      'Lớp': cls,
      'Mức đánh giá': parseLevel(st.level || 'H'),
      'Nội dung nhận xét': st.comment || ''
    };
  };

  if (multiSheet) {
    const classMap = new Map();
    students.forEach(st => { const c = st.className?.trim() || className || 'Chung'; if (!classMap.has(c)) classMap.set(c, []); classMap.get(c).push(st); });
    for (const [cls, list] of classMap.entries()) {
      const ws = XLSX.utils.json_to_sheet(list.map((st, i) => toRow(st, i, cls)));
      ws['!cols'] = cols;
      XLSX.utils.book_append_sheet(workbook, ws, cls.replace(/[:\\/?*[\]]/g, '_').slice(0, 31) || 'Lop');
    }
    const fileName = isWeeklyMode
      ? `So_Theo_Doi_Thuong_Xuyen_Mi_Thuat_Tat_Ca_Cac_Lop.xlsx`
      : isComprehensive
      ? `Bang_Tong_Hop_Danh_Gia_Mi_Thuat_Toan_Dien_${safeSem}.xlsx`
      : `Bang_Nhan_Xet_Mi_Thuat_Tat_Ca_Cac_Lop_${safeSem}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    return fileName;
  }
  const filtered = (className && className !== 'all') ? students.filter(st => (st.className || '').trim() === className.trim()) : students;
  const list = filtered.length > 0 ? filtered : students;
  const ws = XLSX.utils.json_to_sheet(list.map((st, i) => toRow(st, i, st.className || className || '1A')));
  ws['!cols'] = cols;
  XLSX.utils.book_append_sheet(workbook, ws, isWeeklyMode ? 'Theo_Doi_Thuong_Xuyen' : 'Bang_Nhan_Xet_Mi_Thuat');
  const fileName = isWeeklyMode
    ? `So_Theo_Doi_Thuong_Xuyen_Mi_Thuat_${String(className || 'Lop').replace(/\s+/g, '_')}.xlsx`
    : isComprehensive
    ? `Bang_Tong_Hop_Danh_Gia_Mi_Thuat_${String(className || 'Lop').replace(/\s+/g, '_')}_${safeSem}.xlsx`
    : `Bang_Nhan_Xet_Mi_Thuat_${String(className || 'Lop').replace(/\s+/g, '_')}_${safeSem}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  return fileName;
}
