import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
export declare class RulesCard extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    enabled: formattingSettings.ToggleSwitch;
    operator: formattingSettings.AutoDropdown;
    compareSource: formattingSettings.AutoDropdown;
    fixedValue: formattingSettings.NumUpDown;
    trueState: formattingSettings.AutoDropdown;
    falseState: formattingSettings.AutoDropdown;
    slices: (formattingSettings.ToggleSwitch | formattingSettings.AutoDropdown | formattingSettings.NumUpDown)[];
}
export declare class VisualSettings extends formattingSettings.Model {
    rules: RulesCard;
    cards: RulesCard[];
}
export declare class VisualSettingsService {
    private svc;
    settings: VisualSettings;
    populate(dataView: powerbi.DataView): VisualSettings;
    build(): powerbi.visuals.FormattingModel;
}
