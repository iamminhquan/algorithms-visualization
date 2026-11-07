import type { Metadata } from "next";
import { Suspense } from "react";
import {
  StudentClassesView,
  StudentClassesViewSkeleton,
} from "./_components/student-classes-view";

export const metadata: Metadata = {
  title: "Lớp học của tôi",
};

export default function StudentClassesPage() {
  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 sm:pt-14 lg:px-20">
      <div className="mx-auto w-full max-w-310">
        <Suspense fallback={<StudentClassesViewSkeleton />}>
          <StudentClassesView />
        </Suspense>
      </div>
    </main>
  );
}
