import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseNaturalIdeaPrompt,
  parseNaturalGamePrompt,
  validateAiLessonPlan,
  validateAiGamePackage,
  generateNaturalIdeaLesson,
  generateNaturalArtGame,
  generateSlidePedagogyTips,
  buildLocalPedagogyPlan,
  critiqueAndEnhanceLessonPlan
} from '../src/utils/aiNaturalLanguageService.js';
import { classroomAudio } from '../src/utils/classroomAudioService.js';
import { STEP_DRAWING_TOPICS } from '../src/data/stepDrawingBank.js';
import { ART_PERSONAS } from '../src/data/artPersonas.js';
import { generateAiArtwork } from '../src/utils/aiLessonGenerator.js';

describe('Giai đoạn 3 - Phân tích Câu Lệnh Tự Nhiên & Kiểm soát An Toàn (AI Prompt Parsing)', () => {
  it('1. Trích xuất chính xác tham số từ các câu lệnh tự nhiên trong Xưởng Ý Tưởng', () => {
    // Trường hợp 1: Lớp 2, sáp màu, 35 phút, khởi động vui
    const p1 = parseNaturalIdeaPrompt('Tạo kế hoạch dạy vẽ ngôi nhà cho lớp 2, thời lượng 35 phút, dùng sáp màu, có phần khởi động vui.');
    assert.equal(p1.grade, 2);
    assert.equal(p1.duration, '35 phút (1 tiết)');
    assert.equal(p1.materialKey, 'crayon');
    assert.match(p1.topic.toLowerCase(), /ngôi nhà/);
    assert.ok(p1.specialConditions.some(c => c.includes('khởi động')));

    // Trường hợp 2: Lớp 3, xé dán, học sinh yếu, 4 bước
    const p2 = parseNaturalIdeaPrompt('Tạo bài học xé dán vườn hoa cho lớp 3, phù hợp học sinh yếu, gồm 4 bước thực hành.');
    assert.equal(p2.grade, 3);
    assert.equal(p2.materialKey, 'paper');
    assert.match(p2.studentLevel, /trợ giúp|dễ hiểu/i);
    assert.match(p2.topic.toLowerCase(), /vườn hoa/);

    // Trường hợp 3: 2 tiết, con vật quanh em, có trưng bày
    const p3 = parseNaturalIdeaPrompt('Tạo giáo án 2 tiết về con vật quanh em, có trò chơi khởi động và hoạt động trưng bày.');
    assert.equal(p3.periods, 2);
    assert.equal(p3.duration, '70 phút (2 tiết)');
    assert.match(p3.topic.toLowerCase(), /con vật/);
    assert.ok(p3.specialConditions.some(c => c.includes('trưng bày')));

    // Trường hợp 4: Lớp 1, không dùng kéo
    const p4 = parseNaturalIdeaPrompt('Tạo một hoạt động đơn giản cho lớp 1, không dùng kéo và không dùng vật liệu nguy hiểm.');
    assert.equal(p4.grade, 1);
    assert.ok(p4.specialConditions.some(c => c.includes('Không dùng kéo')));
  });

  it('2. Phát hiện và cảnh báo vật liệu nguy hiểm trong câu lệnh tự nhiên', () => {
    const dangerousPrompt = 'Dạy làm mô hình lớp 4 dùng dao rọc giấy và súng bắn keo nóng';
    const parsed = parseNaturalIdeaPrompt(dangerousPrompt);
    assert.ok(parsed.safetyAlert.length > 0, 'Phải có cảnh báo an toàn');
    assert.match(parsed.safetyAlert, /CẢNH BÁO AN TOÀN TIỂU HỌC/);
    assert.match(parsed.safetyAlert, /dao rọc giấy/);
    assert.match(parsed.safetyAlert, /súng bắn keo/);
  });

  it('3. Trích xuất chính xác tham số từ các câu lệnh tự nhiên trong Trò Chơi Mĩ Thuật', () => {
    // Trường hợp 1: Màu nóng lạnh lớp 2, 5 phút
    const g1 = parseNaturalGamePrompt('Tạo trò chơi 5 phút về màu nóng và màu lạnh cho lớp 2.');
    assert.equal(g1.grade, 2);
    assert.equal(g1.duration, '5 phút');
    assert.equal(g1.gameType, 'color');
    assert.match(g1.topic.toLowerCase(), /màu nóng|màu lạnh/);

    // Trường hợp 2: Đoán hình khối lớp 1, 8 câu
    const g2 = parseNaturalGamePrompt('Tạo trò chơi đoán hình khối cho lớp 1, gồm 8 câu hỏi.');
    assert.equal(g2.grade, 1);
    assert.equal(g2.questionCount, 8);
    assert.equal(g2.gameType, 'shape');

    // Trường hợp 3: Tranh Đông Hồ lớp 4
    const g3 = parseNaturalGamePrompt('Tạo trò chơi theo chủ đề tranh Đông Hồ cho lớp 4.');
    assert.equal(g3.grade, 4);
    assert.equal(g3.gameType, 'detail');
    assert.match(g3.topic.toLowerCase(), /đông hồ/);

    // Trường hợp 4: Chơi theo nhóm
    const g4 = parseNaturalGamePrompt('Tạo trò chơi nhóm, không cần đăng nhập học sinh, có tính điểm.');
    assert.match(g4.playMode, /tổ|nhóm/i);
  });
});

describe('Giai đoạn 3 - Xác thực Schema & Bộ sinh Ý tưởng / Trò chơi (Validation & Engine)', () => {
  it('4. Schema Validator kế hoạch bài dạy từ chối dữ liệu thiếu trường cốt lõi', () => {
    const validPlan = {
      lessonTitle: 'Bài Học: Vẽ Ngôi Nhà Của Em',
      objectives: {
        knowledge: 'Nhận biết hình tam giác, hình vuông',
        skills: 'Phác nét và tô màu đều tay',
        qualities: 'Yêu thương gia đình'
      },
      materialsNeeded: {
        teacher: 'Tranh mẫu',
        student: 'Sáp màu, giấy A4'
      },
      teachingProcess: [
        { name: 'Khởi động', activity: 'Hát bài hát ngôi nhà' },
        { name: 'Khám phá', activity: 'Quan sát các kiểu nhà' },
        { name: 'Thực hành', activity: 'Vẽ ngôi nhà mơ ước' },
        { name: 'Trưng bày', activity: 'Chia sẻ cảm nhận' }
      ],
      rubricCriteria: [
        'Đúng chủ đề',
        'Hình khối rõ ràng',
        'Màu sắc tươi sáng'
      ]
    };

    assert.equal(validateAiLessonPlan(validPlan), true);

    // Thiếu mục tiêu kĩ năng -> bị từ chối
    assert.throws(() => {
      validateAiLessonPlan({
        ...validPlan,
        objectives: { knowledge: 'Biết hình khối', qualities: 'Chăm chỉ' }
      });
    }, /Mục tiêu bài dạy phải có đủ/);

    // Chỉ có 3 hoạt động -> bị từ chối vì GDPT 2018 yêu cầu đủ 4 hoạt động
    assert.throws(() => {
      validateAiLessonPlan({
        ...validPlan,
        teachingProcess: validPlan.teachingProcess.slice(0, 3)
      });
    }, /phải có đủ ít nhất 4 hoạt động/);
  });

  it('5. Schema Validator trò chơi từ chối câu hỏi thiếu phương án hoặc sai đáp án', () => {
    const validGame = {
      gameTitle: 'Trò Chơi Sắc Màu Lớp 1',
      grade: 1,
      durationMinutes: 5,
      objectives: 'Phân biệt màu cơ bản',
      questions: [
        {
          id: 'q1',
          question: 'Màu nào sau đây là màu cơ bản?',
          options: ['Đỏ', 'Cam', 'Tím', 'Nâu'],
          correctAnswer: 0,
          explanation: 'Đỏ là màu cơ bản.'
        },
        {
          id: 'q2',
          question: 'Pha Đỏ với Vàng tạo thành màu gì?',
          options: ['Cam', 'Tím', 'Xanh', 'Nâu'],
          correctAnswer: 0,
          explanation: 'Tạo thành màu cam.'
        }
      ]
    };

    assert.equal(validateAiGamePackage(validGame), true);

    // Câu hỏi chỉ có 3 phương án -> từ chối
    assert.throws(() => {
      validateAiGamePackage({
        ...validGame,
        questions: [
          {
            id: 'bad-q',
            question: 'Câu hỏi lỗi?',
            options: ['A', 'B', 'C'],
            correctAnswer: 0,
            explanation: 'Giải thích'
          },
          validGame.questions[1]
        ]
      });
    }, /chính xác 4 phương án lựa chọn/);

    // Đáp án đúng ngoài dải [0, 3] -> từ chối
    assert.throws(() => {
      validateAiGamePackage({
        ...validGame,
        questions: [
          {
            ...validGame.questions[0],
            correctAnswer: 5
          },
          validGame.questions[1]
        ]
      });
    }, /nằm trong dải \[0, 3\]/);
  });

  it('6. Sinh kế hoạch tự nhiên ở chế độ ngoại tuyến trả về bản xem trước GDPT 2018 đầy đủ', async () => {
    const result = await generateNaturalIdeaLesson({
      prompt: 'Tạo bài học vẽ ngôi nhà cho lớp 2 dùng sáp màu 35 phút',
      isOnline: false
    });

    assert.equal(result.isAiGenerated, false);
    assert.ok(result.plan);
    assert.match(result.plan.lessonTitle, /NGÔI NHÀ/i);
    assert.equal(result.plan.teachingProcess.length, 4);
    assert.equal(result.parsedParams.grade, 2);
    assert.equal(validateAiLessonPlan(result.plan), true);
  });

  it('7. Sinh trò chơi tự nhiên trả về bộ câu hỏi hợp lệ có thể chơi hoặc chèn vào slide', async () => {
    const result = await generateNaturalArtGame({
      prompt: 'Tạo trò chơi 5 phút về màu nóng màu lạnh cho lớp 2',
      isOnline: false
    });

    assert.ok(result.gamePackage);
    assert.equal(result.gamePackage.grade, 2);
    assert.ok(result.gamePackage.questions.length >= 2);
    assert.equal(validateAiGamePackage(result.gamePackage), true);
  });

  it('8. Xử lý an toàn khi API AI lỗi: Tự động dự phòng về ngân hàng sư phạm mà không crash app', async () => {
    // Giả lập fetch ném lỗi mạng 502 Bad Gateway
    const failingFetch = async () => {
      throw new Error('Dịch vụ AI tạm thời gián đoạn (502 Bad Gateway)');
    };

    const mockTokenProvider = async () => 'mock-jwt-token';

    const result = await generateNaturalIdeaLesson(
      {
        prompt: 'Tạo bài học xé dán con cá cho lớp 1',
        isOnline: true
      },
      {
        fetchImpl: failingFetch,
        tokenProvider: mockTokenProvider
      }
    );

    // Hệ thống tự động kích hoạt fallback cục bộ, bảo vệ trải nghiệm của giáo viên
    assert.equal(result.isAiGenerated, false);
    assert.ok(result.plan);
    assert.match(result.plan.lessonTitle, /CON CÁ/i);
    assert.match(result.source, /Dự phòng tự động/);
    assert.equal(validateAiLessonPlan(result.plan), true);
  });
  it('9. Phân tích nội dung slide và sinh câu hỏi sư phạm, bí quyết mĩ thuật AI', async () => {
    const mockSlide = {
      title: 'Bài 4: Màu sắc và Cảm xúc trong Tranh vẽ',
      elements: [
        { type: 'text', text: 'Hãy quan sát bông hoa hướng dương rực rỡ dưới ánh nắng vàng.' }
      ],
      notes: 'Thầy hướng dẫn học sinh nhận biết màu vàng tươi sáng.'
    };

    const tips = await generateSlidePedagogyTips({
      slide: mockSlide,
      grade: 2,
      isOnline: false // Chạy kiểm thử offline an toàn
    });

    assert.ok(tips);
    assert.match(tips.topic, /Màu Sắc/i);
    assert.ok(typeof tips.inquiryQuestion === 'string' && tips.inquiryQuestion.length > 10);
    assert.ok(typeof tips.artTechniqueTip === 'string' && tips.artTechniqueTip.length > 10);
    assert.ok(typeof tips.encouragement === 'string' && tips.encouragement.length > 10);
  });

  it('10. Kiểm tra tính an toàn của Classroom Audio Service trong môi trường không có DOM/WebAudio', () => {
    // Không ném lỗi khi gọi trong môi trường Node.js / headless
    assert.doesNotThrow(() => {
      classroomAudio.playPhaseChime();
      classroomAudio.startClassroomMusic();
      classroomAudio.stopClassroomMusic();
      const state = classroomAudio.toggleMusic();
      assert.equal(typeof state, 'boolean');
    });
  });
  it('11. Kiểm tra ngân hàng thị phạm 4 bước (Step Drawing Bank) có đầy đủ chủ đề và hàm vẽ', () => {
    assert.ok(Array.isArray(STEP_DRAWING_TOPICS) && STEP_DRAWING_TOPICS.length >= 4);
    STEP_DRAWING_TOPICS.forEach((topic) => {
      assert.ok(topic.id && topic.name && topic.icon);
      assert.equal(topic.steps.length, 4);
      topic.steps.forEach((st, idx) => {
        assert.equal(st.step, idx + 1);
        assert.ok(typeof st.title === 'string' && st.title.length > 5);
        assert.ok(typeof st.instruction === 'string' && st.instruction.length > 10);
        assert.equal(typeof st.draw, 'function');
      });
    });
  });

  it('12. Kế hoạch bài dạy sinh ra phải chứa đủ 3 mức độ thử thách phân hóa năng lực (TT27)', async () => {
    const res = await generateNaturalIdeaLesson({
      prompt: 'Soạn bài vẽ con chim bằng màu sáp cho lớp 2',
      isOnline: false
    });

    assert.ok(res.plan);
    assert.ok(res.plan.differentiatedMissions);
    assert.ok(res.plan.differentiatedMissions.tier1_basic.includes('Thử thách 1'));
    assert.ok(res.plan.differentiatedMissions.tier2_standard.includes('Thử thách 2'));
    assert.ok(res.plan.differentiatedMissions.tier3_advanced.includes('Thử thách 3'));
  });

  it('13. Danh mục Nhân vật Lịch sử Nghệ thuật (Art Personas) có đủ 4 nhân vật với vai trò và avatar', () => {
    assert.ok(Array.isArray(ART_PERSONAS) && ART_PERSONAS.length === 4);
    const expectedIds = ['conhi', 'dongho', 'tongocvan', 'vangogh'];
    expectedIds.forEach(id => {
      const p = ART_PERSONAS.find(item => item.id === id);
      assert.ok(p, `Thiếu nhân vật ${id}`);
      assert.ok(p.name && p.avatar && p.role && p.systemPrompt);
    });
  });

  it('14. Sinh tranh mẫu AI (generateAiArtwork) bám sát nội dung và chất liệu đã nhập', async () => {
    // 1. Phải từ chối nếu topic rỗng
    await assert.rejects(
      async () => generateAiArtwork({ topic: '', grade: 3, style: 'crayon' }),
      /Vui lòng nhập hoặc chọn chủ đề trước khi tạo tranh/
    );

    // 2. Chế độ mock fetch trả về blob ảnh thành công -> tạo Data URL
    const mockBlob = new Blob([Buffer.from('fake-pixel-data')], { type: 'image/jpeg' });
    const mockFetch = async (url) => {
      assert.ok(url.includes('image.pollinations.ai'));
      assert.ok(url.includes(encodeURIComponent('con mèo')));
      return {
        ok: true,
        blob: async () => mockBlob,
      };
    };

    const dataUrl = await generateAiArtwork(
      { topic: 'con mèo', grade: 2, style: 'crayon', seed: 42 },
      mockFetch
    );
    assert.ok(dataUrl.startsWith('data:image/jpeg;base64,'));

    // 3. Lỗi mạng phải báo thất bại, không trả URL chưa có ảnh như thành công.
    const failFetch = async () => { throw new Error('Network error'); };
    await assert.rejects(generateAiArtwork(
      { topic: 'bông hoa', grade: 1, style: 'watercolor', seed: 99 },
      failFetch
    ), /Network error/);
  });

  it('15. Phân tích ngữ cảnh sâu sắc (Deep Contextual Understanding): Thể loại, Chủ đề tinh gọn và 4 bước thị phạm chuyên biệt', () => {
    // 1. Tĩnh vật
    const p1 = parseNaturalIdeaPrompt('Tôi muốn dạy bài vẽ tĩnh vật lọ hoa và quả táo đỏ trên bàn cho học sinh lớp 4');
    assert.equal(p1.grade, 4);
    assert.equal(p1.genre, 'still_life');
    assert.match(p1.topic.toLowerCase(), /tĩnh vật|lọ hoa/i);
    const plan1 = buildLocalPedagogyPlan(p1);
    assert.match(plan1.teachingProcess[1].fourSteps[0], /mặt bàn|khung hình chung/i);
    assert.match(plan1.teachingProcess[1].fourSteps[3], /đón sáng|bóng đổ/i);

    // 2. Chân dung nhân vật
    const p2 = parseNaturalIdeaPrompt('Hãy cho tôi một bài vẽ chú bộ đội hải quân đứng gác ngoài đảo xa');
    assert.equal(p2.genre, 'portrait_human');
    assert.match(p2.topic.toLowerCase(), /chú bộ đội/i);
    const plan2 = buildLocalPedagogyPlan(p2);
    assert.match(plan2.teachingProcess[1].fourSteps[0], /trục|nhân vật/i);
    assert.match(plan2.teachingProcess[1].fourSteps[1], /mắt|mũi|miệng|trang phục/i);

    // 3. Đời sống gia đình ngày Tết
    const p3 = parseNaturalIdeaPrompt('Gợi ý bài vẽ gia đình ăn cơm tất niên ngày tết ấm cúng lớp 3');
    assert.equal(p3.grade, 3);
    assert.equal(p3.genre, 'portrait_human');
    assert.match(p3.topic.toLowerCase(), /gia đình/i);

    // 4. Ánh xạ trực tiếp Chủ đề chuẩn SGK Kết nối tri thức (Ví dụ người dùng: "chủ đề 3 lớp 5")
    const p4 = parseNaturalIdeaPrompt('chủ đề 3 lớp 5');
    assert.equal(p4.grade, 5);
    assert.equal(p4.genre, 'portrait_human');
    assert.match(p4.topic.toLowerCase(), /gia đình/i);
    assert.ok(p4.curriculumRef && p4.curriculumRef.includes('Gia đình'));
    const plan4 = buildLocalPedagogyPlan(p4);
    assert.match(plan4.teachingProcess[1].fourSteps[0], /trục|nhân vật|dáng/i);
  });
  it('16. Hệ thống Tự Phản Biện & Kiểm Định Sư Phạm Đa Lớp (critiqueAndEnhanceLessonPlan)', () => {
    // 1. Kế hoạch chuẩn đầy đủ đạt điểm cao (>= 95)
    const p1 = parseNaturalIdeaPrompt('Vẽ đàn cá dưới đại dương bằng màu nước lớp 2');
    const plan1 = buildLocalPedagogyPlan(p1);
    assert.ok(plan1.critiqueReport, 'Phải có báo cáo kiểm định sư phạm');
    assert.ok(plan1.critiqueReport.score >= 95, `Điểm phải >= 95, thực tế: ${plan1.critiqueReport.score}`);
    assert.equal(plan1.critiqueReport.safetyCheck.isSafe, true);
    assert.ok(!plan1.critiqueReport.safetyStatus.includes('100%'));
    assert.ok(plan1.critiqueReport.teacherAdvice.includes('Lớp 2'));
    assert.ok(Array.isArray(plan1.critiqueReport.pedagogicalHighlights));

    // 2. Phát hiện vật liệu nguy hiểm và cảnh báo
    const dangerousPlan = {
      ...plan1,
      materialsNeeded: { student: 'dao rọc giấy, súng bắn keo nến nóng' }
    };
    const critique2 = critiqueAndEnhanceLessonPlan(dangerousPlan, { grade: 2, material: 'dao rọc giấy' });
    assert.equal(critique2.safetyCheck.isSafe, false);
    assert.ok(critique2.safetyStatus.includes('CẢNH BÁO'));
    assert.ok(critique2.safetyCheck.warnings.length >= 1);
    assert.ok(critique2.safetyCheck.substitutions.length >= 1);
    assert.ok(critique2.score < 90);
  });
});
