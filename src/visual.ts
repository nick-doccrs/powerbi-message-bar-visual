"use strict";

import "../style/visual.less";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;
import FormattingModel = powerbi.visuals.FormattingModel;

import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ITooltipService = powerbi.extensibility.ITooltipService;

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

    // NEW: identity for cross-filter/context menu + tooltip anchoring
    selectionId?: powerbi.visuals.ISelectionId;

    // NEW: tooltip content (host renders)
    tooltipItems?: VisualTooltipDataItem[];
}

export class Visual implements IVisual {
    private rootElement: HTMLElement;

    private alertRootElement: HTMLElement;
    private headerElement: HTMLElement;
    private iconElement: HTMLImageElement;

    private messageContainerElement: HTMLElement;
    private messageTextElement: HTMLElement;
    private toggleElement: HTMLElement;

    private remainingElement: HTMLElement;
    private detailElement: HTMLElement;
    private dismissElement: HTMLImageElement;

    private expanded: boolean = false;

    private messages: QueuedMessage[] = [];
    private currentMessageIndex: number = 0;

    private settingsService: VisualSettingsService;
    private settings: VisualSettings;

    // NEW: host services needed for certification core functionality
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;

    constructor(options: VisualConstructorOptions) {
        this.rootElement = options.element;

        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.tooltipService = this.host.tooltipService;

        this.settingsService = new VisualSettingsService();
        this.settings = new VisualSettings();

        const container = document.createElement("div");
        container.className = "visual";

        const alertRoot = document.createElement("div");
        alertRoot.className = "alert-root";

        const header = document.createElement("div");
        header.className = "alert-header";

        const icon = document.createElement("img");
        icon.className = "alert-icon-img";
        icon.alt = "status icon";

        const messageContainer = document.createElement("div");
        messageContainer.className = "alert-message";

        const messageText = document.createElement("span");
        messageText.className = "alert-message-text";
        messageText.textContent = "Message (configure rules)";

        const toggle = document.createElement("span");
        toggle.className = "alert-toggle";
        toggle.textContent = "";

        messageContainer.appendChild(messageText);
        messageContainer.appendChild(toggle);

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

        // Toggle details (keeps existing behaviour)
        this.toggleElement.onclick = (e) => {
            e.stopPropagation();
            if (!this.detailElement.textContent) {
                return;
            }
            this.expanded = !this.expanded;
            this.updateDetailExpandedState();
        };

        // Dismiss / advance message (keeps existing behaviour)
        this.dismissElement.onclick = (e) => {
            e.stopPropagation();
            this.showNextMessage();
        };

        // NEW: outbound filtering (click on bar = select)
        this.alertRootElement.addEventListener("click", async (e) => {
            // Don't hijack clicks on toggle/dismiss (they already stopPropagation)
            const msg = this.messages?.[this.currentMessageIndex];
            if (msg?.selectionId) {
                await this.selectionManager.select(msg.selectionId, false);
            } else {
                await this.selectionManager.clear();
            }
            e.stopPropagation();
        });

        // NEW: right-click context menu
        this.alertRootElement.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const msg = this.messages?.[this.currentMessageIndex];
            const id =
                msg?.selectionId ??
                this.host.createSelectionIdBuilder().createSelectionId(); // visual-level context

            this.selectionManager.showContextMenu(id, { x: e.clientX, y: e.clientY });
        });

        // NEW: tooltips (hover)
        const showTooltip = (e: MouseEvent) => {
            if (!this.tooltipService?.enabled()) return;

            const msg = this.messages?.[this.currentMessageIndex];
            const items = msg?.tooltipItems;
            if (!items || items.length === 0) return;

            this.tooltipService.show({
                coordinates: [e.clientX, e.clientY],
                isTouchEvent: false,
                dataItems: items,
                identities: msg?.selectionId ? [msg.selectionId] : []
            });
        };

        const moveTooltip = (e: MouseEvent) => {
            if (!this.tooltipService?.enabled()) return;

            const msg = this.messages?.[this.currentMessageIndex];
            const identities = msg?.selectionId ? [msg.selectionId] : [];

            this.tooltipService.move({
                coordinates: [e.clientX, e.clientY],
                isTouchEvent: false,
                identities
            });
        };


        const hideTooltip = () => {
            if (!this.tooltipService?.enabled()) return;
            this.tooltipService.hide({ immediately: true, isTouchEvent: false });
        };

        this.alertRootElement.addEventListener("mouseover", showTooltip);
        this.alertRootElement.addEventListener("mousemove", moveTooltip);
        this.alertRootElement.addEventListener("mouseout", hideTooltip);

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
        // Pull from formatting settings where present, otherwise fall back to your existing defaults
        const text = (this.settings as any)?.text;

        const fontFamily = (text?.fontFamily?.value as string) || "Segoe UI";
        const msgSize = Number(text?.messageFontSize?.value);
        const detailSize = Number(text?.detailFontSize?.value);
        const toggleSize = Number(text?.toggleFontSize?.value);
        const bold = Boolean(text?.messageBold?.value);

        this.alertRootElement.style.fontFamily = fontFamily;

        this.messageContainerElement.style.fontSize = isNaN(msgSize) ? "13px" : `${msgSize}px`;
        this.detailElement.style.fontSize = isNaN(detailSize) ? "12px" : `${detailSize}px`;
        this.toggleElement.style.fontSize = isNaN(toggleSize) ? "12px" : `${toggleSize}px`;

        this.messageTextElement.style.fontWeight = bold ? "600" : "400";
    }

    private applySeverity(sev: number): void {
        const styles = [
            { fill: "#F5F5F5", border: "#D1D1D1", icon: InfoIcon }, // 0 Info
            { fill: "#F1FAF1", border: "#A2D8A2", icon: SuccessIcon }, // 1 Success
            { fill: "#FFF9F5", border: "#FBCEB6", icon: WarningIcon }, // 2 Caution
            { fill: "#FDF3F4", border: "#ECABB3", icon: ErrorIcon } // 3 Critical
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

    private evaluateCondition(rule: RuleCard, triggerValue: any, compareToValue: any): boolean | null {
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

        const hasTrigger = triggerValue !== null && triggerValue !== undefined && triggerValue !== "";
        const hasCompare = compareTarget !== null && compareTarget !== undefined && compareTarget !== "";

        if (!hasTrigger || !hasCompare) {
            return null;
        }

        const valNum = Number(triggerValue);
        const cmpNum = Number(compareTarget);
        const bothNumeric = !isNaN(valNum) && !isNaN(cmpNum);

        let result = false;

        if (bothNumeric) {
            switch (op) {
                case "eq":
                    result = valNum === cmpNum;
                    break;
                case "neq":
                    result = valNum !== cmpNum;
                    break;
                case "gt":
                    result = valNum > cmpNum;
                    break;
                case "lt":
                    result = valNum < cmpNum;
                    break;
            }
        } else {
            const vs = String(triggerValue ?? "");
            const cs = String(compareTarget ?? "");
            switch (op) {
                case "eq":
                    result = vs === cs;
                    break;
                case "neq":
                    result = vs !== cs;
                    break;
                case "gt":
                    result = vs > cs;
                    break;
                case "lt":
                    result = vs < cs;
                    break;
            }
        }

        return result;
    }

    private getSeverityForState(stateValue: string, fallback: number): number | null {
        if (stateValue === "none") {
            return null;
        }
        const n = Number(stateValue);
        if ([0, 1, 2, 3].includes(n)) {
            return n;
        }
        return fallback;
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

        // Clear any previous selection on data refresh (optional but usually helps)
        // (Does not break anything if certification clicks around)
        this.selectionManager.clear().catch(() => void 0);

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

        const idxScenario = getIndexByRole("scenario");
        const idxValue = getIndexByRole("value");
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

        const findRowByScenario = (scenarioName: string): { row: any[]; rowIndex: number } | null => {
            if (!scenarioName || idxScenario < 0) return null;
            const key = scenarioName.trim().toLowerCase();
            for (let r = 0; r < rows.length; r++) {
                const sVal = rows[r][idxScenario];
                if (sVal != null && String(sVal).trim().toLowerCase() === key) {
                    return { row: rows[r], rowIndex: r };
                }
            }
            return null;
        };

        for (const rule of rules) {
            if (!rule.enabled.value) continue;

            const scenarioName = (rule.scenario.value || "").toString().trim();
            if (!scenarioName || idxScenario < 0) continue;

            const found = findRowByScenario(scenarioName);
            if (!found) continue;

            const evalRow = found.row;
            const rowIndex = found.rowIndex;

            const triggerValue = idxValue >= 0 ? evalRow[idxValue] : null;
            const compareToValue = idxCompareTo >= 0 ? evalRow[idxCompareTo] : null;

            const cond = this.evaluateCondition(rule, triggerValue, compareToValue);
            if (cond === null) continue;

            const isTrue = cond === true;

            const stateValue = isTrue
                ? (rule.trueState.value as string)
                : (rule.falseState.value as string);

            const severity = this.getSeverityForState(stateValue, isTrue ? 1 : 0);
            if (severity === null) continue;

            const rawMsg = isTrue ? (rule.messageTrue.value || "") : (rule.messageFalse.value || "");
            const rawDetail = isTrue ? (rule.detailTrue.value || "") : (rule.detailFalse.value || "");

            const msgText = rawMsg.toString().trim();
            const detailText = rawDetail.toString().trim();

            if (!msgText) continue;

            // NEW: selection identity for the scenario row (enables filter-out + context menu + tooltip identities)
            let selectionId: powerbi.visuals.ISelectionId | undefined;
            try {
                // This works when table.identity exists (most table mappings provide it)
                if ((table as any).identity && (table as any).identity[rowIndex]) {
                    selectionId = this.host
                        .createSelectionIdBuilder()
                        .withTable(table as any, rowIndex)
                        .createSelectionId();
                }
            } catch {
                selectionId = undefined;
            }

            // NEW: tooltip payload
            const tooltipItems: VisualTooltipDataItem[] = [
                { displayName: "Scenario", value: scenarioName },
                { displayName: "Value", value: triggerValue == null ? "" : String(triggerValue) },
                { displayName: "Compare to", value: compareToValue == null ? "" : String(compareToValue) },
                { displayName: "Rule result", value: isTrue ? "TRUE" : "FALSE" },
                { displayName: "Message", value: msgText }
            ];

            if (detailText) {
                tooltipItems.push({ displayName: "Detail", value: detailText });
            }

            this.messages.push({
                message: msgText,
                detail: detailText,
                severity: severity,
                selectionId,
                tooltipItems
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
