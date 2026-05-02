import { getFilters } from "@/lib/dataParser";
import PredictorClient from "./PredictorClient";

export const dynamic = "force-dynamic";

export default async function PredictorPage() {
  const filters = getFilters();

  return (
    <PredictorClient filters={filters} />
  );
}
