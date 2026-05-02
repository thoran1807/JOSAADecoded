import { getAllCutoffs, getFilters } from "@/lib/dataParser";
import CutoffsClient from "./CutoffsClient";

export const dynamic = "force-dynamic"; // Ensures fresh data if CSVs update

export default async function CutoffsPage() {
  const initialData = getAllCutoffs().slice(0, 1000); // Send first 1000 to avoid huge hydration payload initially
  const filters = getFilters();

  return (
    <CutoffsClient initialData={initialData} filters={filters} />
  );
}
