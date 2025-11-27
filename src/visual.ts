"use strict";

import "./../style/visual.less";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;
import FormattingModel = powerbi.visuals.FormattingModel;

import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";

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

    // formatting pane wiring
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettingsModel: VisualFormattingSettingsModel;

    constructor(options: VisualConstructorOptions) {
        this.rootElement = options.element;

        this.formattingSettingsService = new FormattingSettingsService();
        this.formattingSettingsModel = new VisualFormattingSettingsModel();

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
        this.applyTextSettings(); // defaults
    }

    private updateDetailExpandedState(): void {
        if (this.expanded) {
            this.detailElement.classList.add("expanded");
        } else {
            this.detailElement.classList.remove("expanded");
        }
    }

    private applyTextSettings(): void {
        const text = this.formattingSettingsModel.text;

        const family = String(text.fontFamily.value?.value ?? "Segoe UI");
        const msgSize = Number(text.messageFontSize.value) || 13;
        const detSize = Number(text.detailFontSize.value) || 12;
        const togSize = Number(text.toggleFontSize.value) || 12;
        const bold = !!text.messageBold.value;

        this.alertRootElement.style.fontFamily = family;
        this.messageElement.style.fontSize = `${msgSize}px`;
        this.detailElement.style.fontSize = `${detSize}px`;
        this.toggleElement.style.fontSize = `${togSize}px`;
        this.messageElement.style.fontWeight = bold ? "600" : "400";
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

        // populate formatting model from dataview
        this.formattingSettingsModel =
            this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel,
                dataView
            );

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
            if (!Number.isNaN(sevNum)) severityValue = sevNum;
        }

        if (idxValue >= 0) triggerValue = row[idxValue];
        if (idxCompareTo >= 0) compareToValue = row[idxCompareTo];

        // Otherwise, use compare logic from formatting pane
        if (severityValue == null && triggerValue != null) {
            const trig = this.formattingSettingsModel.trigger;

            const useCompareField = !!trig.useCompareField.value;
            const hardcodedCompareValue = trig.hardcodedCompareValue.value ?? "";

            const sevOnMatch = Number(trig.severityOnMatch.value ?? "0");
            const sevOnNoMatch = Number(trig.severityOnNoMatch.value ?? "0");

            let compareTarget: any = hardcodedCompareValue;
            if (useCompareField && compareToValue != null) {
                compareTarget = compareToValue;
            }

            const isMatch = String(triggerValue) === String(compareTarget);
            severityValue = isMatch ? sevOnMatch : sevOnNoMatch;
        }

        if (severityValue == null) severityValue = 0;

        this.messageElement.textContent = messageText;
        this.detailElement.textContent = detailText;

        this.applySeverity(severityValue);
        this.updateDetailExpandedState();
    }

    // REQUIRED for the new formatting pane
    public getFormattingModel(): FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(
            this.formattingSettingsModel
        );
    }
}
