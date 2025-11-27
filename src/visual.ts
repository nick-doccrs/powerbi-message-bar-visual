"use strict";

import "./../style/visual.less";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;
import FormattingModel = powerbi.visuals.FormattingModel;

import { VisualSettingsService, VisualSettings } from "./settings";

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

    // formatting model wiring
    private settingsService: VisualSettingsService;
    private settings: VisualSettings;

    constructor(options: VisualConstructorOptions) {
        this.rootElement = options.element;

        this.settingsService = new VisualSettingsService();
        this.settings = new VisualSettings();

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
        this.toggleElement.onclick = (e) => {
            e.stopPropagation();
            this.expanded = !this.expanded;
            this.updateDetailExpandedState();
        };

        // default styling
        this.applySeverity(0);
        this.applyTextSettings(); // static defaults for now
    }

    private updateDetailExpandedState(): void {
        if (this.expanded) {
            this.detailElement.classList.add("expanded");
        } else {
            this.detailElement.classList.remove("expanded");
        }
    }

    // Static defaults for now; Text object is not yet wired into formatting model.
    private applyTextSettings(): void {
        this.alertRootElement.style.fontFamily = "Segoe UI";
        this.messageElement.style.fontSize = "13px";
        this.detailElement.style.fontSize = "12px";
        this.toggleElement.style.fontSize = "12px";
        this.messageElement.style.fontWeight = "600";
    }

    private applySeverity(sev: number): void {
        // 0=Info, 1=Success, 2=Caution, 3=Critical
        const styles = [
            { fill: "#F5F5F5", border: "#D1D1D1", icon: InfoIcon },      // Info
            { fill: "#F1FAF1", border: "#A2D8A2", icon: SuccessIcon },   // Success
            { fill: "#FFF9F5", border: "#FBCEB6", icon: WarningIcon },   // Caution
            { fill: "#FDF3F4", border: "#ECABB3", icon: ErrorIcon }      // Critical
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

        // populate formatting model from dataview (Rules card)
        if (dataView) {
            this.settings = this.settingsService.populate(dataView);
        }

        this.applyTextSettings();

        const table = dataView?.table;

        if (!table || !table.columns || !table.rows || table.rows.length === 0) {
            this.messageElement.textContent = "Message (bind a measure)";
            this.detailElement.textContent = "";
            this.applySeverity(0);
            this.expanded = false;
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

        // If severity role is bound, use it directly
        if (idxSeverity >= 0 && row[idxSeverity] != null && row[idxSeverity] !== "") {
            const sevNum = Number(row[idxSeverity]);
            if (!Number.isNaN(sevNum)) {
                severityValue = sevNum;
            }
        }

        if (idxValue >= 0) {
            triggerValue = row[idxValue];
        }
        if (idxCompareTo >= 0) {
            compareToValue = row[idxCompareTo];
        }

        //--------------------------------------
        // RULES: override severity if enabled
        //--------------------------------------
        if (severityValue == null && this.settings.rules.enabled.value === true) {

            const op = this.settings.rules.operator.value;        // "eq" | "neq" | "gt" | "lt"
            const compareSource = this.settings.rules.compareSource.value; // "field" | "fixed";

            // Determine comparison target
            let compareTarget: any = null;
            if (compareSource === "field") {
                compareTarget = compareToValue;
            } else {
                compareTarget = this.settings.rules.fixedValue.value;
            }

            const hasTrigger = triggerValue !== null && triggerValue !== undefined && triggerValue !== "";
            const hasCompare = compareTarget !== null && compareTarget !== undefined && compareTarget !== "";

            let ruleMatch = false;

            if (hasTrigger && hasCompare) {
                const valNum = Number(triggerValue);
                const cmpNum = Number(compareTarget);
                const bothNumeric = !isNaN(valNum) && !isNaN(cmpNum);

                if (bothNumeric) {
                    switch (op) {
                        case "eq":  ruleMatch = valNum === cmpNum; break;
                        case "neq": ruleMatch = valNum !== cmpNum; break;
                        case "gt":  ruleMatch = valNum >  cmpNum;  break;
                        case "lt":  ruleMatch = valNum <  cmpNum;  break;
                    }
                } else {
                    const vs = String(triggerValue ?? "");
                    const cs = String(compareTarget ?? "");
                    switch (op) {
                        case "eq":  ruleMatch = vs === cs; break;
                        case "neq": ruleMatch = vs !== cs; break;
                        case "gt":  ruleMatch = vs >  cs;  break;
                        case "lt":  ruleMatch = vs <  cs;  break;
                    }
                }
            }

            const trueState  = Number(this.settings.rules.trueState.value);
            const falseState = Number(this.settings.rules.falseState.value);

            const trueStateSafe  = [0, 1, 2, 3].includes(trueState)  ? trueState  : 1;
            const falseStateSafe = [0, 1, 2, 3].includes(falseState) ? falseState : 2;

            severityValue = ruleMatch ? trueStateSafe : falseStateSafe;
        }
        //--------------------------------------

        if (severityValue == null) {
            severityValue = 0;
        }

        this.messageElement.textContent = messageText;
        this.detailElement.textContent  = detailText;

        this.applySeverity(severityValue);
        this.updateDetailExpandedState();
    }

    // REQUIRED for the Formatting Model API
    public getFormattingModel(): FormattingModel {
        return this.settingsService.build();
    }
}
