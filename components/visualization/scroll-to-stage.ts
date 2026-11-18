const REGION_SELECTOR = "[data-visualizer-region]";

const STAGE_SELECTOR = "[data-visualizer-stage]";

export function scrollToVisualizerStage(origin: HTMLElement | null): void {
  const scope: ParentNode = origin?.closest(REGION_SELECTOR) ?? document;
  const stage = scope.querySelector<HTMLElement>(STAGE_SELECTOR);
  if (stage === null) {
    return;
  }
  const { top } = stage.getBoundingClientRect();
  if (top >= 0 && top < window.innerHeight) {
    return;
  }
  stage.scrollIntoView({
    block: "start",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}
