# Power BI Message Bar Visual
Custom Power BI visual that renders message bars (info, warning, error, success) using native HTML/CSS inside the visual sandbox.

## Getting Started
Follow these steps to set up the project locally and start developing.

### 1. Clone the repository

    git clone https://github.com/nick-doccrs/powerbi-message-bar-visual.git
    cd powerbi-message-bar-visual

### 2. Install required tools

You will need:

- Node.js LTS (18.x or 20.x)
- Power BI Visuals Tools (pbiviz)

Install pbiviz globally:

    npm install -g powerbi-visuals-tools

### 3. Install dependencies

    npm install

### 4. Run the visual locally

    pbiviz start

This starts a local development server and generates a dev `.pbiviz` file inside `/dist`.

---

## Using the Dev Visual in Power BI

1. Open **Power BI Desktop**.
2. Switch to the **viz-dev** workspace.
3. Open the **Message Bar Dev** report.
4. The development visual is already placed on the page.
5. With `pbiviz start` running, the visual hot-reloads as you edit the code.

No manual import is required. The dev report is already configured for development.

