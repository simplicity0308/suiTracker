"use client";

import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteStop } from "@/lib/actions/stops";
import { TRIP_DATA_KEY } from "@/hooks/useTripData";

export function DeleteStopButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await deleteStop(id);
          queryClient.invalidateQueries({ queryKey: TRIP_DATA_KEY });
        })
      }
      disabled={pending}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      Remove
    </button>
  );
}
