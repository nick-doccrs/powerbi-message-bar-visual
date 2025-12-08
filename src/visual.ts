"use strict";

import "../style/visual.less";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;
import FormattingModel = powerbi.visuals.FormattingModel;

import { VisualSettingsService, VisualSettings, RuleCard } from "./settings";

import ErrorIcon from "./assets/Error.svg";
import InfoIcon from "./assets/Info.svg";
import SuccessIcon from "./assets/Success.svg";
import WarningIcon from "./assets/Warning.svg";
import DismissIcon from "./assets/Dismiss.svg";

interface QueuedMessage {
    message: string;
    detail: string;
    severity: number; // 0..3
}

export class Visual implements IVisual {
    private rootElement: HTMLElement;

    private alertRootElement: HTMLElement;
    private headerElement: HTMLElement;
    private iconElement: HTMLImageElement;

    private messageContainerElement: HTMLElement;   // wrapper div
    private messageTextElement: HTMLElement;        // span with main message text
    private toggleElement: HTMLElement;             // span "Details" link

    private remainingElement: HTMLElement;          // "N more" label
    private detailElement: HTMLElement;
    private dismissElement: HTMLImageElement;

    private expanded: boolean = false;

    private messages: QueuedMessage[] = [];
    private currentMessageIndex: number = 0;

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

        // Message + inline Details link
        const messageContainer = document.createElement("div");
        messageContainer.className = "alert-message";

        const messageText = document.createElement("span");
        messageText.className = "alert-message-text";
        messageText.textContent = "Message (bind a table)";

        const toggle = document.createElement("span");
        toggle.className = "alert-toggle";
        toggle.textContent = ""; // will be "Details" when we have detail text

        messageContainer.appendChild(messageText);
        messageContainer.appendChild(toggle);

        // Remaining-label: "N more"
        const remaining = document.createElement("div");
        remaining.className = "alert-remaining";
        remaining.textContent = "";
        
        const dismiss = document.createElement("img");
        dismiss.className = "alert-dismiss";
        dismiss.src = DismissIcon;
        dismiss.alt = "Dismiss";

        header.appendChild(icon);
        header.appendChild(messageContainer);
        header.appendChild(remaining);
        header.appendChild(dismiss);

        const detail = document.createElement("div");
        detail.className = "alert-detail";
        detail.textContent = "";

        alertRoot.appendChild(header);
        alertRoot.appendChild(detail);
        container.appendChild(alertRoot);
        this.rootElement.appendChild(container);

        this.alertRootElement = alertRoot;
        this.headerElement = header;
        this.iconElement = icon;
        this.messageContainerElement = messageContainer;
        this.messageTextElement = messageText;
        this.toggleElement = toggle;
        this.remainingElement = remaining;
        this.detailElement = detail;
        this.dismissElement = dismiss;

        // Click: toggle details expand/collapse
        this.toggleElement.onclick = (e) => {
            e.stopPropagation();
            if (!this.detailElement.textContent) {
                return;
            }
            this.expanded = !this.expanded;
            this.updateDetailExpandedState();
        };

        // Click: dismiss current message and show next
        this.dismissElement.onclick = (e) => {
            e.stopPropagation();
            this.showNextMessage();
        };

        this.applySeverity(0);
        this.applyTextSettings();
        this.clearVisual();
    }

    private updateDetailExpandedState(): void {
        if (this.expanded && this.detailElement.textContent) {
            this.detailElement.classList.add("expanded");
            this.toggleElement.textContent = "Hide details";
        } else {
            this.detailElement.classList.remove("expanded");
            this.toggleElement.textContent = this.detailElement.textContent ? "Details" : "";
        }
    }

    private applyTextSettings(): void {
        this.alertRootElement.style.fontFamily = "Segoe UI";
        this.messageContainerElement.style.fontSize = "13px";
        this.detailElement.style.fontSize = "12px";
        this.toggleElement.style.fontSize = "12px";
        this.messageTextElement.style.fontWeight = "600";
    }

    private applySeverity(sev: number): void {
        const styles = [
            { fill: "#F5F5F5", border: "#D1D1D1", icon: InfoIcon },    // 0 Info
            { fill: "#F1FAF1", border: "#A2D8A2", icon: SuccessIcon }, // 1 Success
            { fill: "#FFF9F5", border: "#FBCEB6", icon: WarningIcon }, // 2 Caution
            { fill: "#FDF3F4", border: "#ECABB3", icon: ErrorIcon }    // 3 Critical
        ];

        const idx = Math.max(0, Math.min(3, sev));
        const s = styles[idx];

        this.alertRootElement.style.backgroundColor = s.fill;
        this.alertRootElement.style.border = `1px solid ${s.border}`;
        this.alertRootElement.style.borderRadius = "4px";
        this.alertRootElement.style.color = "#111111";

        this.iconElement.src = s.icon;
        this.alertRootElement.style.visibility = "visible";
    }

    private evaluateRule(rule: RuleCard, triggerValue: any, compareToValue: any): number | null {
        if (!rule || rule.enabled.value !== true) {
            return null;
        }

        const op = rule.operator.value as string;
        const compareSource = rule.compareSource.value as string;

        let compareTarget: any = null;
        if (compareSource === "field") {
            compareTarget = compareToValue;
        } else {
            compareTarget = rule.fixedValue.value;
        }

        const hasTrigger =
            triggerValue !== null &&
            triggerValue !== undefined &&
            triggerValue !== "";

        const hasCompare =
            compareTarget !== null &&
            compareTarget !== undefined &&
            compareTarget !== "";

        if (!hasTrigger || !hasCompare) {
            return null;
        }

        let ruleMatch = false;

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

        if (!ruleMatch) {
            return null;
        }

        const trueState = Number(rule.trueState.value);
        const trueStateSafe = [0, 1, 2, 3].includes(trueState) ? trueState : 1;

        return trueStateSafe;
    }

    private clearVisual(): void {
        this.messageTextElement.textContent = "";
        this.detailElement.textContent = "";
        this.toggleElement.textContent = "";
        this.remainingElement.textContent = "";
        this.remainingElement.style.display = "none";
        this.iconElement.src = "";
        this.alertRootElement.style.backgroundColor = "transparent";
        this.alertRootElement.style.border = "none";
        this.alertRootElement.style.color = "transparent";
        this.alertRootElement.style.visibility = "hidden";
        this.expanded = false;
        this.updateDetailExpandedState();
    }

    private updateRemainingCount(): void {
        const remaining = this.messages ? this.messages.length - 1 : 0;
        if (remaining > 0) {
            this.remainingElement.textContent = `${remaining} more`;
            this.remainingElement.style.display = "block";
        } else {
            this.remainingElement.textContent = "";
            this.remainingElement.style.display = "none";
        }
    }

    private showCurrentMessage(): void {
        if (!this.messages || this.messages.length === 0) {
            this.clearVisual();
            return;
        }

        const msg = this.messages[this.currentMessageIndex];

        this.messageTextElement.textContent = msg.message;
        this.detailElement.textContent = msg.detail || "";

        if (msg.detail) {
            this.toggleElement.style.display = "inline";
        } else {
            this.toggleElement.style.display = "none";
        }

        this.expanded = false;
        this.updateDetailExpandedState();
        this.applySeverity(msg.severity);
        this.updateRemainingCount();
    }

    private showNextMessage(): void {
        if (!this.messages || this.messages.length === 0) {
            this.clearVisual();
            return;
        }

        // Remove current message
        this.messages.splice(this.currentMessageIndex, 1);

        if (this.messages.length === 0) {
            this.currentMessageIndex = 0;
            this.clearVisual();
            return;
        }

        if (this.currentMessageIndex >= this.messages.length) {
            this.currentMessageIndex = 0;
        }

        this.showCurrentMessage();
    }

    public update(options: VisualUpdateOptions): void {
        const dataView: DataView | undefined = options.dataViews && options.dataViews[0];

        if (dataView) {
            this.settings = this.settingsService.populate(dataView);
        }

        this.applyTextSettings();
        this.messages = [];
        this.currentMessageIndex = 0;
        this.expanded = false;
        this.updateDetailExpandedState();

        const table = dataView?.table;
        if (!table || !table.columns || !table.rows || table.rows.length === 0) {
            this.clearVisual();
            return;
        }

        const rows = table.rows;

        const getIndexByRole = (roleName: string): number => {
            for (let i = 0; i < table.columns.length; i++) {
                const roles = (table.columns[i] as any).roles;
                if (roles && roles[roleName]) return i;
            }
            return -1;
        };

        const idxScenario  = getIndexByRole("scenario");
        const idxMessage   = getIndexByRole("message");
        const idxDetail    = getIndexByRole("detail");
        const idxValue     = getIndexByRole("value");
        const idxCompareTo = getIndexByRole("compareTo");

        const rules: RuleCard[] = [
            this.settings.rule1,
            this.settings.rule2,
            this.settings.rule3,
            this.settings.rule4,
            this.settings.rule5,
            this.settings.rule6,
            this.settings.rule7,
            this.settings.rule8
        ];

        // Build stacked messages: one per rule that triggers
        for (const rule of rules) {
            if (!rule.enabled.value) continue;

            const scenarioName = (rule.scenario.value || "").toString().trim();
            if (!scenarioName || idxScenario < 0) continue;

            let matchedRow: any[] | null = null;

            for (const r of rows) {
                const sVal = r[idxScenario];
                if (sVal != null && String(sVal) === scenarioName) {
                    matchedRow = r;
                    break;
                }
            }

            if (!matchedRow) continue;

            const triggerValue   = idxValue     >= 0 ? matchedRow[idxValue]     : null;
            const compareToValue = idxCompareTo >= 0 ? matchedRow[idxCompareTo] : null;

            const severity = this.evaluateRule(rule, triggerValue, compareToValue);
            if (severity == null) continue;

            const msgText =
                idxMessage >= 0 && matchedRow[idxMessage] != null
                    ? String(matchedRow[idxMessage])
                    : "Message";

            const detailText =
                idxDetail >= 0 && matchedRow[idxDetail] != null
                    ? String(matchedRow[idxDetail])
                    : "";

            this.messages.push({
                message: msgText,
                detail: detailText,
                severity: severity
            });
        }

        if (this.messages.length === 0) {
            this.clearVisual();
            return;
        }

        this.showCurrentMessage();
    }

    public getFormattingModel(): FormattingModel {
        return this.settingsService.build();
    }
}
