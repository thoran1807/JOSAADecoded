# JOSAADecoded

A full-stack, mobile-first web application designed to help JEE Mains and Advanced aspirants navigate the JOSAA counselling process with ease. Built with a focus on data density, modern aesthetics, and performance.

## 🚀 Features Completed

### 1. Core Infrastructure
- **Premium Dark Mode UI**: A fully responsive, modern dark aesthetic utilizing CSS modules and fluid layouts.
- **Data Integration**: Robust multi-year JOSAA cutoff dataset parsing (2019-2025) via a custom Next.js backend API built over PapaParse.

### 2. Cutoff Explorer (`/cutoffs`)
- **Advanced Cascading Filters**: Filter by Institute Type, Specific Institute, Core Branch, Category, and Gender.
- **Smart Data Table**: Paginating data table with intelligent sorting logic (e.g., IITs prioritized; Category-aware numerical sorting: OPEN > EWS > OBC > SC > ST).
- **Clean Representation**: Verbose branch names stripped and cleaned for UI readability.
- **Historical Trends**: Interactive line charts visualizing historical opening and closing rank trends.
- **Data Portability**: Export filtered results to CSV.

### 3. College Predictor (`/predictor`)
- **Intelligent Quota Engine**: Maps Class 12th Domicile State to respective NITs to calculate Home State (HS) and Other State (OS) quotas accurately.
- **Mathongo-Style Grouped Table**: Highly dense UI grouping eligible branches under their respective colleges. 
- **Advanced Dynamic Filters**: Post-prediction sidebar checkboxes to filter by Probability, College Type, Course Duration, and Branch Type (all evaluating instantly).
- **Embedded Trends**: Direct access to historical trend charts right from the predictor rows.

## 🛠 Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Vanilla CSS Modules (No Tailwind)
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Data Processing**: PapaParse

## 🔜 Next Steps
- Implement `/compare` feature for side-by-side college evaluation.
- Implement `/guides` and `/faq` modules.
- Connect a real database to populate placement statistics ("Est. Avg Package") to enable sorting by salary.
