"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

/**
 * Trigger card (objects.trigger)
 */
export class TriggerSettingsCard extends formattingSettings.SimpleCard {
    name: string = "trigger";
    displayName: string = "Trigger";

    useCompareField = new formattingSettings.ToggleSwitch({
        name: "useCompareField",
        displayName: "Use Compare Field",
        value: false
    });

    hardcodedCompareValue = new formattingSettings.TextInput({
        name: "hardcodedCompareValue",
        displayName: "Hardcoded Compare Value",
        value: "",
        placeholder: ""
    });

    private sevItems: powerbi.IEnumMember[] = [
        { value: "0", displayName: "Info" },
        { value: "1", displayName: "Success" },
        { value: "2", displayName: "Caution" },
        { value: "3", displayName: "Critical" }
    ];

    severityOnMatch = new formattingSettings.ItemDropdown({
        name: "severityOnMatch",
        displayName: "Severity on Match",
        items: this.sevItems,
        value: this.sevItems[0]
    });

    severityOnNoMatch = new formattingSettings.ItemDropdown({
        name: "severityOnNoMatch",
        displayName: "Severity on No Match",
        items: this.sevItems,
        value: this.sevItems[0]
    });

    slices = [
        this.useCompareField,
        this.hardcodedCompareValue,
        this.severityOnMatch,
        this.severityOnNoMatch
    ];
}

/**
 * Text card (objects.text)
 */
export class TextSettingsCard extends formattingSettings.SimpleCard {
    name: string = "text";
    displayName: string = "Text";

    private fontItems: powerbi.IEnumMember[] = [
        { value: "Arial",               displayName: "Arial" },
        { value: "Arial Black",         displayName: "Arial Black" },
        { value: "Arial Unicode MS",    displayName: "Arial Unicode MS" },
        { value: "Calibri",             displayName: "Calibri" },
        { value: "Cambria",             displayName: "Cambria" },
        { value: "Cambria Math",        displayName: "Cambria Math" },
        { value: "Candara",             displayName: "Candara" },
        { value: "Comic Sans MS",       displayName: "Comic Sans MS" },
        { value: "Consolas",            displayName: "Consolas" },
        { value: "Constantia",          displayName: "Constantia" },
        { value: "Corbel",              displayName: "Corbel" },
        { value: "Courier New",         displayName: "Courier New" },
        { value: "DIN",                 displayName: "DIN" },
        { value: "Georgia",             displayName: "Georgia" },
        { value: "Lucida Sans Unicode", displayName: "Lucida Sans Unicode" },

        // Label shown, but value maps to Segoe UI (so it still works)
        { value: "Segoe UI",            displayName: "Segoe (Bold)" },
        { value: "Segoe UI",            displayName: "Segoe UI" },
        { value: "Segoe UI Light",      displayName: "Segoe UI Light" },

        { value: "Symbol",              displayName: "Symbol" },
        { value: "Tahoma",              displayName: "Tahoma" },
        { value: "Times New Roman",     displayName: "Times New Roman" },
        { value: "Trebuchet MS",        displayName: "Trebuchet MS" },
        { value: "Verdana",             displayName: "Verdana" }
    ];

    fontFamily = new formattingSettings.ItemDropdown({
        name: "fontFamily",
        displayName: "Font family",
        items: this.fontItems,
        value: this.fontItems[15] // default to Segoe UI (first Segoe entry)
    });

    messageFontSize = new formattingSettings.NumUpDown({
        name: "messageFontSize",
        displayName: "Message font size",
        value: 13
    });

    detailFontSize = new formattingSettings.NumUpDown({
        name: "detailFontSize",
        displayName: "Detail font size",
        value: 12
    });

    toggleFontSize = new formattingSettings.NumUpDown({
        name: "toggleFontSize",
        displayName: "Details font size",
        value: 12
    });

    messageBold = new formattingSettings.ToggleSwitch({
        name: "messageBold",
        displayName: "Bold message",
        value: true
    });

    slices = [
        this.fontFamily,
        this.messageFontSize,
        this.detailFontSize,
        this.toggleFontSize,
        this.messageBold
    ];
}

/**
 * Root formatting model
 */
export class VisualFormattingSettingsModel extends formattingSettings.Model {
    trigger = new TriggerSettingsCard();
    text = new TextSettingsCard();

    cards = [
        this.trigger,
        this.text
    ];
}
