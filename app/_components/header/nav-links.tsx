"use client";

import { domMax, LazyMotion, MotionConfig, m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { VISUALIZATION_PATH } from "@/features/catalog/routes";
import { cn } from "@/lib/cn";
import {
  FOCUS_RING_CLASS_NAME,
  type IHeaderCategory,
  isCurrentPage,
  NAV_ITEMS,
} from "./nav-items";
import { SimulationMenu } from "./simulation-menu";

const PILL_TRANSITION = {
  type: "spring",
  bounce: 0.15,
  duration: 0.4,
} as const;

type NavPillProps = {
  isCurrent: boolean;
  isHovered: boolean;
};

function NavPill({ isCurrent, isHovered }: NavPillProps) {
  if (isCurrent) {
    return (
      <m.span
        layoutId="nav-pill-current"
        transition={PILL_TRANSITION}
        className="absolute inset-0 rounded-lg bg-accent-subtle"
      />
    );
  }
  if (isHovered) {
    return (
      <m.span
        layoutId="nav-pill-hover"
        transition={PILL_TRANSITION}
        className="absolute inset-0 rounded-lg bg-bg-subtle"
      />
    );
  }
  return null;
}

type NavLinksProps = {
  categories: readonly IHeaderCategory[];
  pathname: string | null;
};

export function NavLinks({ categories, pathname }: NavLinksProps) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax} strict>
        <nav aria-label="Điều hướng chính" className="hidden md:block">
          <ul
            className="flex items-center gap-0.5"
            onPointerLeave={() => setHoveredHref(null)}
          >
            {NAV_ITEMS.map((item) => {
              const isCurrent = isCurrentPage(item, pathname);
              const pill = (
                <NavPill
                  isCurrent={isCurrent}
                  isHovered={hoveredHref === item.href}
                />
              );
              const className = cn(
                "relative flex h-9 items-center rounded-lg px-2.5 text-sm font-medium whitespace-nowrap transition-colors lg:px-3",
                FOCUS_RING_CLASS_NAME,
                isCurrent
                  ? "text-accent-text"
                  : "text-text-secondary hover:text-text-primary aria-expanded:text-text-primary",
              );
              return (
                <li
                  key={item.href}
                  onPointerEnter={() => setHoveredHref(item.href)}
                >
                  {item.href === VISUALIZATION_PATH ? (
                    <SimulationMenu
                      categories={categories}
                      label={item.label}
                      isCurrent={isCurrent}
                      pill={pill}
                      triggerClassName={className}
                    />
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={isCurrent ? "page" : undefined}
                      className={className}
                    >
                      {pill}
                      <span className="relative">{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </LazyMotion>
    </MotionConfig>
  );
}

type CurrentNavLinksProps = {
  categories: readonly IHeaderCategory[];
};

export function CurrentNavLinks({ categories }: CurrentNavLinksProps) {
  return <NavLinks categories={categories} pathname={usePathname()} />;
}
