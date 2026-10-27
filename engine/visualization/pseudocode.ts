import type { IEventPayload } from "@/engine/algorithm";

export interface IPseudocode<TStep extends IEventPayload> {
  readonly lines: readonly string[];
  readonly getActiveLine: (step: TStep) => number | undefined;
}
