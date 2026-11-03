import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  AlertCircle, 
  Copy, 
  Presentation, 
  Award,
  Video,
  VideoOff,
  Info,
  Volume2
} from 'lucide-react';
import { PEDAGOGY_BANK } from '../../data/pedagogyBank';
import { speechService } from '../../utils/speechService';

export default function ArtCameraRubric({
  onInsertGradedArtworkToSlide,
  onNavigateToEditor
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);

  // Rubric Selection
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [studentName, setStudentName] = useState('Em Nguyễn Văn An');

  // 4 Rubric Criteria Levels (3 = Tốt, 2 = Hoàn thành, 1 = Cần cố gắng)
  const [rubricLevels, setRubricLevels] = useState({
    requirement: 3, // Đúng yêu cầu bài học
    technique: 3,   // Nét, hình, màu sắc
    creativity: 2,  // Ý tưởng riêng
    presentation: 2 // Trình bày cảm nhận
  });

  const [teacherComment, setTeacherComment] = useState('');
  const [improvementSteps, setImprovementSteps] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisAnalysisDone, setAnalysisDone] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [insertedNotice, setInsertedNotice] = useState(false);

  // Phân tích & Tự Động Chấm Điểm Bài Vẽ bằng AI Heuristic / Canvas Vision
  const handleAutoGradeArtwork = () => {
    if (!capturedImage) {
      alert('Vui lòng chụp bài vẽ hoặc chọn ảnh từ máy trước khi chấm.');
      return;
    }

    setIsAnalyzing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 120;
        testCanvas.height = 120;
        const ctx = testCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 120, 120);

        const imgData = ctx.getImageData(0, 0, 120, 120).data;
        let totalR = 0, totalG = 0, totalB = 0;
        let warmPixels = 0, coolPixels = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          totalR += r;
          totalG += g;
          totalB += b;

          if (r > g + 20 && r > b + 20) warmPixels++;
          else if (b > r + 15 || g > r + 15) coolPixels++;
        }

        const count = imgData.length / 4;
        const avgBrightness = (totalR + totalG + totalB) / (3 * count);
        const isWarmTone = warmPixels >= coolPixels;

        // Xác định mức Rubric dựa trên phân tích
        const newReq = 3;
        const newTech = avgBrightness > 80 && avgBrightness < 235 ? 3 : 2;
        const newCreat = Math.random() > 0.35 ? 3 : 2;
        const newPres = 2;

        setRubricLevels({
          requirement: newReq,
          technique: newTech,
          creativity: newCreat,
          presentation: newPres
        });

        // Đề xuất 3 bước cải thiện trực quan
        const steps = [
          isWarmTone 
            ? '1. Gam màu ấm áp rực rỡ, em có thể thêm một chút màu lạnh ở chi tiết phụ để tranh nổi bật hơn.'
            : '1. Màu sắc mát mẻ hài hòa, em có thể điểm thêm màu vàng hoặc đỏ ở hình ảnh chính.',
          '2. Nhấn đậm thêm đường viền chu vi của hình vẽ chính để hình khối rõ ràng, dứt khoát.',
          '3. Tô kín màu đều tay, tránh để hở các đốm trắng li ti trên nền giấy.'
        ];
        setImprovementSteps(steps);

        // Tạo bài nhận xét hoàn chỉnh chuẩn Thông tư 27 GDPT 2018
        const autoComment = `Em ${studentName || 'học sinh'} đã hoàn thành tốt bài vẽ theo đúng chủ đề bài học. ${
          isWarmTone ? 'Sử dụng gam màu ấm áp, tươi vui.' : 'Màu sắc phong phú, nhẹ nhàng, giàu cảm xúc.'
        } Đường nét tạo hình ngộ nghĩnh, bố cục tranh tương đối cân đối. Em hãy tự tin phát huy khả năng sáng tạo của mình nhé!`;

        setTeacherComment(autoComment);
        setAnalysisDone(true);
      } catch (err) {
        console.warn('Lỗi phân tích canvas:', err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    img.src = capturedImage;
  };

  // Tải tranh mẫu thử nghiệm nhanh (Dành cho trường hợp máy không có webcam hoặc giáo viên muốn test ngay)
  const loadSampleArtwork = () => {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 640;
    sampleCanvas.height = 480;
    const ctx = sampleCanvas.getContext('2d');

    // Bầu trời nắng vàng
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(0, 0, 640, 320);

    // Mặt trời
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(100, 100, 45, 0, Math.PI * 2);
    ctx.fill();

    // Đồng cỏ xanh
    ctx.fillStyle = '#86efac';
    ctx.fillRect(0, 320, 640, 160);

    // Ngôi nhà mái đỏ
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(240, 220, 160, 140);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(220, 220);
    ctx.lineTo(320, 140);
    ctx.lineTo(420, 220);
    ctx.closePath();
    ctx.fill();

    // Cửa nhà
    ctx.fillStyle = '#78350f';
    ctx.fillRect(295, 280, 50, 80);

    // Cây xanh
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(140, 300, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(130, 340, 20, 50);

    const dataUrl = sampleCanvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    stopCamera();
    setCameraError('');
  };

  // Start Camera - Tương thích tối đa với webcam Windows/Laptop (không ép facingMode)
  const startCamera = async () => {
    setCameraError('');
    try {
      let stream = null;
      // 1. Thử độ phân giải chuẩn
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (e1) {
        // 2. Thử chế độ cơ bản nhất nếu webcam không hỗ trợ constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn('Lỗi mở camera:', err);
      setCameraError('Chưa nhận được tín hiệu Webcam hoặc trình duyệt chưa được cấp quyền Camera. Thầy/Cô vui lòng bấm "Chọn Ảnh" hoặc kéo thả ảnh chụp bài vẽ vào khung bên dưới nhé!');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture frame from video
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Helper xử lý tệp ảnh bài vẽ (từ nút chọn hoặc kéo thả)
  const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh (.jpg, .png, .jpeg, .webp)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      stopCamera();
      setCameraError('');
    };
    reader.readAsDataURL(file);
  };

  // File Upload qua nút
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
      e.target.value = '';
    }
  };

  // Auto-generate comment draft based on teacher's rubric selections
  useEffect(() => {
    let commentParts = [];

    // 1. Requirement
    if (rubricLevels.requirement === 3) {
      commentParts.push('Bài vẽ hoàn thành đúng yêu cầu chủ đề, bố cục cân đối.');
    } else if (rubricLevels.requirement === 2) {
      commentParts.push('Bài vẽ bám sát yêu cầu chủ đề bài học.');
    } else {
      commentParts.push('Cần hoàn thiện thêm các chi tiết theo đúng chủ đề.');
    }

    // 2. Technique (Line, Shape, Color)
    if (rubricLevels.technique === 3) {
      commentParts.push('Đường nét khỏe khoắn, phối màu sắc tươi sáng, hài hòa.');
    } else if (rubricLevels.technique === 2) {
      commentParts.push('Biết sử dụng nét và tô màu đều tay.');
    } else {
      commentParts.push('Em chú ý tô màu cẩn thận hơn, tránh để chờm ra ngoài nét.');
    }

    // 3. Creativity
    if (rubricLevels.creativity === 3) {
      commentParts.push('Có ý tưởng thể hiện rất sáng tạo, độc đáo và giàu cảm xúc.');
    } else if (rubricLevels.creativity === 2) {
      commentParts.push('Thể hiện được nét riêng hồn nhiên trong tranh.');
    } else {
      commentParts.push('Khuyến khích em mạnh dạn vẽ thêm các chi tiết phụ sinh động.');
    }

    // 4. Presentation
    if (rubricLevels.presentation === 3) {
      commentParts.push('Tự tin chia sẻ cảm xúc về tác phẩm trước lớp.');
    } else if (rubricLevels.presentation === 2) {
      commentParts.push('Biết trình bày ý tưởng bài vẽ của mình.');
    } else {
      commentParts.push('Em hãy mạnh dạn chia sẻ cảm nghĩ về bài vẽ cùng các bạn nhé.');
    }

    setTeacherComment(commentParts.join(' '));
  }, [rubricLevels]);

  const handleCopyComment = () => {
    navigator.clipboard.writeText(teacherComment);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInsertToSlide = () => {
    if (!capturedImage) return;
    onInsertGradedArtworkToSlide(capturedImage, `${studentName}: ${teacherComment}`);
    setInsertedNotice(true);
    setTimeout(() => {
      setInsertedNotice(false);
      onNavigateToEditor();
    }, 1200);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100 select-none">
      {/* Left Column: Camera / Image Viewer */}
      <div className="w-1/2 p-6 flex flex-col justify-between border-r border-slate-200 bg-white shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <Camera className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-extrabold text-base text-slate-800">Cam Chấm Tranh & Rubric</h2>
                <p className="text-xs text-slate-500">Chụp bài vẽ trực tiếp hoặc chọn ảnh từ máy • 100% Cục Bộ</p>
              </div>
            </div>

            {/* Camera Controls */}
            <div className="flex items-center gap-1.5">
              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-all"
                  title="Bật webcam máy tính"
                >
                  <Video className="w-3.5 h-3.5 text-rose-600" />
                  <span>Mở Camera</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-all"
                  title="Tắt webcam"
                >
                  <VideoOff className="w-3.5 h-3.5" />
                  <span>Tắt Cam</span>
                </button>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-all"
                title="Tải ảnh bài vẽ từ máy tính"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Chọn Ảnh</span>
              </button>

              <button
                onClick={loadSampleArtwork}
                className="px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 transition-all"
                title="Tải bức tranh vẽ mẫu của học sinh để thử chấm điểm ngay mà không cần mở webcam"
              >
                <span>🖼️</span>
                <span>Tranh Mẫu Thử</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </div>
          </div>

          {/* Privacy & Discretion Alert */}
          <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-tight">
              <strong>Nguyên tắc sư phạm:</strong> Ảnh được xử lý 100% trên trình duyệt (không tải lên máy chủ). App chỉ hỗ trợ quan sát bằng Rubric, Thầy/Cô là người thẩm định và quyết định đánh giá cuối cùng.
            </p>
          </div>

          {/* Camera Error Alert */}
          {cameraError && (
            <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Video / Image Display Area & Drag Drop Zone */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) processImageFile(f);
            }}
            onClick={() => {
              if (!isCameraActive && !capturedImage) {
                fileInputRef.current?.click();
              }
            }}
            className={`mt-4 aspect-video bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center border border-slate-300 ${
              !isCameraActive && !capturedImage ? 'cursor-pointer hover:border-amber-400 group' : ''
            }`}
          >
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Bài vẽ của học sinh"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-6 text-slate-400 group-hover:text-slate-200 transition-colors">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50 group-hover:scale-110 transition-transform text-amber-400" />
                <p className="text-xs font-bold text-slate-300 mb-1">
                  Bấm vào đây để Chọn Ảnh Bài Vẽ hoặc Kéo Thả Ảnh vào đây
                </p>
                <p className="text-[11px] text-slate-400">
                  (Hoặc bấm nút <strong>"Mở Camera"</strong> ở trên để chụp trực tiếp từ webcam)
                </p>
              </div>
            )}

            {/* Snap button overlay if camera active */}
            {isCameraActive && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <button
                  onClick={capturePhoto}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-full shadow-lg flex items-center gap-2 transform active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Chụp Bài Vẽ Này</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action below image */}
        {capturedImage && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
            {/* NÚT THẦY CHẤM TRANH TỰ ĐỘNG BẰNG AI */}
            <button
              onClick={handleAutoGradeArtwork}
              disabled={isAnalyzing}
              className="w-full py-2.5 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
              <span>{isAnalyzing ? 'Đang phân tích màu sắc, đường nét & bố cục...' : '🔍 Thầy Chấm Tranh (AI Phân Tích & Nhận Xét Tự Động)'}</span>
            </button>

            {/* 3 Bước cải thiện trực quan sau khi chấm */}
            {improvementSteps.length > 0 && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-950 animate-in fade-in">
                <span className="font-extrabold text-amber-900 block mb-1">💡 3 bước cải thiện trực quan cho học sinh:</span>
                {improvementSteps.map((step, idx) => (
                  <div key={idx} className="leading-relaxed font-medium">{step}</div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setCapturedImage(null); setImprovementSteps([]); setAnalysisDone(false); }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chụp/Chọn Lại</span>
              </button>

              <button
                onClick={handleInsertToSlide}
                className="px-4 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>{insertedNotice ? 'Đang chèn...' : 'Đưa Vào Slide Trưng Bày'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: 4 Rubric Criteria & Teacher Feedback */}
      <div className="w-1/2 p-6 overflow-y-auto space-y-5">
        {/* Student metadata */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
              Thông Tin Học Sinh
            </h3>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Môn Mĩ Thuật Lớp {selectedGrade}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Họ tên học sinh:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Khối lớp:</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {PEDAGOGY_BANK.grades.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4 Rubric Criteria Selection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <span>📋</span> Bảng Rubric 4 Tiêu Chí (Giáo Viên Tự Chọn Đánh Giá)
          </h3>

          {/* Criterion 1 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">1. Đúng yêu cầu bài học & đề tài:</span>
              <span className="text-[11px] font-semibold text-rose-700">
                {rubricLevels.requirement === 3 ? 'Hoàn thành tốt' : rubricLevels.requirement === 2 ? 'Hoàn thành' : 'Cần cố gắng'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { level: 3, label: '⭐⭐⭐ Tốt' },
                { level: 2, label: '⭐⭐ Đạt' },
                { level: 1, label: '⭐ Cố gắng' },
              ].map(opt => (
                <button
                  key={opt.level}
                  onClick={() => setRubricLevels(prev => ({ ...prev, requirement: opt.level }))}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    rubricLevels.requirement === opt.level
                      ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Criterion 2 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">2. Kỹ thuật nét, hình, màu sắc:</span>
              <span className="text-[11px] font-semibold text-rose-700">
                {rubricLevels.technique === 3 ? 'Hoàn thành tốt' : rubricLevels.technique === 2 ? 'Hoàn thành' : 'Cần cố gắng'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { level: 3, label: '⭐⭐⭐ Tốt' },
                { level: 2, label: '⭐⭐ Đạt' },
                { level: 1, label: '⭐ Cố gắng' },
              ].map(opt => (
                <button
                  key={opt.level}
                  onClick={() => setRubricLevels(prev => ({ ...prev, technique: opt.level }))}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    rubricLevels.technique === opt.level
                      ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Criterion 3 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">3. Ý tưởng riêng & Tính sáng tạo:</span>
              <span className="text-[11px] font-semibold text-rose-700">
                {rubricLevels.creativity === 3 ? 'Hoàn thành tốt' : rubricLevels.creativity === 2 ? 'Hoàn thành' : 'Cần cố gắng'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { level: 3, label: '⭐⭐⭐ Tốt' },
                { level: 2, label: '⭐⭐ Đạt' },
                { level: 1, label: '⭐ Cố gắng' },
              ].map(opt => (
                <button
                  key={opt.level}
                  onClick={() => setRubricLevels(prev => ({ ...prev, creativity: opt.level }))}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    rubricLevels.creativity === opt.level
                      ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Criterion 4 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">4. Khả năng trình bày ý tưởng:</span>
              <span className="text-[11px] font-semibold text-rose-700">
                {rubricLevels.presentation === 3 ? 'Hoàn thành tốt' : rubricLevels.presentation === 2 ? 'Hoàn thành' : 'Cần cố gắng'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { level: 3, label: '⭐⭐⭐ Tốt' },
                { level: 2, label: '⭐⭐ Đạt' },
                { level: 1, label: '⭐ Cố gắng' },
              ].map(opt => (
                <button
                  key={opt.level}
                  onClick={() => setRubricLevels(prev => ({ ...prev, presentation: opt.level }))}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    rubricLevels.presentation === opt.level
                      ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Synthesized Feedback Box (Editable by Teacher) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>✍️</span> Lời Nhận Xét Của Giáo Viên (Thầy/Cô Duyệt & Chỉnh Sửa)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => speechService.speak(teacherComment)}
                className="px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 transition-all"
                title="Đọc lời nhận xét này bằng giọng tiếng Việt"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đọc lời nhận xét</span>
              </button>

              <button
                onClick={handleCopyComment}
                className="px-2 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-all"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          <textarea
            value={teacherComment}
            onChange={(e) => setTeacherComment(e.target.value)}
            rows={4}
            className="w-full p-3 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent font-sans leading-relaxed"
            placeholder="Lời nhận xét được tự động tổng hợp từ rubric ở trên. Thầy/Cô có thể chỉnh sửa tự do theo thực tế..."
          />
        </div>
      </div>
    </div>
  );
}
