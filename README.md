# Message Bar for Power BI  
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
- A **“N more”** label showing remaining alerts  

It behaves like a polished, Fluent-style UI component rather than a typical chart visual.

---

## ✨ Features

- Up to **8 independent rules**
- TRUE and FALSE outcomes per rule  
- Severity levels: *Info*, *Success*, *Caution*, *Critical*, *No message*  
- Works with **Field Parameters**, measures, and fixed thresholds  
- Automatic stacking & cycling of alerts  
- Inline **Details** toggle to expand a popover  
- Visual disappears when no rules fire  
- Case-insensitive scenario matching  
- Fluent-style icons, colours, and spacing  
- Configurable typography (fonts, size, bold)

---

# 🔹 Simple Setup (Recommended) — Using Field Parameters

This is the easiest and most flexible way to power the Message Bar visual.

---

## **1. Create a Field Parameter for your KPI measures**

Include the measures you want to monitor (e.g. Fulfilment Rate, Stock Level, Data Freshness).

Power BI automatically creates a **hidden table** containing:

- **Order** — the position of each KPI  
- **Value** — the output of the selected KPI measure  

> To reveal hidden tables:  
> Right-click the **Data pane → Show hidden**.

---

## **2. Bind the visual to the Field Parameter**

In the Message Bar visual:

- **Scenario** → bind to the Field Parameter’s **Order** column  
- **Value** → bind to the Field Parameter’s **Value** column  

This gives the visual a stable scenario key and the actual KPI value.

---

## **3. (Optional) Add CompareTo values with a second Field Parameter**

If you want dynamic targets/thresholds:

1. Create another Field Parameter containing target measures.  
2. Create a relationship between both Field Parameter tables using the **Order** column.  
3. Bind **Compare to** → the second parameter’s **Value** column.

---

## **4. Configure your rules in the Format pane**

Each rule supports:

- Scenario (use Order value: 0, 1, 2…)  
- Operator (`<`, `>`, `=`, `≠`)  
- Compare source (Field or Fixed)  
- Message (TRUE)  
- Detail (TRUE)  
- Severity when TRUE  
- Message (FALSE)  
- Detail (FALSE)  
- Severity when FALSE (can be “No message”)

The visual evaluates all rules and displays any messages that match.

---

# 🧠 How It Works

1. The visual finds the row matching the **Scenario** value.  
2. Loads:  
   - `Value` (actual KPI)  
   - `CompareTo` (from field or fixed value)  
3. Evaluates the condition:  
   ```
   VALUE vs TARGET
   ```
4. Displays either the TRUE or FALSE message.

If multiple rules fire, they stack and show one at a time:

- First alert shows  
- **Dismiss** cycles to the next  
- “**N more**” shows remaining alerts  
- Hides when done  

---

# 📚 Example Rule

| Setting | Value |
|--------|--------|
| Scenario | `0` |
| Operator | `<` |
| Compare Source | Field |
| Message (TRUE) | Fulfilment rate is below target |
| Severity (TRUE) | Critical |
| Message (FALSE) | Fulfilment is on target |
| Severity (FALSE) | Success |

---

# 📦 Installation (Import into Power BI)

1. Download the `.pbiviz` file from the `/dist` folder.  
2. In Power BI Desktop:  
   - **Visualizations → … → Import a visual from a file**  
   - Select the `.pbiviz`  
3. The **Message Bar** icon will appear in the pane.

---

# 🛠 Development & Packaging

### Install tools
```bash
npm install -g powerbi-visuals-tools
```

### Run locally
```bash
pbiviz start
```

### Package the visual
```bash
pbiviz package
```

The generated `.pbiviz` file will appear in:

```
/dist
```

---

# 📁 Project Structure

```
src/
  visual.ts          // Rendering, rule evaluation, message queue
  settings.ts        // Format pane model (rules, messages, severity)
  style/visual.less  // Fluent UI styling
  assets/            // Icons for severities + dismiss

capabilities.json    // Data roles & formatting objects
pbiviz.json          // Visual manifest (guid, icon, metadata)
dist/                // Packaged .pbiviz output
```

---

# 🎨 Design Elements

- Fluent UI severity colours  
- Severity-specific SVG icons  
- Smooth expand/collapse animation for details  
- Compact, product-style information bar layout  
- Modern spacing and hierarchy  

---

# 📝 License

Copyright © 2025 Doccrs Analytics.

Permission is granted to download and use the packaged visual (.pbiviz) 
for personal or commercial Power BI reports.

The source code is provided for learning purposes only.
You may not copy, modify, redistribute, republish, or create derivative works
based on the source code in this repository.

Attribution must not be removed. You may not claim authorship.
All rights reserved.

---

# 🙌 Acknowledgements

Created as part of the **Doccrs Analytics** Power BI UX component library.  
Built for dashboards where clarity, design quality, and actionability matter.
