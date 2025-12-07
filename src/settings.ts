import powerbi from "powerbi-visuals-api";
import {
  FormattingSettingsService,
  formattingSettings
} from "powerbi-visuals-utils-formattingmodel";

export class RuleCard extends formattingSettings.SimpleCard {
  enabled: formattingSettings.ToggleSwitch;
  scenario: formattingSettings.TextInput;
  operator: formattingSettings.AutoDropdown;
  compareSource: formattingSettings.AutoDropdown;
  fixedValue: formattingSettings.NumUpDown;
  trueState: formattingSettings.AutoDropdown;
  falseState: formattingSettings.AutoDropdown;

  constructor(cardName: string, cardDisplayName: string) {
    super();

    this.name = cardName;
    this.displayName = cardDisplayName;

    this.enabled = new formattingSettings.ToggleSwitch({
      name: "enabled",
      displayName: "Enable rule",
      value: true
    });

    this.scenario = new formattingSettings.TextInput({
      name: "scenario",
      displayName: "Scenario",
      value: "",
      placeholder: "Enter scenario name"     // ← REQUIRED
    });

    this.operator = new formattingSettings.AutoDropdown({
      name: "operator",
      displayName: "Operator",
      value: "eq"
    });

    this.compareSource = new formattingSettings.AutoDropdown({
      name: "compareSource",
      displayName: "Compare source",
      value: "field"
    });

    this.fixedValue = new formattingSettings.NumUpDown({
      name: "fixedValue",
      displayName: "Fixed value",
      value: 0
    });

    this.trueState = new formattingSettings.AutoDropdown({
      name: "trueState",
      displayName: "Severity when TRUE",
      value: "1"
    });

    this.falseState = new formattingSettings.AutoDropdown({
      name: "falseState",
      displayName: "Severity when FALSE",
      value: "2"
    });

    this.slices = [
      this.enabled,
      this.scenario,
      this.operator,
      this.compareSource,
      this.fixedValue,
      this.trueState,
      this.falseState
    ];
  }
}


export class VisualSettings extends formattingSettings.Model {
  rule1 = new RuleCard("rule1", "Rule 1");
  rule2 = new RuleCard("rule2", "Rule 2");
  rule3 = new RuleCard("rule3", "Rule 3");
  rule4 = new RuleCard("rule4", "Rule 4");
  rule5 = new RuleCard("rule5", "Rule 5");
  rule6 = new RuleCard("rule6", "Rule 6");
  rule7 = new RuleCard("rule7", "Rule 7");
  rule8 = new RuleCard("rule8", "Rule 8");

  cards = [
    this.rule1,
    this.rule2,
    this.rule3,
    this.rule4,
    this.rule5,
    this.rule6,
    this.rule7,
    this.rule8
  ];
}

export class VisualSettingsService {
  private svc = new FormattingSettingsService();
  public settings = new VisualSettings();

  populate(dataView: powerbi.DataView): VisualSettings {
    this.settings = this.svc.populateFormattingSettingsModel(
      VisualSettings,
      dataView
    );
    return this.settings;
  }

  build() {
    return this.svc.buildFormattingModel(this.settings);
  }
}
