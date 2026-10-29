export interface IAlgorithmMetadata<TKey extends string = string> {
  readonly key: TKey;
}

export interface IEventPayload {
  readonly type: string;
}

export interface IExecutionEvent<TPayload extends IEventPayload, TState> {
  readonly description: string;
  /*
   * Thao tác vừa xảy ra (so sánh, đổi chỗ, push, thăm đỉnh...), dùng để tô sáng trên hình vẽ
   */
  readonly payload: TPayload;
  readonly state: TState;
}

export interface IExecutionResult<
  TOutput,
  TEvent extends IExecutionEvent<IEventPayload, unknown>,
  TMetrics,
> {
  readonly metadata: IAlgorithmMetadata;
  readonly output: TOutput;
  readonly events: readonly TEvent[];
  readonly metrics: TMetrics;
}

export interface IAlgorithmDefinition<
  TInput,
  TResult extends IExecutionResult<
    unknown,
    IExecutionEvent<IEventPayload, unknown>,
    unknown
  >,
  TKey extends string = string,
> {
  readonly metadata: IAlgorithmMetadata<TKey>;
  readonly execute: (input: TInput) => TResult;
}

export type AnyAlgorithmDefinition = IAlgorithmDefinition<
  never,
  IExecutionResult<unknown, IExecutionEvent<IEventPayload, unknown>, unknown>
>;
