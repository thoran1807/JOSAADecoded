import { NextResponse } from 'next/server';
import { getAllCutoffs, getFilters } from '@/lib/dataParser';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // If requesting filters
  if (searchParams.get('type') === 'filters') {
    return NextResponse.json(getFilters());
  }

  // If requesting data
  let data = getAllCutoffs();
  
  const year = searchParams.get('year');
  const institute = searchParams.get('institute');
  const program = searchParams.get('program');
  const seatType = searchParams.get('seatType');
  const gender = searchParams.get('gender');

  if (year) data = data.filter(d => d.year.toString() === year);
  if (institute) data = data.filter(d => d.institute.toLowerCase().includes(institute.toLowerCase()));
  if (program) data = data.filter(d => d.program.toLowerCase().includes(program.toLowerCase()));
  if (seatType) data = data.filter(d => d.seatType === seatType);
  if (gender) data = data.filter(d => d.gender === gender);

  // Default to 2024 if no year specified (since 2025 might not be fully available or is the latest)
  // Wait, let's just return what's filtered.
  
  // To avoid huge payloads, limit to top 1000 if no strong filters
  if (!institute && !program && data.length > 2000) {
     data = data.slice(0, 2000);
  }

  return NextResponse.json(data);
}
