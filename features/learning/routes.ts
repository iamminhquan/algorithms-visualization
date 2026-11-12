export const LEARNING_PATH = "/learning";
export const STUDENT_CLASSES_PATH = `${LEARNING_PATH}/classes`;
export const STUDENT_JOIN_PATH = `${LEARNING_PATH}/join`;

export function getStudentClassHref(classId: number): string {
  return `${STUDENT_CLASSES_PATH}/${classId}`;
}

export function getStudentJoinHref(code: string): string {
  return `${STUDENT_JOIN_PATH}/${code}`;
}

export function getStudentExamHref(examId: number): string {
  return `${LEARNING_PATH}/exams/${examId}`;
}

export function getAdminClassHref(classId: number): string {
  return `/admin/classes/${classId}`;
}

export function getAdminExamHref(classId: number, examId: number): string {
  return `/admin/classes/${classId}/exams/${examId}`;
}

export function getAdminQuestionsHref(): string {
  return "/admin/questions";
}
