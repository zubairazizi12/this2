import { useQuery } from "@tanstack/react-query";
import type { Trainer } from "server/models/Trainers";

export function useTrainers() {
  return useQuery<Trainer[]>({
    queryKey: ["trainers"],
    queryFn: async () => {
      const res = await fetch("/api/trainers");
      if (!res.ok) throw new Error("Failed to fetch trainers");
      return res.json();
    },
  });
}
