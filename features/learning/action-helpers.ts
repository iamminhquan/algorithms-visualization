import type { ILearningActionState } from "./types";

export function actionError(message: string): ILearningActionState {
  return { error: message };
}

export function actionSuccess(message: string): ILearningActionState {
  return { success: message };
}

export function getUnknownErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Có lỗi xảy ra, vui lòng thử lại.";
}
