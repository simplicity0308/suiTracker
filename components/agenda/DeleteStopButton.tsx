"use client";

import { useTransition } from "react";
import { deleteStop } from "@/lib/actions/stops";

export function DeleteStopButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => deleteStop(id))}
      disabled={pending}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      Remove
    </button>
  );
}
