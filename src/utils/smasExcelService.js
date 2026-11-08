import * as XLSX from 'xlsx';

export const TT27_COMMENTS_BANK = {
  T: [
    'Có năng khiếu mĩ thuật nổi bật, phối màu hài hòa, đường nét giàu cảm xúc, sáng tạo độc đáo.',
    'Nhận biết và sử dụng màu sắc rất tốt, ý tưởng vẽ tranh phong phú, tự tin chia sẻ trước lớp.',
    'Kỹ thuật vẽ nét và xé dán rất khéo léo, thể hiện rõ chủ đề bài học, hoàn thành bài xuất sắc.',
    'Bố cục tranh cân đối, màu sắc sinh động, có nhiều ý tưởng sáng tạo vượt trội so với yêu cầu.',
    'Tích cực tham gia các hoạt động mĩ thuật, thể hiện cảm xúc thẩm mỹ rất tốt qua từng bài vẽ.',
    'Khả năng quan sát tinh tế, thể hiện hình khối và chi tiết rất sinh động, nét vẽ tự tin.',
    'Sử dụng vật liệu đa dạng, tạo hình sáng tạo, sản phẩm mĩ thuật có tính thẩm mỹ rất cao.'
  ],
  H: [
    'Hoàn thành bài vẽ đúng yêu cầu chủ đề, đường nét rõ ràng, màu sắc tươi sáng.',
    'Biết cách pha trộn và tô màu đều tay, bố cục tranh tương đối hợp lý.',
    'Có ý thức chuẩn bị đồ dùng học tập đầy đủ, tích cực tham gia các hoạt động thực hành.',
    'Nắm được các bước vẽ cơ bản, vẽ hình cân đối, màu sắc hài hòa theo chủ đề.',
    'Sản phẩm mĩ thuật rõ ràng, sạch sẽ, hoàn thành đúng tiến độ bài học trên lớp.',
    'Biết lắng nghe và tiếp thu hướng dẫn của thầy cô, vẽ hình có tiến bộ rõ rệt.',
    'Tự tin chia sẻ cảm xúc về bức tranh của mình và bạn bè sau giờ thực hành.'
  ],
  C: [
    'Em cần chú ý quan sát mẫu kĩ hơn, tô màu cẩn thận và hoàn thiện bài vẽ đúng hạn.',
    'Cần tập trung hơn trong giờ thực hành mĩ thuật, chuẩn bị đủ sáp màu khi đến lớp.',
    'Nét vẽ còn rụt rè, em hãy tự tin vẽ nét to rõ hơn và phối thêm màu sắc sinh động nhé.',
    'Em cần hoàn thành phần tô màu nền để bức tranh thêm sinh động và hoàn chỉnh hơn.'
  ]
};

const NON_STUDENT_REGEX = /^(lớp|khối|trường|phòng|sở|bảng|năm học|học kỳ|môn|giáo viên|danh sách|tổng cộng|người lập|chữ ký|ngày sinh|stt|mã|họ và tên)/i;

export function parseLevel(value) {
  const level = String(value || '').trim().toUpperCase();
  if (['T', 'H', 'C'].includes(level)) return level;
  if (level.includes('TỐT') || level.includes('HOÀN THÀNH TỐT')) return 'T';
  if (level.includes('CHƯA')) return 'C';
  return 'H';
}

function parseSheetRows(rawRows, defaultClass = '') {
  if (!rawRows || rawRows.length === 0) return [];
  let headerRowIdx = -1, nameColIdx = -1, hoDemColIdx = -1, tenColIdx = -1;
  let idColIdx = -1, classColIdx = -1, levelColIdx = -1, commentColIdx = -1;
  let detectedClassInHeader = defaultClass.replace(/^lop[_\s]*/i, '').trim() || defaultClass;

  for (let r = 0; r < Math.min(rawRows.length, 30); r++) {
    const row = rawRows[r] || [];
    const rowStr = row.join(' ');
    const classMatch = rowStr.match(/(?:lớp|khối)[:\s]*([0-9]{1,2}\s*[A-Za-z0-9_-]*)/i);
    if (classMatch) detectedClassInHeader = classMatch[1].trim();

    const rowLower = row.map(cell => (cell || '').toString().toLowerCase().trim());
    const hdIdx = rowLower.findIndex(s => s.includes('họ đệm') || s.includes('họ và đệm') || s.includes('họ và tên đệm') || s.includes('họ lót') || s === 'họ');
    const tIdx = rowLower.findIndex(s => s === 'tên' || s === 'tên hs' || s === 'tên học sinh' || s === 'tên gọi');
    const nIdx = rowLower.findIndex(s => (s.includes('họ và tên') || s.includes('họ tên') || s.includes('tên học sinh')) && !s.includes('đệm') && !s.includes('lót'));

    if (nIdx !== -1 || (hdIdx !== -1 && tIdx !== -1) || (hdIdx !== -1 && nIdx !== -1)) {
      headerRowIdx = r;
      nameColIdx = nIdx;
      hoDemColIdx = hdIdx;
      tenColIdx = tIdx;
      idColIdx = rowLower.findIndex(s => !s.includes('stt') && !s.includes('lớp') && (s.includes('mã hs') || s.includes('mã học sinh') || s.includes('mã định danh') || s.includes('số định danh') || s === 'mã' || s === 'id'));
      classColIdx = rowLower.findIndex(s => s.includes('lớp'));
      levelColIdx = rowLower.findIndex(s => s.includes('mức') || s.includes('đạt') || s.includes('kết quả') || s.includes('xếp loại'));
      commentColIdx = rowLower.findIndex(s => s.includes('nhận xét') || s.includes('đánh giá') || s.includes('ghi chú'));
      break;
    }
  }

  const startRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;
  const result = [];
  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || !Array.isArray(row) || row.length === 0) continue;

    let fullName = '';
    if (hoDemColIdx !== -1 && tenColIdx !== -1) {
      const ho = (row[hoDemColIdx] || '').toString().trim();
      const ten = (row[tenColIdx] || '').toString().trim();
      fullName = `${ho} ${ten}`.trim();
    } else if (nameColIdx !== -1) {
      fullName = (row[nameColIdx] || '').toString().trim();
      if (tenColIdx !== -1 && row[tenColIdx] && !fullName.endsWith(row[tenColIdx].toString().trim())) {
        fullName = `${fullName} ${row[tenColIdx]}`.trim();
      }
    } else {
      const candidate = row.find(c => typeof c === 'string' && c.trim().split(/\s+/).length >= 2 && /[a-zA-ZÀ-ỹ]/.test(c));
      if (candidate) fullName = candidate.toString().trim();
    }

    if (!fullName || NON_STUDENT_REGEX.test(fullName) || fullName.length < 2) continue;
    fullName = fullName.replace(/^\d+[.\s-]+/, '').trim();
    if (NON_STUDENT_REGEX.test(fullName)) continue;

    const rawId = (idColIdx !== -1 && row[idColIdx]) ? row[idColIdx].toString().trim() : `HS${(result.length + 1).toString().padStart(3, '0')}`;
    const rawClass = (classColIdx !== -1 && row[classColIdx]) ? row[classColIdx].toString().trim() : detectedClassInHeader;
    const rawLevel = (levelColIdx !== -1 && row[levelColIdx]) ? parseLevel(row[levelColIdx]) : 'H';
    let rawComment = (commentColIdx !== -1 && row[commentColIdx]) ? row[commentColIdx].toString().trim() : '';
    const hasComment = Boolean(rawComment);
    if (!rawComment) {
      const bank = TT27_COMMENTS_BANK[rawLevel] || TT27_COMMENTS_BANK.H;
      rawComment = bank[result.length % bank.length];
    }

    result.push({ id: rawId, name: fullName, className: rawClass, level: rawLevel, comment: rawComment, commentSource: hasComment ? 'provided' : 'generated' });
  }
  return result;
}

export function parseSmasWorkbook(workbook) {
  if (!workbook || !Array.isArray(workbook.SheetNames) || workbook.SheetNames.length === 0) {
    throw new Error('Tệp Excel rỗng hoặc không có trang tính.');
  }
  const allStudents = [];
  const detectedClasses = new Set();

  for (const sheetName of workbook.SheetNames) {
    if (/^(hướng dẫn|huong_dan|bìa|cover|info|thong_tin)/i.test(sheetName)) continue;
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const studentsInSheet = parseSheetRows(rawRows, sheetName);
    for (const st of studentsInSheet) {
      allStudents.push(st);
      if (st.className) detectedClasses.add(st.className);
    }
  }

  return { students: allStudents, detectedClasses: Array.from(detectedClasses) };
}

export function shuffleClassComments(students = [], targetClass = '') {
  return students.map((st, idx) => {
    if (targetClass && targetClass !== 'all' && (st.className || '').trim() !== targetClass.trim()) {
      return st;
    }
    const bank = TT27_COMMENTS_BANK[st.level] || TT27_COMMENTS_BANK.H;
    const comment = bank[(idx + Math.floor(Math.random() * bank.length)) % bank.length];
    return { ...st, comment, commentSource: 'generated' };
  });
}

export function exportSmasExcel({ students = [], className = '1A', semester = 'Học kì I', multiSheet = false }) {
  if (!Array.isArray(students) || students.length === 0) throw new Error('Danh sách học sinh rỗng.');
  const workbook = XLSX.utils.book_new();
  const safeSem = String(semester || 'HK1').replace(/\s+/g, '_');

  if (multiSheet) {
    const classMap = new Map();
    students.forEach((st) => {
      const cls = st.className?.trim() || className || 'Chung';
      if (!classMap.has(cls)) classMap.set(cls, []);
      classMap.get(cls).push(st);
    });

    for (const [clsName, classStudents] of classMap.entries()) {
      const excelData = classStudents.map((st, idx) => ({
        'STT': idx + 1,
        'Mã Học Sinh': st.id || `HS${String(idx + 1).padStart(3, '0')}`,
        'Họ và Tên': st.name,
        'Lớp': clsName,
        'Mức Đạt Được': st.level || 'H',
        'Nhận Xét Mĩ Thuật (TT27)': st.comment || ''
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 25 }, { wch: 10 }, { wch: 14 }, { wch: 70 }];
      const safeSheetName = clsName.replace(/[:\\/?*[\]]/g, '_').slice(0, 31) || 'Lop';
      XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
    }
    const fileName = `Bang_Nhan_Xet_Mi_Thuat_Tat_Ca_Cac_Lop_${safeSem}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    return fileName;
  }

  const filtered = (className && className !== 'all')
    ? students.filter(st => (st.className || '').trim() === className.trim())
    : students;
  const dataToExport = filtered.length > 0 ? filtered : students;
  const excelData = dataToExport.map((st, idx) => ({
    'STT': idx + 1,
    'Mã Học Sinh': st.id || `HS${String(idx + 1).padStart(3, '0')}`,
    'Họ và Tên': st.name,
    'Lớp': st.className || className || '1A',
    'Mức Đạt Được': st.level || 'H',
    'Nhận Xét Mĩ Thuật (TT27)': st.comment || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 25 }, { wch: 10 }, { wch: 14 }, { wch: 70 }];
  const safeClass = String(className || 'Lop').replace(/\s+/g, '_');
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Nhan_Xet_Mi_Thuat');
  const fileName = `Bang_Nhan_Xet_Mi_Thuat_${safeClass}_${safeSem}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  return fileName;
}
