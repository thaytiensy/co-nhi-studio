import React, { useState, useRef } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  PlusCircle, 
  BookOpen, 
  Check, 
  Copy, 
  Presentation, 
  Palette, 
  Clock, 
  Layers, 
  HelpCircle,
  Award,
  Info,
  Download,
  RotateCcw,
  Image as ImageIcon,
  Loader2,
  Upload,
  Trash2
} from 'lucide-react';
import { PEDAGOGY_BANK } from '../../data/pedagogyBank';
import { generateProceduralArtwork } from '../../utils/artRenderer';

const MATERIALS = [
  { id: 'crayon', name: 'Sáp màu / Chì màu', icon: '🖍️' },
  { id: 'watercolor', name: 'Màu nước / Màu dạ', icon: '🎨' },
  { id: 'paper', name: 'Giấy màu xé dán / Thủ công', icon: '✂️' },
  { id: 'clay', name: 'Đất nặn tạo khối', icon: '🏺' },
  { id: 'recycled', name: 'Vật liệu tái chế (lá cây, vỏ hộp, nắp chai)', icon: '📦' },
];

const DURATIONS = [
  { id: 35, name: '1 tiết (35 phút)', desc: 'Tập trung khám phá và thực hành cơ bản' },
  { id: 70, name: '2 tiết (70 phút)', desc: 'Thực hành nâng cao, trưng bày và đánh giá chi tiết' },
];

export default function IdeaWorkshop({
  onGenerateSlidesFromIdea,
  onInsertDrawingToSlide,
  onNavigateToEditor
}) {
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedThemeId, setSelectedThemeId] = useState(PEDAGOGY_BANK.themes[1][0].id);
  const [customIdeaInput, setCustomIdeaInput] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('crayon');
  const [selectedDuration, setSelectedDuration] = useState(35);

  const [ideaResult, setIdeaResult] = useState(null);
  const [generatedArtworkUrl, setGeneratedArtworkUrl] = useState('');
  const [artworkGallery, setArtworkGallery] = useState([]);
  const [activeArtworkIndex, setActiveArtworkIndex] = useState(0);
  const [artworkSeed, setArtworkSeed] = useState(100);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [insertSuccessNotice, setInsertSuccessNotice] = useState(false);

  // Ảnh do người dùng tải lên từ máy tính cho ý tưởng
  const [uploadedIdeaImage, setUploadedIdeaImage] = useState(null);
  const fileInputIdeaRef = useRef(null);

  const themesForGrade = PEDAGOGY_BANK.themes[selectedGrade] || [];
  const currentTheme = themesForGrade.find(t => t.id === selectedThemeId) || themesForGrade[0];

  // Từ điển ánh xạ từ khóa mĩ thuật tiếng Việt sang mô tả tiếng Anh cho AI vẽ tranh
  const translateVietnameseArtTopic = (vnText) => {
    const lower = (vnText || '').toLowerCase();
    const keywords = [];

    if (lower.includes('cá heo')) keywords.push('playful dolphins jumping over blue ocean waves');
    else if (lower.includes('cá') || lower.includes('thủy cung')) keywords.push('colorful swimming fish in vibrant coral reef');
    if (lower.includes('mèo')) keywords.push('cute fluffy kitten playing with colorful yarn ball');
    if (lower.includes('chó') || lower.includes('cún')) keywords.push('happy friendly puppy playing in green grassy yard');
    if (lower.includes('chim') || lower.includes('bồ câu')) keywords.push('singing birds resting on blooming flower tree branches');
    if (lower.includes('gà')) keywords.push('mother hen with adorable tiny yellow chicks');
    if (lower.includes('voi')) keywords.push('kind elephant in jungle');
    if (lower.includes('hoa') || lower.includes('sen') || lower.includes('hướng dương')) keywords.push('sunflowers and lotus in bright sunny garden');
    if (lower.includes('cây') || lower.includes('rừng')) keywords.push('lush green ancient trees with falling autumn leaves');
    if (lower.includes('trường') || lower.includes('lớp')) keywords.push('cheerful elementary school building with flying red flag and green schoolyard');
    if (lower.includes('nhà') || lower.includes('phố')) keywords.push('charming countryside village cottage with red tile roof');
    if (lower.includes('biển') || lower.includes('thuyền')) keywords.push('wooden fishing sailboat sailing on blue calm sea at sunrise');
    if (lower.includes('gia đình') || lower.includes('mẹ') || lower.includes('bố')) keywords.push('happy loving family holding hands smiling together');
    if (lower.includes('bạn bè') || lower.includes('vui chơi')) keywords.push('happy school children playing folk games outdoors');
    if (lower.includes('mặt trời') || lower.includes('bình minh') || lower.includes('hoàng hôn')) keywords.push('smiling warm golden sun glowing in morning sky');
    if (lower.includes('trăng') || lower.includes('sao') || lower.includes('đêm')) keywords.push('bright crescent moon and sparkling stars in night sky');
    if (lower.includes('trái cây') || lower.includes('hoa quả')) keywords.push('basket of sweet tropical fruits watermelon apple banana');
    if (lower.includes('xe') || lower.includes('giao thông')) keywords.push('traffic safety with cars bicycles and smiling traffic light');
    if (lower.includes('lễ hội') || lower.includes('tết') || lower.includes('trung thu')) keywords.push('traditional mid-autumn festival with glowing star lanterns');

    if (keywords.length > 0) {
      return keywords.join(', ');
    }
    return vnText || 'creative art lesson';
  };

  const formatCapitalized = (text) => {
    if (!text) return '';
    const t = text.trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  // Helper tạo URL tranh minh họa mĩ thuật tỉ lệ 16:9 siêu tốc (0s, tạo liên tục không giới hạn, không bao giờ bị nghẽn 45s)
  const createArtUrl = (topicText, seed, styleKey = 'crayon') => {
    const cleanTopic = (topicText || '').replace(/^Chủ đề \d+:\s*/i, '').trim();
    // 1. Luôn ưu tiên bộ sinh tranh mẫu Procedural mĩ thuật tiểu học chuẩn SGK Kết nối tri thức (100% Cục bộ Offline, 0s)
    try {
      const dataUrl = generateProceduralArtwork(cleanTopic, seed, styleKey);
      if (dataUrl) return dataUrl;
    } catch (_) {}

    // 2. Dự phòng Pollinations siêu tốc nếu có
    const mappedSubject = translateVietnameseArtTopic(cleanTopic);
    let styleDetail = 'colorful wax crayon and vibrant gouache watercolor, cheerful primary school art';
    if (styleKey === 'watercolor') {
      styleDetail = 'soft transparent watercolor wash on textured paper, light pastel colors, gentle primary art';
    } else if (styleKey === 'paper-cut') {
      styleDetail = 'paper collage cut-out art, layered colorful paper shapes, wholesome handicraft art';
    } else if (styleKey === 'colored-pencil') {
      styleDetail = 'vibrant colored pencil sketch, clean contours, innocent elementary school doodle';
    } else if (styleKey === 'clay') {
      styleDetail = 'cute colorful modeling clay sculpture, plasticine art craft, bright 3D look';
    }

    const prompt = `adorable elementary art lesson demonstration, primary school student artwork, ${styleDetail}, ${mappedSubject}, expressive cheerful brushstrokes, bright sunny colors, joyful wholesome classroom style, clear outline, masterpiece, highly detailed`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=450&seed=${seed}&nologo=true&model=turbo`;
  };

  const handleUploadIdeaImage = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedIdeaImage(event.target.result);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleGenerateIdea = () => {
    if (!currentTheme && !customIdeaInput.trim()) return;

    const materialObj = MATERIALS.find(m => m.id === selectedMaterial);
    const durationObj = DURATIONS.find(d => d.id === selectedDuration);

    const rawTitle = customIdeaInput.trim() 
      ? customIdeaInput.trim() 
      : currentTheme.title.replace(/^Chủ đề \d+:\s*/, '');
    const baseTitle = formatCapitalized(rawTitle);
    const lessonTitle = `${baseTitle} cùng ${materialObj.name}`;

    setIsImageLoading(true);

    // Tự động sinh ngay bộ 4 phong cách tranh khác nhau siêu tốc
    const STYLES = [
      { key: 'crayon', name: 'Sáp Màu Rực Rỡ' },
      { key: 'watercolor', name: 'Màu Nước Trong Trẻo' },
      { key: 'paper-cut', name: 'Xé Dán Giấy Màu' },
      { key: 'colored-pencil', name: 'Chì Màu Tươi Sáng' }
    ];

    const initialGallery = STYLES.map((st, i) => {
      const s = Math.floor(Math.random() * 900000) + (i + 1) * 333;
      return {
        id: `art-${Date.now()}-${i}`,
        url: createArtUrl(baseTitle, s, st.key),
        seed: s,
        styleName: st.name,
        styleKey: st.key,
        title: baseTitle
      };
    });

    setArtworkGallery(initialGallery);
    setActiveArtworkIndex(0);
    setGeneratedArtworkUrl(initialGallery[0].url);

    const newIdea = {
      id: 'idea-' + Date.now(),
      grade: selectedGrade,
      themeTitle: baseTitle,
      material: materialObj.name,
      duration: durationObj.name,
      lessonTitle,
      artworkUrl: uploadedIdeaImage || initialGallery[0].url,
      objectives: currentTheme ? currentTheme.objectives : {
        knowledge: `Nhận biết đặc điểm, hình dáng và màu sắc của ${baseTitle}.`,
        skills: `Biết vẽ phác hình, sử dụng ${materialObj.name} tạo hình sinh động.`,
        qualities: 'Nuôi dưỡng tình cảm yêu thiên nhiên, gia đình và cuộc sống.'
      },
      materialsNeeded: {
        teacher: `Tranh mẫu minh họa ${baseTitle}, ${materialObj.name}, giấy vẽ A3/A4.`,
        student: `${materialObj.name}, giấy vẽ A4, khăn lau tay, bút chì, tẩy.`
      },
      teachingProcess: [
        {
          step: 1,
          name: '1. Khởi Động & Khám Phá (5-7 phút)',
          activity: currentTheme ? currentTheme.warmup : `Đố vui về ${baseTitle} để kích thích sự hào hứng cho học sinh.`,
          teacherNote: currentTheme ? currentTheme.teacherScript : `Thầy/Cô dẫn dắt học sinh quan sát các hình ảnh liên quan đến ${baseTitle}.`
        },
        {
          step: 2,
          name: '2. Kiến Tạo Kiến Thức Mới & Thị Phạm (8-10 phút)',
          activity: `Thầy/Cô hướng dẫn học sinh quan sát mẫu tranh và thị phạm thao tác cơ bản với ${materialObj.name}.`,
          fourSteps: currentTheme ? currentTheme.fourSteps : [
            `Bước 1: Phác khung hình học cơ bản của ${baseTitle}`,
            'Bước 2: Vẽ các chi tiết chính',
            'Bước 3: Vẽ thêm cảnh vật trang trí phụ',
            'Bước 4: Lên màu tươi sáng, đều tay'
          ]
        },
        {
          step: 3,
          name: `3. Luyện Tập & Sáng Tạo (${selectedDuration === 35 ? '15' : '35'} phút)`,
          activity: `Học sinh tự do thực hành sáng tạo tác phẩm cá nhân hoặc theo nhóm với ${materialObj.name}. Giáo viên quan sát, khích lệ và trợ giúp các em còn lúng túng.`,
          guidingQuestions: currentTheme ? currentTheme.questions : [
            `Em sẽ chọn vẽ ${baseTitle} với sắc màu gì?`,
            'Em có muốn vẽ thêm cảnh vật phụ nào xung quanh không?'
          ]
        },
        {
          step: 4,
          name: '4. Trưng Bày, Nhận Xét & Đánh Giá (7-10 phút)',
          activity: 'Trưng bày tác phẩm lên góc mĩ thuật. Học sinh tự nhận xét bài của mình và chia sẻ cảm nhận về bài của bạn.',
          rubricNote: 'Đánh giá theo 4 tiêu chí: Đề tài, Kĩ năng tạo hình, Sáng tạo riêng và Khả năng diễn đạt.'
        }
      ],
      rubricCriteria: [
        'Tiêu chí 1: Thực hiện đúng chủ đề bài học và hoàn thành sản phẩm.',
        `Tiêu chí 2: Sử dụng thành thạo ${materialObj.name}, nét vẽ/hình khối rõ ràng.`,
        'Tiêu chí 3: Có ý tưởng sáng tạo, thể hiện cảm xúc hồn nhiên.',
        'Tiêu chí 4: Tự tin giới thiệu và chia sẻ cảm xúc về bài vẽ trước lớp.'
      ]
    };

    setIdeaResult(newIdea);
  };

  // Tạo thêm ảnh mới liên tục, tức thì 0 giây, không giới hạn số lượng ảnh
  const handleGenerateMoreArtwork = (count = 1) => {
    const rawTitle = ideaResult 
      ? ideaResult.themeTitle 
      : (customIdeaInput.trim() || (currentTheme ? currentTheme.title.replace(/^Chủ đề \d+:\s*/, '') : ''));
    if (!rawTitle) return;
    const baseTitle = formatCapitalized(rawTitle);

    setIsImageLoading(true);
    const STYLES = [
      { key: 'crayon', name: 'Sáp Màu Rực Rỡ' },
      { key: 'watercolor', name: 'Màu Nước Trong Trẻo' },
      { key: 'paper-cut', name: 'Xé Dán Giấy Màu' },
      { key: 'colored-pencil', name: 'Chì Màu Tươi Sáng' },
      { key: 'clay', name: 'Đất Nặn Tạo Hình' }
    ];

    const newItems = [];
    const currentTotal = artworkGallery.length;

    for (let i = 0; i < count; i++) {
      const st = STYLES[(currentTotal + i) % STYLES.length];
      const s = Math.floor(Math.random() * 999999);
      newItems.push({
        id: `art-${Date.now()}-${i}-${s}`,
        url: createArtUrl(baseTitle, s, st.key),
        seed: s,
        styleName: st.name,
        styleKey: st.key,
        title: baseTitle
      });
    }

    setArtworkGallery(prev => [...prev, ...newItems]);
    setActiveArtworkIndex(currentTotal);
    setGeneratedArtworkUrl(newItems[0].url);
    if (ideaResult) {
      setIdeaResult(prev => ({ ...prev, artworkUrl: newItems[0].url }));
    }
  };

  // Chọn tranh trong thư viện tranh đã sinh
  const handleSelectArtwork = (idx) => {
    if (idx >= 0 && idx < artworkGallery.length) {
      setActiveArtworkIndex(idx);
      const chosen = artworkGallery[idx];
      setGeneratedArtworkUrl(chosen.url);
      if (ideaResult) {
        setIdeaResult(prev => ({ ...prev, artworkUrl: chosen.url }));
      }
    }
  };

  const handleRegenerateArtworkOnly = () => {
    handleGenerateMoreArtwork(1);
  };

  const handleInsertArtworkToCurrentSlide = (imageUrlToInsert) => {
    const url = imageUrlToInsert || generatedArtworkUrl || uploadedIdeaImage;
    if (!url || !onInsertDrawingToSlide) return;
    onInsertDrawingToSlide(url);
    setInsertSuccessNotice(true);
    setTimeout(() => setInsertSuccessNotice(false), 3000);
  };

  const handleCopyToClipboard = () => {
    if (!ideaResult) return;
    const text = `KẾ HOẠCH BÀI DẠY MĨ THUẬT: ${ideaResult.lessonTitle}\n` +
                 `Khối lớp: Lớp ${ideaResult.grade} • Thời lượng: ${ideaResult.duration}\n` +
                 `Vật liệu: ${ideaResult.material}\n\n` +
                 `I. MỤC TIÊU BÀI HỌC (GDPT 2018 - Kết nối tri thức):\n` +
                 `- Kiến thức: ${ideaResult.objectives.knowledge}\n` +
                 `- Kĩ năng: ${ideaResult.objectives.skills}\n` +
                 `- Phẩm chất: ${ideaResult.objectives.qualities}\n\n` +
                 `II. ĐỒ DÙNG DẠY HỌC:\n` +
                 `- Giáo viên: ${ideaResult.materialsNeeded.teacher}\n` +
                 `- Học sinh: ${ideaResult.materialsNeeded.student}\n\n` +
                 `III. TIẾN TRÌNH DẠY HỌC:\n` +
                 ideaResult.teachingProcess.map(p => `${p.name}\n- Hoạt động: ${p.activity}`).join('\n\n');

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCreateSlides = () => {
    if (!ideaResult) return;
    onGenerateSlidesFromIdea(ideaResult);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onNavigateToEditor();
    }, 1200);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100 select-none">
      {/* Left Input Configuration Column */}
      <div className="w-96 bg-white border-r border-slate-200 p-5 overflow-y-auto flex flex-col justify-between shadow-xs">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Lightbulb className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-extrabold text-base text-slate-800">Xưởng Ý Tưởng Mĩ Thuật</h2>
                <p className="text-xs text-slate-500">Thiết kế bài dạy mĩ thuật tiểu học chuẩn GDPT 2018</p>
              </div>
            </div>
            {/* Offline disclosure badge */}
            <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 leading-tight">
                Hoạt động 100% bằng ngân hàng dữ liệu sư phạm cục bộ, không dùng AI trực tuyến hay API mạng tính phí.
              </p>
            </div>
          </div>

          {/* 1. Select Grade */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              1. Khối Lớp:
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PEDAGOGY_BANK.grades.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGrade(g.id);
                    const newThemes = PEDAGOGY_BANK.themes[g.id] || [];
                    if (newThemes.length > 0) setSelectedThemeId(newThemes[0].id);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    selectedGrade === g.id
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Lớp {g.id}
                </button>
              ))}
            </div>
          </div>

          {/* Nhập Ý Tưởng Riêng Của Thầy/Cô */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              2. Nhập Ý Tưởng Riêng (Tự Do):
            </label>
            <input
              type="text"
              value={customIdeaInput}
              onChange={(e) => setCustomIdeaInput(e.target.value)}
              placeholder="Ví dụ: Vẽ chú cá heo nhào lộn trên sóng biển..."
              className="w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              (Thầy/Cô có thể tự gõ ý tưởng hoặc chọn theo chủ đề SGK bên dưới)
            </span>
          </div>

          {/* 3. Select Theme */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              3. Chủ Đề Bài Học (Sách Kết Nối Tri Thức):
            </label>
            <select
              value={selectedThemeId}
              onChange={(e) => setSelectedThemeId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {themesForGrade.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          {/* 4. Select Material */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              4. Chất Liệu & Vật Liệu Sử Dụng:
            </label>
            <div className="space-y-1.5">
              {MATERIALS.map(mat => (
                <button
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat.id)}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border flex items-center justify-between transition-all ${
                    selectedMaterial === mat.id
                      ? 'bg-amber-50 text-amber-900 border-amber-400 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{mat.icon}</span>
                    <span>{mat.name}</span>
                  </span>
                  {selectedMaterial === mat.id && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Select Duration */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              4. Thời Lượng Tiết Dạy:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATIONS.map(dur => (
                <button
                  key={dur.id}
                  onClick={() => setSelectedDuration(dur.id)}
                  className={`p-2.5 text-xs rounded-xl border text-left transition-all ${
                    selectedDuration === dur.id
                      ? 'bg-amber-50 text-amber-900 border-amber-400 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{dur.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{dur.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Tải Ảnh Ý Tưởng Từ Máy Lên (Tùy Chọn) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              5. Tải Ảnh Ý Tưởng Từ Máy Lên (Tùy chọn):
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputIdeaRef.current?.click()}
                className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-amber-600" />
                <span>{uploadedIdeaImage ? 'Đổi ảnh ý tưởng khác' : 'Chọn ảnh mẫu từ máy'}</span>
              </button>
              {uploadedIdeaImage && (
                <button
                  type="button"
                  onClick={() => setUploadedIdeaImage(null)}
                  className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all"
                  title="Gỡ ảnh đã tải lên"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputIdeaRef}
              accept="image/*"
              className="hidden"
              onChange={handleUploadIdeaImage}
            />
            {uploadedIdeaImage && (
              <div className="mt-2 relative w-full h-24 rounded-lg overflow-hidden border border-amber-300 bg-slate-900">
                <img src={uploadedIdeaImage} alt="Ảnh ý tưởng đã tải" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                  Ảnh của Thầy/Cô
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleGenerateIdea}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-amber-200 flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Tạo Ý Tưởng Bài Học</span>
          </button>
        </div>
      </div>

      {/* Right Output Display Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {ideaResult ? (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            {/* Header of Idea Result */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Lớp {ideaResult.grade} • {ideaResult.duration} • {ideaResult.material}
                </span>
                <h1 className="text-xl font-black text-slate-800 mt-2">
                  {ideaResult.lessonTitle}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Chương trình GDPT 2018 môn Mĩ thuật Tiểu học (Thông tư 32/2018/TT-BGDĐT)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyToClipboard}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-all"
                  title="Sao chép toàn bộ kế hoạch bài dạy"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>

                <button
                  onClick={handleCreateSlides}
                  className="px-4 py-1.5 text-xs font-black text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                  title="Tự động tạo bộ slide bài giảng từ ý tưởng này"
                >
                  <Presentation className="w-3.5 h-3.5" />
                  <span>{addedNotice ? 'Đang chuyển...' : 'Tạo Slide Bài Giảng'}</span>
                </button>
              </div>
            </div>

            {/* ẢNH Ý TƯỞNG CỦA THẦY/CÔ TẢI LÊN (NẾU CÓ) */}
            {uploadedIdeaImage && (
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-100/40 border border-blue-200 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-blue-600 text-white rounded-lg text-xs shadow-xs">🖼️</span>
                    <div>
                      <h3 className="font-extrabold text-xs md:text-sm text-blue-950 flex items-center gap-1.5">
                        <span>Ảnh Ý Tưởng / Tranh Mẫu Của Thầy/Cô</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Từ máy tính</span>
                      </h3>
                      <p className="text-[11px] text-blue-800">
                        Hình ảnh tham khảo do Thầy/Cô trực tiếp tải lên cho bài dạy
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInsertArtworkToCurrentSlide(uploadedIdeaImage)}
                    className="px-3.5 py-1 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                    title="Chèn ảnh ý tưởng này trực tiếp vào slide bài giảng đang soạn"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{insertSuccessNotice ? '✓ Đã chèn vào slide!' : 'Chèn ảnh này vào slide'}</span>
                  </button>
                </div>

                <div className="relative aspect-video w-full bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-blue-200/60">
                  <img
                    src={uploadedIdeaImage}
                    alt="Ảnh ý tưởng từ máy tính"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* KHU VỰC THƯ VIỆN TRANH MẪU MINH HỌA SINH THEO Ý TƯỞNG (NHIỀU TRANH, LIÊN TỤC) */}
            {(generatedArtworkUrl || artworkGallery.length > 0) && (
              <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/50 border border-amber-200 rounded-2xl p-4 shadow-2xs space-y-3">
                {/* Header thanh công cụ tranh */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-500 text-white rounded-lg text-xs shadow-xs">🎨</span>
                    <div>
                      <h3 className="font-extrabold text-xs md:text-sm text-amber-950 flex items-center gap-2">
                        <span>Bộ Sưu Tập Tranh Minh Họa AI ({artworkGallery.length} bức)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Siêu Tốc 2-3s • Tạo Không Giới Hạn</span>
                      </h3>
                      <p className="text-[11px] text-amber-800">
                        {artworkGallery[activeArtworkIndex]?.styleName || 'Phong cách sáp màu / màu nước'} • Bấm vào các tranh nhỏ bên dưới để chọn tranh muốn dùng
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Nút Tạo thêm 1 tranh mới siêu tốc */}
                    <button
                      type="button"
                      onClick={() => handleGenerateMoreArtwork(1)}
                      className="px-3 py-1 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Vẽ thêm 1 tranh minh họa mới tức thì (chỉ 2-3 giây, không giới hạn)"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                      <span>+ Vẽ Thêm 1 Bức (2s)</span>
                    </button>

                    {/* Nút Tạo bộ 4 tranh mới cùng lúc */}
                    <button
                      type="button"
                      onClick={() => handleGenerateMoreArtwork(4)}
                      className="px-3 py-1 text-xs font-bold text-indigo-950 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Tạo thêm 4 biến thể phong cách khác nhau cùng một lúc"
                    >
                      <span>🎨</span>
                      <span>+ Tạo Bộ 4 Bức Mới</span>
                    </button>

                    <a
                      href={generatedArtworkUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={`Tranh_Mau_${ideaResult ? ideaResult.themeTitle : 'Y_Tuong'}.jpg`}
                      className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1 transition-all shadow-2xs"
                      title="Tải ảnh tranh mẫu đang chọn về máy tính"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Tải về</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleInsertArtworkToCurrentSlide(generatedArtworkUrl)}
                      className="px-3.5 py-1 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Chèn bức tranh minh họa đang chọn này trực tiếp vào trang slide bài giảng"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{insertSuccessNotice ? '✓ Đã chèn vào slide!' : 'Chèn tranh này vào slide'}</span>
                    </button>
                  </div>
                </div>

                {/* Khung Tranh Minh Họa 16:9 Chính */}
                <div className="relative aspect-video w-full bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-amber-200/60 group">
                  {isImageLoading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                      <span className="text-xs font-bold">Đang vẽ tranh mẫu mới siêu tốc theo ý tưởng của Thầy/Cô...</span>
                    </div>
                  )}
                  <img
                    src={generatedArtworkUrl}
                    alt="Tranh mẫu minh họa mĩ thuật"
                    onLoad={() => setIsImageLoading(false)}
                    onError={(e) => {
                      setIsImageLoading(false);
                      const fallback = generateProceduralArtwork(ideaResult?.themeTitle || 'con mèo', 12345, artworkGallery[activeArtworkIndex]?.styleKey || 'crayon');
                      if (fallback && e.target.src !== fallback) {
                        e.target.src = fallback;
                      }
                    }}
                    className="w-full h-full object-contain"
                  />
                  {/* Badge phong cách tranh đang xem */}
                  {artworkGallery[activeArtworkIndex] && (
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-amber-300 border border-white/20">
                      Biến thể #{activeArtworkIndex + 1}: {artworkGallery[activeArtworkIndex].styleName}
                    </div>
                  )}
                </div>

                {/* THƯ VIỆN CÁC TRANH MẪU ĐÃ TẠO (CLICK ĐỂ CHỌN HOẶC CHÈN NGAY) */}
                {artworkGallery.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between flex-wrap gap-1 mb-1.5 text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                        <span>🖼️</span> Thư viện tranh đã sinh ({artworkGallery.length} bức):
                      </span>
                      <span className="text-[11px] text-slate-500">Bấm ảnh để xem lớn • Bấm (+) để chèn vào slide</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                      {artworkGallery.map((art, idx) => (
                        <div
                          key={art.id}
                          onClick={() => handleSelectArtwork(idx)}
                          className={`relative shrink-0 w-36 aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all transform hover:scale-102 ${
                            idx === activeArtworkIndex 
                              ? 'border-amber-500 shadow-md ring-2 ring-amber-300' 
                              : 'border-slate-200 hover:border-amber-300 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={art.url}
                            alt={art.styleName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const fallback = generateProceduralArtwork(art.title || 'con mèo', art.seed || 12345, art.styleKey || 'crayon');
                              if (fallback && e.target.src !== fallback) {
                                e.target.src = fallback;
                              }
                            }}
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/75 px-1 py-0.5 text-[9px] font-bold text-white text-center truncate">
                            #{idx + 1} {art.styleName}
                          </div>
                          {/* Nút chèn nhanh 1 chạm */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertArtworkToCurrentSlide(art.url);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center justify-center text-[10px] shadow"
                            title="Chèn ảnh này vào slide"
                          >
                            +
                          </button>
                        </div>
                      ))}

                      {/* Ô Bấm nhanh để tạo thêm tranh */}
                      <button
                        type="button"
                        onClick={() => handleGenerateMoreArtwork(1)}
                        className="shrink-0 w-28 aspect-video rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 flex flex-col items-center justify-center text-amber-800 transition cursor-pointer"
                        title="Vẽ thêm một bức tranh mới"
                      >
                        <Sparkles className="w-4 h-4 mb-0.5 text-amber-600" />
                        <span className="text-[10px] font-extrabold">+ Vẽ Thêm</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* I. Objectives Section */}
            <div>
              <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🎯</span> I. Mục Tiêu Cần Đạt (Yêu Cầu Cần Đạt)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <h4 className="font-bold text-xs text-emerald-900 mb-1">🌟 Kiến Thức</h4>
                  <p className="text-xs text-emerald-950 leading-relaxed">{ideaResult.objectives.knowledge}</p>
                </div>
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                  <h4 className="font-bold text-xs text-blue-900 mb-1">🎨 Kĩ Năng</h4>
                  <p className="text-xs text-blue-950 leading-relaxed">{ideaResult.objectives.skills}</p>
                </div>
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <h4 className="font-bold text-xs text-amber-900 mb-1">❤️ Phẩm Chất</h4>
                  <p className="text-xs text-amber-950 leading-relaxed">{ideaResult.objectives.qualities}</p>
                </div>
              </div>
            </div>

            {/* II. Materials Needed */}
            <div>
              <h3 className="text-xs font-black text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📦</span> II. Đồ Dùng & Thiết Bị Dạy Học
              </h3>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <p><strong>• Thầy/Cô:</strong> {ideaResult.materialsNeeded.teacher}</p>
                <p><strong>• Học sinh:</strong> {ideaResult.materialsNeeded.student}</p>
              </div>
            </div>

            {/* III. Teaching Process */}
            <div>
              <h3 className="text-xs font-black text-purple-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📋</span> III. Tiến Trình 4 Bước Dạy Học Mĩ Thuật
              </h3>
              <div className="space-y-3">
                {ideaResult.teachingProcess.map((proc) => (
                  <div key={proc.step} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <h4 className="font-bold text-xs text-purple-900">{proc.name}</h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{proc.activity}</p>
                    
                    {proc.fourSteps && (
                      <div className="mt-2.5 p-2.5 bg-purple-50/70 border border-purple-100 rounded-lg">
                        <span className="text-[11px] font-bold text-purple-900 block mb-1">4 bước vẽ tranh thị phạm:</span>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-purple-950 font-medium">
                          {proc.fourSteps.map((st, i) => (
                            <div key={i}>• {st}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {proc.guidingQuestions && (
                      <div className="mt-2.5 p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg">
                        <span className="text-[11px] font-bold text-blue-900 block mb-1">Câu hỏi gợi mở trong lúc thực hành:</span>
                        <ul className="text-[11px] text-blue-950 space-y-1">
                          {proc.guidingQuestions.map((q, i) => (
                            <li key={i}>- {q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* IV. Rubric Evaluation Criteria */}
            <div>
              <h3 className="text-xs font-black text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🏅</span> IV. Tiêu Chí Đánh Giá Sản Phẩm (Rubric Sư Phạm)
              </h3>
              <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-950 font-medium">
                {ideaResult.rubricCriteria.map((crit, idx) => (
                  <p key={idx}>✓ {crit}</p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl shadow-sm mb-4">
              💡
            </div>
            <h3 className="font-extrabold text-base text-slate-700">Chưa Có Ý Tưởng Được Chọn</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5">
              Thầy/Cô hãy chọn khối lớp, chủ đề, vật liệu và thời lượng ở cột bên trái rồi bấm nút <strong>"Tạo Ý Tưởng Bài Học"</strong> để hệ thống gợi ý kế hoạch dạy học chi tiết!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
