import type { Metadata } from "next";
import { Suspense } from "react";
import {
  StudentClassDetailView,
  StudentClassDetailViewSkeleton,
} from "./_components/student-class-detail-view";

export const metadata: Metadata = {
  title: "Chi tiết lớp học",
};

export default function StudentClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 sm:pt-14 lg:px-20">
      <div className="mx-auto w-full max-w-310">
        <Suspense fallback={<StudentClassDetailViewSkeleton />}>
          <StudentClassDetailView params={params} />
        </Suspense>
      </div>
    </main>
  );
}
