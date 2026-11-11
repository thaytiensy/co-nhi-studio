/**
 * Bộ kiểm tra và chuẩn hóa dữ liệu nhập học sinh SMAS Viettel & TT27
 * Báo lỗi chi tiết Dòng X, Cột Y khi dữ liệu thiếu hoặc sai quy chuẩn
 */

import type { StudentRecord, EvaluationLevel } from '../types/presentation.ts';

export interface ValidationIssue {
  row: number;
  column: string;
  field: keyof StudentRecord;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  validStudents: StudentRecord[];
  issues: ValidationIssue[];
}

const VALID_LEVELS: ReadonlySet<string> = new Set(['T', 'H', 'C']);

export function normalizeLevel(raw: string | undefined | null): EvaluationLevel {
  if (!raw) return 'H';
  const val = raw.trim().toUpperCase();
  if (VALID_LEVELS.has(val)) return val as EvaluationLevel;
  if (val === 'HTT' || val.includes('TỐT') || val.includes('TOT')) return 'T';
  if (val === 'CHT' || val.includes('CHƯA') || val.includes('CHUA')) return 'C';
  return 'H';
}

export function validateStudentRow(
  raw: Record<string, string | number | undefined | null>,
  rowIndex: number,
  fallbackClass: string = '1A'
): { student: StudentRecord | null; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const displayRow = rowIndex + 1;

  const nameVal = String(raw['Họ và tên'] ?? raw['Họ và Tên'] ?? raw['name'] ?? '').trim();
  if (!nameVal) {
    issues.push({
      row: displayRow,
      column: 'Cột Họ và tên',
      field: 'name',
      message: `Dòng ${displayRow}, Cột 'Họ và tên' đang để trống. Vui lòng bổ sung họ tên học sinh.`,
      severity: 'error'
    });
  }

  const codeVal = String(raw['Mã học sinh'] ?? raw['Mã Học Sinh'] ?? raw['studentCode'] ?? raw['id'] ?? '').trim();
  const id = codeVal || `HS${String(displayRow).padStart(3, '0')}`;

  const classVal = String(raw['Lớp'] ?? raw['className'] ?? fallbackClass).trim() || fallbackClass;

  const rawLevel = String(raw['Mức đánh giá'] ?? raw['Mức Đạt Được'] ?? raw['level'] ?? '').trim();
  let level: EvaluationLevel = 'H';
  if (rawLevel) {
    const norm = normalizeLevel(rawLevel);
    level = norm;
    if (!VALID_LEVELS.has(rawLevel.toUpperCase())) {
      issues.push({
        row: displayRow,
        column: 'Cột Mức đánh giá',
        field: 'level',
        message: `Dòng ${displayRow}, Cột 'Mức đánh giá' mang giá trị '${rawLevel}', tự động chuẩn hóa về '${level}'.`,
        severity: 'warning'
      });
    }
  }

  const commentVal = String(raw['Nội dung nhận xét'] ?? raw['comment'] ?? '').trim();

  if (issues.some(i => i.severity === 'error')) {
    return { student: null, issues };
  }

  const student: StudentRecord = {
    id,
    studentCode: id,
    name: nameVal,
    className: classVal,
    level,
    comment: commentVal
  };

  return { student, issues };
}

export function validateStudentList(
  rows: Array<Record<string, string | number | undefined | null>>,
  fallbackClass: string = '1A'
): ValidationResult {
  const validStudents: StudentRecord[] = [];
  const allIssues: ValidationIssue[] = [];

  rows.forEach((row, idx) => {
    const { student, issues } = validateStudentRow(row, idx, fallbackClass);
    allIssues.push(...issues);
    if (student) {
      validStudents.push(student);
    }
  });

  return {
    isValid: !allIssues.some(i => i.severity === 'error'),
    validStudents,
    issues: allIssues
  };
}
