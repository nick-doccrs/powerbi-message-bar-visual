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
  messageTrue: formattingSettings.TextInput;
  detailTrue: formattingSettings.TextInput;
  messageFalse: formattingSettings.TextInput;
  detailFalse: formattingSettings.TextInput;

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
      placeholder: "Scenario key (e.g. Fulfilment Rate)"
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
      value: "none"
    });

    this.messageTrue = new formattingSettings.TextInput({
      name: "messageTrue",
      displayName: "Message (TRUE)",
      value: "",
      placeholder: "Shown when condition is TRUE"
    });

    this.detailTrue = new formattingSettings.TextInput({
      name: "detailTrue",
      displayName: "Detail (TRUE)",
      value: "",
      placeholder: "Extra info when TRUE (optional)"
    });

    this.messageFalse = new formattingSettings.TextInput({
      name: "messageFalse",
      displayName: "Message (FALSE)",
      value: "",
      placeholder: "Shown when condition is FALSE"
    });

    this.detailFalse = new formattingSettings.TextInput({
      name: "detailFalse",
      displayName: "Detail (FALSE)",
      value: "",
      placeholder: "Extra info when FALSE (optional)"
    });

    this.slices = [
      this.enabled,
      this.scenario,
      this.operator,
      this.compareSource,
      this.fixedValue,
      this.trueState,
      this.falseState,
      this.messageTrue,
      this.detailTrue,
      this.messageFalse,
      this.detailFalse
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
