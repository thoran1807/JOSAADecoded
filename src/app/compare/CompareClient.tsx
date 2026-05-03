"use client";

import React, { useState, useEffect } from "react";
import styles from "./compare.module.css";
import { Plus, X, MapPin } from "lucide-react";

export default function CompareClient({ filters, metadata }: { filters: any, metadata: Record<string, any> }) {
  // Global Settings
  const [year, setYear] = useState(filters.years[0].toString());
  const [category, setCategory] = useState("OPEN");
  const [gender, setGender] = useState("Gender-Neutral");
  const [domicileState, setDomicileState] = useState("");

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

  // Selection State (Up to 4)
  const [selections, setSelections] = useState<any[]>([null, null, null, null]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetColIndex, setTargetColIndex] = useState<number>(0);
  
  // Modal Form State
  const [modalType, setModalType] = useState("IIT");
  const [modalInstitute, setModalInstitute] = useState("");
  const [modalProgram, setModalProgram] = useState("");
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Derived Institutes based on Type
  const filteredInstitutes = filters.institutes.filter((inst: string) => {
    // Normalize whitespace to fix JOSAA dataset typos (e.g. "Indian Institute  of Technology")
    const normalizedInst = inst.replace(/\s+/g, ' ');
    if (modalType === "IIT") return normalizedInst.includes("Indian Institute of Technology");
    if (modalType === "NIT") return normalizedInst.includes("National Institute of Technology");
    if (modalType === "IIIT") return normalizedInst.includes("Indian Institute of Information Technology");
    return !normalizedInst.includes("Indian Institute of Technology") && !normalizedInst.includes("National Institute of Technology") && !normalizedInst.includes("Indian Institute of Information Technology");
  });

  // Fetch branches when institute changes
  useEffect(() => {
    if (!modalInstitute) {
      setAvailableBranches([]);
      setModalProgram("");
      return;
    }

    const fetchBranches = async () => {
      setIsLoadingBranches(true);
      try {
        const query = new URLSearchParams({
          institute: modalInstitute,
          year: year 
        });
        const res = await fetch(`/api/cutoffs?${query.toString()}`);
        const data = await res.json();
        const uniquePrograms = Array.from(new Set(data.map((d: any) => d.program))).sort() as string[];
        setAvailableBranches(uniquePrograms);
        setModalProgram(""); 
      } catch (err) {
        console.error(err);
      }
      setIsLoadingBranches(false);
    };

    fetchBranches();
  }, [modalInstitute, year]);

  const openModal = (index: number) => {
    setTargetColIndex(index);
    setModalType("IIT");
    setModalInstitute("");
    setModalProgram("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddCollege = async () => {
    if (!modalInstitute || !modalProgram) return;

    try {
      const query = new URLSearchParams({
        institute: modalInstitute,
        program: modalProgram,
        year: year,
        seatType: category,
        gender: gender
      });

      const res = await fetch(`/api/cutoffs?${query.toString()}`);
      const data = await res.json();

      let cutoffData = null;
      if (data.length > 0) {
        let isHomeStateNIT = false;
        if (domicileState && stateToNITMap[domicileState]) {
          isHomeStateNIT = stateToNITMap[domicileState].some((n: string) => 
            modalInstitute.toLowerCase().includes(n.toLowerCase().replace(" national", ""))
          );
        }
        
        // IITs use AI. NITs use HS/OS based on domicile state.
        const targetQuota = modalInstitute.toLowerCase().includes("indian institute  of technology") ? "AI" : (isHomeStateNIT ? "HS" : "OS");
        cutoffData = data.find((r: any) => r.quota === targetQuota) || data[0];
      }

      const newSelection = {
        institute: modalInstitute,
        program: modalProgram,
        cutoff: cutoffData
      };

      const newSelections = [...selections];
      newSelections[targetColIndex] = newSelection;
      setSelections(newSelections);
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const removeSelection = (index: number) => {
    const newSelections = [...selections];
    newSelections[index] = null;
    setSelections(newSelections);
  };

  // Re-fetch data if Global Settings change
  useEffect(() => {
    const updateSelections = async () => {
      const updatedSelections = [...selections];
      let changed = false;

      for (let i = 0; i < updatedSelections.length; i++) {
        const sel = updatedSelections[i];
        if (sel) {
          try {
            const query = newSearchParams({
              institute: sel.institute,
              program: sel.program,
              year: year,
              seatType: category,
              gender: gender
            });
            const res = await fetch(`/api/cutoffs?${query.toString()}`);
            const data = await res.json();

            let cutoffData = null;
            if (data.length > 0) {
              let isHomeStateNIT = false;
              if (domicileState && stateToNITMap[domicileState]) {
                isHomeStateNIT = stateToNITMap[domicileState].some((n: string) => 
                  sel.institute.toLowerCase().includes(n.toLowerCase().replace(" national", ""))
                );
              }
              const targetQuota = sel.institute.toLowerCase().includes("indian institute  of technology") ? "AI" : (isHomeStateNIT ? "HS" : "OS");
              cutoffData = data.find((r: any) => r.quota === targetQuota) || data[0];
            }
            
            if (!sel.cutoff || !cutoffData || sel.cutoff.closingRank !== cutoffData.closingRank || sel.cutoff.quota !== cutoffData.quota) {
                updatedSelections[i] = { ...sel, cutoff: cutoffData };
                changed = true;
            }
          } catch (err) {
            console.error(err);
          }
        }
      }

      if (changed) setSelections(updatedSelections);
    };

    updateSelections();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, category, gender, domicileState]); 

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(" ").map(n => n[0]).join("").substring(0, 3).toUpperCase();
  };

  const cleanProgramName = (name: string) => {
    if (!name) return "";
    return name
      .replace("(4 Years, Bachelor of Technology)", "")
      .replace("(5 Years, Bachelor and Master of Technology (Dual Degree))", "")
      .replace("(5 Years, Integrated Master of Technology)", "")
      .replace("(5 Years, Bachelor of Architecture)", "")
      .replace("(4 Years, Bachelor of Science)", "")
      .replace("(5 Years, Integrated Master of Science)", "")
      .trim();
  };

  const newSearchParams = (params: any) => new URLSearchParams(params);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Compare Colleges</h1>
        <p>Compare Institutes on the basis of Cutoffs, Fees, Placements, and other details.</p>
      </div>

      <div className={styles.settingsBar}>
        <div className={styles.settingGroup}>
          <label>Admission Year</label>
          <select value={year} onChange={e => setYear(e.target.value)}>
            {filters.years.map((y: string) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className={styles.settingGroup}>
          <label>Your Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {filters.seatTypes.map((s: string) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className={styles.settingGroup}>
          <label>Gender Pool</label>
          <select value={gender} onChange={e => setGender(e.target.value)}>
            {filters.genders.map((g: string) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className={styles.settingGroup}>
          <label>Class 12th Domicile State</label>
          <select value={domicileState} onChange={e => setDomicileState(e.target.value)}>
            <option value="">Select Domicile State</option>
            {Object.keys(stateToNITMap).sort().map((state: string) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.compareGrid}>
        {selections.map((sel, idx) => (
          sel === null ? (
            <div key={idx} className={styles.emptyColumn} onClick={() => openModal(idx)}>
              <button className={styles.addBtn}>
                <Plus size={36} strokeWidth={1.5} />
                <span>Add College</span>
              </button>
            </div>
          ) : (
            <div key={idx} className={styles.compareColumn}>
              <div className={styles.cardHeader}>
                <button className={styles.removeBtn} onClick={() => removeSelection(idx)}>
                  <X size={16} />
                </button>
                <div className={styles.collegeInitials}>
                  {getInitials(sel.institute)}
                </div>
                <div>
                  <h3 className={styles.collegeName}>{sel.institute}</h3>
                  <div className={styles.metaInfo}>
                    <MapPin size={12} /> India
                  </div>
                </div>
                <div className={styles.branchName}>
                  {cleanProgramName(sel.program)}
                </div>
              </div>

              {(() => {
                const normalizedKey = sel.institute.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const collegeMeta = metadata[normalizedKey] || {};

                return (
                  <>
                    {/* Institute Information */}
                    <div className={styles.sectionHeader}>Institute Information</div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Established Year</span>
                      <span className={collegeMeta['Established'] ? styles.dataValue : `${styles.dataValue} ${styles.na}`}>
                        {collegeMeta['Established'] || "N/A"}
                      </span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Ownership</span>
                      <span className={collegeMeta['Ownership'] ? styles.dataValue : `${styles.dataValue} ${styles.na}`}>
                        {collegeMeta['Ownership'] || "N/A"}
                      </span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Campus Size</span>
                      <span className={collegeMeta['Campus Size'] ? styles.dataValue : `${styles.dataValue} ${styles.na}`}>
                        {collegeMeta['Campus Size'] || "N/A"}
                      </span>
                    </div>

                    {/* Rankings & Placements */}
                    <div className={styles.sectionHeader}>Rankings & Placements</div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>NIRF Ranking</span>
                      <span className={collegeMeta['NIRF Rank'] ? styles.dataValue : `${styles.dataValue} ${styles.na}`}>
                        {collegeMeta['NIRF Rank'] || "N/A"}
                      </span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Avg Package</span>
                      <span className={collegeMeta['Avg Package'] ? styles.dataValue : `${styles.dataValue} ${styles.na}`}>
                        {collegeMeta['Avg Package'] || "N/A"}
                      </span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Placement %</span>
                      <span className={collegeMeta['Placement %'] ? styles.dataValue : `${styles.dataValue} ${styles.na}`}>
                        {collegeMeta['Placement %'] || "N/A"}
                      </span>
                    </div>

                    {/* Financials */}
                    <div className={styles.sectionHeader}>Financials</div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Total Fees</span>
                      <span className={collegeMeta['Total Fees'] ? styles.dataValue : `${styles.dataValue} ${styles.na}`}>
                        {collegeMeta['Total Fees'] || "N/A"}
                      </span>
                    </div>
                  </>
                );
              })()}

              {/* Cutoffs */}
              <div className={styles.sectionHeader}>Cutoff ({year})</div>
              {sel.cutoff ? (
                <>
                  <div className={styles.dataRow}>
                    <span className={styles.dataLabel}>Opening Rank</span>
                    <span className={styles.dataValue}>{sel.cutoff.openingRank}</span>
                  </div>
                  <div className={styles.dataRow}>
                    <span className={styles.dataLabel}>Closing Rank</span>
                    <span className={`${styles.dataValue} ${styles.highlight}`}>{sel.cutoff.closingRank}</span>
                  </div>
                  <div className={styles.dataRow}>
                    <span className={styles.dataLabel}>Quota</span>
                    <span className={styles.dataValue}>{sel.cutoff.quota}</span>
                  </div>
                </>
              ) : (
                <div className={styles.dataRow} style={{ justifyContent: 'center' }}>
                  <span className={`${styles.dataValue} ${styles.na}`}>No data for this category/gender.</span>
                </div>
              )}
            </div>
          )
        ))}
      </div>

      <div className={styles.disclaimerBox}>
        <p><strong>Disclaimer:</strong> The cutoff data is perfectly matched with official JOSAA records. However, other metrics like <strong>Placement Stats (mostly 2024), Rankings, and Fees</strong> have been gathered from public sources and AI scraping. These values might have minor errors and should be used for reference purposes only.</p>
      </div>

      {/* Selection Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add College to Compare</h2>
              <button className={styles.closeBtn} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Institute Type</label>
                <div className={styles.selectWrapper}>
                  <select className={styles.customSelect} value={modalType} onChange={e => {
                    setModalType(e.target.value);
                    setModalInstitute("");
                    setModalProgram("");
                  }}>
                    <option value="IIT">IIT - Indian Institute of Technology</option>
                    <option value="NIT">NIT - National Institute of Technology</option>
                    <option value="IIIT">IIIT - Indian Institute of Information Technology</option>
                    <option value="GFTI">GFTI - Govt. Funded Technical Institutes</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Select Institute</label>
                <div className={styles.selectWrapper}>
                  <select className={styles.customSelect} value={modalInstitute} onChange={e => setModalInstitute(e.target.value)}>
                    <option value="">-- Choose Institute --</option>
                    {filteredInstitutes.map((inst: string) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Select Branch</label>
                <div className={styles.selectWrapper}>
                  <select 
                    className={styles.customSelect}
                    value={modalProgram} 
                    onChange={e => setModalProgram(e.target.value)}
                    disabled={!modalInstitute || isLoadingBranches}
                  >
                    <option value="">{isLoadingBranches ? "Loading branches..." : "-- Choose Branch --"}</option>
                    {availableBranches.map((prog: string) => (
                      <option key={prog} value={prog}>{cleanProgramName(prog)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                className={styles.submitBtn} 
                onClick={handleAddCollege}
                disabled={!modalInstitute || !modalProgram}
              >
                Add to Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
