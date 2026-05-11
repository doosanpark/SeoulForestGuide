"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "seoulforest:privacy-acked";

export function PrivacyModal() {
  // Start closed to avoid SSR/CSR mismatch; open on mount if unacked.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      // localStorage unavailable (private mode etc.) — show once per session
      setOpen(true);
    }
  }, []);

  const ack = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) ack();
      }}
    >
      <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>사진 분석 안내</DialogTitle>
          <DialogDescription className="text-ink-muted leading-relaxed">
            업로드한 사진은 AI 분석에만 사용되며{" "}
            <strong className="text-ink">서버에 저장되지 않습니다.</strong>
            <br />
            사진의 위치 정보(EXIF)는 전송 전에 자동으로 제거돼요.
            <br />
            현재 위치는 권한을 허용할 때만 함께 전송됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={ack}
            className="w-full rounded-xl bg-forest text-beige-50 py-3 font-semibold active:scale-[0.99] transition-transform"
          >
            확인
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
