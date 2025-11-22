"use strict";

import "./../style/visual.less";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;

import ErrorIcon from "./assets/Error.svg";
import InfoIcon from "./assets/Info.svg";
import SuccessIcon from "./assets/Success.svg";
import WarningIcon from "./assets/Warning.svg";

export class Visual implements IVisual {

    private rootElement: HTMLElement;

    private alertRootElement: HTMLElement;
    private headerElement: HTMLElement;
    private iconElement: HTMLImageElement;
    private messageElement: HTMLElement;
    private toggleElement: HTMLElement;
    private detailElement: HTMLElement;

    private expanded: boolean = false;

    constructor(options: VisualConstructorOptions) {
        this.rootElement = options.element;

        // ----- Build DOM -----
        const container = document.createElement("div");
        container.className = "visual";

        const alertRoot = document.createElement("div");
        alertRoot.className = "alert-root";

        const header = document.createElement("div");
        header.className = "alert-header";

        const icon = document.createElement("img");
        icon.className = "alert-icon-img";
        icon.alt = "status icon";

        const message = document.createElement("div");
        message.className = "alert-message";
        message.textContent = "Message (bind a measure)";

        const toggle = document.createElement("div");
        toggle.className = "alert-toggle";
        toggle.textContent = "Details";

        header.appendChild(icon);
        header.appendChild(message);
        header.appendChild(toggle);

        const detail = document.createElement("div");
        detail.className = "alert-detail";
        detail.textContent = "";

        alertRoot.appendChild(header);
        alertRoot.appendChild(detail);
        container.appendChild(alertRoot);
        this.rootElement.appendChild(container);

        // ----- Store refs -----
        this.alertRootElement = alertRoot;
        this.headerElement = header;
        this.iconElement = icon;
        this.messageElement = message;
        this.toggleElement = toggle;
        this.detailElement = detail;

        // ----- Interaction -----
        // Toggle only on Details click
        this.toggleElement.onclick = (e) => {
            e.stopPropagation();
            this.expanded = !this.expanded;
            this.updateDetailExpandedState();
        };

        // Close popover when clicking elsewhere inside the visual
        this.rootElement.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;

            if (
                this.expanded &&
                !this.detailElement.contains(target) &&
                !this.toggleElement.contains(target)
            ) {
                this.expanded = false;
                this.updateDetailExpandedState();
            }
        });

        this.applySeverity(0);
        this.updateDetailExpandedState();
    }

    private updateDetailExpandedState(): void {
        if (this.expanded) {
            this.detailElement.classList.add("expanded");
            this.toggleElement.textContent = "Hide details";
        } else {
            this.detailElement.classList.remove("expanded");
            this.toggleElement.textContent = "Details";
        }
    }

    private getTriggerSettings(dataView: DataView | undefined) {
        const objects = dataView?.metadata?.objects;
        const triggerObj: any = (objects as any)?.trigger ?? {};

        return {
            useCompareField: triggerObj.useCompareField ?? false,
            hardcodedCompareValue: triggerObj.hardcodedCompareValue ?? "",
            severityOnMatch: Number(triggerObj.severityOnMatch ?? 0),
            severityOnNoMatch: Number(triggerObj.severityOnNoMatch ?? 0)
        };
    }

    private applySeverity(sev: number): void {
        const styles = [
            { fill: "#F5F5F5", border: "#D1D1D1", icon: InfoIcon },     // Info
            { fill: "#F1FAF1", border: "#A2D8A2", icon: SuccessIcon },  // Success
            { fill: "#FFF9F5", border: "#FBCEB6", icon: WarningIcon },  // Caution
            { fill: "#FDF3F4", border: "#ECABB3", icon: ErrorIcon }     // Critical
        ];

        const idx = Math.max(0, Math.min(3, sev));
        const s = styles[idx];

        this.alertRootElement.style.backgroundColor = s.fill;
        this.alertRootElement.style.border = `1px solid ${s.border}`;
        this.alertRootElement.style.borderRadius = "4px";
        this.alertRootElement.style.color = "#111111";
        this.iconElement.src = s.icon;
    }

    public update(options: VisualUpdateOptions): void {
        const dataView = options.dataViews && options.dataViews[0];
        const table = dataView?.table;

        if (!table || !table.columns || !table.rows || table.rows.length === 0) {
            this.messageElement.textContent = "Message (bind a measure)";
            this.detailElement.textContent = "";
            this.toggleElement.style.display = "none";
            this.expanded = false;
            this.applySeverity(0);
            this.updateDetailExpandedState();
            return;
        }

        const row = table.rows[0];

        const getIndexByRole = (roleName: string): number => {
            for (let i = 0; i < table.columns.length; i++) {
                const roles = (table.columns[i] as any).roles;
                if (roles && roles[roleName]) return i;
            }
            return -1;
        };

        const idxMessage   = getIndexByRole("message");
        const idxDetail    = getIndexByRole("detail");
        const idxSeverity  = getIndexByRole("severity");
        const idxValue     = getIndexByRole("value");
        const idxCompareTo = getIndexByRole("compareTo");

        let messageText = "Message (bind a measure)";
        let detailText = "";
        let severityValue: number | null = null;

        let triggerValue: any = null;
        let compareToValue: any = null;

        if (idxMessage >= 0 && row[idxMessage] != null) {
            messageText = String(row[idxMessage]);
        }
        if (idxDetail >= 0 && row[idxDetail] != null) {
            detailText = String(row[idxDetail]);
        }

        // Hide toggle if no detail text
        if (!detailText || detailText.trim() === "") {
            this.toggleElement.style.display = "none";
            this.expanded = false;
        } else {
            this.toggleElement.style.display = "flex";
        }

        if (idxSeverity >= 0 && row[idxSeverity] != null && row[idxSeverity] !== "") {
            const sevNum = Number(row[idxSeverity]);
            if (!Number.isNaN(sevNum)) severityValue = sevNum;
        }

        if (idxValue >= 0) triggerValue = row[idxValue];
        if (idxCompareTo >= 0) compareToValue = row[idxCompareTo];

        if (severityValue == null && triggerValue != null) {
            const settings = this.getTriggerSettings(dataView);

            let compareTarget: any = settings.hardcodedCompareValue;
            if (settings.useCompareField && compareToValue != null) {
                compareTarget = compareToValue;
            }

            const isMatch = String(triggerValue) === String(compareTarget);
            severityValue = isMatch ? settings.severityOnMatch : settings.severityOnNoMatch;
        }

        if (severityValue == null) severityValue = 0;

        this.messageElement.textContent = messageText;
        this.detailElement.textContent = detailText;

        this.applySeverity(severityValue);
        this.updateDetailExpandedState();
    }
}
