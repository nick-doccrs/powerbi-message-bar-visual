// readme.ts
// Export README content as a markdown string for use in build tooling or docs generation.

export const README_MD = `# Message Bar for Power BI  
*A rule-based alert, notification, and data quality message bar visual for Power BI.*

---

## 🚀 Overview

**Message Bar** is a fully configurable custom visual for Power BI that displays stacked, rule-based alert messages for KPIs.  
It is designed for **operational dashboards, data quality checks, exception reporting, and SLA monitoring** where users need clear, concise, and actionable messages.

Each rule evaluates a KPI value against a target and outputs:

- Custom **TRUE** and **FALSE** messages  
- Optional detail text (expand/collapse)  
- Severity styling (Info, Success, Caution, Critical, No message)  
- Stacked alerts with dismiss behaviour  
- A “**N more**” indicator showing remaining alerts  

It behaves like a polished, Fluent-style UI component rather than a typical chart visual.

---

## ✨ Features

- Up to **8 independent rules**
- TRUE and FALSE messages per rule
- Severity levels: Info / Success / Caution / Critical / No message
- Works with **Field Parameters**, measures, fixed thresholds
- Automatic stacking and cycling through multiple alerts
- “N more” counter to show remaining messages
- Inline **Details** toggle with expandable popover panel
- Automatically hides when no rules fire
- Case-insensitive scenario matching
- Clean Fluent-style UI + SVG severity icons
- Configurable typography (font, size, weight)

---

## 📦 Installation

1. Download the \`.pbiviz\` file from the **dist** folder.
2. In Power BI Desktop:
   - **Visualizations → … → Import a visual from a file**
   - Select the \`.pbiviz\`

The **Message Bar** icon will appear in the visual pane.

---

# 🔹 Simple Setup (Recommended) — Using Field Parameters

This is the easiest and most flexible way to drive the Message Bar.

### 1. Create a Field Parameter for your KPI measures

Include the measures you want to monitor (e.g., Fulfilment Rate, Stocks, Freshness, Returns).

Power BI automatically creates a **hidden table** containing:

- **Order** — the position of each KPI in the parameter  
- **Value** — the currently selected KPI value  

> Since these columns are hidden, right-click your table in the **Data** pane → **Show hidden** to reveal them.

---

### 2. Bind the visual to the Field Parameter

In the Message Bar visual:

- **Scenario** → bind to the **Order** column  
- **Value** → bind to the Field Parameter’s **Value** column  

This gives the visual everything it needs:

- Scenario key  
- KPI output  

---

### 3. Optional: add target values via a second Field Parameter

If you want dynamic CompareTo values:

1. Create another Field Parameter containing your **target** or **threshold** measures.
2. Create a relationship between both parameter tables on **Order**.
3. Bind **Compare to** → the second parameter’s **Value** column.

---

### 4. Configure your rules

Format pane → **Rule 1–Rule 8**:

Set:

- **Scenario** → the Order value (e.g., \`0\`, \`1\`, \`2\`, \`3\`)
- **Operator** → \`<\`, \`>\`, \`=\`, \`≠\`
- **Compare source** → Field or Fixed value
- **Message (TRUE)**
- **Detail (TRUE)**
- **Severity when TRUE**
- **Message (FALSE)**
- **Detail (FALSE)**
- **Severity when FALSE** (use “No message” for silent outcomes)

The Message Bar evaluates all rules and displays any matching alerts.

---

## 🧠 How It Works

Each rule references one scenario (by Order number) and evaluates:

\`\`\`
VALUE (KPI output)
        vs
TARGET (from CompareTo field OR fixed value)
\`\`\`

Then displays:

| Condition | Visual output |
|----------|----------------|
| **TRUE** | TRUE message, TRUE detail, TRUE severity |
| **FALSE** | FALSE message, FALSE detail, FALSE severity (or hidden if set to “No message”) |

Multiple triggered rules are stacked:

- First message appears  
- A **Dismiss** button cycles through the queue  
- “**N more**” shows remaining alerts  
- When all alerts are dismissed, the bar disappears  

---

## 📚 Example Rule

**Scenario:** \`0\`  
**Operator:** \`<\`  
**Compare Source:** Field  
**TRUE Message:** “Fulfilment rate is below target”  
**TRUE Severity:** Critical  
**FALSE Message:** “Fulfilment is on target”  
**FALSE Severity:** Success  

---

## 📁 Project Structure

\`\`\`
src/
  visual.ts          // Core rendering, rule evaluation, UI updates
  settings.ts        // Format pane model (rules, messages, severity)
  assets/            // Icons and visual icon
  style/visual.less  // Fluent UI styling

capabilities.json    // Roles & format pane structure
pbiviz.json          // Visual manifest and metadata
dist/                // Packaged .pbiviz output
\`\`\`

---

## 🛠 Development & Packaging

### Install tools

\`\`\`bash
npm install -g powerbi-visuals-tools
\`\`\`

### Run locally

\`\`\`bash
pbiviz start
\`\`\`

### Create distributable package (\`.pbiviz\`)

\`\`\`bash
pbiviz package
\`\`\`

The package appears under \`/dist\`.

---

## 🎨 Design

The visual uses:

- Fluent-inspired background/foreground severities  
- SVG icons  
- Subtle detail popover transitions  
- Rounded corners & streamlined spacing  
- Clean typography with optional bolding  

---

## 📝 License

MIT License (or your chosen license).

---

## 🙌 Acknowledgements

Developed as part of the **Doccrs Analytics** Power BI toolkit ecosystem.  
Designed for real-world operations dashboards where clarity and insight matter just as much as data accuracy.
`;
