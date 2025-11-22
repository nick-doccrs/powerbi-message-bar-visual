import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
/**
 * Trigger card (objects.trigger)
 */
export declare class TriggerSettingsCard extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    useCompareField: formattingSettings.ToggleSwitch;
    hardcodedCompareValue: formattingSettings.TextInput;
    private sevItems;
    severityOnMatch: formattingSettings.ItemDropdown;
    severityOnNoMatch: formattingSettings.ItemDropdown;
    slices: (formattingSettings.ItemDropdown | formattingSettings.ToggleSwitch | formattingSettings.TextInput)[];
}
/**
 * Text card (objects.text)
 */
export declare class TextSettingsCard extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    private fontItems;
    fontFamily: formattingSettings.ItemDropdown;
    messageFontSize: formattingSettings.NumUpDown;
    detailFontSize: formattingSettings.NumUpDown;
    toggleFontSize: formattingSettings.NumUpDown;
    messageBold: formattingSettings.ToggleSwitch;
    slices: (formattingSettings.ItemDropdown | formattingSettings.NumUpDown | formattingSettings.ToggleSwitch)[];
}
/**
 * Root formatting model
 */
export declare class VisualFormattingSettingsModel extends formattingSettings.Model {
    trigger: TriggerSettingsCard;
    text: TextSettingsCard;
    cards: (TextSettingsCard | TriggerSettingsCard)[];
}
