"use client";

import React, { useState, useMemo } from "react";
import styles from "./predictor.module.css";
import { GraduationCap, TrendingUp, X, MapPin, BarChart2, Banknote, Filter, Search, ChevronDown, ChevronUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import modalStyles from "../cutoffs/cutoffs.module.css"; 

const stateToNITMap: Record<string, string[]> = {
  "Andhra Pradesh": ["National Institute of Technology, Andhra Pradesh", "Indian Institute of Technology Tirupati", "Indian Institute of Information Technology Sri City"],
  "Arunachal Pradesh": ["National Institute of Technology, Arunachal Pradesh"],
  "Assam": ["National Institute of Technology, Silchar", "Indian Institute of Technology Guwahati", "Indian Institute of Information Technology Guwahati"],
  "Bihar": ["National Institute of Technology, Patna", "Indian Institute of Technology Patna", "Indian Institute of Information Technology Bhagalpur"],
  "Chhattisgarh": ["National Institute of Technology, Raipur", "Indian Institute of Technology Bhilai", "Indian Institute of Information Technology Naya Raipur"],
  "Delhi": ["National Institute of Technology, Delhi", "Indian Institute of Technology Delhi", "Indraprastha Institute of Information Technology Delhi"],
  "Goa": ["National Institute of Technology, Goa", "Indian Institute of Technology Goa"],
  "Gujarat": ["Sardar Vallabhbhai National Institute of Technology, Surat", "Indian Institute of Technology Gandhinagar", "Indian Institute of Information Technology Vadodara", "Indian Institute of Information Technology Surat"],
  "Haryana": ["National Institute of Technology, Kurukshetra", "Indian Institute of Information Technology Sonepat"],
  "Himachal Pradesh": ["National Institute of Technology, Hamirpur", "Indian Institute of Technology Mandi", "Indian Institute of Information Technology Una"],
  "Jammu and Kashmir": ["National Institute of Technology, Srinagar", "Indian Institute of Technology Jammu"],
  "Jharkhand": ["National Institute of Technology, Jamshedpur", "Indian Institute of Technology (ISM) Dhanbad", "Indian Institute of Information Technology Ranchi"],
  "Karnataka": ["National Institute of Technology Karnataka, Surathkal", "Indian Institute of Technology Dharwad", "Indian Institute of Information Technology Dharwad", "International Institute of Information Technology Bangalore"],
  "Kerala": ["National Institute of Technology, Calicut", "Indian Institute of Technology Palakkad", "Indian Institute of Information Technology Kottayam"],
  "Madhya Pradesh": ["Maulana Azad National Institute of Technology Bhopal", "Indian Institute of Technology Indore", "Indian Institute of Information Technology Design and Manufacturing Jabalpur", "Indian Institute of Information Technology Bhopal", "ABV-Indian Institute of Information Technology and Management Gwalior"],
  "Maharashtra": ["Visvesvaraya National Institute of Technology, Nagpur", "Indian Institute of Technology Bombay", "Indian Institute of Information Technology Pune", "Indian Institute of Information Technology Nagpur"],
  "Manipur": ["National Institute of Technology, Manipur", "Indian Institute of Information Technology Senapati"],
  "Meghalaya": ["National Institute of Technology, Meghalaya"],
  "Mizoram": ["National Institute of Technology, Mizoram"],
  "Nagaland": ["National Institute of Technology, Nagaland"],
  "Odisha": ["National Institute of Technology, Rourkela", "Indian Institute of Technology Bhubaneswar", "International Institute of Information Technology Bhubaneswar"],
  "Puducherry": ["National Institute of Technology, Puducherry"],
  "Punjab": ["Dr. B R Ambedkar National Institute of Technology, Jalandhar", "Indian Institute of Technology Ropar"],
  "Rajasthan": ["Malaviya National Institute of Technology Jaipur", "Indian Institute of Technology Jodhpur", "Indian Institute of Information Technology Kota"],
  "Sikkim": ["National Institute of Technology, Sikkim"],
  "Tamil Nadu": ["National Institute of Technology, Tiruchirappalli", "Indian Institute of Technology Madras", "Indian Institute of Information Technology Design and Manufacturing Kancheepuram", "Indian Institute of Information Technology Tiruchirappalli"],
  "Telangana": ["National Institute of Technology, Warangal", "Indian Institute of Technology Hyderabad", "International Institute of Information Technology Hyderabad"],
  "Tripura": ["National Institute of Technology, Agartala", "Indian Institute of Information Technology Agartala"],
  "Uttar Pradesh": ["Motilal Nehru National Institute of Technology Allahabad", "Indian Institute of Technology Kanpur", "Indian Institute of Technology (BHU) Varanasi", "Indian Institute of Information Technology Allahabad", "Indian Institute of Information Technology Lucknow"],
  "Uttarakhand": ["National Institute of Technology, Uttarakhand", "Indian Institute of Technology Roorkee"],
  "West Bengal": ["National Institute of Technology, Durgapur", "Indian Institute of Technology Kharagpur", "Indian Institute of Information Technology Kalyani", "Indian Institute of Engineering Science and Technology, Shibpur"],
  "Andaman and Nicobar Islands": ["National Institute of Technology, Puducherry"],
  "Chandigarh": ["Dr. B R Ambedkar National Institute of Technology, Jalandhar", "National Institute of Technology, Delhi", "Punjab Engineering College"],
  "Dadra and Nagar Haveli": ["Sardar Vallabhbhai National Institute of Technology, Surat"],
  "Daman and Diu": ["Sardar Vallabhbhai National Institute of Technology, Surat"],
  "Lakshadweep": ["National Institute of Technology, Calicut"],
  "Ladakh": ["National Institute of Technology, Srinagar"]
};

// Extracted from Mathongo requirements
const BRANCH_TYPES = [
  "Computer Science & Allied Branches",
  "Electronics & Electrical Branches",
  "Mechanical & Industrial Branches",
  "Civil & Chemical",
  "Architecture",
  "Biotechnology, Biomedical & Life Sciences",
  "Aerospace & Aviation",
  "Metallurgical, Materials & Mining",
  "Mathematics, Computing & Data (Non-CSE)",
  "Pure Sciences",
  "B.Tech + MBA / Management Dual Degrees",
  "Others"
];

const getBranchType = (program: string) => {
  const p = program.toLowerCase();
  if (p.includes("computer") || p.includes("artificial intelligence") || p.includes("data science") || p.includes("software") || p.includes("information technology")) return "Computer Science & Allied Branches";
  if (p.includes("electronic") || p.includes("electrical") || p.includes("instrumentation") || p.includes("communication")) return "Electronics & Electrical Branches";
  if (p.includes("mechanic") || p.includes("industrial") || p.includes("production") || p.includes("manufacturing") || p.includes("mechatronic")) return "Mechanical & Industrial Branches";
  if (p.includes("civil") || p.includes("chemical") || p.includes("environmental")) return "Civil & Chemical";
  if (p.includes("architecture") || p.includes("planning")) return "Architecture";
  if (p.includes("bio") || p.includes("life science")) return "Biotechnology, Biomedical & Life Sciences";
  if (p.includes("aero")) return "Aerospace & Aviation";
  if (p.includes("metallurg") || p.includes("material") || p.includes("mining") || p.includes("ceramic")) return "Metallurgical, Materials & Mining";
  if (p.includes("math") || p.includes("computing")) return "Mathematics, Computing & Data (Non-CSE)";
  if (p.includes("physics") || p.includes("chemistry") || p.includes("earth") || p.includes("science")) return "Pure Sciences";
  if (p.includes("mba") || p.includes("management")) return "B.Tech + MBA / Management Dual Degrees";
  return "Others";
};

const getInstituteState = (institute: string) => {
  for (const [state, colleges] of Object.entries(stateToNITMap)) {
    if (colleges.some(c => institute.toLowerCase().includes(c.toLowerCase().replace(" national", "")))) return state;
  }
  return "India";
};

export default function PredictorClient({ filters }: { filters: any }) {
  // Inputs
  const [exam, setExam] = useState("JEE Main");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [domicileState, setDomicileState] = useState("");

  // Results State
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);

  // Mathongo-style Advanced Filters
  const [probFilter, setProbFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [durationFilter, setDurationFilter] = useState<string[]>([]);
  const [degreeFilter, setDegreeFilter] = useState<string[]>([]);
  const [branchTypeFilter, setBranchTypeFilter] = useState<string[]>([]);
  const [stateFilter, setStateFilter] = useState<string[]>([]);

  // Filter UI Toggles
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    "Probability": true,
    "College Type": true,
    "Branch Types": true
  });

  const toggleFilterSection = (section: string) => {
    setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckbox = (setter: any, value: string) => {
    setter((prev: string[]) => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const clearFilters = () => {
    setProbFilter([]);
    setTypeFilter([]);
    setDurationFilter([]);
    setDegreeFilter([]);
    setBranchTypeFilter([]);
    setStateFilter([]);
  };

  // Modal State
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const handlePredict = async () => {
    if (!rank || !category || !gender) return;
    setLoading(true);
    setHasPredicted(true);
    clearFilters(); // Reset filters on new prediction

    try {
      const year = filters.years[0]; // Use latest year data
      const query = new URLSearchParams({
        year: year.toString(),
        seatType: category,
        gender: gender
      });

      const res = await fetch(`/api/cutoffs?${query.toString()}`);
      let data = await res.json();

      // Filter by Exam and Quotas
      data = data.filter((row: any) => {
        const isIIT = row.institute.toLowerCase().includes("indian institute") && row.institute.toLowerCase().includes("technology") && !row.institute.toLowerCase().includes("information");
        
        if (exam === "JEE Advanced") {
          return isIIT;
        } else {
          if (isIIT) return false; // Hide IITs for JEE Main

          let isHomeStateNIT = false;
          if (domicileState && stateToNITMap[domicileState]) {
            isHomeStateNIT = stateToNITMap[domicileState].some(n => row.institute.toLowerCase().includes(n.toLowerCase().replace(" national", ""))); // fuzzy match
          }

          if (row.quota === "HS") {
            if (!domicileState) return false; 
            if (!isHomeStateNIT) return false; 
          }
          if (row.quota === "OS") {
            if (domicileState && isHomeStateNIT) return false; 
          }
          return true;
        }
      });

      const userRank = parseInt(rank);
      const predictedResults = [];

      for (const row of data) {
        const cr = parseInt(row.closingRank.toString().replace(/\D/g, ''));
        if (!cr) continue;

        let probability = "";
        if (userRank <= cr * 0.8) probability = "High";
        else if (userRank <= cr * 1.0) probability = "Medium";
        else if (userRank <= cr * 1.15) probability = "Low";

        if (probability) {
          // Clean the degree name out of the program string for better UI
          let degree = "B.Tech";
          let duration = "4 Years";
          if (row.program.includes("Bachelor of Architecture")) { degree = "B.Arch"; duration = "5 Years"; }
          else if (row.program.includes("Dual Degree")) { degree = "B.Tech + M.Tech"; duration = "5 Years"; }
          else if (row.program.includes("Bachelor of Science")) { degree = "B.Sc"; duration = "4 Years"; }
          else if (row.program.includes("Integrated Master")) { degree = "Integrated M.Tech / M.Sc"; duration = "5 Years"; }

          let collegeType = "Others";
          if (row.institute.includes("Indian Institute of Technology")) collegeType = "IIT";
          else if (row.institute.includes("National Institute of Technology")) collegeType = "NIT";
          else if (row.institute.includes("Indian Institute of Information Technology")) collegeType = "IIIT";
          else collegeType = "GFTI";

          predictedResults.push({
            ...row,
            probability,
            degree,
            duration,
            collegeType,
            branchType: getBranchType(row.program),
            state: getInstituteState(row.institute),
            difference: cr - userRank
          });
        }
      }

      // Sort by closing rank (Best colleges first)
      predictedResults.sort((a, b) => parseInt(a.closingRank) - parseInt(b.closingRank));

      setResults(predictedResults);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      // OR logic within groups. If array is empty, it means "no filter applied", so true.
      if (probFilter.length > 0 && !probFilter.includes(r.probability)) return false;
      if (typeFilter.length > 0 && !typeFilter.includes(r.collegeType)) return false;
      if (durationFilter.length > 0 && !durationFilter.includes(r.duration)) return false;
      if (degreeFilter.length > 0 && !degreeFilter.includes(r.degree)) return false;
      if (branchTypeFilter.length > 0 && !branchTypeFilter.includes(r.branchType)) return false;
      if (stateFilter.length > 0 && !stateFilter.includes(r.state)) return false;
      return true;
    });
  }, [results, probFilter, typeFilter, durationFilter, degreeFilter, branchTypeFilter, stateFilter]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, any> = {};
    filteredResults.forEach(row => {
      if (!groups[row.institute]) {
        groups[row.institute] = {
          institute: row.institute,
          state: row.state,
          branches: []
        };
      }
      groups[row.institute].branches.push(row);
    });
    return Object.values(groups);
  }, [filteredResults]);

  const cleanProgramName = (name: string) => {
    return name
      .replace("(4 Years, Bachelor of Technology)", "")
      .replace("(5 Years, Bachelor and Master of Technology (Dual Degree))", "")
      .replace("(5 Years, Integrated Master of Technology)", "")
      .replace("(5 Years, Bachelor of Architecture)", "")
      .replace("(4 Years, Bachelor of Science)", "")
      .replace("(5 Years, Integrated Master of Science)", "")
      .trim();
  };

  const fetchTrendData = async (row: any) => {
    setSelectedRow(row);
    setTrendLoading(true);
    setTrendData([]);

    try {
      const query = new URLSearchParams({
        institute: row.institute,
        program: row.program,
        seatType: row.seatType,
        gender: row.gender
      });

      const res = await fetch(`/api/cutoffs?${query.toString()}`);
      const data = await res.json();
      
      const chartData = data.map((d: any) => ({
        year: parseInt(d.year),
        closingRank: parseInt(d.closingRank.replace(/\D/g, '')) || 0,
        openingRank: parseInt(d.openingRank.replace(/\D/g, '')) || 0
      })).sort((a: any, b: any) => a.year - b.year);

      setTrendData(chartData);
    } catch (err) {
      console.error(err);
    }
    setTrendLoading(false);
  };

  const availableStates = Array.from(new Set(results.map(r => r.state))).sort();
  const availableDegrees = Array.from(new Set(results.map(r => r.degree))).sort();

  return (
    <div className={styles.container}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        
        {/* Form Section */}
        <div className={styles.detailsBox}>
          <h2>Your Details</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>Enter your JEE rank to see where you stand.</p>
          
          <div className={styles.formGroup}>
            <label>Exam</label>
            <select value={exam} onChange={e => setExam(e.target.value)}>
              <option value="JEE Main">JEE Main (NITs, IIITs, GFTIs)</option>
              <option value="JEE Advanced">JEE Advanced (IITs)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>{exam} Category Rank</label>
            <input 
              type="number" 
              placeholder="e.g. 5400" 
              value={rank} 
              onChange={e => setRank(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Seat Type / Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select Category</option>
              {filters.seatTypes.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Gender Pool</label>
            <select value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">Select Gender</option>
              {filters.genders.map((g: string) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {exam === "JEE Main" && (
            <div className={styles.formGroup}>
              <label>Class 12th Domicile State</label>
              <select value={domicileState} onChange={e => setDomicileState(e.target.value)}>
                <option value="">Select Domicile State</option>
                {Object.keys(stateToNITMap).sort().map((state: string) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            className={styles.predictBtn} 
            onClick={handlePredict}
            disabled={!rank || !category || !gender || loading}
          >
            {loading ? "Calculating..." : (hasPredicted ? "Update Prediction" : "Predict Colleges")}
          </button>
        </div>

        {/* Filters Section (Only shows after prediction) */}
        {hasPredicted && (
          <div className={styles.filtersBox}>
            <div className={styles.filtersHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} />
                <h3 style={{ fontSize: '1.1rem' }}>Filters</h3>
              </div>
              <button className={styles.clearBtn} onClick={clearFilters}>CLEAR ALL</button>
            </div>

            {/* Probability Filter */}
            <div className={styles.filterSection}>
              <div className={styles.filterSectionHeader} onClick={() => toggleFilterSection("Probability")}>
                <h4>Probability</h4>
                {expandedFilters["Probability"] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedFilters["Probability"] && (
                <div className={styles.filterOptions}>
                  {["High", "Medium", "Low"].map(p => (
                    <label key={p} className={styles.checkboxLabel}>
                      <input type="checkbox" checked={probFilter.includes(p)} onChange={() => handleCheckbox(setProbFilter, p)} />
                      {p}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* College Type Filter */}
            <div className={styles.filterSection}>
              <div className={styles.filterSectionHeader} onClick={() => toggleFilterSection("College Type")}>
                <h4>College Type</h4>
                {expandedFilters["College Type"] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedFilters["College Type"] && (
                <div className={styles.filterOptions}>
                  {["IIT", "NIT", "IIIT", "GFTI"].filter(t => (exam === "JEE Advanced" ? t === "IIT" : t !== "IIT")).map(t => (
                    <label key={t} className={styles.checkboxLabel}>
                      <input type="checkbox" checked={typeFilter.includes(t)} onChange={() => handleCheckbox(setTypeFilter, t)} />
                      {t}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Branch Types Filter */}
            <div className={styles.filterSection}>
              <div className={styles.filterSectionHeader} onClick={() => toggleFilterSection("Branch Types")}>
                <h4>Branch Types</h4>
                {expandedFilters["Branch Types"] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedFilters["Branch Types"] && (
                <div className={styles.filterOptions}>
                  {BRANCH_TYPES.map(b => (
                    <label key={b} className={styles.checkboxLabel}>
                      <input type="checkbox" checked={branchTypeFilter.includes(b)} onChange={() => handleCheckbox(setBranchTypeFilter, b)} />
                      {b}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* College State Filter */}
            <div className={styles.filterSection}>
              <div className={styles.filterSectionHeader} onClick={() => toggleFilterSection("College State")}>
                <h4>College State</h4>
                {expandedFilters["College State"] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedFilters["College State"] && (
                <div className={styles.filterOptions}>
                  {availableStates.map(s => (
                    <label key={s} className={styles.checkboxLabel}>
                      <input type="checkbox" checked={stateFilter.includes(s)} onChange={() => handleCheckbox(setStateFilter, s)} />
                      {s}
                    </label>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </aside>

      {/* Main Content Area */}
      <main className={styles.resultsArea}>
        {!hasPredicted ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
            <GraduationCap size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h2>Ready to find your college?</h2>
            <p>Fill out the details on the left to see your personalized JOSAA predictions based on {filters.years[0]} cutoffs.</p>
          </div>
        ) : (
          <>
            <div className={styles.topStatsRow}>
              <p>Found <strong>{filteredResults.length}</strong> possible options across <strong>{groupedResults.length}</strong> colleges for you.</p>
            </div>

            {groupedResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: 'var(--surface)', borderRadius: '12px' }}>
                <h3>No matches found</h3>
                <p>Try adjusting your filters or checking a different category.</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>College</th>
                      <th>Branch</th>
                      <th style={{ textAlign: 'center' }}>Avg Package</th>
                      <th>Probability</th>
                      <th>Opening Rank</th>
                      <th>Closing Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedResults.map((group, idx) => {
                      // Calculate high prob branches for the left side
                      const highProbCount = group.branches.filter((b: any) => b.probability === "High").length;
                      return (
                        <React.Fragment key={idx}>
                          {group.branches.map((branch: any, bIdx: number) => (
                            <tr key={`${idx}-${bIdx}`}>
                              {bIdx === 0 && (
                                <td rowSpan={group.branches.length} className={styles.collegeCell}>
                                  <div className={styles.collegeInfoBlock}>
                                    <h4 className={styles.collegeName}>{group.institute}</h4>
                                    
                                    <div className={styles.collegeMetaGroup}>
                                      <div className={styles.metaItem}>
                                        <MapPin size={14} className={styles.metaIcon} />
                                        <span>{group.state}</span>
                                      </div>
                                      <div className={styles.metaItem}>
                                        <BarChart2 size={14} className={styles.metaIcon} />
                                        <span>{highProbCount} High Probability Branches</span>
                                      </div>
                                      <div className={styles.metaItem}>
                                        <Banknote size={14} className={styles.metaIcon} />
                                        <span>Highest Package: N/A</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              )}
                              <td>
                                <div className={styles.branchName}>{cleanProgramName(branch.program)}</div>
                                <div className={styles.degreeName}>{branch.degree}</div>
                                <button className={styles.trendBtn} onClick={() => fetchTrendData(branch)}>
                                  <TrendingUp size={14} /> Trend
                                </button>
                              </td>
                              <td className={styles.naText}>N/A</td>
                              <td>
                                <span className={`${styles.probBadge} ${styles[branch.probability.toLowerCase()]}`}>
                                  {branch.probability.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ fontWeight: 500 }}>{branch.openingRank}</td>
                              <td style={{ fontWeight: 500 }}>{branch.closingRank}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* Trend Chart Modal */}
      {selectedRow && (
        <div className={modalStyles.modalOverlay} onClick={() => setSelectedRow(null)}>
          <div className={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={modalStyles.modalHeader}>
              <div>
                <h2>{selectedRow.institute}</h2>
                <p>{selectedRow.program}</p>
                <div className={modalStyles.modalMeta}>
                  <span>Category: {selectedRow.seatType}</span>
                  <span>|</span>
                  <span>Gender: {selectedRow.gender}</span>
                </div>
              </div>
              <button className={modalStyles.closeBtn} onClick={() => setSelectedRow(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className={modalStyles.chartContainer}>
              {trendLoading ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Loading trend data...</div>
              ) : trendData.length === 0 ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>No historical data found.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="year" stroke="#94a3b8" />
                    <YAxis reversed stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="closingRank" name="Closing Rank" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="openingRank" name="Opening Rank" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
