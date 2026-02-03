import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEmployees } from "../services/api";
import { cacheEmployees } from "../services/db";

export function useEmployeeCache() {
  const query = useQuery({
    queryKey: ["employees", "cache"],
    queryFn: fetchEmployees,
    staleTime: 1000 * 60 * 10
  });

  useEffect(() => {
    if (query.data) {
      cacheEmployees(query.data).catch(() => undefined);
    }
  }, [query.data]);

  return query;
}
