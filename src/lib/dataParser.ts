import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export interface CutoffRow {
  year: number;
  institute: string;
  program: string;
  quota: string;
  seatType: string;
  gender: string;
  openingRank: string;
  closingRank: string;
}

let cachedData: CutoffRow[] = [];

export function getAllCutoffs(): CutoffRow[] {
  if (cachedData.length > 0) return cachedData;

  const dataDir = path.join(process.cwd(), 'cutoffs');
  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const allRows: CutoffRow[] = [];

  for (const year of years) {
    const filePath = path.join(dataDir, `${year}_cutoffs.csv`);
    if (!fs.existsSync(filePath)) continue;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    for (const row of parsed.data as any[]) {
      const institute = row['Institute'] || row['Institute Name'] || '';
      const program = row['Academic Program Name'] || row['Program'] || '';
      
      // Skip empty or invalid rows
      if (!institute || !program) continue;

      allRows.push({
        year,
        institute,
        program,
        quota: row['Quota'] || '',
        seatType: row['Seat Type'] || row['Category'] || '',
        gender: row['Gender'] || row['Pool'] || '',
        openingRank: row['Opening Rank'] || '',
        closingRank: row['Closing Rank'] || '',
      });
    }
  }

  cachedData = allRows;
  return cachedData;
}

export function getFilters() {
  const data = getAllCutoffs();
  const institutes = Array.from(new Set(data.map(d => d.institute))).sort();
  const programs = Array.from(new Set(data.map(d => d.program))).sort();
  const seatTypes = Array.from(new Set(data.map(d => d.seatType))).sort();
  const genders = Array.from(new Set(data.map(d => d.gender))).sort();
  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => b - a);

  return { institutes, programs, seatTypes, genders, years };
}
