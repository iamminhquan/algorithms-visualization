import type { Metadata } from "next";
import { Suspense } from "react";
import {
  StudentExamView,
  StudentExamViewSkeleton,
} from "./_components/student-exam-view";

export const metadata: Metadata = {
  title: "Bài kiểm tra",
};

export default function StudentExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 sm:pt-14 lg:px-20">
      <div className="mx-auto w-full max-w-240">
        <Suspense fallback={<StudentExamViewSkeleton />}>
          <StudentExamView params={params} />
        </Suspense>
      </div>
    </main>
  );
}
