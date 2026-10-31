# Ví dụ component

Các ví dụ dưới đây đã được kiểm tra với `tsc --noEmit` và `biome check` của dự án. Dùng làm khuôn,
điều chỉnh theo yêu cầu thực tế — đừng chép nguyên nếu không cần.

## Mục lục

1. [Helper `cn`](#1-helper-cn) — `lib/cn.ts`
2. [Primitive có biến thể: Button](#2-primitive-có-biến-thể-button) — `components/ui/button.tsx`
3. [Primitive bố cục: Card](#3-primitive-bố-cục-card) — `components/ui/card.tsx`
4. [Query có cache](#4-query-có-cache) — `features/catalog/queries.ts`
5. [Server Component đọc dữ liệu + skeleton](#5-server-component-đọc-dữ-liệu--skeleton)
6. [Trang động với `params` và Suspense](#6-trang-động-với-params-và-suspense)
7. [Client Component tương tác](#7-client-component-tương-tác)
8. [Error boundary cấp component](#8-error-boundary-cấp-component)

---

## 1. Helper `cn`

Dự án không cài `clsx`/`tailwind-merge`. Helper nhỏ này đủ để ghép class có điều kiện.

```ts
// lib/cn.ts
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
```

## 2. Primitive có biến thể: Button

Biến thể khai báo bằng object map để mỗi tổ hợp class được viết một lần, không xung đột.

```tsx
// components/ui/button.tsx
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-foreground text-background hover:bg-foreground/85",
  secondary: "border border-foreground/15 hover:bg-foreground/5",
  ghost: "hover:bg-foreground/5",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-lg",
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
```

`type="button"` mặc định để nút trong `<form>` không vô tình submit.

## 3. Primitive bố cục: Card

Server Component thuần, nhận `children` nên dùng được cả trong trang server lẫn component client.

```tsx
// components/ui/card.tsx
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-foreground/10 bg-background p-5",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-foreground/70", className)} {...props} />
  );
}
```

## 4. Query có cache

Dữ liệu danh mục/thuật toán ít đổi và giống nhau với mọi người → cache, gắn tag để invalidate khi có
mutation (`updateTag("algorithms")` trong Server Function).

```ts
// features/catalog/queries.ts
import "server-only";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { algorithmsTable } from "@/db/schema";

export async function getAlgorithms() {
  "use cache";
  cacheLife("hours");
  cacheTag("algorithms");

  return db.query.algorithmsTable.findMany({
    columns: { id: true, name: true, slug: true, timeComplexity: true },
    with: { category: { columns: { name: true, slug: true } } },
    orderBy: (t, { asc }) => asc(t.name),
  });
}

export async function getAlgorithmBySlug(
  categorySlug: string,
  algorithmSlug: string,
) {
  "use cache";
  cacheLife("hours");
  cacheTag("algorithms", `algorithm-${algorithmSlug}`);

  const algorithm = await db.query.algorithmsTable.findFirst({
    where: eq(algorithmsTable.slug, algorithmSlug),
    with: { category: true },
  });
  return algorithm?.category.slug === categorySlug ? algorithm : undefined;
}

export type AlgorithmListItem = Awaited<
  ReturnType<typeof getAlgorithms>
>[number];
```

## 5. Server Component đọc dữ liệu + skeleton

Component "section" tự đọc dữ liệu; component trình bày (`AlgorithmCard`) chỉ nhận props. Skeleton đặt
cùng file, có kích thước gần giống nội dung thật.

```tsx
// features/catalog/components/algorithm-card.tsx
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { AlgorithmListItem } from "@/features/catalog/queries";
import { getAlgorithmHref } from "@/features/catalog/routes";

type AlgorithmCardProps = {
  algorithm: AlgorithmListItem;
};

export function AlgorithmCard({ algorithm }: AlgorithmCardProps) {
  return (
    <Link
      href={getAlgorithmHref(algorithm.category.slug, algorithm.slug)}
      className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <Card className="h-full transition-colors hover:border-foreground/30">
        <CardDescription>{algorithm.category.name}</CardDescription>
        <CardTitle className="mt-1">{algorithm.name}</CardTitle>
        {algorithm.timeComplexity && (
          <p className="mt-3 font-mono text-sm">{algorithm.timeComplexity}</p>
        )}
      </Card>
    </Link>
  );
}
```

```tsx
// features/catalog/components/algorithm-list.tsx
import { AlgorithmCard } from "@/features/catalog/components/algorithm-card";
import { getAlgorithms } from "@/features/catalog/queries";

export async function AlgorithmList() {
  const algorithms = await getAlgorithms();

  if (algorithms.length === 0) {
    return <p className="text-foreground/70">Chưa có thuật toán nào.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {algorithms.map((algorithm) => (
        <li key={algorithm.id}>
          <AlgorithmCard algorithm={algorithm} />
        </li>
      ))}
    </ul>
  );
}

// Key cố định cho các ô skeleton (Biome không cho dùng index làm key).
const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"];

export function AlgorithmListSkeleton() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {SKELETON_KEYS.map((key) => (
        <li
          key={key}
          className="h-32 animate-pulse rounded-2xl bg-foreground/5"
        />
      ))}
    </ul>
  );
}
```

`getAlgorithms` có `"use cache"` nên `AlgorithmList` đi vào static shell. Nếu bỏ cache (dữ liệu cần mới
mỗi request), trang phải bọc nó: `<Suspense fallback={<AlgorithmListSkeleton />}>`.

## 6. Trang động với `params` và Suspense

`params` là Promise. Trang giữ đồng bộ, phần phụ thuộc `params` nằm trong Suspense nên header của trang
hiện ngay.

```tsx
// app/(site)/visualization/[category]/[algorithm]/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAlgorithmBySlug } from "@/features/catalog/queries";

export default function AlgorithmPage({
  params,
}: PageProps<"/visualization/[category]/[algorithm]">) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Suspense fallback={<AlgorithmDetailSkeleton />}>
        {params.then(({ category, algorithm }) => (
          <AlgorithmDetail categorySlug={category} algorithmSlug={algorithm} />
        ))}
      </Suspense>
    </main>
  );
}

async function AlgorithmDetail({
  categorySlug,
  algorithmSlug,
}: {
  categorySlug: string;
  algorithmSlug: string;
}) {
  const algorithm = await getAlgorithmBySlug(categorySlug, algorithmSlug);
  if (!algorithm) notFound();

  return (
    <article>
      <p className="text-sm text-foreground/70">{algorithm.category.name}</p>
      <h1 className="mt-1 text-3xl font-semibold">{algorithm.name}</h1>
      {algorithm.description && (
        <p className="mt-4 leading-7">{algorithm.description}</p>
      )}
      <dl className="mt-6 grid grid-cols-2 gap-4 font-mono text-sm">
        <div>
          <dt className="text-foreground/70">Thời gian</dt>
          <dd>{algorithm.timeComplexity ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-foreground/70">Bộ nhớ</dt>
          <dd>{algorithm.spaceComplexity ?? "—"}</dd>
        </div>
      </dl>
    </article>
  );
}

function AlgorithmDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-hidden>
      <div className="h-4 w-24 rounded bg-foreground/5" />
      <div className="h-9 w-2/3 rounded bg-foreground/5" />
      <div className="h-20 rounded bg-foreground/5" />
    </div>
  );
}
```

## 7. Client Component tương tác

Lọc danh sách ngay trên trình duyệt. Server truyền xuống dữ liệu đã chọn trường; client chỉ giữ state ô
tìm kiếm. Không có `useMemo` — React Compiler tự lo.

```tsx
// features/catalog/components/algorithm-search.tsx
"use client";

import { useState } from "react";
import { AlgorithmCard } from "@/features/catalog/components/algorithm-card";
import type { AlgorithmListItem } from "@/features/catalog/queries";

type AlgorithmSearchProps = {
  algorithms: AlgorithmListItem[];
};

export function AlgorithmSearch({ algorithms }: AlgorithmSearchProps) {
  const [query, setQuery] = useState("");

  const keyword = query.trim().toLocaleLowerCase("vi");
  const results = algorithms.filter((a) =>
    a.name.toLocaleLowerCase("vi").includes(keyword),
  );

  return (
    <section aria-labelledby="algorithm-search-heading">
      <h2 id="algorithm-search-heading" className="sr-only">
        Tìm thuật toán
      </h2>
      <label htmlFor="algorithm-search" className="text-sm font-medium">
        Tìm theo tên
      </label>
      <input
        id="algorithm-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ví dụ: sắp xếp nổi bọt"
        className="mt-1 h-10 w-full rounded-lg border border-foreground/15 bg-background px-3 focus-visible:outline-2 focus-visible:outline-foreground"
      />
      {results.length === 0 ? (
        <p className="mt-6 text-foreground/70">
          Không tìm thấy thuật toán nào khớp với “{query}”.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {results.map((algorithm) => (
            <li key={algorithm.id}>
              <AlgorithmCard algorithm={algorithm} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

`queries.ts` có `import "server-only"`, nhưng ở đây chỉ `import type` nên không kéo code server xuống
client. `AlgorithmCard` không có `"use client"` vẫn dùng được trong file client — nó sẽ chạy như
component client.

Dùng ở trang server:

```tsx
const algorithms = await getAlgorithms();
return <AlgorithmSearch algorithms={algorithms} />;
```

## 8. Error boundary cấp component

Bọc một vùng có thể lỗi mà không làm sập cả trang.

```tsx
// components/ui/error-boundary.tsx
"use client";

import { catchError, type ErrorInfo } from "next/error";
import { Button } from "@/components/ui/button";

function ErrorFallback(props: { title?: string }, { error, retry }: ErrorInfo) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div role="alert" className="rounded-2xl border border-foreground/15 p-5">
      <p className="font-medium">{props.title ?? "Đã có lỗi xảy ra"}</p>
      <p className="mt-1 text-sm text-foreground/70">{message}</p>
      <Button
        variant="secondary"
        size="sm"
        className="mt-3"
        onClick={() => retry()}
      >
        Thử lại
      </Button>
    </div>
  );
}

export const ErrorBoundary = catchError(ErrorFallback);
```

```tsx
<ErrorBoundary title="Không tải được danh sách thuật toán">
  <Suspense fallback={<AlgorithmListSkeleton />}>
    <AlgorithmList />
  </Suspense>
</ErrorBoundary>
```
