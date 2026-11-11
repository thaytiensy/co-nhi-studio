/**
 * Co Nhi Studio - Presentation Engine Data Contracts
 * Strict TypeScript: 100% Zero `any`
 * Bám sát chuẩn GDPT 2018, Công văn 2345/BGDĐT & Thông tư 27/2020/TT-BGDĐT
 */

export type ElementType = 'text' | 'shape' | 'image' | 'video' | 'audio' | 'youtube' | 'game';

export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

export interface SlideElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  src?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  opacity?: number;
  rotation?: number;
  zIndex?: number;
  locked?: boolean;
}

export interface Slide {
  id: string;
  title: string;
  background?: string;
  elements: SlideElement[];
  notes?: string;
  order?: number;
}

export type DrawingToolMode = 'select' | 'laser' | 'pen' | 'highlighter' | 'eraser';

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingStroke {
  id: string;
  slideId: string;
  tool: DrawingToolMode;
  color: string;
  width: number;
  opacity: number;
  points: DrawingPoint[];
  createdAt: number;
}

export type Cv2345PhaseType = 'warmup' | 'discovery' | 'practice' | 'application';

export interface Cv2345Phase {
  step: 1 | 2 | 3 | 4;
  type: Cv2345PhaseType;
  name: string;
  activity: string;
  durationMinutes: number;
  teacherNote?: string;
  guidingQuestions?: string[];
  fourSteps?: string[];
  rubricNote?: string;
}

export interface LessonObjectives {
  knowledge: string;
  skills: string;
  qualities: string;
}

export interface LessonPlan {
  id: string;
  topic: string;
  grade: 1 | 2 | 3 | 4 | 5;
  material: string;
  durationMinutes: number;
  curriculumTheme?: string;
  textbookSystem: 'KetNoiTriThuc' | 'CanhDieu' | 'ChanTroiSangTao';
  objectives: LessonObjectives;
  materialsNeeded: {
    teacher: string;
    student: string;
  };
  teachingProcess: Cv2345Phase[];
  rubricCriteria: string[];
}

export type EvaluationLevel = 'T' | 'H' | 'C';

export interface StudentRecord {
  id: string;
  studentCode: string;
  name: string;
  className: string;
  level: EvaluationLevel;
  comment: string;
  gkLevel?: EvaluationLevel;
  gkComment?: string;
  ckLevel?: EvaluationLevel;
  ckComment?: string;
}

export interface DraftRecord {
  id: string;
  timestamp: number;
  title: string;
  slides: Slide[];
  userEmail: string;
  version: string;
}

export interface PresenterState {
  currentSlideIndex: number;
  totalSlides: number;
  isFullscreen: boolean;
  isBlackout: boolean;
  isWhiteout: boolean;
  scale: number;
  activeTool: DrawingToolMode;
  laserPosition: { x: number; y: number } | null;
  timerSeconds: number;
  isTimerRunning: boolean;
}
