export const LEARNING_PATH = "/learning";
export const STUDENT_CLASSES_PATH = `${LEARNING_PATH}/classes`;

export function getStudentClassHref(classId: number): string {
  return `${STUDENT_CLASSES_PATH}/${classId}`;
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
