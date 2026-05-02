"use client";

import { useState, useMemo, useEffect } from "react";
import styles from "./cutoffs.module.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, X, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export default function CutoffsClient({ initialData, filters }: { initialData: any[], filters: any }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [year, setYear] = useState(filters.years[0]?.toString() || "2024");
  const [instType, setInstType] = useState("");
  const [selectedInst, setSelectedInst] = useState("");
  const [coreBranch, setCoreBranch] = useState("");
  const [selectedProg, setSelectedProg] = useState("");
  const [seatType, setSeatType] = useState("");
  const [gender, setGender] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 50;

  // Sorting
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({ key: "closingRank", direction: "asc" });

  // Modal
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);

  const CORE_BRANCHES: Record<string, string[]> = {
    "Computer Science & AI": ["computer", "artificial", "data science", "information technology", "software", "mathematics and computing"],
    "Electronics & Comm (ECE)": ["electronic", "vlsi", "communication"],
    "Electrical (EE)": ["electrical"],
    "Mechanical & Aerospace": ["mechanic", "aerospace", "aeronautical", "manufacturing", "production"],
    "Civil & Architecture": ["civil", "architecture", "planning"],
    "Chemical & Metallurgy": ["chemical", "material", "metallurg"],
  };

  // Compute available institutes based on type
  const availableInstitutes = useMemo(() => {
    return filters.institutes.filter((i: string) => {
      if (!instType) return true;
      const lower = i.toLowerCase();
      const isIIT = lower.includes("indian institute") && lower.includes("technology") && !lower.includes("information");
      const isNIT = lower.includes("national institute of technology");
      const isIIIT = lower.includes("information technology") || lower.includes("iiit");
      
      if (instType === "IIT") return isIIT;
      if (instType === "NIT") return isNIT;
      if (instType === "IIIT") return isIIIT;
      if (instType === "GFTI") return !isIIT && !isNIT && !isIIIT;
      return true;
    });
  }, [filters.institutes, instType]);

  // Compute available programs based on coreBranch
  const availablePrograms = useMemo(() => {
    return filters.programs.filter((p: string) => {
      if (!coreBranch) return true;
      const lower = p.toLowerCase();
      const keywords = CORE_BRANCHES[coreBranch];
      return keywords.some(k => lower.includes(k));
    });
  }, [filters.programs, coreBranch]);

  // Clean program names for UI
  const cleanProgramName = (name: string) => {
    return name
      .replace("(4 Years, Bachelor of Technology)", "(B.Tech)")
      .replace("(5 Years, Bachelor and Master of Technology (Dual Degree))", "(Dual Degree)")
      .replace("(5 Years, Integrated Master of Technology)", "(Int. M.Tech)")
      .replace("(5 Years, Bachelor of Architecture)", "(B.Arch)")
      .replace("(4 Years, Bachelor of Science)", "(B.Sc)")
      .replace("(5 Years, Integrated Master of Science)", "(Int. M.Sc)");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (year) query.append("year", year);
        if (selectedInst) query.append("institute", selectedInst);
        if (selectedProg) query.append("program", selectedProg);
        if (seatType) query.append("seatType", seatType);
        if (gender) query.append("gender", gender);

        // If instType is selected but no specific institute, we'd ideally fetch all of that type.
        // But our API doesn't support instType natively yet. We can just fetch all and filter on client,
        // or just let the user pick an institute. To keep it fast, we rely on the user picking an institute,
        // or if they don't, we just fetch based on other filters and then filter on client.
        
        const res = await fetch(`/api/cutoffs?${query.toString()}`);
        let result = await res.json();
        
        // Client-side filter for instType and coreBranch
        if (instType || coreBranch) {
          result = result.filter((row: any) => {
            let keep = true;
            if (instType && !selectedInst) {
              const lower = row.institute.toLowerCase();
              const isIIT = lower.includes("indian institute") && lower.includes("technology") && !lower.includes("information");
              const isNIT = lower.includes("national institute of technology");
              const isIIIT = lower.includes("information technology") || lower.includes("iiit");
              
              if (instType === "IIT") keep = keep && isIIT;
              else if (instType === "NIT") keep = keep && isNIT;
              else if (instType === "IIIT") keep = keep && isIIIT;
              else if (instType === "GFTI") keep = keep && (!isIIT && !isNIT && !isIIIT);
            }
            if (coreBranch && !selectedProg) {
               const lower = row.program.toLowerCase();
               const keywords = CORE_BRANCHES[coreBranch];
               keep = keep && keywords.some(k => lower.includes(k));
            }
            return keep;
          });
        }

        setData(result);
        setPage(1);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
      setLoading(false);
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [year, selectedInst, selectedProg, seatType, gender, instType, coreBranch]);

  // Handle Type Change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInstType(e.target.value);
    setSelectedInst(""); // Reset institute when type changes
  };

  const handleCoreBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCoreBranch(e.target.value);
    setSelectedProg(""); // Reset program when core branch changes
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setPage(1);
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    
    const categoryWeight: Record<string, number> = {
      "OPEN": 1,
      "OPEN (PwD)": 2,
      "EWS": 3,
      "EWS (PwD)": 4,
      "OBC-NCL": 5,
      "OBC-NCL (PwD)": 6,
      "SC": 7,
      "SC (PwD)": 8,
      "ST": 9,
      "ST (PwD)": 10
    };

    sortableItems.sort((a, b) => {
      // Always prioritize IITs at the top
      const isIIT_A = a.institute.toLowerCase().includes("indian institute") && a.institute.toLowerCase().includes("technology") && !a.institute.toLowerCase().includes("information");
      const isIIT_B = b.institute.toLowerCase().includes("indian institute") && b.institute.toLowerCase().includes("technology") && !b.institute.toLowerCase().includes("information");
      
      if (isIIT_A && !isIIT_B) return -1;
      if (!isIIT_A && isIIT_B) return 1;

      const catWeightA = categoryWeight[a.seatType] || 99;
      const catWeightB = categoryWeight[b.seatType] || 99;

      if (sortConfig.key === "institute") {
        // Sort by institute name
        if (a.institute < b.institute) return sortConfig.direction === "asc" ? -1 : 1;
        if (a.institute > b.institute) return sortConfig.direction === "asc" ? 1 : -1;
        
        // If same institute, sort by Program
        if (a.program < b.program) return -1;
        if (a.program > b.program) return 1;

        // If same program, sort by category
        if (catWeightA < catWeightB) return -1;
        if (catWeightA > catWeightB) return 1;
      } else {
        // Sorting by rank: Category MUST be higher priority than numerical rank
        // otherwise SC ranks (which are numerically lower) will appear above OPEN ranks
        if (catWeightA < catWeightB) return -1;
        if (catWeightA > catWeightB) return 1;

        // Then sort by the actual numerical rank
        let valA = parseInt(a[sortConfig.key].toString().replace(/\D/g, '')) || 9999999;
        let valB = parseInt(b[sortConfig.key].toString().replace(/\D/g, '')) || 9999999;

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      }

      return 0;
    });
    return sortableItems;
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const currentData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const fetchTrendData = async (row: any) => {
    setSelectedRow(row);
    const query = new URLSearchParams({
      institute: row.institute,
      program: row.program,
      seatType: row.seatType,
      gender: row.gender
    });
    const res = await fetch(`/api/cutoffs?${query.toString()}`);
    const result = await res.json();
    
    const processed = result
      .sort((a: any, b: any) => a.year - b.year)
      .map((d: any) => ({
        year: d.year,
        closingRank: parseInt(d.closingRank.toString().replace(/\D/g, '')) || 0
      }));
    
    setTrendData(processed);
  };

  const exportCSV = () => {
    const headers = ["Year", "Institute", "Program", "Quota", "Seat Type", "Gender", "Opening Rank", "Closing Rank"];
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        `"${row.year}","${row.institute}","${row.program}","${row.quota}","${row.seatType}","${row.gender}","${row.openingRank}","${row.closingRank}"`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `josaa_cutoffs_${year}.csv`;
    link.click();
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3, marginLeft: '4px', verticalAlign: 'middle' }} />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} style={{ marginLeft: '4px', verticalAlign: 'middle', color: 'var(--accent-blue)' }} /> 
      : <ArrowDown size={14} style={{ marginLeft: '4px', verticalAlign: 'middle', color: 'var(--accent-blue)' }} />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1>Cutoff Explorer</h1>
            <p>Analyze opening and closing ranks across all IITs, NITs, and IIITs.</p>
          </div>
          <button 
            className={styles.iconBtn} 
            onClick={exportCSV} 
            title="Download CSV"
          >
            <Download size={18} style={{ marginRight: '8px' }} /> Export CSV
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label>Institute Type</label>
          <select value={instType} onChange={handleTypeChange}>
            <option value="">All Types</option>
            <option value="IIT">IITs</option>
            <option value="NIT">NITs</option>
            <option value="IIIT">IIITs</option>
            <option value="GFTI">GFTIs</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Institute</label>
          <select 
            value={selectedInst} 
            onChange={(e) => setSelectedInst(e.target.value)}
            disabled={instType !== "" && availableInstitutes.length === 0}
          >
            <option value="">All Institutes</option>
            {availableInstitutes.map((i: string) => (
              <option key={i} value={i}>{i.length > 50 ? i.substring(0, 50) + "..." : i}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Core Branch</label>
          <select value={coreBranch} onChange={handleCoreBranchChange}>
            <option value="">All Core Branches</option>
            {Object.keys(CORE_BRANCHES).map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Program / Specialization</label>
          <select value={selectedProg} onChange={(e) => setSelectedProg(e.target.value)} disabled={coreBranch !== "" && availablePrograms.length === 0}>
            <option value="">All Programs</option>
            {availablePrograms.map((p: string) => (
              <option key={p} value={p}>{cleanProgramName(p).length > 50 ? cleanProgramName(p).substring(0, 50) + "..." : cleanProgramName(p)}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label>Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">All Years</option>
            {filters.years.map((y: number) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Category</label>
          <select value={seatType} onChange={(e) => setSeatType(e.target.value)}>
            <option value="">All Categories</option>
            {filters.seatTypes.map((s: string) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">All Genders</option>
            {filters.genders.map((g: string) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('institute')} style={{ cursor: 'pointer' }}>
                Institute {renderSortIcon('institute')}
              </th>
              <th>Program</th>
              <th>Category</th>
              <th>Gender</th>
              <th onClick={() => handleSort('openingRank')} style={{ cursor: 'pointer' }}>
                Opening Rank {renderSortIcon('openingRank')}
              </th>
              <th onClick={() => handleSort('closingRank')} style={{ cursor: 'pointer' }}>
                Closing Rank {renderSortIcon('closingRank')}
              </th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</td></tr>
            ) : currentData.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No results found. Try adjusting filters.</td></tr>
            ) : (
              currentData.map((row, i) => (
                <tr key={i}>
                  <td style={{ maxWidth: '250px', whiteSpace: 'normal', fontSize: '0.85rem' }}>{row.institute}</td>
                  <td style={{ maxWidth: '250px', whiteSpace: 'normal', fontSize: '0.85rem' }}>{cleanProgramName(row.program)}</td>
                  <td>{row.seatType}</td>
                  <td>{row.gender}</td>
                  <td>{row.openingRank}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{row.closingRank}</td>
                  <td>
                    <button className={styles.trendBtn} onClick={() => fetchTrendData(row)}>
                      <TrendingUp size={14} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {!loading && data.length > 0 && (
          <div className={styles.pagination}>
            <span>Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, data.length)} of {data.length} entries</span>
            <div className={styles.pageControls}>
              <button className={styles.btn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span style={{ fontSize: '0.9rem' }}>Page {page} of {totalPages}</span>
              <button className={styles.btn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Trend Modal */}
      {selectedRow && (
        <div className={styles.modalOverlay} onClick={() => setSelectedRow(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Closing Rank Trend</h2>
                <p>{selectedRow.institute} - {selectedRow.program}</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{selectedRow.seatType} | {selectedRow.gender}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedRow(null)}><X size={24} /></button>
            </div>
            
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis reversed stroke="#94a3b8" domain={['dataMin', 'dataMax']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#8b5cf6' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line type="monotone" dataKey="closingRank" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
              *Lower rank is better. Chart y-axis is reversed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
