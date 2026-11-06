"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Select } from "@/components/ui/select";
import { ArrayInputForm } from "@/components/visualization/array-input-form";
import { ComparisonLane } from "@/components/visualization/comparison-lane";
import { PlaybackControls } from "@/components/visualization/playback-controls";
import { useEventPlayback } from "@/components/visualization/use-playback";
import {
  COMPARISON_PARAMS,
  DEFAULT_ARRAY,
  getComparisonTotal,
  getLaneIndex,
  getStepCount,
  isLaneFinished,
  nearlySorted,
  resolveComparisonLanes,
  sortAscending,
  sortDescending,
} from "@/engine/visualization";
import { MAX_ARRAY_LENGTH } from "../array-input";
import {
  createSortingRun,
  getRunDescription,
  getRunMetrics,
  type ISortingRun,
} from "../run";
import {
  findSortingVisualConfig,
  type ISortingVisualConfig,
} from "../visual-configs";
import { SortingStage } from "./sorting-stage";

export interface ISortingComparisonOption {
  readonly key: string;
  readonly slug: string;
  readonly name: string;
}

type SortingComparisonProps = {
  options: readonly ISortingComparisonOption[];
  initialLanes: readonly string[];
};

interface ILaneState {
  readonly option: ISortingComparisonOption;
  readonly config: ISortingVisualConfig;
  readonly run: ISortingRun;
}

interface IComparisonState {
  readonly values: readonly number[];
  readonly lanes: readonly ILaneState[];
}

const ARRAY_PRESETS = [
  { label: "Đã sắp xếp", transform: sortAscending },
  { label: "Ngược", transform: sortDescending },
  { label: "Gần sắp xếp", transform: nearlySorted },
] as const;

function createLane(
  options: readonly ISortingComparisonOption[],
  slug: string,
  values: readonly number[],
): ILaneState {
  const option = options.find((candidate) => candidate.slug === slug);
  if (option === undefined) {
    throw new Error(`Không tìm thấy thuật toán sắp xếp có slug "${slug}"`);
  }
  const config = findSortingVisualConfig(option.key);
  if (config === undefined) {
    throw new Error(
      `Thuật toán "${option.name}" chưa có cấu hình hình vẽ cho khóa "${option.key}"`,
    );
  }
  return { option, config, run: createSortingRun(config.algorithm, values) };
}

function rerunLane(lane: ILaneState, values: readonly number[]): ILaneState {
  return { ...lane, run: createSortingRun(lane.config.algorithm, values) };
}

export function SortingComparison({
  options,
  initialLanes,
}: SortingComparisonProps) {
  const idPrefix = useId();
  const [state, setState] = useState<IComparisonState>(() => ({
    values: DEFAULT_ARRAY,
    lanes: initialLanes.map((slug) => createLane(options, slug, DEFAULT_ARRAY)),
  }));
  const controls = useEventPlayback(
    getComparisonTotal(state.lanes.map((lane) => lane.run.events.length)),
  );
  const sharedIndex = controls.state.index;
  const searchParams = useSearchParams();

  useEffect(() => {
    const requested = COMPARISON_PARAMS.map(
      (param) => searchParams.get(param) ?? undefined,
    );
    const resolved = resolveComparisonLanes(
      options.map((option) => option.slug),
      requested,
    );
    if (resolved === undefined) {
      return;
    }
    const current = state.lanes.map((lane) => lane.option.slug);
    if (
      resolved.length === current.length &&
      resolved.every((slug, index) => slug === current[index])
    ) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    COMPARISON_PARAMS.forEach((param, index) => {
      const slug = resolved[index];
      if (slug !== undefined) {
        params.set(param, slug);
      }
    });
    window.history.replaceState(null, "", `?${params}${window.location.hash}`);
  }, [options, searchParams, state]);

  const applyState = (next: IComparisonState) => {
    setState(next);
    controls.load(
      getComparisonTotal(next.lanes.map((lane) => lane.run.events.length)),
    );
  };

  const changeValues = (values: readonly number[]) => {
    applyState({
      values,
      lanes: state.lanes.map((lane) => rerunLane(lane, values)),
    });
  };

  const changeAlgorithm = (index: number, slug: string) => {
    const current = state.lanes[index];
    if (current === undefined || slug === current.option.slug) {
      return;
    }
    const duplicateIndex = state.lanes.findIndex(
      (lane) => lane.option.slug === slug,
    );
    const nextLanes = [...state.lanes];
    if (duplicateIndex === -1) {
      nextLanes[index] = createLane(options, slug, state.values);
    } else {
      nextLanes[index] = state.lanes[duplicateIndex];
      nextLanes[duplicateIndex] = current;
    }
    applyState({ ...state, lanes: nextLanes });
  };

  return (
    <div className="flex flex-col gap-4">
      <ArrayInputForm
        initialValues={state.values}
        maxLength={MAX_ARRAY_LENGTH}
        presets={ARRAY_PRESETS}
        onChange={changeValues}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {state.lanes.map((lane, index) => {
          const { run } = lane;
          const laneTotal = getStepCount(run.events.length);
          const laneIndex = getLaneIndex(sharedIndex, laneTotal);
          const selectId = `${idPrefix}-lane-${index}`;
          const label = `Mô phỏng ${index + 1}`;

          return (
            <ComparisonLane
              key={COMPARISON_PARAMS[index]}
              label={`${label}: ${lane.option.name}`}
              heading={
                <>
                  <label htmlFor={selectId} className="sr-only">
                    {`Thuật toán mô phỏng ${index + 1}`}
                  </label>
                  <Select
                    id={selectId}
                    value={lane.option.slug}
                    onChange={(event) =>
                      changeAlgorithm(index, event.target.value)
                    }
                  >
                    {options.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.name}
                      </option>
                    ))}
                  </Select>
                </>
              }
              metrics={getRunMetrics(run, laneIndex, lane.config.counters)}
              description={getRunDescription(run, laneIndex)}
              finishedLabel={
                isLaneFinished(sharedIndex, laneTotal)
                  ? `Xong sau ${run.events.length} bước`
                  : undefined
              }
              legend={lane.config.legend}
            >
              <SortingStage
                key={lane.option.slug}
                className="h-full"
                run={run}
                index={laneIndex}
                getFrame={lane.config.getFrame}
              />
            </ComparisonLane>
          );
        })}
      </div>
      <PlaybackControls controls={controls} />
    </div>
  );
}
