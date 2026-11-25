import React, { useState } from 'react';
import { Volume2, VolumeX, Download, Upload, Copy, Check } from 'lucide-react';
import { speechService } from '../../utils/speechService';
import { showToast } from '../../utils/toastService';

export default function InAppWordView({ docData, onUploadDocx }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mẫu Kế hoạch bài dạy chuẩn Công văn 2345/BGDĐT mặc định khi chưa tải tệp
  const defaultLessonPlan = {
    title: 'KẾ HOẠCH BÀI DẠY MÔN MĨ THUẬT LỚP 1 - 5 (CHUẨN BỘ GIÁO DỤC CV 2345)',
    school: 'TRƯỜNG TIỂU HỌC TÂN PHÚ',
    teacher: 'GIÁO VIÊN: THẦY TIẾN SỸ - MĨ THUẬT GDPT 2018',
    items: [
      { type: 'heading', text: 'I. MỤC TIÊU BÀI DẠY' },
      { type: 'paragraph', text: '1. Yêu cầu cần đạt: Học sinh nhận biết được màu cơ bản (Đỏ, Vàng, Lam), các hình khối cơ bản và biết sử dụng vật liệu sẵn có (sáp màu, đất nặn, giấy màu) để tạo hình sản phẩm nghệ thuật.' },
      { type: 'paragraph', text: '2. Năng lực mĩ thuật: Quan sát và nhận thức thẩm mĩ; Sáng tạo và ứng dụng mĩ thuật; Phân tích và đánh giá tác phẩm qua góc trưng bày tại lớp.' },
      { type: 'paragraph', text: '3. Phẩm chất chủ yếu: Bồi dưỡng tình yêu nghệ thuật, tính kiên trì, cẩn thận và ý thức giữ gìn vệ sinh lớp học.' },
      { type: 'heading', text: 'II. THIẾT BỊ DẠY HỌC & HỌC LIỆU' },
      { type: 'paragraph', text: '- Giáo viên: Máy chiếu/máy tính có phần mềm Cọ Nhí Studio, tranh mẫu phong cảnh, video thị phạm từng nét vẽ.' },
      { type: 'paragraph', text: '- Học sinh: Vở thực hành mĩ thuật, hộp sáp màu, kéo thủ công an toàn, giấy vẽ A4.' },
      { type: 'heading', text: 'III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN GDPT 2018)' },
      {
        type: 'table',
        rows: [
          ['Tiến trình (35 phút)', 'Hoạt động của Giáo viên', 'Hoạt động của Học sinh'],
          ['1. Khởi động (5p)', 'Tổ chức trò chơi Đố Vui Sắc Màu trên Cọ Nhí Studio, khơi gợi cảm xúc về màu sắc thiên nhiên.', 'Học sinh tham gia trả lời sôi nổi, nhận diện màu sắc xung quanh.'],
          ['2. Khám phá & Thị phạm (8p)', 'Thị phạm trực tiếp các bước vẽ hình khối cơ bản, phối màu tương phản nóng - lạnh.', 'Quan sát Thầy giáo thị phạm, thảo luận nhóm 4 về ý tưởng bài vẽ.'],
          ['3. Luyện tập sáng tạo (17p)', 'Hỗ trợ các nhóm thực hành, khích lệ học sinh phát huy ý tưởng cá nhân độc đáo.', 'Thực hành vẽ và tô màu theo chủ đề đã chọn.'],
          ['4. Trưng bày & Đánh giá (5p)', 'Hướng dẫn học sinh treo tranh lên bảng, gợi ý nhận xét theo Rubric 4 tiêu chí.', 'Tự đánh giá bài của mình và chia sẻ cảm xúc về bài của bạn.']
        ]
      },
      { type: 'heading', text: 'IV. BẢNG PHÂN HÓA NHIỆM VỤ THEO 3 MỨC ĐỘ' },
      {
        type: 'table',
        rows: [
          ['Mức độ học sinh', 'Nhiệm vụ cụ thể', 'Yêu cầu hoàn thành'],
          ['Mức 1 (Cần cố gắng)', 'Vẽ được hình đơn giản và tô màu cơ bản không lem ra ngoài nét viền.', 'Hoàn thành 1 sản phẩm cơ bản.'],
          ['Mức 2 (Hoàn thành)', 'Bố cục cân đối, phối hợp từ 3 đến 5 màu sắc hài hòa, có chi tiết phụ sinh động.', 'Sản phẩm đầy đủ chi tiết.'],
          ['Mức 3 (Hoàn thành tốt)', 'Tạo hình sáng tạo, có chiều sâu không gian, kể được câu chuyện ý nghĩa qua tác phẩm.', 'Sản phẩm xuất sắc, nổi bật.']
        ]
      }
    ]
  };

  const activeDoc = docData?.type === 'docx' ? docData : defaultLessonPlan;
  const isCustomFile = docData?.type === 'docx';

  // Lấy toàn bộ văn bản để đọc TTS
  const getFullDocText = () => {
    let lines = [activeDoc.title || ''];
    if (activeDoc.items) {
      activeDoc.items.forEach(item => {
        if (item.text) lines.push(item.text);
        if (item.rows) {
          item.rows.forEach(r => lines.push(r.join('. ')));
        }
      });
    }
    return lines.join('\n\n');
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      const text = getFullDocText();
      if (!text) return;
      speechService.speak(text);
      setIsSpeaking(true);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getFullDocText());
      setCopied(true);
      showToast('Đã sao chép toàn bộ văn bản vào bộ nhớ tạm!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownloadWordDoc = () => {
    const text = getFullDocText();
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${activeDoc.title || 'Giao_An_Word'}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; margin: 2cm 2cm 2cm 2.5cm; }
        h1 { font-size: 18pt; text-align: center; text-transform: uppercase; }
        h2 { font-size: 14pt; font-weight: bold; margin-top: 14pt; text-transform: uppercase; }
        p { text-align: justify; margin: 4pt 0; text-indent: 1cm; }
        table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
        td, th { border: 1px solid #000; padding: 6pt; font-size: 13pt; vertical-align: top; }
        th { font-weight: bold; background-color: #f2f2f2; }
      </style>
      </head>
      <body>
        <h1>${activeDoc.title || 'KẾ HOẠCH BÀI DẠY MĨ THUẬT'}</h1>
        ${activeDoc.items?.map(it => {
          if (it.type === 'heading') return `<h2>${it.text}</h2>`;
          if (it.type === 'paragraph') return `<p>${it.text}</p>`;
          if (it.type === 'table') {
            return `<table>${it.rows.map((r, ri) => `<tr>${r.map(c => ri === 0 ? `<th>${c}</th>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
          }
          return '';
        }).join('')}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activeDoc.title || 'Ke_Hoach_Bai_Day_Mi_Thuat').replace(/\s+/g, '_')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải tệp Word (.doc) chuẩn phông Times New Roman thành công!', 'success');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100 overflow-hidden font-times-new-roman select-text">
      {/* Action Sub-Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-white shadow-xs select-none shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0">
            W
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-sm sm:max-w-md">
            {activeDoc.title || 'Soạn Thảo Kế Hoạch Bài Dạy (Word .docx)'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
            Chuẩn CV 2345/BGDĐT
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleSpeak}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/40 shadow-xs'
            }`}
            title="Nghe Cọ Nhí đọc to toàn bộ giáo án bằng giọng Nam Minh Neural"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Dừng Đọc' : 'Đọc Văn Bản'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Sao chép toàn bộ văn bản để dán vào Word máy tính"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã Sao Chép' : 'Sao Chép'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadWordDoc}
            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl border border-emerald-400/40 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Tải văn bản này về máy tính dưới định dạng Word (.doc)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải File Word</span>
          </button>

          {onUploadDocx && (
            <button
              type="button"
              onClick={onUploadDocx}
              className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-200 hover:to-yellow-200 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ring-1 ring-amber-400"
              title="Mở tệp Word (.docx) khác từ máy tính của Thầy/Cô"
            >
              <Upload className="w-3.5 h-3.5 text-amber-900" />
              <span>Mở File Word Khác</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Word Document Page (A4 Paper View) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/70">
        <div className="bg-white max-w-4xl w-full p-8 sm:p-14 shadow-2xl rounded-2xl border border-slate-300 min-h-full leading-relaxed text-slate-900 text-[15px] sm:text-[16px]">
          {/* Header Quốc hiệu / Tiêu ngữ */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-center gap-2 pb-6 border-b border-slate-200 mb-8 select-none">
            <div>
              <p className="font-bold uppercase text-xs tracking-wider text-slate-700">PHÒNG GIÁO DỤC VÀ ĐÀO TẠO</p>
              <p className="font-black text-sm uppercase text-slate-900">{activeDoc.school || 'TRƯỜNG TIỂU HỌC'}</p>
            </div>
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-slate-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold text-xs text-slate-700 italic">Độc lập - Tự do - Hạnh phúc</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-black text-center text-slate-900 mb-4 uppercase tracking-wide">
            {activeDoc.title || 'KẾ HOẠCH BÀI DẠY MĨ THUẬT'}
          </h1>
          <p className="text-center text-xs font-bold text-slate-600 mb-8 italic">
            {activeDoc.teacher || 'Môn: Mĩ thuật • Chương trình Giáo dục Phổ thông 2018 (Công văn 2345/BGDĐT)'}
          </p>

          {/* Document Content Items */}
          <div className="space-y-5">
            {activeDoc.items?.map((item, idx) => {
              if (item.type === 'heading') {
                return (
                  <h2 key={idx} className="text-base sm:text-lg font-black text-amber-900 mt-6 mb-2 uppercase tracking-wide border-l-4 border-amber-600 pl-2.5">
                    {item.text}
                  </h2>
                );
              }
              if (item.type === 'paragraph') {
                return (
                  <p key={idx} className={`text-slate-800 leading-relaxed text-justify ${item.isBold ? 'font-bold' : ''}`}>
                    {item.text}
                  </p>
                );
              }
              if (item.type === 'table') {
                return (
                  <div key={idx} className="my-5 overflow-x-auto border border-slate-300 rounded-xl shadow-xs">
                    <table className="w-full text-xs sm:text-sm text-left border-collapse">
                      <tbody>
                        {item.rows?.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx === 0 ? 'bg-amber-100/80 font-black text-amber-950 border-b-2 border-amber-300' : 'border-t border-slate-200 hover:bg-slate-50'}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-3 border-r border-slate-200 last:border-r-0 leading-normal align-top">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
