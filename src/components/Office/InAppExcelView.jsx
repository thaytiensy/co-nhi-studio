import React, { useState, useMemo } from 'react';
import { Download, Upload, Search, FileSpreadsheet } from 'lucide-react';
import { createWorkbookFromSheets, saveWorkbook } from '../../utils/excelService';
import { showToast } from '../../utils/toastService';

export default function InAppExcelView({ docData, onUploadExcel }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Dữ liệu bảng tính mẫu SMAS TT27 mặc định khi chưa tải tệp
  const defaultSpreadsheet = useMemo(() => {
    const students = [
      { stt: 1, id: 'HS001', name: 'Nguyễn Văn An', lop: '1A', danhGia: 'T', cmt: 'Hoàn thành tốt các bài vẽ màu sắc và tạo hình.' },
      { stt: 2, id: 'HS002', name: 'Trần Thị Bình', lop: '1A', danhGia: 'T', cmt: 'Bố cục tranh sinh động, phối màu hài hòa.' },
      { stt: 3, id: 'HS003', name: 'Lê Hoàng Cường', lop: '1A', danhGia: 'H', cmt: 'Có tiến bộ trong kỹ năng cầm bút và tô màu.' },
      { stt: 4, id: 'HS004', name: 'Phạm Ngọc Diệp', lop: '1A', danhGia: 'T', cmt: 'Tư duy thẩm mĩ tốt, tích cực giúp đỡ bạn bè.' },
      { stt: 5, id: 'HS005', name: 'Vũ Đức Dũng', lop: '1A', danhGia: 'H', cmt: 'Cần chú ý không tô màu lem ra ngoài đường viền.' },
      { stt: 6, id: 'HS006', name: 'Hoàng Mai Hoa', lop: '1A', danhGia: 'T', cmt: 'Nét vẽ tự tin, biểu cảm nhân vật rất ngộ nghĩnh.' },
      { stt: 7, id: 'HS007', name: 'Đặng Quốc Huy', lop: '1A', danhGia: 'H', cmt: 'Biết chọn màu phù hợp với chủ đề bài học.' },
      { stt: 8, id: 'HS008', name: 'Bùi Thảo Linh', lop: '1A', danhGia: 'T', cmt: 'Sản phẩm sáng tạo, thể hiện ý tưởng phong phú.' },
    ];

    const headers = ['STT', 'Mã Học Sinh', 'Họ Và Tên', 'Lớp', 'Đánh Giá Giữa Kỳ', 'Đánh Giá Cuối Kỳ', 'Nội Dung Nhận Xét'];
    const rows = students.map(s => [s.stt, s.id, s.name, s.lop, s.danhGia, s.danhGia, s.cmt]);

    return {
      title: 'SỔ THEO DÕI ĐÁNH GIÁ MĨ THUẬT TIỂU HỌC (CHUẨN TT27 / SMAS)',
      sheetNames: ['Danh Sách Lớp 1A', 'Tổng Hợp Học Kỳ I', 'Tổng Hợp Cả Năm'],
      sheets: {
        'Danh Sách Lớp 1A': [headers, ...rows],
        'Tổng Hợp Học Kỳ I': [
          ['Chỉ Số', 'Số Lượng', 'Tỉ Lệ (%)'],
          ['Hoàn thành tốt (T)', '5', '62.5%'],
          ['Hoàn thành (H)', '3', '37.5%'],
          ['Chưa hoàn thành (C)', '0', '0.0%'],
          ['Tổng số học sinh', '8', '100%']
        ],
        'Tổng Hợp Cả Năm': [
          ['Chỉ Số', 'Học Kỳ I', 'Học Kỳ II', 'Cả Năm'],
          ['Hoàn thành tốt (T)', '5', '6', '6'],
          ['Hoàn thành (H)', '3', '2', '2'],
          ['Chưa hoàn thành (C)', '0', '0', '0']
        ]
      }
    };
  }, []);

  const activeDoc = docData?.type === 'xlsx' ? docData : defaultSpreadsheet;
  const [activeSheet, setActiveSheet] = useState(() => activeDoc.sheetNames?.[0] || 'Sheet1');

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const currentSheetData = useMemo(() => activeDoc.sheets?.[activeSheet] || [], [activeDoc, activeSheet]);
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return currentSheetData;
    const term = searchTerm.toLowerCase();
    const [header, ...rows] = currentSheetData;
    const matchedRows = rows.filter(row =>
      Array.isArray(row) && row.some(cell => String(cell || '').toLowerCase().includes(term))
    );
    return [header || [], ...matchedRows];
  }, [currentSheetData, searchTerm]);

  // Xuất file Excel (.xlsx) chuẩn qua ExcelJS
  const handleExportXLSX = async () => {
    try {
      const sheetsConfig = (activeDoc.sheetNames || ['Sheet1']).map((name) => ({
        name: name.slice(0, 31),
        rows: activeDoc.sheets?.[name] || [],
        isAoa: true,
      }));
      const wb = await createWorkbookFromSheets(sheetsConfig);
      await saveWorkbook(wb, `${(activeDoc.title || 'So_Theo_Doi_Mi_Thuat').replace(/\s+/g, '_')}.xlsx`);
      showToast('Đã xuất tệp Excel (.xlsx) chuẩn thành công!', 'success');
    } catch (err) {
      showToast('Lỗi xuất Excel: ' + err.message, 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100 overflow-hidden select-text">
      {/* Top Action Sub-Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-white shadow-xs select-none shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0">
            X
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-sm sm:max-w-md">
            {activeDoc.title || 'Bảng Tính Excel (.xlsx) & Sổ Điểm SMAS'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
            Chuẩn SMAS TT27
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm ô..."
              className="pl-8 pr-3 py-1 bg-slate-800 text-white placeholder-slate-400 text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-400 w-32 sm:w-44 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleExportXLSX}
            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl border border-emerald-400/40 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Tải bảng tính này về máy tính (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải File Excel</span>
          </button>

          {onUploadExcel && (
            <button
              type="button"
              onClick={onUploadExcel}
              className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-200 hover:to-yellow-200 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ring-1 ring-amber-400"
              title="Mở tệp Excel (.xlsx, .csv) khác từ máy tính"
            >
              <Upload className="w-3.5 h-3.5 text-amber-900" />
              <span>Mở File Excel Khác</span>
            </button>
          )}
        </div>
      </div>

      {/* Sheet Tabs Selector */}
      <div className="bg-slate-200 px-4 pt-2 border-b border-slate-300 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
        {activeDoc.sheetNames?.map(name => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setActiveSheet(name);
              setSearchTerm('');
            }}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeSheet === name
                ? 'bg-white text-emerald-900 border-t-2 border-emerald-600 shadow-xs'
                : 'bg-slate-300/70 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{name}</span>
          </button>
        ))}
      </div>

      {/* Main Excel Grid */}
      <div className="flex-1 overflow-auto p-4 bg-slate-50">
        <div className="bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden">
          {filteredData.length > 0 ? (
            <table className="w-full text-xs border-collapse border border-slate-300 text-slate-800 font-sans">
              <tbody>
                {filteredData.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={
                      rIdx === 0
                        ? 'bg-emerald-50 font-black text-emerald-950 sticky top-0 border-b-2 border-emerald-300 shadow-2xs select-none'
                        : 'hover:bg-amber-50/50 border-b border-slate-200 transition-colors'
                    }
                  >
                    {/* Row Number */}
                    <td className="p-2 text-center bg-slate-100 font-bold border-r border-slate-300 w-12 text-slate-500 select-none">
                      {rIdx === 0 ? '#' : rIdx}
                    </td>

                    {/* Cells */}
                    {Array.isArray(row) && row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-2.5 border-r border-slate-200 last:border-r-0 whitespace-nowrap ${
                          rIdx === 0 ? 'text-emerald-950 font-black uppercase text-[11.5px]' : ''
                        }`}
                      >
                        {String(cell || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-12 text-slate-400 font-bold text-sm">
              Không tìm thấy dòng nào khớp với từ khóa "{searchTerm}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
