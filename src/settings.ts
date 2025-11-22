"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

/**
 * Trigger card (matches objects.trigger in capabilities.json)
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
        placeholder: "" // required by your formattingmodel version
    });

    // ItemDropdown items must be IEnumMember[]
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
        value: this.sevItems[0] // default Info
    });

    severityOnNoMatch = new formattingSettings.ItemDropdown({
        name: "severityOnNoMatch",
        displayName: "Severity on No Match",
        items: this.sevItems,
        value: this.sevItems[0] // default Info
    });

    slices = [
        this.useCompareField,
        this.hardcodedCompareValue,
        this.severityOnMatch,
        this.severityOnNoMatch
    ];
}

/**
 * Text card (matches objects.text in capabilities.json)
 */
export class TextSettingsCard extends formattingSettings.SimpleCard {
    name: string = "text";
    displayName: string = "Text";

    fontFamily = new formattingSettings.TextInput({
        name: "fontFamily",
        displayName: "Font family",
        value: "Segoe UI",
        placeholder: ""
    });

    // IMPORTANT: Your library version does not support numeric min/max options,
    // so we omit options to avoid type errors.
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
 * Root formatting model (controls what appears in the pane)
 */
export class VisualFormattingSettingsModel extends formattingSettings.Model {
    trigger = new TriggerSettingsCard();
    text = new TextSettingsCard();

    cards = [
        this.trigger,
        this.text
    ];
}
