"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { getButtonClassName } from "./button";

type CopyButtonProps = {
  value: string;
  label: string;
  copiedLabel?: string;
  className?: string;
};

export function CopyButton({
  value,
  label,
  copiedLabel = "Đã sao chép",
  className,
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return;
    }
    const timeout = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={isCopied ? copiedLabel : label}
      title={isCopied ? copiedLabel : label}
      onClick={handleCopy}
      className={cn(getButtonClassName("ghost", "icon"), className)}
    >
      {isCopied ? (
        <Check aria-hidden="true" className="text-success-text" />
      ) : (
        <Copy aria-hidden="true" />
      )}
    </button>
  );
}
