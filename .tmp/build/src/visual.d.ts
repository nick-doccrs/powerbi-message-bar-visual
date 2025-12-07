import "../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import FormattingModel = powerbi.visuals.FormattingModel;
export declare class Visual implements IVisual {
    private rootElement;
    private alertRootElement;
    private headerElement;
    private iconElement;
    private messageElement;
    private toggleElement;
    private detailElement;
    private expanded;
    private settingsService;
    private settings;
    constructor(options: VisualConstructorOptions);
    private updateDetailExpandedState;
    private applyTextSettings;
    private applySeverity;
    private evaluateRule;
    update(options: VisualUpdateOptions): void;
    getFormattingModel(): FormattingModel;
}
