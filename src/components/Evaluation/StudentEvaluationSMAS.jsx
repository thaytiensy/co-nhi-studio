import React, { useState, useRef } from 'react';
import { 
  ClipboardCheck, 
  Upload,
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseSmasWorkbook, exportSmasExcel, shuffleClassComments } from '../../utils/smasExcelService';

// Ngân hàng nhận xét môn Mĩ thuật chuẩn Thông tư 27/2020/TT-BGDĐT
const TT27_COMMENTS_BANK = {
  // Mức Hoàn Thành Tốt (T)
  T: [
    'Có năng khiếu mĩ thuật nổi bật, phối màu hài hòa, đường nét giàu cảm xúc, sáng tạo độc đáo.',
    'Nhận biết và sử dụng màu sắc rất tốt, ý tưởng vẽ tranh phong phú, tự tin chia sẻ trước lớp.',
    'Nắm vững kĩ thuật tạo hình, bố cục tranh cân đối, thể hiện sinh động cảm xúc về cuộc sống.',
    'Chủ động, tích cực trong giờ học, hoàn thành sản phẩm đẹp mắt và biết giúp đỡ bạn bè.',
    'Tư duy thẩm mĩ sáng tạo, khéo léo kết hợp các chất liệu mĩ thuật tạo nên sản phẩm ấn tượng.'
  ],
  // Mức Hoàn Thành (H)
  H: [
    'Hoàn thành bài vẽ đúng yêu cầu chủ đề, đường nét rõ ràng, màu sắc tươi sáng.',
    'Biết cách pha trộn và tô màu đều tay, bố cục tranh tương đối hợp lý.',
    'Có ý thức rèn luyện kĩ năng tạo hình, hoàn thành sản phẩm đúng thời gian quy định.',
    'Nắm được các bước vẽ tranh cơ bản, biết chia sẻ cảm nhận về bài vẽ của mình và của bạn.',
    'Chăm chỉ, tích cực tham gia các hoạt động thực hành sáng tạo mĩ thuật trong lớp.'
  ],
  // Mức Chưa Hoàn Thành (C)
  C: [
    'Em cần chú ý quan sát mẫu kĩ hơn, tô màu cẩn thận và hoàn thiện bài vẽ đúng hạn.',
    'Nét vẽ còn ngập ngừng, em cần mạnh dạn hơn khi phác hình và phối màu tươi sáng.',
    'Cần tập trung hơn trong giờ thực hành mĩ thuật, cố gắng hoàn thành sản phẩm theo hướng dẫn của Thầy/Cô.',
    'Em cần rèn luyện thêm kĩ năng sử dụng sáp màu, tránh để màu lem ra ngoài nét vẽ.'
  ]
};

const INITIAL_STUDENTS = [
  { id: 'HS001', name: 'Nguyễn Văn An', level: 'T', comment: 'Có năng khiếu mĩ thuật nổi bật, phối màu hài hòa, đường nét giàu cảm xúc, sáng tạo độc đáo.' },
  { id: 'HS002', name: 'Trần Thị Bình', level: 'T', comment: 'Nhận biết và sử dụng màu sắc rất tốt, ý tưởng vẽ tranh phong phú, tự tin chia sẻ trước lớp.' },
  { id: 'HS003', name: 'Lê Hoàng Cường', level: 'H', comment: 'Hoàn thành bài vẽ đúng yêu cầu chủ đề, đường nét rõ ràng, màu sắc tươi sáng.' },
  { id: 'HS004', name: 'Phạm Minh Đức', level: 'H', comment: 'Biết cách pha trộn và tô màu đều tay, bố cục tranh tương đối hợp lý.' },
  { id: 'HS005', name: 'Vũ Ngọc Hân', level: 'H', comment: 'Nắm được các bước vẽ tranh cơ bản, biết chia sẻ cảm nhận về bài vẽ của mình và của bạn.' },
  { id: 'HS006', name: 'Đỗ Quốc Khánh', level: 'C', comment: 'Em cần chú ý quan sát mẫu kĩ hơn, tô màu cẩn thận và hoàn thiện bài vẽ đúng hạn.' },
];

export default function StudentEvaluationSMAS() {
  const [className, setClassName] = useState('Lớp 1A');
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [semester, setSemester] = useState('Học kì I');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [exportNotice, setExportNotice] = useState('');
  const fileInputRef = useRef(null);

  // Danh sách các lớp được trích xuất
  const allClasses = Array.from(new Set([
    className,
    ...classOptions,
    ...students.map(s => s.className).filter(Boolean)
  ])).filter(Boolean);

  // Danh sách học sinh hiển thị theo bộ lọc lớp
  const displayedStudents = selectedClassFilter === 'all'
    ? students
    : students.filter(s => (s.className || className || '').trim() === selectedClassFilter.trim());

  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteInputText, setPasteInputText] = useState('');

  // Mở cửa sổ chọn tệp danh sách học sinh
  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Helper bóc tách danh sách TXT/dán văn bản: nhận tên, mã, lớp, mức và nhận xét.
  const parseRawTextLines = (text) => {
    const source = String(text || '').replace(/^\uFEFF/, '');
    const sampleLines = source.split(/\r?\n/).filter(line => line.trim()).slice(0, 20);
    const delimiters = ['\t', ',', ';', '|'];
    const delimiter = delimiters
      .map(value => ({ value, count: sampleLines.reduce((total, line) => total + line.split(value).length - 1, 0) }))
      .sort((a, b) => b.count - a.count)[0];
    const separator = delimiter?.count > 0 ? delimiter.value : null;
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;

    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (character === '"') {
        if (quoted && source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (!quoted && separator && character === separator) {
        row.push(cell.trim());
        cell = '';
      } else if (!quoted && (character === '\n' || character === '\r')) {
        if (character === '\r' && source[index + 1] === '\n') index += 1;
        row.push(cell.trim());
        if (row.some(value => value)) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += character;
      }
    }
    row.push(cell.trim());
    if (row.some(value => value)) rows.push(row);

    const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
    const headerIndex = rows.findIndex(cells => cells.some(value => {
      const label = normalize(value);
      return label.includes('ho va ten') || label === 'ho ten' || label.includes('ten hoc sinh') || label === 'stt';
    }));
    let nameIndex = -1;
    let familyIndex = -1;
    let givenIndex = -1;
    let idIndex = -1;
    let classIndex = -1;
    let levelIndex = -1;
    let commentIndex = -1;
    if (headerIndex >= 0) {
      const headers = rows[headerIndex].map(normalize);
      nameIndex = headers.findIndex(label => label.includes('ho va ten') || label === 'ho ten' || label.includes('ten hoc sinh'));
      familyIndex = headers.findIndex(label => label.includes('ho dem') || label === 'ho');
      givenIndex = headers.findIndex(label => label === 'ten' || label === 'ten hs');
      idIndex = headers.findIndex(label => (label.includes('ma hs') || label.includes('ma hoc sinh') || label.includes('ma dinh danh') || label === 'ma' || label === 'id') && !label.includes('stt'));
      classIndex = headers.findIndex(label => label.includes('lop'));
      levelIndex = headers.findIndex(label => label.includes('muc') || label.includes('dat') || label.includes('ket qua') || label.includes('xep loai'));
      commentIndex = headers.findIndex(label => label.includes('nhan xet') || label.includes('danh gia') || label.includes('ghi chu') || label.includes('noi dung'));
    }

    const parseLevel = value => {
      const level = String(value || '').trim().toUpperCase();
      if (['T', 'H', 'C'].includes(level)) return level;
      if (level.includes('TỐT') || level.includes('HOÀN THÀNH TỐT')) return 'T';
      if (level.includes('CHƯA')) return 'C';
      if (level.includes('HOÀN THÀNH') || level.includes('ĐẠT')) return 'H';
      return 'H';
    };
    const generatedId = index => `HS${String(index + 1).padStart(3, '0')}`;
    const parsed = [];

    rows.forEach((cells, rowIndex) => {
      if (headerIndex >= 0 && rowIndex <= headerIndex) return;
      const values = cells.map(value => String(value || '').trim());
      let id = '';
      let name = '';
      let className = '';
      let level = 'H';
      let comment = '';
      let used = new Set();

      if (headerIndex >= 0) {
        name = nameIndex >= 0 ? values[nameIndex] : `${values[familyIndex] || ''} ${values[givenIndex] || ''}`.trim();
        if (nameIndex >= 0) used.add(nameIndex);
        if (familyIndex >= 0) used.add(familyIndex);
        if (givenIndex >= 0) used.add(givenIndex);
        if (idIndex >= 0) { id = values[idIndex]; used.add(idIndex); }
        if (classIndex >= 0) { className = values[classIndex]; used.add(classIndex); }
        if (levelIndex >= 0) { level = parseLevel(values[levelIndex]); used.add(levelIndex); }
        if (commentIndex >= 0) { comment = values[commentIndex]; used.add(commentIndex); }
      } else {
        const candidateNameIndex = values.findIndex(value => value.replace(/^\d+[.\s-]+/, '').trim().split(/\s+/).length >= 2 && /[a-zA-ZÀ-ỹ]/.test(value));
        if (candidateNameIndex < 0) return;
        nameIndex = candidateNameIndex;
        name = values[nameIndex].replace(/^\d+[.\s-]+/, '').trim();
        used.add(nameIndex);
        const idCandidate = values.findIndex((value, index) => index !== nameIndex && /^(HS[- ]?\d+|\d{6,})$/i.test(value));
        if (idCandidate >= 0) { id = values[idCandidate]; used.add(idCandidate); }
        const classCandidate = values.findIndex((value, index) => index !== nameIndex && /^(?:lớp\s*\d{1,2}[a-z]{0,2}|\d{1,2}[a-z]{1,2})$/i.test(value));
        if (classCandidate >= 0) { className = values[classCandidate].replace(/^lớp\s*/i, '').trim(); used.add(classCandidate); }
        const ordinalCandidate = values.findIndex((value, index) => index !== nameIndex && /^\d{1,3}$/.test(value));
        if (ordinalCandidate >= 0 && ordinalCandidate !== classCandidate) used.add(ordinalCandidate);
        const levelCandidate = values.findIndex((value, index) => index !== nameIndex && ['T', 'H', 'C'].includes(value.toUpperCase()));
        if (levelCandidate >= 0) { level = parseLevel(values[levelCandidate]); used.add(levelCandidate); }
        const commentCandidate = values.findIndex((value, index) => index !== nameIndex && !used.has(index) && value.length > 0);
        if (commentCandidate >= 0) { comment = values[commentCandidate]; used.add(commentCandidate); }
      }

      if (!name || /^(stt|danh sach|ho va ten|ho ten)$/i.test(normalize(name))) return;
      const hasProvidedComment = Boolean(comment);
      if (!comment) {
        const bank = TT27_COMMENTS_BANK[level] || TT27_COMMENTS_BANK.H;
        comment = bank[parsed.length % bank.length];
      }
      parsed.push({ id: id || generatedId(parsed.length), name, className, level, comment, commentSource: hasProvidedComment ? 'provided' : 'generated' });
    });

    return parsed;
  };

  // Tải danh sách học sinh lên làm điểm (Linh hoạt cho mọi định dạng: .xlsx, .xls, .csv, .txt, .tsv)
  const handleUploadExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileName = file.name.toLowerCase();

      // Tệp .txt có thể là danh sách tên mỗi dòng; CSV/TSV được đọc theo cột ở bên dưới.
      if (fileName.endsWith('.txt')) {
        const text = await file.text();
        const parsed = parseRawTextLines(text);
        if (parsed.length > 0) {
          const detectedClasses = Array.from(new Set(parsed.map(student => student.className).filter(Boolean)));
          setStudents(parsed);
          setClassOptions(detectedClasses);
          if (detectedClasses.length === 1) setClassName(detectedClasses[0]);
          setExportNotice(`✅ Đã đọc thành công ${parsed.length} học sinh từ tệp!`);
          setTimeout(() => setExportNotice(''), 4000);
          return;
        }
      }

      // TRƯỜNG HỢP 2: Tệp bảng tính Excel (.xlsx, .xls, .csv)
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const { students: parsedStudents, detectedClasses } = parseSmasWorkbook(workbook);

      if (!parsedStudents || parsedStudents.length === 0) {
        alert('Không tìm thấy danh sách học sinh hợp lệ trong tệp Excel. Thầy/Cô có thể bấm "Dán Danh Sách" để copy-paste trực tiếp cực nhanh nhé!');
        return;
      }

      setStudents(parsedStudents);
      setClassOptions(detectedClasses);
      if (detectedClasses.length > 0) setClassName(detectedClasses[0]);
      setExportNotice(`✅ Đã nạp thành công toàn bộ ${parsedStudents.length} học sinh từ "${file.name}"!`);
      setTimeout(() => setExportNotice(''), 4000);
    } catch (err) {
      console.error('Lỗi nạp tệp học sinh:', err);
      alert('Lỗi đọc tệp danh sách học sinh: ' + err.message + '\nThầy/Cô có thể dùng tính năng Dán Danh Sách (Copy-Paste) để nạp ngay.');
    }
  };

  // Nạp danh sách qua dán văn bản (Copy - Paste)
  const handleApplyPastedStudents = () => {
    if (!pasteInputText.trim()) return;
    const parsed = parseRawTextLines(pasteInputText).map(student => ({
      ...student,
      className: student.className || ''
    }));
    if (parsed.length > 0) {
      setStudents(parsed);
      const detectedClasses = Array.from(new Set(parsed.map(student => student.className).filter(Boolean)));
      setClassOptions(detectedClasses);
      if (detectedClasses.length === 1) setClassName(detectedClasses[0]);
      setShowPasteModal(false);
      setPasteInputText('');
      setExportNotice(`✅ Đã thêm ${parsed.length} học sinh từ văn bản dán!`);
      setTimeout(() => setExportNotice(''), 4000);
    } else {
      alert('Chưa nhận diện được tên học sinh. Vui lòng dán mỗi em trên một dòng.');
    }
  };

  // Tải tệp Excel mẫu danh sách học sinh để Thầy/Cô sử dụng
  const handleDownloadSampleTemplate = () => {
    try {
      const sampleRows = [
        { 'STT': 1, 'Mã Học Sinh': 'HS001', 'Họ và Tên': 'Nguyễn Văn An', 'Lớp': className || '1A', 'Mức Đạt Được': 'T', 'Ghi Chú': 'Năng khiếu vẽ tranh' },
        { 'STT': 2, 'Mã Học Sinh': 'HS002', 'Họ và Tên': 'Trần Thị Bình', 'Lớp': className || '1A', 'Mức Đạt Được': 'H', 'Ghi Chú': '' },
        { 'STT': 3, 'Mã Học Sinh': 'HS003', 'Họ và Tên': 'Lê Hoàng Cường', 'Lớp': className || '1A', 'Mức Đạt Được': 'H', 'Ghi Chú': '' },
        { 'STT': 4, 'Mã Học Sinh': 'HS004', 'Họ và Tên': 'Phạm Minh Đức', 'Lớp': className || '1A', 'Mức Đạt Được': 'T', 'Ghi Chú': '' },
        { 'STT': 5, 'Mã Học Sinh': 'HS005', 'Họ và Tên': 'Vũ Ngọc Hân', 'Lớp': className || '1A', 'Mức Đạt Được': 'C', 'Ghi Chú': '' },
      ];
      const ws = XLSX.utils.json_to_sheet(sampleRows);
      ws['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 22 }, { wch: 10 }, { wch: 14 }, { wch: 24 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mau_Danh_Sach_HS');
      XLSX.writeFile(wb, `Mau_Danh_Sach_Hoc_Sinh_SMAS_${className}.xlsx`);
    } catch (err) {
      alert('Lỗi tải tệp mẫu: ' + err.message);
    }
  };

  // Handle changing evaluation level (T, H, C) -> auto suggest corresponding TT27 comment
  const handleLevelChange = (id, newLevel) => {
    setStudents(prev => prev.map(student => {
      if (student.id !== id) return student;
      const bank = TT27_COMMENTS_BANK[newLevel] || TT27_COMMENTS_BANK.H;
      const comment = (!student.comment?.trim() || student.commentSource === 'generated') ? bank[0] : student.comment;
      return { ...student, level: newLevel, comment, commentSource: student.commentSource || 'generated' };
    }));
  };

  // Handle comment text edit
  const handleCommentChange = (id, newComment) => {
    setStudents(prev => prev.map(student => student.id === id ? { ...student, comment: newComment, commentSource: 'custom' } : student));
  };

  // Update student field (name, class)
  const handleUpdateStudent = (id, field, value) => {
    setStudents(prev => prev.map(student => student.id === id ? { ...student, [field]: value } : student));
  };

  // Add new student
  const handleAddStudent = () => {
    const newId = `HS${(students.length + 1).toString().padStart(3, '0')}`;
    const targetClass = selectedClassFilter === 'all' ? (className || '1A') : selectedClassFilter;
    const newStudent = {
      id: newId,
      name: `Học sinh mới ${students.length + 1}`,
      className: targetClass,
      level: 'H',
      comment: TT27_COMMENTS_BANK.H[0],
      commentSource: 'generated',
    };
    setStudents([...students, newStudent]);
  };

  // Delete student
  const handleDeleteStudent = (id) => {
    if (students.length <= 1) return;
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  // Copy single comment for quick pasting into SMAS Web
  const handleCopySingle = (index, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Trộn và đa dạng hóa nhận xét cho lớp đang chọn
  const handleShuffleComments = () => {
    const updated = shuffleClassComments(students, selectedClassFilter);
    setStudents(updated);
    setExportNotice('🎲 Đã tạo mới gợi ý nhận xét đa dạng cho học sinh!');
    setTimeout(() => setExportNotice(''), 3000);
  };

  // Gán nhanh mức T, H, C cho lớp đang chọn
  const handleBatchSetLevel = (lvl) => {
    const bank = TT27_COMMENTS_BANK[lvl] || TT27_COMMENTS_BANK.H;
    const updated = students.map((st, idx) => {
      if (selectedClassFilter !== 'all' && (st.className || className || '').trim() !== selectedClassFilter.trim()) {
        return st;
      }
      return {
        ...st,
        level: lvl,
        comment: bank[idx % bank.length],
        commentSource: 'generated'
      };
    });
    setStudents(updated);
    setExportNotice(`⚡ Đã gán nhanh mức ${lvl} cho danh sách!`);
    setTimeout(() => setExportNotice(''), 3000);
  };

  // Export to Excel (.xlsx) compatible with SMAS import structure
  const handleExportExcel = (multiSheet = false) => {
    if (students.some(student => !(student.className?.trim() || className.trim()))) {
      alert('Vui lòng nhập lớp mặc định ở phía trên hoặc điền lớp cho từng học sinh trước khi xuất.');
      return;
    }

    try {
      const targetClass = selectedClassFilter === 'all' ? (className || '1A') : selectedClassFilter;
      const fileName = exportSmasExcel({ students, className: targetClass, semester, multiSheet });
      setExportNotice(`Đã xuất tệp Excel: ${fileName}`);
      setTimeout(() => setExportNotice(''), 4000);
    } catch (err) {
      alert('Lỗi xuất Excel: ' + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 select-none overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
            <ClipboardCheck className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-slate-800">Nhận Xét Học Sinh & Xuất Bảng SMAS</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                Thông tư 27/2020/TT-BGDĐT
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Gợi ý nhận xét thường xuyên & định kỳ môn Mĩ thuật • Xuất file Excel chuẩn cấu trúc nhập liệu SMAS
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Class and Semester Pickers */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <input
              type="text"
              list="student-class-options"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-24 text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none"
              placeholder="Lớp mặc định"
              title="Có thể nhập lớp bất kỳ; danh sách lớp đã đọc từ tệp sẽ được gợi ý"
            />
            <datalist id="student-class-options">
              {classOptions.map(option => <option key={option} value={option} />)}
            </datalist>
            <span className="text-slate-300">|</span>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent border-0 focus:outline-none"
            >
              <option value="Học kì I">Học kì I</option>
              <option value="Giữa kì I">Giữa kì I</option>
              <option value="Học kì II">Học kì II</option>
              <option value="Cuối năm">Cả năm</option>
            </select>
          </div>

          {/* Hidden File Input for Excel/CSV/TXT upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv, .txt, .tsv"
            onChange={handleUploadExcel}
            className="hidden"
          />

          {/* Upload Student List Button */}
          <button
            onClick={handleTriggerUpload}
            className="px-3 py-1.5 text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all"
            title="Tải tệp danh sách học sinh từ SMAS hoặc sổ điểm của Thầy/Cô (hỗ trợ .xlsx, .xls, .csv, .txt)"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Tải Danh Sách (.xlsx, .csv, .txt)</span>
          </button>

          {/* Quick Paste Button */}
          <button
            onClick={() => setShowPasteModal(true)}
            className="px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-all"
            title="Dán nhanh danh sách học sinh từ Zalo, Word hoặc bảng tính"
          >
            <span>📋</span>
            <span>Dán Danh Sách</span>
          </button>

          {/* Add Student Button */}
          <button
            onClick={handleAddStudent}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-all"
            title="Thêm học sinh thủ công vào danh sách"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Em</span>
          </button>

          {/* Export Excel Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExportExcel(false)}
              className="px-3 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              title="Xuất bảng nhận xét của lớp đang chọn ra tệp Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{exportNotice || `Xuất ${selectedClassFilter === 'all' ? 'Excel SMAS' : selectedClassFilter}`}</span>
            </button>
            <button
              onClick={() => handleExportExcel(true)}
              className="px-3 py-1.5 text-xs font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
              title="Xuất toàn bộ các lớp vào các trang tính (Sheet) riêng biệt trong cùng 1 tệp Excel"
            >
              <span>📑</span>
              <span>Xuất Tất Cả Lớp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dán Danh Sách Nhanh */}
      {showPasteModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowPasteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <span>📋</span> Dán Danh Sách Học Sinh (Copy - Paste)
              </h3>
              <button 
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Thầy/Cô hãy sao chép danh sách học sinh từ Zalo, Word, hoặc Excel rồi dán vào ô bên dưới. Mỗi em trên một dòng.
            </p>
            <textarea
              rows={8}
              value={pasteInputText}
              onChange={(e) => setPasteInputText(e.target.value)}
              placeholder="Ví dụ:&#10;1. Nguyễn Văn An&#10;2. Trần Thị Bình&#10;3. Lê Hoàng Cường&#10;4. Phạm Minh Đức..."
              className="w-full p-3 text-xs text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleApplyPastedStudents}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Nạp Vào Sổ Điểm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Reference & Disclosure Bar */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Căn cứ pháp lý chính thức:</strong> Thông tư số 27/2020/TT-BGDĐT ngày 04/9/2020 của Bộ GD&ĐT quy định đánh giá học sinh tiểu học (Mức T: Hoàn thành tốt, H: Hoàn thành, C: Chưa hoàn thành).
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-amber-800 font-semibold">
            Nguồn: Cổng TTĐT Bộ GD&ĐT (moet.gov.vn) • Kiểm tra: 02/11/2026
          </span>
          <span className="text-[11px] font-bold bg-white text-amber-900 px-2 py-0.5 rounded border border-amber-300">
            Minh bạch: Không có API SMAS tự động
          </span>
        </div>
      </div>

      {/* Thanh Chọn Lớp & Công Cụ Đổi Nhận Xét Hàng Loạt */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        {/* Bộ nút chọn từng lớp */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
            Lớp:
          </span>
          <button
            onClick={() => setSelectedClassFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              selectedClassFilter === 'all'
                ? 'bg-purple-600 text-white border-purple-700 shadow-xs font-black'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất Cả ({students.length})
          </button>
          {allClasses.map((cls) => {
            const count = students.filter(s => (s.className || className || '').trim() === cls.trim()).length;
            return (
              <button
                key={cls}
                onClick={() => {
                  setSelectedClassFilter(cls);
                  setClassName(cls);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedClassFilter === cls
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cls}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedClassFilter === cls ? 'bg-purple-800 text-purple-200' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => {
              const newCls = prompt('Nhập tên lớp mới (ví dụ: Lớp 2B, 3C):');
              if (newCls && newCls.trim()) {
                const clean = newCls.trim();
                setClassOptions(prev => Array.from(new Set([...prev, clean])));
                setSelectedClassFilter(clean);
                setClassName(clean);
              }
            }}
            className="px-2 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-1 cursor-pointer"
            title="Thêm một lớp học mới vào danh sách"
          >
            <Plus className="w-3 h-3" />
            <span>Thêm Lớp</span>
          </button>
        </div>

        {/* Công cụ thao tác nhanh cho lớp đang chọn */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffleComments}
            className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            title="Tự động đổi nhận xét phong phú tránh trùng lặp giữa các học sinh"
          >
            <span>🎲</span>
            <span>Đổi Nhận Xét Tránh Trùng</span>
          </button>
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <span className="text-[10px] font-bold text-slate-400">Gán nhanh:</span>
            <button
              onClick={() => handleBatchSetLevel('T')}
              className="px-2 py-0.5 text-[11px] font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded cursor-pointer"
              title="Gán tất cả học sinh đang hiển thị đạt mức T"
            >
              Mức T
            </button>
            <button
              onClick={() => handleBatchSetLevel('H')}
              className="px-2 py-0.5 text-[11px] font-black text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded cursor-pointer"
              title="Gán tất cả học sinh đang hiển thị đạt mức H"
            >
              Mức H
            </button>
          </div>
        </div>
      </div>

      {/* Main Student List Table */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-28">Mã HS</th>
                <th className="py-3 px-4 w-48">Họ và Tên</th>
                <th className="py-3 px-4 w-28">Lớp</th>
                <th className="py-3 px-4 w-44">Mức Đạt Được (TT27)</th>
                <th className="py-3 px-4">Lời Nhận Xét Mĩ Thuật (Thầy/Cô Duyệt & Sửa)</th>
                <th className="py-3 px-4 w-28 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {displayedStudents.map((st, idx) => (
                <tr key={st.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">
                    {st.id}
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={st.name}
                      onChange={(e) => handleUpdateStudent(st.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 font-bold text-slate-800 bg-transparent hover:bg-white hover:border hover:border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      list="student-class-options"
                      value={st.className || className}
                      onChange={(e) => handleUpdateStudent(st.id, 'className', e.target.value)}
                      className="w-full min-w-16 px-2 py-1 text-slate-700 bg-transparent hover:bg-white hover:border hover:border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                      title="Để trống để dùng lớp mặc định ở phía trên"
                    />
                  </td>
                  <td className="py-3 px-4">
                    {/* Level Selector: T, H, C */}
                    <div className="flex items-center gap-1">
                      {[
                        { key: 'T', label: 'Tốt (T)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                        { key: 'H', label: 'Đạt (H)', color: 'bg-blue-50 text-blue-800 border-blue-300' },
                        { key: 'C', label: 'Cần Cố Gắng (C)', color: 'bg-rose-50 text-rose-800 border-rose-300' },
                      ].map(lvl => (
                        <button
                          key={lvl.key}
                          onClick={() => handleLevelChange(st.id, lvl.key)}
                          className={`px-2 py-1 text-[11px] font-black rounded-lg border transition-all cursor-pointer ${
                            st.level === lvl.key
                              ? `${lvl.color} ring-1 ring-offset-1 ring-purple-400 font-extrabold shadow-2xs`
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={`Chọn mức ${lvl.label}`}
                        >
                          {lvl.key}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <textarea
                      value={st.comment}
                      onChange={(e) => handleCommentChange(st.id, e.target.value)}
                      rows={2}
                      className="w-full p-2 text-xs text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 resize-y font-sans leading-relaxed"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Quick Copy */}
                      <button
                        onClick={() => handleCopySingle(idx, st.comment)}
                        className="p-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 rounded-lg transition-all"
                        title="Sao chép lời nhận xét để dán vào SMAS"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Delete */}
                      {students.length > 1 && (
                        <button
                          onClick={() => handleDeleteStudent(st.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                          title="Xóa học sinh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
