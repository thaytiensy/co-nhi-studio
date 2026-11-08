import React, { useState, useRef, useEffect } from 'react';
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
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { PEDAGOGY_BANK } from '../../data/pedagogyBank';
import { generateAiArtwork, generateAiLesson, externalAiEnabled } from '../../utils/aiLessonGenerator';
import { generateNaturalIdeaLesson, parseNaturalIdeaPrompt, critiqueAndEnhanceLessonPlan, detectArtGenre } from '../../utils/aiNaturalLanguageService';
import { prepareLocalLessonPlan } from '../../utils/lessonQualityService';

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

// Kho gợi ý ý tưởng thông minh chuẩn mĩ thuật tiểu học theo từng khối lớp (Bấm 1 chạm để tạo)
const SMART_GRADE_SUGGESTIONS = {
  1: [
    { title: 'Con heo hồng đáng yêu', icon: '🐷', material: 'crayon' },
    { title: 'Chú mèo con chơi cuộn len', icon: '🐱', material: 'crayon' },
    { title: 'Ngôi nhà mái đỏ của em', icon: '🏠', material: 'crayon' },
    { title: 'Vườn hoa rực rỡ sắc màu', icon: '🌸', material: 'watercolor' },
    { title: 'Con thuyền trên biển xanh', icon: '⛵', material: 'watercolor' },
    { title: 'Đĩa hoa quả bốn mùa', icon: '🍉', material: 'paper' }
  ],
  2: [
    { title: 'Đàn cá bơi dưới đại dương', icon: '🐠', material: 'watercolor' },
    { title: 'Chú cún tinh nghịch trong vườn', icon: '🐶', material: 'crayon' },
    { title: 'Rừng cây xanh mát', icon: '🌳', material: 'crayon' },
    { title: 'Đàn gà con theo mẹ', icon: '🐔', material: 'crayon' },
    { title: 'Cầu vồng rực rỡ sau mưa', icon: '🌈', material: 'watercolor' },
    { title: 'Bé vui chơi sân trường', icon: '🎈', material: 'paper' }
  ],
  3: [
    { title: 'Phong cảnh làng quê thanh bình', icon: '🏞️', material: 'watercolor' },
    { title: 'Đèn lồng Tết Trung Thu', icon: '🏮', material: 'paper' },
    { title: 'Phương tiện giao thông trên phố', icon: '🚗', material: 'crayon' },
    { title: 'Bình hoa ngày Tết', icon: '💐', material: 'watercolor' },
    { title: 'Chú voi hiền lành trong rừng', icon: '🐘', material: 'clay' }
  ],
  4: [
    { title: 'Vẻ đẹp di sản quê hương', icon: '🏛️', material: 'watercolor' },
    { title: 'Lễ hội chèo thuyền rồng', icon: '🚣', material: 'crayon' },
    { title: 'Bức tranh phong cảnh mùa thu', icon: '🍂', material: 'watercolor' },
    { title: 'Tạo hình đồ chơi từ vật liệu tái chế', icon: '📦', material: 'recycled' }
  ],
  5: [
    { title: 'Chân dung bạn bè / thầy cô', icon: '🎨', material: 'watercolor' },
    { title: 'Thế giới tương lai trong mắt em', icon: '🚀', material: 'crayon' },
    { title: 'Bảo vệ môi trường biển đảo', icon: '🌊', material: 'watercolor' },
    { title: 'Gia đình sum vầy bên mâm cơm', icon: '👨‍👩‍👧‍👦', material: 'paper' }
  ]
};

// Động cơ sư phạm thông minh: Hiểu sâu sắc ngữ cảnh ý tưởng và chất liệu tạo hình
function generateSmartPedagogy({ topic, material, duration, grade, isCustom, currentTheme }) {
  if (!isCustom && currentTheme) {
    return {
      objectives: currentTheme.objectives,
      materialsNeeded: {
        teacher: `Tranh mẫu minh họa ${topic}, ${material.name}, giấy vẽ khổ A3, bài giảng trình chiếu.`,
        student: `${material.name}, giấy vẽ A4, bút chì, tẩy gôm, khăn lau tay.`
      },
      teachingProcess: [
        {
          step: 1,
          name: '1. Khởi Động & Khám Phá (5-7 phút)',
          activity: currentTheme.warmup,
          teacherNote: currentTheme.teacherScript
        },
        {
          step: 2,
          name: '2. Kiến Tạo Kiến Thức Mới & Thị Phạm (8-10 phút)',
          activity: `Thầy/Cô hướng dẫn học sinh quan sát mẫu tranh và thị phạm thao tác cơ bản với ${material.name}.`,
          fourSteps: currentTheme.fourSteps
        },
        {
          step: 3,
          name: `3. Luyện Tập & Sáng Tạo (${duration.id === 35 ? '15' : '35'} phút)`,
          activity: `Học sinh tự do thực hành sáng tạo tác phẩm cá nhân hoặc theo nhóm với ${material.name}. Giáo viên quan sát, khích lệ và trợ giúp các em còn lúng túng.`,
          guidingQuestions: currentTheme.questions
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
        `Tiêu chí 2: Sử dụng thành thạo ${material.name}, nét vẽ/hình khối rõ ràng.`,
        'Tiêu chí 3: Có ý tưởng sáng tạo, thể hiện cảm xúc hồn nhiên.',
        'Tiêu chí 4: Tự tin giới thiệu và chia sẻ cảm xúc về bài vẽ trước lớp.'
      ]
    };
  }

  const lower = (topic || '').toLowerCase();
  const isPig = lower.includes('heo') || lower.includes('lợn') || lower.includes('ủn') || lower.includes('pig');
  const isCat = lower.includes('mèo') || lower.includes('cat');
  const isDog = lower.includes('chó') || lower.includes('cún') || lower.includes('dog');
  const isChicken = lower.includes('gà') || lower.includes('chicken');
  const isFish = lower.includes('cá') || lower.includes('thủy cung') || lower.includes('ocean');
  const isBoat = lower.includes('thuyền') || lower.includes('biển') || lower.includes('buồm');
  const isHouse = lower.includes('nhà') || lower.includes('phố') || lower.includes('làng');
  const isFlower = lower.includes('hoa') || lower.includes('sen') || lower.includes('hướng dương');
  const isTree = lower.includes('cây') || lower.includes('rừng');
  const isFruit = lower.includes('quả') || lower.includes('trái cây') || lower.includes('hoa quả');
  const isVehicle = lower.includes('xe') || lower.includes('ô tô') || lower.includes('bus');

  let objectives = {
    knowledge: `Nhận biết được đặc điểm hình thể, đường nét và màu sắc đặc trưng của ${topic}; hiểu cách phối hợp các khối hình học cơ bản để dựng hình.`,
    skills: `Biết phác khung hình cân đối ở trọng tâm trang giấy; vận dụng thành thạo kĩ thuật ${material.name} để tạo hình, vẽ nét và lên màu tươi sáng, sinh động.`,
    qualities: `Nuôi dưỡng tình cảm yêu thương thiên nhiên, gia đình và cuộc sống; rèn luyện đức tính kiên nhẫn, cẩn thận và thói quen bảo quản đồ dùng mĩ thuật.`
  };

  let warmup = {
    activity: `Đố vui và quan sát tranh ảnh sinh động về ${topic} để khơi gợi cảm hứng thẩm mĩ cho học sinh.`,
    teacherNote: `Thầy/Cô dùng ngữ điệu ấm áp, vui tươi, khích lệ học sinh tự tin chia sẻ những điều các em đã biết về ${topic}.`
  };

  let fourSteps = [
    `Bước 1: Phác khung hình học cơ bản của ${topic} vào vị trí trung tâm tờ giấy`,
    `Bước 2: Dựng các nét chính và chi tiết đặc trưng làm nổi bật đối tượng`,
    `Bước 3: Vẽ thêm cảnh vật phụ và không gian xung quanh để tạo chiều sâu`,
    `Bước 4: Sử dụng ${material.name} lên màu tươi sáng, tạo độ đậm nhạt và hoàn thiện`
  ];

  let guidingQuestions = [
    `Em sẽ chọn màu sắc gì để thể hiện ${topic} theo cảm xúc của riêng mình?`,
    `Em muốn thêm chi tiết hoặc khung cảnh nào xung quanh để bức tranh thật sinh động?`,
    `Em cảm thấy chi tiết nào trong tác phẩm của mình độc đáo nhất?`
  ];

  if (isPig) {
    objectives = {
      knowledge: `Nhận biết được đặc điểm hình dáng (thân mình tròn trịa, đôi tai cụp, chiếc mõm bầu dục với hai lỗ mũi tròn, bốn chân ngắn và chiếc đuôi xoăn tít) cùng sắc hồng tươi sáng, đáng yêu của con heo; hiểu cách phối hợp các hình khối cơ bản (hình tròn, hình elip) để tạo hình chú heo.`,
      skills: `Biết phác hình chú heo cân đối ở vị trí trung tâm trang giấy; sử dụng thành thạo ${material.name} để vẽ nét mượt mà và tô màu tươi tắn, hài hòa.`,
      qualities: `Bồi dưỡng tình yêu thương đối với các loài vật nuôi quen thuộc; rèn luyện tính kiên nhẫn, cẩn thận và thói quen giữ gìn vệ sinh lớp học mĩ thuật.`
    };
    warmup = {
      activity: `Trò chơi đố vui "Đoán tên loài vật": Thầy/Cô đọc câu đố vui: "Con gì đuôi ngắn tai to / Mắt thì ti hí, bụng no tròn xoe / Suốt ngày ăn no rồi ngủ khì... là con gì?" -> Cả lớp hào hứng đoán: Con heo (con lợn). Giáo viên trình chiếu tranh ảnh chú heo ngộ nghĩnh và dẫn dắt học sinh khám phá hình dáng đặc trưng.`,
      teacherNote: `Thầy/Cô mô phỏng tiếng kêu "ủn ỉn" vui nhộn, tạo không khí lớp học rộn rã tiếng cười, khích lệ các em học sinh hào hứng bước vào giờ vẽ.`
    };
    fourSteps = [
      `Bước 1: Phác khung hình học - Vẽ một hình elip lớn nằm ngang làm thân mình, một hình tròn nhỏ hơn hơi lệch phía trước làm đầu chú heo.`,
      `Bước 2: Dựng nét chi tiết - Vẽ chiếc mõm bầu dục với 2 lỗ mũi tròn, đôi tai cụp hình tam giác mềm, bốn chiếc chân ngắn có móng guốc và chiếc đuôi xoăn tít phía sau.`,
      `Bước 3: Vẽ thêm cảnh vật phụ - Vẽ thêm vũng bùn vui nhộn hoặc thảm cỏ xanh mướt, vài bông hoa nhỏ và ông mặt trời rực rỡ để bức tranh thêm phần sinh động.`,
      `Bước 4: Hoàn thiện màu sắc - Sử dụng ${material.name} tô màu hồng tươi sáng cho chú heo, nhấn đậm các đường viền thân và tô nền trời xanh, thảm cỏ hoàn thiện tác phẩm.`
    ];
    guidingQuestions = [
      `Em sẽ chọn vẽ chú heo của mình đang làm gì (đang đi dạo trên cỏ, tắm vũng bùn hay đang vui đùa)?`,
      `Em sẽ phối màu sắc gì cho chú heo và cảnh vật xung quanh để bức tranh thật rực rỡ?`,
      `Em có muốn vẽ thêm những người bạn nào bên cạnh chú heo của mình không?`
    ];
  } else if (isCat) {
    objectives = {
      knowledge: `Nhận biết được đặc điểm hình dáng (đầu tròn, tai tam giác nhọn, mắt long lanh, đôi ria mép sinh động, đuôi dài uốn lượn) và các sắc lông đáng yêu của chú mèo; nắm được cách tạo hình nét vẽ mềm mại.`,
      skills: `Biết phác hình chú mèo sinh động; vận dụng thành thạo ${material.name} để thể hiện chất cảm bộ lông và phối màu hài hòa.`,
      qualities: `Nuôi dưỡng tình cảm yêu thương động vật, gắn bó với thú cưng trong gia đình.`
    };
    warmup = {
      activity: `Đố vui "Tiếng kêu meo meo": Học sinh lắng nghe tiếng mèo kêu và bắt chước các động tác vồ bóng len, rửa mặt đáng yêu của chú mèo.`,
      teacherNote: `Khơi gợi tình cảm ấm áp của học sinh với thú cưng trong gia đình.`
    };
    fourSteps = [
      `Bước 1: Phác khung hình học - Vẽ hình tròn làm đầu và hình elip cong làm thân mèo đang ngồi hoặc nằm cuộn tròn.`,
      `Bước 2: Dựng nét chi tiết - Vẽ 2 tai tam giác nhọn, mắt to tròn lấp lánh, mũi nhỏ, ria mép 2 bên, 4 chân và chiếc đuôi dài uốn lượn.`,
      `Bước 3: Vẽ bối cảnh - Vẽ thêm cuộn len nhiều màu sắc, chiếc đĩa đựng sữa hoặc đàn bướm bay lượn quanh chú mèo.`,
      `Bước 4: Hoàn thiện màu sắc - Lên màu lông mèo (vàng mướp, tam thể, trắng hoặc xám), dùng nét ${material.name} tỉa nhẹ đường viền lông mềm mại.`
    ];
    guidingQuestions = [
      `Chú mèo của em có màu lông gì (vàng mướp, trắng tinh hay tam thể)?`,
      `Em muốn chú mèo đang chơi đùa cùng cuộn len hay đang sưởi nắng bên cửa sổ?`,
      `Em đã nhấn nhá chi tiết nào để đôi mắt chú mèo trông thật long lanh?`
    ];
  } else if (isFish) {
    objectives = {
      knowledge: `Nhận biết được sự đa dạng về hình dáng (thoi, tròn, tam giác), màu sắc rực rỡ và các họa tiết vảy, vây của các loài cá dưới đại dương.`,
      skills: `Biết phối hợp các đường nét cong lượn sóng và hình cơ bản; sử dụng ${material.name} tạo hiệu ứng làn nước và ánh sáng lung linh.`,
      qualities: `Nâng cao ý thức bảo vệ môi trường biển, yêu quý hệ sinh vật biển phong phú.`
    };
    warmup = {
      activity: `Hát và múa theo bài "Cá vàng bơi": Cả lớp cùng làm động tác cá bơi tung tăng theo nhạc điệu vui nhộn.`,
      teacherNote: `Khích lệ học sinh kể tên các loài cá biển mà các em từng thấy trên tivi hoặc trong sách ảnh.`
    };
    fourSteps = [
      `Bước 1: Phác khung hình dáng - Vẽ hình bầu dục hoặc hình thoi làm thân cá uốn cong nhẹ nhàng.`,
      `Bước 2: Vẽ các chi tiết - Vẽ đuôi cá xòe rộng, các vây lưng và vây bụng mềm mại, mắt to tròn và các đường cong vảy cá trang trí.`,
      `Bước 3: Vẽ đáy đại dương - Vẽ thêm những nhánh san hô rực rỡ, dải rong biển uốn lượn và những chùm bọt khí nổi lên.`,
      `Bước 4: Hoàn thiện màu sắc - Phối màu sắc tương phản nổi bật cho cá, phủ màu nước/màu sáp xanh ngọc cho làn nước biển trong lành.`
    ];
    guidingQuestions = [
      `Chú cá của em có những màu sắc rực rỡ nào?`,
      `Em đã trang trí những hoa văn gì trên thân và vây cá?`,
      `Đáy biển xung quanh chú cá có những sinh vật nào khác đang cùng bơi lội?`
    ];
  } else if (isHouse) {
    objectives = {
      knowledge: `Nhận biết được các bộ phận chính của ngôi nhà (mái ngói tam giác/thang, thân nhà chữ nhật, cửa sổ, cửa chính) và cảnh quan thiên nhiên quanh nhà.`,
      skills: `Vận dụng các khối hình học cơ bản để dựng hình ngôi nhà cân đối; sử dụng ${material.name} phối màu mái ngói, tường nhà và sân vườn hài hòa.`,
      qualities: `Bồi dưỡng tình yêu quê hương, gia đình và trân trọng tổ ấm thân thương.`
    };
    warmup = {
      activity: `Hát bài "Nhà của tôi": Học sinh cùng hát và chia sẻ nhanh về ngôi nhà thân yêu của mình với các bạn bên cạnh.`,
      teacherNote: `Hướng học sinh chú ý đến vẻ đẹp của mái nhà, luống hoa và cây bóng mát quanh nhà.`
    };
    fourSteps = [
      `Bước 1: Dựng khung hình học - Dùng hình chữ nhật dựng thân nhà, hình tam giác hoặc hình thang dựng mái ngói.`,
      `Bước 2: Vẽ chi tiết kiến trúc - Vẽ cửa chính, các ô cửa sổ đón nắng, ống khói nhỏ và các viên ngói xếp lớp.`,
      `Bước 3: Vẽ không gian sân vườn - Vẽ thêm con đường nhỏ quanh co dẫn vào nhà, cây bóng mát, hàng rào gỗ và luống hoa rực rỡ.`,
      `Bước 4: Lên màu bức tranh - Tô mái ngói đỏ tươi, tường nhà vàng ấm áp, thảm cỏ xanh mướt và bầu trời trong xanh.`
    ];
    guidingQuestions = [
      `Ngôi nhà trong tranh của em nằm ở đâu (đồng quê yên bình, phố xá hay miền núi)?`,
      `Em sẽ chọn màu gì cho mái ngói và những ô cửa sổ?`,
      `Khu vườn quanh nhà em có trồng những loài hoa hoặc cây bóng mát nào?`
    ];
  } else if (isBoat) {
    objectives = {
      knowledge: `Nhận biết được hình dáng con thuyền buồm (thân thuyền hình thang, cánh buồm tam giác căng gió) và không gian mênh mông của biển cả.`,
      skills: `Biết vẽ đường lượn sóng tạo cảm giác chuyển động của mặt nước; sử dụng ${material.name} tạo sắc thái bầu trời và mặt biển.`,
      qualities: `Bồi dưỡng tình yêu biển đảo quê hương và tinh thần dũng cảm khám phá thế giới.`
    };
    warmup = {
      activity: `Trò chơi "Căng buồm ra khơi": Học sinh làm động tác chèo thuyền, đón gió biển và ngắm bình minh trên sóng.`,
      teacherNote: `Tạo không khí hào hứng, khơi gợi cảm xúc phóng khoáng trước thiên nhiên bao la.`
    };
    fourSteps = [
      `Bước 1: Dựng hình thân thuyền - Vẽ hình thang ngược đáy nhỏ làm thân thuyền gỗ bồng bềnh trên nước.`,
      `Bước 2: Dựng cột buồm và cánh buồm - Dựng đường thẳng làm cột buồm, vẽ 2 cánh buồm tam giác lớn và nhỏ căng gió.`,
      `Bước 3: Vẽ cảnh sắc biển cả - Vẽ các đường lượn sóng nhấp nhô, dãy núi mờ xa và đàn hải âu chao lượn trên nền trời.`,
      `Bước 4: Hoàn thiện màu sắc - Tô màu cánh buồm rực rỡ, phản chiếu ánh bình minh vàng cam lung linh trên mặt biển biếc.`
    ];
    guidingQuestions = [
      `Con thuyền của em đang ra khơi vào buổi sáng bình minh hay chiều hoàng hôn?`,
      `Cánh buồm của em có những sắc màu hoặc hoa văn nổi bật nào?`,
      `Mặt biển xung quanh có những con sóng nhấp nhô ra sao?`
    ];
  }

  return {
    objectives,
    materialsNeeded: {
      teacher: `Tranh mẫu minh họa ${topic}, ${material.name}, giấy vẽ khổ A3, bài giảng trình chiếu.`,
      student: `${material.name}, giấy vẽ A4, bút chì, tẩy gôm, khăn lau tay.`
    },
    teachingProcess: [
      {
        step: 1,
        name: '1. Khởi Động & Khám Phá (5-7 phút)',
        activity: warmup.activity,
        teacherNote: warmup.teacherNote
      },
      {
        step: 2,
        name: '2. Kiến Tạo Kiến Thức Mới & Thị Phạm (8-10 phút)',
        activity: `Thầy/Cô hướng dẫn học sinh quan sát mẫu tranh và thị phạm thao tác tạo hình với ${material.name}.`,
        fourSteps
      },
      {
        step: 3,
        name: `3. Luyện Tập & Sáng Tạo (${duration.id === 35 ? '15' : '35'} phút)`,
        activity: `Học sinh tự do thực hành sáng tạo tác phẩm ${topic} cá nhân hoặc theo nhóm với ${material.name}. Giáo viên quan sát, khích lệ và trợ giúp các em còn lúng túng.`,
        guidingQuestions
      },
      {
        step: 4,
        name: '4. Trưng Bày, Nhận Xét & Đánh Giá (7-10 phút)',
        activity: `Trưng bày tác phẩm "${topic}" lên góc mĩ thuật lớp học. Học sinh tự nhận xét bài của mình và chia sẻ cảm nhận về bài của bạn.`,
        rubricNote: 'Đánh giá theo 4 tiêu chí: Đề tài, Kĩ năng tạo hình, Sáng tạo riêng và Khả năng diễn đạt.'
      }
    ],
    rubricCriteria: [
      `Tiêu chí 1: Thực hiện đúng chủ đề "${topic}", hoàn thành bài đúng thời lượng.`,
      `Tiêu chí 2: Sử dụng thành thạo ${material.name}, nét vẽ/hình khối rõ ràng, cân đối.`,
      `Tiêu chí 3: Có ý tưởng sáng tạo độc đáo, màu sắc thể hiện cảm xúc hồn nhiên.`,
      `Tiêu chí 4: Tự tin giới thiệu và chia sẻ cảm xúc về bài vẽ trước lớp.`
    ]
  };
}

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

  // Chế độ câu lệnh tự nhiên AI (Giai đoạn 3)
  const [workshopMode, setWorkshopMode] = useState('natural'); // 'natural' | 'form'
  const [naturalPrompt, setNaturalPrompt] = useState('Tạo kế hoạch dạy vẽ ngôi nhà cho lớp 2, thời lượng 35 phút, dùng sáp màu, có phần khởi động vui.');
  const [naturalAnalysis, setNaturalAnalysis] = useState(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  const [ideaResult, setIdeaResult] = useState(null);
  const [generatedArtworkUrl, setGeneratedArtworkUrl] = useState('');
  const [artworkGallery, setArtworkGallery] = useState([]);
  const artworkGalleryRef = useRef([]);
  const [artworkMaterialKey, setArtworkMaterialKey] = useState('crayon');
  const ideaResultRef = useRef(null);
  const imageRequestRef = useRef(false);
  const pendingImageRequestRef = useRef(null);
  useEffect(() => {
    ideaResultRef.current = ideaResult;
  }, [ideaResult]);
  const [activeArtworkIndex, setActiveArtworkIndex] = useState(0);
  const artworkSeedRef = useRef(100);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [insertSuccessNotice, setInsertSuccessNotice] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratingStatus, setAiGeneratingStatus] = useState('');
  const [aiGenerationMessage, setAiGenerationMessage] = useState(null);
  const aiPlanRequestRef = useRef(null);

  // Ảnh do người dùng tải lên từ máy tính cho ý tưởng
  const [uploadedIdeaImage, setUploadedIdeaImage] = useState(null);
  const fileInputIdeaRef = useRef(null);

  const themesForGrade = PEDAGOGY_BANK.themes[selectedGrade] || [];
  const currentTheme = themesForGrade.find(t => t.id === selectedThemeId) || themesForGrade[0];

  const formatCapitalized = (text) => {
    if (!text) return '';
    const t = text.trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  const generateArtworkForContext = async ({ topic, grade, materialKey, genre = 'general', ideaId, count = 1, append = false, seed = artworkSeedRef.current }) => {
    if (imageRequestRef.current) {
      pendingImageRequestRef.current = { topic, grade, materialKey, genre, ideaId, count, append, seed };
      return;
    }
    imageRequestRef.current = true;
    setIsImageLoading(true);
    setAiGenerationMessage(null);

    const materialObj = MATERIALS.find(material => material.id === materialKey) || MATERIALS[0];
    const generatedItems = [];
    let generationError = null;
    const safeCount = Math.max(1, Math.min(4, count));

    try {
      for (let index = 0; index < safeCount; index++) {
        const latestBeforeRequest = ideaResultRef.current;
        if (!latestBeforeRequest || latestBeforeRequest.id !== ideaId) break;
        setAiGeneratingStatus(safeCount > 1
          ? `Đang yêu cầu dịch vụ tạo tranh ${index + 1}/${safeCount} theo yêu cầu...`
          : `Đang yêu cầu dịch vụ tạo tranh cho “${topic}”...`);
        try {
          const url = await generateAiArtwork({ topic, grade, style: materialKey, genre, seed: seed + index });
          generatedItems.push({
            id: `art-${Date.now()}-${index}-${Math.floor(Math.random() * 999999)}`,
            url,
            seed: seed + index,
            styleName: materialObj.name,
            styleKey: materialKey,
            title: topic,
            prompt: topic,
            source: 'Pollinations (dịch vụ bên ngoài)',
            requiresTeacherReview: true
          });
        } catch (error) {
          generationError = error;
          break;
        }
      }

      const currentIdea = ideaResultRef.current;
      if (!currentIdea || currentIdea.id !== ideaId) return;

      if (generatedItems.length > 0) {
        const gallery = append ? [...artworkGalleryRef.current, ...generatedItems] : generatedItems;
        artworkGalleryRef.current = gallery;
        setArtworkGallery(gallery);
        setActiveArtworkIndex(gallery.length - 1);
        setArtworkMaterialKey(materialKey);
        const selectedArtwork = generatedItems[generatedItems.length - 1];
        setGeneratedArtworkUrl(selectedArtwork.url);
        const updatedIdea = { ...currentIdea, artworkUrl: selectedArtwork.url };
        ideaResultRef.current = updatedIdea;
        setIdeaResult(updatedIdea);
      }

      if (generationError) {
        setAiGenerationMessage({
          type: 'error',
          text: generatedItems.length
            ? `Đã tạo ${generatedItems.length}/${safeCount} tranh; ảnh tiếp theo chưa tạo được. ${generationError.message}`
            : generationError.message || 'Không tạo được tranh AI. Thầy/Cô có thể thử lại.'
        });
      } else {
        setAiGenerationMessage(previous => previous?.type === 'error' ? previous : {
          type: 'success', text: 'Đã nhận ảnh hợp lệ từ dịch vụ tạo tranh. Thầy/Cô cần xem lại nội dung và chất liệu trước khi dùng.'
        });
      }
    } finally {
      imageRequestRef.current = false;
      const pending = pendingImageRequestRef.current;
      pendingImageRequestRef.current = null;
      const latest = ideaResultRef.current;
      if (pending && latest && latest.id === pending.ideaId
        && latest.themeTitle === pending.topic && latest.grade === pending.grade
        ) {
        void generateArtworkForContext(pending);
      } else {
        setIsImageLoading(false);
      }
    }
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

  const handleGenerateIdea = (overrideTitle = null, overrideMaterial = null, options = {}) => {
    const {
      generateArtwork = true,
      generatePlan = true,
      grade = selectedGrade,
      themeId = selectedThemeId,
      durationId = selectedDuration
    } = options;
    const rawCustom = overrideTitle !== null ? overrideTitle : customIdeaInput.trim();
    const isCustom = Boolean(rawCustom);
    const materialKey = overrideMaterial || selectedMaterial;
    const materialObj = MATERIALS.find(m => m.id === materialKey) || MATERIALS[0];
    const durationObj = DURATIONS.find(d => d.id === durationId) || DURATIONS[0];
    const gradeThemes = PEDAGOGY_BANK.themes[grade] || [];
    const theme = gradeThemes.find(t => t.id === themeId) || gradeThemes[0];

    const rawTitle = rawCustom 
      ? rawCustom 
      : (theme ? theme.title.replace(/^Chủ đề \d+:\s*/, '') : 'Bài vẽ mĩ thuật');
    const baseTitle = formatCapitalized(rawTitle);
    const lessonTitle = `${baseTitle} cùng ${materialObj.name}`;

    // Tạo kế hoạch dạy học thông minh hiểu sâu sắc ngữ cảnh đề tài và chất liệu
    const pedagogy = prepareLocalLessonPlan(generateSmartPedagogy({
      topic: baseTitle,
      material: materialObj,
      duration: durationObj,
      grade,
      isCustom,
      currentTheme: theme
    }), { topic: baseTitle, grade, material: materialObj.name, materialKey, durationId, duration: durationObj.name, genre: isCustom ? detectArtGenre(baseTitle) : theme?.genre, curriculumRef: isCustom ? null : theme?.title });

    const newIdea = {
      id: 'idea-' + Date.now(),
      grade,
      themeTitle: baseTitle,
      materialKey,
      material: materialObj.name,
      durationId: durationObj.id,
      duration: durationObj.name,
      genre: isCustom ? detectArtGenre(baseTitle) : (theme?.genre || 'general'),
      lessonTitle,
      isCustom,
      generationSource: 'Bản nháp cục bộ',
      referenceTheme: theme?.title || '',
      sourceDescription: isCustom 
        ? `Ý tưởng riêng: "${baseTitle}"` 
        : `SGK Kết Nối Tri Thức: ${theme ? theme.title : baseTitle}`,
      artworkUrl: uploadedIdeaImage || '',
      objectives: pedagogy.objectives,
      materialsNeeded: pedagogy.materialsNeeded,
      teachingProcess: pedagogy.teachingProcess,
      rubricCriteria: pedagogy.rubricCriteria,
      differentiatedMissions: pedagogy.differentiatedMissions,
      critiqueReport: pedagogy.critiqueReport
    };

    setAiGenerationMessage(null);
    setArtworkGallery([]);
    artworkGalleryRef.current = [];
    setArtworkMaterialKey(materialKey);
    artworkSeedRef.current = Math.floor(Math.random() * 1000000);
    setActiveArtworkIndex(0);
    setGeneratedArtworkUrl('');
    setIdeaResult(newIdea);
    ideaResultRef.current = newIdea;

    if (generatePlan && externalAiEnabled) {
      const planRequestId = `${newIdea.id}-plan`;
      aiPlanRequestRef.current = planRequestId;
      setIsAiGenerating(true);
      setAiGeneratingStatus(`Gemini đang soạn kế hoạch riêng cho "${baseTitle}"...`);
      const requestContext = {
        grade,
        topic: baseTitle,
        material: materialObj.name,
        duration: durationObj.name,
        referenceTheme: theme?.title || '',
      };
      void generateAiLesson(requestContext).then(pedagogyResult => {
        const latest = ideaResultRef.current;
        if (aiPlanRequestRef.current !== planRequestId || !latest || latest.id !== newIdea.id) return;
        const updated = { ...latest, ...pedagogyResult, generationSource: 'AI trực tuyến · Gemini' };
        updated.critiqueReport = critiqueAndEnhanceLessonPlan(updated, updated);
        ideaResultRef.current = updated;
        setIdeaResult(updated);
        setAiGenerationMessage(previous => previous?.type === 'error' ? previous : {
          type: 'success', text: 'AI đã soạn kế hoạch theo đúng chủ đề, khối lớp và chất liệu. Thầy/Cô vui lòng xem lại trước khi sử dụng.'
        });
      }).catch(error => {
        const latest = ideaResultRef.current;
        if (aiPlanRequestRef.current === planRequestId && latest?.id === newIdea.id) {
          setAiGenerationMessage({ type: 'error', text: `Chưa tạo được kế hoạch AI; bản nháp cục bộ vẫn được giữ. ${error.message || ''}`.trim() });
        }
      }).finally(() => {
        if (aiPlanRequestRef.current === planRequestId) {
          aiPlanRequestRef.current = null;
          setIsAiGenerating(false);
        }
      });
    } else {
      aiPlanRequestRef.current = null;
      setIsAiGenerating(false);
    }

    if (generateArtwork) {
      void generateArtworkForContext({ topic: baseTitle, grade, materialKey, genre: newIdea.genre, ideaId: newIdea.id, count: 1, append: false });
    }
  };

  const handleRewriteWithAI = async () => {
    if (!ideaResult || isAiGenerating) return;
    if (!externalAiEnabled) { setAiGenerationMessage({ type: 'error', text: 'AI bên ngoài đang tắt để giữ chế độ miễn phí. Giáo án cục bộ vẫn dùng được.' }); return; }
    const currentIdea = ideaResultRef.current;
    const topic = currentIdea.themeTitle;
    const materialObj = MATERIALS.find(m => m.id === currentIdea.materialKey) || MATERIALS[0];
    const durationObj = DURATIONS.find(d => d.id === currentIdea.durationId) || DURATIONS[0];
    const requestContext = {
      grade: currentIdea.grade,
      topic,
      material: materialObj.name,
      duration: durationObj.name,
      referenceTheme: currentIdea.referenceTheme || '',
    };

    const planRequestId = `${currentIdea.id}-rewrite-${Date.now()}`;
    aiPlanRequestRef.current = planRequestId;
    setIsAiGenerating(true);
    setAiGeneratingStatus(`Đang nhờ AI viết riêng kế hoạch cho "${topic}"...`);
    setAiGenerationMessage(null);
    try {
      const pedagogy = await generateAiLesson(requestContext);
      const previous = ideaResultRef.current;
      if (aiPlanRequestRef.current !== planRequestId) return;
      const applied = Boolean(previous && previous.id === currentIdea.id && previous.grade === requestContext.grade && previous.themeTitle === topic && previous.material === requestContext.material && previous.duration === requestContext.duration);
      if (applied) {
        setIdeaResult(current => {
          if (!current || current.grade !== requestContext.grade || current.themeTitle !== topic || current.material !== requestContext.material || current.duration !== requestContext.duration) return current;
          const updated = { ...current, ...pedagogy, generationSource: 'AI trực tuyến · Gemini' };
          updated.critiqueReport = critiqueAndEnhanceLessonPlan(updated, updated);
          ideaResultRef.current = updated;
          return updated;
        });
      }
      setAiGenerationMessage(applied
        ? { type: 'success', text: 'AI đã viết lại kế hoạch theo chủ đề, khối lớp và chất liệu đã chọn. Hãy xem lại trước khi sử dụng.' }
        : { type: 'error', text: 'Lựa chọn đã thay đổi trong lúc chờ AI; bản mới chưa được áp dụng. Hãy tạo lại theo lựa chọn hiện tại.' });
    } catch (error) {
      if (aiPlanRequestRef.current === planRequestId) {
        setAiGenerationMessage({ type: 'error', text: error.message || 'Chưa kết nối được AI trực tuyến; bản nháp hiện tại vẫn được giữ nguyên.' });
      }
    } finally {
      if (aiPlanRequestRef.current === planRequestId) {
        aiPlanRequestRef.current = null;
        setIsAiGenerating(false);
      }
    }
  };

  // Xử lý tạo kế hoạch bài dạy bằng Câu lệnh tự nhiên AI (Giai đoạn 3)
  const handleGenerateNaturalPrompt = async (promptOverride = null) => {
    const promptText = promptOverride || naturalPrompt;
    if (!promptText.trim()) return;
    const planRequestId = `natural-${Date.now()}-${Math.random()}`;
    aiPlanRequestRef.current = planRequestId;
    setIsAiGenerating(true);
    setAiGeneratingStatus('Đang phân tích câu lệnh & thiết kế bài dạy GDPT 2018...');
    try {
      const result = await generateNaturalIdeaLesson({
        prompt: promptText,
        isOnline: externalAiEnabled && navigator.onLine
      });
      if (aiPlanRequestRef.current !== planRequestId) return;
      setNaturalAnalysis(result.parsedParams);
      setSelectedDuration(result.parsedParams.periods === 2 ? 70 : 35);
      setSelectedGrade(result.parsedParams.grade);
      setSelectedMaterial(result.parsedParams.materialKey);
      
      const plan = result.plan;
      const newIdea = {
        ...plan,
        id: `idea-nat-${Date.now()}`,
        durationId: result.parsedParams.periods === 2 ? 70 : 35,
        grade: result.parsedParams.grade,
        themeTitle: result.parsedParams.topic,
        lessonTitle: plan.lessonTitle,
        material: result.parsedParams.material,
        materialKey: result.parsedParams.materialKey,
        genre: result.parsedParams.genre || 'general',
        duration: result.parsedParams.duration,
        studentLevel: result.parsedParams.studentLevel,
        specialConditions: result.parsedParams.specialConditions,
        safetyAlert: result.parsedParams.safetyAlert,
        assumptions: result.parsedParams.assumptions,
        objectives: plan.objectives,
        materialsNeeded: plan.materialsNeeded,
        teachingProcess: plan.teachingProcess,
        rubricCriteria: plan.rubricCriteria,
        isCustom: true,
        sourceDescription: result.source
      };
      setArtworkGallery([]);
      artworkGalleryRef.current = [];
      setGeneratedArtworkUrl('');
      setActiveArtworkIndex(0);
      setArtworkMaterialKey(newIdea.materialKey);
      artworkSeedRef.current = Math.floor(Math.random() * 1000000);
      setIdeaResult(newIdea);
      ideaResultRef.current = newIdea;

      // Tự động tạo tranh minh họa
      void generateArtworkForContext({
        topic: result.parsedParams.topic,
        grade: result.parsedParams.grade,
        materialKey: result.parsedParams.materialKey,
        genre: result.parsedParams.genre,
        ideaId: newIdea.id
      });
    } catch (err) {
      alert('Không thể tạo kế hoạch: ' + err.message);
    } finally {
      if (aiPlanRequestRef.current === planRequestId) {
        aiPlanRequestRef.current = null;
        setIsAiGenerating(false);
        setAiGeneratingStatus('');
      }
    }
  };

  // Cập nhật trường nội dung khi giáo viên chỉnh sửa kế hoạch
  const handleUpdatePlanField = (field, value, subfield = null) => {
    const previous = ideaResultRef.current;
    if (!previous) return;
    const updated = subfield ? { ...previous, [field]: { ...previous[field], [subfield]: value } } : { ...previous, [field]: value };
    updated.critiqueReport = critiqueAndEnhanceLessonPlan(updated, updated);
    ideaResultRef.current = updated;
    setIdeaResult(updated);
  };

  // Tự động khởi tạo ngay khi mở Xưởng Ý Tưởng để không bao giờ bị trống
  useEffect(() => {
    handleGenerateIdea(null, null, { generateArtwork: false, generatePlan: false });
  }, []);

  // Chọn nhanh gợi ý thông minh 1 chạm
  const handleSelectSuggestion = (sug) => {
    setCustomIdeaInput(sug.title);
    const newMaterial = sug.material || selectedMaterial;
    if (sug.material) {
      setSelectedMaterial(sug.material);
    }
    handleGenerateIdea(sug.title, newMaterial, { generateArtwork: true, generatePlan: true });
  };

  const handleGenerateMoreArtwork = (count = 1) => {
    const currentIdea = ideaResultRef.current;
    if (!currentIdea) return;
    return generateArtworkForContext({
      topic: currentIdea.themeTitle,
      grade: currentIdea.grade,
      materialKey: artworkMaterialKey || currentIdea.materialKey,
      genre: currentIdea.genre,
      seed: ++artworkSeedRef.current,
      ideaId: currentIdea.id,
      count,
      append: true
    });
  };

  // Chọn tranh trong thư viện tranh đã sinh
  const handleSelectArtwork = (idx) => {
    if (idx >= 0 && idx < artworkGallery.length) {
      setActiveArtworkIndex(idx);
      const chosen = artworkGallery[idx];
      setArtworkMaterialKey(chosen.styleKey);
      setGeneratedArtworkUrl(chosen.url);
      if (ideaResult) {
        const updated = { ...ideaResultRef.current, artworkUrl: chosen.url };
        ideaResultRef.current = updated;
        setIdeaResult(updated);
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
                <p className="text-xs text-slate-500">Soạn bản nháp bài dạy mĩ thuật tiểu học để giáo viên duyệt</p>
              </div>
            </div>
            {/* Offline disclosure badge */}
            <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 leading-tight">
                Khi bấm tạo ý tưởng, chủ đề, khối lớp, chất liệu và thời lượng được phân tích để soạn kế hoạch và tranh minh họa. Giáo án mặc định được soạn cục bộ. Khi yêu cầu tranh, chủ đề được gửi đến dịch vụ ngoài; không nhập dữ liệu học sinh.
              </p>
            </div>

            {/* BỘ CHỌN CHẾ ĐỘ: CÂU LỆNH TỰ NHIÊN AI (GIAI ĐOẠN 3) VS BIỂU MẪU NHANH */}
            <div className="mt-3 flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setWorkshopMode('natural')}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  workshopMode === 'natural'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>💬 Câu Lệnh Tự Nhiên</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkshopMode('form')}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  workshopMode === 'form'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📋 Biểu Mẫu Nhanh</span>
              </button>
            </div>
          </div>

          {/* CHẾ ĐỘ 1: NHẬP CÂU LỆNH TỰ NHIÊN BẰNG AI */}
          {workshopMode === 'natural' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>Nhập Yêu Cầu Bài Học Bằng Tiếng Việt Tự Do:</span>
                  <span className="text-[10px] text-amber-700 font-bold">✨ Phân tích quy tắc cục bộ</span>
                </label>
                <textarea
                  rows={4}
                  value={naturalPrompt}
                  onChange={(e) => setNaturalPrompt(e.target.value)}
                  placeholder="Ví dụ: Tạo kế hoạch dạy vẽ ngôi nhà cho lớp 2, thời lượng 35 phút, dùng sáp màu, có phần khởi động vui..."
                  className="w-full p-3 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium leading-relaxed shadow-2xs"
                />

                {/* Các Câu Lệnh Mẫu 1 Chạm */}
                <div className="mt-2 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block">Ví dụ gợi ý (Bấm 1 chạm để thử ngay):</span>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { icon: '🏠', text: 'Tạo kế hoạch dạy vẽ ngôi nhà cho lớp 2, thời lượng 35 phút, dùng sáp màu, có phần khởi động vui.' },
                      { icon: '🌸', text: 'Tạo bài học xé dán vườn hoa cho lớp 3, phù hợp học sinh yếu, gồm 4 bước thực hành.' },
                      { icon: '🐾', text: 'Tạo giáo án 2 tiết về con vật quanh em, có trò chơi khởi động và hoạt động trưng bày.' },
                      { icon: '✂️', text: 'Tạo một hoạt động đơn giản cho lớp 1, không dùng kéo và không dùng vật liệu nguy hiểm.' },
                      { icon: '🚀', text: 'Biến ý tưởng vũ trụ tương lai thành 5 slide cho lớp 5, mỗi slide có lời giảng ngắn và câu hỏi gợi mở.' }
                    ].map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNaturalPrompt(sug.text);
                          handleGenerateNaturalPrompt(sug.text);
                        }}
                        className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg text-[11px] text-slate-700 flex items-start gap-1.5 transition-all cursor-pointer active:scale-98"
                      >
                        <span className="shrink-0">{sug.icon}</span>
                        <span className="line-clamp-2">{sug.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerateNaturalPrompt()}
                  disabled={isAiGenerating || !naturalPrompt.trim()}
                  className="mt-3.5 w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md shadow-amber-200 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>{isAiGenerating ? 'Đang phân tích & thiết kế...' : '⚡ Tạo Kế Hoạch & Tranh AI Theo Câu Lệnh'}</span>
                </button>
              </div>

              {/* BẢNG PHÂN TÍCH THAM SỐ ĐÃ NHẬN DIỆN */}
              {naturalAnalysis && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs animate-in fade-in">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5 pb-1 border-b border-amber-200/60">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kết Quả Nhận Diện Yêu Cầu Của Thầy/Cô:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="bg-white p-1.5 rounded-md border border-amber-100">
                      <span className="text-slate-400 block text-[9px] font-bold">KHỐI LỚP</span>
                      <span className="font-extrabold text-amber-900">Lớp {naturalAnalysis.grade}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-md border border-amber-100">
                      <span className="text-slate-400 block text-[9px] font-bold">THỜI LƯỢNG</span>
                      <span className="font-extrabold text-amber-900">{naturalAnalysis.duration}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-md border border-amber-100 col-span-2">
                      <span className="text-slate-400 block text-[9px] font-bold">CHỦ ĐỀ CHÍNH</span>
                      <span className="font-bold text-slate-800">{naturalAnalysis.topic}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-md border border-amber-100">
                      <span className="text-slate-400 block text-[9px] font-bold">CHẤT LIỆU</span>
                      <span className="font-bold text-slate-800">{naturalAnalysis.material}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-md border border-amber-100">
                      <span className="text-slate-400 block text-[9px] font-bold">ĐỐI TƯỢNG</span>
                      <span className="font-bold text-slate-800">{naturalAnalysis.studentLevel}</span>
                    </div>
                  </div>

                  {/* Cảnh Báo An Toàn (Nếu có vật liệu nguy hiểm trong câu lệnh) */}
                  {naturalAnalysis.safetyAlert && (
                    <div className="p-2 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-[11px] font-medium leading-tight">
                      ⚠️ {naturalAnalysis.safetyAlert}
                    </div>
                  )}

                  {/* Giả định mặc định */}
                  {naturalAnalysis.assumptions?.length > 0 && (
                    <div className="text-[10px] text-amber-800/80 pt-1">
                      ℹ️ Giả định tự động: {naturalAnalysis.assumptions.join(' • ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CHẾ ĐỘ 2: BIỂU MẪU NHANH (GIỮ NGUYÊN) */}
          {workshopMode === 'form' && (
            <div className="space-y-4 animate-in fade-in">
          {/* 1. Select Grade */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              1. Khối Lớp (Bấm chọn lớp để AI tự động chuyển đổi bài dạy):
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PEDAGOGY_BANK.grades.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGrade(g.id);
                    const newThemes = PEDAGOGY_BANK.themes[g.id] || [];
                    const nextThemeId = newThemes[0]?.id || selectedThemeId;
                    setSelectedThemeId(nextThemeId);
                    handleGenerateIdea(null, null, { generateArtwork: false, generatePlan: false, grade: g.id, themeId: nextThemeId, durationId: selectedDuration });
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedGrade === g.id
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-300'
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                2. Nhập Ý Tưởng Riêng (Tự Do):
              </label>
              {customIdeaInput && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomIdeaInput('');
                    handleGenerateIdea('', null, { generateArtwork: false, generatePlan: false });
                  }}
                  className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline"
                  title="Xóa ô nhập để chuyển sang chủ đề SGK bên dưới"
                >
                  ✕ Xóa ô nhập
                </button>
              )}
            </div>
            <input
              type="text"
              value={customIdeaInput}
              onChange={(e) => setCustomIdeaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerateIdea();
                }
              }}
              placeholder="Ví dụ: Con heo, chú mèo, vườn hoa, ô tô..."
              className="w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />

            {/* Nút Tạo Ngay Theo Ý Tưởng Tự Do */}
            {customIdeaInput.trim() && (
              <button
                type="button"
                onClick={() => handleGenerateIdea(customIdeaInput.trim())}
                disabled={isAiGenerating || isImageLoading}
                className="mt-2 w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer animate-in fade-in"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Tạo nhanh mẫu bài học & tranh minh họa "{customIdeaInput.trim()}"</span>
              </button>
            )}

            {/* GỢI Ý Ý TƯỞNG THÔNG MINH CHO TỪNG KHỐI LỚP (BẤM 1 CHẠM TẠO NGAY) */}
            <div className="mt-2.5">
              <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Gợi ý hay Lớp {selectedGrade} (Bấm 1 chạm để tạo ngay):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(SMART_GRADE_SUGGESTIONS[selectedGrade] || []).map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="px-2 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 hover:border-amber-400 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                    title={`Bấm để tự động tạo bài dạy và tranh mẫu "${sug.title}"`}
                  >
                    <span>{sug.icon}</span>
                    <span>{sug.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <span className="text-[10px] text-slate-400 mt-1.5 block">
              (Thầy/Cô có thể tự gõ ý tưởng, bấm gợi ý trên hoặc chọn theo chủ đề SGK bên dưới)
            </span>
          </div>

          {/* 3. Select Theme */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              3. Chủ Đề Bài Học (Sách Kết Nối Tri Thức):
            </label>
            <select
              value={selectedThemeId}
              onChange={(e) => {
                const themeId = e.target.value;
                setSelectedThemeId(themeId);
                setCustomIdeaInput('');
                handleGenerateIdea('', null, { generateArtwork: false, generatePlan: false, grade: selectedGrade, themeId, durationId: selectedDuration });
              }}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
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
                  onClick={() => {
                    setSelectedMaterial(mat.id);
                    handleGenerateIdea(null, mat.id, { generateArtwork: false, generatePlan: false, grade: selectedGrade, themeId: selectedThemeId, durationId: selectedDuration });
                  }}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    selectedMaterial === mat.id
                      ? 'bg-amber-50 text-amber-900 border-amber-400 font-bold ring-1 ring-amber-300'
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
              5. Thời Lượng Tiết Dạy:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATIONS.map(dur => (
                <button
                  key={dur.id}
                  onClick={() => {
                    setSelectedDuration(dur.id);
                    handleGenerateIdea(null, null, { generateArtwork: false, generatePlan: false, grade: selectedGrade, themeId: selectedThemeId, durationId: dur.id });
                  }}
                  className={`p-2.5 text-xs rounded-xl border text-left transition-all cursor-pointer ${
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
          )}
        </div>

        {/* Active Context Banner & Generate Button */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          {/* Thông tin ngữ cảnh đang chọn */}
          <div className="p-2.5 rounded-xl border text-xs bg-slate-50 border-slate-200">
            {customIdeaInput.trim() ? (
              <div className="flex items-start justify-between gap-1">
                <div>
                  <div className="font-extrabold text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Đang tạo theo: Ý tưởng riêng</span>
                  </div>
                  <div className="text-[11px] text-amber-800 font-semibold truncate max-w-[210px] mt-0.5">
                    "{customIdeaInput.trim()}"
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomIdeaInput('')}
                  className="text-[10px] text-slate-500 hover:text-rose-600 font-bold shrink-0 underline"
                  title="Xóa ý tưởng riêng để dùng theo Chủ đề SGK"
                >
                  ✕ Dùng SGK
                </button>
              </div>
            ) : (
              <div>
                <div className="font-extrabold text-indigo-950 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Đang tạo theo: SGK Kết Nối Tri Thức</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium truncate max-w-[240px] mt-0.5">
                  {currentTheme?.title}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleGenerateIdea()}
            disabled={isAiGenerating || isImageLoading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md shadow-amber-200 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>{isAiGenerating || isImageLoading ? 'Đang tạo nội dung AI...' : 'Tạo Ý Tưởng + Tranh AI'}</span>
          </button>
          <button
            type="button"
            onClick={handleRewriteWithAI}
            disabled={!ideaResult || isAiGenerating}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAiGenerating && aiGeneratingStatus.startsWith('Đang nhờ AI') ? 'AI đang viết...' : 'Viết lại kế hoạch bằng AI'}</span>
          </button>
          {aiGenerationMessage && (
            <p className={`text-[11px] leading-relaxed ${aiGenerationMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`} role="status">
              {aiGenerationMessage.text}
            </p>
          )}
        </div>
      </div>

      {/* Right Output Display Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isAiGenerating && !ideaResult ? (
          <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border-2 border-amber-300 shadow-xl p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-black text-slate-800">
                {aiGeneratingStatus.startsWith('Gemini đang soạn') ? '🤖 Gemini đang soạn kế hoạch sư phạm...' : '🎨 Đang dựng bản nháp nhanh...'}
              </h4>
              <p className="text-xs text-amber-900 font-bold bg-amber-50 py-1.5 px-4 rounded-full border border-amber-200 inline-block">
                {aiGeneratingStatus || 'Đang phân tích ngữ cảnh và thiết kế giáo án GDPT 2018...'}
              </p>
            </div>
            <div className="w-48 h-2 bg-slate-100 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Tích hợp chuẩn CT GDPT 2018 môn Mĩ thuật Tiểu học (Thông tư 32/2018/TT-BGDĐT)
            </p>
          </div>
        ) : ideaResult ? (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            {/* Header of Idea Result */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Lớp {ideaResult.grade} • {ideaResult.duration} • {ideaResult.material}
                  </span>
                  {ideaResult.sourceDescription && (
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      ideaResult.isCustom 
                        ? 'bg-rose-50 text-rose-800 border-rose-200' 
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}>
                      {ideaResult.isCustom ? '✨ ' : '📚 '}{ideaResult.sourceDescription}
                    </span>
                  )}
                  {ideaResult.generationSource && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-violet-50 text-violet-800 border-violet-200">
                      {ideaResult.generationSource}
                    </span>
                  )}
                </div>
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

            {ideaResult.critiqueReport && (
              <section data-testid="lesson-review" className="bg-slate-50 border border-slate-300 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Rà soát sư phạm cục bộ — {ideaResult.critiqueReport.score}/100 điểm theo bộ quy tắc</h3>
                <p className="text-xs text-slate-600">{ideaResult.critiqueReport.reviewMethod} Giáo viên duyệt trước khi sử dụng; không bảo đảm 100% an toàn.</p>
                <p className={ideaResult.critiqueReport.safetyCheck.isSafe ? 'text-xs text-slate-700' : 'text-xs font-bold text-red-700'}>{ideaResult.critiqueReport.safetyStatus}</p>
                <ul className="text-xs space-y-1">{ideaResult.critiqueReport.pedagogicalHighlights.map((item, i) => <li key={i}>{item}</li>)}</ul>
                {ideaResult.critiqueReport.safetyCheck.warnings.map((item, i) => <p className="text-xs text-red-700" key={i}>{item}</p>)}
                {ideaResult.critiqueReport.safetyCheck.substitutions.map((item, i) => <p className="text-xs font-bold text-amber-800" key={i}>{item}</p>)}
                <p className="text-xs"><strong>Gợi ý cho giáo viên:</strong> {ideaResult.critiqueReport.teacherAdvice}</p>
              </section>
            )}

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

                {/* ĐỔI BIẾN THỂ CHẤT LIỆU TRANH NHANH */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-amber-200/60 flex-wrap">
                  <span className="text-[10px] font-extrabold text-amber-900 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Tạo biến thể mới theo chất liệu (không chuyển đổi ảnh gốc):
                  </span>
                  {[
                    { id: 'crayon', name: 'Sáp màu', icon: '🖍️' },
                    { id: 'watercolor', name: 'Màu nước', icon: '🎨' },
                    { id: 'paper', name: 'Xé dán', icon: '✂️' },
                    { id: 'clay', name: 'Đất nặn', icon: '🏺' }
                  ].map((mat) => (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => {
                        setArtworkMaterialKey(mat.id);
                        if (ideaResult) {
                          generateArtworkForContext({
                            topic: ideaResult.themeTitle,
                            grade: ideaResult.grade,
                            materialKey: mat.id,
                            genre: ideaResult.genre || 'general',
                            ideaId: ideaResult.id,
                            count: 1,
                            append: true
                          });
                        }
                      }}
                      disabled={isImageLoading}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer active:scale-95 ${
                        artworkMaterialKey === mat.id
                          ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      <span>{mat.icon} {mat.name}</span>
                    </button>
                  ))}
                </div>

            {/* KHU VỰC THƯ VIỆN TRANH MẪU MINH HỌA SINH THEO Ý TƯỞNG (NHIỀU TRANH, LIÊN TỤC) */}
            {ideaResult && !generatedArtworkUrl && artworkGallery.length === 0 && (
              <div className="bg-white border border-dashed border-amber-300 rounded-2xl p-5 text-center space-y-2">
                <p className="text-sm font-bold text-slate-700">Chưa có tranh minh họa cho ý tưởng này.</p>
                <p className="text-xs text-slate-500">Tạo tranh AI theo đúng chủ đề, lớp và chất liệu đang chọn.</p>
                <button
                  type="button"
                  onClick={() => handleGenerateMoreArtwork(1)}
                  disabled={isImageLoading}
                  className="px-4 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg"
                >
                  {isImageLoading ? 'Đang tạo tranh AI...' : 'Tạo tranh AI theo ý tưởng này'}
                </button>
              </div>
            )}

            {(generatedArtworkUrl || artworkGallery.length > 0) && (
              <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/50 border border-amber-200 rounded-2xl p-4 shadow-2xs space-y-3">
                {/* Header thanh công cụ tranh */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-500 text-white rounded-lg text-xs shadow-xs">🎨</span>
                    <div>
                      <h3 className="font-extrabold text-xs md:text-sm text-amber-950 flex items-center gap-2">
                        <span>Bộ Sưu Tập Tranh Minh Họa AI ({artworkGallery.length} bức)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Dịch vụ tạo tranh bên ngoài</span>
                      </h3>
                      <p className="text-[11px] text-amber-800">
                        {artworkGallery[activeArtworkIndex]?.styleName || ideaResult.material} • Bấm vào các tranh nhỏ bên dưới để chọn tranh muốn dùng
                      </p>
                      <p className="text-[11px] font-bold text-red-700">Ảnh chưa được kiểm chứng đúng đề tài/chất liệu. Giáo viên cần duyệt trước khi chèn; dịch vụ ngoài có thể trả ảnh sai hoặc từ chối.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Nút Tạo thêm 1 tranh mới siêu tốc */}
                    <button
                      type="button"
                      onClick={() => handleGenerateMoreArtwork(1)}
                      disabled={isImageLoading}
                      className="px-3 py-1 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Tạo thêm một tranh AI theo đúng ý tưởng và chất liệu đang dùng"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                      <span>+ Tạo thêm 1 tranh AI</span>
                    </button>

                    {/* Nút Tạo bộ 4 tranh mới cùng lúc */}
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
                      <span className="text-xs font-bold">{aiGeneratingStatus || 'Đang tạo tranh AI theo chủ đề, khối lớp và chất liệu...'}</span>
                    </div>
                  )}
                  <img
                    src={generatedArtworkUrl}
                    alt={`Tranh AI minh họa: ${ideaResult.themeTitle}`}
                    onError={() => {
                      setIsImageLoading(false);
                      setAiGenerationMessage({ type: 'error', text: 'Không tải được tranh AI đang chọn. Hãy thử tạo lại tranh theo cùng chủ đề.' });
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
                            onError={() => {
                              setAiGenerationMessage({ type: 'error', text: 'Không tải được một tranh trong bộ sưu tập. Hãy thử tạo lại tranh đó.' });
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
                        <span className="text-[11px] font-bold text-purple-900 block mb-1">4 bước tạo hình thị phạm:</span>
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

            {/* V. Differentiated Art Missions (Thử Thách Phân Hóa Năng Lực Học Sinh - TT27) */}
            {ideaResult.differentiatedMissions && (
              <div>
                <h3 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>🎯</span> V. Nhiệm vụ phân hóa gợi ý (không phải mức đánh giá chính thức TT27)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1">
                      <span>🌱</span> Mức 1: Khám Phá Cơ Bản
                    </span>
                    <p className="text-amber-950 text-[11px] leading-relaxed">
                      {ideaResult.differentiatedMissions.tier1_basic}
                    </p>
                  </div>

                  <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs space-y-1">
                    <span className="font-extrabold text-sky-900 flex items-center gap-1">
                      <span>⭐</span> Mức 2: Vận Dụng
                    </span>
                    <p className="text-sky-950 text-[11px] leading-relaxed">
                      {ideaResult.differentiatedMissions.tier2_standard}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1">
                    <span className="font-extrabold text-purple-900 flex items-center gap-1">
                      <span>🚀</span> Mức 3: Mở Rộng Sáng Tạo
                    </span>
                    <p className="text-purple-950 text-[11px] leading-relaxed">
                      {ideaResult.differentiatedMissions.tier3_advanced}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
