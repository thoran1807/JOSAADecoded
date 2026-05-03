import { getFilters, getCollegeMetadata } from "@/lib/dataParser";
import CompareClient from "./CompareClient";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const filters = getFilters();
  const metadata = getCollegeMetadata();

  return (
    <CompareClient filters={filters} metadata={metadata} />
  );
}
