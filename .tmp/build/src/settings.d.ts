import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
export declare class RulesCard extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    enabled: formattingSettings.ToggleSwitch;
    operator: formattingSettings.AutoDropdown;
    trueState: formattingSettings.AutoDropdown;
    falseState: formattingSettings.AutoDropdown;
    slices: (formattingSettings.ToggleSwitch | formattingSettings.AutoDropdown)[];
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
