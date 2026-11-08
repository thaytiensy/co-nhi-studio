// Rà soát theo quy tắc cục bộ, không phải chứng nhận hay một agent AI độc lập.
const text = value => typeof value === 'string' ? value.trim() : '';
const filled = value => text(value).length > 0;
export const MISSION_KEYS = ['tier1_basic', 'tier2_standard', 'tier3_advanced'];
const SAFETY_RULES = [
  { pattern: /dao\s*(?:rọc\s*giấy|lam|cạo)|lưỡi\s*dao|\b(?:knife|knives|razor|blade)\b/giu, replacement: 'Dùng kéo đầu tròn dưới sự hướng dẫn của giáo viên, hoặc xé giấy bằng tay.' },
  { pattern: /súng\s*bắn\s*keo(?:\s*nến)?|keo\s*nến(?:\s*nóng)?|keo\s*502|\bhot\s*glue\b/giu, replacement: 'Dùng hồ dán nguội có nhãn phù hợp trẻ em hoặc băng dính hai mặt.' },
  { pattern: /(?:a[-\s]?x[ií]t|hóa\s*chất\s*tẩy|hoá\s*chất\s*tẩy|chất\s*tẩy(?:\s*rửa)?|dung\s*môi|xăng|cồn|bật\s*lửa)|\b(?:acid|solvent|gasoline|bleach)\b/giu, replacement: 'Loại bỏ hóa chất/vật dễ cháy; dùng nước sạch và vật liệu có nhãn an toàn phù hợp độ tuổi.' }
];
function strings(value, path = '') {
  if (typeof value === 'string') return [{ path, value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, v]) => strings(v, path ? `${path}.${key}` : key));
  return [];
}
export function inspectLessonSafety(plan = {}, context = {}) {
  const content = { objectives: plan.objectives, materialsNeeded: plan.materialsNeeded, teachingProcess: plan.teachingProcess, rubricCriteria: plan.rubricCriteria, differentiatedMissions: plan.differentiatedMissions, material: plan.material, contextMaterial: context.material };
  const findings = [];
  for (const entry of strings(content)) {
    for (const rule of SAFETY_RULES) {
      rule.pattern.lastIndex = 0;
      for (const match of entry.value.matchAll(rule.pattern)) {
        // Không coi câu nhắc "không dùng dao ..." là chỉ dẫn sử dụng dao.
        const prefix = entry.value.slice(Math.max(0, match.index - 90), match.index).split(/[.;!?\n]/u).at(-1);
        if (/(?:không|tránh|cấm|tuyệt đối không|không được)(?:\s+(?:sử dụng|dùng|cho trẻ dùng))?\s*$/iu.test(prefix)) continue;
        findings.push({ field: entry.path, term: match[0], substitution: rule.replacement });
      }
    }
  }
  const unique = findings.filter((f, i) => findings.findIndex(g => g.field === f.field && g.term.toLowerCase() === f.term.toLowerCase()) === i);
  return { isSafe: unique.length === 0, findings: unique, warnings: unique.map(f => `${f.field}: phát hiện “${f.term}”.`), substitutions: [...new Set(unique.map(f => f.substitution))] };
}
export function materialKeyOf(context = {}) {
  if (['crayon', 'watercolor', 'paper', 'clay', 'recycled'].includes(context.materialKey)) return context.materialKey;
  const material = text(context.material || context.materialsNeeded?.student).toLowerCase();
  if (/đất\s*nặn|đất\s*sét|plasticine|clay/iu.test(material)) return 'clay';
  if (/tái\s*chế|vỏ\s*hộp|lá\s*cây/iu.test(material)) return 'recycled';
  if (/xé\s*dán|cắt\s*dán|giấy\s*màu/iu.test(material)) return 'paper';
  if (/màu\s*nước|watercolor/iu.test(material)) return 'watercolor';
  return 'crayon';
}
export function materialTeachingSteps(context = {}) {
  const topic = text(context.topic || context.themeTitle) || 'chủ đề đã chọn';
  const noScissors = context.specialConditions?.some(c => /không dùng kéo/iu.test(c));
  const portrait = context.genre === 'portrait_human';
  const stillLife = context.genre === 'still_life';
  const steps = {
    crayon: [
      stillLife ? `Bước 1: Quan sát ${topic}; xác định mặt bàn, khung hình chung và tỉ lệ các vật mẫu, phác nhẹ bố cục trên giấy.` : portrait ? `Bước 1: Quan sát ${topic}; phác trục và dáng nhân vật, chọn vị trí hình chính/phụ trên giấy.` : `Bước 1: Quan sát ${topic}; chọn vị trí và ước lượng tỉ lệ hình chính/phụ trên giấy, phác hình bằng nét thật nhẹ.`,
      portrait ? `Bước 2: Phác khuôn mặt và thân người phù hợp ${topic}; xác định vị trí mắt, mũi, miệng bằng hình đơn giản.` : `Bước 2: Vẽ các hình lớn thể hiện ${topic}, điều chỉnh tỉ lệ và vị trí trước khi thêm chi tiết.`,
      `Bước 3: Thêm đặc điểm nhận biết và chi tiết có liên quan đến ${topic}; học sinh tự chọn, không buộc thêm đối tượng ngoài đề tài.`,
      stillLife ? 'Bước 4: Dùng sáp màu hoặc chì màu tô từ mảng lớn đến chi tiết; quan sát phần đón sáng và bóng đổ, thử sắc độ phù hợp khả năng học sinh.' : 'Bước 4: Dùng sáp màu hoặc chì màu tô từ mảng lớn đến chi tiết, thay đổi lực tay để tạo sắc độ và nhấn phần chính.'
    ],
    paper: [
      `Bước 1: Quan sát ${topic}; chọn giấy màu, ướm bố cục các mảng chính và phụ trên giấy nền.`,
      `Bước 2: ${noScissors ? 'Xé giấy bằng tay, không dùng kéo' : 'Xé giấy bằng tay thành mảng lớn rồi mảng nhỏ'} để tạo hình các bộ phận của ${topic}.`,
      'Bước 3: Xếp thử các mảng giấy, điều chỉnh vị trí trước khi phết lớp hồ dán nguội mỏng để dán từ mảng chính đến chi tiết.',
      'Bước 4: Miết nhẹ các mép giấy, thêm chi tiết từ giấy xé, kiểm tra độ bám và thu dọn giấy vụn.'
    ],
    clay: [
      `Bước 1: Quan sát ${topic}, chọn đất nặn có nhãn phù hợp độ tuổi và chia lượng đất cho từng bộ phận; làm mềm đất bằng tay.`,
      `Bước 2: Lăn tròn, lăn dài hoặc ấn dẹt các khối đất để tạo phần chính của ${topic}.`,
      'Bước 3: Ghép các khối lớn trước, miết chắc mối nối bằng ngón tay rồi thêm các bộ phận và chi tiết nhỏ.',
      'Bước 4: Tạo vân bằng dụng cụ đầu tù, cân chỉnh để khối đứng vững trên đế; không đưa đất vào miệng, rửa tay sau khi thực hành.'
    ],
    watercolor: [
      `Bước 1: Quan sát ${topic}, chọn bố cục và phác nét chì thật nhẹ trên giấy phù hợp màu nước.`,
      'Bước 2: Pha loãng màu trên bảng pha, thử sắc độ trên giấy nháp và dùng cọ tô mảng lớn từ nhạt đến đậm.',
      `Bước 3: Đợi lớp màu trước se khô rồi tô các mảng chính và chi tiết của ${topic}; tránh chà cọ làm rách giấy.`,
      'Bước 4: Nhấn một vài điểm đậm, giữ khoảng sáng, để tranh khô và rửa cọ bằng nước sạch.'
    ],
    recycled: [
      `Bước 1: Quan sát ${topic}, chọn vật liệu tái chế sạch, khô, không sắc nhọn, không có chi tiết nhỏ dễ nuốt; giáo viên chuẩn bị sẵn phần cần cắt.`,
      'Bước 2: Sắp thử các hộp giấy, lá cây hoặc mảng bìa để tạo bộ phận chính, kiểm tra kích thước và độ vững.',
      'Bước 3: Ghép các bộ phận bằng hồ dán nguội hoặc băng dính hai mặt; học sinh không sử dụng dụng cụ nóng hay sắc nhọn.',
      'Bước 4: Trang trí bằng vật liệu nhẹ, kiểm tra các mối nối và thu gom vật liệu thừa đúng nơi quy định.'
    ]
  };
  if (materialKeyOf(context) === 'crayon' && context.curriculumRef) return null;
  return steps[materialKeyOf(context)] || null;
}
export function lessonDurationMinutes(context = {}) {
  if (Number(context.durationId) === 70 || context.periods === 2 || /70\s*phút|2\s*tiết|hai\s*tiết/iu.test(String(context.duration || ''))) return 70;
  return 35;
}
export function buildDifferentiatedMissions(context = {}) {
  const topic = text(context.topic || context.themeTitle) || 'chủ đề bài học';
  const key = materialKeyOf(context);
  const action = key === 'clay' ? 'nặn và ghép các khối chính' : key === 'paper' ? 'xé và dán các mảng chính' : key === 'recycled' ? 'lắp ghép các bộ phận chính' : 'phác hình và chọn màu';
  return {
    tier1_basic: `Thử thách 1 (Khám phá): Với hỗ trợ khi cần, ${action} thể hiện ${topic}; học sinh tự chọn chi tiết vừa sức.`,
    tier2_standard: `Thử thách 2 (Vận dụng): Chủ động ${action}, sắp xếp phần chính/phụ rõ ràng và hoàn thiện sản phẩm về ${topic}.`,
    tier3_advanced: `Thử thách 3 (Mở rộng sáng tạo): Thử cách sắp xếp, chi tiết hoặc chất cảm riêng cho ${topic}; chia sẻ lựa chọn và điều muốn thử tiếp.`
  };
}
export function reviewLessonPlan(plan, context = {}) {
  if (!plan || typeof plan !== 'object') plan = {};
  const grade = /^[1-5]$/.test(String(context.grade || plan.grade)) ? Number(context.grade || plan.grade) : 1;
  const activities = Array.isArray(plan.teachingProcess) ? plan.teachingProcess : [];
  const phasePatterns = [/khởi\s*động/iu, /khám\s*phá|quan\s*sát|kiến\s*tạo|thị\s*phạm/iu, /luyện\s*tập|thực\s*hành|sáng\s*tạo/iu, /trưng\s*bày|chia\s*sẻ|đánh\s*giá|nhận\s*xét/iu];
  const validActivity = p => p && filled(p.name) && filled(p.activity);
  const process = activities.length === 4 && activities.every((p, i) => validActivity(p) && phasePatterns[i].test(p.name));
  const steps = activities[1]?.fourSteps;
  const has4Steps = Array.isArray(steps) && steps.length === 4 && steps.every(filled) && new Set(steps.map(s => text(s).toLowerCase())).size === 4;
  const stepText = has4Steps ? steps.join(' ') : '';
  const key = materialKeyOf({ ...plan, ...context });
  const technique = { paper: /xé|cắt/iu, clay: /nặn|lăn|miết/iu, watercolor: /pha|cọ|loãng/iu, recycled: /ghép|lắp|nối/iu, crayon: /vẽ|phác|tô|màu/iu }[key];
  const wrongTechnique = key === 'clay' && /tô\s*màu|nét\s*chì|vẽ\s*nét|giấy\s*vẽ/iu.test(stepText);
  const materialAligned = has4Steps && technique.test(stepText) && !wrongTechnique;
  const missions = plan.differentiatedMissions || {};
  const hasMissions = MISSION_KEYS.every(k => filled(missions[k])) && new Set(MISSION_KEYS.map(k => text(missions[k]).toLowerCase())).size === 3;
  const safetyCheck = inspectLessonSafety(plan, context);
  const objectives = ['knowledge', 'skills', 'qualities'].every(k => filled(plan.objectives?.[k]));
  const materials = ['teacher', 'student'].every(k => filled(plan.materialsNeeded?.[k]));
  const rubric = Array.isArray(plan.rubricCriteria) && plan.rubricCriteria.length >= 3 && plan.rubricCriteria.every(filled);
  const minuteValues = activities.map(p => p?.durationMinutes);
  const durationChecked = minuteValues.length === 4 && minuteValues.every(v => Number.isFinite(v) && v > 0);
  const duration = durationChecked && minuteValues.reduce((a, b) => a + b, 0) === lessonDurationMinutes({ ...plan, ...context });
  const checks = { objectives, materials, process, fourSteps: has4Steps, materialAligned, differentiation: hasMissions, rubric, duration, safety: safetyCheck.isSafe && materials };
  const weights = { objectives: 10, materials: 10, process: 20, fourSteps: 10, materialAligned: 10, differentiation: 10, rubric: 10, duration: 5, safety: 15 };
  let score = Object.keys(weights).reduce((sum, k) => sum + (checks[k] ? weights[k] : 0), 0);
  if (!safetyCheck.isSafe) score = Math.min(score, 59);
  const labels = { objectives: 'Mục tiêu có đủ ba nội dung', materials: 'Đồ dùng của giáo viên và học sinh có nội dung', process: 'Đủ bốn hoạt động theo đúng thứ tự', fourSteps: 'Bốn bước thị phạm có nội dung khác nhau', materialAligned: 'Thao tác thị phạm có dấu hiệu phù hợp chất liệu', differentiation: 'Đủ ba nhiệm vụ phân hóa khác nhau', rubric: 'Có ít nhất ba tiêu chí nhận xét', duration: durationChecked ? 'Tổng thời gian hoạt động khớp thời lượng' : 'Thời gian từng hoạt động chưa được xác minh', safety: 'Không phát hiện từ khóa nguy cơ trong nội dung được quét' };
  const issues = Object.keys(checks).filter(k => !checks[k]).map(k => labels[k]);
  const materialAdvice = { clay: 'Thị phạm lăn, ấn và miết mối nối; kiểm tra đế vững, nhắc không đưa đất vào miệng.', paper: 'Cho học sinh xếp thử mảng giấy trước khi dán; dùng hồ nguội phù hợp trẻ em.', watercolor: 'Thử màu trên giấy nháp, dùng ít nước và đợi lớp màu se khô trước khi thêm chi tiết.', recycled: 'Giáo viên kiểm tra vật liệu sạch, khô, không cạnh sắc và chuẩn bị sẵn phần cần cắt.', crayon: 'Hướng dẫn phác nét nhẹ, thử lực tay và cho học sinh tự chọn màu theo ý tưởng.' }[key];
  return { score, checks, issues, safetyCheck, has4Steps, hasMissions, gradeAlignment: `Bản nháp lớp ${grade} — cần giáo viên duyệt`, safetyStatus: safetyCheck.isSafe ? 'Không phát hiện từ khóa nguy cơ; giáo viên vẫn cần kiểm tra vật liệu thực tế' : 'CẢNH BÁO — cần thay vật liệu/thao tác nguy hiểm', pedagogicalHighlights: Object.keys(checks).map(k => `${checks[k] ? 'Đã kiểm tra' : 'Cần xem lại'}: ${labels[k]}`), teacherAdvice: `Khối Lớp ${grade}: ${grade <= 2 ? 'Chia thao tác thành phần nhỏ và hỗ trợ từng em. ' : 'Khuyến khích học sinh giải thích lựa chọn và thử phương án riêng. '}${materialAdvice}`, reviewMethod: 'Quy tắc cục bộ; không phải AI phản biện độc lập hoặc chứng nhận GDPT 2018/TT27.', verifiedAt: new Date().toISOString() };
}
// Bổ sung cấu trúc còn thiếu trong bản nháp do ngân hàng cục bộ tạo, không che lỗi đầu ra AI.
export function prepareLocalLessonPlan(plan, context = {}) {
  const enhanced = { ...plan, grade: context.grade, materialKey: materialKeyOf(context), durationId: lessonDurationMinutes(context) };
  const times = enhanced.durationId === 70 ? [7, 13, 40, 10] : [5, 8, 17, 5];
  const materialSteps = materialTeachingSteps(context);
  enhanced.teachingProcess = plan.teachingProcess.map((phase, i) => ({ ...phase, step: i + 1, name: `${['1. Khởi động', '2. Khám phá & Thị phạm', '3. Luyện tập & Sáng tạo', '4. Trưng bày & Đánh giá'][i]} (${times[i]} phút)`, durationMinutes: times[i], ...(i === 1 && materialSteps ? { fourSteps: materialSteps } : {}) }));
  if (enhanced.materialKey !== 'crayon') {
    enhanced.objectives = { ...enhanced.objectives, skills: `Thực hiện các thao tác ${enhanced.materialKey === 'clay' ? 'lăn, ấn, ghép và miết đất nặn' : enhanced.materialKey === 'paper' ? 'xé mảng, sắp xếp và dán giấy' : enhanced.materialKey === 'watercolor' ? 'pha màu, điều khiển cọ và chồng lớp màu nước' : 'lựa chọn và lắp ghép vật liệu tái chế an toàn'} để thể hiện ${context.topic || context.themeTitle}; điều chỉnh yêu cầu theo khả năng học sinh.` };
  }
  const topic = context.topic || context.themeTitle || 'chủ đề bài học';
  const materials = {
    clay: { teacher: 'Mẫu khối về ' + topic + ', đất nặn có nhãn phù hợp trẻ em, đế trưng bày và dụng cụ đầu tù.', student: 'Đất nặn phù hợp độ tuổi, bảng lót, dụng cụ đầu tù, khăn lau tay và nước sạch để rửa tay.' },
    paper: { teacher: 'Tranh ghép giấy mẫu về ' + topic + ', giấy màu, giấy nền, hồ dán nguội phù hợp trẻ em.', student: 'Giấy màu để xé bằng tay, giấy nền, hồ dán nguội phù hợp trẻ em và khăn lau.' },
    watercolor: { teacher: 'Tranh mẫu về ' + topic + ', màu nước, cọ, bảng pha, giấy vẽ màu nước và cốc nước sạch.', student: 'Màu nước phù hợp trẻ em, cọ, bảng pha, giấy phù hợp, cốc nước sạch và khăn lau.' },
    recycled: { teacher: 'Mẫu về ' + topic + ', vật liệu tái chế sạch/khô không cạnh sắc, chuẩn bị sẵn phần cần cắt.', student: 'Hộp giấy, mảng bìa hoặc lá cây đã kiểm tra, hồ dán nguội/băng dính hai mặt và khăn lau.' }
  };
  if (materials[enhanced.materialKey]) enhanced.materialsNeeded = materials[enhanced.materialKey];
  if (enhanced.materialKey !== 'crayon') enhanced.objectives.knowledge = 'Nhận biết đặc điểm chính của ' + topic + ', một số thao tác phù hợp chất liệu và quy tắc sử dụng đồ dùng an toàn.';
  enhanced.rubricCriteria = [
    'Thể hiện ý tưởng liên quan đến ' + topic + ' ở mức phù hợp khả năng học sinh.',
    'Thực hiện thao tác với chất liệu đã chọn và sử dụng đồ dùng theo hướng dẫn an toàn.',
    'Có lựa chọn riêng về bố cục, chi tiết, màu sắc hoặc chất cảm; ghi nhận sự tiến bộ của từng em.',
    'Chia sẻ điều đã làm, điều muốn thử tiếp và lắng nghe góp ý tôn trọng từ bạn.'
  ];
  enhanced.differentiatedMissions = buildDifferentiatedMissions(context);
  enhanced.critiqueReport = reviewLessonPlan(enhanced, context);
  return enhanced;
}
