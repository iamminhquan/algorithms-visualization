import type { IEventPayload, IExecutionEvent } from "@/engine/algorithm";
import type { IPseudocode } from "@/engine/visualization";
import type { IAssistantContext, IAssistantMetric } from "./types";

export interface IStepContextOptions<TPayload extends IEventPayload, TState> {
  readonly algorithmKey: string;
  readonly input: unknown;
  readonly events: readonly IExecutionEvent<TPayload, TState>[];
  readonly index: number;
  readonly pseudocode: IPseudocode<TPayload>;
  readonly metrics: readonly IAssistantMetric[];
}

export function createStepContext<TPayload extends IEventPayload, TState>({
  algorithmKey,
  input,
  events,
  index,
  pseudocode,
  metrics,
}: IStepContextOptions<TPayload, TState>): IAssistantContext | undefined {
  const event = events[index];
  if (event === undefined) {
    return undefined;
  }
  return {
    algorithmKey,
    input,
    step: {
      index,
      total: events.length,
      description: event.description,
      payload: event.payload,
      state: event.state,
    },
    pseudocode: pseudocode.lines,
    activeLine: pseudocode.getActiveLine(event.payload),
    metrics,
  };
}

export function formatStepLabel(context: IAssistantContext): string {
  return `Bước ${context.step.index + 1}/${context.step.total}`;
}
