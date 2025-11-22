import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
/**
 * Trigger card (matches objects.trigger in capabilities.json)
 */
export declare class TriggerSettingsCard extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    useCompareField: formattingSettings.ToggleSwitch;
    hardcodedCompareValue: formattingSettings.TextInput;
    private sevItems;
    severityOnMatch: formattingSettings.ItemDropdown;
    severityOnNoMatch: formattingSettings.ItemDropdown;
    slices: (formattingSettings.TextInput | formattingSettings.ToggleSwitch | formattingSettings.ItemDropdown)[];
}
/**
 * Text card (matches objects.text in capabilities.json)
 */
export declare class TextSettingsCard extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    fontFamily: formattingSettings.TextInput;
    messageFontSize: formattingSettings.NumUpDown;
    detailFontSize: formattingSettings.NumUpDown;
    toggleFontSize: formattingSettings.NumUpDown;
    messageBold: formattingSettings.ToggleSwitch;
    slices: (formattingSettings.TextInput | formattingSettings.NumUpDown | formattingSettings.ToggleSwitch)[];
}
/**
 * Root formatting model (controls what appears in the pane)
 */
export declare class VisualFormattingSettingsModel extends formattingSettings.Model {
    trigger: TriggerSettingsCard;
    text: TextSettingsCard;
    cards: (TextSettingsCard | TriggerSettingsCard)[];
}
