"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Select } from "@/components/ui/select";
import { ArrayInputForm } from "@/components/visualization/array-input-form";
import { ComparisonLane } from "@/components/visualization/comparison-lane";
import { PlaybackControls } from "@/components/visualization/playback-controls";
import { usePlayback } from "@/components/visualization/use-playback";
import {
  COMPARISON_PARAMS,
  DEFAULT_ARRAY,
  getComparisonTotal,
  getLaneIndex,
  isLaneFinished,
  nearlySorted,
  resolveComparisonPair,
  sortAscending,
  sortDescending,
} from "@/engine/visualization";
import { MAX_ARRAY_LENGTH } from "../array-input";
import { createSortingRun, type ISortingRun } from "../run";
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
  initialPair: readonly [string, string];
};

type LaneSide = "left" | "right";

interface ILaneState {
  readonly option: ISortingComparisonOption;
  readonly config: ISortingVisualConfig;
  readonly run: ISortingRun;
}

interface IComparisonState {
  readonly values: readonly number[];
  readonly left: ILaneState;
  readonly right: ILaneState;
}

interface ILaneDisplay {
  readonly side: LaneSide;
  readonly label: string;
  readonly selectLabel: string;
}

const ARRAY_PRESETS = [
  { label: "Đã sắp xếp", transform: sortAscending },
  { label: "Ngược", transform: sortDescending },
  { label: "Gần sắp xếp", transform: nearlySorted },
] as const;

const LANE_DISPLAYS: readonly ILaneDisplay[] = [
  { side: "left", label: "Bên trái", selectLabel: "Thuật toán bên trái" },
  { side: "right", label: "Bên phải", selectLabel: "Thuật toán bên phải" },
];

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
  initialPair,
}: SortingComparisonProps) {
  const idPrefix = useId();
  const [state, setState] = useState<IComparisonState>(() => ({
    values: DEFAULT_ARRAY,
    left: createLane(options, initialPair[0], DEFAULT_ARRAY),
    right: createLane(options, initialPair[1], DEFAULT_ARRAY),
  }));
  const controls = usePlayback(
    getComparisonTotal([
      state.left.run.events.length,
      state.right.run.events.length,
    ]),
  );
  const sharedIndex = controls.state.index;
  const searchParams = useSearchParams();
  const urlLeft = searchParams.get(COMPARISON_PARAMS.left) ?? undefined;
  const urlRight = searchParams.get(COMPARISON_PARAMS.right) ?? undefined;
  const leftSlug = state.left.option.slug;
  const rightSlug = state.right.option.slug;

  useEffect(() => {
    const resolved = resolveComparisonPair(
      options.map((option) => option.slug),
      urlLeft,
      urlRight,
    );
    if (resolved?.[0] === leftSlug && resolved[1] === rightSlug) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set(COMPARISON_PARAMS.left, leftSlug);
    params.set(COMPARISON_PARAMS.right, rightSlug);
    window.history.replaceState(null, "", `?${params}${window.location.hash}`);
  }, [options, urlLeft, urlRight, leftSlug, rightSlug]);

  const applyState = (next: IComparisonState) => {
    setState(next);
    controls.load(
      getComparisonTotal([
        next.left.run.events.length,
        next.right.run.events.length,
      ]),
    );
  };

  const changeValues = (values: readonly number[]) => {
    applyState({
      values,
      left: rerunLane(state.left, values),
      right: rerunLane(state.right, values),
    });
  };

  const changeAlgorithm = (side: LaneSide, slug: string) => {
    const otherSide = side === "left" ? "right" : "left";
    if (slug === state[side].option.slug) {
      return;
    }
    applyState(
      slug === state[otherSide].option.slug
        ? { ...state, left: state.right, right: state.left }
        : { ...state, [side]: createLane(options, slug, state.values) },
    );
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
        {LANE_DISPLAYS.map(({ side, label, selectLabel }) => {
          const lane = state[side];
          const { run } = lane;
          const laneIndex = getLaneIndex(sharedIndex, run.events.length);
          const counts = run.counts[laneIndex];
          const selectId = `${idPrefix}-${side}`;

          return (
            <ComparisonLane
              key={side}
              label={`${label}: ${lane.option.name}`}
              heading={
                <>
                  <label htmlFor={selectId} className="sr-only">
                    {selectLabel}
                  </label>
                  <Select
                    id={selectId}
                    value={lane.option.slug}
                    onChange={(event) =>
                      changeAlgorithm(side, event.target.value)
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
              metrics={[
                { label: "So sánh", value: counts.compare },
                { label: "Hoán đổi", value: counts.swap },
              ]}
              description={run.events[laneIndex].description}
              finishedLabel={
                isLaneFinished(sharedIndex, run.events.length)
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
