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
  Volume2,
  Save,
  ClipboardCheck,
  ChevronRight,
  ExternalLink,
  Users
} from 'lucide-react';
import { PEDAGOGY_BANK } from '../../data/pedagogyBank';
import { speechService } from '../../utils/speechService';
import { 
  calculateRubricLevel, 
  saveCameraEvaluationToSmas, 
  readSmasData, 
  DEFAULT_TEACHING_CLASSES 
} from '../../utils/smasEvaluationBridge.js';

export default function ArtCameraRubric({
  onInsertGradedArtworkToSlide,
  onNavigateToEditor,
  onNavigateToSmas
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);

  // Liên kết Lớp & Học sinh từ Sổ Điểm SMAS
  const [smasState, setSmasState] = useState(() => readSmasData());
  const [selectedClass, setSelectedClass] = useState(() => {
    const data = readSmasData();
    return data.className || '1A';
  });
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentName, setStudentName] = useState('Nguyễn Văn An');
  const [evaluationPeriod, setEvaluationPeriod] = useState('TX'); // 'TX' | 'GK' | 'CK'

  // Rubric Selection
  const [selectedGrade, setSelectedGrade] = useState(1);

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
  const [isCopied, setIsCopied] = useState(false);
  const [insertedNotice, setInsertedNotice] = useState(false);
  const [savedSmasNotice, setSavedSmasNotice] = useState('');

  // Mắt thần chiếu lưới bố cục 1/3 & Cảm biến bánh xe màu sắc (Giai đoạn nâng cấp AI)
  const [showGridOverlay, setShowGridOverlay] = useState(false);
  const [showColorSensor, setShowColorSensor] = useState(true);
  const [colorStats, setColorStats] = useState({ warmPercent: 48, coolPercent: 36, neutralPercent: 16, contrast: 72 });
  const [focalPoint, setFocalPoint] = useState({ x: 0.5, y: 0.45 });
  const [isFullscreenInspection, setIsFullscreenInspection] = useState(false);

  // Đọc lại dữ liệu SMAS khi có thay đổi từ tab khác hoặc cửa sổ khác
  useEffect(() => {
    const handleSmasUpdated = (e) => {
      if (e.detail) {
        setSmasState(e.detail);
      } else {
        setSmasState(readSmasData());
      }
    };
    window.addEventListener('conhi-smas-updated', handleSmasUpdated);
    return () => window.removeEventListener('conhi-smas-updated', handleSmasUpdated);
  }, []);

  // Danh sách các lớp khả dụng (kết hợp mặc định và từ dữ liệu SMAS)
  const availableClasses = Array.from(new Set([
    ...DEFAULT_TEACHING_CLASSES,
    ...(smasState.classOptions || []).map(c => String(c).replace(/^Lớp\s+/i, '').trim()),
    (smasState.className || '').replace(/^Lớp\s+/i, '').trim(),
    (selectedClass || '').replace(/^Lớp\s+/i, '').trim()
  ])).filter(Boolean);

  // Danh sách học sinh theo lớp đang chọn
  const studentsInSelectedClass = (smasState.students || []).filter(s => {
    const sClass = (s.className || '').replace(/^Lớp\s+/i, '').trim();
    const curClass = selectedClass.replace(/^Lớp\s+/i, '').trim();
    return sClass.toLowerCase() === curClass.toLowerCase();
  });

  // Tự động cập nhật tên học sinh khi chọn từ danh sách
  const handleSelectStudentFromList = (stId) => {
    setSelectedStudentId(stId);
    if (!stId) return;
    const found = studentsInSelectedClass.find(s => s.id === stId);
    if (found) {
      setStudentName(found.name);
      // Nếu học sinh đã có mức trước đó, gợi ý mức tương ứng
      if (found.level === 'T') {
        setRubricLevels({ requirement: 3, technique: 3, creativity: 3, presentation: 2 });
      } else if (found.level === 'C') {
        setRubricLevels({ requirement: 2, technique: 1, creativity: 1, presentation: 1 });
      } else {
        setRubricLevels({ requirement: 3, technique: 2, creativity: 2, presentation: 2 });
      }
    }
  };

  // Tính toán mức đạt chuẩn Thông tư 27 (T, H, C) và tổng điểm từ 4 tiêu chí Rubric
  const overallLevel = calculateRubricLevel(rubricLevels);
  const totalScore = Number(rubricLevels.requirement) + Number(rubricLevels.technique) + Number(rubricLevels.creativity) + Number(rubricLevels.presentation);

  // Lưu kết quả chấm tranh vào Sổ Điểm SMAS theo chuẩn T, H, C
  const handleSaveToSmas = () => {
    if (!studentName.trim()) {
      alert('Vui lòng nhập hoặc chọn tên học sinh trước khi lưu sổ điểm.');
      return;
    }

    const res = saveCameraEvaluationToSmas({
      studentId: selectedStudentId,
      studentName: studentName.trim(),
      className: selectedClass,
      level: overallLevel,
      comment: teacherComment,
      period: evaluationPeriod,
      rubricLevels,
      improvementSteps,
      artworkThumb: capturedImage || ''
    });

    if (res.success) {
      const periodLabel = evaluationPeriod === 'GK' ? 'Giữa kì' : evaluationPeriod === 'CK' ? 'Cuối kì' : 'Thường xuyên';
      setSavedSmasNotice(`✓ Đã lưu sổ SMAS: Em ${studentName} (${selectedClass}) đạt mức [${overallLevel}] - ${periodLabel}!`);
      // Cập nhật lại state local
      setSmasState(readSmasData());
      setTimeout(() => setSavedSmasNotice(''), 5000);
    }
  };

  // Phân tích cục bộ độ sáng/tông màu; mức rubric do giáo viên tự chọn.
  const handleAnalyzeArtwork = () => {
    if (!capturedImage) {
      alert('Vui lòng chụp bài vẽ hoặc chọn ảnh từ máy trước khi phân tích.');
      return;
    }

    setIsAnalyzing(true);
    setImprovementSteps([]);

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
        let warmPixels = 0, coolPixels = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          if (r > g + 20 && r > b + 20) warmPixels++;
          else if (b > r + 15 || g > r + 15) coolPixels++;
        }

        const toneSuggestion = warmPixels > coolPixels
          ? '1. Ảnh có nhiều điểm ảnh thiên ấm; có thể thêm một vài màu lạnh ở chi tiết phụ nếu phù hợp chủ đề.'
          : coolPixels > warmPixels
            ? '1. Ảnh có nhiều điểm ảnh thiên lạnh; có thể điểm thêm màu ấm ở chi tiết chính nếu phù hợp chủ đề.'
            : '1. Chưa thấy tông ấm hoặc lạnh chiếm ưu thế; hãy chọn màu theo chủ đề và ý tưởng của học sinh.';

        // Gợi ý chung dựa trên tông màu; không suy đoán yêu cầu bài, sáng tạo hay thuyết trình.
        const steps = [
          toneSuggestion,
          '2. Nhấn đậm thêm đường viền chu vi của hình vẽ chính để hình khối rõ ràng, dứt khoát.',
          '3. Tô kín màu đều tay, tránh để hở các đốm trắng li ti trên nền giấy.'
        ];
        setImprovementSteps(steps);
        setCameraError('');
      } catch (err) {
        console.warn('Lỗi phân tích canvas:', err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    img.onerror = () => {
      setCameraError('Không thể đọc ảnh bài vẽ để phân tích. Hãy thử chọn lại tệp ảnh.');
      setIsAnalyzing(false);
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
    setImprovementSteps([]);
    stopCamera();
    setCameraError('');
  };

  // Đồng bộ Stream vào thẻ Video khi Camera được kích hoạt
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.warn('Video autoPlay error:', err);
      });
    }
  }, [isCameraActive]);

  // Start Camera - Tương thích tối đa với Webcam Windows/Laptop & Camera thiết bị di động
  const startCamera = async () => {
    setCameraError('');
    try {
      // Dừng stream cũ nếu còn đang chạy
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ mediaDevices.getUserMedia. Vui lòng sử dụng Chrome, Edge hoặc Cốc Cốc.');
      }

      let stream = null;
      // 1. Thử camera sau (thích hợp chụp bài vẽ trên bàn) hoặc độ phân giải HD
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment'
          }
        });
      } catch (e1) {
        // 2. Thử độ phân giải chuẩn không giới hạn facingMode
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } }
          });
        } catch (e2) {
          // 3. Chế độ cơ bản nhất nếu webcam hạn chế constraint
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }

      if (stream) {
        streamRef.current = stream;
        setIsCameraActive(true);

        // Gán ngay nếu videoRef đã sẵn sàng trong DOM
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Lỗi mở camera:', err);
      let errMsg = 'Không thể mở Camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Trình duyệt chưa được cấp quyền truy cập Camera. Thầy/Cô vui lòng nhấp vào biểu tượng Ổ Khóa hoặc Camera trên thanh địa chỉ trình duyệt và chọn "Cho phép (Allow)" nhé!';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'Không tìm thấy Webcam trên máy tính này. Thầy/Cô có thể kết nối webcam rời hoặc bấm "Chọn Ảnh" để tải ảnh bài vẽ từ máy tính lên!';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errMsg = 'Webcam đang bị một ứng dụng khác (như Zoom, Zalo, Teams, Google Meet) sử dụng. Thầy/Cô vui lòng tắt các ứng dụng đó rồi thử mở lại nhé!';
      } else {
        errMsg = `Chưa mở được Camera (${err.message}). Thầy/Cô có thể bấm "Chọn Ảnh" hoặc kéo thả ảnh bài vẽ vào đây!`;
      }
      setCameraError(errMsg);
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
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
  const capturePhoto = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const v = videoRef.current;
    if (v.readyState < 2 || !v.videoWidth || !v.videoHeight) {
      setCameraError('Camera đang khởi động; chờ hình ảnh hiện rõ rồi chụp lại nhé.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 1280;
    canvas.height = v.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    setImprovementSteps([]);
    stopCamera();
    setCameraError('');
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
      setImprovementSteps([]);
      stopCamera();
      setCameraError('');
    };
    reader.onerror = () => setCameraError('Không đọc được tệp ảnh bài vẽ. Hãy thử chọn lại tệp.');
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

  // Tổng hợp bản nháp nhận xét từ rubric do giáo viên chọn.
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
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => {
                    videoRef.current?.play().catch(() => {});
                  }}
                />

                {/* Khung canh nét bài vẽ trực quan */}
                <div className="absolute inset-6 md:inset-8 border-2 border-white/50 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-5 h-5 border-t-4 border-l-4 border-rose-500"></span>
                    <span className="w-5 h-5 border-t-4 border-r-4 border-rose-500"></span>
                  </div>
                  <div className="text-center">
                    <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                      Đưa bài vẽ vào giữa khung hình
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-5 h-5 border-b-4 border-l-4 border-rose-500"></span>
                    <span className="w-5 h-5 border-b-4 border-r-4 border-rose-500"></span>
                  </div>
                </div>

                {/* Nút Chụp Ảnh Nổi Bật Trên Camera */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs md:text-sm rounded-full shadow-2xl flex items-center gap-2 transform active:scale-95 transition-all border-2 border-white cursor-pointer"
                  >
                    <Camera className="w-4 h-4 fill-white" />
                    <span>📸 CHỤP BÀI VẼ NÀY</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); stopCamera(); }}
                    className="px-3.5 py-2.5 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full border border-white/20 transition cursor-pointer"
                  >
                    Đóng Cam
                  </button>
                </div>
              </div>
            ) : capturedImage ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black/5">
                <img
                  src={capturedImage}
                  alt="Bài vẽ của học sinh"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCapturedImage(null);
                    setImprovementSteps([]);
                    startCamera();
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-black/75 hover:bg-black/90 text-white text-xs font-bold rounded-lg backdrop-blur flex items-center gap-1.5 shadow transition"
                  title="Chụp lại ảnh khác từ Camera"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Chụp lại</span>
                </button>
              </div>
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
          </div>
        </div>

        {/* Action below image */}
        {capturedImage && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
            {/* Phân tích màu cục bộ; rubric vẫn do giáo viên quyết định */}
            <button
              onClick={handleAnalyzeArtwork}
              disabled={isAnalyzing}
              className="w-full py-2.5 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <Sparkles className={`w-4 h-4 text-amber-200 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Đang phân tích tông màu...' : 'Phân tích màu & gợi ý cải thiện'}</span>
            </button>
            <p className="text-[11px] text-slate-500">
              Chỉ ước lượng tông màu từ điểm ảnh; công cụ không tự xác định đúng chủ đề, sự sáng tạo hay phần trình bày. Thầy/Cô chọn mức rubric theo bài thực tế.
            </p>

            {/* Gợi ý màu sắc để giáo viên xem lại */}
            {improvementSteps.length > 0 && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-950 animate-in fade-in">
                <span className="font-extrabold text-amber-900 block mb-1">💡 Gợi ý màu sắc để Thầy/Cô xem lại:</span>
                {improvementSteps.map((step, idx) => (
                  <div key={idx} className="leading-relaxed font-medium">{step}</div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setCapturedImage(null); setImprovementSteps([]); }}
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
        {/* Banner thông báo lưu Sổ SMAS */}
        {savedSmasNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl flex items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{savedSmasNotice}</span>
            </div>
            {onNavigateToSmas && (
              <button
                type="button"
                onClick={onNavigateToSmas}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shrink-0 flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <span>Xem Sổ SMAS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Khối Liên Kết Sổ Điểm SMAS & Thông Tin Học Sinh */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                <ClipboardCheck className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Liên Kết Sổ Điểm SMAS
              </h3>
            </div>
            {onNavigateToSmas && (
              <button
                type="button"
                onClick={onNavigateToSmas}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Mở Sổ Điểm SMAS</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* 1. Chọn Lớp */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Lớp học:
              </label>
              <select
                value={selectedClass.replace(/^Lớp\s+/i, '')}
                onChange={(e) => {
                  const newCls = e.target.value;
                  setSelectedClass(newCls);
                  setSelectedStudentId('');
                }}
                className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {availableClasses.map(c => (
                  <option key={c} value={c}>Lớp {c}</option>
                ))}
              </select>
            </div>

            {/* 2. Chọn Học sinh từ danh sách lớp hoặc nhập tay */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Chọn học sinh ({studentsInSelectedClass.length}):
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => handleSelectStudentFromList(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="">-- Chọn trong danh sách --</option>
                {studentsInSelectedClass.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.level || 'H'})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Kỳ đánh giá */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Kỳ đánh giá:
              </label>
              <select
                value={evaluationPeriod}
                onChange={(e) => setEvaluationPeriod(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold text-purple-900 bg-purple-50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="TX">Thường xuyên (TX)</option>
                <option value="GK">Giữa kì I (GK I)</option>
                <option value="CK">Cuối kì I (CK I)</option>
                <option value="GK2">Giữa kì II (GK II)</option>
                <option value="CK2">Cuối kì II (CK II)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Họ và tên học sinh đang chấm:
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                setSelectedStudentId('');
              }}
              placeholder="Nhập tên học sinh..."
              className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Huy Hiệu Mức Đạt Được TT27 (T, H, C) Thời Gian Thực */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Kết quả xếp loại TT27:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xs ${
                overallLevel === 'T'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : overallLevel === 'H'
                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                <span>{overallLevel === 'T' ? '🏆 Mức T' : overallLevel === 'H' ? '⭐ Mức H' : '📝 Mức C'}</span>
                <span>•</span>
                <span>{overallLevel === 'T' ? 'Hoàn Thành Tốt' : overallLevel === 'H' ? 'Hoàn Thành' : 'Chưa Hoàn Thành'}</span>
              </span>
            </div>

            <div className="text-[11px] font-bold text-slate-500">
              Tổng điểm Rubric: <span className="font-extrabold text-slate-800">{totalScore}/12</span>
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>✍️</span> Lời Nhận Xét Của Giáo Viên (Thầy/Cô Duyệt & Chỉnh Sửa)
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => speechService.speak(teacherComment)}
                className="px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                title="Đọc lời nhận xét này bằng giọng tiếng Việt"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đọc lời nhận xét</span>
              </button>

              <button
                type="button"
                onClick={handleCopyComment}
                className="px-2 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
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

          {/* Dải Nút Hành Động Liên Kết SMAS & Trình Chiếu (Zero-Placeholder) */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleSaveToSmas}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs md:text-sm rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
              title="Lưu mức xếp loại T/H/C và nhận xét trực tiếp vào danh sách lớp trong Sổ Điểm SMAS"
            >
              <Save className="w-4 h-4" />
              <span>LƯU ĐIỂM VÀO SỔ SMAS</span>
              <span className="px-1.5 py-0.5 rounded bg-white/20 text-[11px] font-black">
                {overallLevel}
              </span>
            </button>

            {onNavigateToSmas && (
              <button
                type="button"
                onClick={onNavigateToSmas}
                className="py-2.5 px-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Mở ngay giao diện Sổ Điểm SMAS để xem và quản lý"
              >
                <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                <span>Xem Sổ SMAS</span>
              </button>
            )}

            {capturedImage && (
              <button
                type="button"
                onClick={handleInsertToSlide}
                className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Chèn ảnh bài vẽ kèm điểm rubric lên slide bài giảng"
              >
                <Presentation className="w-4 h-4 text-slate-600" />
                <span>Chèn Vào Slide</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
