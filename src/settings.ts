import powerbi from "powerbi-visuals-api";
import {
  FormattingSettingsService,
  formattingSettings
} from "powerbi-visuals-utils-formattingmodel";

export class RulesCard extends formattingSettings.SimpleCard {
  name = "rules";
  displayName = "Rules";

  enabled = new formattingSettings.ToggleSwitch({
    name: "enabled",
    displayName: "Enable rules",
    value: true
  });

  operator = new formattingSettings.AutoDropdown({
    name: "operator",
    displayName: "Operator",
    value: "eq" // matches capabilities enumeration values
  });

  compareSource = new formattingSettings.AutoDropdown({
    name: "compareSource",
    displayName: "Compare source",
    value: "field" // "field" | "fixed"
  });

  fixedValue = new formattingSettings.NumUpDown({
    name: "fixedValue",
    displayName: "Fixed value",
    value: 0
  });

  trueState = new formattingSettings.AutoDropdown({
    name: "trueState",
    displayName: "Severity when TRUE",
    value: "1" // Success by default
  });

  falseState = new formattingSettings.AutoDropdown({
    name: "falseState",
    displayName: "Severity when FALSE",
    value: "2" // Caution by default
  });

  slices = [
    this.enabled,
    this.operator,
    this.compareSource,
    this.fixedValue,
    this.trueState,
    this.falseState
  ];
}

export class VisualSettings extends formattingSettings.Model {
  rules = new RulesCard();

  cards = [this.rules];
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
