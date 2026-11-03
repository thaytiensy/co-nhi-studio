import React, { useState, useRef } from 'react';
import { 
  ClipboardCheck, 
  Download, 
  Upload,
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  ExternalLink, 
  Info, 
  Sparkles,
  BookOpen,
  Award,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

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
  const [semester, setSemester] = useState('Học kì I');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [exportNotice, setExportNotice] = useState('');
  const fileInputRef = useRef(null);

  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteInputText, setPasteInputText] = useState('');

  // Mở cửa sổ chọn tệp danh sách học sinh
  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Helper bóc tách dòng văn bản học sinh (từ file .txt, .csv hoặc copy-paste)
  const parseRawTextLines = (text) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const parsed = [];

    lines.forEach((line, idx) => {
      // Bỏ qua dòng tiêu đề nếu có
      const lower = line.toLowerCase();
      if (lower.startsWith('stt') || lower.includes('họ và tên') || lower.includes('danh sách')) return;

      // Tách theo tab, dấu phẩy, chấm phẩy hoặc dấu gạch đứng
      let parts = line.split(/[\t,;|]/).map(p => p.trim()).filter(p => p);
      if (parts.length === 1) {
        // Nếu là dòng đơn thuần (ví dụ: "1. Nguyễn Văn An" hoặc "Nguyễn Văn An")
        let cleanedName = parts[0].replace(/^\d+[\.\s\-]+/, '').trim();
        if (cleanedName.length > 2) {
          parsed.push({
            id: `HS${(parsed.length + 1).toString().padStart(3, '0')}`,
            name: cleanedName,
            level: 'H',
            comment: TT27_COMMENTS_BANK.H[parsed.length % TT27_COMMENTS_BANK.H.length]
          });
        }
      } else {
        // Nhiều cột: tìm cột có họ tên
        let foundName = '';
        let foundId = '';
        let foundLevel = 'H';

        parts.forEach((p, pIdx) => {
          if (!foundName && p.split(' ').length >= 2 && /[a-zA-ZÀ-ỹ]/.test(p)) {
            foundName = p.replace(/^\d+[\.\s\-]+/, '').trim();
          } else if (!foundId && /^(HS|\d{3,})/.test(p)) {
            foundId = p;
          } else if (['T', 'H', 'C'].includes(p.toUpperCase())) {
            foundLevel = p.toUpperCase();
          }
        });

        if (!foundName && parts[1]) foundName = parts[1];
        if (!foundName && parts[0]) foundName = parts[0];

        if (foundName) {
          parsed.push({
            id: foundId || `HS${(parsed.length + 1).toString().padStart(3, '0')}`,
            name: foundName,
            level: foundLevel,
            comment: TT27_COMMENTS_BANK[foundLevel][parsed.length % TT27_COMMENTS_BANK[foundLevel].length]
          });
        }
      }
    });

    return parsed;
  };

  // Tải danh sách học sinh lên làm điểm (Linh hoạt cho mọi định dạng: .xlsx, .xls, .csv, .txt, .tsv)
  const handleUploadExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileName = file.name.toLowerCase();

      // TRƯỜNG HỢP 1: Tệp văn bản thuần .txt hoặc .csv
      if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
        const text = await file.text();
        const parsed = parseRawTextLines(text);
        if (parsed.length > 0) {
          setStudents(parsed);
          setExportNotice(`✅ Đã đọc thành công ${parsed.length} học sinh từ tệp!`);
          setTimeout(() => setExportNotice(''), 4000);
          return;
        }
      }

      // TRƯỜNG HỢP 2: Tệp bảng tính Excel (.xlsx, .xls, .csv)
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      if (!rawRows || rawRows.length === 0) {
        alert('Tệp Excel rỗng hoặc không có dữ liệu học sinh.');
        return;
      }

      // Quét tìm dòng tiêu đề (quét đến 25 dòng đầu để hỗ trợ file SMAS/VnEdu có biểu ngữ trường ở đầu)
      let headerRowIdx = -1;
      let nameColIdx = -1;
      let hoDemColIdx = -1;
      let tenColIdx = -1;
      let idColIdx = -1;
      let classColIdx = -1;
      let levelColIdx = -1;
      let commentColIdx = -1;

      for (let r = 0; r < Math.min(rawRows.length, 25); r++) {
        const row = rawRows[r] || [];
        const rowLower = row.map(cell => (cell || '').toString().toLowerCase().trim());

        // Kiểm tra xem dòng này có cột họ tên không
        const nIdx = rowLower.findIndex(s => 
          s.includes('họ và tên') || s.includes('họ tên') || s.includes('tên học sinh') || s === 'họ và tên học sinh'
        );
        const hdIdx = rowLower.findIndex(s => s.includes('họ đệm') || s.includes('họ và đệm') || s.includes('họ và tên đệm') || s === 'họ');
        const tIdx = rowLower.findIndex(s => s === 'tên' || s === 'tên hs' || s === 'tên học sinh');

        if (nIdx !== -1 || (hdIdx !== -1 && tIdx !== -1)) {
          headerRowIdx = r;
          nameColIdx = nIdx;
          hoDemColIdx = hdIdx;
          tenColIdx = tIdx;

          idColIdx = rowLower.findIndex(s => s.includes('mã hs') || s.includes('mã học sinh') || s.includes('mã định danh') || s.includes('mã') || s.includes('id') || s.includes('stt'));
          classColIdx = rowLower.findIndex(s => s.includes('lớp'));
          levelColIdx = rowLower.findIndex(s => s.includes('mức') || s.includes('đạt') || s.includes('kết quả') || s.includes('xếp loại'));
          commentColIdx = rowLower.findIndex(s => s.includes('nhận xét') || s.includes('đánh giá'));
          break;
        }
      }

      // Nếu không tìm thấy dòng tiêu đề chuẩn, kích hoạt Heuristic nhận diện cột họ tên tự động
      if (nameColIdx === -1 && hoDemColIdx === -1) {
        // Đếm cột nào có nhiều từ tiếng Việt nhất
        let bestCol = -1;
        let maxViNames = 0;

        for (let col = 0; col < 12; col++) {
          let viCount = 0;
          for (let r = 0; r < Math.min(rawRows.length, 30); r++) {
            const val = (rawRows[r]?.[col] || '').toString().trim();
            const words = val.split(' ');
            if (words.length >= 2 && words.length <= 5 && /[a-zA-ZÀ-ỹ]/.test(val)) {
              viCount++;
            }
          }
          if (viCount > maxViNames) {
            maxViNames = viCount;
            bestCol = col;
          }
        }

        if (bestCol !== -1 && maxViNames >= 2) {
          nameColIdx = bestCol;
          headerRowIdx = 0;
        }
      }

      if (nameColIdx === -1 && hoDemColIdx === -1) {
        alert('Không nhận diện được cột Họ và Tên. Thầy/Cô có thể bấm nút "Dán danh sách" để copy-paste trực tiếp cực nhanh nhé!');
        return;
      }

      const parsedStudents = [];
      let detectedClass = '';
      const startRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;

      for (let r = startRow; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!row) continue;

        let fullName = '';
        if (nameColIdx !== -1 && row[nameColIdx]) {
          fullName = row[nameColIdx].toString().trim();
        } else if (hoDemColIdx !== -1 && tenColIdx !== -1) {
          const ho = (row[hoDemColIdx] || '').toString().trim();
          const ten = (row[tenColIdx] || '').toString().trim();
          fullName = `${ho} ${ten}`.trim();
        }

        // Bỏ qua dòng trống hoặc dòng tổng cộng/chữ ký
        if (!fullName || fullName.toLowerCase().includes('tổng cộng') || fullName.toLowerCase().includes('người lập')) {
          continue;
        }

        // Bỏ số thứ tự nếu dính vào tên: "1. Nguyễn Văn An" -> "Nguyễn Văn An"
        fullName = fullName.replace(/^\d+[\.\s\-]+/, '').trim();

        const rawId = (idColIdx !== -1 && row[idColIdx]) 
          ? row[idColIdx].toString().trim() 
          : `HS${(parsedStudents.length + 1).toString().padStart(3, '0')}`;

        if (classColIdx !== -1 && row[classColIdx] && !detectedClass) {
          detectedClass = row[classColIdx].toString().trim();
        }

        let rawLevel = 'H';
        if (levelColIdx !== -1 && row[levelColIdx]) {
          const lStr = row[levelColIdx].toString().trim().toUpperCase();
          if (['T', 'H', 'C'].includes(lStr)) rawLevel = lStr;
          else if (lStr.includes('TỐT') || lStr.includes('HOÀN THÀNH TỐT')) rawLevel = 'T';
          else if (lStr.includes('CHƯA')) rawLevel = 'C';
        }

        let rawComment = '';
        if (commentIdx !== -1 && row[commentIdx]) {
          rawComment = row[commentIdx].toString().trim();
        }
        if (!rawComment) {
          const bank = TT27_COMMENTS_BANK[rawLevel] || TT27_COMMENTS_BANK.H;
          rawComment = bank[parsedStudents.length % bank.length];
        }

        parsedStudents.push({
          id: rawId,
          name: fullName,
          level: rawLevel,
          comment: rawComment
        });
      }

      if (parsedStudents.length === 0) {
        alert('Không tìm thấy danh sách học sinh hợp lệ. Thầy/Cô vui lòng kiểm tra lại tệp hoặc dùng tính năng Dán Danh Sách.');
        return;
      }

      setStudents(parsedStudents);
      if (detectedClass) setClassName(detectedClass);
      setExportNotice(`✅ Đã nạp thành công ${parsedStudents.length} học sinh từ "${file.name}"!`);
      setTimeout(() => setExportNotice(''), 4000);
    } catch (err) {
      console.error('Lỗi nạp tệp học sinh:', err);
      alert('Lỗi đọc tệp danh sách học sinh: ' + err.message + '\nThầy/Cô có thể dùng tính năng Dán Danh Sách (Copy-Paste) để nạp ngay.');
    }
  };

  // Nạp danh sách qua dán văn bản (Copy - Paste)
  const handleApplyPastedStudents = () => {
    if (!pasteInputText.trim()) return;
    const parsed = parseRawTextLines(pasteInputText);
    if (parsed.length > 0) {
      setStudents(parsed);
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
  const handleLevelChange = (index, newLevel) => {
    const updated = [...students];
    const bank = TT27_COMMENTS_BANK[newLevel] || TT27_COMMENTS_BANK.H;
    // Pick random comment from the bank for variation
    const randomComment = bank[Math.floor(Math.random() * bank.length)];
    updated[index].level = newLevel;
    updated[index].comment = randomComment;
    setStudents(updated);
  };

  // Handle comment text edit
  const handleCommentChange = (index, newComment) => {
    const updated = [...students];
    updated[index].comment = newComment;
    setStudents(updated);
  };

  // Add new student
  const handleAddStudent = () => {
    const newId = `HS${(students.length + 1).toString().padStart(3, '0')}`;
    const newStudent = {
      id: newId,
      name: `Học sinh mới ${students.length + 1}`,
      level: 'H',
      comment: TT27_COMMENTS_BANK.H[0],
    };
    setStudents([...students, newStudent]);
  };

  // Delete student
  const handleDeleteStudent = (index) => {
    if (students.length <= 1) return;
    setStudents(students.filter((_, idx) => idx !== index));
  };

  // Copy single comment for quick pasting into SMAS Web
  const handleCopySingle = (index, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Export to Excel (.xlsx) compatible with SMAS import structure
  const handleExportExcel = () => {
    try {
      const rows = students.map((s, idx) => ({
        'STT': idx + 1,
        'Mã Học Sinh': s.id,
        'Họ và Tên': s.name,
        'Lớp': className,
        'Kì Đánh Giá': semester,
        'Mức Đạt Được': s.level, // T, H, C
        'Nội Dung Nhận Xét (Thông tư 27/2020)': s.comment,
        'Ngày Đánh Giá': new Date().toLocaleDateString('vi-VN'),
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      
      // Auto width for columns
      worksheet['!cols'] = [
        { wch: 6 },  // STT
        { wch: 14 }, // Mã HS
        { wch: 22 }, // Họ và Tên
        { wch: 10 }, // Lớp
        { wch: 12 }, // Kì
        { wch: 14 }, // Mức
        { wch: 65 }, // Nhận xét
        { wch: 14 }, // Ngày
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Nhan_Xet_Mi_Thuat');

      const fileName = `Bang_Nhan_Xet_Mi_Thuat_${className.replace(/\s+/g, '_')}_${semester.replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setExportNotice(`Đã xuất tệp Excel: ${fileName}`);
      setTimeout(() => setExportNotice(''), 3000);
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
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-20 text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none"
              placeholder="Tên lớp"
            />
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

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="px-4 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            title="Xuất bảng nhận xét ra tệp Excel (.xlsx) chuẩn nhập liệu SMAS"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exportNotice || 'Xuất File Excel Cho SMAS'}</span>
          </button>
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

      {/* Main Student List Table */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-28">Mã HS</th>
                <th className="py-3 px-4 w-48">Họ và Tên</th>
                <th className="py-3 px-4 w-44">Mức Đạt Được (TT27)</th>
                <th className="py-3 px-4">Lời Nhận Xét Mĩ Thuật (Thầy/Cô Duyệt & Sửa)</th>
                <th className="py-3 px-4 w-28 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {students.map((st, idx) => (
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
                      onChange={(e) => {
                        const updated = [...students];
                        updated[idx].name = e.target.value;
                        setStudents(updated);
                      }}
                      className="w-full px-2 py-1 font-bold text-slate-800 bg-transparent hover:bg-white hover:border hover:border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
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
                          onClick={() => handleLevelChange(idx, lvl.key)}
                          className={`px-2 py-1 text-[11px] font-black rounded-lg border transition-all ${
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
                      onChange={(e) => handleCommentChange(idx, e.target.value)}
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
                          onClick={() => handleDeleteStudent(idx)}
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
