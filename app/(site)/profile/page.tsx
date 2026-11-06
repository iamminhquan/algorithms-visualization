import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileView, ProfileViewSkeleton } from "./_components/profile-view";

export const metadata: Metadata = {
  title: "Hồ sơ",
};

export default function ProfilePage() {
  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 lg:px-20">
      <div className="mx-auto w-full max-w-160">
        <Suspense fallback={<ProfileViewSkeleton />}>
          <ProfileView />
        </Suspense>
      </div>
    </main>
  );
}
