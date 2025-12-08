import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
export declare class RuleCard extends formattingSettings.SimpleCard {
    enabled: formattingSettings.ToggleSwitch;
    scenario: formattingSettings.TextInput;
    operator: formattingSettings.AutoDropdown;
    compareSource: formattingSettings.AutoDropdown;
    fixedValue: formattingSettings.NumUpDown;
    trueState: formattingSettings.AutoDropdown;
    falseState: formattingSettings.AutoDropdown;
    messageTrue: formattingSettings.TextInput;
    detailTrue: formattingSettings.TextInput;
    messageFalse: formattingSettings.TextInput;
    detailFalse: formattingSettings.TextInput;
    constructor(cardName: string, cardDisplayName: string);
}
export declare class VisualSettings extends formattingSettings.Model {
    rule1: RuleCard;
    rule2: RuleCard;
    rule3: RuleCard;
    rule4: RuleCard;
    rule5: RuleCard;
    rule6: RuleCard;
    rule7: RuleCard;
    rule8: RuleCard;
    cards: RuleCard[];
}
export declare class VisualSettingsService {
    private svc;
    settings: VisualSettings;
    populate(dataView: powerbi.DataView): VisualSettings;
    build(): powerbi.visuals.FormattingModel;
}
