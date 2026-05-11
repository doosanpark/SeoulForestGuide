import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PrivacyModal } from "@/components/PrivacyModal";
import { AskClient } from "./AskClient";

export const metadata = {
  title: "사진으로 물어보기 · 서울숲 투어",
};

export default function AskPage() {
  return (
    <>
      <AppHeader title="사진으로 물어보기" backHref="/" />
      <Suspense fallback={<AskFallback />}>
        <AskClient />
      </Suspense>
      <PrivacyModal />
    </>
  );
}

function AskFallback() {
  return (
    <main className="flex-1 px-5 py-6 flex flex-col items-center justify-center text-ink-muted">
      불러오는 중...
    </main>
  );
}
