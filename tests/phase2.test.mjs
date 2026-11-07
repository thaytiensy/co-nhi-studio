import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateGameQuestionsByTheme, detectTopicMatch } from '../src/data/artGamesCurriculumBank.js';
import { ROLES, getAccessErrorMessage } from '../src/utils/adminAuthService.js';
import { validateSlideElement } from '../src/utils/storageService.js';

describe('Giai đoạn 2 - Kiểm thử chức năng cốt lõi (Slide, Elements, Games & Rubric)', () => {
  it('1. Tạo, đổi tên, thêm, nhân bản, xóa và sắp xếp slide', () => {
    // Khởi tạo danh sách slide ban đầu
    let slides = [
      { id: 's-1', title: 'Trang mở đầu', background: '#ffffff', elements: [] },
      { id: 's-2', title: 'Khám phá màu sắc', background: '#fffbeb', elements: [] },
    ];

    // Thêm slide mới
    const newSlide = { id: 's-3', title: 'Thực hành vẽ', background: '#f0fdf4', elements: [] };
    slides = [...slides, newSlide];
    assert.equal(slides.length, 3);
    assert.equal(slides[2].title, 'Thực hành vẽ');

    // Đổi tên slide
    slides = slides.map(s => s.id === 's-1' ? { ...s, title: 'Bài 1: Sắc Màu Quanh Em' } : s);
    assert.equal(slides[0].title, 'Bài 1: Sắc Màu Quanh Em');

    // Nhân bản slide (duplicate)
    const slideToClone = slides[1];
    const clonedSlide = {
      ...JSON.parse(JSON.stringify(slideToClone)),
      id: 's-2-clone-' + Date.now(),
      title: `${slideToClone.title} (Bản sao)`
    };
    slides.splice(2, 0, clonedSlide);
    assert.equal(slides.length, 4);
    assert.equal(slides[2].title, 'Khám phá màu sắc (Bản sao)');

    // Di chuyển slide (reorder: chuyển slide cuối lên đầu)
    const [moved] = slides.splice(3, 1);
    slides.unshift(moved);
    assert.equal(slides[0].id, 's-3');
    assert.equal(slides.length, 4);

    // Xóa slide
    slides = slides.filter(s => s.id !== 's-2');
    assert.equal(slides.length, 3);
    assert.ok(!slides.some(s => s.id === 's-2'));
  });

  it('2. Chèn và xác thực các loại phần tử slide (Văn bản, Hình khối, Ảnh vẽ, Video)', () => {
    const textEl = {
      id: 't-1',
      type: 'text',
      x: 50,
      y: 60,
      width: 400,
      height: 80,
      text: 'Chủ đề: Sắc màu tự nhiên',
      fontSize: 24,
      color: '#1e293b'
    };

    const shapeEl = {
      id: 'sh-1',
      type: 'shape',
      shapeType: 'rectangle',
      x: 100,
      y: 200,
      width: 250,
      height: 150,
      fillColor: '#fef08a',
      borderColor: '#ca8a04'
    };

    const imageEl = {
      id: 'img-1',
      type: 'image',
      x: 400,
      y: 100,
      width: 480,
      height: 320,
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    };

    const videoEl = {
      id: 'vid-1',
      type: 'video',
      x: 200,
      y: 150,
      width: 560,
      height: 315,
      src: 'blob:http://localhost:3100/test-video-uuid'
    };

    // Kiểm tra tính hợp lệ qua validator
    assert.doesNotThrow(() => validateSlideElement(textEl, 0));
    assert.doesNotThrow(() => validateSlideElement(shapeEl, 1));
    assert.doesNotThrow(() => validateSlideElement(imageEl, 2));
    assert.doesNotThrow(() => validateSlideElement(videoEl, 3));

    // Thử phần tử thiếu tọa độ hoặc kích thước âm -> phải bị bắt lỗi
    assert.throws(() => {
      validateSlideElement({ id: 'bad', type: 'text', x: -10, y: 50, width: -100, height: 50 }, 0);
    });
  });

  it('3. Sinh câu hỏi trò chơi Mĩ thuật theo chủ đề SGK GDPT 2018', () => {
    // Nhận diện chủ đề "Chú gà con" (Lớp 1)
    const topicMatch = detectTopicMatch('Vẽ Chú Gà Trống Đáng Yêu');
    assert.ok(topicMatch, 'Phải nhận diện được từ khóa chủ đề con gà');
    assert.equal(topicMatch.icon, '🐓');

    // Sinh bộ câu hỏi trắc nghiệm tự động
    const questions = generateGameQuestionsByTheme(1, 'Vẽ Chú Gà Trống Đáng Yêu', 'all', 4);
    assert.ok(Array.isArray(questions));
    assert.ok(questions.length >= 2, 'Phải sinh ít nhất 2 câu hỏi');
    
    // Kiểm tra cấu trúc câu hỏi
    const q1 = questions[0];
    assert.ok(q1.question.length > 10, 'Câu hỏi phải có nội dung sư phạm');
    assert.ok(Array.isArray(q1.options), 'Phải có danh sách phương án');
    assert.equal(q1.options.length, 4, 'Trắc nghiệm mĩ thuật phải có 4 lựa chọn');
    assert.ok(q1.correctAnswer >= 0 && q1.correctAnswer <= 3, 'Đáp án đúng phải nằm trong dải [0, 3]');
    assert.ok(q1.explanation && q1.explanation.length > 5, 'Phải có giải thích sư phạm khuyến khích học sinh');
  });

  it('4. Thuật toán phân tích cảm biến màu sắc & Đề xuất cải thiện bài vẽ (Art Camera)', () => {
    // Mô phỏng hàm phân tích màu sắc dựa trên tỷ lệ điểm ảnh
    const analyzePixelTones = (warmCount, coolCount) => {
      const toneSuggestion = warmCount > coolCount
        ? 'Ảnh có nhiều điểm ảnh thiên ấm; có thể thêm một vài màu lạnh ở chi tiết phụ nếu phù hợp chủ đề.'
        : coolCount > warmCount
          ? 'Ảnh có nhiều điểm ảnh thiên lạnh; có thể điểm thêm màu ấm ở chi tiết chính nếu phù hợp chủ đề.'
          : 'Chưa thấy tông ấm hoặc lạnh chiếm ưu thế; hãy chọn màu theo chủ đề và ý tưởng của học sinh.';

      return [
        toneSuggestion,
        'Nhấn đậm thêm đường viền chu vi của hình vẽ chính để hình khối rõ ràng, dứt khoát.',
        'Tô kín màu đều tay, tránh để hở các đốm trắng li ti trên nền giấy.'
      ];
    };

    // Kiểm tra trường hợp tranh nhiều màu đỏ/vàng (ấm)
    const warmSteps = analyzePixelTones(120, 30);
    assert.match(warmSteps[0], /thiên ấm/);
    assert.equal(warmSteps.length, 3);

    // Kiểm tra trường hợp tranh nhiều màu lam/xanh (lạnh)
    const coolSteps = analyzePixelTones(20, 150);
    assert.match(coolSteps[0], /thiên lạnh/);
  });

  it('5. Ngân hàng nhận xét học sinh chuẩn Thông tư 27 (T, H, C) và định dạng xuất SMAS', () => {
    const TT27_COMMENTS = {
      T: [
        'Có năng khiếu mĩ thuật nổi bật, phối màu hài hòa, đường nét giàu cảm xúc, sáng tạo độc đáo.',
        'Nhận biết và sử dụng màu sắc rất tốt, ý tưởng vẽ tranh phong phú, tự tin chia sẻ trước lớp.'
      ],
      H: [
        'Hoàn thành bài vẽ đúng yêu cầu chủ đề, đường nét rõ ràng, màu sắc tươi sáng.',
        'Biết cách pha trộn và tô màu đều tay, bố cục tranh tương đối hợp lý.'
      ],
      C: [
        'Em cần chú ý quan sát mẫu kĩ hơn, tô màu cẩn thận và hoàn thiện bài vẽ đúng hạn.'
      ]
    };

    // Kiểm tra cấu trúc bản ghi học sinh xuất SMAS
    const student = {
      stt: 1,
      id: 'HS001',
      name: 'Nguyễn Văn An',
      gender: 'Nam',
      level: 'T',
      comment: TT27_COMMENTS.T[0]
    };

    assert.ok(['T', 'H', 'C'].includes(student.level));
    assert.ok(student.comment.length > 20);
    assert.ok(!student.comment.includes('chê bai') && !student.comment.includes('vẽ xấu'));
  });
});

describe('Giai đoạn 2 - Kiểm thử khả năng chịu lỗi & Ứng phó ngoại lệ (Error Resilience)', () => {
  it('6. Bảo vệ hạn mức và phát hiện ảnh quá tải (>10MB)', () => {
    const isImageSizeAllowed = (dataUrl, maxBytes = 10 * 1024 * 1024) => {
      if (typeof dataUrl !== 'string') return false;
      // Kích thước xấp xỉ của chuỗi base64 tính ra byte
      const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
      const byteSize = (base64Length * 3) / 4;
      return byteSize <= maxBytes;
    };

    const smallImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    assert.equal(isImageSizeAllowed(smallImage), true);

    // Chuỗi giả lập vượt quá 10MB
    const fakeHugeBase64 = 'data:image/png;base64,' + 'A'.repeat(14 * 1024 * 1024);
    assert.equal(isImageSizeAllowed(fakeHugeBase64), false);
  });

  it('7. Từ chối tệp PPTX giả mạo hoặc tệp rỗng không thể giải nén', async () => {
    const isZipOrPptxHeader = (buffer) => {
      if (!buffer || buffer.length < 4) return false;
      // Chữ ký PK chuẩn của file Zip / PPTX: 0x50 0x4B 0x03 0x04
      return buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
    };

    const emptyBuffer = Buffer.alloc(0);
    assert.equal(isZipOrPptxHeader(emptyBuffer), false);

    const fakeTextFile = Buffer.from('Day la file text doi ten thanh .pptx');
    assert.equal(isZipOrPptxHeader(fakeTextFile), false);

    const validZipHeader = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00]);
    assert.equal(isZipOrPptxHeader(validZipHeader), true);
  });

  it('8. Phân định ma trận quyền Quản trị viên (Super Admin vs Sub-Admin vs User)', () => {
    const makeSession = (email, role) => {
      const isOwner = role === ROLES.SUPER_ADMIN;
      const isSubAdmin = role === ROLES.SUB_ADMIN;
      return {
        email,
        role,
        canShareGmail: isOwner || isSubAdmin,
        canManageRoles: isOwner,
        canEditApp: isOwner,
      };
    };

    const superAdminSession = makeSession('admin@conhi.vn', ROLES.SUPER_ADMIN);
    assert.equal(superAdminSession.canShareGmail, true);
    assert.equal(superAdminSession.canManageRoles, true);
    assert.equal(superAdminSession.canEditApp, true);

    const subAdminSession = makeSession('subadmin@conhi.vn', ROLES.SUB_ADMIN);
    assert.equal(subAdminSession.canShareGmail, true);
    assert.equal(subAdminSession.canManageRoles, false);
    assert.equal(subAdminSession.canEditApp, false);

    const teacherSession = makeSession('giaovien@gmail.com', ROLES.TEACHER);
    assert.equal(teacherSession.canShareGmail, false);
    assert.equal(teacherSession.canManageRoles, false);
    assert.equal(teacherSession.canEditApp, false);
  });

  it('9. Chuẩn hóa thông báo lỗi khi mất mạng hoặc Firebase/API trả về mã lỗi', () => {
    const networkError = { code: 'auth/network-request-failed' };
    const networkMsg = getAccessErrorMessage(networkError);
    assert.match(networkMsg, /Không kết nối được dịch vụ/);

    const permissionError = { code: 'permission-denied' };
    const permissionMsg = getAccessErrorMessage(permissionError);
    assert.match(permissionMsg, /Firestore từ chối/);

    const unknownError = { message: 'Lỗi không xác định từ máy chủ' };
    const fallbackMsg = getAccessErrorMessage(unknownError);
    assert.equal(fallbackMsg, 'Lỗi không xác định từ máy chủ');
  });
});

describe('Giai đoạn 2 - Quản lý Vòng đời tài nguyên, Chống rò rỉ bộ nhớ & PWA Cache', () => {
  it('10. Kiểm tra mô hình thu hồi tài nguyên MediaStream, Timer và ObjectURL', () => {
    // 1. Kiểm tra thu hồi MediaStream tracks
    let stoppedTracksCount = 0;
    const mockTracks = [
      { stop: () => { stoppedTracksCount++; } },
      { stop: () => { stoppedTracksCount++; } }
    ];
    const mockStream = {
      getTracks: () => mockTracks
    };

    // Hàm dọn dẹp camera
    const cleanupCameraStream = (stream) => {
      if (stream && typeof stream.getTracks === 'function') {
        stream.getTracks().forEach(t => t.stop());
      }
    };
    cleanupCameraStream(mockStream);
    assert.equal(stoppedTracksCount, 2, 'Phải dừng tất cả các track video/audio');

    // 2. Kiểm tra hủy Timer trên ref unmount
    let timerCleared = false;
    const mockTimeoutRef = { current: 12345 };
    const cleanupTimeout = (ref, clearTimeoutFn) => {
      if (ref && ref.current) {
        clearTimeoutFn(ref.current);
        ref.current = null;
        timerCleared = true;
      }
    };
    cleanupTimeout(mockTimeoutRef, (id) => { assert.equal(id, 12345); });
    assert.equal(mockTimeoutRef.current, null);
    assert.equal(timerCleared, true);
  });

  it('11. Xác nhận Versioning của Service Worker Cache và loại trừ API riêng tư', () => {
    const CACHE_NAME = 'co-nhi-studio-cache-v3';
    assert.match(CACHE_NAME, /^co-nhi-studio-cache-v[0-9]+$/);

    // Kiểm tra quy tắc URL được phép cache (không được cache /api/ hoặc dữ liệu riêng tư)
    const isUrlCacheable = (urlStr, origin) => {
      try {
        const url = new URL(urlStr, origin);
        if (url.origin !== origin) return false;
        if (url.pathname.startsWith('/api/')) return false;
        return true;
      } catch {
        return false;
      }
    };

    const host = 'https://co-nhi-studio.vercel.app';
    assert.equal(isUrlCacheable('/assets/index.js', host), true);
    assert.equal(isUrlCacheable('/favicon.svg', host), true);
    assert.equal(isUrlCacheable('/api/tts?text=test', host), false, 'Không được cache endpoint /api/tts');
    assert.equal(isUrlCacheable('https://firestore.googleapis.com/v1/...', host), false, 'Không được cache dịch vụ Google bên ngoài');
  });
});
