export const READY_STEP_DESCRIPTION = "Nhấn bắt đầu để thực hiện thuật toán";

export function getStepCount(eventCount: number): number {
  return Math.max(0, Math.trunc(eventCount)) + 1;
}

export function getEventIndex(stepIndex: number): number {
  return stepIndex - 1;
}

export function isReadyStep(stepIndex: number): boolean {
  return stepIndex === 0;
}
