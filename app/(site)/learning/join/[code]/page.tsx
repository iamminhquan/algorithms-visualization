import type { Metadata } from "next";
import { Suspense } from "react";
import {
  JoinClassView,
  JoinClassViewSkeleton,
} from "./_components/join-class-view";

export const metadata: Metadata = {
  title: "Tham gia lớp học",
};

export default function JoinClassPage({
  params,
}: PageProps<"/learning/join/[code]">) {
  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 sm:pt-14 lg:px-20">
      <div className="mx-auto flex w-full max-w-310 flex-col gap-12">
        <Suspense fallback={<JoinClassViewSkeleton />}>
          <JoinClassView params={params} />
        </Suspense>
      </div>
    </main>
  );
}
