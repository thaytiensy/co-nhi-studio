import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateRubricLevel, 
  saveCameraEvaluationToSmas, 
  synthesizePeriodicEvaluation, 
  batchSynthesizeClassEvaluations, 
  readSmasData, 
  writeSmasData,
  PERIODIC_COMMENTS_BANK
} from '../src/utils/smasEvaluationBridge.js';
import { exportSmasExcel } from '../src/utils/smasExcelService.js';

describe('Giai đoạn 6 - Cam Chấm Tranh Liên Kết Sổ Điểm SMAS & Tổng Hợp Giữa Kỳ / Cuối Kỳ', () => {
  it('1. Tính toán mức đánh giá TT27 (T, H, C) từ 4 tiêu chí Rubric Cam Chấm Tranh', () => {
    // Trường hợp 1: Tốt cả yêu cầu và kỹ thuật, tổng điểm >= 10 -> Mức T
    assert.equal(
      calculateRubricLevel({ requirement: 3, technique: 3, creativity: 3, presentation: 3 }),
      'T',
      'Đạt tối đa 12/12 điểm phải là mức T (Hoàn thành tốt)'
    );
    assert.equal(
      calculateRubricLevel({ requirement: 3, technique: 3, creativity: 2, presentation: 2 }),
      'T',
      'Yêu cầu 3, Kỹ thuật 3, tổng 10 điểm phải đạt mức T'
    );

    // Trường hợp 2: Đạt các yêu cầu cốt lõi (req >= 2, tech >= 2, tổng >= 7) -> Mức H
    assert.equal(
      calculateRubricLevel({ requirement: 2, technique: 2, creativity: 2, presentation: 2 }),
      'H',
      'Mỗi tiêu chí 2 điểm, tổng 8 điểm phải là mức H (Hoàn thành)'
    );
    assert.equal(
      calculateRubricLevel({ requirement: 3, technique: 2, creativity: 1, presentation: 1 }),
      'H',
      'Yêu cầu 3, Kỹ thuật 2, tổng 7 điểm phải là mức H'
    );

    // Trường hợp 3: Chưa hoàn thành (req === 1 hoặc tech === 1 hoặc tổng < 7) -> Mức C
    assert.equal(
      calculateRubricLevel({ requirement: 1, technique: 3, creativity: 3, presentation: 3 }),
      'C',
      'Sai yêu cầu bài học (requirement = 1) phải là mức C (Chưa hoàn thành)'
    );
    assert.equal(
      calculateRubricLevel({ requirement: 3, technique: 1, creativity: 2, presentation: 2 }),
      'C',
      'Kỹ thuật chưa đạt (technique = 1) phải là mức C'
    );
    assert.equal(
      calculateRubricLevel({ requirement: 2, technique: 2, creativity: 1, presentation: 1 }),
      'C',
      'Tổng 6 điểm (< 7) phải là mức C'
    );
  });

  it('2. Lưu kết quả Cam Chấm Tranh vào Sổ Điểm SMAS theo chuẩn T, H, C', () => {
    // Khởi tạo môi trường giả lập localStorage cho test
    const mockStorage = new Map();
    globalThis.localStorage = {
      getItem: (k) => mockStorage.get(k) || null,
      setItem: (k, v) => mockStorage.set(k, String(v)),
      removeItem: (k) => mockStorage.delete(k),
      clear: () => mockStorage.clear()
    };
    globalThis.window = {
      dispatchEvent: () => true
    };
    globalThis.CustomEvent = class {
      constructor(type, init) { this.type = type; this.detail = init?.detail; }
    };

    // 2a. Chấm và lưu cho học sinh mới
    const result1 = saveCameraEvaluationToSmas({
      studentName: 'Trần Bảo Ngọc',
      className: '1A',
      level: 'T',
      comment: 'Vẽ nét rất sắc sảo và phối màu rực rỡ.',
      period: 'TX',
      rubricLevels: { requirement: 3, technique: 3, creativity: 3, presentation: 2 },
      improvementSteps: ['Tô viền đậm hơn'],
      artworkThumb: 'data:image/jpeg;base64,sample'
    });

    assert.ok(result1.success);
    assert.equal(result1.student.name, 'Trần Bảo Ngọc');
    assert.equal(result1.student.level, 'T');
    assert.equal(result1.student.camHistory.length, 1);
    assert.equal(result1.student.camHistory[0].level, 'T');

    // 2b. Chấm lần 2 cho cùng học sinh đó trong đợt Giữa kì (GK)
    const result2 = saveCameraEvaluationToSmas({
      studentId: result1.student.id,
      studentName: 'Trần Bảo Ngọc',
      className: '1A',
      level: 'T',
      comment: 'Giữa kì hoàn thành xuất sắc các sản phẩm mĩ thuật.',
      period: 'GK',
      rubricLevels: { requirement: 3, technique: 3, creativity: 3, presentation: 3 }
    });

    assert.ok(result2.success);
    assert.equal(result2.student.camHistory.length, 2, 'Lịch sử chấm phải ghi nhận đủ 2 lần');
    assert.equal(result2.student.gkLevel, 'T', 'Mức Giữa kì phải được cập nhật là T');
    assert.equal(result2.student.gkComment, 'Giữa kì hoàn thành xuất sắc các sản phẩm mĩ thuật.');
  });

  it('3. Tổng hợp đánh giá định kỳ Giữa kỳ (GK) và Cuối kỳ (CK) chuẩn TT27', () => {
    // 3a. Học sinh có lịch sử chấm Cam đa số là T
    const studentT = {
      id: 'HS001',
      name: 'Nguyễn Văn An',
      className: 'Lớp 1A',
      level: 'T',
      camHistory: [
        { level: 'T' },
        { level: 'T' },
        { level: 'H' }
      ]
    };

    const gkEval = synthesizePeriodicEvaluation(studentT, 'GK');
    assert.equal(gkEval.level, 'T', 'Đa số T và không có C thì Giữa kì phải đạt mức T');
    assert.ok(gkEval.comment.length > 20, 'Lời nhận xét Giữa kì phải chi tiết, giàu tính sư phạm');
    assert.ok(PERIODIC_COMMENTS_BANK.GK.T.includes(gkEval.comment), 'Nhận xét phải nằm trong ngân hàng TT27 GK Mức T');

    const ckEval = synthesizePeriodicEvaluation(studentT, 'CK');
    assert.equal(ckEval.level, 'T', 'Cuối kì phải đạt mức T');
    assert.ok(PERIODIC_COMMENTS_BANK.CK.T.includes(ckEval.comment), 'Nhận xét phải nằm trong ngân hàng TT27 CK Mức T');

    // 3b. Học sinh có lịch sử chấm Cam đa số là C
    const studentC = {
      id: 'HS002',
      name: 'Lê Cần Cố Gắng',
      className: 'Lớp 1A',
      level: 'C',
      camHistory: [
        { level: 'C' },
        { level: 'C' },
        { level: 'H' }
      ]
    };

    const gkEvalC = synthesizePeriodicEvaluation(studentC, 'GK');
    assert.equal(gkEvalC.level, 'C', 'Đa số C thì Giữa kì phải là mức C');
    assert.ok(PERIODIC_COMMENTS_BANK.GK.C.includes(gkEvalC.comment));
  });

  it('4. Tổng hợp hàng loạt (Batch Synthesize) cho cả lớp', () => {
    const mockStudents = [
      { id: '1', name: 'Em 1', className: '1A', level: 'T', camHistory: [{ level: 'T' }, { level: 'T' }] },
      { id: '2', name: 'Em 2', className: '1A', level: 'H', camHistory: [{ level: 'H' }, { level: 'H' }] },
      { id: '3', name: 'Em 3', className: '1A', level: 'C', camHistory: [{ level: 'C' }, { level: 'C' }] },
      { id: '4', name: 'Em 4', className: '1B', level: 'T', camHistory: [{ level: 'T' }] }
    ];

    // Tổng hợp riêng cho lớp 1A
    const res1A = batchSynthesizeClassEvaluations({
      students: mockStudents,
      targetClass: '1A',
      targetPeriod: 'GK'
    });

    assert.equal(res1A.summary.total, 3, 'Chỉ tổng hợp 3 học sinh của lớp 1A');
    assert.equal(res1A.summary.tCount, 1);
    assert.equal(res1A.summary.hCount, 1);
    assert.equal(res1A.summary.cCount, 1);

    const updated1A = res1A.students;
    assert.equal(updated1A[0].gkLevel, 'T');
    assert.ok(updated1A[0].gkComment.length > 10);
    assert.equal(updated1A[1].gkLevel, 'H');
    assert.equal(updated1A[2].gkLevel, 'C');
    assert.equal(updated1A[3].gkLevel, undefined, 'Lớp 1B không bị ảnh hưởng');
  });

  it('5. Xuất bảng điểm Excel SMAS hỗ trợ các chế độ GK, CK và Toàn diện', () => {
    const mockStudents = [
      { id: 'HS001', name: 'Nguyễn Văn An', className: '1A', level: 'T', comment: 'Nhận xét TX', gkLevel: 'T', gkComment: 'Nhận xét GK Tốt', ckLevel: 'T', ckComment: 'Nhận xét CK Tốt' },
      { id: 'HS002', name: 'Trần Thị Bình', className: '1A', level: 'H', comment: 'Nhận xét TX', gkLevel: 'H', gkComment: 'Nhận xét GK Đạt', ckLevel: 'H', ckComment: 'Nhận xét CK Đạt' }
    ];

    // 5a. Xuất bảng Giữa kỳ (GK)
    const fileGK = exportSmasExcel({
      students: mockStudents,
      className: '1A',
      semester: 'Giữa kì I',
      exportMode: 'gk'
    });
    assert.ok(fileGK.includes('.xlsx'), 'Phải tạo thành công tệp Excel GK');

    // 5b. Xuất bảng Cuối kỳ (CK)
    const fileCK = exportSmasExcel({
      students: mockStudents,
      className: '1A',
      semester: 'Học kì I',
      exportMode: 'ck'
    });
    assert.ok(fileCK.includes('.xlsx'), 'Phải tạo thành công tệp Excel CK');

    // 5c. Xuất bảng Toàn diện (GK & CK)
    const fileComp = exportSmasExcel({
      students: mockStudents,
      className: '1A',
      semester: 'Học kì I',
      exportMode: 'comprehensive'
    });
    assert.ok(fileComp.includes('Toan_Dien') || fileComp.includes('.xlsx'), 'Phải tạo thành công tệp Excel toàn diện');
  });
});
